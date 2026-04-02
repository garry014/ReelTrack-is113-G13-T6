const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



// Login GET
router.get('/login', authController.showLogin);

// Login POST
router.post('/login', authController.processLogin);

// Logout POST
router.post('/logout', authController.processLogout);

module.exports = router;