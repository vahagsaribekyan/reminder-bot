const express = require('express');
const app = express();
const port = 3000;

const sequelize = require('./config/database');
const webhookRouter = require('./routes/webhook');
const { startPolling } = require('./bot/yophoneBot'); // Import startPolling

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/webhook', webhookRouter);

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    startPolling(); // Start polling when the server starts
  });
});
