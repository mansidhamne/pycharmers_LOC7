// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Meals', 'Equipment', 'Software', 'Office Supplies', 'Others']
  },
  description: {
    type: String,
    required: true
  },
  receipts: [{
    url: String,
    filename: String
  }],
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalChain: [{
    level: String, // role level that needs to approve
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    date: Date,
    comments: String
  }],
  currentApprovalLevel: {
    type: String,
    enum: ['team_lead', 'manager', 'dept_head', 'ceo'],
    default: 'team_lead'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);

// utils/roles.js
const ROLE_HIERARCHY = {
  employee: 0,
  team_lead: 1,
  manager: 2,
  dept_head: 3,
  ceo: 4
};

const APPROVAL_CHAIN = {
  employee: ['team_lead', 'manager', 'dept_head'],
  team_lead: ['manager', 'dept_head'],
  manager: ['dept_head'],
  dept_head: ['ceo'],
  ceo: []
};

module.exports = { ROLE_HIERARCHY, APPROVAL_CHAIN };