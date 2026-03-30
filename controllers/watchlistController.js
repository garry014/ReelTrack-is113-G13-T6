const {
  retrieveUserWatchlist,
  checkWatchlistExists,
  createWatchlistItem,
  findOneWatchlistItem,
  updateOneWatchlistItem,
  removeOneWatchlistItem
} = require('../models/Watchlist');
const { retrieveAllMovies, findOneMovie } = require('../models/Movie');

const getCurrentUserId = (req) => {
  if (!req.session?.userId) {
    throw new Error('Must be logged in to access watchlist');
  }
  return req.session.userId;
};

async function list(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const watchlist = await retrieveUserWatchlist(userId);
    res.render('watchlist/list', { watchlist });
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message);
  }
};

async function showNew(req, res) {
  res.render('watchlist/new', { error: null })
};

async function create(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!req.body.movieId || req.body.movieId.trim() === '') {
      return res.status(400).render('watchlist/new', { error: 'Please select a movie from the suggestions list.' });
    }

    if (req.body.note && req.body.note.length > 500) {
      return res.status(400).render('watchlist/new', { error: 'Notes cannot exceed 500 characters.' });
    }

    const movie = await findOneMovie(req.body.movieId);

    if (!movie) {
      const safeBack = req.get('Referer') || `/movies`;
      return res.redirect(safeBack);
    }

    const exists = await checkWatchlistExists(req.body.movieId, req.session.userId);

    if (exists) {
      req.session.messages = { error: `${movie.title} is already in your watchlist!` };
      const safeBack = req.get('Referer') || `/movies/${movie._id}`;
      return res.redirect(safeBack);
    }

    const watchlistItem = await createWatchlistItem(userId, movie._id, movie.title, req.body.note);
    req.session.messages = { success: `${watchlistItem.movieTitle} added!` };
    res.redirect('/watchlist');
  } catch (err) {
    console.error('Watchlist Error:', err);
    res.status(400).render('watchlist/new', { error: 'Could not add to watchlist. Please try again.' });
  }
};

async function search(req, res) {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json([]);

    const allMovies = await retrieveAllMovies();
    const filtered = allMovies
      .filter(movie => movie.title.match(new RegExp(query, 'i')))
      .slice(0, 5)
      .map(movie => ({ _id: movie._id, title: movie.title, director: movie.director, releaseYear: movie.releaseYear, genre: movie.genre }));

    res.json(filtered);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json([]);
  }
};

async function showEdit(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const item = await findOneWatchlistItem( req.params.id, userId );
    if (!item) return res.status(404).send('Not found');
    res.render('watchlist/update', { item });
  } catch (err) {
    res.status(500).send('Error');
  }
};

async function checkInWatchlist(req, res) {
  try {
    if (!req.query.movieId) return res.json({ inWatchlist: false });
    const exists = await checkWatchlistExists(req.query.movieId, req.session.userId);
    res.json({ inWatchlist: !!exists });
  } catch (err) {
    res.json({ inWatchlist: false });
  }
};

async function update(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const validStatus = ['want-to-watch', 'watching', 'watched'];
    if (!req.body.status || !validStatus.includes(req.body.status)) {
      return res.status(400).send('Invalid status');
    }

    if (req.body.note && req.body.note.length > 500) {
      return res.status(400).send('Note cannot exceed 500 characters');
    }

    await updateOneWatchlistItem(req.params.id, userId, req.body.status, req.body.note);
    res.redirect('/watchlist');
  } catch (err) {
    res.status(400).send('Update failed');
  }
};

async function remove(req, res) {
  try {
    const userId = getCurrentUserId(req);
    await removeOneWatchlistItem(req.params.id, userId);
    res.redirect('/watchlist');
  } catch (err) {
    res.status(500).send('Delete failed');
  }
};

module.exports = { list, showNew, create, search, showEdit, checkInWatchlist, update, remove };