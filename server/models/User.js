const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: { // Using email as the primary unique identifier
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: { // Optional phone number
        type: String,
        trim: true
    },
    password: { // We will store the hashed password here
        type: String,
        required: true
    },
    // We might add roles later (e.g., 'organizer', 'member')
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Password Hashing Middleware ---
// Before saving a new user or updating a password, hash it
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// --- Method to compare passwords ---
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
