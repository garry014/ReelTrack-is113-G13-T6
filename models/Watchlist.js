const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true},
  movieId: {type: String, required: true},
  status: {type: String, enum: ['want-to-watch', 'watching', 'watched'], 
    default: 'want-to-watch', required: true},
  addedAt: {type: Date, default: Date.now },
  notes: {type: String, maxlength: 500}
});

watchlistSchema.index({ owner: 1, movieId: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
