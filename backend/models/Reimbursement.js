// models/Reimbursement.js
const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
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
    enum: ['travel', 'meals', 'office', 'telecom', 'other'],
    required: true
  },
  description: String,
  receipts: [String], // Array of file paths
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  aiAnalysis: {
    fraudProbability: Number,
    anomalies: [String]
  },
  approvalChain: [{
    role: String,
    approved: Boolean,
    reason: String,
    date: Date
  }],
  currentApprover: {
    type: String,
    enum: ['team_lead', 'manager', 'dept_head', 'ceo']
  }
});

module.exports = mongoose.model('Reimbursement', reimbursementSchema);