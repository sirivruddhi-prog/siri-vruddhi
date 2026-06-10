# Admin Module — Business Analysis & Roadmap

**Project:** Siri Vruddhi Event Venue (`sirivruddhi.com`)  
**Date:** June 2026  
**Prepared for:** Venue owner / operations team

---

## 1. Current state (as-is)

| Capability | Today | Pain |
|------------|-------|------|
| Capture inquiries | Contact form → MySQL + email | Works well |
| View inquiries | phpMyAdmin only | Not user-friendly; needs technical access |
| Follow-up tracking | None in system | No “called back / booked / lost” status |
| Content updates | Edit code + redeploy Hostinger | Slow; needs developer |
| Gallery photos | Change files in repo + rebuild | Same |
| Analytics | None | No idea which pages/events convert |
| User access | No login anywhere | Anyone could hit APIs if extended |

**Conclusion:** The public website is production-ready. Operations still depend on **email + phpMyAdmin**. An admin module should replace manual DB access and add lightweight CRM for inquiries.

---

## 2. Business goals

1. **Respond faster** — see new inquiries in one place, mark as contacted.
2. **Reduce dependency on developers** — update text, hours, packages (later phase).
3. **Protect data** — only `sirivruddhi@gmail.com` (or staff) can read customer PII.
4. **Stay low-cost** — fit Render free/starter + Hostinger stack; no expensive SaaS required initially.

---

## 3. Recommended scope (phased)

### Phase 1 — Inquiry Admin (MVP) ⭐ **Do this first**

**Value:** Highest ROI, smallest build.

| Feature | Description |
|---------|-------------|
| Secure login | Single admin account (env-based password) or Google OAuth for `sirivruddhi@gmail.com` |
| Inquiry inbox | List all rows from `inquiries`, newest first |
| Inquiry detail | Full name, phone, email, event type, message, submitted time |
| Status | `new` → `contacted` → `visit_scheduled` → `booked` / `closed` |
| Notes | Internal note per inquiry (e.g. “Called 10 Jun, visit Sunday”) |
| Export | Download CSV for Excel |
| Email link | One-click `mailto:` and `tel:` from detail view |

**Out of scope for MVP:** public user registration, multi-tenant, SMS.

**Estimated effort:** 3–5 dev days (backend auth + API + simple Angular `/admin` UI).

---

### Phase 2 — Operations dashboard

| Feature | Description |
|---------|-------------|
| Summary cards | Inquiries today / this week / by event type |
| Search & filter | By date, event type, status, phone |
| Duplicate detection | Same phone/email within 7 days |
| Notification badge | Optional daily digest email if no login |

**Estimated effort:** 2–3 days on top of Phase 1.

---

### Phase 3 — Content lite (optional)

| Feature | Description |
|---------|-------------|
| Site settings | Phone, email, WhatsApp, Maps URL, Instagram (today hard-coded in `site-contact.ts`) |
| Hero / packages text | Edit key copy without redeploying entire frontend |
| Gallery upload | Add/remove gallery images from admin |

**Requires:** file storage (Hostinger or S3) + cache invalidation. **Defer** until Phase 1 is in daily use.

---

### Phase 4 — Growth (future)

- Availability calendar / hold dates  
- Quotation PDF generator  
- WhatsApp Business API integration  
- Role-based staff accounts  

---

## 4. Proposed architecture

```
┌─────────────────┐     JWT cookie      ┌──────────────────┐
│  /admin (Angular)│ ◄──────────────────►│  Render API      │
│  Hostinger static│                     │  /api/admin/*    │
└─────────────────┘                     └────────┬─────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
              MySQL inquiries              admin_users (Phase 1)          Resend (existing)
              + status, notes
```

**Hosting options for `/admin`:**

| Option | Pros | Cons |
|--------|------|------|
| **A. Same Angular app** (`sirivruddhi.com/admin`) | One deploy | Admin bundle in public repo path |
| **B. Subdomain** (`admin.sirivruddhi.com`) | Clear separation | Extra DNS + build |
| **C. Render only** (API serves minimal admin HTML) | Fast MVP | Ugly UI |

**Recommendation:** **Option A** — route `/admin` in existing Angular app, lazy-loaded module, protected by login.

---

