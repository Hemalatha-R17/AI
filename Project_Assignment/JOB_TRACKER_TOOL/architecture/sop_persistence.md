# SOP: Persistence — Load, Save, Fallback

## Storage Key

`"jat-v1"` — versioned key to allow future schema migrations without corrupting old data.

## Load on Startup

```js
function loadJobs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
```

Called on every read (not cached in memory) so the table/kanban always reflects the latest persisted state. The `try/catch` handles:
- `localStorage` blocked (returns `null` → `|| []`)
- Corrupt JSON (parse throws → returns `[]`)

## Save on Every Mutation

```js
function persist(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}
```

Called immediately after every add, edit, delete, or drag-drop status change — before `renderAll()`. If `setItem` throws (quota exceeded), the in-memory `jobs` array was already mutated so the current session continues correctly; the data just won't survive reload.

## Seed on First Launch

```js
function seedIfEmpty() {
  if (loadJobs().length > 0) return;
  persist([/* 3 sample entries */]);
}
```

Idempotent — checks first, seeds only if the store is empty. Runs once at page boot, before `renderAll()`.

## Other Persisted Settings

| Key | Value |
|---|---|
| `jat-theme` | `"light"` or `"dark"` |
| `jat-bg` | preset key (e.g. `"default"`, `"ocean"`) or `"custom"` |
| `jat-bg-custom` | base64 JPEG data URI or image URL |
| `jat-style` | `"default"`, `"cartoon"`, `"classic"`, `"neon"`, `"retro"` |
| `jat-provider` | active AI provider id |
| `jat-model-<provider>` | saved model id per provider |
| `jat-key-<provider>` | API key per provider |
