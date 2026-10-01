# The Keepsake Smith — System Architecture

## 1. Domain & Subdomain Structure

| Subdomain | Purpose | Runs On |
|---|---|---|
| `www.thekeepsakesmith.com` | Main Storefront & Custom Checkout — Next.js Application | Container: `storefront` |
| `admin.thekeepsakesmith.com` | Dedicated Admin CRM & Catalog CMS — Isolated Admin Portal | Container: `storefront` (Admin Route Isolation) |
| `app.thekeepsakesmith.com` | Portal — 12-character access code redemption & WebGL 3D loader | Container: `portal` |
| `packages.thekeepsakesmith.com` | Static hosting for Unity WebGL builds / templates | Container: `packages` (Nginx static) |

All routed through Cloudflare (proxied, Free plan).

---

## 2. Docker Container Breakdown

```
docker-compose.yml
├── storefront       (Next.js App — Storefront, Custom Checkout, Products, Categories & Admin CRM)
├── portal           (Frontend App — Code Entry + Unity WebGL Loader)
├── packages         (Nginx — Static Unity WebGL Build & Asset Hosting with CORS headers)
└── nginx-host       (Host Reverse Proxy routing subdomains to Docker containers)
```

---

## 3. Database Schema

### `orders`
| Field | Type | Notes |
|---|---|---|
| id | string | Internal Order ID (e.g. `ORD-1001`) |
| purchaser_name | string | Customer Name |
| purchaser_email | string | Customer Email |
| recipient_type | enum | `self` / `gift` |
| recipient_name | string, nullable | Only if gift |
| recipient_email | string, nullable | Only if gift |
| fulfillment_type | enum | `physical_card` / `digital_only` |
| status | enum | `pending`, `in_production`, `ready`, `delivered` |
| total_amount | number | Total in NGN |
| access_code | string(12) | 12-character access code key |
| items | JSON Array | Purchased package items & customization |
| created_at | timestamp | Order creation timestamp |

### `access_codes`
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| order_id | string (FK) | Link to internal order |
| code | string(12) | Alphanumeric (excluding 0/O, 1/I/l) |
| package_id | UUID (FK), nullable | Set once production is complete |
| failed_attempts | int | For rate-limiting |
| locked_until | timestamp, nullable | Temporary lockout after abuse |
| created_at | timestamp | |

### `packages`
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| template_id | UUID (FK) | Reusable Unity template |
| build_path | string | Asset path on `packages.thekeepsakesmith.com` |
| personalization_data | JSON | Text, photos, custom audio injected into template |
| status | enum | `in_production`, `ready` |
| created_at | timestamp | |

### `categories`
| Field | Type | Notes |
|---|---|---|
| id | string | Category ID |
| name | string | Category Title (e.g. `CARDS`, `FLOWERS`) |
| slug | string | URL Slug |
| description | string | Category Description |

---

## 4. Native API Endpoints

**Storefront & Checkout**
- `POST /api/orders` — creates new order & generates unique 12-char access code
- `GET /api/admin/products` — catalog product listings
- `POST /api/admin/categories` — dynamic category manager

**Admin CRM (`admin.thekeepsakesmith.com`)**
- `GET /api/admin/orders` — queue for production team
- `PUT /api/admin/orders` — status update (`in_production` → `ready`) & triggers notification email

**Public Portal (`app.thekeepsakesmith.com`)**
- `POST /api/portal/redeem` — body: `{ code }` → validates 12-char code, checks rate limit, returns WebGL scene metadata

---

## 5. Data Flow (End-to-End)

```
1. Customer purchases on www.thekeepsakesmith.com (Native Next.js Checkout)
       │
       ▼
2. API → POST /api/orders
   → creates order + generates 12-char access code
       │
       ▼
3. Email: "Order Confirmation" → purchaser
       │
       ▼
4. Production team builds custom 3D experience on Admin Dashboard
       │
       ▼
5. Admin CRM → status update → "READY"
       │
       ▼
6. Email: "Your 3D Keepsake Experience is Ready!" + 12-char code → recipient
       │
       ▼
7. Recipient lands on app.thekeepsakesmith.com / portal
       │
       ▼
8. Enters 12-character access code (no account/login required)
       │
       ▼
9. Portal → POST /api/portal/redeem → API validates code, returns 3D WebGL scene
       │
       ▼
10. Recipient experiences personalized 3D Keepsake scene
```

---

## 6. Key Technical Decisions Locked In

- **No WooCommerce / WordPress dependence** — 100% custom Next.js storefront, checkout, API, and dedicated Admin CRM.
- **Access codes:** 12 characters, alphanumeric, randomly generated, excludes ambiguous characters (`0/O`, `1/I/l`), rate-limited on entry.
- **No portal accounts required** — 12-char access code is the only credential needed.
- **Fulfillment & Gifting:** First-class support for gift recipient vs purchaser workflows, independent of physical card vs digital-only delivery.
