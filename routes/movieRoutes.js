const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { isLoggedIn, isOwner, isAdmin } = require('../middleware/authMiddleware');

// Index - Read all
router.get('/', movieController.showAllMovies);

// Filter movies by genre
router.get('/filter', movieController.showMoviesByGenre);

// New movie - Show form
router.get('/new', isLoggedIn, isAdmin, movieController.showAddForm);

// Create new movie - Save to DB
router.post('/new', isLoggedIn, isAdmin, movieController.addOneMovie);

// Show - Read one
router.get('/:id', movieController.getOneMovie);

// Edit - Show form
router.get('/:id/edit', isLoggedIn, isAdmin, movieController.showEditForm);

// Update - Save changes
router.put('/:id', isLoggedIn, isAdmin, movieController.editMovie);

// Delete
router.delete('/:id', isLoggedIn, isAdmin, movieController.deleteMovie);

module.exports = router;
