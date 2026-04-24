# KaaliKahani - Professional Multilingual Narrative Platform

KaaliKahani is an industrial-grade storytelling platform designed for high-end narratives. It features a sophisticated "Editorial Noir" aesthetic, bilingual support (English/Hindi), and a decoupled architecture that separates the Public Platform from the Administrative Backend.

---

## 🏛 System Architecture (For AI & Developers)

This project follows a **Decoupled Admin Pattern**. The repository contains the Public Frontend and the Shared Backend.

- **Public Frontend**: strictly for authors (submission) and readers (consumption).
- **Shared Backend**: A unified Node.js/Express API that serves both the Public Site and the **Standalone Admin Dashboard** (hosted in a separate repository).
- **Administrative Layer**: All administrative actions are located under the `/api/admin` namespace and are protected by `adminOnly` middleware.

---

## 🔐 Security & Access Control

The system uses **JWT-based authentication** (Dual-token: Access + Refresh). 
- **Admin Verification**: The backend verifies `user.role === 'admin'`.
- **RBAC**: Any request to `/api/admin/*` must include a valid Admin JWT.
- **Session Safety**: Administrative actions like "Self-Deactivation" are blocked at the controller level for safety.

---

## 📡 Administrative API Specification (Dashboard Sync)

The following endpoints are optimized for the **KaaliKahani-Admin** project:

### 1. Analytics & Overview
- **`GET /api/admin/stats`**
    - **Purpose**: Populates dashboard cards and charts.
    - **Response**: 
      - `totalStories`: Integer
      - `pendingStories`: Integer
      - `activeUsers`: Integer
      - `totalComments`: Integer
      - `chartData`: Array of last 7 days (e.g., `{ name: 'Mon', count: 5 }`).

### 2. Story Moderation Queue
- **`GET /api/admin/stories`**
    - **Purpose**: Lists all narratives for review.
    - **Data**: Populates `author` field with `name`, `email`, and `avatar`. Sorted by Newest.
- **`PATCH /api/admin/stories/:id/status`**
    - **Purpose**: Approve or Reject a story.
    - **Payload**: `{ "status": "approved" | "rejected" | "pending" }`.
    - **Sync Logic**: Setting a story to `approved` automatically sets `isPublished: true` and updates `approvedAt`.

### 3. User Management
- **`GET /api/admin/users`**
    - **Purpose**: Full registry of platform users.
- **`PATCH /api/admin/users/:id/toggle-status`**
    - **Purpose**: Ban or Unban a user.
    - **Sync Logic**: Toggles the `isActive` boolean. Users with `isActive: false` are blocked from logging into either platform.

---

## 🔄 Data Synchronization Protocol

When building the Admin Panel, ensure the following logic is maintained:

| Entity | State | Effect on Public Platform |
| :--- | :--- | :--- |
| **Story** | `pending` | Hidden from public. Appears only in Author's Profile. |
| **Story** | `approved` | Visible on Home Page and Category lists. `isPublished` becomes `true`. |
| **Story** | `rejected` | Hidden from public. Marked as rejected in Author's Profile. |
| **User** | `role: admin` | Grants access to the Admin Dashboard API. |
| **User** | `isActive: false` | User is immediately logged out and cannot re-authenticate. |

---

## 🛠 Integration Checklist for Admin-AI
If you are the AI building the **KaaliKahani-Admin** project, use this list to verify your sync:
- [ ] **Auth Check**: Do I call `/api/auth/me` and verify `role === 'admin'` before showing the dashboard?
- [ ] **Status Mapping**: Do my "Approve" buttons send the exact string `"approved"` to `/api/admin/stories/:id/status`?
- [ ] **Analytics Sync**: Does my Dashboard chart correctly map the `chartData` array from `/api/admin/stats`?
- [ ] **Error Handling**: Do I show the `message` returned by the backend's `formatResponse` utility on 403/401 errors?

---

## 🚀 Deployment & Environment
- **Backend**: `npm run dev` in `/Backend`.
- **Frontend**: `npm run dev` in `/Frontend`.
- **Environment**: Ensure `MONGO_URI` and `JWT_SECRET` are shared between the Backend and any environment connecting to it.

---
*Version 2.2.0 - Decoupled Admin Integration Edition*
