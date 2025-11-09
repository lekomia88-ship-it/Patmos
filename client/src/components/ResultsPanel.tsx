import { useMemo } from 'react';
import { CombinationCard } from './CombinationCard';
import type { Combination, CombinationGroup } from '../types/api';
import type { SearchStatus, SortKey } from '../hooks/useTravelPlanner';
import { formatDuration, formatPrice } from '../utils/format';

interface ResultsPanelProps {
  status: SearchStatus;
  error: string | null;
  combinations: Combination[];
  currentGroup: CombinationGroup | null;
  favorites: string[];
  selectedDirection: 'outbound' | 'inbound';
  sortKey: SortKey;
  onDirectionChange: (direction: 'outbound' | 'inbound') => void;
  onSortChange: (sortKey: SortKey) => void;
  onToggleFavorite: (id: string) => void;
}

const sortLabels: Record<SortKey, string> = {
  balanced: 'Empfehlung',
  fastest: 'Schnellste Reisezeit',
  cheapest: 'Günstigster Preis',
  layover: 'Entspannteste Umstiegszeit',
};

export function ResultsPanel({
  status,
  error,
  combinations,
  currentGroup,
  favorites,
  selectedDirection,
  sortKey,
  onDirectionChange,
  onSortChange,
  onToggleFavorite,
}: ResultsPanelProps) {
  const badgeMap = useMemo(() => {
    const map = new Map<
      string,
      { label: string; tone: 'brand' | 'success' | 'warning' }
    >();
    if (!currentGroup?.summary) return map;
    map.set(currentGroup.summary.mostBalanced, {
      label: 'Top-Empfehlung',
      tone: 'brand',
    });
    if (!map.has(currentGroup.summary.cheapest)) {
      map.set(currentGroup.summary.cheapest, {
        label: 'Günstig',
        tone: 'success',
      });
    }
    if (!map.has(currentGroup.summary.fastest)) {
      map.set(currentGroup.summary.fastest, {
        label: 'Schnell',
        tone: 'warning',
      });
    }
    return map;
  }, [currentGroup]);

  const summaryStats = currentGroup?.summary;

  if (status === 'idle') {
    return (
      <section className="rounded-3xl border border-dashed border-brand-200 bg-white/60 p-10 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-700">
          Willkommen beim Patmos Reiseplaner
        </p>
        <p className="mt-2 text-sm">
          Wähle deinen Lieblingsflughafen und einen Reisetermin, wir kombinieren
          für dich passende Flüge und Fähren nach Patmos.
        </p>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-3xl bg-gradient-to-r from-slate-100 via-white to-slate-100"
          />
        ))}
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-rose-700">
        <h3 className="text-lg font-semibold">Ups, etwas ist schiefgelaufen</h3>
        <p className="mt-2 text-sm">{error ?? 'Bitte versuche es erneut.'}</p>
      </section>
    );
  }

  if (!currentGroup || combinations.length === 0) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8 text-amber-700">
        <h3 className="text-lg font-semibold">
          Keine passenden Kombinationen gefunden
        </h3>
        <p className="mt-2 text-sm">
          Tipp: Wähle ein alternatives Abflugsdatum, lasse mehr Fährhäfen zu
          oder prüfe eine Rückreise ohne Fähre.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDirectionChange('outbound')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedDirection === 'outbound'
                  ? 'bg-brand-500 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-brand-50'
              }`}
            >
              Hinreise
            </button>
            <button
              type="button"
              onClick={() => onDirectionChange('inbound')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedDirection === 'inbound'
                  ? 'bg-brand-500 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-brand-50'
              }`}
            >
              Rückreise
            </button>
          </div>

          {summaryStats ? (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>
                {combinations.length} Optionen · Reisezeit{' '}
                {formatDuration(summaryStats.durationSpan.min)} –{' '}
                {formatDuration(summaryStats.durationSpan.max)}
              </span>
              <span>
                Preise ab {formatPrice(summaryStats.priceSpan.min)} bis{' '}
                {formatPrice(summaryStats.priceSpan.max)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="sort"
            className="text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Sortieren nach
          </label>
          <select
            id="sort"
            value={sortKey}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-4">
        {combinations.map((combination) => (
          <CombinationCard
            key={combination.id}
            combination={combination}
            badge={badgeMap.get(combination.id) ?? undefined}
            isFavorite={favorites.includes(combination.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
