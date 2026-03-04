const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const getCurrentUserId = (req) => req.query.user || req.session?.userId || 'testuser123';

router.get('/', async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const watchlist = await Watchlist.find({ owner: userId });
    res.render('watchlist/index', { watchlist });
  } catch (err) {
    res.status(500).send('Error fetching watchlist');
  }
});

router.get('/new', (req, res) => {
  res.render('watchlist/new');
});

router.post('/', async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const watchlistItem = new Watchlist({
      owner: userId,
      movieId: req.body.movieId,
      notes: req.body.notes
    });
    await watchlistItem.save();
    res.redirect('/watchlist');
  } catch (err) {
    res.status(400).render('watchlist/new', { error: 'Invalid data' });
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const item = await Watchlist.findOne({ _id: req.params.id, owner: userId });
    if (!item) return res.status(404).send('Not found');
    res.render('watchlist/edit', { item });
  } catch (err) {
    res.status(500).send('Error');
  }
});

router.post('/:id', async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    await Watchlist.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { status: req.body.status, notes: req.body.notes }
    );
    res.redirect('/watchlist');
  } catch (err) {
    res.status(400).send('Update failed');
  }
});

router.post('/:id/delete', async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    await Watchlist.findOneAndDelete({ _id: req.params.id, owner: userId });
    res.redirect('/watchlist');
  } catch (err) {
    res.status(500).send('Delete failed');
  }
});

module.exports = router;
