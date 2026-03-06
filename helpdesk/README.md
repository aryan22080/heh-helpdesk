# ⚕ HEH Healthcare — Help Desk

A full-stack **MERN** (MongoDB, Express, React, Node.js) Help Desk platform for the **Hostile Environment Healthcare** service provider. Includes issue tracking with auto email confirmation and a feedback collection system.

---

## 📁 Project Structure

```
helpdesk/
├── package.json           ← Root (run scripts from here)
├── server/
│   ├── index.js           ← Express entry point
│   ├── routes.js          ← API routes (/api/issues, /api/feedback)
│   ├── models.js          ← Mongoose schemas
│   ├── emailService.js    ← Nodemailer email logic
│   ├── .env               ← ⚠ Configure this first!
│   └── package.json
└── client/
    ├── public/index.html
    ├── src/
    │   ├── App.js / App.css
    │   ├── components/
    │   │   ├── Navbar.js / Navbar.css
    │   └── pages/
    │       ├── Home.js / Home.css
    │       ├── IssuePage.js
    │       ├── FeedbackPage.js
    │       └── FormPage.css
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
- **npm** (comes with Node)

---

## 🚀 Setup & Run in VS Code

### Step 1 — Configure Email

Open **`server/.env`** and fill in your credentials:

```env
MONGO_URI=mongodb://localhost:27017/helpdesk
PORT=5000

# Use your Gmail (or other SMTP provider)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password     # Use Gmail App Password, NOT your real password

SUPPORT_EMAIL=support@yourdomain.com
CLIENT_URL=http://localhost:3000
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

---

### Step 2 — Install Dependencies

Open a terminal in VS Code (`Ctrl+`` `) and run:

```bash
# From the helpdesk/ root folder:
npm run install-all
```

This installs packages for root, server, and client.

---

### Step 3 — Start MongoDB

Make sure MongoDB is running locally:
```bash
mongod
# or on some systems:
brew services start mongodb-community   # macOS
sudo systemctl start mongod             # Linux
```

---

### Step 4 — Run the App

**Option A — Run both together (recommended):**
```bash
npm run dev
```

**Option B — Run separately (two terminals):**
```bash
# Terminal 1 - Server:
npm run server

# Terminal 2 - Client:
npm run client
```

---

## 🌐 Access

| Service | URL |
|---------|-----|
| React Frontend | http://localhost:3000 |
| Express API | http://localhost:5000 |
| API Health Check | http://localhost:5000/health |

---

## 📬 API Endpoints

### Issues
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/issues` | Submit a new issue |
| GET | `/api/issues` | List all issues |
| GET | `/api/issues/stats` | Issue statistics |

### Feedback
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | List all feedback |
| GET | `/api/feedback/stats` | Feedback statistics |

---

## ✉️ Email Flows

| Event | Who Gets Email |
|-------|---------------|
| Issue submitted | User gets ticket confirmation + support team notified |
| Feedback submitted | User gets acknowledgment email |

---

## 🔧 Troubleshooting

- **MongoDB not connecting** → Run `mongod` in a separate terminal
- **Email not sending** → Check `.env` credentials, use Gmail App Password
- **Port conflict** → Change `PORT` in `.env` and update `proxy` in `client/package.json`
- **CORS error** → Ensure `CLIENT_URL` in `.env` matches your React dev URL

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Email | Nodemailer (SMTP) |
| Dev Tools | Nodemon, Concurrently |
