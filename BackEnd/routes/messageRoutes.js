const express = require('express');
const router = express.Router();
const { getMessages, getConversations, getUnreadCounts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Routes temporarily unprotected for development
// TODO: Re-enable authentication in production
router.get('/', getMessages);
router.get('/conversations/:userId', getConversations);
router.get('/unread/:userId', getUnreadCounts);

module.exports = router;
