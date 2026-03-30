const User = require('../models/User');

const showRegister = (req, res) => {
    res.render('auth/register');
};

const processRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!password || password.length < 8) {
            req.session.messages = { error: 'Password must be at least 8 characters.' };
            return res.redirect('/register');
        }

        await User.createUser({ name, email, passwordHash: password });
        
        req.session.messages = { success: 'Registration successful! Please login.' };
        res.redirect('/login');
    } catch (err) {
        if (err.code === 11000) {
            req.session.messages = { error: 'An account with that email already exists.' };
        } else {
            req.session.messages = { error: err.message };
        }
        res.redirect('/register');
    }
};

const showLogin = (req, res) => {
    res.render('auth/login');
};

const processLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findUserByEmailWithPassword(email);

        if (!user || !(await user.correctPassword(password, user.passwordHash))) {
            req.session.messages = { error: 'Invalid email or password' };
            return res.redirect('/login');
        }
        req.session.userId = user._id;
        req.session.userName = user.name;
        console.log('Session after login:', req.session);
        req.session.messages = { success: `Welcome back, ${user.name}!` };
        res.redirect('/movies');
    } catch (err) {
        req.session.messages = { error: 'Something went wrong' };
        res.redirect('/login');
    }
};

const processLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

module.exports = {
    showRegister,
    processRegister,
    showLogin,
    processLogin,
    processLogout
};
