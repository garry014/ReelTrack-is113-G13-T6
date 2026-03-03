const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const server = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Settings
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Middleware
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(session({
    secret: process.env.SESSION_SECRET || 'top-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));
server.use(flash());

// Global variables middleware
server.use(async (req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.currentUser = null;
    if (req.session.userId) {
        const User = require('./models/User');
        res.locals.currentUser = await User.findById(req.session.userId);
    }
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

server.use('/', authRoutes);
server.use('/items', itemRoutes);
server.use('/', userRoutes);

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
server.use((req, res) => {
    res.status(404).render('error', { message: 'Page Not Found' });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = server;
