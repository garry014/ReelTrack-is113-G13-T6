const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { isLoggedIn } = require('../middleware/authMiddleware');


router.get('/', isLoggedIn, watchlistController.list);
router.get('/new', isLoggedIn, watchlistController.showNew);
router.get('/search', isLoggedIn, watchlistController.search);
router.get('/check', isLoggedIn, watchlistController.checkInWatchlist);
router.post('/', isLoggedIn,watchlistController.create);
router.get('/:id/edit', isLoggedIn, watchlistController.showEdit);
router.post('/:id', isLoggedIn, watchlistController.update);
router.post('/:id/delete', isLoggedIn, watchlistController.remove);

module.exports = router;
