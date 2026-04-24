# KaaliKahani API - Technical Documentation

A high-performance Node.js/Express API engineered for the "KaaliKahani" multilingual publishing platform.

## 🏛 Technical Architecture

- **Pattern**: Service-Controller-Model architecture for clean separation of concerns.
- **RBAC**: Multi-role support with `restrictTo` middleware for decoupled admin projects.
- **Security**: 
  - JWT-based authentication (Dual-token system).
  - Secure HTTP-Only cookie implementation.
  - Rate-limiting and Helmet security headers.
  - Payload validation via `express-validator`.
- **Integrations**:
  - **Gemini AI**: Narrative intelligence, realism scoring, and automated translation.
  - **Cloudinary**: Production-ready media hosting and optimization.

## 🛠 Project Structure

- `controllers/`: Request handling and response formatting.
- `services/`: Business logic and database operations.
- `models/`: Mongoose schemas for Users, Stories, Comments, etc.
- `middlewares/`: Security, Auth, and Upload filters.
- `routes/`: Express router definitions.

## 📦 Core Dependencies

| Package | Purpose |
| :--- | :--- |
| `express` | Main server framework (v5). |
| `mongoose` | MongoDB ODM. |
| `jsonwebtoken` | Secure session management. |
| `@google/generative-ai` | Gemini AI integration. |
| `cloudinary` | Media registry management. |

## 🚀 Development

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env` and fill in secrets.
3. Start development server: `npm run dev`

---
*Version 2.1.0 - Professional Editorial Edition*
