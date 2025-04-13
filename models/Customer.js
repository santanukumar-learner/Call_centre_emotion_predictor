// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerId: String,
    name: String,
    email: String,
    phone: String
});

module.exports = mongoose.model('Customer', customerSchema);
