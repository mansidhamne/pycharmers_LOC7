// routes/reimbursement.js
const express = require('express');
const router = express.Router();
const Reimbursement = require('../models/Reimbursement');
const Employee = require('../models/Employee');

// Get pending reimbursements for approval
// routes/reimbursement.js
router.get('/pending', async (req, res) => {
    try {
      const { role, department } = req.query; // Extract query parameters
      console.log(role)
      const reimbursements = await Reimbursement.find({status:'pending'})
      .populate({
        path: 'employee',
        select: 'employeeId email department role',
        model: 'Employee', // Explicitly mention the model
      })
      .exec();

    console.log(reimbursements)
      // Filter reimbursements based on hierarchy and department
      const filteredReimbursements = reimbursements.filter(reimbursement => {
        const employeeRole = reimbursement.employee.role;
        const employeeDepartment = reimbursement.employee.department;
        return isHigherHierarchy(role, employeeRole) && employeeDepartment === department;
      });
  console.log(filteredReimbursements)
      res.json(filteredReimbursements);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pending reimbursements', error });
    }
  });
  router.get('/', async (req, res) => {
    try {
      const { status, role, department } = req.query;
      const query = { status };
      console.log(query.status)
      const reimbursements = await Reimbursement.find({ status: query.status })
      .populate({
        path: 'employee',
        select: 'employeeId email department role',
        model: 'Employee', // Explicitly mention the model
      })
      .exec();
     console.log(reimbursements)
     const filteredReimbursements = reimbursements.filter(reimbursement => {
        const employeeRole = reimbursement.employee.role;
        const employeeDepartment = reimbursement.employee.department;
        return isHigherHierarchy(role, employeeRole) && employeeDepartment === department;
      });
      res.json(filteredReimbursements);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reimbursements', error });
    }
  });
  
  // Approve or reject a reimbursement
  router.post('/:id/decision', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id)
      const { decision, reason } = req.body;
     
      console.log(decision)
      const reimbursement = await Reimbursement.findById(id).exec();
      console.log(reimbursement)
      if (!reimbursement) {
        return res.status(404).json({ message: 'Reimbursement not found' });
      }
  
  
      reimbursement.status = decision;
      reimbursement.approvalChain.push({
        approved: decision === 'approved',
        reason,
        date: new Date()
      });
  
      try {
        await reimbursement.save();
      } catch (saveError) {
        console.error("Error saving reimbursement:", saveError);
        return res.status(500).json({ message: "Error saving reimbursement", error: saveError });
      }
      
      res.json({ message: `Reimbursement ${decision}`, reimbursement });
    } catch (error) {
      res.status(500).json({ message: 'Error processing decision', error });
    }
  });
  
  // Helper function to check hierarchy
  function isHigherHierarchy(approverRole, employeeRole) {
    const hierarchy = ['employee', 'team_lead', 'manager', 'dept_head', 'ceo'];
    return hierarchy.indexOf(approverRole) > hierarchy.indexOf(employeeRole);
  }
  
  module.exports = router;