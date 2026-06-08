# Yada Homestay Phase 1-6 Handoff

This document tracks the production-oriented upgrade path for the public website, booking flow, admin operations, backend reliability, and SEO growth.

## Phase 1: SEO Foundation

Implemented:
- Route-aware metadata via `src/lib/seo.tsx`.
- Thai language HTML fallback, canonical URL, Open Graph, Twitter card, and manifest metadata.
- `public/robots.txt`, `public/sitemap.xml`, and `public/site.webmanifest`.
- JSON-LD for lodging/local-business context.
- Admin routes are marked `noindex,nofollow`.

Production checklist:
- Replace `https://yadahomestay.com` in `src/lib/seo.tsx` and sitemap if the final domain changes.
- Add Google Search Console and submit `/sitemap.xml`.
- Replace placeholder phone/address if the official business details differ.

## Phase 2: Public Website Conversion

Implemented:
- Homepage quick booking widget.
- `StayReasons` conversion section with internal SEO links.
- Dedicated `/rooms` route for room discovery.
- Room cards open detail view and continue into the booking flow.
- Dynamic room detail pages at `/rooms/:slug` with room-specific metadata and booking CTA.

Next:
- Add real review sources and photo captions.
- Add LINE contact and call sticky actions on mobile.
- Add seasonal packages and offers.

## Phase 3: Booking Funnel

Implemented:
- Booking page accepts `checkIn`, `checkOut`, and `adults` query params.
- Step-based booking flow with availability checking and payment confidence checklist.
- Server-side booking conflict, capacity, and date validation.
- Direct slip upload is available immediately after transfer booking success.

Next:
- Add automated confirmation messages.
- Add abandoned booking capture for partially completed requests.

## Phase 4: Admin Operations

Implemented:
- Today Command Center on admin dashboard.
- Recent audit activity panel.
- Admin routes use authenticated API calls and `noindex`.
- Dedicated operations queue at `/admin/operations` for pending payment slips, housekeeping, and maintenance work.

Next:
- Add role-scoped dashboards for owner, receptionist, and staff.
- Add CSV/PDF export for daily operations.

## Phase 5: Backend Reliability

Implemented:
- `/health` and `/health/db`.
- Login rate limiting.
- Booking validation and overlap protection.
- Payment payload validation.
- Audit log writes for booking/payment changes.
- `/api/audit-logs` endpoint.
- Repeatable smoke test script: `npm run smoke` inside `backend`.
- PostgreSQL backup and restore helper scripts: `npm run backup` and `npm run restore -- -BackupPath <file>`.
- Production migration command: `npm run db:deploy`.

Next:
- Use Prisma migrations for production instead of `db push`.
- Add unit/integration tests around booking conflicts and payment transitions.
- Add centralized request logging.

## Phase 6: SEO Growth

Implemented pages:
- `/phetchaburi-homestay`
- `/family-room-phetchaburi`
- `/pool-villa-phetchaburi`
- `/nearby-attractions`
- `/rooms`
- `/rooms/:slug`

Next:
- Add long-form travel content for Phetchaburi trip planning.
- Add FAQ and breadcrumb schema per growth page.
- Monitor Search Console queries and expand pages around proven impressions.

## Verification Commands

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend
npm run build
npm run smoke
```

Runtime checks:

```bash
curl http://localhost:1606/health
curl http://localhost:1606/health/db
curl http://localhost:5173/sitemap.xml
```
