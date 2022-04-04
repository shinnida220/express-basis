const CryptoJs = require("crypto-js");
const router = require('express').Router();
const User = require('../models/User');
const Helpers = require('../utils/helpers');
const JWT = require('jsonwebtoken');

// Register
router.post('/register', (req, res) => {
  const user = new User({
    ...req.body,
    isAdmin: false,
    password: CryptoJs.AES.encrypt(req.body.password, process.env.PASSWORD_SECRET_KEY).toString()
  });

  user.save((err, savedUser) => {
    if (err) {
      return res.status(500)
        .json({ status: false, message: 'Registration failed', error: err });
    }

    res.status(201)
      .json({
        status: true,
        message: 'Registration was successful',
        data: savedUser
      });
  })
});

// LOGIN
router.post('/login', (req, res) => {
  User.findOne({
    username: req.body.username,
  }, (err, user) => {
    if (err) {
      return res.status(500)
        .json({ status: false, message: 'Network error. Please check your network and try again later', error: err.message });
    }

    if (user) {
      const decryptedPassword = CryptoJs.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY).toString(CryptoJs.enc.Utf8);
      if (decryptedPassword != req.body.password) {
        return res.json({ status: false, message: 'Invalid login credentials', data: null });
      } else {
        user = Helpers.withoutProperty(user.toObject(), 'password');
        const accessToken = JWT.sign({
          id: user._id, isAdmin: user.isAdmin
        }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.json({ status: true, message: 'Login successful', data: { ...user, accessToken } });
      }
    } else {
      return res.json({ status: false, message: 'Login failed. Invalid credentials', data: null });
    }
  })
})

module.exports = router;