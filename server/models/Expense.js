const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    
    community: { // Link to the Community this expense belongs to
        type: Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },

    addedBy: { // Link to the User who added this expense
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // We might add fields for bill image URLs later

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
