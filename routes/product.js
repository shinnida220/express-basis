const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken, isAuthorized, isAdmin } = require('./verify-token');
const Helpers = require('../utils/helpers');

router.get('/', isAdmin, (req, res) => {
  const searchType = req.query?.searchBy || 'title';
  const keyword = req.query?.keyword || '';
  const category = req.query?.category || null;
  const limit = req.query?.limit || 20;
  const page = req.query?.page || 1;
  const sort = req.query?.sort ? 1 : -1;

  let query;
  if (category && req.query?.searchBy) {
    query = Product.find({ $or: [{ categories: category }, { [searchType]: keyword }] })
      .sort({ [searchType]: sort })
      .limit(limit);
  } else if (category && !req.query?.searchBy) {
    query = Product.find({ categories: category })
      .sort({ [searchType]: sort })
      .limit(limit);
  } else if (req.query?.searchBy) {
    query = Product.find({ [searchType]: keyword })
      .sort({ [searchType]: sort })
      .limit(limit);
  } else {
    query = Product.find()
      .sort({ [searchType]: sort })
      .skip()
      .limit(limit);
  }

  query.exec((err, products) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit'
      });
    }

    res.json({
      status: true,
      message: 'Product records successfully retrieved.',
      data: {
        count: products.length,
        page: page,
        limitPerPage: limit,
        products: products
      }
    });
  });
});

router.post('/', isAdmin, (req, res) => {
  if (req.body[0]?.title) {
    req.body = req.body?.map(p => {
      p.slug = p.title?.split(' ').join('-').toLowerCase() + '-' + Helpers.randomNumber(10000, 99999);
      return p;
    });

    Product.create(req.body, (err, products) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: 'An unexpected error occured. Please try again in a bit',
          p: req.body,
          error: err,
        });
      }

      res.status(201).json({
        status: true, message: 'Products created successfully',
        data: {
          total: products.length,
          products: products
        }
      });
    })
  } else {
    req.body.slug = req.body?.title?.split(' ').join('-').toLowerCase() + '-' + Helpers.randomNumber(10000, 99999);
    const product = new Product(req.body);
    product.save((err, product) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: 'An unexpected error occured. Please try again in a bit',
          p: req.body,
          error: err
        });
      }

      res.status(201).json({
        status: true, message: 'Product created successfully',
        data: product
      });
    });
  }

});

router.put('/:id', isAuthorized, (req, res) => {
  Product.findByIdAndUpdate(req.params?.id, req.body, { runValidators: true, new: true }, (err, updatedProduct) => {
    if (err) {
      return res.status(500).json({
        status: false, message: 'Update failed. Please try again later.',
        errorDescription: err.message
      });
    }

    res.json({
      status: true, message: 'Product record updated successfully',
      data: updatedProduct
    });
  })
});

// Delete product
router.delete('/:id', isAdmin, (req, res) => {
  Product.findByIdAndDelete(req.params?.id, (err, _) => {
    if (err) {
      return res.status(500).json({
        status: false, message: 'Deletion of product record failed. Please try again later.',
        errorDescription: err.message
      });
    }

    res.json({
      status: true, message: 'Product record delete successful'
    });
  });
});

module.exports = router;