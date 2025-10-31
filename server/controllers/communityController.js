const Community = require('../models/Community');
const Event = require('../models/Event');
const User = require('../models/User');

// --- Create a new Community within an Event ---
const createCommunity = async (req, res) => {
    // ... (This function stays the same as before)
    const { eventId } = req.params; 
    const { communityName, description, allocatedBudget, headUserId } = req.body;
    if (!communityName || !headUserId) {
        return res.status(400).json({ message: 'Community name and a designated Head User ID are required.' });
    }
    try {
        const parentEvent = await Event.findById(eventId);
        if (!parentEvent) {
            return res.status(404).json({ message: 'Parent event not found.' });
        }
        const headUser = await User.findById(headUserId);
        if (!headUser) {
            return res.status(404).json({ message: 'Designated head user not found.' });
        }
        const newCommunity = new Community({
            communityName,
            description,
            allocatedBudget: Number(allocatedBudget) || 0,
            event: eventId, 
            head: headUserId, 
            members: [headUserId]
        });
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

// +++ NEW: Function to get all communities a user is a member of +++
const getMemberCommunities = async (req, res) => {
    // We get the user's *email* from the URL query
    const { email } = req.params; 

    if (!email) {
        return res.status(400).json({ message: 'User email is required.' });
    }

    try {
        // Find the user by their email to get their ID
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find all communities where the 'members' array contains this user's ID
        // We also "populate" the 'event' field to get the event's name
        const communities = await Community.find({ members: user._id })
                                           .populate('event', 'eventName organizationName') // Fetches event name and org name
                                           .sort({ createdAt: -1 });

        res.status(200).json(communities);

    } catch (error) {
        console.error("Get Member Communities Error:", error);
        res.status(500).json({ message: 'Server error fetching communities.' });
    }
};
// +++ END OF NEW FUNCTION +++


module.exports = {
    createCommunity,
    getMemberCommunities // <<< Add the new function to exports
};

