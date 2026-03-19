const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    releaseYear: {
        type: Number,
        required: true,
    },
    director: {
        type: String,
        required: true,
    },
    posterUrl: {
        type: String,
    },
    synopsis: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);
exports.Movie = Movie;

// Get all movies
exports.getAllMovies = () => {
    return Movie.find();
};

// Find a single movie by its ID
exports.findMovieById = (id) => {
    return Movie.findById(id);
};

// Create and save a new movie document
exports.createMovie = (data) => {
    const movie = new Movie(data);
    return movie.save();
};

// Update a movie by ID with new data, running schema validators
exports.updateMovieById = (id, data) => {
    return Movie.findByIdAndUpdate(id, data, { runValidators: true });
};

// Delete a movie by ID
exports.deleteMovieById = (id) => {
    return Movie.findByIdAndDelete(id);
};
