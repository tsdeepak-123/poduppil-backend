require("dotenv").config()
const cloudinary = require('cloudinary').v2;

 cloudinary.config({
  cloud_name: process.env.yourCloudName,
  api_key: process.env.yourApiKey,
  api_secret: process.env.yourApiSecret
});

module.exports = cloudinary