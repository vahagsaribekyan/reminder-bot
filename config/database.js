const { Sequelize } = require('sequelize');

const database = process.env.DATABASE || 'reminder_bot';
const username = process.env.DATABASE_USER || 'postgres';
const password = process.env.DATABASE_PASSWORD || 'postgres';
const host = process.env.DATABASE_HOST || 'localhost';
const dialect = process.env.DATABASE_DIALECT || 'postgres';

const sequelize = new Sequelize('reminder_bot', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;
