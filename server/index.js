// Main entry point for our backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from a .env file

// --- Require Route Files ---
const reportRoutes = require('./routes/reports'); // Assuming this handles PersonalReports now
const authRoutes = require('./routes/auth'); // Routes for login/registration
const eventRoutes = require('./routes/events');
// Add requires for Event, Community, and Expense routes later when created

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies from requests

// A simple welcome route
app.get('/', (req, res) => {
    res.send('Welcome to the Mr. BillBro API!');
});

// --- API Routes ---
// Mount the different route handlers onto specific base paths
app.use('/api/reports', reportRoutes); // Routes for personal reports
app.use('/api/auth', authRoutes); // Routes for authentication (login/register)
app.use('/api/events', eventRoutes);
// Add app.use for Event, Community, and Expense routes later

// Connect to MongoDB and start the server
const startServer = async () => {
    try {
        // Connect using the URI from the .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB Atlas!');
        
        // Start listening for requests only after successful DB connection
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process if DB connection fails
    }
};

// Start the server initialization process
startServer();

