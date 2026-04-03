const User = require('../models/User');

const showRegister = (req, res) => {
    res.render('users/register');
};

// Accepts alphabets and spaces only
const alphaOnly = (name) => {
    return /^[a-zA-Z\s]+$/.test(name);
}

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const processRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || name.trim().length === 0) {
            return res.render('users/register', { name, email, messages: { error: 'Please provide a name' } });
        }

        if (!alphaOnly(name)) {
            return res.render('users/register', { name, email, messages: { error: 'Name must contain alphabets only.' } });
        }

        if (!email || email.trim().length === 0) {
            return res.render('users/register', { name, email, messages: { error: 'Please provide an email' } });
        }

        if (!emailRegex.test(email)) {
            return res.render('users/register', { name, email, messages: { error: 'Please fill in a valid email address' } });
        }

        if (!password) {
            return res.render('users/register', { name, email, messages: { error: 'Please provide a password' } });
        }

        if (password.length < 8) {
            return res.render('users/register', { name, email, messages: { error: 'Password must be at least 8 characters.' } });
        }

        await User.createUser({ name, email, passwordHash: password });

        req.session.messages = { success: 'Registration successful! Please login.' };
        res.redirect('/login');
    } catch (err) {
        const { name, email } = req.body;
        let errorMessage = err.message;
        if (err.code === 11000) {
            errorMessage = 'An account with that email already exists.';
        }
        return res.render('users/register', { name, email, messages: { error: errorMessage } });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findUserById(req.session.userId);
        if (!user) {
            req.session.messages = { error: 'User not found.' };
            return res.redirect('/login');
        }
        res.render('users/profile', { user });
    } catch (err) {
        req.session.messages = { error: 'Could not load profile.' };
        res.redirect('/movies');
    }
};

const editUserProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, confirmPassword } = req.body;

        // '+passwordHash' required because of select: false in schema
        const user = await User.findUserByIdWithPassword(req.session.userId);

        if (!user) {
            req.session.messages = { error: 'User not found.' };
            return res.redirect('/login');
        }

        if (!name || name.trim().length === 0) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Please provide a name' } });
        }

        if (!alphaOnly(name)) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Name must contain alphabets only.' } });
        }

        if (!email || email.trim().length === 0) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Please provide an email' } });
        }

        if (!emailRegex.test(email)) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Please fill a valid email address' } });
        }

        const isCorrect = await user.correctPassword(currentPassword, user.passwordHash);
        if (!isCorrect) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Current password is incorrect.' } });
        }

        user.name = name.trim() || user.name;
        user.email = email.trim() || user.email;

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.render('users/profile', { user, name, email, messages: { error: 'New password must be at least 8 characters.' } });
            }
            if (newPassword !== confirmPassword) {
                return res.render('users/profile', { user, name, email, messages: { error: 'New passwords do not match.' } });
            }
            user.passwordHash = newPassword; // pre('save') hook will hash it
        }

        await user.save();

        req.session.userName = user.name;
        req.session.messages = { success: 'Profile updated successfully!' };
        res.redirect('/user/profile');

    } catch (err) {
        let errorMessage = err.message || 'Update failed.';
        if (err.code === 11000) {
            errorMessage = 'That email is already in use.';
        }
        const user = await User.findUserByIdWithPassword(req.session.userId);
        return res.render('users/profile', { user, name: req.body.name, email: req.body.email, messages: { error: errorMessage } });
    }
};

const deleteUserProfile = async (req, res) => {
    try {
        const { confirmPassword } = req.body;

        // '+passwordHash' required because of select: false in schema
        const user = await User.findUserByIdWithPassword(req.session.userId);

        if (!user) {
            req.session.messages = { error: 'User not found.' };
            return res.redirect('/login');
        }

        const isCorrect = await user.correctPassword(confirmPassword, user.passwordHash);
        if (!isCorrect) {
            req.session.messages = { error: 'Password incorrect. Account not deleted.' };
            return res.redirect('/user/profile');
        }

        await User.deleteUserById(req.session.userId);

        req.session.destroy(() => {
            res.redirect('/login');
        });

    } catch (err) {
        req.session.messages = { error: 'Could not delete account. Try again.' };
        res.redirect('/user/profile');
    }
};

module.exports = {
    showRegister,
    processRegister,
    getUserProfile,
    editUserProfile,
    deleteUserProfile
};
