
const mongoose = require('mongoose');

const StaffSalarySchema = new mongoose.Schema({
 
    StaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff', 
    required: true,
  },
  records: [
    {
     calculateFrom:{ type: Date,required: true,},
     calculateTo:{ type: Date,required: true,},
     date:{ type: Date,required: true,},
     present:{ type: String,required: true,},
     halfday:{ type: String,required: true,},
     absent:{ type: String,required: true,},
     totalSalary:{ type: Number,required: true,},
     advance:{ type: Number,required: true,default:0},
     updatedSalary:{ type: Number,required: true,},
     Is_status:{type:String,default:"calculated"}
     
     
    },
  ],
});

const StaffSalary = mongoose.model('StaffSalary', StaffSalarySchema);

module.exports = StaffSalary;
