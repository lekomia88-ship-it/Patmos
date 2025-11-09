import type { Combination } from '../types/api';
import {
  describeLayover,
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from '../utils/format';

interface CombinationCardProps {
  combination: Combination;
  badge?: {
    label: string;
    tone: 'brand' | 'success' | 'warning';
  };
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const badgeStyles: Record<
  NonNullable<CombinationCardProps['badge']>['tone'],
  string
> = {
  brand: 'bg-brand-50 text-brand-600 border-brand-200',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
};

export function CombinationCard({
  combination,
  badge,
  isFavorite,
  onToggleFavorite,
}: CombinationCardProps) {
  const { segments, timing, pricing } = combination;
  const layoverLabel = describeLayover(timing.layoverMinutes);

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:shadow-lg">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Gesamtpreis {formatPrice(pricing.totalAmount, pricing.currency)}
          </p>
          <p className="text-sm text-slate-500">
            Gesamtzeit {formatDuration(timing.totalMinutes)} · Umstieg{' '}
            {formatDuration(timing.layoverMinutes)} ({layoverLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {badge ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[badge.tone]}`}
            >
              {badge.label}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onToggleFavorite(combination.id)}
            aria-pressed={isFavorite}
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium transition ${
              isFavorite
                ? 'border-amber-400 bg-amber-50 text-amber-600'
                : 'border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600'
            }`}
          >
            {isFavorite ? '★ Favorit' : '☆ Merken'}
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Flug
            </h3>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {segments.flight.origin.city} ({segments.flight.origin.code})
                </p>
                <p>{formatDateTime(segments.flight.departure)}</p>
              </div>
              <span className="text-xs uppercase text-slate-400">
                {formatDuration(timing.flightDurationMinutes)}
              </span>
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {segments.flight.destination.city} (
                  {segments.flight.destination.code})
                </p>
                <p>{formatDateTime(segments.flight.arrival)}</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {segments.flight.airline} · {segments.flight.flightNumber}
            </p>
            <p className="text-xs text-slate-500">
              Tarif ab {formatPrice(segments.flight.price.amount)} · Mindest-Umsteigezeit{' '}
              {formatDuration(segments.flight.minConnectionMinutes)}
            </p>
            {segments.flight.bookingLink ? (
              <a
                href={segments.flight.bookingLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Flug buchen
              </a>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚢</span>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Fähre
            </h3>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {segments.ferry.route.departurePort.name} (
                  {segments.ferry.route.departurePort.code})
                </p>
                <p>{formatDateTime(segments.ferry.departure)}</p>
              </div>
              <span className="text-xs uppercase text-slate-400">
                {formatDuration(timing.ferryDurationMinutes)}
              </span>
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {segments.ferry.route.arrivalPort.name} (
                  {segments.ferry.route.arrivalPort.code})
                </p>
                <p>{formatDateTime(segments.ferry.arrival)}</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {segments.ferry.operator.name ?? 'Fähre'} ·{' '}
              {segments.ferry.route.vessel ?? 'Fähre'}
            </p>
            <p className="text-xs text-slate-500">
              Tarif ab {formatPrice(segments.ferry.price.amount)} · Kabinen ab{' '}
              {segments.ferry.price.seatClasses?.[1]
                ? formatPrice(segments.ferry.price.seatClasses[1].amount)
                : '—'}
            </p>
            {segments.ferry.bookingLink ? (
              <a
                href={segments.ferry.bookingLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Fähre reservieren
              </a>
            ) : null}
            {segments.ferry.amenities ? (
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                {segments.ferry.amenities.wifi ? (
                  <span className="rounded-full bg-white px-2 py-1">WLAN</span>
                ) : null}
                {segments.ferry.amenities.catering ? (
                  <span className="rounded-full bg-white px-2 py-1">
                    Bordservice
                  </span>
                ) : null}
                {segments.ferry.amenities.petFriendly ? (
                  <span className="rounded-full bg-white px-2 py-1">
                    Haustiere erlaubt
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          Umstieg zwischen{' '}
          {formatTime(segments.flight.arrival)} Uhr und{' '}
          {formatTime(segments.ferry.departure)} Uhr ·{' '}
          {layoverLabel}
        </p>
        <p className="font-medium text-brand-600">
          ID {combination.id.toUpperCase()}
        </p>
      </footer>
    </article>
  );
}
