import type {
  CombineResponse,
  FerryResponse,
  FlightResponse,
  TravelQuery,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

function buildQueryString(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
    } else if (typeof value === 'string' && value) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchFlights(query: TravelQuery): Promise<FlightResponse> {
  const qs = buildQueryString({
    origin: query.origin,
    date: query.departureDate,
    returnDate: query.returnDate,
  });

  const response = await fetch(`${API_BASE_URL}/api/flights?${qs}`);
  return handleResponse<FlightResponse>(response);
}

export async function fetchFerries(query: TravelQuery): Promise<FerryResponse> {
  const qs = buildQueryString({
    date: query.departureDate,
    returnDate: query.returnDate,
    ports: query.ports,
    operators: query.operators,
  });

  const response = await fetch(`${API_BASE_URL}/api/ferries?${qs}`);
  return handleResponse<FerryResponse>(response);
}

export async function fetchCombinations(
  query: TravelQuery
): Promise<CombineResponse> {
  const qs = buildQueryString({
    origin: query.origin,
    date: query.departureDate,
    returnDate: query.returnDate,
    ports: query.ports,
    operators: query.operators,
  });

  const response = await fetch(`${API_BASE_URL}/api/combine?${qs}`);
  return handleResponse<CombineResponse>(response);
}
