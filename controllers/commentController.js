const Comment = require("../models/Comment");
const Movie = require('../models/Movie');

// create Comment
async function addComment(req, res) {
    try {
        const comment = new Comment ({
            owner : req.session.userId,
            movieId : req.body.movieId,
            commentText : req.body.commentText,
            parentCommentId : req.body.parentCommentId || null
        });
        await comment.save();

        req.session.messages = {success : "Comment added successfuly!"};
        res.redirect(`/comments/movie/${req.body.movieId}`);
    } catch (error) {
        console.error(error);
        req.session.messages = {error: error.message};
        res.redirect(`/comments/movie/${req.body.movieId}`);
    }
}
// read Comment
async function showMovieComment(req, res) {
    try {
        const movieId = req.params.movieId;
        
        const movie = await Movie.findById(movieId);
        
        const comments = await Comment.find({ movieId: movieId }).populate('owner');
        
        res.render('comments/index', {
            MOVIE: movie,
            MOVIE_ID: movie._id,
            comments: comments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// update Comment
async function editComment(req, res) {
    try{
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            req.session.messages = { error : 'Comment not found.'};
            return res.redirect('back');
        }
        if (comment.owner.toString() !== req.session.userId){
            req.session.messages = {error : 'You are not authorized to edit this comment.'};
            return res.redirect(`/comments/movie/${comment.movieId}`);
        }

        comment.commentText = req.body.commentText;
        await comment.save();

        req.session.messages = {success : 'Comment updated successfully!'};
        res.redirect(`/comments/movie/${comment.movieId}`);
    } catch (error) {
        console.error(error);
        req.session.messages = {error : error.message};
        res.redirect('back');
    }
}

// delete Comment
async function deleteComment(req,res) {
    try{
        const commentId = req.params.id;
        const comment = awaitComment.findById(commentId);

        if(!comment) {
            req.session.messages = {error:'Comment not found.'};
            return res.redirect('back');
        }
        if (comment.owner.toString() !== req.session.userId){
            req.session.messages = {error : 'You are not authorized to edit this comment.'};
            return res.redirect(`/comments/movie/${comment.movieId}`);
        }

        await Comment.findByIdAndDelete(commentId);

        req.session.messages = {success : 'Comment deleted successfully!'};
        res.redirect(`/comments/movie/${comment.movieId}`);
    } catch (error) {
        console.error(error);
        req.session.messages = {error : error.message};
        res.redirect('back');
    }
}

module.exports = {
    addComment,
    editComment,
    deleteComment,
    showMovieComment
};