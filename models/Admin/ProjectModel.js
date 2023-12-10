const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ProjectSchema = new Schema({
  name: { type: String, required: true},
  date: { type: Date, required: true},
  status: { type: String, required: true},
  pending: { type: String, required: true},
  upnext: { type: String, required: true},
  supervisorname: { type: String, required: true},
  projectnumber: { type: String, required: true},
  notes: { type: String, required: true},
  photos: { type: [String]},
  isCompleted:{type:Boolean,default:false},
  projectPayment: [
    {
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        default:0
      },
      payment: {
        type: String,
      },
    },
  ],
});

const Project =new mongoose.model('Project', ProjectSchema);

module.exports=Project

