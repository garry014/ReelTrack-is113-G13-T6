const User = require('../models/User');

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

        const isCorrect = await user.correctPassword(currentPassword, user.passwordHash);
        if (!isCorrect) {
            req.session.messages = { error: 'Current password is incorrect.' };
            return res.redirect('/user/profile');
        }

        user.name = name.trim() || user.name;
        user.email = email.trim() || user.email;

        if (newPassword) {
            if (newPassword.length < 8) {
                req.session.messages = { error: 'New password must be at least 8 characters.' };
                return res.redirect('/user/profile');
            }
            if (newPassword !== confirmPassword) {
                req.session.messages = { error: 'New passwords do not match.' };
                return res.redirect('/user/profile');
            }
            user.passwordHash = newPassword; // pre('save') hook will hash it
        }

        await user.save();

        req.session.userName = user.name;
        req.session.messages = { success: 'Profile updated successfully!' };
        res.redirect('/user/profile');

    } catch (err) {
        if (err.code === 11000) {
            req.session.messages = { error: 'That email is already in use.' };
        } else {
            req.session.messages = { error: err.message || 'Update failed.' };
        }
        res.redirect('/user/profile');
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
            res.redirect('/register');
        });

    } catch (err) {
        req.session.messages = { error: 'Could not delete account. Try again.' };
        res.redirect('/user/profile');
    }
};

module.exports = {
    getUserProfile,
    editUserProfile,
    deleteUserProfile
};
