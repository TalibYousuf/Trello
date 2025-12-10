# Simple Trello-like Board

A minimal Trello-style board with draggable cards across lists, backed by a Node/Express + MongoDB API. Built with React (@hello-pangea/dnd) for drag-and-drop.

## Features
- Three lists (Todo, In Progress, Done) with multiple cards
- Reorder cards within a list and move across lists
- Immediate UI updates with optimistic rendering
- Persistence via backend API (MongoDB)
- Optional extras: per-list color, delete cards, seed demo data

## Monorepo Structure
- `backend/` — Express server, MongoDB models, routes
- `frontend/` — React app, drag-and-drop UI

## Prerequisites
- Node.js 18+
- MongoDB running locally (default `mongodb://127.0.0.1:27017/trello_alike`)

## Setup

### Backend
1. `cd backend`
2. Create `.env` (or edit the existing one):
   - `PORT=5001`
   - `MONGO_URI=mongodb://127.0.0.1:27017/trello_alike`
3. Install and start:
   - `npm install`
   - `npm start`
4. Seed demo data (optional):
   - `curl -X POST http://localhost:5001/api/board/seed`

### Frontend
1. `cd frontend`
2. Install and start:
   - `npm install`
   - `npm start`
3. Open `http://localhost:3000/` in your browser

## API
Base URL: `http://localhost:5001/api/board`

- `GET /` — Fetch board
  - Response: `{ lists: [{ _id, title, color, position, cards: [{ _id, title, listId, position }] }] }`

- `POST /move` — Move a card (within or across lists)
  - Body: `{ cardId, fromListId, toListId, newIndex }`
  - Response: `{ message: 'Card moved successfully' }`

- `POST /card` — Create a card
  - Body: `{ listId, title }`
  - Response: `{ card }`

- `DELETE /card/:id` — Delete a card
  - Response: `{ message: 'Card deleted' }`

- `PUT /list/:id/color` — Update list color
  - Body: `{ color }`
  - Response: `{ list }`

- `POST /seed` — Seed demo data
  - Response: `{ message: 'Seeded demo data' }`

## Frontend Notes
- Drag-and-drop uses `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)
- All DnD components (DragDropContext, Droppable, Draggable) use this library consistently
- Optimistic UI updates are applied; on API failure, the board is re-fetched

## Assumptions & Trade-offs
- Single-board app with lists and cards stored in MongoDB; no multi-user/auth
- Optimistic updates preferred for snappy UX, with quick fallback to server state
- Minimal UI, focused on usability: consistent list widths, transparent cards that inherit list color, readable contrast
- API is intentionally simple; validation is basic (e.g., non-empty titles)

## Running Tests
- No formal test suite included. Manual verification:
  - Drag cards within a list and across lists; refresh to confirm persistence
  - Create and delete cards; positions renumber
  - Change list color; UI updates immediately

## Deployment
- Backend: any Node host + MongoDB (Atlas/local)
- Frontend: any static host (Netlify/Vercel); set `REACT_APP_API_BASE` if you externalize API base (currently hardcoded `http://localhost:5001/api/board`).

## Git Repository
If you haven’t pushed yet:
1. In project root: `git init`
2. `git add . && git commit -m "Initial Trello-alike implementation"`
3. Create a GitHub repo and set remote: `git remote add origin <your_repo_url>`
4. `git push -u origin main`

Then share the GitHub repository link as the deliverable.