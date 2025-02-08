// models/DepartmentStats.js
const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  department: String,
  month: Number,
  year: Number,
  totalSpent: Number,
  categoryBreakdown: {
    travel: Number,
    meals: Number,
    office: Number,
    telecom: Number,
    other: Number
  }
});

module.exports = mongoose.model('DepartmentStats', statsSchema);