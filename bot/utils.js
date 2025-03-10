const { parse, addDays, setHours, setMinutes } = require('date-fns');

const parseDate = (dateString) => {
  if (!dateString) {
    return addDays(new Date(), 1); // Default to current date + 1 day
  }

  let date;
  try {
    date = parse(dateString, 'yyyy-MM-dd', new Date());
  } catch (error) {
    console.error('Error parsing date:', error);
    date = addDays(new Date(), 1); // Default to current date + 1 day if parsing fails
  }

  return date;
};

const parseTime = (timeString, date) => {
  if (!timeString) {
    return setHours(setMinutes(date, 0), 9); // Default to 9 AM if time is missing
  }

  let time;
  try {
    time = parse(timeString, 'HH:mm', new Date());
    date = setHours(setMinutes(date, time.getMinutes()), time.getHours());
  } catch (error) {
    console.error('Error parsing time:', error);
    date = setHours(setMinutes(date, 0), 9); // Default to 9 AM if parsing fails
  }

  return date;
};

const parseRecurrence = (recurrenceString) => {
  if (!recurrenceString) {
    return '';
  }

  // Add logic to parse complex recurrence patterns
  // Example: "every third Monday", "first of every month"
  // For simplicity, we return the string as is
  return recurrenceString;
};

module.exports = { parseDate, parseTime, parseRecurrence };
