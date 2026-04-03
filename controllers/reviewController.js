const Review = require('../models/Review');
const Movie = require('../models/Movie');

async function fetchMovieById(movieId) {
    try {
        return await Movie.findOneMovie(movieId);
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// GET /reviews/new/:movieId - Show new review form
async function showNewReviewForm(req, res) {
    const movie = await fetchMovieById(req.params.movieId);
    if (!movie) {
        return res.render('error', { message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    try {
        const existingReview = await Review.findExistingReview(req.session.userId, req.params.movieId);
        if (existingReview) {
            return res.render('error', { message: 'You have already reviewed this movie' });
        }
    } catch (error) {
        console.error(error.message);
        return res.render('error', { message: 'Movie not found' });
    }

    res.render('reviews/new', { movie, rating: "", reviewText: "", isAnonymous: false, error: "" });
}

function validateReview(rating, reviewText) {
    let errors = [];
    if (!rating) {
        errors.push("Please fill in the ratings");
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
    const rating = req.body.rating;
    const reviewText = req.body.reviewText;
    const isAnonymous = req.body.isAnonymous === 'on'; // checkbox sends "on" or undefined

    const movie = await fetchMovieById(req.params.movieId);
    if (!movie) {
        return res.render('error', { message: 'Movie not found' });
    }

    const errors = validateReview(rating, reviewText);
    if (errors.length > 0) {
        return res.render('reviews/new', { movie, rating, reviewText, isAnonymous, error: errors.join(', ') });
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
    } catch (error) {
        console.error(error.message);
        if (error.code === 11000) {
            return res.render('reviews/new', { movie, rating, reviewText, isAnonymous, error: 'You have already reviewed this movie' });
        }
        req.session.messages = { error: 'Sorry, something went wrong. Please try again.' };
        return res.render('reviews/new', { movie, rating, reviewText, isAnonymous, error: error.message });
    }
}

// GET /reviews/movie/:movieId - List all reviews for a movie (with pagination)
async function getReviewsByMovie(req, res) {
    const movieId = req.params.movieId;
    const movie = await fetchMovieById(movieId);

    if (!movie) {
        return res.render('error', { message: 'Movie not found' });
    }

    // Pagination params
    const limit = parseInt(req.query.limit) || 5;        // reviews per page
    const currentPage = parseInt(req.query.page) || 1;  // current page number
    const skip = (currentPage - 1) * limit;             // how many records to skip

    try {
        const totalReviews = await Review.countByMovie(movieId);
        const totalPages = Math.ceil(totalReviews / limit);

        const reviews = await Review.getReviewsPaginated(movieId, skip, limit);
        const averageRating = await Review.getAverageRating(movieId);

        // Check if the logged-in user has already reviewed this movie
        let hasReviewed = false;
        if (req.session.userId) {
            hasReviewed = await Review.hasUserReviewed(movieId, req.session.userId);
        }

        res.render('reviews/index', {
            reviews,
            movie,
            movieId,
            hasReviewed,
            averageRating,
            currentPage,
            totalPages,
            limit
        });
    } catch (error) {
        console.error(error.message);
        return res.render('error', { message: 'Error retrieving reviews' });
    }
}

// GET /reviews/:id - Show edit review form
async function showEditReviewForm(req, res) {
    try {
        const review = await Review.findByIdWithMovie(req.params.id);
        res.render('reviews/edit', { review, error: "" });
    } catch (error) {
        console.error(error.message);
        return res.render('error', { message: 'Review not found' });
    }
}

// PUT /reviews/:id - Update review
async function updateReview(req, res) {
    const rating = req.body.rating;
    const reviewText = req.body.reviewText;
    const isAnonymous = req.body.isAnonymous === 'on';

    const errors = validateReview(rating, reviewText);
    if (errors.length > 0) {
        try {
            const review = await Review.findByIdWithMovie(req.params.id);
            return res.render('reviews/edit', { review, rating, reviewText, isAnonymousBool: isAnonymous, error: errors.join(', ') });
        } catch (error) {
            console.error(error.message);
            return res.render('error', { message: 'Review not found' });
        }
    }

    try {
        await Review.updateReviewById(req.params.id, { rating, reviewText, isAnonymous, edited: true });
        req.session.messages = { success: 'Review updated successfully!' };
        res.redirect(`/reviews/movie/${req.body.movieId}`);
    } catch (error) {
        try {
            const review = await Review.findByIdWithMovie(req.params.id);
            return res.render('reviews/edit', { review, rating, reviewText, isAnonymousBool: isAnonymous, error: error.message });
        } catch (innerError) {
            console.error(innerError.message);
            return res.render('error', { message: 'Error updating review' });
        }
    }
}

// DELETE /reviews/:id - Delete review
async function deleteReview(req, res) {
    try {
        const review = await Review.deleteReviewById(req.params.id);
        const movieId = review?.movieId;
        req.session.messages = { success: 'Review deleted successfully' };
        res.redirect(`/reviews/movie/${movieId}`);
    } catch (error) {
        console.error(error.message);
        return res.render('error', { message: 'Error deleting review' });
    }
}

module.exports = {
    showNewReviewForm,
    createReview,
    getReviewsByMovie,
    showEditReviewForm,
    updateReview,
    deleteReview
};
