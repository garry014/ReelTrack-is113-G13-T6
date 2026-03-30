const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Genre = mongoose.model('Genre', genreSchema);

function retrieveAllGenres() {
    return Genre.find().populate('createdBy');
}

function retrieveActiveGenres() {
    return Genre.find({ isActive: true });
}

function findOneGenre(genreId) {
    return Genre.findById(genreId).populate('createdBy');
}

function createOneGenre(req) {
    const genre = new Genre({
        name: req.body.name,
        description: req.body.description,
        createdBy: req.session.userId,
        isActive: req.body.isActive === 'on' ? true : false
    });

    return genre.save();
}

function updateOneGenre(genreId, requestBody) {
    const updatedData = {
        name: requestBody.name,
        description: requestBody.description,
        isActive: requestBody.isActive === 'on' ? true : false
    };

    return Genre.findByIdAndUpdate(genreId, updatedData, { runValidators: true });
}

function removeOneGenre(genreId) {
    return Genre.findByIdAndDelete(genreId);
}

module.exports = {
    Genre,
    retrieveAllGenres,
    retrieveActiveGenres,
    findOneGenre,
    createOneGenre,
    updateOneGenre,
    removeOneGenre
};