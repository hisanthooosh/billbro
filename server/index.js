// Main entry point for our backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Require All Route Files
const reportRoutes = require('./routes/reports'); // For Personal Reports
const authRoutes = require('./routes/auth');     // For User Login/Signup
// +++ ADD THESE TWO LINES +++
const eventRoutes = require('./routes/events');
const communityBaseRoutes = require('./routes/communityBaseRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Welcome Route
app.get('/', (req, res) => {
    res.send('Welcome to the BillBro API!');
});

// API Routes
app.use('/api/reports', reportRoutes); // Handles /api/reports/...
app.use('/api/auth', authRoutes);     // Handles /api/auth/...
// +++ ADD THESE TWO LINES +++
app.use('/api/events', eventRoutes);
app.use('/api/communities', communityBaseRoutes);

// Connect to MongoDB and start the server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB Atlas!');
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); 
    }
};

startServer();