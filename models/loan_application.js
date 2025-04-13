const mongoose = require('mongoose');

const LoanApplicationSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    loanAmount: Number,
    installment: Number,
    annualIncome: Number,
    panCard: { type: String, unique: true, required: true },
    homeOwnership: String,
    loanPurpose: String,
});

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);
