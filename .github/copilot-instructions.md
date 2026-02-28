# GitHub Copilot / AI Agent Instructions

Purpose
- Help an AI coding agent become immediately productive in this repository. The workspace was empty when this file was generated; please point the agent to the code locations if they differ from common paths.

Quick scan summary
- Repo root checked: no source files found.
- If your project has code, typical locations the agent will look for: `package.json`, `pyproject.toml`, `requirements.txt`, `src/`, `app/`, `server/`, `cmd/`, `README.md`.

Big-picture detection (what to look for)
- Identify the entrypoints: look for `main()` functions, `index.js`, `server.js`, `app.py`, or `run` scripts in `package.json`/`pyproject.toml`.
- Find service boundaries by searching for folders named `api`, `worker`, `jobs`, `db`, or `ui`.
- Detect data flows by tracing HTTP handlers, message queue publishers/consumers (`rabbitmq`, `kafka`, `celery`), and DB access layers (`models/`, `migrations/`).

Project-specific guidance (when code is present)
- If a `package.json` exists: prefer `npm run <script>` or `pnpm`/`yarn` equivalents listed under `scripts` for build/test commands.
- If Python: look for `pyproject.toml`, `requirements.txt`, or `Pipfile`; use `poetry run` or `pip install -r requirements.txt` before running tests.
- If tests exist in `tests/` or `spec/`, run `pytest` or the language-appropriate test runner and prefer editing tests that explain intended behavior.

Patterns & conventions to preserve
- Preserve API contracts: don't change public REST endpoints or message formats without adding compatibility tests and a migration plan.
- Follow existing folder-level boundaries: add new modules under the same component folder (e.g., `server/` vs `client/`).
- Commit style: keep changes small and atomic; prefer descriptive commits with `feat:`, `fix:`, `chore:` prefixes.

Integration & external deps
- Look for env config files: `.env`, `.env.example`, or `config/` directories. Do not hardcode secrets—prefer adding keys to `.env` and documenting them in `README.md`.
- Note external services by searching for hostnames, DSNs, or SDK clients (e.g., `aws-sdk`, `psycopg2`, `sqlalchemy`, `firebase-admin`). Document which migrations or local services are required to run integration tests.

What to change in code
- When adding features, create focused unit tests near the changed code; mirror existing test styles and runners.
- If adding or modifying DB schema, add migration files and an entry in the migrations index.

How to handle missing information
- If commands, env vars, or service endpoints are missing, add a TODO in `README.md` and prefer an interactive question to the repo owner rather than guessing.
- If the repo is empty or incomplete (as detected), ask the user to point to the primary language and where source files live.

Examples to search for (these help quickly infer architecture)
- `package.json` (npm scripts, dependencies)
- `Dockerfile` or `docker-compose.yml` (runtime services)
- `Procfile` (Heroku-style runtime commands)
- `src/main.go`, `cmd/`, `app.py`, `server.js`, `index.ts`

Safety and correctness checks for AI changes
- Run unit tests after changes when possible; if tests fail, prefer reverting or leaving a clear failure note rather than pushing uncertain fixes.
- Do not commit credentials or change infra configuration without explicit user approval.

When in doubt, ask
- Where is the source code? Which language/tooling is primary? Which test command should be used locally?

Next steps for the human:
- If you want a merge into your repo, provide paths to the main source files or grant access to the populated repository. Then the agent will re-scan and update these instructions with concrete examples and commands.

-- End of agent instructions (auto-generated)
