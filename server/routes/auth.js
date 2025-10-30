const express = require('express');
const router = express.Router();
const { loginUser, createUserManually,searchUsers } = require('../controllers/authController');

// --- Login Route ---
// POST /api/auth/login
router.post('/login', loginUser);

// --- (Optional) Manual User Creation Route ---
// POST /api/auth/register (or /create-user)
// Add protection later (e.g., check if the requester is an admin/organizer)
router.post('/register', createUserManually);
router.get('/search', searchUsers);

module.exports = router;
