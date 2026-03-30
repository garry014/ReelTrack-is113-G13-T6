const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: [true, 'Watchlist must have an owner']},

  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true},
  
  movieTitle: {
    type: String,
    required: true},

  status: {
    type: String,
    enum: ['want-to-watch', 'watching', 'watched'],
    default: 'want-to-watch'},

  addedAt: {
    type: Date,
    default: Date.now},
    
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']}
}, {timestamps: true 
});


//each user can only add a movie to watchlist once
watchlistSchema.index({ owner: 1, movieId: 1 }, { unique: true });
const Watchlist = mongoose.model('Watchlist', watchlistSchema);

function retrieveUserWatchlist(userId) {
  return Watchlist.find({ owner: userId }).populate('movieId').populate('owner', 'name');
}

function checkWatchlistExists(movieId, userId) {
  return Watchlist.exists({
    movieId: movieId,
    owner: userId
  });
}

function createWatchlistItem(userId, movieId, movieTitle, notes) {
  const watchlistItem = new Watchlist({
    owner: userId,
    movieId: movieId,
    movieTitle: movieTitle,
    notes: notes || '',
    status: 'want-to-watch'
  });
  return watchlistItem.save();
}

function findOneWatchlistItem(itemId, userId) {
  return Watchlist.findOne({ _id: itemId, owner: userId });
}

function updateOneWatchlistItem(itemId, userId, status, notes) {
  return Watchlist.findOneAndUpdate(
    { _id: itemId, owner: userId },
    { status: status, notes: notes }
  );
}

function removeOneWatchlistItem(itemId, userId) {
  return Watchlist.findOneAndDelete({ _id: itemId, owner: userId });
}

module.exports = {
  retrieveUserWatchlist,
  checkWatchlistExists,
  createWatchlistItem,
  findOneWatchlistItem,
  updateOneWatchlistItem,
  removeOneWatchlistItem
};



