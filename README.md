# QuestAI

## Quick start

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY, FROM_EMAIL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD).
2. Run `npm install`.
3. Generate Prisma client: `npx prisma generate`.
4. Apply migrations: `npx prisma migrate dev --name init` (requires DATABASE_URL).
5. Run dev server: `npm run dev`.
