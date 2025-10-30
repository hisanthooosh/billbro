const express = require('express');
const router = express.Router();

const { createEvent, getEventById } = require('../controllers/eventController');
const communityRoutes = require('./community'); 

// POST /api/events/
router.post('/', createEvent);

// GET /api/events/:id 
router.get('/:id', getEventById); 

// Connect /api/events/:eventId/communities to the communityRoutes file
router.use('/:eventId/communities', communityRoutes); 

module.exports = router;