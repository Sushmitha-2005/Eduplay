# 🎓 EduPlay - Adaptive Educational Game Platform

## MEAN Stack Application
**M**ongoDB + **E**xpress + **A**ngular + **N**ode.js

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or Atlas)

### Run the Application

**1. Start Backend (Terminal 1):**
```bash
cd backend
npm install
npm start
```
Backend runs on: http://localhost:3000

**2. Start Frontend:**

**Option A - Vanilla JS (Simple):**
Open `frontend/index.html` in a browser

**Option B - Angular Frontend:**
```bash
cd frontend-angular
npm install
npm start
```
Angular runs on: http://localhost:4200

---

## 🎮 12 Educational Micro-Games

| # | Game | Icon | Description | Key Features |
|---|------|------|-------------|--------------|
| 1 | Math Reflex | 🧮 | Timer-based math challenges | 3-number addition, 2-digit multiplication |
| 2 | Memory Boost | 🧠 | Pattern memorization | Larger grids, longer sequences |
| 3 | Logic Puzzles | 🧩 | Reasoning challenges | Fibonacci, prime numbers, riddles |
| 4 | Word Builder | ✏️ | Unscramble words | Up to 12-letter words |
| 5 | Pattern Match | 🎨 | Sequence recognition | Complex patterns (months, rainbow) |
| 6 | Quick Quiz | ⚡ | Timed knowledge quizzes | Physics constants, advanced math |
| 7 | Color Hunt | 🌈 | Color matching | Similar color shades |
| 8 | Shape Escape | 🔺 | Spatial reasoning | Complex shape puzzles |
| 9 | Number Link | 🔢 | Connect numbers in sequence | Numerical sequence skills |
| 10 | Maze Runner | 🏃‍♂️ | Navigate mazes | Problem-solving and planning |
| 11 | Sudoku Solver | 🧩 | Classic Sudoku | 4x4, 6x6, 9x9 grids |
| 12 | Memory Matrix | 🧪 | Grid position memory | Short-term memory training |

---

## 📁 Project Structure

```
EduPlay/
├── backend/                    # Node.js + Express Backend
│   ├── server.js               # Main server
│   ├── models/                 # MongoDB models
│   │   ├── User.js
│   │   ├── GameScore.js
│   │   └── Performance.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── games.js
│   │   └── performance.js
│   └── middleware/
│       └── auth.js             # JWT authentication
│
├── frontend/                   # Vanilla JS Frontend
│   ├── index.html
│   ├── css/styles.css          # Modern colorful CSS
│   └── js/
│       ├── games/              # 12 game modules
│       ├── app.js
│       ├── auth.js
│       └── dashboard.js
│
└── frontend-angular/           # Angular 17 Frontend
    └── src/app/
        ├── services/
        ├── guards/
        └── pages/
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Games
- `GET /api/games/config/:gameType` - Get game configuration
- `POST /api/games/submit` - Submit game score

### Performance
- `GET /api/performance/dashboard` - Get user stats
- `GET /api/performance/recommendations` - Get personalized recommendations

---

## ⚙️ Features

✅ **Adaptive Difficulty** - Games adjust from Level 1-10 based on performance  
✅ **JWT Authentication** - Secure login/signup system  
✅ **Performance Tracking** - Dashboard with skill progress  
✅ **Skill Decay Detection** - Identifies areas needing practice  
✅ **Personalized Recommendations** - Suggests games to improve  
✅ **12 Unique Games** - Each with easy → expert difficulty tiers  
✅ **Modern Colorful UI** - Gradient buttons, animations, responsive design

---

## 🎨 CSS Features

- **Gradient Backgrounds** - Purple/blue, sunset, ocean, forest themes
- **Playful Animations** - Bounce, shake, celebrate, fade-in effects
- **Interactive Cards** - Hover lift, glow shadows, scale effects
- **Progress Bars** - Shimmer animation effect
- **Responsive Grid** - 4 columns desktop, 2 tablet, 1 mobile
- **Google Fonts** - Poppins & Nunito for modern typography

---

## 🛠️ Technologies

| Layer | Technology |
|-------|------------|
| Frontend | Angular 17 / Vanilla JS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Chart.js |

---

## 📝 Environment Variables

Create `backend/.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eduplay
JWT_SECRET=your-secret-key
```

---

## 🎯 Difficulty Scaling Examples

**Math Reflex (Level 8-10):**
- Three-number addition: `145 + 237 + 89 = ?`
- Two-digit multiplication: `23 × 17 = ?`

**Logic Puzzles (Level 8-10):**
- Factorial sequences: `1, 2, 6, 24, 120, ?` (Answer: 720)

**Sudoku Solver (Level 7+):**
- Full 9x9 grid with fewer hints

**Maze Runner (Level 8+):**
- 11x11 mazes with complex paths

---

## 📜 License
MIT License
