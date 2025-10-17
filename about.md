# DataSync — Demo-First Gameplan

## What DataSync is (in one line)

A multi-tenant admin that lets you define global content (e.g., offers, disclaimers) and **synchronize** it across multiple “sites” via API, with a **live simulated sync** (logs + per-site results) that’s irresistible in interviews. This riffs on your prior multi-site content system experience and makes it portfolio-safe and public-facing.

---

## 1) Success Criteria (what “great” looks like)

- **Hiring manager POV:** “This person can design multi-tenant systems, model real business flows, secure data, and produce a polished admin with live feedback.”
- **You can demo in 5 minutes:** create org ➜ add 3 sites ➜ define a content type ➜ add items ➜ map items to sites ➜ click Sync ➜ watch live logs & site statuses ➜ open destination viewers showing received payloads.
- **Looks & feels like SaaS:** auth, role-based access, audit logs, RLS-style isolation, job history, retries, and a clean, modern UI (tailored to your brand). Your stack preference (Next.js + Tailwind + motion) fits perfectly.

---

## 2) Core Entities (conceptual model)

Keep it small, real, and demo-friendly:

- **Organization** — a tenant boundary (for demo, you’ll have one org pre-seeded: “Acme Holdings”).
- **Profile** — links an authenticated user to an org + role.
- **Site** — a publishing target (e.g., “North,” “South,” “West”) with a **Destination URL** and **Destination Secret** (mock endpoint inside your app).
- **Content Type** — a named schema, e.g., `offer_banner` with fields (`headline`, `cta_text`, `start_date`, `end_date`).
- **Content Item** — JSON data conforming to a Content Type; has statuses (`draft`, `published`, `archived`).
- **Site ↔ Item Mapping** — which items go to which sites; include a `mode` per mapping:
    - `full` (publish as is),
    - `override` (apply site-specific overrides),
    - `block` (exclude for that site).
- **Sync Job** — a run with status (`queued`, `running`, `success`, `partial`, `failed`), timestamps, and creator.
- **Job Log** — append-only log lines (info/warn/error) with optional `siteId`, `itemId`, and captured payload for observability.
- **Destination Snapshot** — what each site “received” most recently (stored for the mock destination viewer).

> Tip: Keep schemas JSON-first to show flexibility. You’re demonstrating system design, not rigid CMS dogma.
> 

---

## 3) Critical Flows (how things move)

### A) Authoring Flow

1. Create **Content Type** (e.g., `offer_banner` with 4–6 fields).
2. Create **Content Items**; mark some **Published**, keep one **Draft** to prove status filtering.
3. Create 3 **Sites** (North/South/West) with generated secrets and built-in **Destination URLs** pointing to your app’s mock receiver.
4. Map items to sites with varied `mode`s:
    - North → item A (full), item B (override),
    - South → item A (block), item C (full),
    - West → A/B/C (full).

### B) Sync Flow

1. User clicks **Sync Now** (or CRON tick runs).
2. System creates a **Sync Job**, streams **live logs** (SSE) to the UI.
3. For each site:
    - Compute **effective payload**:
        - Include only `published` items.
        - Apply per-site `block`/`override`.
    - **POST** payload to the site’s Destination URL with an HMAC signature header (simulated security).
    - Store response + payload into logs and destination snapshot.
4. Finalize job status:
    - All 2xx → `success`
    - Mixed → `partial`
    - All failed → `failed`

### C) Destination (Mock) Flow

- Your API route **validates signature**, stores the snapshot, and returns `{applied:true, receivedAt, itemCount}`.
- A **Destination Viewer** screen shows the latest snapshot per site (as pretty cards, and a JSON tab).

---

## 4) Admin UX (what to build on the dashboard)

### Home (Jobs Overview)

- **“Run Sync”** button (org-wide).
- Last 5 jobs with status chips and durations.
- CTA: manage content, sites, or mappings.

### Content

- **Content Types** list; “Add Type” modal with field builder (text, rich text, number, date, enum).
- **Content Items** table:
    - Filters: status, type, updated range.
    - Row: title/headline, type, status, linked sites count.
    - “Quick Preview” drawer shows JSON + a formatted preview.

### Sites

- Table of sites (name, slug, last sync result).
- Detail page:
    - Credentials (Destination URL/Secret).
    - **Destination Viewer** (latest snapshot + JSON).
    - “Run site-only sync” action.

### Mappings

- Matrix view: rows = items, columns = sites, cell = mode (`full/override/block`) with inline edit.
- Bulk actions (set all to `full`, block everywhere, etc.).

