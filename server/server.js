const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

//import
const authRoute = require("./routes/auth");

//db connect
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("database is connected"))
  .catch((err) => console.log("database connection error", err));

//app middleware
app.use(morgan("dev"));

app.use(bodyParser.json());

if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: `http://localhost:3000` }));
}

//middleware
app.use("/api", authRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`app is running on port ${port} in ${process.env.NODE_ENV}`);
});
