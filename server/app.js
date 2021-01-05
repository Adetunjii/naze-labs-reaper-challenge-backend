const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const consoleRouter = require("./router");

require("./scheduler");

//create an app instance
const app = express();

//middleware
app.use(cors({ origin: true }));

//routes
app.use("/", consoleRouter);

//start a server instance
const PORT = process.env.PORT;
app.listen(PORT, () => console.log("Server is running on port ", PORT));
