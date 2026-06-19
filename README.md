# 🚀 LinkFlow (PrecisionFlow)

A modern, high-performance URL shortener with advanced analytics, Google OAuth integration, and a beautiful dark-mode UI.

<div align="center">
  <!-- TODO: Replace the placeholder below with a screenshot of your Frontend Dashboard -->
  <img src="docs/frontend-screenshot.png" alt="Frontend Dashboard" width="800"/>
</div>

## 🌐 Live Demo
- **Frontend (Vercel):** [https://linkflow-app.vercel.app](https://linkflow-app.vercel.app)
- **Backend API (Render):** [https://linkflow-backend-x02k.onrender.com](https://linkflow-backend-x02k.onrender.com)


## ✨ Features
- **Secure Authentication:** Manual email/password login and seamless one-click Google OAuth.
- **URL Management:** Shorten long URLs instantly with custom aliases.
- **Advanced Analytics:** Track clicks, geographic locations, and referrers in real-time.
- **Modern UI:** Responsive, glassmorphism-inspired dark theme built with React.
- **Production-Ready:** Pre-configured for deployment on Vercel (Frontend) and Render (Backend + PostgreSQL).

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Create React App)
- **React Router** for client-side routing
- **Vanilla CSS** with modern design tokens and animations
- **Axios** for API requests

### Backend
- **FastAPI** (Python) for blazing-fast API endpoints
- **PostgreSQL** for robust production data storage (SQLite for local dev)
- **SQLAlchemy & Alembic** for ORM and database migrations
- **Google Auth Library** for secure ID token verification

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
The backend runs on FastAPI and uses a local SQLite database for development.

```bash
cd Backend
# Create a virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the Swagger UI documentation at `http://localhost:8000/docs`.

<div align="center">
  <!-- TODO: Replace the placeholder below with a screenshot of your Backend Swagger API Docs -->
  <img src="docs/backend-screenshot.png" alt="Backend Swagger Docs" width="800"/>
</div>

### 2. Frontend Setup
The frontend is a React application.

```bash
cd precision-flow
# Install node modules
npm install

# Start the development server
npm start
```
The application will open in your browser at `http://localhost:3000`.

---

## 🌍 Deployment

This project is fully configured for a "push-to-deploy" workflow:

1. **Frontend (Vercel):** Connect your GitHub repository to Vercel. The included `vercel.json` automatically handles React Router rewrites. Don't forget to set the `REACT_APP_API_URL` environment variable to your production backend URL.
2. **Backend & Database (Render):** Connect your GitHub repository to Render as a Blueprint. The included `render.yaml` file will automatically provision a PostgreSQL database and start the FastAPI server.

---

## 📄 License
This project is open-source and available under the MIT License.
