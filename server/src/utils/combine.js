const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);

const IDEAL_LAYOVER_MINUTES = 150;
const MAX_LAYOVER_MINUTES = 11 * 60;

function minutesBetween(startIso, endIso) {
  return dayjs(endIso).diff(dayjs(startIso), 'minute');
}

function withinLayoverWindow(layoverMinutes, minConnectionMinutes) {
  const minimum = Math.max(minConnectionMinutes ?? 90, 60);
  return layoverMinutes >= minimum && layoverMinutes <= MAX_LAYOVER_MINUTES;
}

function rankScore({ totalMinutes, totalPrice, layoverMinutes }) {
  const layoverPenalty = Math.abs(layoverMinutes - IDEAL_LAYOVER_MINUTES);
  return totalMinutes * 0.55 + totalPrice * 0.3 + layoverPenalty * 2;
}

function normalizeCombination({ flight, ferry, direction }) {
  const layoverMinutes =
    direction === 'outbound'
      ? minutesBetween(flight.arrival, ferry.departure)
      : minutesBetween(ferry.arrival, flight.departure);
  const totalMinutes =
    direction === 'outbound'
      ? minutesBetween(flight.departure, ferry.arrival)
      : minutesBetween(ferry.departure, flight.arrival);

  return {
    id: `${direction}-${flight.id}-${ferry.id}`,
    direction,
    segments: {
      flight,
      ferry,
    },
    timing: {
      layoverMinutes,
      totalMinutes,
      flightDurationMinutes: flight.durationMinutes,
      ferryDurationMinutes: ferry.durationMinutes,
    },
    pricing: {
      totalAmount: flight.price.amount + ferry.price.amount,
      currency: 'EUR',
      breakdown: {
        flight: flight.price.amount,
        ferry: ferry.price.amount,
      },
    },
    score: rankScore({
      totalMinutes,
      totalPrice: flight.price.amount + ferry.price.amount,
      layoverMinutes,
    }),
  };
}

function matchOutbound({ flights, ferries }) {
  const ferryByPort = ferries.reduce((acc, ferry) => {
    const code = ferry.route.departurePort.code;
    acc[code] = acc[code] || [];
    acc[code].push(ferry);
    return acc;
  }, {});

  const matches = [];

  flights.forEach((flight) => {
    const transferPortCode = flight.destination.transferPort?.code;
    if (!transferPortCode || !ferryByPort[transferPortCode]) {
      return;
    }

    ferryByPort[transferPortCode].forEach((ferry) => {
      const layoverMinutes = minutesBetween(flight.arrival, ferry.departure);
      if (!withinLayoverWindow(layoverMinutes, flight.minConnectionMinutes)) {
        return;
      }
      matches.push(
        normalizeCombination({
          flight,
          ferry,
          direction: 'outbound',
        })
      );
    });
  });

  return matches;
}

function matchInbound({ flights, ferries }) {
  const ferryByArrivalPort = ferries.reduce((acc, ferry) => {
    const code = ferry.route.arrivalPort.code;
    acc[code] = acc[code] || [];
    acc[code].push(ferry);
    return acc;
  }, {});

  const matches = [];

  flights.forEach((flight) => {
    const transferPortCode = flight.origin.transferPort?.code;
    if (!transferPortCode || !ferryByArrivalPort[transferPortCode]) {
      return;
    }

    ferryByArrivalPort[transferPortCode].forEach((ferry) => {
      const layoverMinutes = minutesBetween(ferry.arrival, flight.departure);
      if (!withinLayoverWindow(layoverMinutes, flight.minConnectionMinutes)) {
        return;
      }
      matches.push(
        normalizeCombination({
          flight,
          ferry,
          direction: 'inbound',
        })
      );
    });
  });

  return matches;
}

function sortCombinations(combinations) {
  const byTotalDuration = [...combinations].sort(
    (a, b) => a.timing.totalMinutes - b.timing.totalMinutes
  );

  const byPrice = [...combinations].sort(
    (a, b) => a.pricing.totalAmount - b.pricing.totalAmount
  );

  const byLayover = [...combinations].sort(
    (a, b) =>
      Math.abs(a.timing.layoverMinutes - IDEAL_LAYOVER_MINUTES) -
      Math.abs(b.timing.layoverMinutes - IDEAL_LAYOVER_MINUTES)
  );

  return {
    byTotalDuration,
    byPrice,
    byLayover,
  };
}

function buildSummary(combinations) {
  if (combinations.length === 0) {
    return null;
  }

  const cheapest = combinations.reduce((prev, current) =>
    current.pricing.totalAmount < prev.pricing.totalAmount ? current : prev
  );
  const fastest = combinations.reduce((prev, current) =>
    current.timing.totalMinutes < prev.timing.totalMinutes ? current : prev
  );
  const mostBalanced = [...combinations].sort((a, b) => a.score - b.score)[0];

  return {
    cheapest: cheapest.id,
    fastest: fastest.id,
    mostBalanced: mostBalanced.id,
    priceSpan: {
      min: cheapest.pricing.totalAmount,
      max: combinations.reduce(
        (max, combination) =>
          Math.max(max, combination.pricing.totalAmount),
        0
      ),
      currency: 'EUR',
    },
    durationSpan: {
      min: fastest.timing.totalMinutes,
      max: combinations.reduce(
        (max, combination) =>
          Math.max(max, combination.timing.totalMinutes),
        0
      ),
      unit: 'minutes',
    },
  };
}

function combineTravelOptions({ flights, ferries }) {
  const outboundMatches = matchOutbound({
    flights: flights.outbound || [],
    ferries: ferries.outbound || [],
  }).sort((a, b) => a.score - b.score);

  const inboundMatches = matchInbound({
    flights: flights.inbound || [],
    ferries: ferries.inbound || [],
  }).sort((a, b) => a.score - b.score);

  return {
    outbound: {
      combinations: outboundMatches,
      summary: buildSummary(outboundMatches),
      sortings: sortCombinations(outboundMatches),
    },
    inbound: {
      combinations: inboundMatches,
      summary: buildSummary(inboundMatches),
      sortings: sortCombinations(inboundMatches),
    },
    generatedAt: dayjs().toISOString(),
  };
}

module.exports = {
  combineTravelOptions,
};
