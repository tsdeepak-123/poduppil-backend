const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const ContractSchema = new Schema({
 project: { 
    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', 
        required: true,
      
 },
 Contractwork: { type: String, required: true},
 projectname: { type: String, required: true},
 totallabour: { type: Number, required: true},
 totalhelper: { type: Number, required: true},
 Contractorname: { type: String, required: true},
 phone: { type: Number, required: true},
  date: { type: Date, required: true},
  Details: { type: String, required: true},
  status: { type: String, required: true},
  Paymentdetails: { type: String, required: true},
  Amount: { type:Number, required: true},
  isCompleted:{type:Boolean,default:false},
  workerCount: [
       {
         date: {
           type: Date,
           required: true,
         },
         mainLabour: {
           type: Number,
           default:0
         },
         helpers: {
           type: Number,
           default:0
         },
       },
     ],

});

const contract = new mongoose.model("contract", ContractSchema);

module.exports = contract;
