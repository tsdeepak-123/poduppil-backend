require("dotenv").config()
const cloudinary = require('cloudinary').v2;

 cloudinary.config({
  cloud_name: "dpqwwjitp",
  api_key: "176842292663923",
  api_secret: "ibxQg4s7t3M6jcyPxNbgKfAMm3E"
});

module.exports = cloudinary