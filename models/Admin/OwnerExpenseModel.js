const mongoose = require('mongoose');

const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  item: {
    type: String
  },
  payment: {
    type: String
  },
  date: {
    type: Date
  }
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;
