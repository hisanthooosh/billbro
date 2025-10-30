const Community = require('../models/Community');
const Event = require('../models/Event'); // Need Event model to validate event existence
const User = require('../models/User'); // Need User model to validate head user existence

// --- Create a new Community within an Event ---
const createCommunity = async (req, res) => {
    const { eventId } = req.params; // Get the parent Event ID from the URL
    // Get community details + the ID of the user designated as Head
    const { communityName, description, allocatedBudget, headUserId } = req.body;

    if (!communityName || !headUserId) {
        return res.status(400).json({ message: 'Community name and head user ID are required.' });
    }

    try {
        // 1. Check if the parent Event exists
        const parentEvent = await Event.findById(eventId);
        if (!parentEvent) {
            return res.status(404).json({ message: 'Parent event not found.' });
        }

        // 2. Check if the designated Head User exists
        const headUser = await User.findById(headUserId);
        if (!headUser) {
            return res.status(404).json({ message: 'Designated head user not found.' });
        }
        
        // --- TODO: Add Authorization Check ---
        // Verify that the user making the request is the organizer of the parentEvent?

        // 3. Create the new Community
        const newCommunity = new Community({
            communityName,
            description,
            allocatedBudget: Number(allocatedBudget) || 0,
            event: eventId, // Link to the parent event
            head: headUserId, // Link to the head user
            members: [headUserId] // Automatically add the head as the first member
        });

        // 4. Save the community
        const savedCommunity = await newCommunity.save();

        res.status(201).json(savedCommunity);

    } catch (error) {
        console.error("Create Community Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Event ID or User ID format.' });
        }
        res.status(500).json({ message: 'Server error creating community.' });
    }
};

// --- We'll add functions later for: ---
// Getting communities for an event
// Adding members to a community
// Getting a specific community's details

module.exports = {
    createCommunity
};
