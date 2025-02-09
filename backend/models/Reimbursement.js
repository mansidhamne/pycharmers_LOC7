// // models/Reimbursement.js
// const mongoose = require('mongoose');

// const itemSchema = new mongoose.Schema({
//   item: String,
//   quantity: Number,
//   rate: Number,
//   amount: Number,
// })

// const billDetailsSchema = new mongoose.Schema({
//   vendor: String,
//   location: String,
//   phone: String,
//   invoice_number: String,
//   date: String,
//   sub_total: Number,
//   discounts: Number,
//   net_total: Number,
//   grand_total: Number,
//   summary: String,
//   tags: String,
//   items: [itemSchema]
// });

// const billSchema = new mongoose.Schema({
//   extracted_bill_id: String,
//   bill_date: String,
//   upload_date: String,
//   time: String,
//   location: String,
//   bill_amount: Number,
//   currency: String,
//   billDetails: [billDetailsSchema]
// })

// const reimbursementSchema = new mongoose.Schema({
//   employee: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: true
//   },
//   dateSubmitted: {
//     type: Date,
//     default: Date.now
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   description: String,
//   receipts: [String], // Array of file paths
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected', 'flagged'],
//     default: 'pending'
//   },
//   aiAnalysis: {
//     fraudProbability: Number,
//     anomalies: [String]
//   },
//   approvalChain: [{
//     role: String,
//     approved: Boolean,
//     reason: String,
//     date: Date
//   }],
//   currentApprover: {
//     type: String,
//     enum: ['team_lead', 'manager', 'dept_head', 'ceo']
//   },
//   bill: [billSchema]
// });

// module.exports = {
//   Reimbursement: mongoose.model('Reimbursement', reimbursementSchema),
//   itemSchema,
//   billSchema,
//   billDetailsSchema
// };

const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    extracted_bill_id: String,
    bill_date: String,
    upload_date: Date,
    time: String,
    location: String,
    bill_amount: Number,
    currency: String,
    billDetails: [
        {
            vendor: String,
            location: String,
            phone: String,
            invoice_number: String,
            date: String,
            sub_total: Number,
            net_total: Number,
            grand_total: Number,
            summary: String,
            tags: String,
            items: [
                {
                    item: String,
                    quantity: Number,
                    rate: Number,
                    amount: Number
                }
            ]
        }
    ]
});

// Export only the schema, not the model
module.exports = BillSchema;
