# 🎓 Student Management App – DevOps Project

A small Node.js app (no external dependencies) used to demonstrate a complete DevOps workflow:

**Code → GitHub → 🧪 Test → 🐳 Docker → ⚙️ CI/CD → ☁️ Deploy → 📊 Monitor**

## Project structure
| Path | Purpose |
|---|---|
| `src/server.js` | App: REST API, `/health`, `/metrics` |
| `public/index.html` | Simple web UI |
| `test/app.test.js` | Automated tests (Node built-in test runner) |
| `Dockerfile` | Builds the container image |
| `docker-compose.yml` | App + Prometheus + Grafana locally |
| `.github/workflows/ci-cd.yml` | GitHub Actions pipeline |
| `monitoring/prometheus.yml` | Prometheus scrape config |
| `scripts/healthcheck.sh` | Post-deploy health check |

## Step 1–2: Run the app locally
```bash
npm test        # run tests
npm start       # open http://localhost:3000
```
Endpoints: `GET/POST /api/students`, `DELETE /api/students/:id`, `GET /health`, `GET /metrics`

## Step 3: Git & GitHub
```bash
git init
git add .
git commit -m "Initial commit: student management app"
git branch -M main
git remote add origin https://github.com/<your-username>/student-devops.git
git push -u origin main

# Show branching
git checkout -b feature/add-search
# ...make a change...
git add . && git commit -m "Add search feature"
git push -u origin feature/add-search     # then open a Pull Request
```

## Step 4: CI/CD pipeline (GitHub Actions)
On every push to `main`: **Test → Build Docker image → Push to GitHub Container Registry → Deploy → Health check**.
Pull requests only run the tests.

Add these in GitHub → Settings → Secrets and variables → Actions:
| Secret | Value |
|---|---|
| `SERVER_HOST` | Public IP of your Linux VM / EC2 |
| `SERVER_USER` | SSH user (e.g. `ubuntu`) |
| `SERVER_SSH_KEY` | Private SSH key contents |
| `GHCR_TOKEN` | GitHub Personal Access Token with `read:packages` |

After the first push, set the package visibility under your GitHub profile → Packages if needed.

## Step 5: Docker
```bash
docker build -t student-app .
docker run -d -p 3000:3000 --name student-app student-app
docker ps
```
Flow: Application → Docker Image → Docker Container

## Step 6: Deploy
Create a Linux VM (AWS EC2 free tier, Azure VM, or GCP VM), allow inbound ports 22 and 80, and install Docker:
```bash
sudo apt update && sudo apt install -y docker.io
sudo usermod -aG docker $USER   # log out and in again
```
The pipeline then deploys automatically. Open `http://<server-ip>/`.

## Step 7: Monitoring
- Health: `curl http://<server-ip>/health`
- Script: `./scripts/healthcheck.sh http://<server-ip>`
- Logs: `docker logs -f student-app`
- Resource usage: `docker stats student-app`
- Dashboards (local): `docker compose up -d --build` → Prometheus `:9090`, Grafana `:3001` (login admin/admin, add Prometheus data source `http://prometheus:9090`, graph `app_requests_total`, `app_errors_total`, `app_memory_rss_bytes`)

## Step 8: Presentation script
> "My project is a Student Management Application. I uploaded the code to GitHub. Whenever I push new code, GitHub Actions automatically tests the application, builds a Docker image, and deploys it to the server. After deployment, a health check confirms the app is working, and Prometheus/Grafana monitor requests, errors and memory. This reduces manual work and makes deployment faster and more reliable."

**Demo order:** show repo → make a small change → push → show pipeline running → open live URL → show `/health` and monitoring.

## Evaluation checklist
- [x] DevOps understanding  - [x] Git & GitHub  - [x] Docker
- [x] CI/CD pipeline  - [x] Deployment  - [x] Monitoring
- [x] Documentation (this README)  - [x] Presentation script

## Note
Data is stored in memory, so it resets when the container restarts. That's fine for this project; a database is a good "future improvement" to mention.
