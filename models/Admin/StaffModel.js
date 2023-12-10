const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const StaffSchema = new Schema({

name: { type: String },
  phone: { type: Number },
  age: { type: Number },
  adhar: { type: Number },
  salary: { type: Number },
  date: { type: Date },
  lastsalaryDate: { type: Date },
  IdProof: [{ type: String }],
  advance:{ type: Number,required: true,default:0},
  photo: { type: String },
  address:[{
    street: { type: String },
    post: { type: String },
    town: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: Number },
}]
});

const Staff =new mongoose.model('Staff', StaffSchema);

module.exports=Staff