### Jobs

- Job list with filters (status, date).
- Job detail:
    - **Live Terminal** (SSE log stream) with colored levels.
    - **Per-site status cards** (success/warn/fail).
    - Collapsible **payload previews**.

> Make it delightful: mini animations (Framer) when a site card flips from “pending” to “success.”
> 

---

## 5) Simulation & Observability (the “wow” factor)

- **Simulate Sync mode** (default): instead of hitting real webhooks, all sites point to **your** `/destination/{siteId}` endpoint. The server stores snapshots in DB and echoes a realistic response (add a 5–20% chance to return a 500 to showcase retries/partial status).
- **Live Logs via SSE**: UI connects to `/sync/stream?jobId=…`; the log area autoscrolls with subtle typewriter effect and level badges (info/warn/error).
- **Payload Visibility**: for each site, show the exact JSON payload you “sent” (copyable). This makes the system tangible and interviewers love it.

---

## 6) Access & Safety (portfolio-safe)

- **Multi-tenant isolation** (conceptually via RLS or equivalent). You can state this in the readme and model it in your DB (it’s a real hiring signal).
- **No real client data**—use seeded demo content.
- **No conflict** with your employer vertical (not window/door marketing); you’re showcasing generic automation and internal tooling skill, aligned with how you framed Overform.

---

## 7) Seed Strategy (so the demo is instant)

- On first run, auto-create:
    - Org: **Acme Holdings** with one admin user.
    - Sites: **North**, **South**, **West**, with generated secrets.
    - Content Type: **offer_banner** with fields noted above.
    - 4 Content Items:
        - A: “Fall Savings Event” (published)
        - B: “Free Installation” (published)
        - C: “0% Financing 12mo” (published)
        - D: “Veterans Day Special” (draft)
    - Mappings:
        - North: A (full), B (override)
        - South: A (block), C (full)
        - West: A, B, C (full)
- Provide one **seed override** (e.g., for B on North change `cta_text`).

This ensures the very first click on **Run Sync** produces drama: different payloads per site, one draft excluded, and visible overrides.

---

## 8) Scheduling Options

- **Manual Sync** (primary for demo).
- **Hourly CRON** (Vercel Cron) to show scheduled ops; label it “auto” in the Jobs list when the trigger wasn’t a user.

---

## 9) Security & API Design (portfolio-grade without overkill)

- **Auth**: standard email/password or magic link for the admin area.
- **API scope**: internal admin CRUD endpoints + sync endpoints.
- **HMAC header** (`X-DSIGN`) on outbound payloads to destinations (mock verified).
- **API keys (optional)**: generate/display a masked key tied to org for future “pull” integrations—nice extra for the readme.

---

## 10) Readme & Case Study Angle

On your site, present it using your **Problem → Solution → Impact** format you already use elsewhere: businesses struggle with **consistent updates across many sites**, you built a **centralized synchronizer** with **mappings, overrides, and auditability**, and the impact is **speed + accuracy** (simulate metrics like “cut updates from 3 hours to 2 minutes”).

---

## 11) 5-Minute Live Demo Script (memorize this)

1. **Open Dashboard**: “We’re in Acme Holdings with three sites.”
2. **Show Content Types & Items**: “Here’s `offer_banner`; item D is Draft so it won’t publish.”
3. **Open Mappings**: “North gets A full, B override; South blocks A; West gets all.”
4. **Run Sync**: Click **Sync Now** → terminal pops with logs; watch per-site cards flip to success; one site briefly warns (intentional 500) and auto-retries.
5. **Open Site → Destination Viewer**: “Here’s exactly what North received, note the override on CTA.”
6. **Jobs History**: “We keep full logs, payloads, durations, and final status.”

Done. (Let them ask how you did live logs, overrides, and isolation.)

---

## 12) Quality Bar (acceptance checklist)

- **Performance**: Sync of 3 sites, 3 items completes in <2s on a cold start in demo.
- **Reliability**: If one destination fails, job ends `partial` and clearly says which site failed and why.
- **UX polish**: micro-motion, skeletons, empty states, and clear copy.
- **Docs**: a 1-page readme with architecture diagram and decisions.

---

## 13) Stretch Goals (small, high-ROI)

- **Template Library**: save common content type schemas and clone into an org.
- **Versioned Items**: keep a short revision history and show diff in the item drawer.
- **Webhook Replay**: retry an individual site’s latest payload from the Job screen.
- **Metrics**: tiny sparkline of job durations over time.
