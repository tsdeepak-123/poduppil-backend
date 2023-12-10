const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OwnerSchema = new Schema({
  photo: { type: String, required: true},
  name: { type: String, required: true},
  IsBlocked:{type: Boolean, default:false}
});

const Owner =new mongoose.model('Owner', OwnerSchema);

module.exports=Owner