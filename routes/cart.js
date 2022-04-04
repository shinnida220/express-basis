const router = require('express').Router();
const Cart = require('../models/Cart');
const { verifyToken, isAuthorized } = require('./verify-token');

// Get a cart
router.get('/:id', isAuthorized, (req, res) => {
  Cart.findOne({ userId: req.params?.id }, (err, cart) => {
    if (err) {
      return res.json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bitUser not found'
      });
    }

    res.json({
      status: true,
      message: 'Cart retrieved successfully.',
      data: cart
    });

  });
})

// Create / Update a cart
router.post('/', verifyToken, (req, res) => {
  Cart.findOne({ userId: req.user.id }, (err, cart) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit',
        error: err
      });
    }

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        products: req.body.products
      });
      cart.save((e, savedCart) => {
        if (e) {
          return res.status(500).json({
            status: false,
            message: 'An unexpected error occured. Please try again in a bit',
            error: e
          });
        }

        res.status(201).json({
          status: true,
          message: 'Items successfully added to cart',
          data: savedCart
        });
      })
    } else {
      cart.products = req.body.products;
      cart.save((er, updatedCart) => {
        if (er) {
          return res.status(500).json({
            status: false,
            message: 'An unexpected error occured. Please try again in a bit',
            error: e
          });
        }

        res.status(201).json({
          status: true,
          message: 'Cart items successfully updated',
          data: updatedCart
        });
      });
    }
  });
});

// Delete cart
router.delete('/:id', isAuthorized, (req, res) => {
  Cart.findById(req.params?.id, (err, cart) => {
    if (err) {
      return res.status(500).json({
        status: false, message: 'Deletion of cart failed. Please try again later.',
        errorDescription: err.message
      });
    }

    // We just need to empty the cart products.
    if (cart) {
      cart.products = [];
      cart.save((er, updatedCart) => {
        if (er) {
          return res.status(500).json({ status: false, message: 'Deletion of cart items has failed. Please try again later.', errorDescription: err.message });
        }

        res.json({ status: true, message: 'Cart items deleted successfully', data: updatedCart });
      });
    } else {
      res.json({ status: false, message: 'Cart not found' });
    }
  });
});

module.exports = router;