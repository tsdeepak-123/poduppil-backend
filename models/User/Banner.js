const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const BannerSchema = new Schema({
  photo: { type: String, required: true},
  name: { type: String, required: true},
  IsBlocked:{type: Boolean, default:false}
});

const Banner =new mongoose.model('Banner', BannerSchema);

module.exports=Banner