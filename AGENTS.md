# Agent Notes

## Structure
- This is not an npm workspace: root, `backend/`, and `frontend/` each have their own `package.json` and lockfile.
- The root package is TypeSpec/OpenAPI only: source `spec/main.tsp`, config `tspconfig.yaml`, generated output `tsp-output/schema/openapi.yaml`.
- Backend entrypoint is `backend/src/index.ts`; routes live in `backend/src/routes.ts`; data is in-memory in `backend/src/store.ts` and resets on backend restart.
- Frontend entrypoint is `frontend/src/main.tsx`; app routes live in `frontend/src/App.tsx`; API base URL is `VITE_API_BASE_URL` in `frontend/src/api/client.ts`.

## Commands
- Root shortcuts: `make dev` starts backend and frontend together; `make build` runs backend, frontend, and TypeSpec builds; `make check` also runs OpenAPI generation.
- Backend dev: `cd backend && npm run dev` (defaults to `PORT=3001`; CORS allows Vite on `localhost:5173` and `127.0.0.1:5173`).
- Frontend dev against the backend: `cd frontend && VITE_API_BASE_URL=http://localhost:3001 npm run dev`.
- Backend verification: `cd backend && npm run build`.
- Frontend verification: `cd frontend && npm run build`.
- Contract/OpenAPI verification: `npm run tsp:compile`; `npm run openapi` runs the same compile and writes `tsp-output/schema/openapi.yaml`.
- No test or lint scripts are currently defined; use the relevant build commands unless adding those scripts.

## Booking Rules
- Backend slot generation in `backend/src/slots.ts` is the source of truth: Moscow time `+03:00`, working hours `09:00-18:00`, 14-day booking window, and today's slots start at the next future duration grid point.
- `POST /bookings` validates `startTime` by exact match against `buildSlots(eventType, bookings)`; avoid separate overlap-only validation that could allow off-grid starts.
- Slot timestamps are generated as `YYYY-MM-DDTHH:mm:00+03:00`; exact string mismatches can make a valid-looking time fail validation.
- The frontend currently loads slots from `GET /event-types/:eventTypeId/slots`; `frontend/src/utils/slots.ts` is not the live source for slot availability.
- `DELETE /admin/event-types/{eventTypeId}` is intentional and represented in `spec/main.tsp`; do not remove it as dead API.

## Generated And CI Files
- Do not edit, delete, or rename `.github/workflows/hexlet-check.yml`; `.github/workflows/README.md` says it is generated and used by Hexlet.
- If `spec/main.tsp` changes, run `npm run openapi` and review the generated `tsp-output/schema/openapi.yaml`.
