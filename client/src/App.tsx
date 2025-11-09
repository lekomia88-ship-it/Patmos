import { useMemo, useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsPanel } from './components/ResultsPanel';
import { useTravelPlanner } from './hooks/useTravelPlanner';
import type { TravelQuery } from './types/api';

function App() {
  const {
    state: {
      query,
      status,
      data,
      error,
      selectedDirection,
      sortKey,
      favorites,
    },
    actions: { executeSearch, setSelectedDirection, setSortKey, toggleFavorite },
    derived: { sortedCombinations, currentGroup },
  } = useTravelPlanner();

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleSearch = (values: TravelQuery) => {
    setShareFeedback(null);
    executeSearch(values);
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
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
    return url.toString();
  }, [query]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };
    try {
      if (typeof nav.share === 'function') {
        await nav.share({
          title: 'Reise nach Patmos planen',
          text: 'Hier ist meine favorisierte Verbindung nach Patmos.',
          url: shareUrl,
        });
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(shareUrl);
        setShareFeedback('Link in die Zwischenablage kopiert.');
        setTimeout(() => setShareFeedback(null), 3000);
      } else {
        setShareFeedback('Dein Browser unterstützt kein Teilen.');
      }
    } catch (err) {
      setShareFeedback(
        err instanceof Error ? err.message : 'Teilen fehlgeschlagen.'
      );
    }
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:py-16">
        <header className="flex flex-col gap-6 rounded-3xl bg-white/70 p-8 shadow-card backdrop-blur-lg md:p-10">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              Reiseplaner Patmos · Beta
            </span>
            <h1 className="font-display text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Die beste Kombination aus <span className="text-brand-600">Flug</span> &amp;{' '}
              <span className="text-brand-600">Fähre</span> nach Patmos
            </h1>
            <p className="max-w-3xl text-base text-slate-600 md:text-lg">
              Wir vergleichen Flüge nach Athen, Kos, Rhodos und Leros mit den
              Fähren von Blue Star Ferries, Dodekanisos Seaways und Rooster Ferry.
              Sortiert nach Reisezeit, Preis und komfortablen Umstiegsfenstern.
            </p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>✈️ Direktverbindungen zu vier Insel-Hubs</span>
              <span>🚢 Live-ähnliche Fährzeiten &amp; Preise</span>
              <span>⭐ Favoriten speichern</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 shadow-sm transition hover:bg-brand-50"
              >
                🔗 Route teilen
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-100"
              >
                📄 PDF-Export (Beta)
              </button>
              {shareFeedback ? (
                <span className="text-xs font-medium text-emerald-600">
                  {shareFeedback}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <SearchForm
          defaultValues={query}
          loading={status === 'loading'}
          onSubmit={handleSearch}
        />

        <ResultsPanel
          status={status}
          error={error}
          combinations={sortedCombinations}
          currentGroup={currentGroup}
          favorites={favorites}
          selectedDirection={selectedDirection}
          sortKey={sortKey}
          onDirectionChange={setSelectedDirection}
          onSortChange={setSortKey}
          onToggleFavorite={toggleFavorite}
        />

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:grid-cols-3">
          <CarrierHighlight
            title="Blue Star Ferries"
            description="Über Nacht von Piräus nach Patmos – ideal bei späten Ankünften in Athen."
            meta="Abfahrt meist 17:30 Uhr · Dauer ca. 8,5 h"
          />
          <CarrierHighlight
            title="Dodekanisos Seaways"
            description="Schnellfähren von Kos und Leros – perfekt nach Inselhopping-Flügen."
            meta="2 bis 3 Fahrten täglich · Dauer 80–155 Min"
          />
          <CarrierHighlight
            title="Rooster Ferry"
            description="Boutique-Katamaran ab Rhodos – mit gemütlicher Lounge und WLAN."
            meta="Morgendliche Verbindung · Dauer ca. 4,5 h"
          />
        </section>

        {favorites.length > 0 && data ? (
          <section className="rounded-3xl border border-brand-100 bg-brand-50/70 p-6 text-sm text-brand-700 shadow-inner">
            <h2 className="font-semibold text-brand-800">
              Deine Favoriten ({favorites.length})
            </h2>
            <p className="mt-2 text-brand-700">
              Deine ausgewählten Kombinationen bleiben auf diesem Gerät
              gespeichert. Nutze den Teilen-Link, um sie mit Freund:innen zu
              teilen oder später erneut zu laden.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function CarrierHighlight({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        {title}
      </h3>
      <p className="text-sm text-slate-600">{description}</p>
      <p className="text-xs font-medium text-slate-400">{meta}</p>
    </article>
  );
}

export default App;
