const express = require('express');
const router = express.Router();
const { createGroup, getGroupById, updateGroup, deleteGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Public routes (until full auth is implemented)
router.post('/', createGroup);
router.get('/:groupId', getGroupById);
router.put('/:groupId', updateGroup);
router.delete('/:groupId', deleteGroup);

module.exports = router;
