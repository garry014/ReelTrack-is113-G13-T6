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

const getAverageRating = async (movieId) => {
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

module.exports = { Review, getAverageRating };