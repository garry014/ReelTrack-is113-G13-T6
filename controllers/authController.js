const User = require('../models/User');



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
        // console.log('Session after login:', req.session);
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
    showLogin,
    processLogin,
    processLogout
};
