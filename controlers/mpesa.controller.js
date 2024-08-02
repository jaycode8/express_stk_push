const axios = require("axios");
const PaymentModel = require('../models/payments.model');
const generateToken = require("../utils/tk");

const shortcode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
const date = new Date();
const timestamp = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);

const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");

const home = (req, res) => {
    const now = new Date();
    const readableTimestamp = now.toISOString();
    // console.log(readableTimestamp);
    generateToken();
    res.json({ msg: "hello there" });
};

const stk = async (req, res) => {
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;
    
    // const shortcode = process.env.MPESA_PAYBILL;
    // const passkey = process.env.MPESA_PASSKEY;

    // const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");
    
    await axios
        .post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
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

const b2c = async (req, res) => {
    await axios
        .post(
            "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
            {
                OriginatorConversationID: "feb5e3f2-fbbc-4745-844c-ee37b546f627",
                InitiatorName: "testapi",
                SecurityCredential: "32SzVdmCvjpmQfw3X2RK8UAv7xuhh304dXxFC5+3lslkk2TDJY/Lh6ESVwtqMxJzF7qA==",
                CommandID: "BusinessPayment",
                Amount: "10",
                PartyA: "600996",
                PartyB: "254728762287",
                Remarks: "here are my remarks",
                QueueTimeOutURL: "https://a593-154-79-248-82.ngrok-free.app/b2ctimeout",
                ResultURL: "https://a593-154-79-248-82.ngrok-free.app/b2cresults",
                Occassion: "Christmas",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((data) => {
            console.log(data.data);
            res.status(200).json(data.data);
        })
        .catch((err) => {
            console.log("-------------------------------error-----------------------------------");
            console.log(err);
            res.status(400).json(err.message);
        });
}

const b2cresults = async (req, res) => {
    console.log(req.body.Result.ResultParameters);
}

const b2ctimeOut = async (req, res) => {
    console.log(req.body);
}

const balanceEnquiry = async (req, res) => {
    await axios
        .post(
            "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query",
            {
                Initiator: "testapi",
                SecurityCredential: password,
                "Command ID": "AccountBalance",
                PartyA: "600979",
                IdentifierType: "4",
                Remarks: "ok",
                QueueTimeOutURL: "https://a593-154-79-248-82.ngrok-free.app/b2ctimeout",
                ResultURL: "https://a593-154-79-248-82.ngrok-free.app/b2cresults",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
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

module.exports = {home, stk, callbacks, transactions, b2c, b2cresults, b2ctimeOut, balanceEnquiry}