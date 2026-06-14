# SOP: Search & Filter

## Filter State

Three independent inputs compose with AND logic:

| Input | Element ID | Matches on |
|---|---|---|
| Free text | `search-input` | `company` OR `role` (case-insensitive) |
| Status | `filter-status` | Exact enum match |
| Source | `filter-source` | Exact string match |

## Filter Function

```js
function getFiltered() {
  const q      = document.getElementById("search-input").value.toLowerCase().trim();
  const status = document.getElementById("filter-status").value;
  const source = document.getElementById("filter-source").value;
  let jobs = loadJobs();

  if (q)      jobs = jobs.filter(j =>
                j.company.toLowerCase().includes(q) ||
                j.role.toLowerCase().includes(q));
  if (status) jobs = jobs.filter(j => j.status === status);
  if (source) jobs = jobs.filter(j => j.source === source);

  return jobs;
}
```

Always reads from `loadJobs()` (persisted state), not a cached array.

## Trigger

All three inputs call `applyFilters()` on `oninput` / `onchange`:

```js
function applyFilters() {
  if (currentView === "table") renderTable();
  else renderKanban();
}
```

Dashboard is NOT re-filtered — it always shows totals across the full dataset.

## Source Dropdown

`refreshSourceFilter()` rebuilds the source dropdown from live data after every mutation:
- Collects unique non-empty `source` values from `loadJobs()`
- Sorts alphabetically
- Preserves the current selection if it still exists in the updated list

This ensures the dropdown never shows stale sources after entries are deleted.
