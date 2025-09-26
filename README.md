# Replay MVP (scaffolded)

## Quick start

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY, FROM_EMAIL).
2. Run `npm install`.
3. Generate Prisma client: `npx prisma generate`.
4. Apply migrations: `npx prisma migrate dev --name init` (requires DATABASE_URL).
5. Run dev server: `npm run dev`.

## Notes

- File storage is simulate-only for MVP. Uploaded/recorded files are not persisted long-term.
- Next steps: implement NextAuth, Resend email flows, position editor, applicant recording UI, server API endpoints, and seed script.
