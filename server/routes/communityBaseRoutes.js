// mr-billbro/server/routes/communityBaseRoutes.js

const express = require('express');
const router = express.Router();

// Import the controller function
const { getMemberCommunities } = require('../controllers/communityController');

// --- Define Route to Get All Communities a User is a Member Of ---
// This will handle GET requests to /api/communities/member-of/:email
router.get('/member-of/:email', getMemberCommunities);

module.exports = router;