const Event = require('../models/Event');
const User = require('../models/User'); // We need the User model to find the organizer

// --- Create a new Event ---
const createEvent = async (req, res) => {
    // Get event details AND organizer's email from the request body
    const { organizerEmail, ...eventData } = req.body;

    if (!organizerEmail) {
        return res.status(400).json({ message: 'Organizer email is required.' });
    }

    try {
        // Find the user who is creating the event by their email
        const organizer = await User.findOne({ email: organizerEmail.toLowerCase() });
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer user not found.' });
        }

        // Create a new event object, including the organizer's ID
        const newEvent = new Event({
            ...eventData, // Spread the rest of the event details (name, date, budget, etc.)
            organizer: organizer._id // Link the event to the organizer's User ID
        });

        // Save the event to the database
        const savedEvent = await newEvent.save();

        // Send the newly created event back to the client
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error("Create Event Error:", error);
        // Handle potential validation errors from the Event model
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error creating event.' });
    }
};

const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        // Find the event and populate the organizer's name and email
        // We might want to populate community heads/members later too
        const event = await Event.findById(eventId).populate('organizer', 'name email'); 

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        // --- TODO: Add Authorization Check ---
        // Ensure the requesting user is the organizer or a member/head? 
        // For now, allow any logged-in user to fetch if they have the ID.

        res.status(200).json(event);

    } catch (error) {
        console.error("Get Event By ID Error:", error);
        // Handle invalid ID format error
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Event ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching event details.' });
    }
};
// +++ END ADDED FUNCTION +++

// --- Get Events for a specific Organizer --- (We'll add this later)
// const getEventsByOrganizer = async (req, res) => { ... };

// --- Get a single Event by ID --- (We'll add this later)
// const getEventById = async (req, res) => { ... };


module.exports = {
    createEvent,
    getEventById
    // Export other functions as we create them
};
