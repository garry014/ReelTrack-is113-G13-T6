const User = require('../models/User');

// ── Validation helpers ────────────────────────────────────────────────────────

const alphaOnly = (name) => /^[a-zA-Z\s]+$/.test(name);
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


// Validates name, email, and optionally password
// Pass `password: undefined` to skip password validation (e.g. profile edit)
// Returns an error string, or null if all fields are valid
function validateUserFields({ name, email, password } = {}) {
    if (!name || name.trim().length === 0) {
        return 'Please provide a name';
    }
    if (!alphaOnly(name)) {
        return 'Name must contain alphabets only.';
    }
    if (!email || email.trim().length === 0) {
        return 'Please provide an email';
    }
    if (!emailRegex.test(email)) {
        return 'Please fill in a valid email address';
    }
    if (password !== undefined) {
        if (!password) {
            return 'Please provide a password';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters.';
        }
    }
    return null;
}


// Validates a new password and its confirmation
// Returns an error string, or null if valid
function validateNewPassword(newPassword, confirmPassword) {
    if (newPassword.length < 8) {
        return 'New password must be at least 8 characters.';
    }
    if (newPassword !== confirmPassword) {
        return 'New passwords do not match.';
    }
    return null;
}

// ── Controllers ───────────────────────────────────────────────────────────────

const showRegister = (req, res) => {
    res.render('users/register');
};

const processRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const error = validateUserFields({ name, email, password });
        if (error) {
            return res.render('users/register', { name, email, messages: { error } });
        }

        await User.createUser({ name, email, passwordHash: password });

        req.session.messages = { success: 'Registration successful! Please login.' };
        res.redirect('/login');
    } catch (err) {
        const { name, email } = req.body;
        const errorMessage = err.code === 11000
            ? 'An account with that email already exists.'
            : err.message;
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

        // Validate name & email (skip password, handled separately below)
        const fieldError = validateUserFields({ name, email });
        if (fieldError) {
            return res.render('users/profile', { user, name, email, messages: { error: fieldError } });
        }

        const isCorrect = await user.correctPassword(currentPassword, user.passwordHash);
        if (!isCorrect) {
            return res.render('users/profile', { user, name, email, messages: { error: 'Current password is incorrect.' } });
        }

        user.name = name.trim() || user.name;
        user.email = email.trim() || user.email;

        if (newPassword) {
            const pwError = validateNewPassword(newPassword, confirmPassword);
            if (pwError) {
                return res.render('users/profile', { user, name, email, messages: { error: pwError } });
            }
            user.passwordHash = newPassword; // pre('save') hook will hash it
        }

        await User.saveUser(user);

        req.session.userName = user.name;
        req.session.messages = { success: 'Profile updated successfully!' };
        res.redirect('/user/profile');

    } catch (err) {
        const errorMessage = err.code === 11000
            ? 'That email is already in use.'
            : (err.message || 'Update failed.');
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
