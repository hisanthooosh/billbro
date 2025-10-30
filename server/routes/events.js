const express = require('express');
const router = express.Router();

// Import the controller function we just created
const { createEvent ,getEventById} = require('../controllers/eventController');

// Define the route for creating a new event
// POST /api/events/
router.post('/', createEvent);

// --- We will add routes for getting events later ---
// GET /api/events/organizer/:userId 
// GET /api/events/:id
router.get('/:id', getEventById);

module.exports = router;
