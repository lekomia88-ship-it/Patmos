export type Currency = 'EUR';

export interface PriceBreakdown {
  base?: number;
  taxes?: number;
  surcharges?: number;
}

export interface Price {
  amount: number;
  currency: Currency;
  breakdown?: PriceBreakdown;
  seatClasses?: Array<{ type: string; amount: number }>;
}

export interface Airport {
  code: string;
  city: string;
  name: string;
  transferPort?: {
    code: string;
    name: string;
  };
}

export interface FlightSegment {
  id: string;
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departure: string;
  arrival: string;
  durationMinutes: number;
  price: Price;
  minConnectionMinutes: number;
  bookingLink?: string;
}

export interface FerrySegment {
  id: string;
  operator: {
    id: string;
    name?: string;
    website?: string | null;
  };
  route: {
    departurePort: {
      code: string;
      name: string;
      city?: string;
    };
    arrivalPort: {
      code: string;
      name: string;
      city?: string;
    };
    vessel?: string;
  };
  departure: string;
  arrival: string;
  durationMinutes: number;
  price: Price & {
    seatClasses?: Array<{ type: string; amount: number }>;
  };
  amenities?: {
    wifi?: boolean;
    catering?: boolean;
    petFriendly?: boolean;
  };
  bookingLink?: string | null;
}

export interface Combination {
  id: string;
  direction: 'outbound' | 'inbound';
  segments: {
    flight: FlightSegment;
    ferry: FerrySegment;
  };
  timing: {
    layoverMinutes: number;
    totalMinutes: number;
    flightDurationMinutes: number;
    ferryDurationMinutes: number;
  };
  pricing: {
    totalAmount: number;
    currency: Currency;
    breakdown: {
      flight: number;
      ferry: number;
    };
  };
  score: number;
}

export interface Summary {
  cheapest: string;
  fastest: string;
  mostBalanced: string;
  priceSpan: {
    min: number;
    max: number;
    currency: Currency;
  };
  durationSpan: {
    min: number;
    max: number;
    unit: 'minutes';
  };
}

export interface CombinationGroup {
  combinations: Combination[];
  summary: Summary | null;
  sortings: {
    byTotalDuration: Combination[];
    byPrice: Combination[];
    byLayover: Combination[];
  };
}

export interface CombineResponse {
  query: {
    origin: string;
    date: string;
    returnDate: string | null;
    departurePorts: string[];
    operatorIds: string[];
  };
  data: {
    flights: {
      outbound: FlightSegment[];
      inbound: FlightSegment[];
    };
    ferries: {
      outbound: FerrySegment[];
      inbound: FerrySegment[];
      meta?: Record<string, unknown>;
    };
  };
  combinations: {
    outbound: CombinationGroup;
    inbound: CombinationGroup;
    generatedAt: string;
  };
}

export interface FlightResponse {
  query: { origin: string; date: string; returnDate: string | null };
  outbound: FlightSegment[];
  inbound: FlightSegment[];
}

export interface FerryResponse {
  query: {
    date: string;
    returnDate: string | null;
    departurePorts: string[];
    operatorIds: string[];
  };
  options: {
    outbound: FerrySegment[];
    inbound: FerrySegment[];
  };
}

export interface TravelQuery {
  origin: string;
  departureDate: string;
  returnDate?: string;
  ports?: string[];
  operators?: string[];
}
