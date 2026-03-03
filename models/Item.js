const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'An item must have a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'An item must have a description']
    },
    category: {
        type: String,
        required: [true, 'An item must have a category'],
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'An item must have a price'],
        min: [0, 'Price must be positive']
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'An item must belong to a user']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
