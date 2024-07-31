const axios = require("axios");
const PaymentModel = require('../models/payments.model');

const home = (req, res) => {
    const now = new Date();
    const readableTimestamp = now.toISOString();
    console.log(readableTimestamp);
    res.json({ msg: "hello there" });
};

const stk = async (req, res) => {
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;

    const date = new Date();
    const timestamp = date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    
    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;

    const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");
    
    await axios
        .post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode, //this is the paybill number for till its store number
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline", // for till its CustomerBuyGoodsOnline
                Amount: amount,
                PartyA: `254${phone}`,
                PartyB: shortcode,
                PhoneNumber: `254${phone}`,
                CallBackURL: `https://f85d-2c0f-fe38-220b-f25-5266-41b3-ea61-d31a.ngrok-free.app/callback/`,
                AccountReference: `254${phone}`,
                TransactionDesc: "Test for app jay",
            },
            {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }
        )
        .then((data) => {
            console.log(data.data);
            res.status(200).json(data.data);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err.message);
        });
}

const callbacks = async (req, res) => {
    const callbackData = req.body;
    if (!callbackData.Body.stkCallback.CallbackMetadata) {
        console.log(callbackData.Body);
        return res.json("ok");
    }
    console.log(callbackData.Body.stkCallback.CallbackMetadata);
    
    const phone = callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value;
    const amount = callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value;
    const trnx_id = callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value;

    let payment = new PaymentModel();
    payment.phone = phone;
    payment.amount = amount;
    payment.trnx_id = trnx_id;
    payment.save().then((data) => {
        console.log({ msg: "successfully saved record in db", data });
    }).catch((err) => {
        console.log(err.message);
    });
};

const transactions = async (req, res) => {
    const trn = await PaymentModel.find();
    res.json({ transactions: trn });
};

module.exports = {home, stk, callbacks, transactions}