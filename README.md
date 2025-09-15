# 🚀 Mini Buyer Lead Intake App

A streamlined web application to capture, manage, and track buyer leads efficiently..
---

## 📝 App Overview

This app enables users to:

- 🚩 Creating leads with thorough validation
- 🔍 Searching, filtering, and paginating leads (server-side rendered)
- 📥 Importing and exporting leads via CSV with detailed error reporting
- 🕒 Tracking and displaying change history for each lead
- 🔐 User authentication with role-based access control (User/Admin)
- 📊 Access a personalized dashboard displaying owned leads and user info
- ⚡ Benefit from rate limiting and robust error handling for smooth performance

---

## 🛠️ Tech Stack

- Built with Next.js (App Router), TypeScript, Tailwind, Prisma, and Supabase.

---

## ✅ Features

- Lead CRUD – Create, view, update, delete buyer leads with form validation
- CSV Import/Export – Import up to 200 leads with row-level validation; export filtered results
- Search & Filter – Server-side search and filters with pagination
- Role-Based Access – Users can manage their own leads; admins can manage all
- Authentication – Email/password login via Supabase Auth
- Change History – Tracks the last 5 changes per lead (who, what, when)
- Rate Limiting – Limits to 10 create/update actions per minute per user
- Error Handling – Graceful fallbacks via error boundaries and empty states
- Tag Chips with Typeahead – For better lead tagging UX
- Dashboard – Personalized view of leads owned by the logged-in user
- Responsive UI – Built with Tailwind CSS and shadcn/ui for clean, accessible design  

---

## Getting Started ▶️

### Prerequisites

- Node.js (v13+ recommended)  
- PostgreSQL database (Supabase recommended)  
- Git  

### Setup

1. Clone the repo  
   ```bash
   git clone https://github.com/anshul-c0des/buyer-leads.git
   cd buyer-leads
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure environment variables
   ```bash
   DATABASE_URL="your_supabase_database_url"
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```
4. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 in your browser

---


## 🧠 Design Notes

-  Validation via Zod schemas on both client and server for consistent data integrity
-  Server-side rendered lead list with real pagination and URL-synced filters
-  Ownership enforced in Prisma queries for all mutating operations
-  Role-based access: Admins manage/export all leads; users manage/export only their own (admin role assigned in DB)
-  Concurrency handled with updatedAt timestamp to avoid stale updates
-  Rate limiting applied at API level based on authenticated user context
-  UI built with shadcn/ui + Tailwind for clean, accessible, and responsive design enhanced by smooth UX features


---

## What's Done

- Lead CRUD with validation
- CSV import/export (with error reporting)
- Search/filter with server-side pagination
- Role-based access (user/admin)
- Change history per lead

## What's Skipped

### Nice-to-Haves Skipped
- Optimistic edit with rollback – Not implemented; currently using standard form submission with loading indicators.
- File upload for attachmentUrl – Not implemented due to time constraints and optional nature.

### Quality Bar – Skipped
- 1 unit test (CSV or budget validator) – Skipped due to limited testing experience; planned for future work.


---

## 🌐 Live Demo

🔗 **[View Deployed Project on Vercel](https://buyer-leads-gamma.vercel.app/buyers)** 
