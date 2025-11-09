const express = require('express');
const dayjs = require('dayjs');
const { getFlights } = require('../data/flights');
const { getFerries } = require('../data/ferries');
const { combineTravelOptions } = require('../utils/combine');

const router = express.Router();

router.get('/', (req, res) => {
  const { origin, date, returnDate, ports, operators } = req.query;

  if (!origin || !date) {
    return res.status(400).json({
      error: 'origin und date sind erforderlich, z. B. ?origin=FRA&date=2025-06-12',
    });
  }

  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      error: 'Ungültiges Datum. Verwende ISO-Format (YYYY-MM-DD).',
    });
  }

  const parsedReturnDate = returnDate ? dayjs(returnDate) : null;
  if (returnDate && !parsedReturnDate.isValid()) {
    return res.status(400).json({
      error: 'Ungültiges Rückreisedatum. Verwende ISO-Format (YYYY-MM-DD).',
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

  const flights = getFlights({
    origin: origin.toUpperCase(),
    date: parsedDate,
    returnDate: parsedReturnDate,
  });

  const ferries = getFerries({
    date: parsedDate,
    returnDate: parsedReturnDate,
    departurePorts,
    operatorIds,
  });

  const combinations = combineTravelOptions({
    flights,
    ferries,
  });

  return res.json({
    query: {
      origin: origin.toUpperCase(),
      date: parsedDate.format('YYYY-MM-DD'),
      returnDate: parsedReturnDate ? parsedReturnDate.format('YYYY-MM-DD') : null,
      departurePorts,
      operatorIds,
    },
    data: {
      flights,
      ferries,
    },
    combinations,
  });
});

module.exports = router;
