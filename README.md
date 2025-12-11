Trello-Alike Board

A simple Trello-style task board with draggable cards, built using React, Node/Express, and MongoDB.

Features
	•	Three default lists: Todo, In Progress, Done
	•	Drag and drop cards between lists (using @hello-pangea/dnd)
	•	Create and delete cards
	•	Update list colors
	•	Backend persistence with MongoDB
	•	Optimistic UI for smooth drag and drop interactions

Tech Stack

Frontend: React, @hello-pangea/dnd
Backend: Node.js, Express
Database: MongoDB
Structure: Monorepo with frontend/ and backend/ folders

⸻

How to Run the Project

1. Clone the repository

(Replace the URL with your GitHub repo URL)

git clone 
cd 

⸻

Backend Setup

cd backend

Create a .env file with the following:

PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/trello_alike

Install dependencies and start the server:

npm install
npm start

(Optional) Seed demo data:

curl -X POST http://localhost:5001/api/board/seed

⸻

Frontend Setup

cd frontend
npm install
npm start

Open the app at:
http://localhost:3000

⸻

API Overview

Base URL: http://localhost:5001/api/board

GET /                 → Fetch full board
POST /move            → Move or reorder a card
POST /card            → Create a new card
DELETE /card/:id      → Delete a card
PUT /list/:id/color   → Update list color
POST /seed            → Seed demo board data

⸻

Assumptions Made
	•	Application is for a single user; no authentication implemented
	•	MongoDB is expected to run locally
	•	Development API base URL is http://localhost:5001
	•	UI intentionally kept minimal for clarity and functionality
	•	Drag and drop uses @hello-pangea/dnd (maintained fork of react-beautiful-dnd)
	•	Error handling is minimal since this is a demo project
