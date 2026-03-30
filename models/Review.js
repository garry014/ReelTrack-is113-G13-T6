const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        owner: { // Foreign key (id) that retrieves from User Schema
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        movieId: { // Foreign key (id) that retrieves from Movie Schema
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        reviewText: {
            type: String,
            required: true,
        },
        isAnonymous: {
            type: Boolean
        },
        edited: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// each user can only review a movie once
reviewSchema.index({ owner: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

exports.getAverageRating = async (movieId) => {
    const result = await Review.aggregate([
        {
            $match: { // filters only the given movieId
                movieId: new mongoose.Types.ObjectId(movieId)
            }
        },
        {
            $group: { // group then calculate average rating
                _id: '$movieId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        },
        {
            $project: { // output format
                _id: 0,
                movieId: '$_id',
                averageRating: { $round: ['$averageRating', 2] },
                totalReviews: 1
            }
        }
    ]);

    // if no reviews, return 0
    return result[0] || { movieId, averageRating: 0, totalReviews: 0 };
};

// Find an existing review by a user for a specific movie
exports.findExistingReview = (userId, movieId) => {
    return Review.findOne({ owner: userId, movieId });
};

// Create and save a new review document
exports.createReview = (data) => {
    const review = new Review(data);
    return review.save();
};

// Count total reviews for a movie
exports.countByMovie = (movieId) => {
    return Review.countDocuments({ movieId });
};

// Get paginated reviews for a movie, newest first, with owner populated
exports.getReviewsPaginated = (movieId, skip, limit) => {
    return Review.find({ movieId })
        .populate('owner')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Check whether a specific user has reviewed a given movie
exports.hasUserReviewed = (movieId, userId) => {
    return Review.exists({ movieId, owner: userId });
};

// Find a review by its ID and populate its associated movie
exports.findByIdWithMovie = (id) => {
    return Review.findById(id).populate('movieId');
};

// Update a review by ID with new data, running schema validators
exports.updateReviewById = (id, data) => {
    return Review.findByIdAndUpdate(id, data, { runValidators: true });
};

// Delete a review by ID and return the deleted document
exports.deleteReviewById = (id) => {
    return Review.findByIdAndDelete(id);
};