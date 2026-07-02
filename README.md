# Scoring App

Professional tournament operations platform for pickleball and badminton.

This app is built as a standalone Vercel project linked to the `nali215/scoring-app` GitHub repository. It intentionally does not share local Vercel project metadata with any REC app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Pure TypeScript scoring engines for pickleball and badminton

## Local development

```bash
npm install
npm run dev
```

Set `DATABASE_URL` before running Prisma migrations.

