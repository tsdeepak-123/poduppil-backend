
const mongoose = require('mongoose');

const staffattendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true, 
  },
  records: [
    {
      StaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', 
        required: true,
      },
      status: {
        type: String,
        enum: ['present', 'halfday', 'absent'],
        required: true,
      },
    },
  ],
});

const Attendance = mongoose.model('Staffattendance', staffattendanceSchema);

module.exports = Attendance;
