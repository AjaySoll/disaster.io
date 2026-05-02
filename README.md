# disaster.io

Multi-agent disaster response logistics coordinator. Six specialist Claude
agents collaborate in real time — assessing needs, tracking inventory, planning
routes, prioritising tasks, briefing responders, and producing a final action
plan during simulated disaster scenarios.

```
┌──────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│ Situation        │  │ Agent activity         │  │ Action plan            │
│ • locations      │  │ Needs / Inventory /    │  │ Inventory              │
│ • blocked roads  │  │ Routes / Priority /    │  │ Situation report       │
│ • add update     │  │ Comms / Coordinator    │  │                        │
└──────────────────┘  └────────────────────────┘  └────────────────────────┘
                            Event history log
```

## Tech stack

- **Frontend** — React 18 + Vite + TypeScript + Tailwind CSS
- **Backend** — Node.js (>= 20) + Express + Mongoose
- **Database** — MongoDB (Atlas recommended)
- **Agents** — Anthropic `claude-sonnet-4-20250514` via `@anthropic-ai/sdk`
- **Repo** — npm workspaces (`/client`, `/server`)

## Getting started

### 1. Prerequisites

- Node.js **20.6+** (we use the built-in `--env-file` flag)
- A MongoDB Atlas cluster (or any Mongo URI)
- An Anthropic API key with access to `claude-sonnet-4-20250514`

### 2. Install

```bash
npm install
```

This installs both `client` and `server` workspaces from the repo root.

### 3. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/disasterio
PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

The server reads `/.env` via Node's `--env-file-if-exists`. The client reads
`VITE_API_BASE_URL` at build time via Vite's standard env handling — set it in
the same root `.env` (Vite will also pick up a `client/.env` if you prefer).

### 4. Run in dev

```bash
npm run dev
```

This starts both processes in parallel:

- **server** — http://localhost:3001 (Express + Mongo + agents)
- **client** — http://localhost:5173 (Vite dev server)

Open http://localhost:5173, pick a preset scenario, and hit **Run all agents**.

### 5. Build for production

```bash
npm run build      # builds the client to client/dist
npm run start      # runs the server (you serve client/dist however you like)
```

## API

All routes are JSON. Base path: `/api/scenario`.

| Method | Endpoint               | Description                                            |
| ------ | ---------------------- | ------------------------------------------------------ |
| GET    | `/presets`             | List the 3 built-in scenarios                          |
| POST   | `/start`               | Body `{ scenarioId }` — create a fresh scenario doc    |
| GET    | `/:id`                 | Fetch the current emergency state                      |
| POST   | `/:id/update`          | Inject a situational update (see types below)          |
| POST   | `/:id/run-agents`      | Trigger all 6 agents in parallel, persist outputs      |
| GET    | `/:id/history`         | Return the full event log                              |
| POST   | `/:id/deliver`         | Mark a delivery complete and deduct inventory          |

### Update types

```ts
| { type: "block_road"; road: string }
| { type: "unblock_road"; road: string }
| { type: "location_status"; locationId: string; status: string }
| { type: "add_location"; location: { id, name, status, needs, population, coordinates } }
| { type: "add_request"; request: { locationId, item, urgency } }
| { type: "note"; text: string }
```

## Agents

All six are independent functions in `server/src/agents/*.js`. Each makes one
Anthropic call. The first five run concurrently via `Promise.all`; the
**Coordinator** waits for them and returns a strict JSON action plan.

| Agent              | Specialty                                                  |
| ------------------ | ---------------------------------------------------------- |
| Needs Assessment   | What does each location require, and why                   |
| Inventory          | Stock levels, shortages, redistribution                    |
| Route Planning     | Best paths around blocked roads                            |
| Priority           | Urgency ranking (medical > shelter > food/water > logistics)|
| Communication      | Plain-language situation report                            |
| Coordinator        | Synthesised JSON action plan                               |

## Preset scenarios

- **London Flooding** — Hounslow / Richmond / Kingston / Croydon / Ealing
- **Wildfire Evacuation** — Surrey Heath (Frensham, Hindhead, Farnham, Haslemere, Guildford)
- **Winter Storm** — North Pennines (Alston, Carlisle, Newcastle, Hexham, Penrith)

Edit `server/src/services/scenarios.js` to tweak data or add new presets.

## Project structure

```
disaster.io/
├── client/                       Vite + React + TS + Tailwind
│   └── src/
│       ├── api/                  axios calls
│       ├── components/           panels (Locations, Agents, ActionPlan, …)
│       ├── hooks/                useScenario, useAgents
│       ├── types/                shared TS types
│       └── App.tsx               3-column dashboard layout
└── server/
    └── src/
        ├── agents/               one file per agent + Anthropic client wrapper
        ├── models/               EmergencyState Mongoose schema
        ├── routes/               Express scenario router
        ├── services/             agentRunner + preset scenarios
        └── index.js              Express + Mongo bootstrap
```

## Notes

- Every state mutation appends to `history` so the bottom event log is the
  ground truth of what happened during a run.
- Inventory deduction is best-effort across warehouses, oldest-row-first.
- The "Mark delivered" button on each action row uses a small heuristic to
  parse the action text for a location, item, and quantity. If it can't match,
  the button hides and you can still record deliveries via `POST /:id/deliver`.
- Re-run agents at any time after injecting an update to get a fresh plan.
