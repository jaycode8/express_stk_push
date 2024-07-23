const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3500
const app = express();
const routes = require("./routes/routes");
require("./db/dbconfig");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);

app.listen(PORT, () => console.info(`app running on port ${PORT}`));