const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');

// For handling specific routes
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const paymentRouter = require('./routes/payment');


app.use(express.urlencoded({ extended: false }))
  .use(express.json())
  .use('/api/auth', authRouter)
  .use('/api/users', userRouter)
  .use('/api/products', productRouter)
  .use('/api/cart', cartRouter)
  .use('/api/orders', orderRouter)
  .use('/api/payments', paymentRouter)
  .use((_, res) => {
    res.status(404).json({
      status: false,
      message: "Route not available!"
    });
  })
  .use((err, req, res, next) => {
    res.status(res?.statusCode || 500).json({
      status: false,
      message: 'Something really bad just happened!',
      error: err
    })
  });


let listener;
// Connect to the moongoose server
mongoose.connect(process.env.DB_URI, { autoIndex: true }).then(_ => {
  console.log(`🚀 Connection to MongoDB successful`);
  // Listen for requests
  listener = app.listen(process.env.PORT || 3000, () => {
    console.log('App is listening on port ' + listener?.address()?.port)
  });
}).catch(err => {
  // No need to start listening if we cant connect to db..
  console.log('Error while trying to connect to the database', err);
});
