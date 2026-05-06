# KaaliKahani - Professional Multilingual Narrative Platform

KaaliKahani is an industrial-grade, full-stack storytelling platform designed for high-end narratives. It features a sophisticated "Editorial Noir" aesthetic, bilingual support (English/Hindi), and a decoupled architecture that separates the Public Platform from the Administrative Backend.

---

## ✨ Key Features

- **📖 "Editorial Noir" Aesthetic**: A fully responsive, premium user interface built with TailwindCSS, featuring glassmorphism, dynamic grids, and dark/light modes.
- **🤖 AI Writing Assistant**: Integrated with the Gemini API to help authors refine, expand, and structure their story drafts directly within the submission flow.
- **🖼️ Seamless Image Hosting**: Native integration with Cloudinary for lightning-fast cover image and inline story image uploads.
- **🔖 Persistent Bookmarking System**: Logged-in users can save stories to their "Reading List," complete with visual feedback and backend persistence.
- **🔍 Regex Fuzzy Search**: A powerful, typo-tolerant search engine capable of finding stories across multiple languages and categories instantly.
- **📊 Real-time Reading Progress**: Advanced reading trackers and live views/likes counters to boost community engagement.
- **🌐 Bilingual Support**: Full support for both English and Hindi narratives with integrated translation pathways.

---

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens) with dual Access/Refresh token architecture
- **Cloud Storage**: Cloudinary
- **AI Integration**: Google Gemini AI

---

## 🏛 System Architecture

This project follows a **Decoupled Admin Pattern**. The repository contains the Public Frontend and the Shared Backend.

- **Public Frontend**: Designed strictly for authors (submission) and readers (consumption).
- **Shared Backend**: A unified Node.js/Express API that serves both the Public Site and the Standalone Admin Dashboard.
- **Administrative Layer**: All administrative actions are heavily secured under the `/api/admin` namespace and protected by strict Role-Based Access Control (RBAC).

---

## 🚀 Getting Started

Follow these steps to run the KaaliKahani platform on your local machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Database (Local or Atlas)
- Cloudinary Account
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/KaaliKahani.git
cd KaaliKahani
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `/Backend` directory with the following variables:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secrets (Generate secure random strings)
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=1d

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini API Integration
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd Frontend
npm install
```

Create a `.env.local` file in the `/Frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The website will be live at `http://localhost:3000`.

---

## 🔐 Security Information

- **Environment Variables**: Sensitive data is strictly ignored via `.gitignore` and must be provided via local environment variables.
- **Cross-Origin Resource Sharing (CORS)**: The API restricts requests to whitelisted frontend domains.
- **Route Protection**: Next.js route handlers and Express middleware ensure unauthorized users cannot access restricted submission or administrative dashboards.

---

*Version 2.3.0 - The Complete Experience Update*
