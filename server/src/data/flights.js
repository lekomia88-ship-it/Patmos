const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);

const ORIGIN_AIRPORTS = {
  FRA: { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport' },
  MUC: { code: 'MUC', city: 'München', name: 'Munich Airport' },
  BER: { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg Airport' },
  HAM: { code: 'HAM', city: 'Hamburg', name: 'Hamburg Airport' },
  DUS: { code: 'DUS', city: 'Düsseldorf', name: 'Düsseldorf Airport' },
};

const DESTINATIONS = [
  {
    code: 'ATH',
    city: 'Athen',
    name: 'Athens International Airport',
    transferPort: { code: 'PIR', name: 'Piräus' },
    carriers: ['Aegean Airlines', 'Lufthansa', 'Eurowings'],
    flightMinutes: 195,
    priceRange: [140, 260],
    minConnectionMinutes: 180,
  },
  {
    code: 'KGS',
    city: 'Kos',
    name: 'Kos International Airport',
    transferPort: { code: 'KOS', name: 'Kos' },
    carriers: ['Aegean Airlines', 'Condor', 'TUI fly'],
    flightMinutes: 225,
    priceRange: [160, 310],
    minConnectionMinutes: 120,
  },
  {
    code: 'RHO',
    city: 'Rhodos',
    name: 'Rhodes International Airport',
    transferPort: { code: 'RHO', name: 'Rhodos' },
    carriers: ['Aegean Airlines', 'Eurowings', 'TUIfly'],
    flightMinutes: 235,
    priceRange: [150, 320],
    minConnectionMinutes: 150,
  },
  {
    code: 'LRS',
    city: 'Leros',
    name: 'Leros Municipal Airport',
    transferPort: { code: 'LER', name: 'Leros' },
    carriers: ['Sky Express', 'Aegean Airlines'],
    flightMinutes: 260,
    priceRange: [180, 340],
    minConnectionMinutes: 90,
  },
];

const DEPARTURE_SLOTS = ['06:30', '11:45', '17:10'];

function hashCode(str) {
  return str.split('').reduce((hash, char) => {
    const chr = char.charCodeAt(0);
    hash = (hash << 5) - hash + chr;
    return hash & hash;
  }, 0);
}

function seededNumber(seed, min, max) {
  const hash = Math.abs(hashCode(seed));
  const normalized = hash % 1000 / 1000;
  return Math.round(min + normalized * (max - min));
}

function buildFlightId(origin, destination, date, idx) {
  return `${origin}-${destination}-${dayjs(date).format('YYYYMMDD')}-${idx}`;
}

function formatSlot(date, slot) {
  const [hour, minute] = slot.split(':').map((value) => parseInt(value, 10));
  return dayjs(date).hour(hour).minute(minute).second(0).millisecond(0);
}

function createFlightOption(originCode, destination, travelDate, slot, index) {
  const departure = formatSlot(travelDate, slot);
  const arrival = departure.add(destination.flightMinutes, 'minute');
  const carrier =
    destination.carriers[index % destination.carriers.length] ||
    destination.carriers[0];
  const price = seededNumber(
    `${originCode}-${destination.code}-${travelDate}-${slot}`,
    destination.priceRange[0],
    destination.priceRange[1]
  );

  return {
    id: buildFlightId(originCode, destination.code, travelDate, index),
    airline: carrier,
    flightNumber: `${carrier
      .split(' ')
      .map((word) => word[0])
      .join('')}${100 + (index + 1) * 7}`,
    origin: ORIGIN_AIRPORTS[originCode] || {
      code: originCode,
      city: originCode,
      name: `${originCode} Airport`,
    },
    destination: {
      code: destination.code,
      city: destination.city,
      name: destination.name,
      transferPort: destination.transferPort,
    },
    departure: departure.toISOString(),
    arrival: arrival.toISOString(),
    durationMinutes: destination.flightMinutes,
    price: {
      amount: price,
      currency: 'EUR',
      breakdown: {
        base: Math.round(price * 0.85),
        taxes: Math.round(price * 0.1),
        surcharges: Math.round(price * 0.05),
      },
    },
    minConnectionMinutes: destination.minConnectionMinutes,
    bookingLink: `https://www.skyscanner.de/transport/flights/${originCode.toLowerCase()}/${destination.code.toLowerCase()}/${departure.format(
      'YYMMDD'
    )}/`,
  };
}

function generateFlights({ origin, date }) {
  if (!origin || !date) {
    return [];
  }

  const travelDate = dayjs(date);
  if (!travelDate.isValid()) {
    return [];
  }

  let optionIndex = 0;
  return DESTINATIONS.flatMap((destination) =>
    DEPARTURE_SLOTS.map((slot) =>
      createFlightOption(origin, destination, travelDate, slot, optionIndex++)
    )
  );
}

function generateReturnFlights({ origin, date, returnDate }) {
  if (!returnDate) {
    return [];
  }

  const returnTripDate = dayjs(returnDate);
  if (!returnTripDate.isValid()) {
    return [];
  }

  let optionIndex = 0;
  return DESTINATIONS.flatMap((destination) =>
    DEPARTURE_SLOTS.map((slot) => {
      const currentIndex = optionIndex++;
      const departure = formatSlot(returnTripDate, slot);
      const arrival = departure.add(destination.flightMinutes, 'minute');
      const carrier =
        destination.carriers[currentIndex % destination.carriers.length] ||
        destination.carriers[0];
      const price = seededNumber(
        `${destination.code}-${origin}-${returnDate}-${slot}`,
        destination.priceRange[0],
        destination.priceRange[1]
      );

      return {
        id: buildFlightId(destination.code, origin, returnTripDate, currentIndex),
        airline: carrier,
        flightNumber: `${carrier
          .split(' ')
          .map((word) => word[0])
          .join('')}${200 + (currentIndex + 1) * 9}`,
        origin: {
          code: destination.code,
          city: destination.city,
          name: destination.name,
          transferPort: destination.transferPort,
        },
        destination: ORIGIN_AIRPORTS[origin] || {
          code: origin,
          city: origin,
          name: `${origin} Airport`,
        },
        departure: departure.toISOString(),
        arrival: arrival.toISOString(),
        durationMinutes: destination.flightMinutes,
        price: {
          amount: price,
          currency: 'EUR',
          breakdown: {
            base: Math.round(price * 0.83),
            taxes: Math.round(price * 0.12),
            surcharges: Math.round(price * 0.05),
          },
        },
        minConnectionMinutes: destination.minConnectionMinutes,
        bookingLink: `https://www.skyscanner.de/transport/flights/${destination.code.toLowerCase()}/${origin.toLowerCase()}/${departure.format(
          'YYMMDD'
        )}/`,
      };
    })
  );
}

function getFlights({ origin, date, returnDate }) {
  return {
    outbound: generateFlights({ origin, date }),
    inbound: generateReturnFlights({ origin, date, returnDate }),
    meta: {
      generatedAt: dayjs().toISOString(),
      origin: ORIGIN_AIRPORTS[origin] || null,
      destinations: DESTINATIONS.map((destination) => ({
        code: destination.code,
        city: destination.city,
        transferPort: destination.transferPort,
        minConnectionMinutes: destination.minConnectionMinutes,
      })),
    },
  };
}

module.exports = {
  getFlights,
  DESTINATIONS,
  ORIGIN_AIRPORTS,
};
