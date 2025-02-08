const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
const AuthController = require('./controllers/AuthController');
const AuthRoutes = require('./routes/authRoutes');
const reimbursementRoutes=require('./routes/reimbursement');
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

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching department stats' });
  }
});

  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});