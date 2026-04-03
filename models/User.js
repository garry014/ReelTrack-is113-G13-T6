const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false  // Never returned in queries unless explicitly requested
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
User.createUser = (data) => {
    const user = new User(data);
    return User.saveUser(user);
};

User.findUserById = (id) => {
    return User.findById(id);
};

User.findUserByIdWithPassword = (id) => {
    return User.findById(id).select('+passwordHash');
};

User.findUserByEmailWithPassword = (email) => {
    return User.findOne({ email }).select('+passwordHash');
};

User.saveUser = (user) => {
    return user.save();
};

User.deleteUserById = (id) => {
    return User.findByIdAndDelete(id);
};

module.exports = User;