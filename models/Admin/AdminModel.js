const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const AdminSchema = new Schema({
  password: { type: String, required: true},
  email: { type: String, required: true},
});

const Admin =new mongoose.model('Admin', AdminSchema);

module.exports=Admin

