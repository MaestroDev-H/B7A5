# 🏋️ GearUp – Sports & Outdoor Gear Rental Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://b7a5.vercel.app)

---

## 📌 Project Overview

**GearUp** is a full-featured, modern sports and outdoor equipment rental web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**. 

The platform bridges the gap between gear owners (Providers) who want to monetize their equipment and outdoor enthusiasts (Customers) looking for flexible, short-term rentals. It features a complete role-based system for **Customers**, **Providers**, and **Admins**, complete with end-to-end rental order workflows, real-time inventory updates, Stripe payment gateway integration, and account moderation.

### Why This Project Stands Out

1. **Role-Based Architecture & Dynamic Dashboards** – Tailored user experiences for Customers (rentals & review history), Providers (gear inventory & order management), and Admins (user moderation & platform stats).
2. **End-to-End Rental Booking & Stripe Payment Integration** – Seamless rental date calculations, automated price computation, Stripe Payment Intent checkout, and automated payment confirmation.
3. **High-Performance Next.js App Router Stack** – Built with server-side page optimization, client-side caching with TanStack React Query, form handling via React Hook Form + Zod, and image management powered by Cloudinary.

---

## ✨ Key Features

- **🛍️ Public Catalog & Advanced Discovery**
  - Instant search and filtering by category, price range, and brand name.
  - Interactive gear cards displaying daily rental rates, stock status, and category tags.
  - Detailed product page with full specs, provider information, and image galleries.

- **🔒 Authentication & Role Protection**
  - Secure JWT authentication flow (Login & Registration).
  - Next.js Middleware route guarding preventing unauthorized role access.
  - Persistent login state managed via custom Auth Context and local storage tokens.

- **🛒 Seamless Checkout & Payments**
  - Interactive rental date selector calculating total rental duration and total price.
  - Integrated Stripe Payment Intent API for secure payment processing.
  - Real-time confirmation and order placement.

- **👤 Customer Dashboard**
  - Overview of active and past rental orders with status badges (`PENDING`, `CONFIRMED`, `PICKED_UP`, `RETURNED`).
  - Detailed payment transaction log.
  - Post-rental gear review and rating submission modal.

- **📦 Provider Dashboard**
  - Comprehensive inventory management (Add new gear with Cloudinary image upload, delete listings).
  - Incoming rental order management console to update order lifecycle status (`CONFIRMED` ➔ `PICKED_UP` ➔ `RETURNED`).

- **🛡️ Admin Dashboard**
  - User management console to toggle user account status (`ACTIVE` vs. `SUSPENDED`).
  - Platform metrics overview and category creation controls.

---

## 🛠️ Tech Stack & Architecture

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Framework** | Next.js 16 (App Router) | High performance, server-side rendering, and streamlined file-based routing |
| **Language** | TypeScript | Strong static typing for robust API request/response handling |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Radix UI | Modern glassmorphism design system, responsive layouts, accessible UI components |
| **State & Caching** | TanStack React Query v5 | Client-side state management, cached API queries, automatic background revalidation |
| **Forms & Validation** | React Hook Form & Zod | Schema-validated form submissions with instant inline feedback |
| **Payments** | Stripe SDK (`@stripe/stripe-js`) | Secure credit card processing and Payment Intent management |
| **Media Hosting** | Cloudinary (`next-cloudinary`) | Optimized image uploads and fast CDN delivery for product listings |

---

## 🔑 Default Test Credentials (Seeded)

For testing and grading purposes, pre-configured accounts are available for each user role:

| Role | Email | Password | Access Rights |
|------|-------|----------|---------------|
| **Admin** | `admin@gearup.com` | `Admin123!` | User moderation, category creation, system stats |
| **Provider** | `provider@gearup.com` | `Provider123!` | Add/Manage gear inventory, manage incoming orders |
| **Customer** | `customer@gearup.com` | `Customer123!` | Browse catalog, create rental orders, submit reviews |

---

## 🔗 Live Links & Demonstration

- **Live Frontend Application**: [https://b7a5.vercel.app](https://b7a5.vercel.app)
- **Backend REST API**: [https://b7a4.vercel.app](https://b7a4.vercel.app) *(Repo: [MaestroDev-H/B7A4](https://github.com/MaestroDev-H/B7A4))*
- **Video Walkthrough**: [Watch Video Demo](https://drive.google.com/file/d/1nZIL2mCqEw2gsICn1OGPDpZeBNxbSqU4/view?usp=sharing)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **Backend API**: Local backend instance running on `http://localhost:5000/api` or live deployed API URL.

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MaestroDev-H/B7A5.git
   cd B7A5
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Backend REST API Base URL
   NEXT_PUBLIC_API_URL=http://localhost:5000/api

   # Cloudinary Upload Credentials
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Structure

```
B7A5/
├── src/
│   ├── app/                    # Next.js App Router Pages & Layouts
│   │   ├── (auth)/             # Authentication routes (login, register)
│   │   ├── checkout/           # Rental order checkout & Stripe payment flow
│   │   ├── dashboard/          # Protected role dashboards
│   │   │   ├── admin/          # Admin user moderation & settings
│   │   │   ├── customer/       # Customer rental history & reviews
│   │   │   └── provider/       # Provider inventory & order management
│   │   ├── gear/[id]/          # Detailed gear listing page
│   │   ├── layout.tsx          # Main root layout & Providers wrapper
│   │   └── page.tsx            # Home page & gear discovery catalog
│   ├── components/             # Reusable UI components & layouts
│   │   ├── layout/             # Navbar, Footer, Mobile Navigation
│   │   └── ui/                 # Card, Button, Input, Modal Dialogs
│   ├── context/                # React Auth Context for global state
│   ├── lib/                    # Axios API Client & helper utilities
│   └── middleware.ts           # Route protection & role-based redirects
├── public/                     # Static assets & icons
├── API_INTEGRATION.md          # Full endpoint mapping documentation
└── README.md                   # Project documentation
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
