# API Integration Documentation 🔌

This document maps all **GearUp Frontend** pages, components, and contexts to their corresponding **Backend REST API** endpoints, detailing request methods, payloads, authentication requirements, and functional descriptions.

---

## 🛠️ API Client & Base Configuration

- **API Client File**: [`frontend/src/lib/api-client.ts`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/lib/api-client.ts)
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"`
- **Authentication**: Automatically attaches JWT token from `localStorage` (`accessToken`) as a `Bearer` token in the `Authorization` header.

---

## 📋 Component to Endpoint Mapping

### 1. Authentication & Session Management

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/(auth)/login/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/(auth)/login/page.tsx) | `POST` | `/api/auth/login` | No | Log in user with `{ email, password }`. Returns JWT access token and user role. |
| [`frontend/src/app/(auth)/register/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/(auth)/register/page.tsx) | `POST` | `/api/auth/register` | No | Register new user with `{ name, email, password, role }`. Automatically logs in after success. |
| [`frontend/src/context/auth-context.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/context/auth-context.tsx) | `GET` | `/api/auth/me` | Yes | Retrieves current user session and profile based on stored JWT token. |

---

### 2. Public Gear Catalog & Product Details

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/page.tsx) | `GET` | `/api/gear` | No | Fetch gear listings with search and filter parameters (`search`, `category`, `minPrice`, `maxPrice`, `brand`). |
| [`frontend/src/app/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/page.tsx) | `GET` | `/api/categories` | No | Fetch list of all available gear categories for filter pills and dropdowns. |
| [`frontend/src/app/gear/[id]/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/gear/[id]/page.tsx) | `GET` | `/api/gear/:id` | No | Retrieve detailed information for a specific gear item, including specifications and provider details. |

---

### 3. Rental Order & Checkout Flow

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/checkout/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/checkout/page.tsx) | `POST` | `/api/rentals` | Yes (Customer) | Create rental order with `{ gearId, startDate, endDate, totalPrice }`. |
| [`frontend/src/app/checkout/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/checkout/page.tsx) | `POST` | `/api/payments/create` | Yes (Customer) | Create payment intent/session for order with `{ rentalOrderId, amount, paymentMethod }`. |

---

### 4. Customer Dashboard

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/dashboard/customer/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/customer/page.tsx) | `GET` | `/api/rentals` | Yes (Customer) | Retrieve rental order history for the logged-in customer. |
| [`frontend/src/app/dashboard/customer/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/customer/page.tsx) | `GET` | `/api/payments` | Yes (Customer) | Retrieve payment transaction history for the logged-in customer. |
| [`frontend/src/app/dashboard/customer/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/customer/page.tsx) | `POST` | `/api/reviews` | Yes (Customer) | Submit review for returned gear with `{ gearId, rating, comment }`. |

---

### 5. Provider Dashboard (Inventory & Orders)

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/dashboard/provider/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/provider/page.tsx) | `GET` | `/api/gear` | Yes (Provider) | Retrieve inventory items created by provider. |
| [`frontend/src/app/dashboard/provider/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/provider/page.tsx) | `POST` | `/api/provider/gear` | Yes (Provider) | Add new gear item with `{ title, description, categoryId, pricePerDay, brand, stock, imageUrl }`. |
| [`frontend/src/app/dashboard/provider/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/provider/page.tsx) | `DELETE` | `/api/provider/gear/:id` | Yes (Provider) | Remove gear listing from inventory by ID. |
| [`frontend/src/app/dashboard/provider/orders/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/provider/orders/page.tsx) | `GET` | `/api/provider/orders` | Yes (Provider) | Retrieve incoming rental orders for provider's gear items. |
| [`frontend/src/app/dashboard/provider/orders/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/provider/orders/page.tsx) | `PATCH` | `/api/provider/orders/:id` | Yes (Provider) | Update order status with `{ status: "CONFIRMED" | "PICKED_UP" | "RETURNED" }`. |

---

### 6. Admin Dashboard

| Component / Page File | HTTP Method | Backend Endpoint | Auth Required | Description / Payload |
|-----------------------|-------------|------------------|---------------|-----------------------|
| [`frontend/src/app/dashboard/admin/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/admin/page.tsx) | `GET` | `/api/admin/users` | Yes (Admin) | Retrieve all platform users (Customers and Providers). |
| [`frontend/src/app/dashboard/admin/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/admin/page.tsx) | `PATCH` | `/api/admin/users/:id` | Yes (Admin) | Toggle user account status with `{ status: "ACTIVE" | "SUSPENDED" }`. |
| [`frontend/src/app/dashboard/admin/page.tsx`](file:///g:/NextLevel_B7/B7A4_A5/frontend/src/app/dashboard/admin/page.tsx) | `POST` | `/api/categories` | Yes (Admin) | Create a new category with `{ name }`. |

---

## 🔄 End-to-End Interaction Data Flow

```
[ Frontend Client (Next.js) ]
          │
          ├─► 1. Login / Register ───────► POST /api/auth/login ──────────► [ Express Backend ]
          │                                  (Returns JWT Token)               │
          ├─► 2. Browse & Search ───────► GET /api/gear?category=... ─────► [ PostgreSQL (Prisma) ]
          │
          ├─► 3. Create Rental Order ───► POST /api/rentals ──────────────► [ Database Store ]
          │
          ├─► 4. Process Payment ──────► POST /api/payments/create ──────► [ Stripe / Payment Gateway ]
          │
          ├─► 5. Manage Inventory ──────► POST /api/provider/gear ───────► [ Provider Dashboard ]
          │
          └─► 6. Moderate Users ────────► PATCH /api/admin/users/:id ────► [ Admin Dashboard ]
```
