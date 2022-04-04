const router = require('express').Router();
const Order = require('../models/Order');
const { verifyToken, isAuthorized, isAdmin } = require('./verify-token');

// Get an order.
router.get('/income', isAdmin, (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

  Order.aggregate()
    .match({ createdAt: { $gte: previousMonth } })
    .project({
      month: { $month: "$createdAt" },
      sales: "$amount"
    })
    .group({
      _id: "$month", total: { $sum: "$sales" }
    })
    .exec((err, income) => {
      if (err) {
        return res.json({
          status: false,
          message: 'An unexpected error occured. Please try again in a bit'
        });
      }

      res.json({
        status: true,
        message: 'Order stats retrieved successfully.',
        data: income
      });
    })
});

// Get an order.
router.get('/:id', isAuthorized, (req, res) => {
  Order.findById(req.params?.id, (err, order) => {
    if (err) {
      return res.json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit'
      });
    }

    res.json({
      status: true,
      message: 'Order retrieved successfully.',
      data: order
    });
  });
});

// update an order
router.put('/:id', isAuthorized, (req, res) => {
  Order.findByIdAndUpdate(req.params?.id, req.body, { new: true }, (err, updatedOrder) => {
    if (err) {
      return res.json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit'
      });
    }

    res.json({
      status: true,
      message: 'Order successfully updated.',
      data: updatedOrder
    });
  });
});

// Create Order
router.post('/', verifyToken, (req, res) => {
  const order = new Order({ ...req.body, userId: req.user.id });
  order.save((er, savedOrder) => {
    if (er) {
      return res.status(500).json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit',
        error: er
      });
    }

    res.status(201).json({
      status: true,
      message: 'Order created successfully',
      data: savedOrder
    });
  });
});

// Delete an order 
router.delete('/:id', isAuthorized, (req, res) => {
  Order.findByIdAndDelete(req.params?.id, (err, order) => {
    if (err) {
      return res.status(500).json({
        status: false, message: 'Deletion of order failed. Please try again later.',
        error: err.message
      });
    }

    // We just need to empty the order products.
    if (order) {
      res.json({ status: true, message: 'Order deleted successfully' });
    } else {
      res.json({ status: false, message: 'Order not found' });
    }
  });
});


module.exports = router;