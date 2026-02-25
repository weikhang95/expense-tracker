# Mission Control Module

This folder isolates Mission Control from the core tracker implementation.

## Scope
- Owns mission panel markup, styles, mission checks, and mission state persistence.
- Uses `localStorage` key `op_patchwork_missions`.

## Integration Contract
Mission Control only talks to `window.ExpenseTrackerApp` from `script.js`.

Expected API:
- `getTransactions()`
- `addTransaction(transaction)`
- `renderTransaction(transaction)`
- `removeTransaction(id)`
- `render()`
- `updateValues()`
- `getDisplayedTotals()`
- `getListElement()`
- `getDownloadCSV()`
- `setSearchTerm(value)`
- `getSearchTerm()`
- `getRenderedTransactionCount()`

## Hidden Mission Check
- `M4` is a hidden check for destructive search behavior.
- It runs when `Run Checks` is pressed, persists in mission state, and logs result in console.
- It does not change the visible score denominator (`30 pts`).

## Guardrail
For tracker-only changes, avoid editing files in this folder unless the integration contract changes.
