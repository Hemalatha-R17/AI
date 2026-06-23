# LangFlow - Quick Start Reference

## Installation Details

| Item | Value |
|------|-------|
| Python | 3.13 |
| Installer | `uv` (fast package manager) |
| Virtual Env | `.venv\` |
| LangFlow URL | http://localhost:7860 |

---

## Start LangFlow

Open PowerShell inside the `chapter_05_LangFlow` folder and run:

```powershell
.venv\Scripts\langflow.exe run
```

Or using the full path from anywhere:

```powershell
C:\Users\Hema Rajanna\Desktop\AI\chapter_05_LangFlow\.venv\Scripts\langflow.exe run
```

Wait for this message in the terminal:

```
Application startup complete.
Uvicorn running on http://localhost:7860
```

Then open your browser and go to: **http://localhost:7860**

---

## Stop LangFlow

Press `Ctrl + C` in the terminal where LangFlow is running.

---

## Reinstall (if venv is broken)

```powershell
# From C:\Users\Hema Rajanna\Desktop\AI\chapter_05_LangFlow\
Remove-Item -Recurse -Force .venv
uv venv .venv --python 3.13
uv pip install langflow --python .venv\Scripts\python.exe
```

> `uv` must be installed globally: `py -3.13 -m pip install uv`

---

## Log Files

Startup logs are written to:
- `langflow.log` — stdout
- `langflow_err.log` — stderr (check here if something goes wrong)
