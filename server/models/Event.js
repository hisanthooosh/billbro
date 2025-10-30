const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reference Attendee and Permission schemas potentially from Report.js if kept separate
// Or define them here if Report.js is removed/refactored

// Placeholder for Attendee structure (can refine later)
const attendeeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    rollOrEmpNumber: { type: String, trim: true }
});


const eventSchema = new Schema({
    eventName: { type: String, required: true, trim: true },
    organizationName: { type: String, required: true, trim: true },
    eventVenue: { type: String, trim: true },
    eventDescription: { type: String, trim: true },
    numberOfDays: { type: Number, default: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
    
    totalAllocatedAmount: { type: Number, default: 0 }, // Overall budget for the event

    organizer: { // Link to the User who created the event
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Communities will be stored in their own collection, linking back to this event
    // We don't embed communities directly here to keep the Event document smaller

    // Keep attendee/mentor/permission info at the Event level as requested
     attendees: {
        total: { type: Number, default: 0 },
        girls: { type: Number, default: 0 },
        boys: { type: Number, default: 0 },
        list: [attendeeSchema] 
    },
    mentor: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        rollOrEmpNumber: { type: String, trim: true }
    },
    permissionFrom: {
        name: { type: String, trim: true },
        designation: { type: String, trim: true },
        phone: { type: String, trim: true }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
