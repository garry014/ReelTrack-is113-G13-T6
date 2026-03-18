const express = require('express');
const router = express.Router();
const { isLoggedIn, isOwner } = require('../middleware/authMiddleware');
const { Review } = require('../models/Review');
const {
    showNewReviewForm,
    createReview,
    getReviewsByMovie,
    showEditReviewForm,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// Show new review form
router.get('/new/:movieId', isLoggedIn, showNewReviewForm);

// Create review
router.post('/new/:movieId', isLoggedIn, createReview);

// List all reviews for a movie (with pagination)
router.get('/movie/:movieId', getReviewsByMovie);

// Show edit review form
router.get('/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, showEditReviewForm);

// Update review
router.post('/update/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, updateReview);

// Delete review
router.post('/delete/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, deleteReview);

module.exports = router;
