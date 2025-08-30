---
description: Deploy backend to Render and frontend to Vercel
---

# Backend (Render) deployment

1. Push this repo to GitHub and connect it to a Render Web Service (Docker runtime).
2. In Render → Environment, add the variables below (copy from render.env.example and fill real values):

- SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>:5432/neondb?sslmode=require&channel_binding=require
- SPRING_DATASOURCE_USERNAME=neondb_owner
- SPRING_DATASOURCE_PASSWORD=<neon-password>
- SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
- SPRING_JPA_HIBERNATE_DDL_AUTO=update
- SPRING_JPA_SHOW_SQL=false
- SERVER_PORT=8080
- SPRING_MAIL_HOST=smtp.gmail.com
- SPRING_MAIL_PORT=587
- SPRING_MAIL_USERNAME=<gmail>
- SPRING_MAIL_PASSWORD=<gmail-app-password>
- GEMINI_API_KEY=<gemini>
- PINECONE_API_KEY=<pinecone>
- PINECONE_HOST=https://movie-sskkne3.svc.aped-4627-b74a.pinecone.io
- PINECONE_NAMESPACE=reports
- PINECONE_DIMENSION=768
- ALLOWED_ORIGINS=https://<your-frontend>.vercel.app

3. Deploy. Ensure logs show a successful PostgreSQL connection.

# Local testing with Docker Desktop

1. Put your testing secrets into `deploy/local.env` (this file is gitignored). An example is already created.
2. Build and run the backend locally using Docker Compose from the repo root:

```powershell
docker compose build --no-cache
docker compose up -d
docker compose logs -f backend
```

3. Backend will be available at http://localhost:8080. Test an endpoint:

```powershell
curl http://localhost:8080/api/movies
```

Notes:
- Adjust `ALLOWED_ORIGINS` in `deploy/local.env` to include your local frontend (e.g., http://localhost:5173).
- Do NOT commit `deploy/local.env`. It's ignored by `.gitignore`.

# Frontend (Vercel) deployment

1. In Vercel → Project Settings → Environment Variables, set:
   - VITE_API_BASE_URL=https://<your-backend>.onrender.com
2. Redeploy.

# Notes
- Do not commit real secrets; use Render/Vercel environment settings.
- If you previously committed secrets, rotate them in Neon, Gmail (App Password), Gemini, Pinecone.
- CORS is configurable via ALLOWED_ORIGINS.
