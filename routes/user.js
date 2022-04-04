const CryptoJs = require("crypto-js");
const router = require('express').Router();
const User = require('../models/User');
const { verifyToken, isAuthorized, isAdmin } = require('./verify-token');
const Helpers = require('../utils/helpers');

router.get('/', isAdmin, (req, res) => {
  const searchType = req.query?.searchBy || 'email';
  const keyword = req.query?.keyword || '';
  const limit = req.query?.limit || 20;
  const page = req.query?.page || 1;
  const sort = req.query?.sort ? 1 : -1;

  const query = User.find({ [searchType]: keyword })
    .sort({ [searchType]: sort })
    .skip()
    .limit(limit);

  query.exec((err, users) => {
    if (err) {
      return res.json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit'
      });
    }

    res.json({
      status: true,
      message: 'User records successfully retrieved.',
      data: {
        count: users.length,
        page: page,
        limitPerPage: limit,
        users: users.map(u => {
          return { ...Helpers.withoutProperty(u?.toObject(), 'password') }
        })
      }
    });

  });
});

// Fetch user && Update user
router.route('/:id')
  .get(isAuthorized, (req, res) => {
    User.findById(req.params?.id, (err, user) => {
      if (err) {
        return res.json({
          status: false,
          message: 'An unexpected error occured. Please try again in a bitUser not found'
        });
      }

      res.json({
        status: true,
        message: 'User record successfully retrieved.',
        data: { ...Helpers.withoutProperty(user.toObject(), 'password') }
      });

    });

  }).put(isAuthorized, (req, res) => {
    // An update.
    // First encrypt password if available
    if (req.body?.password) {
      req.body.password = CryptoJs.AES.encrypt(req.body.password, process.env.PASSWORD_SECRET_KEY).toString();
    }

    User.findByIdAndUpdate(req.params?.id, req.body, { runValidators: true, new: true }, (err, updatedUser) => {
      if (err) {
        return res.status(500).json({
          status: false, message: 'Update failed. Please try again later.',
          errorDescription: err.message
        });
      }

      res.json({
        status: true, message: 'User record updated successfully',
        data: { ...Helpers.withoutProperty(updatedUser.toObject(), 'password') }
      });
    })
  });

// Delete User
router.delete('/:id', isAdmin, (req, res) => {
  User.findByIdAndDelete(req.params?.id, (err, _) => {
    if (err) {
      return res.status(500).json({
        status: false, message: 'Deletion of user record failed. Please try again later.',
        errorDescription: err.message
      });
    }

    res.json({
      status: true, message: 'User record delete successful'
    });
  });
});

module.exports = router;