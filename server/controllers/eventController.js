// mr-billbro/server/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const Community = require('../models/Community'); // +++ IMPORT Community
const Expense = require('../models/Expense');     // +++ IMPORT Expense

// --- Create a new Event ---
const createEvent = async (req, res) => {
    // ... (This function stays the same as before)
    const { organizerEmail, ...eventData } = req.body; 
    if (!organizerEmail || !eventData.eventName || !eventData.numberOfDays || !eventData.startDate || !eventData.endDate) {
        return res.status(400).json({ message: 'Organizer email, Event Name, Number of Days, Start Date, and End Date are required.' });
    }
    try {
        console.log("--- 1. CREATE EVENT: Finding User ---");
        console.log("Searching for user with email:", organizerEmail);
        const organizer = await User.findOne({ email: organizerEmail.toLowerCase() });
        if (!organizer) {
            console.log("!!! CREATE EVENT FAILED: User not found.");
            return res.status(404).json({ message: 'Organizer user not found.' });
        }
        console.log("Found User ID:", organizer._id);
        const newEvent = new Event({ ...eventData, organizer: organizer._id });
        console.log("Attempting to save new event...");
        const savedEvent = await newEvent.save();
        console.log("--- 2. CREATE EVENT: Success! ---");
        console.log("Saved event with organizer ID:", savedEvent.organizer);
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("!!! CREATE EVENT ERROR:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error creating event.' });
    }
};

// --- Get a single Event by ID ---
const getEventById = async (req, res) => {
    // ... (This function stays the same as before)
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId).populate('organizer', 'name email'); 
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error("Get Event By ID Error:", error);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Event ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching event details.' });
    }
};

// --- Get Events for a specific Organizer ---
const getEventsByOrganizer = async (req, res) => {
    // ... (This function stays the same as before)
    const { email } = req.params; 
    if (!email) {
        return res.status(400).json({ message: 'User email is required.' });
    }
    try {
        console.log("--- 3. FETCH EVENTS: Finding User ---");
        console.log("Searching for user with email:", email);
        const organizer = await User.findOne({ email: email.toLowerCase() });
        if (!organizer) {
            console.log("!!! FETCH EVENTS FAILED: User not found.");
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log("Found User ID to search for:", organizer._id);
        console.log("Querying events with: { organizer:", organizer._id, "}");
        const events = await Event.find({ organizer: organizer._id })
                                  .sort({ createdAt: -1 }); 
        console.log(`--- 4. FETCH EVENTS: Query Complete. Found ${events.length} events. ---`);
        res.status(200).json(events);
    } catch (error) {
        console.error("!!! FETCH EVENTS ERROR:", error);
        res.status(500).json({ message: 'Server error fetching events.' });
    }
};

// +++ NEW: Function to Delete an Event +++
const deleteEvent = async (req, res) => {
    const { id: eventId } = req.params; // Get event ID from URL

    console.log(`--- DELETE EVENT: Attempting to delete event ${eventId} ---`);

    try {
        // --- TODO: Add Authorization check here ---
        // We should verify the user making this request is the event organizer
        
        // 1. Find all communities associated with this event
        const communities = await Community.find({ event: eventId });
        const communityIds = communities.map(c => c._id);
        console.log(`Found ${communityIds.length} communities to delete.`);

        // 2. Delete all expenses associated with these communities
        if (communityIds.length > 0) {
            const expenseDeleteResult = await Expense.deleteMany({ community: { $in: communityIds } });
            console.log(`Deleted ${expenseDeleteResult.deletedCount} expenses.`);
        }

        // 3. Delete all the communities
        const communityDeleteResult = await Community.deleteMany({ event: eventId });
        console.log(`Deleted ${communityDeleteResult.deletedCount} communities.`);

        // 4. Finally, delete the event itself
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            console.log("!!! DELETE EVENT FAILED: Event not found.");
            return res.status(404).json({ message: 'Event not found.' });
        }

        console.log(`--- DELETE EVENT: Success! Event ${eventId} deleted. ---`);
        res.status(200).json({ message: 'Event and all associated communities/expenses deleted successfully.' });

    } catch (error) {
        console.error("!!! DELETE EVENT ERROR:", error);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Event ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting event.' });
    }
};
// +++ END OF NEW FUNCTION +++

module.exports = {
    createEvent,
    getEventById,
    getEventsByOrganizer,
    deleteEvent // <<< Add the new function to exports
};