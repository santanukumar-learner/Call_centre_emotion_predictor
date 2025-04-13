const mongoose = require("mongoose");

const adminDataSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    annualIncome: { type: Number, required: true },
    homeOwnership: { type: String, enum: ["OWN", "MORTGAGE", "RENT", "OTHER"], required: true },
    loanPurpose: { type: String, required: true },
    applicationType: { type: String, enum: ["INDIVIDUAL", "JOINT", "DIRECT_PAY"], required: true },
    loanTerm: { type: Number, enum: [36, 60], required: true }, // Months
    interestRate: { type: Number, required: true },
    monthlyInstallment: { type: Number, required: true },
    loanSubgrade: { 
        type: String, 
        enum: [
            "A1", "A2", "A3", "A4", "A5",
            "B1", "B2", "B3", "B4", "B5",
            "C1", "C2", "C3", "C4", "C5",
            "D1", "D2", "D3", "D4", "D5",
            "E1", "E2", "E3", "E4", "E5",
            "F1", "F2", "F3", "F4", "F5",
            "G1", "G2", "G3", "G4", "G5"
        ],
        required: true
    },
    openCreditLines: { type: Number, required: true },
    derogatoryRecords: { type: Number, required: true },
    revolvingCreditBalance: { type: Number, required: true },
    creditUtilization: { type: Number, required: true },
    totalCreditAccounts: { type: Number, required: true },
    publicBankruptcies: { type: Number, required: true },
    dtiRatio: { type: Number, required: true }, // Debt-to-Income Ratio (%)
    creditHistoryLength: { type: Number, required: true }, // Years
    verificationStatus: { 
        type: String, 
        enum: ["VERIFIED", "NOT VERIFIED", "SOURCE VERIFIED"], 
        required: true 
    } // Added verification status field
}, { timestamps: true });

const AdminData = mongoose.model("AdminData", adminDataSchema);

module.exports = AdminData;
