const express = require('express');
// mergeParams: true is CRITICAL for getting :eventId from the parent router
const router = express.Router({ mergeParams: true }); 

const { createCommunity } = require('../controllers/communityController');

// Handles POST /api/events/:eventId/communities/
router.post('/', createCommunity);

module.exports = router;