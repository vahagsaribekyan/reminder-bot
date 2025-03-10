const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

router.post('/', reminderController.createReminder);
router.get('/:userId', reminderController.getReminders);

// Define other routes: update, delete, snooze, delay

module.exports = router;
