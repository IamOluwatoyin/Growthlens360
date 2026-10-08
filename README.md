# GrowthLens 360 Frontend

Responsive frontend starter for the GrowthLens 360 business diagnostic platform.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Lucide React icons

## Run in VS Code

1. Extract the project folder.
2. Open the `growthlens-360-frontend` folder in VS Code.
3. Open the VS Code terminal.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown in the terminal, normally `http://localhost:5173`.

## Available routes

- `/` — landing page
- `/login`, `/signup` — authentication UI
- `/forgot-password`, `/reset-password` — recovery UI
- `/onboarding` — three-step setup
- `/dashboard` — overview
- `/assessments` — perspective collection
- `/reports` — comparison report
- `/actions` — recommendations
- `/advisor` — AI advisor interface
- `/profile`, `/settings`, `/help`

## Current state

This version is a working frontend prototype. Forms use local demonstration navigation and pages display mock data. Supabase, real authentication, the assessment database, AI scoring and OpenAI/n8n integrations are the next phase.

## Planned folder additions

When the backend work begins, add:

- `src/lib/supabase.ts`
- `src/services/auth.service.ts`
- `src/services/assessment.service.ts`
- `src/services/report.service.ts`
- `src/hooks/`
- `src/context/` or `src/store/`

Copy `.env.example` to `.env.local` before adding Supabase credentials. Never commit the real `.env.local` file.
