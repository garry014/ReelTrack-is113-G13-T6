const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const { isLoggedIn } = require('../middleware/authMiddleware');

// Profile GET
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const myItems = await Item.find({ owner: req.session.userId });
        res.render('profile', { user, items: myItems });
    } catch (err) {
        res.render('error', { message: 'Error loading profile' });
    }
});

module.exports = router;
