const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Schema for individual attendees ---
const attendeeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    rollOrEmpNumber: { type: String, trim: true }
});

// --- Expense schema with a new description field ---
const expenseSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: ['Travel', 'Stay', 'Food', 'Purchase', 'Other']
    },
    description: {
        type: String,
        trim: true
    },
    details: {
        type: Map,
        of: String
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// --- Main report schema with all the new fields ---
const reportSchema = new Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    organizationName: {
        type: String,
        required: true,
        trim: true
    },
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventVenue: { type: String, trim: true },
    eventDescription: { type: String, trim: true },
    numberOfDays: { type: Number, default: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
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
    allocatedAmount: {
        type: Number,
        default: 0
    },
    expenses: [expenseSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PersonalReport', reportSchema);

