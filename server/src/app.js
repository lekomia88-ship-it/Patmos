const express = require('express');
const cors = require('cors');

const flightsRouter = require('./routes/flights');
const ferriesRouter = require('./routes/ferries');
const combineRouter = require('./routes/combine');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Travel planner backend operational' });
});

app.use('/api/flights', flightsRouter);
app.use('/api/ferries', ferriesRouter);
app.use('/api/combine', combineRouter);

module.exports = app;
