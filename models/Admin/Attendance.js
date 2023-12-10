
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true, 
  },
  records: [
    {
      laborerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Labour', 
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

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
