# ⚡ TahaDev Hub - MERN Internship Registration System

Welcome to the **Internship Registration System**—a full-stack web application designed for candidate registration, management, and real-time dashboard analytics. Built using the MERN stack with a high-fidelity dark glassmorphism design.

## 🚀 Key Features

- **Modern Glassmorphic Dark UI**: Premium user interface with smooth animations, custom styling, responsive layout, and beautiful visual indicators using Lucide React.
- **Full CRUD Capabilities**: Add, view, search, filter, edit, and delete candidate registrations.
- **Intelligent MongoDB Offline Fallback**: 
  - If a live MongoDB instance is available, candidates are persisted in a MongoDB database using Mongoose.
  - If MongoDB is offline or disconnected, the backend **automatically falls back to a local JSON database** (`registrations_backup.json`), keeping the application completely functional.
- **Live Status Checker**: Real-time status badge showing connection state (`MongoDB Connected`, `Local Fallback Active`, or `Backend Offline`).
- **Interactive Search & Filtering**: Fast client-side search by name/email and categorization filters by technical stack.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Vanilla CSS, Lucide React (Icons)
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM)
- **Database**: MongoDB (with automated Local JSON file backup fallback)

---

## 💻 How to Run the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

---

### Step 1: Run the Backend Server

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/internship_registration
   ```
   *(Note: If you do not have MongoDB running, the server will log a fallback warning and safely use local JSON file storage).*
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on: `http://localhost:5000`

---

### Step 2: Run the Frontend Client

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Click the link in your terminal or open your browser to:
   ```url
   http://localhost:5173
   ```

---

## 📂 Project Structure

```text
TASK1/InternShip Form in MERN/
├── backend/
│   ├── registrations_backup.json  # Auto-generated local storage fallback
│   ├── server.js                  # Express server & CRUD controllers
│   ├── package.json               # Backend script & packages
│   └── .env                       # Environment variables
└── frontend/
    ├── src/
    │   ├── App.jsx                # Main Application component & dashboard
    │   ├── App.css                # Modern glassmorphism UI styles
    │   └── main.jsx               # Entry point
    ├── index.html
    └── package.json               # Frontend dependencies
```
