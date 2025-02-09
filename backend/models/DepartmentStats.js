const mongoose = require('mongoose');

const departmentExpensesSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  monthlySpending: {
    month1: { type: Number, default: 0 },
    month2: { type: Number, default: 0 },
    month3: { type: Number, default: 0 },
    month4: { type: Number, default: 0 },
    month5: { type: Number, default: 0 },
    month6: { type: Number, default: 0 },
    month7: { type: Number, default: 0 },
    month8: { type: Number, default: 0 },
    month9: { type: Number, default: 0 },
    month10: { type: Number, default: 0 },
    month11: { type: Number, default: 0 },
    month12: { type: Number, default: 0 }
  },
  annualSpending: {
    year1: { type: Number, default: 0 },
    year2: { type: Number, default: 0 },
    year3: { type: Number, default: 0 },
    year4: { type: Number, default: 0 },
    year5: { type: Number, default: 0 }
  },
  categorySpending: {
    travel: { type: Number, default: 0 },
    meals: { type: Number, default: 0 },
    officeSupply: { type: Number, default: 0 },
    communicationExpense: { type: Number, default: 0 },
    gifts: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    training: { type: Number, default: 0 }
  },
  celebrationSpending: {
    type: Number,
    default: 0
  },
  monthlyFraudsDetected: {
    type: Number,
    default: 0
  }
});

const DepartmentExpenses = mongoose.model('DepartmentExpenses', departmentExpensesSchema);

module.exports = DepartmentExpenses;
