const dayjs = require('dayjs');

const OPERATORS = [
  { id: 'blue-star', name: 'Blue Star Ferries', website: 'https://www.bluestarferries.com/' },
  { id: 'dodekanisos', name: 'Dodekanisos Seaways', website: 'https://www.12ne.gr/' },
  { id: 'rooster', name: 'Rooster Ferry', website: 'https://www.rooster-greece.com/' },
];

const ROUTES = [
  {
    id: 'pir-pat-blue-star',
    operatorId: 'blue-star',
    departurePort: { code: 'PIR', name: 'Piräus', city: 'Athen' },
    arrivalPort: { code: 'PAT', name: 'Patmos', city: 'Patmos' },
    durationMinutes: 510,
    departureSlots: ['17:30'],
    priceRange: [45, 85],
    vessel: 'Blue Star 2',
  },
  {
    id: 'kos-pat-dodekanisos-morning',
    operatorId: 'dodekanisos',
    departurePort: { code: 'KOS', name: 'Kos', city: 'Kos' },
    arrivalPort: { code: 'PAT', name: 'Patmos', city: 'Patmos' },
    durationMinutes: 150,
    departureSlots: ['12:00'],
    priceRange: [38, 55],
    vessel: 'Dodekanisos Express',
  },
  {
    id: 'kos-pat-dodekanisos-evening',
    operatorId: 'dodekanisos',
    departurePort: { code: 'KOS', name: 'Kos', city: 'Kos' },
    arrivalPort: { code: 'PAT', name: 'Patmos', city: 'Patmos' },
    durationMinutes: 155,
    departureSlots: ['17:00'],
    priceRange: [42, 60],
    vessel: 'Dodekanisos Pride',
  },
  {
    id: 'rho-pat-rooster',
    operatorId: 'rooster',
    departurePort: { code: 'RHO', name: 'Rhodos', city: 'Rhodos' },
    arrivalPort: { code: 'PAT', name: 'Patmos', city: 'Patmos' },
    durationMinutes: 270,
    departureSlots: ['09:15'],
    priceRange: [65, 98],
    vessel: 'Rooster One',
  },
  {
    id: 'ler-pat-dodekanisos',
    operatorId: 'dodekanisos',
    departurePort: { code: 'LER', name: 'Leros', city: 'Leros' },
    arrivalPort: { code: 'PAT', name: 'Patmos', city: 'Patmos' },
    durationMinutes: 80,
    departureSlots: ['10:30', '19:30'],
    priceRange: [22, 38],
    vessel: 'Dodekanisos Flying Cat',
  },
];

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

function findOperatorById(id) {
  return OPERATORS.find((operator) => operator.id === id);
}

function getMatchingRoutes({ departurePorts = [], operatorIds = [] }) {
  return ROUTES.filter((route) => {
    const matchesPort =
      departurePorts.length === 0 ||
      departurePorts.includes(route.departurePort.code);
    const matchesOperator =
      operatorIds.length === 0 || operatorIds.includes(route.operatorId);
    return matchesPort && matchesOperator;
  });
}

function buildSailing(route, travelDate, slot) {
  const departure = dayjs(travelDate);
  if (!departure.isValid()) {
    return null;
  }

  const [hour, minute] = slot.split(':').map((value) => parseInt(value, 10));
  const departureTime = departure
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);
  const arrivalTime = departureTime.add(route.durationMinutes, 'minute');
  const price = seededNumber(
    `${route.id}-${travelDate}-${slot}`,
    route.priceRange[0],
    route.priceRange[1]
  );

  const operator = findOperatorById(route.operatorId);

  return {
    id: `${route.id}-${departureTime.format('YYYYMMDDHHmm')}`,
    operator: operator
      ? { id: operator.id, name: operator.name, website: operator.website }
      : { id: route.operatorId },
    route: {
      departurePort: route.departurePort,
      arrivalPort: route.arrivalPort,
      vessel: route.vessel,
    },
    departure: departureTime.toISOString(),
    arrival: arrivalTime.toISOString(),
    durationMinutes: route.durationMinutes,
    price: {
      amount: price,
      currency: 'EUR',
      seatClasses: [
        { type: 'Economy Seat', amount: price },
        { type: 'Cabin 2-Bett', amount: Math.round(price * 1.6) },
      ],
    },
    amenities: {
      wifi: ['blue-star', 'rooster'].includes(route.operatorId),
      catering: true,
      petFriendly: route.operatorId !== 'blue-star',
    },
    bookingLink: operator
      ? `${operator.website}?from=${route.departurePort.code}&to=${route.arrivalPort.code}&date=${departureTime.format(
          'YYYY-MM-DD'
        )}`
      : null,
  };
}

function buildReturnSailing(route, travelDate, slot) {
  const outbound = buildSailing(route, travelDate, slot);
  if (!outbound) {
    return null;
  }

  return {
    ...outbound,
    id: outbound.id.replace(route.id, `${route.arrivalPort.code.toLowerCase()}-${route.departurePort.code.toLowerCase()}-${route.operatorId}`),
    route: {
      departurePort: route.arrivalPort,
      arrivalPort: route.departurePort,
      vessel: route.vessel,
    },
    bookingLink: outbound.bookingLink
      ? `${outbound.bookingLink}&direction=return`
      : null,
  };
}

function getFerries({ date, returnDate, departurePorts = [], operatorIds = [] }) {
  const travelDate = dayjs(date);
  if (!travelDate.isValid()) {
    return { sailings: [], meta: { message: 'Invalid travel date' } };
  }

  const matchingRoutes = getMatchingRoutes({ departurePorts, operatorIds });

  const outbound = matchingRoutes
    .map((route) =>
      route.departureSlots
        .map((slot) => buildSailing(route, travelDate, slot))
        .filter(Boolean)
    )
    .flat();

  let inbound = [];
  if (returnDate) {
    const returnTripDate = dayjs(returnDate);
    if (returnTripDate.isValid()) {
      inbound = matchingRoutes
        .map((route) =>
          route.departureSlots
            .map((slot) => buildReturnSailing(route, returnTripDate, slot))
            .filter(Boolean)
        )
        .flat();
    }
  }

  return {
    outbound,
    inbound,
    meta: {
      generatedAt: dayjs().toISOString(),
      operators: OPERATORS,
      requestedPorts: departurePorts,
    },
  };
}

module.exports = {
  getFerries,
  ROUTES,
  OPERATORS,
};
