# Campus Lost & Found Platform

A MERN stack app for campus lost-and-found workflows:

- Easy lost/found item reporting
- Image similarity hints
- AI-style description matching
- Email and in-app notifications
- Admin verification and claim review

## Tech Stack

- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- JWT auth
- Multer uploads
- Natural language matching with `natural`

## Setup

```bash
npm run install:all
copy server\.env.example server\.env
npm run dev
```

The client runs on `http://localhost:3000` and the API runs on `http://localhost:5000`.

## Deployment

Set `VITE_API_URL` in the frontend host to your deployed API base URL, including `/api`, for example:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

Set `CLIENT_URL` in the API host to the deployed frontend URL, for example:

```env
CLIENT_URL=https://lostandfoundforcampus.netlify.app
```

## Default Admin

Set these in `server/.env` before starting the server:

```env
SEED_ADMIN_EMAIL=admin@campus.edu
SEED_ADMIN_PASSWORD=Admin@12345
```

The server seeds the admin user automatically if one does not exist.
