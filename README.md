# EMS Platform

Monorepo layout:

- `client/` React + TypeScript + Vite + Tailwind
- `server/` Express + PostgreSQL API
- `server/storage/cdn/` local structured file storage
- `docs/` architecture and module notes
- `guidelines/` project development rules

## Core Docs

- [Architecture](./docs/ARCHITECTURE.md)
- [Utilities Module Guide](./docs/UTILITIES_MODULE_GUIDE.md)
- [Development Guidelines](./guidelines/Guidelines.md)

## Run Frontend

```bash
cd client
npm install
npm run dev
```

## Run Backend

```bash
cd server
npm install
npm run db:setup
npm run dev
```

## Current Architecture

The app currently uses a 4-layer pattern:

1. client
2. server
3. PostgreSQL database
4. storage/CDN
