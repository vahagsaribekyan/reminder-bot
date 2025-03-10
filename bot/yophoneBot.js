const axios = require('axios');
const config = require('../config/config');
const reminderService = require('../services/reminderService');
const { parseDate, parseTime, parseRecurrence } = require('./utils');
const { format } = require('date-fns');

const { YOAI_API_KEY, BASE_URL, POLLING_INTERVAL, OPENAI_API_KEY } = config;

const headers = {
  'Content-Type': 'application/json',
  'X-YoAI-API-Key': YOAI_API_KEY
};

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const sendMessage = async (to, text) => {
  try {
    const response = await axios.post(`${BASE_URL}/sendMessage`, { to, text }, { headers });
    console.log('Message sent:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const setCommands = async () => {
  const commands = [
    { command: 'start', description: 'Starts the bot' },
    { command: 'help', description: 'Shows available commands' },
    { command: 'hi', description: 'Greets the user' }
  ];

  try {
    const response = await axios.post(`${BASE_URL}/setCommands`, { commands }, { headers });
    console.log('Commands set:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error setting commands:', error);
  }
};

const parseCommand = async (command) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or another model like 'gpt-4'
      messages: [{ role: 'user', content: command }],
      max_tokens: 100,
      temperature: 0.5
    });
    return JSON.parse(response.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error parsing command:', error);
    return null;
  }
};

const handleSetReminder = async (parsedCommand, chatId) => {
  const { text, date, time, recurrence, priority } = parsedCommand;
  const dateTime = parseTime(time, parseDate(date));
  const reminderData = {
    text,
    date: dateTime,
    recurrence: parseRecurrence(recurrence),
    priority: priority || 'low',
    userId: chatId
  };

  try {
    const reminder = await reminderService.createReminder(reminderData);
    await sendMessage(chatId, `Reminder created: ${reminder.text} on ${format(reminder.date, 'yyyy-MM-dd HH:mm')} with recurrence: ${reminder.recurrence} and priority: ${reminder.priority}`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to create reminder. Please check the format and try again.');
  }
};

const handleViewReminders = async (chatId) => {
  try {
    const reminders = await reminderService.getReminders(chatId);
    const reminderTexts = reminders.map(reminder => `${reminder.id}: ${reminder.text} at ${format(reminder.date, 'yyyy-MM-dd HH:mm')}`).join('\n');
    await sendMessage(chatId, `Your reminders:\n${reminderTexts}`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to get reminders.');
  }
};

const handleUpdateReminder = async (parsedCommand, chatId) => {
  const { id, text, date, time, recurrence, priority } = parsedCommand;
  const dateTime = parseTime(time, parseDate(date));
  const reminderData = {
    text,
    date: dateTime,
    recurrence: parseRecurrence(recurrence),
    priority: priority || 'low'
  };

  try {
    const reminder = await reminderService.updateReminder(id, reminderData);
    await sendMessage(chatId, `Reminder updated: ${reminder.text} on ${format(reminder.date, 'yyyy-MM-dd HH:mm')} with recurrence: ${reminder.recurrence} and priority: ${reminder.priority}`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to update reminder. Please check the format and try again.');
  }
};

const handleDeleteReminder = async (parsedCommand, chatId) => {
  const { id } = parsedCommand;

  try {
    await reminderService.deleteReminder(id);
    await sendMessage(chatId, `Reminder deleted.`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to delete reminder.');
  }
};

const handleSnoozeReminder = async (parsedCommand, chatId) => {
  const { id, snoozeTime } = parsedCommand;

  try {
    const reminder = await reminderService.snoozeReminder(id, snoozeTime);
    await sendMessage(chatId, `Reminder snoozed to: ${format(reminder.date, 'yyyy-MM-dd HH:mm')}`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to snooze reminder.');
  }
};

const handleViewHistory = async (chatId) => {
  try {
    const reminders = await reminderService.getCompletedReminders(chatId);
    const reminderTexts = reminders.map(reminder => `${reminder.id}: ${reminder.text} completed at ${format(reminder.date, 'yyyy-MM-dd HH:mm')}`).join('\n');
    await sendMessage(chatId, `Your completed reminders:\n${reminderTexts}`);
  } catch (error) {
    await sendMessage(chatId, 'Failed to get completed reminders.');
  }
};

const handleHelp = async (chatId) => {
  const helpMessage = `
Welcome to the Reminder Bot! Here’s how you can manage your reminders:

1. Set Reminder:
Command: set reminder <text>, <date>, <time>, <recurrence>, <priority>
Example: set reminder Buy groceries, 2023-10-15, 10:00, daily, high
Description: Creates a new reminder with specified details. If date or time is missing, defaults will be used.

2. View Reminders:
Command: view reminders
Example: view reminders
Description: Lists all your active reminders.

3. Update Reminder:
Command: update reminder <id> <text>, <date>, <time>, <recurrence>, <priority>
Example: update reminder 1 Buy groceries, 2023-10-16, 11:00, weekly, medium
Description: Updates the reminder with the specified ID.

4. Delete Reminder:
Command: delete reminder <id>
Example: delete reminder 1
Description: Deletes the reminder with the specified ID.

5. Snooze Reminder:
Command: snooze reminder <id> <minutes>
Example: snooze reminder 1 10
Description: Snoozes the reminder for the specified number of minutes.

6. View History:
Command: view history
Example: view history
Description: Lists all your completed reminders.

7. Start:
Command: start
Example: start
Description: Starts the bot and provides a greeting message.

8. Help:
Command: help
Example: help
Description: Displays this help message.

9. Greeting:
Command: hi
Example: hi
Description: Greets the bot and starts the conversation.

If you have any questions or need further assistance, just ask!
  `;
  await sendMessage(chatId, helpMessage);
};

const handleCommand = async (command, chatId) => {
  const parsedCommand = await parseCommand(command);
  if (!parsedCommand) {
    await sendMessage(chatId, 'Failed to parse command. Please try again.');
    return;
  }

  switch (parsedCommand.action) {
    case 'set_reminder':
      await handleSetReminder(parsedCommand, chatId);
      break;
    case 'view_reminders':
      await handleViewReminders(chatId);
      break;
    case 'update_reminder':
      await handleUpdateReminder(parsedCommand, chatId);
      break;
    case 'delete_reminder':
      await handleDeleteReminder(parsedCommand, chatId);
      break;
    case 'snooze_reminder':
      await handleSnoozeReminder(parsedCommand, chatId);
      break;
    case 'view_history':
      await handleViewHistory(chatId);
      break;
    case 'help':
      await handleHelp(chatId);
      break;
    case 'hi':
      await handleHelp(chatId);
      break;
    default:
      await sendMessage(chatId, 'Unknown command');
  }
};

const pollUpdates = async () => {
  console.log('Polling for updates...');
  try {
    const response = await axios.post(`${BASE_URL}/getUpdates`, {}, { headers });
    console.log('API response:', JSON.stringify(response.data, null, 2));
    const updates = response.data.data;

    for (const update of updates) {
      const chatId = update.chatId;
      const text = Buffer.from(update.text, 'base64').toString('utf-8');
      console.log(`Received command: ${text} from chatId: ${chatId}`);
      await handleCommand(text, chatId);
    }
  } catch (error) {
    console.error('Error getting updates:', error);
  }
};

const startPolling = () => {
  setInterval(pollUpdates, POLLING_INTERVAL);
};

startPolling();
setCommands(); // Set commands when the bot starts

module.exports = { startPolling, handleCommand };
