const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.info("successfully connected to the database");
    };
});