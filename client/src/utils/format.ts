import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function formatDateTime(iso: string, locale = 'de-DE') {
  return dayjs(iso).locale(locale).format('DD.MM.YYYY HH:mm');
}

export function formatTime(iso: string, locale = 'de-DE') {
  return dayjs(iso).locale(locale).format('HH:mm');
}

export function formatDate(iso: string, locale = 'de-DE') {
  return dayjs(iso).locale(locale).format('DD.MM.YYYY');
}

export function formatDuration(minutes: number) {
  const d = dayjs.duration(minutes, 'minutes');
  const hours = Math.floor(d.asHours());
  const mins = d.minutes();
  if (hours === 0) {
    return `${mins} Min`;
  }
  return `${hours} Std ${mins.toString().padStart(2, '0')} Min`;
}

export function formatPrice(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function describeLayover(minutes: number) {
  if (minutes < 120) {
    return 'Knapp';
  }
  if (minutes < 240) {
    return 'Ausgeglichen';
  }
  if (minutes < 360) {
    return 'Entspannt';
  }
  return 'Lange Verbindung';
}
