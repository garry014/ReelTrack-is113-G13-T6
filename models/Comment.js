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
        required: true,
        trim: true
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

function updateOneComment(commentId, updateData) {
    return Comment.findByIdAndUpdate(commentId, updateData, { new: true });
}

function deleteOneComment(commentId) {
    return Comment.findByIdAndDelete(commentId);
}

module.exports = { 
    Comment,
    updateOneComment, 
    deleteOneComment 
};