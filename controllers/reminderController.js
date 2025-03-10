const reminderService = require('../services/reminderService');

exports.createReminder = async (req, res) => {
  try {
    const reminder = await reminderService.createReminder(req.body);
    res.status(201).send(reminder);
  } catch (error) {
    res.status(500).send({ error: 'Failed to create reminder' });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await reminderService.getReminders(req.params.userId);
    res.send(reminders);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get reminders' });
  }
};

// Implement other operations: update, delete, snooze, delay
