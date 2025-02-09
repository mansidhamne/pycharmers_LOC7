// const mongoose = require('mongoose');
// const BillSchema = require('./Reimbursement');

// const reimburseSchema = new mongoose.Schema({
//     employee: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Employee',
//         required: true
//     },
//     dateSubmitted: {
//         type: Date,
//         default: Date.now
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     description: String,
//     receipts: [String], // Array of file paths
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected', 'flagged'],
//         default: 'pending'
//     },
//     bill: [BillSchema]
// });

// module.exports = mongoose.model('Reimburse', reimburseSchema);
const mongoose = require('mongoose');
const BillSchema = require('./Reimbursement'); // Import only the schema

const reimburseSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    dateSubmitted: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending'
    },
    bill: [BillSchema] // ✅ Now correctly using the schema
});

module.exports = mongoose.model('Reimburse', reimburseSchema);
