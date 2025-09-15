# 🚀 Mini Buyer Lead Intake App

A compact web application to capture, list, and manage buyer leads. Features include validation, search/filter, CSV import/export, user authentication, and role-based access control.

---

## 📝 Project Overview

Manage buyer leads effortlessly with functionalities such as:

- 🚩 Creating leads with robust validation
- 🔍 Searching, filtering, and paginating leads (server-side rendered)
- 📥 Importing and exporting leads via CSV with detailed error reporting
- 🕒 Tracking and displaying change history for each lead
- 🔐 User authentication with role-based access control (User/Admin)
- ⚡ Rate limiting and error boundaries for improved user experience
- 📊 Dashboard displaying user info and leads owned by them

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router) + TypeScript  
- **UI:** Tailwind CSS, shadcn/ui, lucide-react icons, sonner (toast notifications)  
- **Database:** Supabase (Postgres)  
- **ORM & Migrations:** Prisma  
- **Authentication:** Supabase Auth (email/password sign-up and login)  
- **Validation:** Zod (client and server-side)  

---

## ✅ Features Implemented

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

## What’s Skipped / Future Work ⚠️

- **Testing:** No unit tests currently due to limited experience; planned for future iterations  
- **Accessibility:** Basic accessibility practices followed, but full a11y compliance is a work in progress  
- **Deployment:** App is not deployed yet but is fully runnable locally  

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
   SUPABASE_SERVICE_ROLE_KEY="your_serv-ce_role_key"
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

- ✅ Validation via Zod schemas on both client and server for consistent data integrity
- 📄 Server-side rendered lead list with real pagination and URL-synced filters
- 🔐 Ownership enforced in Prisma queries for all mutating operations
- 🛡️ Role-based access: Admins manage/export all leads; users manage/export only their own (admin role assigned in DB)
- ⚔️ Concurrency handled with updatedAt timestamp to avoid stale updates
- ⏱️ Rate limiting applied at API level based on authenticated user context
- 🎨 UI built with shadcn/ui + Tailwind for clean, accessible, and responsive design enhanced by smooth UX features

 ---

## 🌟 Learnings & Reflections

### This project provided me an extensive hands-on experience with Prisma and Supabase in a real full-stack app. I learned about:
- Integrating Next.js App Router with a database ORM and server-side rendering
- Building robust validation with Zod across client and server boundaries
- Handling authentication and authorization with Supabase Auth
- Managing concurrency and change history for data integrity
- Designing user-friendly import/export flows with detailed validation feedback
- Implementing rate limiting and error boundaries for production-readiness
- Implementing role-based access control to improve security
