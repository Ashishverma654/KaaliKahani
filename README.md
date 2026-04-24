# KaaliKahani - Professional Multilingual Story Platform

KaaliKahani is a premium, professional publishing platform designed for high-end narratives. It supports bilingual content (English and Hindi) and features a sophisticated "Editorial Noir" aesthetic. 

The project follows a **Decoupled Architecture**, separating the Public Platform (this repository) from a future Administrative Dashboard, both sharing a unified backend and database core.

---

## 🏛 Architecture & Industry Standards

This project is built to industrial standards, focusing on scalability and security:

- **Decoupled Back-Office**: The frontend is strictly for authors and readers. Administrative tasks (moderation, user management, analytics) are designed to be handled by a separate project sharing the same database.
- **RBAC (Role-Based Access Control)**: The backend includes a `restrictTo` middleware for future-proofing sensitive API endpoints.
- **Moderation Pipeline**: Stories and comments follow a "Pending -> Approved" workflow, allowing for editorial oversight from a separate admin interface.
- **Linguistic Nesting**: Data models support complex, multi-language mapping (English/Hindi) for titles, slugs, and content.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Vanilla CSS with modern variables and glassmorphic components.
- **State Management**: React Context & Hooks (Custom `useAuth` provider).
- **Notifications**: React Hot Toast.

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: JWT (JSON Web Tokens) with Secure Cookie support.
- **AI Integration**: Google Gemini Pro for narrative analysis.
- **Media**: Cloudinary integration for image hosting.

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gemini API Key
- Cloudinary Account

### 1. Backend Setup
1. `cd Backend`
2. `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   REFRESH_SECRET=your_refresh_secret
   GEMINI_API_KEY=your_gemini_key
   CLOUDINARY_CLOUD_NAME=name
   CLOUDINARY_API_KEY=key
   CLOUDINARY_API_SECRET=secret
   ```
4. `npm run dev`

### 2. Frontend Setup
1. `cd Frontend`
2. `npm install`
3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. `npm run dev`

---

## 📖 API Reference

### Auth Service
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Register a new author account. |
| `/auth/login` | `POST` | Authenticate and receive tokens. |
| `/auth/logout` | `POST` | Terminate session. |
| `/auth/me` | `GET` | Retrieve profile of logged-in user. |
| `/auth/profile` | `PUT` | Update account details (Avatar, Name, etc.). |

### Story Service
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/stories` | `GET` | Fetch approved public stories. |
| `/stories/:slug` | `GET` | Get full narrative content by slug. |
| `/stories` | `POST` | Submit a new narrative (Status: Pending). |
| `/stories/drafts` | `GET` | Retrieve personal unpublished drafts. |
| `/stories/analyze` | `POST` | Trigger AI Sense analysis on content. |
| `/stories/:id/like` | `POST` | Toggle narrative appreciation. |

### Series & Progress
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/series` | `POST` | Group stories into a thematic series. |
| `/progress/:id` | `GET/PUT` | Track and persist reading progress. |

---

## 📜 License
This project is licensed under the ISC License.
