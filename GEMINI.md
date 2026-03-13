# Fantasy Sports Draft Web Application - Gemini Context

## Project Overview
This is a full-stack web application designed for hosting live fantasy sports drafts. It supports a "Snake Draft" format and is built for a "local party" use case where a single screen displays the draft board to a group of people.

### Architecture
- **Frontend**: React (Vite) + Tailwind CSS. The UI is split into a "Draft Board" view, a "Player List" for drafting, and a "Settings" view for configuration.
- **Backend**: Node.js + Express. It serves as a REST API and handles data persistence using a local JSON file.
- **Data Persistence**: State (teams, players, picks) is saved in `server/data/draft-data.json`.
- **Media**: Real-time audio feedback for picks and timer warnings.

### Core Technologies
- **Frontend**: React 18, Vite, Tailwind CSS v4 (via `@tailwindcss/vite`).
- **Backend**: Express 5, Multer (for CSV uploads), CSV-Parser.
- **Audio**: Web Audio API via `SoundService.js` for real-time draft feedback.
- **Tools**: Shell script (`start-dev.sh`) for concurrent local development.

## Building and Running

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Development Environment
To start both the backend and frontend simultaneously, use the provided helper script from the root directory:
```bash
./start-dev.sh
```

### Manual Commands
**Backend:**
```bash
cd server
npm install
node server.js
```
- API runs on `http://localhost:5001`.

**Frontend:**
```bash
cd client
npm install
npm run dev
```
- Dev server runs on `http://localhost:5173`.

### Testing
- No automated test suite is currently implemented (TODO: Add Vitest/Jest).
- Manual verification: Use the "Settings" tab to upload `examples/players.csv` and add teams.

## Development Conventions

### Coding Style
- **Surgical Updates**: Prefer small, targeted changes to existing files.
- **Tailwind CSS**: Use utility classes for all styling. Note that the project uses `@tailwindcss/vite` (v4 compatible).
- **React Components**: Functional components with Hooks. Components are located in `client/src/components`.
- **API Communication**: All frontend-backend interaction should be abstracted into `client/src/api.js`.

### Data Models
- **Player**: `{ id, name, position, team, rank }`
- **Team**: `{ id, name, owner, avatar, draftOrder }`
- **Pick**: `{ round, pickNumber, teamId, playerId, timestamp }`

### Important Files
- `server/server.js`: Central backend logic, API routes, and state management.
- `client/src/App.jsx`: Main frontend entry point and state coordinator.
- `client/src/api.js`: API communication layer.
- `client/src/SoundService.js`: Audio logic for picks and timer warnings.
- `client/src/components/DraftBoard.jsx`: Core visualization of the draft grid with position color-coding.
- `start-dev.sh`: Primary entry point for developers.

### TODOs / Roadmap
1. **Undo Last Pick**: Implement functionality to rollback the draft state.
2. **Draft Order Randomizer**: Add a button to shuffle team order before starting.
3. **Proxmox Deployment**: Create Dockerfile and deployment guide for hosting on Proxmox.
4. **Mobile View**: Optimize the Draft Board for tablets/phones.
5. **Enhanced Commissioner Tools**: Expand beyond current timer controls.
