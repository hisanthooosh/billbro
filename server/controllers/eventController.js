const Event = require('../models/Event');
const User = require('../models/User'); // We need the User model to find the organizer
// --- UPDATED Create a new Event function ---
const createEvent = async (req, res) => {
    // Organizer's email is still required to link the creator
    const { organizerEmail, ...eventData } = req.body;

    // Basic check for required event name (add others if needed)
    if (!organizerEmail || !eventData.eventName || !eventData.numberOfDays || !eventData.startDate || !eventData.endDate) {
        return res.status(400).json({ message: 'Organizer email, Event Name, Number of Days, Start Date, and End Date are required.' });
    }

    try {
        // Find the organizer user
        const organizer = await User.findOne({ email: organizerEmail.toLowerCase() });
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer user not found.' });
        }

        // Create the new event object using ALL data from req.body
        // The eventData now includes eventTime, headName, headPhone, headDesignation
        const newEvent = new Event({
            ...eventData,
            organizer: organizer._id
        });

        // Save the event
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error("Create Event Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error creating event.' });
    }
};

// --- Get Event By ID function (stays the same) ---
const getEventById = async (req, res) => { /* ... existing code ... */ };


module.exports = {
    createEvent,
    getEventById
};
