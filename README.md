# Daymark — Habit Tracker with Daily Streaks

A full-stack MERN habit tracker with account registration/login, habit CRUD, daily completion, streaks, a 90-day activity heatmap, achievements, a focus timer, daily journal, dark mode, CSV export, and weekly analytics.

## Requirements

- Node.js 20 or newer (npm is included)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- A terminal

## 1. Start MongoDB

For a local MongoDB installation, start the MongoDB service. On Ubuntu, the service is commonly:

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

If your system does not have the `mongod` service, install MongoDB Community Server first, or use MongoDB Atlas and copy its connection string.

## 2. Configure the backend

Open a terminal in the project root:

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and set `JWT_SECRET` to a long random secret. The default local database URI is:

```env
MONGO_URI=mongodb://127.0.0.1:27017/habit_tracker
```

For MongoDB Atlas, replace it with your Atlas connection string. Keep `.env` private and do not commit it.

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it is running.

## 3. Start the React frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 4. Use the app

1. Register with your name, email and a password of at least six characters.
2. Create a habit, choose a category, accent colour and weekly target.
3. Press **Mark complete** when you finish the habit for the current day.
4. The dashboard updates today's progress, the current streak, longest streak and weekly activity.
5. Use the three-dot menu on a habit to edit or delete it.
6. Explore the 90-day activity heatmap and achievement badges below the dashboard.
7. Use the focus timer for 25-minute focus sessions and 5-minute breaks.
8. Write a daily reflection in the journal; it saves automatically in this browser on this device.
9. Use the moon/sun button to switch themes and the download button to export habit history as CSV.
10. Log out from the account area in the left sidebar.

## Project structure

```text
habit-tracker/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Habit card, modal, protected route
│       ├── context/        # Authentication state
│       ├── pages/          # Login/register and dashboard
│       ├── services/       # Axios API client
│       └── utils/          # Date helpers
└── server/                 # Express REST API
    ├── config/             # MongoDB connection
    ├── controllers/        # Authentication and habit logic
    ├── middleware/         # JWT authentication
    ├── models/             # Mongoose User and Habit models
    ├── routes/             # API routes
    └── utils/              # Streak calculations
```

## API endpoints

All habit endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/habits` | List user's habits |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/toggle` | Toggle completion for a date |
| GET | `/api/health` | API health check |

## Notes

- Completion dates are stored as `YYYY-MM-DD` strings, using the browser's local calendar date.
- The current streak counts consecutive days ending today, or yesterday if today has not yet been completed.
- Longest streak is calculated from the full completion history.
- Each user's habit queries are scoped to their authenticated user ID.
- Passwords are hashed with bcrypt. Authentication uses a seven-day JWT.
- The app uses two development servers: Vite on port 5173 and Express on port 5000. Keep both terminals running while developing.


## Added feature notes

- The activity heatmap and achievement badges are calculated from each habit's saved completion history.
- The focus timer runs in the browser; it is not a background notification service.
- Daily journal entries are saved in browser `localStorage` per account and date. They are not synced to MongoDB and will not follow the account to another browser/device.
- Theme preference is saved in browser `localStorage`.
- CSV export is generated in the browser and includes each habit's completion dates.
