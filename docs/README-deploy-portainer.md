Local Portainer deployment (backend + frontend)

This repo contains a simple `docker-compose.yml` and Dockerfiles for the backend and frontend to run locally and manage via Portainer.

What it creates
- weebone_backend (Node backend on port 5000)
- weebone_frontend (Vite preview server on port 5173)

Quick steps (Portainer)
1. In Portainer, go to Stacks → Add stack.
2. Paste the contents of `docker-compose.yml` (or upload the file) and deploy.
3. Edit environment variables for the backend stack in Portainer or replace `backend_webbone/.env.example` with a real `.env` file and point the stack to it.
4. Important: mount a host path for client files (NAS / local folder) to `./backend_webbone/uploads` (the compose already binds `./backend_webbone/uploads:/app/uploads`). If you want to use SMB, set `CLIENT_FILES_USE_SMB` and SMB_* vars and mount a credential-safe volume.

Notes
- The frontend uses `VITE_API_URL` environment variable; in `docker-compose.yml` it defaults to `http://host.docker.internal:5000` which allows containers on Docker Desktop/Portainer to reach the host backend. For production, point it to the backend service host (e.g. `http://backend:5000`) and adjust compose network accordingly.
- If you use Postgres/Prisma, add a `db` service and set `DATABASE_URL` in the backend env file.
- The backend Dockerfile runs `node server.js`. Use `npm run dev` locally for development.

Database (Postgres + Prisma)
- The provided `docker-compose.yml` includes a `db` (postgres) service and a one-shot `prisma_migrate` service which runs `prisma migrate deploy` and then `prisma db seed`.
- Ensure `backend_webbone/.env` has `DATABASE_URL` pointing to the `db` service (an example is in `.env.example`).
- When the stack deploys, run the `prisma_migrate` service once (Portainer will run it if you deploy the stack that contains the service). It will create the schema and run the seed script.

Troubleshooting
- If uploads to SMB are failing, check backend logs for the SMB write messages.
- Use Portainer logs to inspect container output.

If you want, I can:
- Add a `db` (Postgres) service to the compose and run Prisma migrate/seed on startup.
- Switch the frontend to an nginx static server for even simpler production preview.
