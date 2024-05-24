require("dotenv").config();

const express = require("express");

const app = express();

const mongoose = require("mongoose");

const cloudinary = require("cloudinary").v2;

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const banane = "test";

app.use(express.json());

// import de mes routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

// utilisation de mes routes
app.use("/user", userRoutes);
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "all routes",
  });
});

app.listen(process.env.PORT, () => {
  console.log("server started on port : " + process.env.PORT);
});
