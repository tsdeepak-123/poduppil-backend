const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const MaterialSchema = new Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  projectname:{
    type:String,
    required:true
  },
  date: {
    type: Date,
    required: true,
  },
  careof: {
    type: String,
  },
  Material: [
    {
      name: {
        type: String,
        required: true,
      },
      careof: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
      baseRate: {
        type: Number,
        required: true,
      },
    },
  ],
  TotalAmount: {
    type: Number,
    required: true,
  },
});

const Purchase = new mongoose.model("Purchase", MaterialSchema);

module.exports = Purchase;
