const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register GET
router.get('/register', authController.showRegister);

// Register POST
router.post('/register', authController.processRegister);

// Login GET
router.get('/login', authController.showLogin);

// Login POST
router.post('/login', authController.processLogin);

// Logout POST
router.post('/logout', authController.processLogout);

module.exports = router;