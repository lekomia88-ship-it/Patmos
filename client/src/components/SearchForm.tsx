import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { TravelQuery } from '../types/api';

const ORIGIN_OPTIONS = [
  { code: 'FRA', label: 'Frankfurt (FRA)' },
  { code: 'MUC', label: 'München (MUC)' },
  { code: 'BER', label: 'Berlin (BER)' },
  { code: 'HAM', label: 'Hamburg (HAM)' },
  { code: 'DUS', label: 'Düsseldorf (DUS)' },
];

const FERRY_PORTS = [
  { code: 'PIR', label: 'Piräus (Athen)' },
  { code: 'KOS', label: 'Kos' },
  { code: 'RHO', label: 'Rhodos' },
  { code: 'LER', label: 'Leros' },
];

const OPERATORS = [
  { id: 'blue-star', label: 'Blue Star Ferries' },
  { id: 'dodekanisos', label: 'Dodekanisos Seaways' },
  { id: 'rooster', label: 'Rooster Ferry' },
];

interface SearchFormProps {
  defaultValues: TravelQuery;
  loading?: boolean;
  onSubmit: (values: TravelQuery) => void;
}

export function SearchForm({ defaultValues, loading, onSubmit }: SearchFormProps) {
  const [origin, setOrigin] = useState(defaultValues.origin ?? 'FRA');
  const [departureDate, setDepartureDate] = useState(
    defaultValues.departureDate ?? ''
  );
  const [returnDate, setReturnDate] = useState(defaultValues.returnDate ?? '');
  const [selectedPorts, setSelectedPorts] = useState<string[]>(
    defaultValues.ports ?? []
  );
  const [selectedOperators, setSelectedOperators] = useState<string[]>(
    defaultValues.operators ?? []
  );

  useEffect(() => {
    setOrigin(defaultValues.origin ?? 'FRA');
    setDepartureDate(defaultValues.departureDate ?? '');
    setReturnDate(defaultValues.returnDate ?? '');
    setSelectedPorts(defaultValues.ports ?? []);
    setSelectedOperators(defaultValues.operators ?? []);
  }, [defaultValues]);

  const toggleSelection = (
    value: string,
    list: string[],
    setList: Dispatch<SetStateAction<string[]>>
  ) => {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!departureDate) return;

    onSubmit({
      origin,
      departureDate,
      returnDate: returnDate || undefined,
      ports: selectedPorts,
      operators: selectedOperators,
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-3xl bg-white/80 p-6 shadow-card backdrop-blur transition md:grid-cols-[1.2fr,repeat(3,1fr),auto]"
    >
      <div className="flex flex-col">
        <label
          htmlFor="origin"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Abflughafen
        </label>
        <select
          id="origin"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          value={origin}
          onChange={(event) => setOrigin(event.target.value.toUpperCase())}
        >
          {ORIGIN_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="departureDate"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Hinreise
        </label>
        <input
          id="departureDate"
          type="date"
          min={today}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          value={departureDate}
          onChange={(event) => setDepartureDate(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="returnDate"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Rückreise (optional)
        </label>
        <input
          id="returnDate"
          type="date"
          min={departureDate || today}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          value={returnDate}
          onChange={(event) => setReturnDate(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:flex md:flex-col">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Fährhäfen
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FERRY_PORTS.map((port) => (
              <button
                key={port.code}
                type="button"
                onClick={() =>
                  toggleSelection(port.code, selectedPorts, setSelectedPorts)
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedPorts.includes(port.code)
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-500'
                }`}
              >
                {port.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Reedereien
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OPERATORS.map((operator) => (
              <button
                key={operator.id}
                type="button"
                onClick={() =>
                  toggleSelection(
                    operator.id,
                    selectedOperators,
                    setSelectedOperators
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedOperators.includes(operator.id)
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-500'
                }`}
              >
                {operator.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Suche...' : 'Verbindungen finden'}
        </button>
      </div>
    </form>
  );
}
