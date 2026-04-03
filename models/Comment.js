const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    commentText: {
        type: String,
        trim: true,
        required: [true, 'Comment cannot be empty.'],
        minLength: [5, 'Comment must be at least 5 characters long.'],
        maxLength: [500, 'Comment must be at most 500 characters long.']
    },
    // reply
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', commentSchema);

function createComment(data) {
    const comment = new Comment(data);
    return comment.save();
}

function findCommentsByMovieId(movieId) {
    return Comment.find({ movieId: movieId }).populate('owner');
}

function findCommentById(commentId) {
    return Comment.findById(commentId);
}

function updateOneComment(commentId, updateData) {
    return Comment.findByIdAndUpdate(commentId, updateData, { new: true, runValidators: true });
}

function deleteOneComment(commentId) {
    return Comment.findByIdAndDelete(commentId);
}

module.exports = {
    Comment,
    createComment,
    findCommentsByMovieId,
    findCommentById,
    updateOneComment,
    deleteOneComment
};