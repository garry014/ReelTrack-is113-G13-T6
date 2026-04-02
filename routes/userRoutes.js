const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isLoggedIn } = require('../middleware/authMiddleware');

// ─── CREATE ────────────────────────────────────────────
router.get('/register', userController.showRegister);
router.post('/register', userController.processRegister);

// ─── READ ───────────────────────────────────────────────
router.get('/profile', isLoggedIn, userController.getUserProfile);

// ─── UPDATE ─────────────────────────────────────────────
router.post('/profile/edit', isLoggedIn, userController.editUserProfile);

// ─── DELETE ─────────────────────────────────────────────
router.post('/profile/delete', isLoggedIn, userController.deleteUserProfile);

module.exports = router;