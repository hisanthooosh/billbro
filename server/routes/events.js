// mr-billbro/server/routes/events.js

const express = require('express');
const router = express.Router();

// --- IMPORT ALL CONTROLLER FUNCTIONS ---
const { 
    createEvent, 
    getEventById,
    getEventsByOrganizer,
    deleteEvent // <<< Import the new delete function
} = require('../controllers/eventController');
// --- END IMPORT ---

const communityRoutes = require('./community'); 

// --- Define Event-Specific Routes ---

// POST /api/events/
router.post('/', createEvent);

// GET /api/events/:id 
router.get('/:id', getEventById); 

// GET /api/events/organizer/:email
router.get('/organizer/:email', getEventsByOrganizer);

// +++ ADD DELETE ROUTE +++
// DELETE /api/events/:id
router.delete('/:id', deleteEvent);
// +++ END ADD +++


// --- Use Community Routes ---
router.use('/:eventId/communities', communityRoutes); 

module.exports = router;