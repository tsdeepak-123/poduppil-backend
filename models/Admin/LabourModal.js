const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const LabourSchema = new Schema({
  name: { type: String },
  phone: { type: Number },
  age: { type: Number },
  adhar: { type: Number },
  salary: { type: Number },
  date: { type: Date },
  lastsalaryDate: { type: Date },
  IdProof: [{ type: String }],
  photo: { type: String },
  advance:{ type: Number,default:0},
  address:[{
    street: { type: String },
    post: { type: String },
    town: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: Number },
}]
});

const Labour =new mongoose.model('Labour', LabourSchema);

module.exports=Labour

