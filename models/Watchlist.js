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

module.exports = mongoose.model('Watchlist', watchlistSchema);

