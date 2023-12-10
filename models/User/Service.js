const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ServiceSchema = new Schema({
  photo: { type: String, required: true},
  name: { type: String, required: true},
  IsBlocked:{type: Boolean, default:false}
});

const Service =new mongoose.model('Service', ServiceSchema);

module.exports=Service