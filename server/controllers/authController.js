const User = require('../models/User');
// We don't need bcrypt here directly because the comparison method is on the User model

// --- Login User Function ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
        }

        // Compare submitted password with stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
        }

        // --- Login Successful ---
        // For now, we'll just send back user info (excluding password)
        // In a real app, you would generate a JWT (JSON Web Token) here
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
            // DO NOT send back the password
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// --- (Optional) Manual User Creation Function ---
// You mentioned manually creating users. This is a basic way an organizer might do it.
// In a real app, this would need protection so only admins/organizers can use it.
const createUserManually = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create new user (password will be hashed automatically by the pre-save hook)
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            phone,
            password // Pass the plain password, it gets hashed before saving
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email
        });

    } catch (error) {
        console.error("User creation error:", error);
        // Handle potential duplicate email error more gracefully if needed
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error creating user.' });
    }
};

const searchUsers = async (req, res) => {
    // Get the search query from the URL query parameters (e.g., /api/users/search?q=santhosh)
    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim().length < 2) { // Require at least 2 characters to search
        return res.status(400).json({ message: 'Search query must be at least 2 characters long.' });
    }

    try {
        // --- TODO: Add Authorization --- 
        // Only organizers should ideally be able to search all users?

        // Create a regex for case-insensitive partial matching
        const regex = new RegExp(searchQuery, 'i');

        // Search in name, email, or phone fields
        const users = await User.find({
            $or: [
                { name: regex },
                { email: regex },
                { phone: regex }
            ]
        }).select('name email phone _id'); // Only return necessary fields

        res.status(200).json(users);

    } catch (error) {
        console.error("Search Users Error:", error);
        res.status(500).json({ message: 'Server error searching users.' });
    }
};


module.exports = {
    loginUser,
    createUserManually, // Export the manual creation function too
    searchUsers
};
