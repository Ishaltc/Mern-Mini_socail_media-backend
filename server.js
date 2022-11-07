const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { readdirSync } = require("fs");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);


//routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));


mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connection successfully"))
  .catch((err) => console.log("error connecting to database", err));

let PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});

