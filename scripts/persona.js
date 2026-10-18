// Shared persona helpers for blocks that personalize or filter authored rows.
// head.html sets window.demoProfile from ?p= or the demoProfile cookie.

// A persona-filter cell holds nothing but persona tokens, e.g. "1", "1, 3", "2 4".
const FILTER_RE = /^[1-4](\s*[,\s]\s*[1-4])*$/;

// Display names for the four demo personas, kept in sync with the PERSONAS
// array authored in tools/persona/persona.js (the sidekick persona-switcher
// palette). Duplicated rather than imported because that tool page is a
// standalone admin surface, not part of the regular page bundle.
export const PERSONA_NAMES = {
  1: 'Fleet Operations Manager',
  2: 'Owner-Operator',
  3: 'Vocational & Procurement Buyer',
  4: 'EV & Sustainability Lead',
};

/**
 * @param {string} pid persona id, e.g. from personaId()
 * @returns {string} display name, or '' when pid is unknown/empty
 */
export function personaName(pid) {
  return PERSONA_NAMES[pid] || '';
}

/**
 * @returns {string} active persona id, or '' when no persona is active.
 */
export function personaId() {
  const d = window.demoProfile || {};
  if (d.persona !== undefined && d.persona !== null && d.persona !== '') return String(d.persona);
  return new URLSearchParams(window.location.search).get('p') || '';
}

/**
 * Finds the optional trailing persona-filter cell of a row.
 * Matched on content, not position, so it is never confused with an
 * authored copy column (e.g. the cards per-persona overrides cell).
 * @param {HTMLElement[]} cells candidate cells, in authored order
 * @returns {HTMLElement|null}
 */
export function findPersonaFilterCell(cells) {
  const last = cells[cells.length - 1];
  if (!last) return null;
  return FILTER_RE.test((last.textContent || '').trim()) ? last : null;
}

/**
 * @param {HTMLElement} cell persona-filter cell
 * @param {string} pid active persona id
 * @returns {boolean} whether the row should stay in the DOM
 */
export function matchesPersona(cell, pid) {
  // No active persona means no filtering at all — every row shows.
  if (!pid) return true;
  const tokens = (cell.textContent || '').trim().split(/[,\s]+/).filter(Boolean);
  // An empty cell is untagged, so it always shows.
  return tokens.length === 0 || tokens.includes(String(pid));
}

/**
 * Persona tags for a row, from a stripped persona-filter cell.
 * @param {HTMLElement} cell persona-filter cell
 * @returns {string[]} e.g. ['1', '3'], or [] when untagged
 */
export function personaTags(cell) {
  return (cell.textContent || '').trim().split(/[,\s]+/).filter(Boolean);
}

/**
 * Drops the trailing persona-filter cell (if any) from each row and filters
 * out rows that don't match the active persona. Call this first, on the raw
 * authored rows, before a card/list block builds its markup from cells — so
 * the filter cell is never mistaken for authored content and non-matching
 * rows never reach the DOM.
 *
 * Matching rows that were tagged get a `data-persona-tags` attribute (e.g.
 * "1,3") so the hidden persona-tagging overlay (toggled from the insights
 * panel) can show what each surviving card was tagged with.
 *
 * @param {HTMLElement[]} rows authored row elements (a block's direct children)
 * @returns {HTMLElement[]} rows that should be rendered, filter cell removed
 */
export function filterPersonaRows(rows) {
  const pid = personaId();
  return rows.filter((row) => {
    const cells = [...row.children];
    const filterCell = findPersonaFilterCell(cells);
    if (!filterCell) return true;
    const tags = personaTags(filterCell);
    filterCell.remove();
    if (tags.length) row.dataset.personaTags = tags.join(',');
    return matchesPersona({ textContent: tags.join(' ') }, pid);
  });
}
