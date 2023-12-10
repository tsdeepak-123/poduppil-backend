const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ProjectSchema = new Schema({
  photo: { type: String, required: true},
  name: { type: String, required: true},
  IsBlocked:{type:Boolean,default:false}
});

const Project =new mongoose.model('Userroject', ProjectSchema);

module.exports=Project