const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('reminder_bot', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;
