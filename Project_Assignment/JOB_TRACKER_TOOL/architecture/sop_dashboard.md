# SOP: Dashboard — Stats and Response Rate

## Stat Cards

| Card | ID | Formula |
|---|---|---|
| Total | `stat-total` | `all.length` |
| Wishlist | `stat-wishlist` | `status === "Wishlist"` |
| Applied | `stat-applied` | `status !== "Wishlist"` |
| Interviews | `stat-interviews` | `status in {Interview, Offer, Accepted}` |
| Response Rate | `stat-rate` | `interviews / applied × 100` — shows `—` if applied = 0 |
| Offers | `stat-offers` | `status in {Offer, Accepted}` |
| Rejected | `stat-rejected` | `status === "Rejected"` |

Note: "Applied" counts all non-Wishlist entries (i.e. Phone Screen also counts as applied). This matches the intent of the response rate: how many submitted applications progressed to interview stage.

## renderDashboard()

Reads from `loadJobs()` (full dataset, not filtered view). Dashboard always reflects the complete picture regardless of active search/filter.

## Count-Up Animation

```js
function countUp(el, target, duration = 500) {
  const from = parseInt(el.textContent) || 0;
  if (from === target) return;             // skip if unchanged
  // ... requestAnimationFrame loop with ease-out-cubic
  // on finish: adds .pop class for a brief scale-up micro-animation
}
```

Response rate is a string (`"42%"` or `"—"`) — set directly without count-up.

## When to Render

`renderDashboard()` is called inside `renderAll()`, which is triggered after every:
- Add / edit / delete
- Drag-and-drop status change
- View switch (table ↔ kanban)
