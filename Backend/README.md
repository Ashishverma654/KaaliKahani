# KaaliKahani API Architecture

A production-ready Node.js/Express API designed for the "KaaliKahani" multilingual story platform.

## Technical Overview

- **Architecture**: Service-Controller pattern with Mongoose models.
- **Authentication**: JWT (Access + Refresh tokens) with cookie-based persistence.
- **Storage**: MongoDB Atlas for data, Cloudinary for media.
- **AI Integration**: Gemini 1.5 Flash for narrative analysis and translation.
- **Security**: Rate-limiting, Helmet, CORS, and password hashing with bcrypt.

## API Endpoints

For a full list of available endpoints and descriptions, please refer to the [Root README](file:///e:/Projects/Story-Website/README.md).

### Core Services
- `authService.js`: Handles registration, login, and profile management.
- `storyService.js`: Manages stories, drafts, likes, and comments.
- `geminiService.js`: Orchestrates AI-powered analysis and translations.

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run seeds (if needed): `node scripts/seedAdmin.js`

---
*Version 2.0.4 - Premium API Edition*
