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

- **Framework:** Next.js (App Router) + TypeScript  
- **UI:** Tailwind CSS, shadcn/ui, lucide-react icons, sonner (toast notifications)  
- **Database:** Supabase (Postgres)  
- **ORM & Migrations:** Prisma  
- **Authentication:** Supabase Auth (email/password sign-up and login)  
- **Validation:** Zod (client and server-side)  
- **Deployment** Vercel

---

## ✅ Features

- **CRUD Operations:** Full create, read, update, delete for buyer leads  
- **Lead Data Model:** Includes fields such as fullName, phone, email, city, propertyType, BHK, budget range, timeline, source, status, tags, notes, and ownership  
- **Search & Filters:** Server-side rendered paginated list with filters for city, property type, status, timeline, and debounced search by name, phone, or email  
- **CSV Import/Export:** Upload up to 200 rows with row-level validation and error reporting; export filtered lead lists respecting current filters and sorting  
- **Role-Based Export Access:**  
  - Regular users can **only export leads they own**  
  - Admin users (must be assigned manually in the database) can edit as well as export **all leads**
- **Change History:** Stores last 5 changes per lead in a separate `buyer_history` table, showing who changed what and when  
- **Authentication & Authorization:** Users can sign up/login via email/password. Only owners can edit/delete their leads. All logged-in users can read leads.  
- **Dashboard:** Displays user profile info and leads created by them for quick access  
- **Rate Limiting:** Limits each user to 10 create/update requests per minute to prevent abuse (enforced via Supabase Auth user context)  
- **UI/UX Enhancements:** Tag chips with typeahead, smooth user feedback via toast notifications, concurrency handling via `updatedAt` timestamp check  
- **Error Handling:** Error boundary implemented for better user experience  

---

## Nice-to-Haves Implemented

- ✅ Tag chips with typeahead – Implemented using custom input with autocomplete UX.
- ✅ Basic full-text search on fullName, email, notes – Implemented via server-side filters with debounced input.
- ✅ Status quick-actions (dropdown in table) – Added inline dropdown to change status from the lead list table.

## Quality Bar Implemented

- ✅ Simple rate limit on create/update (per user) – Enforced via Supabase RLS policies and custom logic limiting to 10 req/min/user.
- ✅ Error boundary + empty state – Implemented via React ErrorBoundary and conditional rendering for no-leads case.
- ✅ Accessibility basics – Labels, keyboard navigation, and basic ARIA attributes used (still needs more testing).

## What's Skipped

### Nice-to-Haves Skipped
- Optimistic edit with rollback – Not implemented; currently using standard form submission with loading indicators.
- File upload for attachmentUrl – Not implemented due to time constraints and optional nature.
- 
### Quality Bar – Skipped
- 1 unit test (CSV or budget validator) – Skipped due to limited testing experience; planned for future work.

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

🧠 Design Notes

-  Validation via Zod schemas on both client and server for consistent data integrity
-  Server-side rendered lead list with real pagination and URL-synced filters
-  Ownership enforced in Prisma queries for all mutating operations
-  Role-based access: Admins manage/export all leads; users manage/export only their own (admin role assigned in DB)
-  Concurrency handled with updatedAt timestamp to avoid stale updates
-  Rate limiting applied at API level based on authenticated user context
-  UI built with shadcn/ui + Tailwind for clean, accessible, and responsive design enhanced by smooth UX features

 ---

## 🌟 Key Learnings & Skills Demonstrated

-  Integrating Next.js App Router with Prisma and server-side rendering
-  Implementing robust validation with Zod across client and server
-  Managing authentication and authorization securely with Supabase Auth
-  Handling data concurrency and maintaining audit trails via change history
-  Building user-friendly CSV import/export with detailed validation feedback
-  Applying rate limiting and error boundaries for production readiness
-  Designing and enforcing role-based access control

---

## 🌐 Live Demo

🔗 **[View Deployed Project on Vercel](https://buyer-leads-gamma.vercel.app/buyers)** 
