# Travello Server

The backend API for the Travello Travel Planning System.

## 🛠️ Prerequisites

- Node.js (v18+)
- PostgreSQL installed and running

## 🚀 Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    - Copy `.env.example` to `.env`.
    - Fill in your `DATABASE_URL`, `AI_API_KEY` (Mistral), and `JWT_SECRET`.

3.  **Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Start the Server**:
    - Development mode: `npm run dev`
    - Production mode: `npm start`

## 📡 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/trips` - Get user trips
- `POST /api/ai/chat` - Chat with the Travel AI
- `GET /api/health` - API health check
