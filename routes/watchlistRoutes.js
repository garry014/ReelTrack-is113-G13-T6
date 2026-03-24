const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');


router.get('/', watchlistController.list);
router.get('/new', watchlistController.showNew);
router.get('/search', watchlistController.search);
router.get('/check', watchlistController.checkInWatchlist);
router.post('/', watchlistController.create);
router.get('/:id/edit', watchlistController.showEdit);
router.post('/:id', watchlistController.update);
router.post('/:id/delete', watchlistController.remove);

module.exports = router;
