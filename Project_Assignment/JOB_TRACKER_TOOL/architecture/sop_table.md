# SOP: Table View — Sortable Columns

## State

```js
let sortCol = "appliedDate";   // default sort column
let sortDir = "desc";          // default direction (newest first)
```

Both are module-level variables, reset only when the user clicks a new column header.

## Sort Toggle

```js
function sortBy(col) {
  sortDir = (sortCol === col && sortDir === "asc") ? "desc" : "asc";
  sortCol = col;
  renderTable();
}
```

Clicking the same column toggles direction. Clicking a different column always starts `"asc"`.

## Sort Algorithm

```js
function sorted(jobs) {
  return [...jobs].sort((a, b) => {
    const va = (a[sortCol] || "").toLowerCase();
    const vb = (b[sortCol] || "").toLowerCase();
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
}
```

- Non-destructive (spreads the array before sorting)
- Treats `null`/`undefined` as `""` (sorts to top in `asc`, bottom in `desc`)
- String comparison — works correctly for ISO dates (`YYYY-MM-DD`) and alphabetic fields

## Sortable Columns

| Column | Field key |
|---|---|
| Company | `company` |
| Role | `role` |
| Location | `location` |
| Status | `status` |
| Applied | `appliedDate` |
| Salary | `salary` |
| Follow-up | `nextActionDate` |

Source, Contact, URL, and Actions columns are not sortable.

## Sort Indicators

Each sortable `<th>` has a `<span id="si-{col}">` that shows `▲` (asc) or `▼` (desc) for the active column. The active `<th>` also gets class `.sorted` (primary color highlight).
