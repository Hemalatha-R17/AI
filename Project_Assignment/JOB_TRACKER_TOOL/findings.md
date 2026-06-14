# findings.md — Research Notes: Job Application Tracker

---

## localStorage Research

**Quota:** Most browsers allow 5–10 MB per origin. A job dataset of a few hundred entries with notes stays well under 1 MB.

**API pattern used:**
```js
// Write
localStorage.setItem(key, JSON.stringify(array));

// Read with fallback
try {
  return JSON.parse(localStorage.getItem(key)) || [];
} catch {
  return [];
}
```

**Sandbox caveat:** Some embedded environments (Claude Artifacts, certain iframes) block `localStorage`. The app wraps all storage access in try/catch. If a write throws, the in-memory array continues for the session — data is not persisted but the app remains functional.

**Custom image storage:** User-uploaded backgrounds are compressed to ≤1920 px wide at JPEG 82% before being base64-encoded and stored. If the result still exceeds the quota, the image is applied for the session only and not persisted.

---

## Drag-and-Drop Approach

**Decision:** Native HTML5 Drag-and-Drop API (`draggable="true"`, `ondragstart`, `ondragover`, `ondrop`).

**Why not pointer events or a library:**
- Keeps the single-file constraint — no external runtime needed.
- HTML5 DnD is universally supported and sufficient for a 7-column Kanban.
- Pointer-event DnD requires manual hit-testing across columns; HTML5 DnD handles this natively.

**Keyboard accessibility:** Every kanban card has `tabindex="0"` and `role="article"`. Edit and delete actions are reachable via Tab/Enter. A true keyboard-drag alternative (e.g., arrow keys to move between columns) was not implemented in v1; the Table view's inline status dropdown provides a full keyboard path for status changes.

---

## Accessible Table Sorting

**Pattern used:** `<th>` elements are clickable. `onclick="sortBy(col)"` toggles `asc`/`desc`. The active column receives a `.sorted` class (color highlight) and an inline `▲`/`▼` indicator via `<span id="si-{col}">`.

**Missing enhancement (future):** `aria-sort="ascending"/"descending"` on `<th>` for screen-reader announcement. Not implemented in v1.

---

## Reference Patterns Consulted

- Single-file Kanban examples (no external runtime) — layout cues only
- CSS custom property theming pattern for light/dark + accent color switching
- `canvas.toDataURL("image/jpeg", 0.82)` for image compression before localStorage storage
- `requestAnimationFrame` count-up animation for dashboard stat cards

---

## Decisions Made During Build

| Decision | Choice | Rationale |
|---|---|---|
| Persistence | `localStorage` | Zero-dependency, survives reload |
| DnD | HTML5 native | No library needed, single-file |
| Unique IDs | `Date.now().toString(36) + random` | No crypto API required |
| Status dropdown in form | `<select>` | Enforces enum, accessible |
| XSS prevention | `esc()` on all user strings | All strings injected via innerHTML |
| Delete confirmation | Two-step dialog | Prevents accidental data loss |
| AI chat | Opt-in, user's own key | Scope guard — no keys required for core tracker |
| Mobile layout | Fixed bottom nav + snap-scroll Kanban | Usable on small screens without squishing table |
