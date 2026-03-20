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

function retrieveAllMovies(){
    return Movie.find()
}

function findOneMovie(movieId){
    return Movie.findById(movieId)
}

function createOneMovie(req){
    const movie = new Movie({
        title: req.body.title,
        genre: req.body.genre,
        releaseYear: req.body.releaseYear,
        director: req.body.director,
        posterUrl: req.body.poster,
        addedBy: req.session.userId,
        duration: req.body.duration,
        synopsis: req.body.synopsis
    });
    return movie.save()
}

function updateOneMovie(movieId, requestBody){
    return Movie.findByIdAndUpdate(movieId, requestBody, {runValidators: true})
}

function removeOneMovie(movieId){
    return Movie.findByIdAndDelete(movieId)
}

module.exports = {
    retrieveAllMovies,
    findOneMovie,
    createOneMovie,
    updateOneMovie,
    removeOneMovie
}
