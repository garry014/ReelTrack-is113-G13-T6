const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.post('/', isLoggedIn, commentController.addComment);
router.post('/:id/edit', commentController.editComment);
router.post('/:id/delete', commentController.deleteComment);
router.get('/movie/:movieId',commentController.showMovieComment);
module.exports = router;

