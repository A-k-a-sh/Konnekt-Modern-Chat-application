const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Routes temporarily unprotected for development
// TODO: Re-enable authentication in production
router.get('/', getMessages);
router.get('/conversations/:userId', getConversations);

module.exports = router;
