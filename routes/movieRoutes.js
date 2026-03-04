const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { isLoggedIn, isOwner } = require('../middleware/authMiddleware');

// Index - Read all
router.get('/', movieController.showAllMovies);

router.get('/movie', (req, res) => {
    res.render('items/movie')
})

// New - Show form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('movies/new');
});

// // Create - Save to DB
// router.post('/', isLoggedIn, async (req, res) => {
//     try {
//         const item = new Item({
//             ...req.body,
//             owner: req.session.userId
//         });
//         await item.save();
//         req.flash('success', 'Item created successfully!');
//         res.redirect('/items');
//     } catch (err) {
//         req.flash('error', err.message);
//         res.redirect('/items/new');
//     }
// });

// // Show - Read one
// router.get('/:id', async (req, res) => {
//     try {
//         const item = await Item.findById(req.params.id).populate('owner');
//         if (!item) return res.render('error', { message: 'Item not found' });
//         res.render('items/show', { item });
//     } catch (err) {
//         res.render('error', { message: 'Invalid Item ID' });
//     }
// });

// // Edit - Show form
// router.get('/:id/edit', isLoggedIn, async (req, res, next) => {
//     await isOwner(req, res, next, Item);
// }, async (req, res) => {
//     const item = await Item.findById(req.params.id);
//     res.render('items/edit', { item });
// });

// // Update - Save changes
// router.put('/:id', isLoggedIn, async (req, res, next) => {
//     await isOwner(req, res, next, Item);
// }, async (req, res) => {
//     try {
//         await Item.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
//         req.flash('success', 'Item updated successfully!');
//         res.redirect(`/items/${req.params.id}`);
//     } catch (err) {
//         req.flash('error', err.message);
//         res.redirect(`/items/${req.params.id}/edit`);
//     }
// });

// // Delete
// router.delete('/:id', isLoggedIn, async (req, res, next) => {
//     await isOwner(req, res, next, Item);
// }, async (req, res) => {
//     await Item.findByIdAndDelete(req.params.id);
//     req.flash('success', 'Item deleted successfully');
//     res.redirect('/items');
// });

module.exports = router;
