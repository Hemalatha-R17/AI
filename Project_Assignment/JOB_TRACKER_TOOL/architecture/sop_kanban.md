# SOP: Kanban Board — Render and Drag-and-Drop

## Column Rendering

`renderKanban()` is called whenever the Kanban view is active and data changes.

1. `getFiltered()` returns the filtered job array
2. For each status in `STATUSES` (7 total), a `<div class="kanban-col">` is built
3. Jobs matching that status are rendered as `kcard` elements via `kanbanCard(j, i)`
4. Column count badge reflects filtered count (not total)

## Card Content

Each card shows:
- Company (bold), Role (muted)
- Chips: Location, Salary, Applied Date, Source
- Next Action text + date (italic, if set)
- Action row: URL link (if set), Edit button, Delete button

## Drag-and-Drop Protocol

Uses native HTML5 DnD API. No library.

```
card.draggable = true
card.ondragstart → onDragStart(e, id)   — stores dragId; adds .dragging class
card.ondragend   → onDragEnd(e)         — removes .dragging; clears .drag-over on all cols
col.ondragover   → onDragOver(e)        — e.preventDefault(); adds .drag-over
col.ondragleave  → onDragLeave(e)       — removes .drag-over
col.ondrop       → onDrop(e, newStatus) — updates job.status; persist(); renderAll()
```

## Status Update via Drop

```js
function onDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  if (!dragId) return;                          // no-op if dragId cleared
  const jobs = loadJobs();
  const job = jobs.find(j => j.id === dragId);
  if (job && job.status !== newStatus) {        // no-op if dropped in same column
    job.status = newStatus;
    persist(jobs);
    renderAll();
  }
  dragId = null;
}
```

## Keyboard Path for Status Changes

Cards have `tabindex="0"` for Tab navigation. Edit button opens the modal where the Status dropdown can be changed with keyboard. This is the full keyboard-accessible alternative to drag-and-drop.
