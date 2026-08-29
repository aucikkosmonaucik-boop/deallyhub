# Deallyhub

Monorepo architecture with Node.js Express backend and Next.js frontend.

## Structure
- `/backend`: Node.js Express API (configured for deployment on [Railway](https://railway.com))
- `/frontend`: Next.js React app (configured for deployment on [Vercel](https://vercel.com))

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker compose up --build
```
