# Member 3: Warehouse & Package Management

Features:
- Register a package with sender, receiver, destination, weight and dimensions.
- Generate a tracking ID automatically.
- View/search packages and their status.
- Mark packages as stored.
- Dispatch packages.
- Dashboard status totals.

## Requirements
- Java 17+
- Maven 3.9+
- Node.js 20+
- Docker Desktop (recommended for PostgreSQL)

## Start PostgreSQL
From the project root:
```bash
docker compose up -d
```
The development database is `logistics_db`, username `postgres`, password `postgres`. Change these before any real deployment.

## Run backend
```bash
cd backend
mvn spring-boot:run
```
Backend: http://localhost:8080

## Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## API endpoints
- `GET /api/packages` - list all packages
- `GET /api/packages/{trackingId}` - find package by tracking ID
- `POST /api/packages` - register package
- `PATCH /api/packages/{id}/store` - mark package stored
- `PATCH /api/packages/{id}/dispatch` - dispatch package
- `GET /api/packages/summary` - status counts

This is a starter module, not production-ready authentication or authorization. Coordinate API contracts and package statuses with the other team members before merging.
