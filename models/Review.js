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

module.exports = Review;