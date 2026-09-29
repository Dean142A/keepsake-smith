# The Keepsake Smith — System Architecture

## 1. Domain & Subdomain Structure

| Subdomain | Purpose | Runs On |
|---|---|---|
| `www.thekeepsakesmith.com` | Main storefront — WordPress + WooCommerce | Container: `wordpress` |
| `api.thekeepsakesmith.com` | Central API — order sync, access code logic, package lookup | Container: `api` |
| `app.thekeepsakesmith.com` | Portal — where users enter access code and view the 3D experience | Container: `portal` |
| `packages.thekeepsakesmith.com` | Static hosting for Unity WebGL builds / templates | Container: `packages` (Nginx static) |

All routed through Cloudflare (proxied, Free plan — note the 100MB per-file cache limit this imposes on `packages`).

---

## 2. Docker Container Breakdown

```
docker-compose.yml
├── wordpress        (WordPress + WooCommerce, MySQL-backed)
├── mysql            (shared or dedicated DB per service — see note below)
├── api              (Node/PHP/Python service — business logic)
├── portal           (frontend app — code entry + Unity WebGL loader)
├── packages         (Nginx — static Unity build/template hosting, CORS + compression headers)
└── nginx-proxy       (reverse proxy routing subdomains to correct container, or handled via host Nginx + Cloudflare)
```

**Database note:** WooCommerce needs its own MySQL database. Your API service should use a **separate database** (or at minimum separate schema) for orders/access codes/packages — don't let WooCommerce's tables and your custom logic mix. Keeps things clean and avoids WooCommerce updates ever touching your custom data.

---

## 3. Database Schema (API's own DB — not WooCommerce's)

### `orders`
| Field | Type | Notes |
|---|---|---|
| id | UUID | Internal ID |
| woocommerce_order_id | int | Link back to WooCommerce |
| purchaser_name | string | |
| purchaser_email | string | |
| recipient_type | enum | `self` / `gift` |
| recipient_name | string, nullable | Only if gift |
| recipient_email | string, nullable | Only if gift |
| fulfillment_type | enum | `physical_card` / `digital_only` |
| status | enum | `pending`, `in_production`, `ready`, `delivered` |
| created_at | timestamp | |

### `access_codes`
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| order_id | UUID (FK) | |
| code | string(12) | Random alphanumeric, no ambiguous chars (no 0/O, 1/I/l) |
| package_id | UUID (FK), nullable | Set once production is complete |
| failed_attempts | int | For rate-limiting |
| locked_until | timestamp, nullable | Temporary lockout after abuse |
| created_at | timestamp | |

### `packages`
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| template_id | UUID (FK) | Which reusable Unity template this uses |
| build_path | string | Path/URL on `packages.thekeepsakesmith.com` |
| personalization_data | JSON | Name, photos, custom message, etc. injected into the template |
| status | enum | `in_production`, `ready` |
| created_at | timestamp | |

### `templates`
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | string | e.g. "Anniversary Scene v1" |
| build_path | string | Base Unity WebGL build shared across personalizations |
| version | string | For tracking template updates over time |

---

## 4. API Endpoints (`api.thekeepsakesmith.com`)

**Inbound (from WooCommerce)**
- `POST /webhooks/woocommerce/order-created` — creates `orders` row, generates `access_codes` row (code generated immediately, `package_id` null until production done)
- `POST /webhooks/woocommerce/order-updated` — syncs status changes

**Inbound (from your internal production team/tool)**
- `POST /admin/packages` — mark a package as ready, attach `build_path` + `personalization_data`, link to `access_codes.package_id`, triggers "your package is ready" email

**Public (used by the portal)**
- `POST /portal/redeem` — body: `{ code }` → validates code, checks `failed_attempts`/`locked_until`, returns package metadata (template build path + personalization data) or an error
- Rate-limited per IP + per code (lock after ~5–10 failed attempts)

**Internal**
- `GET /admin/orders` — dashboard/queue for production team to see what's pending

---

## 5. Data Flow (End-to-End)

```
1. Customer purchases on www.thekeepsakesmith.com (WooCommerce)
       │
       ▼
2. Webhook → api.thekeepsakesmith.com
   → creates order + generates 12-char access code (package not yet linked)
       │
       ▼
3. Email: "Order received" → purchaser
       │
       ▼
4. Production team builds custom experience (template + personalization data)
       │
       ▼
5. Production tool → POST /admin/packages → links package to access code, status → "ready"
       │
       ▼
6. Email: "Your package is ready!" + access code → purchaser (self) or recipient (gift)
   (+ physical card shipped, if fulfillment_type = physical_card)
       │
       ▼
7. Recipient scans QR (generic, same for all cards) or clicks emailed link
   → lands on app.thekeepsakesmith.com
       │
       ▼
8. Enters 12-character access code (no account/login required)
       │
       ▼
9. Portal → POST /portal/redeem → API validates code, returns template build path + personalization data
       │
       ▼
10. Portal loads Unity WebGL build from packages.thekeepsakesmith.com
    (Brotli-compressed, CDN-cached via Cloudflare, branded loading screen while it streams in)
       │
       ▼
11. User experiences their personalized 3D scene
```

---

## 6. Key Technical Decisions Locked In

- **Access codes:** 12 characters, alphanumeric, randomly generated, excludes ambiguous characters (0/O, 1/I/l), rate-limited on entry
- **No portal accounts** — the access code is the only credential; nothing to register, nothing to log into
- **Template-based production** — Unity builds are shared templates with injected personalization data, not fully unique builds per order (keeps file sizes small, keeps Cloudflare Free's 100MB cache limit workable, keeps production fast after initial templates exist)
- **Gifting is a first-class concept** — purchaser and recipient can be different people, with separate notification paths
- **Fulfillment type is independent of recipient type** — physical card vs. digital-only just changes whether a card gets printed/shipped, not the underlying data model

---

## 7. Still Open / To Decide Next

- Exact tech stack for the API
- Plain Html/Js for the app.thekeepsakesmith.com frontend
- How personalization data gets *into* a Unity template at runtime (Unity needs to read this — likely via a JSON config the build fetches on load, or query params passed into the WebGL instance)
- Backup deliver so the users access code gets mailed to them regardless of if the card gets lost
- Admin production dashboard being it's own admin.portal.thekeepsakesmith.com not inside wordpress.