## 5. Data model changes (Phase 1)

```sql
-- Extend existing table
ALTER TABLE inquiries
  ADD COLUMN status ENUM('new','contacted','visit_scheduled','booked','closed') NOT NULL DEFAULT 'new',
  ADD COLUMN admin_notes TEXT NULL,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- Optional: audit who changed status (Phase 2)
CREATE TABLE inquiry_status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  old_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);
```

**Admin auth (simple MVP):**

```sql
CREATE TABLE admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Or skip DB sessions: **signed JWT** in httpOnly cookie, secret `ADMIN_JWT_SECRET` on Render, single password `ADMIN_PASSWORD` hash in env.

---

## 6. API design (Phase 1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/admin/login` | — | Body: `{ password }` → Set cookie |
| `POST` | `/api/admin/logout` | Admin | Clear cookie |
| `GET` | `/api/admin/me` | Admin | Session check |
| `GET` | `/api/admin/inquiries` | Admin | List (pagination, filter) |
| `GET` | `/api/admin/inquiries/:id` | Admin | Detail |
| `PATCH` | `/api/admin/inquiries/:id` | Admin | Update `status`, `admin_notes` |
| `GET` | `/api/admin/inquiries/export.csv` | Admin | CSV download |

**Security must-haves:**

- Rate-limit login (e.g. 5 attempts / 15 min per IP)  
- HTTPS only; `Secure` + `SameSite=Strict` cookie  
- CORS: allow admin only from `https://sirivruddhi.com`  
- Never expose admin routes without middleware  
- Audit log for status changes (Phase 2)

---

## 7. Admin UI wireframe (Phase 1)

### Login
- Logo, password field, “Sign in”
- No public signup

### Inbox (`/admin/inquiries`)
```
┌──────────────────────────────────────────────────────────────┐
│  Siri Vruddhi Admin          sirivruddhi@gmail.com  [Logout] │
├──────────────────────────────────────────────────────────────┤
│  [New: 3]  [This week: 12]                    [Export CSV]   │
│  Filter: [All statuses ▼] [Event type ▼]  Search: [________] │
├──────────────────────────────────────────────────────────────┤
│  ● NEW   Priya S.      Wedding      +91 98…   10 Jun 2:30pm  │
│  ○ CONT  Ravi K.       Engagement   +91 95…   9 Jun 11:00am  │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

### Detail drawer / page
- All form fields (read-only except notes/status)  
- Buttons: Call · WhatsApp · Email · Open in Maps  
- Status dropdown + Save  
- Timeline (Phase 2)

---

## 8. Non-functional requirements

| Area | Target |
|------|--------|
| Availability | Same as API (Render); admin usable on mobile browser |
| Performance | Inbox loads &lt; 2s for 500 inquiries |
| Backup | Hostinger MySQL backups + weekly CSV export habit |
| Privacy | Phone/email only visible after login; comply with consent on form |
| Cost | Phase 1 adds $0 beyond existing Render/Hostinger |

---

## 9. What NOT to build yet

- Full CMS replacing Angular site  
- Customer-facing login / booking payments  
- Complex RBAC for many staff  
- Native mobile app  

These add cost and maintenance without fixing today’s main gap (**inquiry management**).

---

## 10. Implementation priority (recommended backlog)

| # | Story | Priority |
|---|-------|----------|
| 1 | DB migration: `status`, `admin_notes` | P0 |
| 2 | Admin login + JWT middleware | P0 |
| 3 | `GET/PATCH` inquiry APIs | P0 |
| 4 | Angular `/admin` lazy module: login + inbox + detail | P0 |
| 5 | CSV export | P1 |
| 6 | Dashboard counts | P1 |
| 7 | Move `SITE_CONTACT` to DB / admin settings | P2 |

---

## 11. Success metrics (3 months after launch)

- 100% of follow-ups tracked in admin (not only email)  
- Average first response time &lt; 24 hours (measurable via `contacted` timestamp)  
- Zero need for phpMyAdmin for daily ops  
- Owner can export monthly inquiry report in one click  

---

## 12. Next step

**Approve Phase 1 MVP** → implement backend auth + inquiry APIs + Angular admin inbox in a follow-up development sprint.

Until then, continue using **email notifications + phpMyAdmin** as backup.
