// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

module.exports = router;