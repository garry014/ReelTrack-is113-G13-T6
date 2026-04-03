const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// Index - Read all genres
router.get('/', genreController.showAllGenres);

// New genre - Show form
router.get('/new', isLoggedIn, isAdmin, genreController.showAddForm);

// Create new genre
router.post('/new', isLoggedIn, isAdmin, genreController.addOneGenre);

// Show one genre
router.get('/:id', genreController.getOneGenre);

// Edit form
router.get('/:id/edit', isLoggedIn, isAdmin, genreController.showEditForm);

// Update genre
router.post('/:id', isLoggedIn, isAdmin, genreController.editGenre);

// Delete genre
router.delete('/:id', isLoggedIn, isAdmin, genreController.deleteGenre);

module.exports = router;