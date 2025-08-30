# Movie Booking App Deployment ODC (Outcome-Driven Checklist)

This document captures the complete, reproducible steps we used to deploy the Movie Booking app:
- Backend on Render using a Docker Hub image
- Frontend on Vercel as a static site

Primary backend URL: https://sajid-movie.onrender.com

---

## 1) Prerequisites
- Docker Desktop installed and running
- Docker Hub account (repo: `ss272730/movie`)
- Render account (Web Service)
- Vercel account (Project for the frontend)
- Neon PostgreSQL database (external, SSL enabled)

---

## 2) Backend: Prepare the Spring Boot app

Files updated in backend repo `HMS`:
- `src/main/resources/application.properties`
  - Removed MySQL config and profile forcing
  - Keep generic JPA + CORS defaults; read all from env vars
- `src/main/resources/application-local.properties`
  - Sanitized; replaced secrets with environment placeholders
- `src/main/java/com/moviebooking/config/CorsConfig.java`
  - Reads allowed origins from `ALLOWED_ORIGINS`; defaults to localhost in dev
- `src/main/java/com/moviebooking/controller/BookingController.java`
  - Returns DTO for cancel() to avoid lazy-loading serialization
- `docker-compose.yml`
  - For local run with `.env` file
- `deploy/local.env` (gitignored)
  - Contains real local creds (not checked in)
- `deploy/render.env.example`
  - Template for Render environment variables
- `deploy/README-DEPLOY.md`
  - How-to and best practices

Core principle: All secrets come from environment variables.

---

## 3) Backend: Local container build & test

- Build & run via Compose (loads `deploy/local.env`):
```
docker compose up -d

docker compose logs --tail=200 backend
```
- Verify health:
```
curl http://localhost:8080/api/movies
```
Expected logs:
- Hikari pool started
- Tomcat started on port 8080

Common issue: If 8080 is taken, stop conflicting containers or map to 8081.

---

## 4) Backend: Push image to Docker Hub

- Build multi-arch (linux/amd64) and push:
```
docker login

docker buildx create --use

docker buildx build --platform linux/amd64 \
  -t ss272730/movie:v1.0.0 \
  --push .
```
- Image: `docker.io/ss272730/movie:v1.0.0`

---

## 5) Backend: Deploy on Render (Existing Image)

Render Web Service setup:
- Source: Existing Image
- Image URL: `docker.io/ss272730/movie:v1.0.0`
- Port: 8080 (leave Start Command empty)
- Region: closest to your DB

Environment variables (example; use your values):
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
- `SPRING_JPA_SHOW_SQL=false`
- `SERVER_PORT=8080`
- Mail (if used): `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`
- External APIs (if used): `GEMINI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_HOST`, `PINECONE_NAMESPACE`, `PINECONE_DIMENSION`
- CORS: `ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`

Logs to look for:
- “Tomcat started on port 8080”
- “HikariPool-1 - Start completed”

Verify endpoint:
- GET `https://sajid-movie.onrender.com/api/movies`

---

## 6) Frontend: Fixes and build configuration

Frontend repo: `sajidbaba1/Movie-Ticket-Management-System-/movie-ticket-booking-frontend`

Changes made:
- `src/services/api.ts`
  - Use Vite env only: `import.meta.env.VITE_API_BASE_URL`
- `src/components/charts/EChart.tsx`
  - Switch types: `EChartsCoreOption` (echarts v5)
- `vercel.json`
  - SPA rewrite to fix 404 on deep links:
```
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Local verification:
```
npm ci
npm run build
```
Build output: `dist/`

---

## 7) Frontend: Deploy on Vercel

Vercel project configuration:
- Framework Preset: Vite
- Root Directory: `movie-ticket-booking-frontend/`
- Build & Output Settings:
  - Install Command: `npm ci` (or `npm install`)
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL=https://sajid-movie.onrender.com` (Production & Preview)

Deploy, and if needed, “Clear build cache and redeploy”.

---

## 8) CORS and environment rules

- Backend CORS: ensure `ALLOWED_ORIGINS` includes the exact Vercel domain(s), e.g.:
  - `https://<project>.vercel.app`
  - Add your custom domain if you use one.
- Never bake secrets into images or commit them to Git.

---

## 9) Troubleshooting guide

- Port already allocated (local): another process uses 8080
  - Stop the other container(s) or remap ports in Compose
- Failed to determine suitable driver class: missing datasource env vars
  - Set all JDBC envs on Render correctly
- Vercel build cannot find package.json
  - Set Root Directory to `movie-ticket-booking-frontend/`
- TypeScript error: EChartsOption not found
  - Use `EChartsCoreOption` for echarts v5
- `process` not defined in Vite
  - Use `import.meta.env.VITE_*` on client code
- 404 on Vercel when navigating to `/login` or other routes
  - Add `vercel.json` with SPA rewrites to `index.html`
- CORS errors in browser
  - Add Vercel domain to `ALLOWED_ORIGINS` on Render

---

## 10) Change log (key milestones)

Backend:
- Switched to Postgres via env vars
- Added CORS config with env-driven origins
- Dockerized + Compose for local
- Built and pushed Docker image: `ss272730/movie:v1.0.0`
- Render service live at `https://sajid-movie.onrender.com`

Frontend:
- Fixed env usage and echarts types
- Added SPA rewrite `vercel.json`
- Vercel build configured for Vite and deployed

---

## 11) Ongoing operations
- To push a new backend version:
```
docker buildx build --platform linux/amd64 \
  -t ss272730/movie:vX.Y.Z \
  --push .
```
- Update Render service image to the new tag and redeploy
- Update `ALLOWED_ORIGINS` when frontend domain changes
- Update Vercel `VITE_API_BASE_URL` if backend URL changes

---

## 12) Security
- Treat all secrets as environment variables only
- Rotate any credentials that were ever exposed
- Gitignore local `.env` files and avoid committing secrets

---

This ODC captures the end-to-end deployment steps and guardrails so the team can reproduce the setup reliably across environments.
