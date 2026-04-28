# NeurelPress Frontend

Next.js frontend for NeuralPress.

## Getting Started

1. Copy `.env.example` to `.env`.
2. Keep `NEXT_PUBLIC_API_URL=http://localhost:8080/api` for local mode.
3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Vercel deployment

This repo includes `vercel.json`.

Set these env vars in Vercel:

- `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
- `NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app`

## Architecture notes

- API access lives in `src/lib/api.ts` (components do not call HTTP directly).
- Auth/session handling is isolated from UI components.
- Shared UI primitives are under `src/components/ui`.
- Reusable behavior is extracted into hooks under `src/hooks`.
