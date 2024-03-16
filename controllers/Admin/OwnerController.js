const Expense = require('../../models/Admin/OwnerExpenseModel');

const handleAddOwnerExpense = async (req, res) => {
    try {
        console.log(req.body);
        const { item, payment, date } = req.body;
        const newExpense = new Expense({ item, payment, date });
        await newExpense.save();
        res.status(200).json({ success: true, message: 'Expense added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const handleFindOwnerExpense = async (req, res) => {
    try {
        console.log("Fetching all expenses...");
        const expenses = await Expense.find();
        console.log("expenses", expenses);
        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ success: false, message: 'No expenses found' });
        }
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const handleDeleteOwnerExpense = async (req, res) => {
    try {
        const expenseId = req.query.id;
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);

        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    handleAddOwnerExpense,
    handleFindOwnerExpense,
    handleDeleteOwnerExpense
};
