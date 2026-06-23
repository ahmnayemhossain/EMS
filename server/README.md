# EMS Platform API

Express + PostgreSQL API for the EMS application.

## Local setup

```bash
cd server
npm install
npm run db:setup
npm run dev
```

Server default: `http://localhost:4000`

Health check:

```bash
curl http://localhost:4000/api/health
```

## Database workflow

The server now treats Prisma migrations as the only schema source of truth.

### Fresh database

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

or just:

```bash
npm run db:setup
```

### Existing database created by the old startup SQL bootstrap

Run this once to register the current schema as the Prisma baseline:

```bash
npm run prisma:migrate:baseline
npm run prisma:seed
```

After that, use normal Prisma deploys:

```bash
npm run prisma:migrate:deploy
```

### Useful commands

- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run prisma:migrate:status`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:reset`
- `npm run prisma:studio`

## Notes

- If the API starts before migrations are applied, it now fails fast with an explicit Prisma setup error.
- Default/master data seeding stays idempotent and can still run on boot through `SEED_DEFAULTS=true`.
- For schema changes Prisma cannot model directly, edit the generated `migration.sql` before applying it.
