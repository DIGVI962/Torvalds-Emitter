// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateToken } = require('../middleware/auth');

router.post('/signup', authController.handleSignup);
router.post('/callback', validateToken, authController.handleAuth0Login);
router.get('/profile', validateToken, authController.getProfile);
router.patch('/profile', validateToken, authController.updateProfile);

module.exports = router;
