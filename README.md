# CineVerse - Experience Movies Beyond Booking

CineVerse is an enterprise-grade, full-stack MERN movie ticket booking platform inspired by BookMyShow and Netflix.

## Features
- 🎬 **Modern UI/UX**: Premium cinematic dark theme with Glassmorphism, Tailwind CSS, and Framer Motion animations.
- 🎟️ **Advanced Seat Booking**: Interactive seat map with dynamic pricing, categorization (VIP, Regular), and real-time layout rendering.
- 🎥 **Trailer Streaming**: Integrated YouTube player modals with muted auto-play hover previews.
- 💳 **Secure Payments**: Stripe integration (with simulation fallback) for secure checkout.
- 📊 **Dashboards**: Dedicated portals for Admins (Analytics/Recharts) and Theatre Owners.
- 🛡️ **Security**: JWT Authentication, express-rate-limit, Helmet, CORS.

## Tech Stack
- **Frontend**: React.js, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Stripe.
- **Deployment**: Docker, Docker Compose, Nginx.

## Getting Started

### Local Development Setup

1. **Clone & Install Dependencies**
   Navigate to both `frontend` and `backend` directories and run:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   Duplicate `backend/.env.example` to `backend/.env` and update the connection strings (MongoDB, Stripe, JWT Secrets).

3. **Run the Apps**
   Open two terminals:
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev

   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```
   *Frontend runs on `http://localhost:5173` | Backend runs on `http://localhost:5005` when using `backend/.env` locally.*
   *When running via Docker Compose, the backend is exposed on `http://localhost:5000` and the frontend on `http://localhost:3000`.*
To run the entire stack (Frontend, Backend, and MongoDB) via Docker:
```bash
docker-compose up --build
```
*The app will be available at `http://localhost:3000`.*

---
Developed for scalabili ty and performance using modern web standards.
