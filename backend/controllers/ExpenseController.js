// controllers/expenseController.js
const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const { ROLE_HIERARCHY, APPROVAL_CHAIN } = require('../utils/roles');

class ExpenseController {
  static async createExpense(req, res) {
    try {
      const { amount, category, description, receipts, employeeId,id } = req.body;

      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const approvalChain = APPROVAL_CHAIN[employee.role].map(role => ({
        level: role,
        status: 'pending'
      }));

      const expense = new Expense({
        id,
        amount,
        category,
        description,
        receipts,
        department: employee.department,
        approvalChain,
        currentApprovalLevel: approvalChain[0]?.level || 'approved'
      });

      await expense.save();
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getExpensesForApproval(req, res) {
    try {
      const { role, department, id, employeeId, company } = req.body.employeeData; // Get from request body instead of auth middleware
      let query = {};

      if (role === 'ceo') {
        query = {
          currentApprovalLevel: 'ceo',
          status: 'pending'
        };
      } else if (role === 'dept_head') {
        query = {
          department,
          currentApprovalLevel: 'dept_head',
          status: 'pending'
        };
      } else if (role === 'manager') {
        query = {
          department,
          currentApprovalLevel: 'manager',
          status: 'pending'
        };
      } else if (role === 'team_lead') {
        query = {
          department,
          currentApprovalLevel: 'team_lead',
          status: 'pending'
        };
      }

      const expenses = await Expense.getAll()
  .populate('employeeId', 'name email department role')
  .then(expenses => expenses.filter(exp => subordinateRoles.includes(exp.employeeId.role)));


      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approveExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const { comments, employeeData } = req.body;
      const { _id: approverId, role } = employeeData;

      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      // Verify this person can approve this expense
      if (expense.currentApprovalLevel !== role) {
        return res.status(403).json({ error: 'Not authorized to approve this expense' });
      }

      // Update approval chain
      const approvalIndex = expense.approvalChain.findIndex(a => a.level === role);
      expense.approvalChain[approvalIndex] = {
        ...expense.approvalChain[approvalIndex],
        approvedBy: approverId,
        status: 'approved',
        date: new Date(),
        comments
      };

      // Update current approval level or mark as fully approved
      const nextApprovalLevel = expense.approvalChain[approvalIndex + 1]?.level;
      if (nextApprovalLevel) {
        expense.currentApprovalLevel = nextApprovalLevel;
      } else {
        expense.status = 'approved';
        expense.currentApprovalLevel = null;
      }

      expense.lastModifiedBy = approverId;
      expense.lastModifiedDate = new Date();

      await expense.save();
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async rejectExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const { comments, employeeData } = req.body;
      const { _id: rejecterId, role } = employeeData;

      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      if (expense.currentApprovalLevel !== role) {
        return res.status(403).json({ error: 'Not authorized to reject this expense' });
      }

      const approvalIndex = expense.approvalChain.findIndex(a => a.level === role);
      expense.approvalChain[approvalIndex] = {
        ...expense.approvalChain[approvalIndex],
        approvedBy: rejecterId,
        status: 'rejected',
        date: new Date(),
        comments
      };

      expense.status = 'rejected';
      expense.currentApprovalLevel = null;
      expense.lastModifiedBy = rejecterId;
      expense.lastModifiedDate = new Date();

      await expense.save();
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSubordinateExpenses(req, res) {
    try {
      const { role, department } = req.body.employeeData;
      const roleLevel = ROLE_HIERARCHY[role];

      // Get all roles below current role
      const subordinateRoles = Object.entries(ROLE_HIERARCHY)
        .filter(([_, level]) => level < roleLevel)
        .map(([role]) => role);

      const query = {


        department: role === 'ceo' ? { $exists: true } : department,
        'employeeId.role': { $in: subordinateRoles }
      };

      const expenses = await Expense.find(query)
        .populate('employeeId', 'name email department role')
        .sort('-createdAt');

      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ExpenseController;