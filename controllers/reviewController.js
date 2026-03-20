const Review = require('../models/Review');
const Movie = require('../models/Movie');

// GET /reviews/new/:movieId - Show new review form
async function showNewReviewForm(req, res) {
    const MOVIE = await Movie.findOneMovie(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const EXISTING_REVIEW = await Review.findExistingReview(req.session.userId, req.params.movieId);
    if (EXISTING_REVIEW) {
        return res.render('error', { message: 'You have already reviewed this movie' });
    }

    res.render('reviews/new', { movie: MOVIE, rating: "", reviewText: "", isAnonymous: false, error: "" });
}

function validateReview(rating, reviewText) {
    let errors = [];
    if (!rating) {
        errors.push("Please fill in all fields");
    }
    if (rating < 1 || rating > 5) {
        errors.push("Rating must be between 1 and 5");
    }
    if (!reviewText || reviewText.length < 10) {
        errors.push("Review must be at least 10 characters long");
    }
    return errors;
}

// POST /reviews/new/:movieId - Create review
async function createReview(req, res) {
    let rating = req.body.rating;
    let reviewText = req.body.reviewText;
    let isAnonymous = req.body.isAnonymous === 'on'; // checkbox sends "on" or undefined

    const errors = validateReview(rating, reviewText);
    if (errors.length > 0) {
        const MOVIE = await Movie.findOneMovie(req.params.movieId);
        return res.render('reviews/new', { movie: MOVIE, rating, reviewText, isAnonymous, error: errors.join(', ') });
    }

    try {
        await Review.createReview({
            movieId: req.params.movieId,
            rating,
            reviewText,
            isAnonymous,
            owner: req.session.userId
        });

        req.session.messages = { success: 'Thank you for your review!' };
        res.redirect(`/reviews/movie/${req.params.movieId}`);
    } catch (err) {
        const MOVIE = await Movie.findOneMovie(req.params.movieId);
        console.error(err.message);
        return res.render('reviews/new', { movie: MOVIE, rating, reviewText, isAnonymous, error: err.message });
    }
}

// GET /reviews/movie/:movieId - List all reviews for a movie (with pagination)
async function getReviewsByMovie(req, res) {
    const MOVIE = await Movie.findOneMovie(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    const MOVIE_ID = req.params.movieId;

    // Pagination params
    const limit = parseInt(req.query.limit) || 5;        // reviews per page
    const currentPage = parseInt(req.query.page) || 1;  // current page number
    const skip = (currentPage - 1) * limit;             // how many to skip

    const totalReviews = await Review.countByMovie(MOVIE_ID);
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.getReviewsPaginated(MOVIE_ID, skip, limit);

    const averageRating = await Review.getAverageRating(MOVIE_ID);

    // Check if the logged-in user has already reviewed this movie
    const hasReviewed = req.session.userId
        ? await Review.hasUserReviewed(MOVIE_ID, req.session.userId)
        : false;

    res.render('reviews/index', { reviews, MOVIE, MOVIE_ID, hasReviewed, averageRating, currentPage, totalPages, limit });
}

// GET /reviews/:id - Show edit review form
async function showEditReviewForm(req, res) {
    const REVIEW = await Review.findByIdWithMovie(req.params.id);
    console.log(REVIEW);
    res.render('reviews/edit', { REVIEW, error: "" });
}

// PUT /reviews/:id - Update review
async function updateReview(req, res) {
    let rating = req.body.rating;
    let reviewText = req.body.reviewText;
    let isAnonymous = req.body.isAnonymous === 'on'; // checkbox sends "on" or undefined

    const errors = validateReview(rating, reviewText);
    if (errors.length > 0) {
        const REVIEW = await Review.findByIdWithMovie(req.params.id);
        const isAnonymousBool = isAnonymous === 'on' ? true : false;
        return res.render('reviews/edit', { REVIEW, rating, reviewText, isAnonymousBool, error: errors.join(', ') });
    }

    try {
        await Review.updateReviewById(req.params.id, { rating, reviewText, isAnonymous, edited: true });
        req.session.messages = { success: 'Review updated successfully!' };
        res.redirect(`/reviews/movie/${req.body.movieId}`);
    } catch (err) {
        const REVIEW = await Review.findByIdWithMovie(req.params.id);
        return res.render('reviews/edit', { REVIEW, rating, reviewText, isAnonymousBool: isAnonymous, error: err.message });
    }
}

// DELETE /reviews/:id - Delete review
async function deleteReview(req, res) {
    const review = await Review.deleteReviewById(req.params.id);
    const movieId = review?.movieId;
    req.session.messages = { success: 'Review deleted successfully' };
    res.redirect(`/reviews/movie/${movieId}`);
}

module.exports = {
    showNewReviewForm,
    createReview,
    getReviewsByMovie,
    showEditReviewForm,
    updateReview,
    deleteReview
};
