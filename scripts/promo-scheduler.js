/**
 * Promo Scheduler
 *
 * Fetches /fragments/promo-scheduler.json, picks the fragment whose
 * start/end window contains today, and falls back to the row with no
 * start/end date (the default).
 *
 * Date override (persists for the browser session):
 *   ?url.date=2026-07-15   — set via URL param, stored in sessionStorage
 *   sessionStorage['url.date'] — read on subsequent page loads
 */

const SCHEDULER_URL = '/fragments/promo-scheduler.json';
const DATE_KEY = 'url.date';

function getEffectiveDate() {
  const params = new URLSearchParams(window.location.search);
  const urlDate = params.get(DATE_KEY);
  if (urlDate) {
    sessionStorage.setItem(DATE_KEY, urlDate);
    return new Date(urlDate);
  }
  const stored = sessionStorage.getItem(DATE_KEY);
  if (stored) return new Date(stored);
  return new Date();
}

async function fetchFragment(path) {
  const url = `${path}.plain.html`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch fragment: ${url}`);
  return resp.text();
}

export default async function initPromoScheduler(container) {
  const resp = await fetch(SCHEDULER_URL);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.warn('Promo scheduler: could not load', SCHEDULER_URL);
    return;
  }

  const { data } = await resp.json();
  const now = getEffectiveDate();

  // first in-window row wins; otherwise the first row without dates is the default
  const rows = data
    .map((row) => ({
      start: row.start ? new Date(row.start) : null,
      end: row.end ? new Date(row.end) : null,
      // Support both "fragment URL" (current sheet header) and "fragment"
      fragment: row['fragment URL'] || row.fragment || '',
    }))
    .filter((row) => row.fragment);
  const inWindow = (row) => row.start && row.end && now >= row.start && now < row.end;
  const match = rows.find(inWindow)?.fragment || null;
  const fallback = rows.find((row) => !row.start && !row.end)?.fragment || null;

  const chosen = match || fallback;
  if (!chosen) return;

  try {
    const html = await fetchFragment(chosen);
    const target = container || document.querySelector('.promo-banner');
    if (target) target.innerHTML = html;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Promo scheduler:', err.message);
  }
}
