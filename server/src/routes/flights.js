const express = require('express');
const dayjs = require('dayjs');
const { getFlights } = require('../data/flights');

const router = express.Router();

router.get('/', (req, res) => {
  const { origin, date, returnDate } = req.query;

  if (!origin || !date) {
    return res.status(400).json({
      error: 'Parameter origin und date sind erforderlich, z. B. ?origin=FRA&date=2025-06-12',
    });
  }

  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      error: 'Ungültiges Datum. Verwende ISO-Format (YYYY-MM-DD).',
    });
  }

  const flights = getFlights({
    origin: origin.toUpperCase(),
    date: parsedDate,
    returnDate,
  });

  return res.json({
    query: {
      origin: origin.toUpperCase(),
      date: parsedDate.format('YYYY-MM-DD'),
      returnDate: returnDate || null,
    },
    ...flights,
  });
});

module.exports = router;
