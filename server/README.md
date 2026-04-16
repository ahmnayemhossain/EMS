# Fortis Group EMS API (Express)

Local JSON-file backend for the EMS frontend. Built as a modular Express API so you can replace the `store` layer later with a real DB/service.

## Run

From repo root:

```bash
cd server
npm install
npm run dev
```

Server default: `http://localhost:4000`

Health check:

```bash
curl http://localhost:4000/api/health
```

## Endpoints (v0)

### System
- `GET /api/system/employees`
- `POST /api/system/employees`
- `PUT /api/system/employees/:id`
- `DELETE /api/system/employees/:id`
- `GET /api/system/users`
- `GET /api/system/roles`

### Reference
- `GET /api/ref/factories`
- `GET /api/ref/departments`
- `GET /api/ref/designations`
- `GET /api/ref/uoms`
- `GET /api/ref/suppliers`
- `GET /api/ref/emailSettings`
- `GET /api/ref/complaintBoxSettings`
- `GET /api/ref/thresholds`
- `GET /api/ref/approvals`

All reference routes also support `POST/PUT/DELETE` (CRUD).

## Data

Data is stored in `server/data/db.json`.

