# 3DClash

**An AI design coordinator for buildings and machines.**

On a building or a machine, separate teams design separate parts. When the designs come together, parts collide: a duct through a beam, a cable tray through a pipe. 3DClash finds each collision, asks an AI to suggest real edits that fix it, and proves every edit with geometry before a person sees it.

- **Fixes, not just findings.** Each suggestion is a real edit to the 3D model.
- **Every fix proven before you see it.** A geometry check confirms that the clash is gone, the required gap is kept, and nothing new is hit.
- **Two apps, one core.** A reusable template powers a building app and a machine app.

## Status

The full project plan is in [docs/PLAN.md](docs/PLAN.md). The application code was carried over from an earlier project; see [Licence](#licence).

## Layout

The code in the repository today is the carried-over application (`web/`, `server/`, `deploy/`, `samples/`, `docs/`, `evals/`, `spikes/`, `assets/brand/3dclash/`). The folders planned in [docs/PLAN.md](docs/PLAN.md) are in place as empty placeholders for the next phase.

| Folder | Contents |
|---|---|
| `web/` | React and Vite web app: model viewer, clash list, fixes and chat |
| `server/` | Python server (package `clash3d`, FastAPI): model loading, geometry checks, AI proposals, API and MCP |
| `deploy/` | Modal deployment for the public demo |
| `samples/` | Bundled synthetic IFC and STEP models, with provenance in [samples/README.md](samples/README.md) |
| `docs/` | Architecture guide, plan and feature notes |
| `evals/` | Real-model evaluation harness, separate from the unit tests |
| `spikes/` | Day-1 spike code |
| `assets/brand/3dclash/` | Approved identity and motion kit |
| `template/` | Placeholder: reusable core (model loader interface, geometry check, fix loop, edits, ranking, MCP server, viewer base) |
| `apps/building/` | Placeholder: building app (IFC models, building rules, building demo) |
| `apps/machine/` | Placeholder: machine app (STEP models, machine rules, machine demo) |
| `powers/3dclash/` | Placeholder: Kiro Power that lets Kiro users fix clashes from Kiro chat |
| `.kiro/` | Kiro specs, steering, hooks, agents, workflows and settings |

## Run locally

### 1. Prerequisites

- [Git](https://git-scm.com/downloads).
- [Node.js](https://nodejs.org/en/download) **LTS, version 22.12 or newer**, including npm.
- [uv](https://docs.astral.sh/uv/getting-started/installation/). It installs **Python 3.13** for this project;
  you do not need to install Python separately.
- A current desktop browser with WebGL enabled. Internet access is needed to install dependencies and use AI features.

**Windows PowerShell:** install uv and Node.js (with npm) before running the setup commands:

```powershell
winget install --id=astral-sh.uv -e
winget install --id=OpenJS.NodeJS.LTS -e
```

**Close and reopen PowerShell** so it sees the updated PATH, then check:

```powershell
git --version
uv --version
node --version
npm.cmd --version
```

Use **`npm.cmd` in PowerShell**: Windows may block the `npm.ps1` wrapper when scripts are disabled. The commands
below use `npm.cmd` for Windows; **on macOS/Linux, use `npm` instead**. No execution-policy change is needed.
On macOS/Linux, install Node.js and uv using the links above and check the same versions with `npm --version`.

**Linux:** install the OpenCASCADE runtime library before starting the server: `sudo apt install libgl1` on
Ubuntu/Debian. [PDF reports need additional system libraries](#pdf-system-libraries) on every platform; you can
skip those initially if you only want to view models, check clashes and try fixes.

### 2. Clone and install

Run from the directory where you keep your projects:

```text
git clone https://github.com/priyanshusharmapc/3D-Clash.git
cd 3D-Clash
uv python install 3.13
uv sync --project server --locked --python 3.13
npm.cmd ci --prefix web
```

`npm ci` also copies the viewer's WebAssembly files into `web/public/wasm/`. The Python environment lives in
`server/.venv/`; no manual activation is needed. The server package is still named `clash3d`, as are its
`CLASH3D_*` settings.

Create the local configuration **at the repo root**, keeping an existing `.env` if you have one:

```powershell
# Windows PowerShell, from 3D-Clash/
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

```bash
# macOS / Linux, from 3D-Clash/
test -f .env || cp .env.example .env
```

You can leave the API keys empty for the first geometry check. See [Enable AI features](#enable-ai-features)
when you want 3DClash to propose fixes.

### 3. Start both servers

**Terminal 1 — start in `3D-Clash/`:**

```text
cd server
uv run --locked uvicorn clash3d.app:app --reload --reload-dir clash3d --host 127.0.0.1 --port 8000
```

**Terminal 2 — open a new terminal in `3D-Clash/`:**

```text
cd web
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Keep both terminals running and open **[http://127.0.0.1:5173](http://127.0.0.1:5173)**.
Vite forwards `/api` requests to the Python server on port 8000. To check the API separately, open
[http://127.0.0.1:8000/api/samples](http://127.0.0.1:8000/api/samples); it should return JSON with `files` and `demos`.
Stop either server with **Ctrl+C**. Server reloads discard open scenes and unexported edits; export anything you
want to keep before restarting or editing Python files.

### 4. First check, without an API key

Generate a small synthetic model in a third terminal, starting in `3D-Clash/`:

```text
uv run --directory server --locked python -m clash3d.fixtures ../samples/fixture-clash.ifc
```

1. Refresh the page and open **Menu** (the ☰ button, top right). Under **Models**, the four Northbank files are
   ticked already: untick them, tick only `fixture-clash.ifc`, and choose **Open 1 model**.
2. Choose **Check 3 elements** in the left panel, then pick clash **#1** (the beam and the duct) in the list.
   Or double-click **Supply duct 400x300** as element A, then **UB 406x178 beam** as element B.
3. Expand **Try a move yourself**, enter **-0.80** in **Move A vertically (m)**, and choose **Check this move**.
4. Expect **Clear · nearest +50 mm**. A **-0.40** move clears the beam but hits the pipe. These checks preview moves;
   they do not change the saved source file.

### Demo models for local use

**Both demo model sets are included in [samples/](samples/README.md).**
(eight IFC/STEP files, about 15 MB total). A normal clone is enough: no separate download, Git LFS or private-repository
access is needed. Open the Northbank card to follow the judge walkthrough above. The machine card opens PC-03 from
STEP; its first conversion takes longer, and AI part classification requires credentials as described below.

Northbank's six IFC files include the original coordination set, grids and the designer's fixed MEP revision.
PC-03 includes the original Rev A and fixed Rev B STEP files. Northbank is baseline data;
the PC-03 models were generated for this project. Both are synthetic assets, with no customer data. Generator source
code, Revit files and optional Navisworks evaluation packages are not included. See [samples/README.md](samples/README.md)
for provenance and optional evaluation inputs.

### Enable AI features

Edit the root `.env` and set **`META_API_KEY`** to a key with access to the configured Meta models. The template
already sets the API URL, model and reasoning effort. Write values **without quotes or inline comments**, keep
`.env` out of git, and restart the Python server after changes. Existing process environment variables override `.env`.

| Feature | Credentials |
|---|---|
| IFC viewing, geometry detection, measuring, manual move checks | None |
| Proposals, chat, AI triage/titles, coordinated plans and report text | `META_API_KEY` |
| STEP conversion | None for geometry; AI part classification needs a model key. Without classification, parts use generic IFC classes |
| Optional open-weights triage, titles and STEP classification | `TRIAGE_API_KEY` (or `BASETEN_API_KEY`) **and** `CLASH3D_OPEN_WEIGHTS=1`; proposals still need the Meta key |

The open-weights host is optional; leave its key empty for the simplest setup. Owner settings are optional too.
Live AI calls need provider access and may incur charges; local proposal/chat caps are off unless configured.
Use your own Meta API key with access to the models named in `.env` (`META_MODEL`). Everything else in this guide
works locally without a key.
All settings are documented in [the configuration reference](docs/architecture/15-requirements-settings-and-config.md).

### PDF system libraries

Install these before generating PDF reports or running the full server test suite. Python dependencies alone do
not install Pango and its native libraries. See [WeasyPrint's platform instructions](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation).

- **Ubuntu/Debian:** `sudo apt install libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libharfbuzz-subset0 fonts-dejavu-core`
  (plus `libgl1` from the prerequisites).
- **macOS with Homebrew:** `brew install pango libffi`.
- **Windows:** install [MSYS2](https://www.msys2.org/), then run `pacman -S mingw-w64-ucrt-x86_64-pango` in its
  **UCRT64** shell. If Python cannot find the DLLs, set `$env:WEASYPRINT_DLL_DIRECTORIES = 'C:\msys64\ucrt64\bin'`
  in the PowerShell terminal used to start the server/tests (adjust for your MSYS2 installation).

From `3D-Clash/`, check discovery with `uv run --directory server --locked python -m weasyprint --info`.

### Updating from GitHub

**For routine updates: export your edits, stop both servers, pull, sync dependencies, then restart.**
Accepted model edits live in the Python process until you export them; a server restart loses that in-memory work.

1. Export any model edits you want to keep, and wait for active proposals/checks to finish.
2. Press **Ctrl+C** in both server terminals.
3. In a terminal at `3D-Clash/`, run `git status --short`. Commit local code/doc changes on a working branch before
   switching branches or pulling; do not discard changes to make an update pass. `.env` and ignored local data stay local.
4. For the latest merged application, run these from `3D-Clash/` **once your working tree is clean**:

   ```powershell
   git switch main
   git pull --ff-only origin main
   uv sync --project server --locked --python 3.13
   npm.cmd ci --prefix web
   ```

   `--ff-only` stops if your local main has diverged; resolve that before continuing. If you are developing on a
   feature branch, update that branch deliberately rather than switching to main with unfinished work.
5. Restart both servers using the commands above, refresh the browser and reopen your models.

For small edits during development, [Vite hot-reloads web source changes](https://vite.dev/guide/features.html#hot-module-replacement)
and uvicorn's `--reload` restarts on Python
changes in `server/clash3d/` only (`--reload-dir clash3d`). Without it uvicorn also watches `server/.venv`, so a
package install or `uv sync` there (another terminal, a test run) restarts the server, and a restart drops every
open model, fix and check: the page then offers to open them again. A Git pull can change both source and
dependencies at once, so use the stopped-server workflow above.
To check for updates while keeping the app running, `git fetch origin` updates remote references without changing
your working files; `git log --oneline HEAD..origin/main` shows commits not in your current checkout.

### Troubleshooting

| Symptom | Check |
|---|---|
| `uv`, `node` or `npm` is missing | Install the prerequisites and reopen the terminal. `python` opening the Windows Store is avoidable: use the documented `uv` commands |
| `npm.ps1 cannot be loaded because running scripts is disabled` | Use `npm.cmd` in PowerShell, including `npm.cmd ci --prefix web` from `3D-Clash/`, or `npm.cmd ci` if already in `3D-Clash/web/` |
| Port 8000 or 5173 is busy | Stop the process already using it, then restart. Keep port 8000 unless you also change Vite's API proxy in `web/vite.config.ts` |
| Page loads but API requests fail | Confirm both terminals are running; check `/api/samples` on port 8000 and read the Python terminal's error |
| Demo cards or files are missing | Confirm the eight bundled model files exist in `samples/` and `/api/samples` lists them; restart the server if you just restored files |
| Viewer reports missing `.wasm` files | From `3D-Clash/`, run `npm.cmd run copy-wasm --prefix web` (macOS/Linux: `npm`), then refresh; check that WebGL is enabled |
| AI request fails | Check the root `.env`, model access and quota, then restart the server. Empty keys allow geometry checks, not AI calls |
| PDF reports fail with a missing-library error | Install the PDF system libraries and check DLL discovery on Windows |
| Open models vanish ("Open them again") and the Python terminal shows `WatchFiles detected changes in '.venv\...'` | The server was started without `--reload-dir clash3d`, so a package install restarted it. Restart it with the command above |
| MCP client cannot connect through port 5173 | Use `http://127.0.0.1:8000/mcp` with the app's pairing token; Vite proxies `/api`, not `/mcp` |

## Deploy (public demo on Modal)

One container serves the built web app and the API from the same origin
([`deploy/modal_app.py`](deploy/modal_app.py)). This is optional: local development needs no Modal account.
The bundled IFC/STEP files are ready in `samples/`; optional sample clash reports go in `samples/reports/<name>/`.
For the Modal CLI installation, authentication and STEP conversion cache, follow
[the deployment guide](docs/architecture/17-deployment-and-operations.md).

```bash
cd web && npm ci && npm run build && cd ..
modal secret create sightline-meta META_API_KEY="$META_API_KEY" TRIAGE_API_KEY="$BASETEN_API_KEY" --force   # once; no echo
modal deploy deploy/modal_app.py
```

It runs one container on purpose: open models and edits live in server memory. The container is kept warm
(`min_containers=1`, about $3 a day at Modal's list prices), so the first visitor after a quiet spell doesn't wait for
a cold start; set it to 0 to let it stop after 20 idle minutes. Proposals are capped per visitor
and per day (`CLASH3D_PROPOSE_PER_HOUR`, `CLASH3D_PROPOSE_PER_DAY`, in `server/clash3d/limits.py`), because
each one is a paid Muse Spark call; **Check this move** is not limited.

### Owner settings

Set `CLASH3D_OWNER_TOKEN` (24+ characters, in the `sightline-meta` Modal secret, never in git) and open the site with
`#owner` to unlock the gear in the header. It has two scopes:
- **For me:** Muse Spark and triage reasoning effort, the open-weights model on or off, second tries on Muse Wonder,
  Show it built, and skipping the demo caps, for the owner's own requests only (kept in that browser).
- **For everyone:** Muse Spark and triage reasoning effort, the open-weights model, second tries on Muse Wonder and
  Show it built, for every visitor (`server/clash3d/settings.py`, kept in the `sightline-settings` Modal Dict, or a
  JSON file locally, so they survive restarts).

The owner's own settings win for the owner; the settings for everyone win over the environment. The open-weights model
(Muse Spark Open, which writes clash titles and runs triage) is **off** unless switched on (`CLASH3D_OPEN_WEIGHTS`,
default `0`): off, titles and triage use Muse Spark.


## Tests

Run all three from `3D-Clash/` after installing dependencies (and the PDF system libraries for the server suite):

```text
uv run --directory server --locked pytest -q
npm.cmd run build --prefix web
npm.cmd test --prefix web
```

On macOS/Linux, use `npm` in place of `npm.cmd`.

Test counts from the earlier build are not carried over. Run the suites to see current results.

The unit tests use synthetic models and scripted AI responses; they need no API keys or private demo files.
Real-model [evals](evals/README.md) are separate and may need additional data and paid model calls.


## How it is built

The approved [3DClash identity and motion kit](assets/brand/3dclash/README.md) is kept in `assets/brand/3dclash/` for the upcoming
application redesign: editable masters, static exports, loading animations and integration examples. Its design and
adoption notes are in [docs/brand-assets.md](docs/brand-assets.md).

[docs/architecture/](docs/architecture/README.md) maps the whole application: product and journeys, architecture,
end-to-end flows, the server and web code, geometry, fixes, AI models and prompts, the API and MCP, files in and out,
configuration, security and caps, deployment, tests and evals, demo data and decisions, with diagrams. Feature designs
are in [docs/](docs/).


## Day-1 spikes

See [spikes/README.md](spikes/README.md).


## Licence

This repository does not include a licence file. The application code was carried over from an earlier project. Dependencies keep their own licences: IfcOpenShell (LGPL-3.0), web-ifc (MPL-2.0), three.js (MIT), React (MIT).

The eight bundled synthetic demo models in `samples/` are described, with their provenance, in [samples/README.md](samples/README.md).
