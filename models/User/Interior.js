const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const InteriorSchema = new Schema({
  photo: { type: String, required: true},
  name: { type: String, required: true},
  IsBlocked:{type:Boolean,default:false}
});

const Interior =new mongoose.model('Interior', InteriorSchema);

module.exports=Interior