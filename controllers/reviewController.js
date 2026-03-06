const { Review, getAverageRating } = require('../models/Review');
const Movie = require('../models/Movie');

// GET /reviews/new/:movieId - Show new review form
async function showNewReviewForm(req, res) {
    const MOVIE = await Movie.findById(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const EXISTING_REVIEW = await Review.findOne({ owner: req.session.userId, movieId: req.params.movieId });
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
        const MOVIE = await Movie.findById(req.params.movieId);
        return res.render('reviews/new', { movie: MOVIE, rating, reviewText, isAnonymous, error: errors.join(', ') });
    }

    try {
        const review = new Review({
            movieId: req.params.movieId,
            rating,
            reviewText,
            isAnonymous,
            owner: req.session.userId
        });
        await review.save();

        req.flash('success', 'Thank you for your review!');
        res.redirect(`/reviews/movie/${req.params.movieId}`);
    } catch (err) {
        const MOVIE = await Movie.findById(req.params.movieId);
        console.error(err.message);
        return res.render('reviews/new', { movie: MOVIE, rating, reviewText, isAnonymous, error: err.message });
    }
}

// GET /reviews/movie/:movieId - List all reviews for a movie (with pagination)
async function getReviewsByMovie(req, res) {
    const MOVIE = await Movie.findById(req.params.movieId);
    if (!MOVIE) {
        return res.render('error', { message: 'Movie not found' });
    }

    const MOVIE_ID = req.params.movieId;

    // Pagination params
    const limit = parseInt(req.query.limit) || 5;        // reviews per page
    const currentPage = parseInt(req.query.page) || 1;  // current page number
    const skip = (currentPage - 1) * limit;             // how many to skip

    const totalReviews = await Review.countDocuments({ movieId: MOVIE_ID });
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.find({ movieId: MOVIE_ID })
        .populate('owner')
        .sort({ createdAt: -1 })   // newest first
        .skip(skip)
        .limit(limit);

    const averageRating = await getAverageRating(MOVIE_ID);

    // Check if the logged-in user has already reviewed this movie
    const hasReviewed = req.session.userId
        ? await Review.exists({ movieId: MOVIE_ID, owner: req.session.userId })
        : false;

    res.render('reviews/index', { reviews, MOVIE, MOVIE_ID, hasReviewed, averageRating, currentPage, totalPages, limit });
}

// GET /reviews/:id - Show edit review form
async function showEditReviewForm(req, res) {
    const REVIEW = await Review.findById(req.params.id).populate('movieId');
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
        const REVIEW = await Review.findById(req.params.id).populate('movieId');
        const isAnonymousBool = isAnonymous === 'on' ? true : false;
        return res.render('reviews/edit', { REVIEW, rating, reviewText, isAnonymousBool, error: errors.join(', ') });
    }

    try {
        await Review.findByIdAndUpdate(req.params.id, { rating, reviewText, isAnonymous, edited: true }, { runValidators: true });
        req.flash('success', 'Item updated successfully!');
        res.redirect(`/reviews/movie/${req.body.movieId}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect(`/reviews/${req.body.movieId}`);
    }
}

// DELETE /reviews/:id - Delete review
async function deleteReview(req, res) {
    const review = await Review.findById(req.params.id);
    const movieId = review?.movieId;
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Review deleted successfully');
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
