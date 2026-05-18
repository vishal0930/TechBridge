# 💰 Full-Stack Personal Finance Tracker

A comprehensive, full-stack Personal Finance Tracker application designed to help users manage their income, track expenses, and visualize financial analytics. 

This project was built to demonstrate proficiency in modern full-stack web development, incorporating robust architectural patterns, Role-Based Access Control (RBAC), database design, caching, and performance optimization techniques.

---

## ✨ Key Features

- **Robust Authentication & Security**
  - JWT-based authentication with secure, HttpOnly refresh tokens.
  - Strict Role-Based Access Control (RBAC):
    - `Admin`: Full access, including User Management.
    - `User`: Can manage their own transactions and view their own analytics.
    - `Read-Only`: Can view data, but is restricted from mutating state (buttons hidden/disabled).
  - Advanced route protection on both Frontend and Backend API endpoints.

- **Transaction Management**
  - Create, read, edit, and delete transactions.
  - Built-in pagination, search by description, and category filtering.
  - Custom category creation with color-coding.

- **Advanced Analytics Dashboard**
  - Dynamic Recharts integration featuring:
    - **Pie Charts**: Category-wise expense breakdown.
    - **Bar Charts**: Income vs. Expense monthly trends.
    - **Line Charts**: Net balance historical trends.

- **Performance & Scalability Optimization**
  - **Redis Caching**: Highly requested analytics and category data are cached (with intelligent cache-busting upon mutation).
  - **API Rate Limiting**: Strict endpoint rate limits (Auth: 5/15m, Analytics: 50/1h) to prevent abuse.
  - **React Lazy Loading**: Route-based code splitting using `React.lazy` and `Suspense`.
  - **React Hooks**: Optimized UI rendering via `useMemo` for heavy data mapping and `useCallback` for event handlers.
  - Native list virtualization for high-performance transaction rendering.
  - Global Theme Management via `useContext` (Light/Dark mode).

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router v6** (Protected & Lazy-loaded routes)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **CSS3 / Vanilla CSS** (Custom Design System with CSS Variables)

### Backend
- **Node.js** & **Express.js**
- **PostgreSQL** (Relational Database, handled via `pg` driver)
- **Redis** (Data Caching)
- **express-validator** (Request sanitization and validation)
- **jsonwebtoken** & **bcrypt** (Auth & Security)
- **express-rate-limit** (Endpoint protection)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running.
- Redis server installed and running.

### 1. Database Setup
1. Create a new PostgreSQL database (e.g., `finance_tracker`).
2. Run the SQL schema files located in `backend/migrations/` in sequential order to generate the tables.

### 2. Backend Setup
```bash
cd backend
npm install
```
- Copy the `.env.example` file and rename it to `.env`. Fill in your local Postgres and Redis credentials.
- Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
- Start the Vite development server:
```bash
npm run dev
```

### 4. Default Admin User
To test the full suite of features (including the Users directory), you can manually change a registered user's role to `admin` directly within your PostgreSQL database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📈 Architecture Overview
- **Service Layer Pattern**: The backend relies on controllers pointing to service models, keeping business logic distinct from database queries.
- **Frontend Axios Interceptors**: Axios is configured to automatically attach access tokens to requests and seamlessly handle silent refresh-token rotation when tokens expire.
- **Cache Invalidation**: Redis caches user analytics and dashboards. When a user creates or deletes a transaction, their specific cache keys are instantly invalidated, guaranteeing real-time accuracy without database strain.

---
*Built with modern full-stack methodologies.*
