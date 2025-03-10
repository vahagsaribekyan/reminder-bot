const Reminder = require('../models/reminder');

exports.createReminder = async (data) => {
  const { text, date, recurrence, priority, userId } = data;
  const reminder = await Reminder.create({ text, date, recurrence, priority, userId });
  return reminder;
};

exports.getReminders = async (userId) => {
  return await Reminder.findAll({ where: { userId, completed: false } });
};

exports.getCompletedReminders = async (userId) => {
  return await Reminder.findAll({ where: { userId, completed: true } });
};

exports.updateReminder = async (id, data) => {
  const reminder = await Reminder.findByPk(id);
  if (!reminder) throw new Error('Reminder not found');
  await reminder.update(data);
  return reminder;
};

exports.deleteReminder = async (id) => {
  const reminder = await Reminder.findByPk(id);
  if (!reminder) throw new Error('Reminder not found');
  await reminder.destroy();
};

exports.snoozeReminder = async (id, snoozeTime) => {
  const reminder = await Reminder.findByPk(id);
  if (!reminder) throw new Error('Reminder not found');
  const newDate = new Date(reminder.date.getTime() + snoozeTime * 60000); // snoozeTime in minutes
  await reminder.update({ date: newDate });
  return reminder;
};
