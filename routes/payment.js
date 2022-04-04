const router = require('express').Router();
const { verifyToken } = require('./verify-token');

const Flutterwave = require('flutterwave-node-v3');


const flw = new Flutterwave(process.env.FW_PUBLIC_KEY, process.env.FW_SEC_KEY);

router.post('/pay', verifyToken, (req, res) => {
  const payload = {
    "card_number": "5531886652142950",
    "cvv": "564",
    "expiry_month": "09",
    "expiry_year": "32",
    "currency": "NGN",
    "amount": "3000",
    "redirect_url": "https://www.google.com",
    "fullname": "Olufemi Obafunmiso",
    "email": "olufemi@flw.com",
    "phone_number": "0902620185",
    "enckey": process.env.FW_ENC_KEY,
    "tx_ref": "MC-32444ee--4eerye4euee3rerds4423e43ef" // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
  }

  flw.Charge.card(payload)
    .then(resp => {
      console.log(resp);
      res.json({
        status: true,
        message: 'Payment successful',
        data: resp
      });

    }).catch(err => {
      console.log(err);
      return res.json({
        status: false,
        message: 'An unexpected error occured. Please try again in a bit',
        error: err
      });
    });
})

module.exports = router;