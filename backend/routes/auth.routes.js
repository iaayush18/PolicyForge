/**
 * routes/auth.routes.js
 */
const express = require('express');
const router = express.Router();
const { loginUser, verifyUser } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// POST /api/auth/login - Public
router.post('/login', loginUser);

// GET /api/auth/verify - Private (Requires Token)
router.get('/verify', authMiddleware, verifyUser);

module.exports = router;