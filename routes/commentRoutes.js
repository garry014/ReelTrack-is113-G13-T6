const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.post('/', isLoggedIn, commentController.addComment);
router.put('/:id', isLoggedIn, commentController.editComment);
router.delete('/:id', isLoggedIn, commentController.deleteComment);
router.get('/movie/:movieId',commentController.showMovieComment);
module.exports = router;

