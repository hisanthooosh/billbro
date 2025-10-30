// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Placeholder Attendee schema (if needed at Event level)
const attendeeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    rollOrEmpNumber: { type: String, trim: true }
});

const eventSchema = new Schema({
    eventName: { type: String, required: true, trim: true },
    organizationName: { type: String, required: true, trim: true }, // Keeping Org Name
    eventVenue: { type: String, trim: true },
    eventDescription: { type: String, trim: true }, // For "Additional Description"
    numberOfDays: { type: Number, default: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
    
    // +++ NEW FIELDS FOR STEP 1 FORM +++
    eventTime: { type: String, trim: true }, // Optional time if 1 day
    headName: { type: String, trim: true }, // Head of the overall event
    headPhone: { type: String, trim: true },
    headDesignation: { type: String, trim: true },
    // +++ END NEW FIELDS +++

    totalAllocatedAmount: { type: Number, default: 0 }, // Overall budget

    organizer: { // User who created the event
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Attendee list details (as requested before)
    attendees: {
        total: { type: Number, default: 0 },
        girls: { type: Number, default: 0 },
        boys: { type: Number, default: 0 },
        list: [attendeeSchema] 
    },
    
    // Keeping mentor/permission fields distinct for now, maybe combine later if needed
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