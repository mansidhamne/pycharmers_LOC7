// controllers/authController.js
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

class AuthController {
  static validateEmployeeFromCSV = async (employeeId, company) => {
    try {
      const csvPath = path.join(process.cwd(), 'data', `${company.toLowerCase()}.csv`);
      
      if (!fs.existsSync(csvPath)) {
        throw new Error('Company employee data not found');
      }

      return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            const employee = results.find(emp => emp.employee_id === employeeId);
            resolve(employee);
          })
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      throw new Error(`CSV validation error: ${error.message}`);
    }
  };

  static register = async (req, res) => {
    try {
      const { employeeId, email, password, company } = req.body;

      const employeeData = await AuthController.validateEmployeeFromCSV(employeeId, company);
      
      if (!employeeData) {
        return res.status(400).json({ error: 'Employee not found in company records' });
      }

      const existingEmployee = await Employee.findOne({ 
        $or: [{ employeeId }, { email }] 
      });

      if (existingEmployee) {
        return res.status(400).json({ 
          error: 'Employee already registered with this ID or email' 
        });
      }

      const employee = new Employee({
        employeeId,
        email,
        password,
        company,
        department: employeeData.department,
        role: employeeData.role.toLowerCase(),
        isVerified: true // Set to true by default since we removed email verification
      });

      await employee.save();

      // Create and send token immediately after registration
      const token = jwt.sign(
        { 
          id: employee._id,
          role: employee.role,
          department: employee.department 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        message: 'Registration successful',
        token,
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          email: employee.email,
          role: employee.role,
          department: employee.department,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: error.message || 'Error during registration' 
      });
    }
  };

  static login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const employee = await Employee.findOne({ email });
      if (!employee) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await employee.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: employee._id,
          role: employee.role,
          department: employee.department 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          email: employee.email,
          role: employee.role,
          department: employee.department,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: error.message || 'Error during login' 
      });
    }
  };
}

module.exports = AuthController;