const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
const AuthController = require('./controllers/AuthController');
const AuthRoutes = require('./routes/authRoutes');
const reimbursementRoutes=require('./routes/reimbursement');
const Reimbursement = require('./models/Reimbursement');
const DepartmentStats = require('./models/DepartmentStats');
// Load environment variables
dotenv.config();
// const ExpenseRoutes=require('./routes/expenseRoutes');
// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Use user routes
app.use('/auth', AuthRoutes);
// app.use('/expenses', ExpenseRoutes);
app.use('/reimbursement',reimbursementRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});
async function getSubordinates(role, department) {
  try {
    const hierarchy = ['employee', 'team_lead', 'manager', 'dept_head', 'ceo'];
    const roleIndex = hierarchy.indexOf(role);

    if (roleIndex === -1 || roleIndex === hierarchy.length - 1) {
      return []; // No subordinates if the role is invalid or CEO
    }

    const subRoles = hierarchy.slice(0, roleIndex); // Get lower roles
    return await Employee.find({ role: { $in: subRoles }, department });
  } catch (error) {
    console.error('Error fetching subordinates:', error);
    return [];
  }
}

app.get('/subordinates', async (req, res) => {
  try {
    const { role, department } = req.query; // Accept query parameters

    if (!role || !department) {
      return res.status(400).json({ error: 'Missing role or department parameters' });
    }

    const subordinates = await getSubordinates(role, department);
    res.json(subordinates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subordinates' });
  }
});

app.get('/department-stats', async (req, res) => {
  try {
    const { role, department } = req.query; // Accept query parameters

    if (!role || !department) {
      return res.status(400).json({ error: 'Missing role or department parameters' });
    }

    const subordinates = await getSubordinates(role, department);

    const stats = {
      totalEmployees: subordinates.length,
      roleBreakdown: {},
      reimbursementStats: {
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        flagged: 0,
        fraudRisk: []
      }
    };

    subordinates.forEach(emp => {
      stats.roleBreakdown[emp.role] = (stats.roleBreakdown[emp.role] || 0) + 1;
    });

    const reimbursements = await Reimbursement.find({ employee: { $in: subordinates.map(e => e.employeeId) } });

    reimbursements.forEach(req => {
      stats.reimbursementStats.totalRequests++;
      stats.reimbursementStats[req.status]++;
      if (req.aiAnalysis?.fraudProbability > 50) {
        stats.reimbursementStats.fraudRisk.push({
          employee: req.employee,
          fraudProbability: req.aiAnalysis.fraudProbability
        });
      }
    });
    console.log(stats)
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching department stats' });
  }
});

const groupExpenses = (expenses, period) => {
  const grouped = {};
  expenses.forEach(exp => {
      const date = new Date(exp.dateSubmitted);
      const key = period === 'yearly' ? date.getFullYear() : 
                  period === 'half-yearly' ? `${date.getFullYear()}-H${date.getMonth() < 6 ? 1 : 2}` :
                  `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      
      if (!grouped[key]) grouped[key] = { total: 0, categories: {} };
      grouped[key].total += exp.amount;
      grouped[key].categories[exp.category] = (grouped[key].categories[exp.category] || 0) + exp.amount;
  });
  return grouped;
};

// Fetch audit reports
app.get('/audit/:period', async (req, res) => {
  try {
      const { period } = req.params;
      const expenses = await Reimbursement.find({ status: 'approved' });
      const groupedData = groupExpenses(expenses, period);
      
      res.json({ success: true, data: groupedData });
  } catch (error) {
      res.status(500).json({ error: 'Error generating audit report' });
  }
});

// Fetch department statistics
app.get('/departmentstats', async (req, res) => {
  try {
      const stats = await DepartmentStats.find({});
      res.json({ success: true, data: stats });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching department stats' });
  }
});

// Fetch AI Insights
app.get('/ai-insights', async (req, res) => {
  try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {});
      res.json({ success: true, insights: response.data });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching AI insights' });
  }
});

// Fetch Reports Based on Time Range
app.get('/reports/:type', async (req, res) => {
  const { type } = req.params;
  let startDate, endDate;
  const currentDate = new Date();
  
  if (type === 'quarterly') {
      startDate = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1);
      endDate = new Date(currentDate.getFullYear(), startDate.getMonth() + 3, 0);
  } else if (type === 'half-yearly') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() < 6 ? 0 : 6, 1);
      endDate = new Date(currentDate.getFullYear(), startDate.getMonth() + 6, 0);
  } else if (type === 'yearly') {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
  } else {
      return res.status(400).json({ error: 'Invalid report type' });
  }
  
  try {
      const reimbursements = await Reimbursement.find({ dateSubmitted: { $gte: startDate, $lte: endDate } });
      const departmentStats = await DepartmentStats.find({ year: currentDate.getFullYear() });
      
      const response = await axios.post('http://localhost:5000/analyze', { reimbursements });
      
      res.json({ reimbursements, departmentStats, insights: response.data });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/api/expenses/:employeeId', authenticateToken, async (req, res) => {
  try {
    const expenses = await Reimbursement.find({ employee: req.params.employeeId })
      .sort({ dateSubmitted: -1 })
      .limit(10);

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});

// Get expense statistics
app.get('/api/expenses/stats/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get current date and 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate total expenses this month
    const totalExpenses = await Reimbursement.aggregate([
      {
        $match: {
          employee: employeeId,
          dateSubmitted: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Get pending count
    const pendingCount = await Reimbursement.countDocuments({
      employee: employeeId,
      status: 'pending'
    });

    // Calculate approval rate
    const approvedCount = await Reimbursement.countDocuments({
      employee: employeeId,
      status: 'approved',
      dateSubmitted: { $gte: thirtyDaysAgo }
    });

    const totalSubmitted = await Reimbursement.countDocuments({
      employee: employeeId,
      dateSubmitted: { $gte: thirtyDaysAgo }
    });

    const approvalRate = totalSubmitted > 0 
      ? Math.round((approvedCount / totalSubmitted) * 100)
      : 0;

    // Get monthly trends
    const monthlyTrends = await Reimbursement.aggregate([
      {
        $match: {
          employee: employeeId,
          dateSubmitted: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateSubmitted" },
            month: { $month: "$dateSubmitted" }
          },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ]
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"]
              }
            }
          },
          amount: 1
        }
      }
    ]);

    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      pendingCount,
      approvalRate,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Create new expense
app.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const newExpense = new Reimbursement({
      ...req.body,
      dateSubmitted: new Date(),
      status: 'pending',
      aiAnalysis: {
        fraudProbability: 0, // You could implement AI analysis here
        anomalies: []
      }
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
});

// Update expense status
app.patch('/expenses/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, approverRole, reason } = req.body;
    
    const expense = await Reimbursement.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = status;
    expense.approvalChain.push({
      role: approverRole,
      approved: status === 'approved',
      reason,
      date: new Date()
    });

    if (status === 'approved') {
      expense.currentApprover = null;
    }

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense status', error: error.message });
  }
});

// Delete expense
app.delete('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Reimbursement.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending expenses' });
    }

    await expense.remove();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
});

// Get expense by ID
app.get('/expenses/detail/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Reimbursement.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
});

// Get expenses by status
app.get('/expenses/status/:status', async (req, res) => {
  try {
    const {id}=req.params;
    const expenses = await Reimbursement.find({ 
      status: req.params.status,
      employee: id
    }).sort({ dateSubmitted: -1 });
    
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});