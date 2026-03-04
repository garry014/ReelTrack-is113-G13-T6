const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const { isLoggedIn } = require('../middleware/authMiddleware');

// Profile GET
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const myMovies = await Movie.find({ owner: req.session.userId });
        res.render('profile', { user, items: myMovies });
    } catch (err) {
        res.render('error', { message: 'Error loading profile' });
    }
});

module.exports = router;
