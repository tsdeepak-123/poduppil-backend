const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const CareOfSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  payments: [
    {
      date: {
        type: Date,
        // required: true
      },
      amount: {
        type: Number,
        // required: true
      },
      paymentType: {
        type: String,
        // required: true
      },
      paidBy: {
        type: String,
        // required: true
      },
    },
  ],
});

const Careof = new mongoose.model("Careof", CareOfSchema);

module.exports = Careof;
