const express = require('express');
const dayjs = require('dayjs');
const { getFerries, OPERATORS, ROUTES } = require('../data/ferries');

const router = express.Router();

router.get('/', (req, res) => {
  const { date, returnDate, ports, operators } = req.query;

  if (!date) {
    return res.status(400).json({
      error: 'Parameter date ist erforderlich, z. B. ?date=2025-06-12',
    });
  }

  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      error: 'Ungültiges Datum. Verwende ISO-Format (YYYY-MM-DD).',
    });
  }

  const departurePorts = Array.isArray(ports)
    ? ports
    : typeof ports === 'string' && ports.length > 0
    ? ports.split(',').map((port) => port.trim().toUpperCase())
    : [];

  const operatorIds = Array.isArray(operators)
    ? operators
    : typeof operators === 'string' && operators.length > 0
    ? operators.split(',').map((operator) => operator.trim().toLowerCase())
    : [];

  const ferryData = getFerries({
    date: parsedDate,
    returnDate,
    departurePorts,
    operatorIds,
  });

  return res.json({
    query: {
      date: parsedDate.format('YYYY-MM-DD'),
      returnDate: returnDate || null,
      departurePorts,
      operatorIds,
    },
    options: ferryData,
    references: {
      operators: OPERATORS,
      routes: ROUTES,
    },
  });
});

module.exports = router;
