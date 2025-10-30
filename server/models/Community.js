const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    communityName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    
    event: { // Link back to the parent Event
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    
    allocatedBudget: { type: Number, default: 0 }, // Budget for this specific community
    
    head: { // Link to the User who is the head of this community
        type: Schema.Types.ObjectId,
        ref: 'User' 
    },
    
    members: [{ // List of Users who are members
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Expenses will be stored in their own collection, linking back to this community

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Community', communitySchema);
