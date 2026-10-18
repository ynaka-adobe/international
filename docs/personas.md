# International Trucks — Personas

Four buyer personas drive content tagging, row filtering, and Adobe Target audiences. The numeric ID is the
value used everywhere: `?p=<id>` on the URL, `profile.persona` in Target, and the persona-filter cell on
authored rows (e.g. `1, 3`). Keep IDs stable; change names and copy freely.

| ID | Persona | Who | Primary interests | Primary CTA |
|---|---|---|---|---|
| 1 | Fleet Operations Manager | Fleet manager, maintenance director, or operations VP running a multi-truck fleet; judged on uptime and cost per mile | Uptime and maintenance, fuel efficiency and total cost of ownership, parts and service network | Find a dealer / build and price |
| 2 | Owner-Operator | Owner-operator or small-fleet owner buying one to a few trucks; sensitive to price, availability, financing | In-stock inventory, financing and promotions, nearby dealers | Contact seller / view inventory |
| 3 | Vocational & Procurement Buyer | Municipal, construction, utility, or refuse fleet buyer specifying vocational trucks through bids and cooperative contracts | Vocational specs and upfit, contract purchasing, warranty and compliance | Request a quote / download specs |
| 4 | EV & Sustainability Lead | Sustainability director, electrification program lead, or fleet strategist evaluating electric and low-emission trucks | Electric trucks, range and charging, incentives and total savings | Try the EV range calculator |

## Intent map (0-1)

| Persona | Explore | Research | Compare | Purchase | Deals | Support |
|---|---|---|---|---|---|---|
| 1 Fleet Operations Manager | 0.30 | 0.75 | 0.65 | 0.35 | 0.30 | 0.70 |
| 2 Owner-Operator | 0.40 | 0.50 | 0.65 | 0.80 | 0.85 | 0.30 |
| 3 Vocational & Procurement Buyer | 0.20 | 0.60 | 0.60 | 0.45 | 0.30 | 0.50 |
| 4 EV & Sustainability Lead | 0.70 | 0.60 | 0.35 | 0.15 | 0.30 | 0.20 |

## Where the definitions live

Edit all three together so they stay in sync:

- `head.html` — badge names (`NAMES`)
- `scripts/persona.js` — `PERSONA_NAMES`
- `tools/persona/persona.js` — `PERSONAS` (description, interests, intent map, metrics, trajectory)

## Notes

- These are demo personas assumed from the public site's audiences (fleet services, inventory, vocational
  series, fleet electrification). They have not been validated with International.
- Persona is currently set by URL (`?p=`), not inferred from behavior.
