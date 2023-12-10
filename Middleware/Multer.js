const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
   
    destination: function (req, file, cb) {
        console.log('photo came to multer')
        cb(null, path.join(__dirname, "../public/Images"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name); 
    }
});

module.exports = multer({ storage: storage });
