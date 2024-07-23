const axios = require("axios");

const generateToken = async (req, res, next) => {
    const secrete = process.env.MPESA_CONSUMER_SECRET;
    const consumerkey = process.env.MPESA_CONSUMER_KEY;
    const auth = new Buffer.from(`${consumerkey}:${secrete}`).toString("base64");
    await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: {
            authorization: `Basic ${auth}`
        }
    }).then((response) => {
        // console.log(response.data.access_token);
        token = response.data.access_token;
        next();
    }).catch((err) => {
        console.log(err);
    });
};

module.exports = generateToken;