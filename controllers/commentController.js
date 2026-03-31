const { Comment, updateOneComment, deleteOneComment } = require('../models/Comment');
const Movie  = require('../models/Movie');

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
        console.error('Comment error:', error);
        
        // Save form data to session to persist text after redirect
        req.session.formData = {
            commentText: req.body.commentText,
            parentCommentId: req.body.parentCommentId
        };
        
        req.session.messages = { error: error.message };
        res.redirect(`/comments/movie/${req.body.movieId}`);
    }
}
// read Comment
async function showMovieComment(req, res) {
    try {
        const movieId = req.params.movieId;
        
        const movie = await Movie.findOneMovie(movieId);
        
        const comments = await Comment.find({ movieId: movieId }).populate('owner');
        
        const formData = req.session.formData || {};
        delete req.session.formData; // Clear it after retrieving

        res.render('comments/index', {
            MOVIE: movie,
            MOVIE_ID: movie._id,
            comments: comments,
            formData: formData
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

        const updatedComment = await updateOneComment(commentId, { commentText: req.body.commentText });

        req.session.messages = {success : 'Comment updated successfully!'};
        res.redirect(`/comments/movie/${updatedComment.movieId}`);
    } catch (error) {
        console.error('Edit comment error:', error);
        
        // Save form data to session to persist text
        req.session.formData = {
            editCommentId: req.params.id,
            commentText: req.body.commentText
        };
        
        req.session.messages = { error: error.message };
        res.redirect(req.get('Referer') || `/comments/movie/${req.body.movieId}`);
    }
} 

// delete Comment
async function deleteComment(req,res) {
    try{
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);

        if(!comment) {
            req.session.messages = {error:'Comment not found.'};
            return res.redirect('back');
        }
        if (comment.owner.toString() !== req.session.userId){
            req.session.messages = {error : 'You are not authorized to edit this comment.'};
            return res.redirect(`/comments/movie/${comment.movieId}`);
        }

        await deleteOneComment(req.params.id);

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