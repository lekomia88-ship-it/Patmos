import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCombinations } from '../services/api';
import type { CombineResponse, Combination, TravelQuery } from '../types/api';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';
type SortKey = 'balanced' | 'fastest' | 'cheapest' | 'layover';

const DEFAULT_QUERY: TravelQuery = {
  origin: 'FRA',
  departureDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .slice(0, 10),
};

function parseInitialQuery(): TravelQuery {
  if (typeof window === 'undefined') {
    return DEFAULT_QUERY;
  }

  const params = new URLSearchParams(window.location.search);
  const origin = params.get('origin')?.toUpperCase() ?? DEFAULT_QUERY.origin;
  const departureDate =
    params.get('date') ??
    params.get('departureDate') ??
    DEFAULT_QUERY.departureDate;
  const returnDate = params.get('returnDate') ?? undefined;
  const ports = params.get('ports')
    ? params
        .get('ports')!
        .split(',')
        .map((port) => port.trim().toUpperCase())
        .filter(Boolean)
    : undefined;
  const operators = params.get('operators')
    ? params
        .get('operators')!
        .split(',')
        .map((op) => op.trim().toLowerCase())
        .filter(Boolean)
    : undefined;

  return {
    origin,
    departureDate,
    returnDate,
    ports,
    operators,
  };
}

function updateUrlState(query: TravelQuery) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('origin', query.origin);
  url.searchParams.set('date', query.departureDate);
  if (query.returnDate) {
    url.searchParams.set('returnDate', query.returnDate);
  } else {
    url.searchParams.delete('returnDate');
  }
  if (query.ports && query.ports.length > 0) {
    url.searchParams.set('ports', query.ports.join(','));
  } else {
    url.searchParams.delete('ports');
  }
  if (query.operators && query.operators.length > 0) {
    url.searchParams.set('operators', query.operators.join(','));
  } else {
    url.searchParams.delete('operators');
  }
  window.history.replaceState(null, '', url.toString());
}

function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem('patmos:favorites');
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useTravelPlanner() {
  const [query, setQuery] = useState<TravelQuery>(parseInitialQuery);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [data, setData] = useState<CombineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] =
    useState<'outbound' | 'inbound'>('outbound');
  const [sortKey, setSortKey] = useState<SortKey>('balanced');
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('patmos:favorites', JSON.stringify(favorites));
  }, [favorites]);

  const executeSearch = useCallback(
    async (input: TravelQuery) => {
      setStatus('loading');
      setError(null);
      setData(null);
      setQuery(input);

      try {
        const response = await fetchCombinations(input);
        setData(response);
        setStatus('success');
        setSelectedDirection('outbound');
        updateUrlState(input);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      }
    },
    [setStatus, setData, setError]
  );

  const toggleFavorite = useCallback((combinationId: string) => {
    setFavorites((prev) =>
      prev.includes(combinationId)
        ? prev.filter((id) => id !== combinationId)
        : [...prev, combinationId]
    );
  }, []);

  const currentGroup = useMemo(() => {
    if (!data) return null;
    return selectedDirection === 'outbound'
      ? data.combinations.outbound
      : data.combinations.inbound;
  }, [data, selectedDirection]);

  const sortedCombinations = useMemo<Combination[]>(() => {
    if (!currentGroup) return [];
    switch (sortKey) {
      case 'fastest':
        return currentGroup.sortings.byTotalDuration;
      case 'cheapest':
        return currentGroup.sortings.byPrice;
      case 'layover':
        return currentGroup.sortings.byLayover;
      case 'balanced':
      default:
        return currentGroup.combinations;
    }
  }, [currentGroup, sortKey]);

  const hasResults = currentGroup ? currentGroup.combinations.length > 0 : false;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.search.length === 0) return;
    executeSearch(parseInitialQuery());
  }, [executeSearch]);

  return {
    state: {
      query,
      status,
      data,
      error,
      selectedDirection,
      sortKey,
      favorites,
    },
    actions: {
      executeSearch,
      setSelectedDirection,
      setSortKey,
      toggleFavorite,
    },
    derived: {
      currentGroup,
      sortedCombinations,
      hasResults,
    },
  };
}

export type { SearchStatus, SortKey };
