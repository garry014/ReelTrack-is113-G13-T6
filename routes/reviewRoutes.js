const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { isLoggedIn, isOwner } = require('../middleware/authMiddleware');

// TODO: Integration so user can click from movie page to view/write review
// Conduct basic validations & then display EJS for new review page
router.get('/new/:movieId', isLoggedIn, async (req, res) => {
    // check if there's even such movieId
    const MOVIE = await Movie.findById(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    // check if user already reviewed this movie
    const EXISTING_REVIEW = await Review.findOne({ owner: req.session.userId, movieId: req.params.movieId });
    if (EXISTING_REVIEW) {
        return res.render('error', { message: 'You already reviewed this movie' });
    }

    res.render('reviews/new', { movie: MOVIE, error: "" });
});

// Create review
router.post('/new/:movieId', isLoggedIn, async (req, res) => {
    let rating = req.body.rating;
    let reviewText = req.body.reviewText;
    let isAnonymous = req.body.isAnonymous;

    try {
        const review = new Review({
            movieId: req.params.movieId,
            rating: rating,
            reviewText: reviewText,
            isAnonymous: isAnonymous,
            owner: req.session.userId
        });
        await review.save();

        req.flash('success', 'Thank you for your review!');
        res.redirect(`/movie/${req.params.movieId}`);
    } catch (err) {
        const MOVIE = await Movie.findById(req.params.movieId);
        console.error(err.message);
        return res.render('reviews/new', { movie: MOVIE, rating, reviewText, isAnonymous, error: err.message });
    }
});

// Read all reviews for a given movieId
router.get('/movie/:movieId', async (req, res) => {
    const MOVIE = await Movie.findById(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    const MOVIE_ID = req.params.movieId;
    const reviews = await Review.find({ movieId: MOVIE_ID }).populate('owner');

    // Check if the logged-in user has already reviewed this movie
    const hasReviewed = req.session.userId
        ? await Review.exists({ movieId: MOVIE_ID, owner: req.session.userId })
        : false;

    res.render('reviews/index', { reviews, MOVIE_ID, hasReviewed });
});

// Edit review display page
router.get('/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, async (req, res) => {
    const REVIEW = await Review.findById(req.params.id).populate('movieId');;
    console.log(REVIEW);
    res.render('reviews/edit', { REVIEW });
});

// Edit review
router.put('/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
        req.flash('success', 'Item updated successfully!');
        res.redirect(`/reviews/movie/${req.body.movieId}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect(`/reviews/${req.body.movieId}`);
    }
});

// Delete
router.delete('/:id', isLoggedIn, async (req, res, next) => {
    await isOwner(req, res, next, Review);
}, async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Item deleted successfully');
    res.redirect('/items');
});

module.exports = router;
