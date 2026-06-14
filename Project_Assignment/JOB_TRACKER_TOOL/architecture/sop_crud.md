# SOP: CRUD — Add / Edit / Delete

## ID Generation

```js
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
```
IDs are string-based, monotonically increasing, collision-resistant for a single-user personal tool.

## Validation Rules

Required fields: `company`, `role`, `status`
All other fields are optional. An empty string is a valid value for optional fields.

## Add Entry

1. User clicks "+ Add Application" → `openModal(null)`
2. Modal form resets; title = "Add Application"
3. On submit → `saveJob(event)`:
   - `e.preventDefault()`
   - Validate `company`, `role`, `status` — alert if any missing
   - Build `payload` object from all form fields
   - `jobs.unshift({ id: uid(), ...payload })` — new entries go to top
   - `persist(jobs)` → `closeModal()` → `renderAll()`

## Edit Entry

1. User clicks "Edit" on a table row or the pencil icon on a kanban card → `openModal(id)`
2. `loadJobs().find(j => j.id === id)` retrieves the entry
3. `setField(formId, value)` pre-populates all 12 form inputs
4. On submit → `saveJob(event)`:
   - Same validation as Add
   - `jobs[idx] = { ...jobs[idx], ...payload }` — spread preserves `id`
   - `persist(jobs)` → `closeModal()` → `renderAll()`

## Delete Entry

Two-step to prevent accidental loss:
1. `deleteJob(id)` → sets `_delPendingId`; populates dialog text; opens `.del-overlay`
2. `delConfirm()` → filters out the entry; `persist()`; closes dialog; `renderAll()`
3. `delCancel()` → clears `_delPendingId`; closes dialog; no data change
