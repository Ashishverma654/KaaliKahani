# KaaliKahani - Multilingual Story Platform

KaaliKahani is a premium, professional storytelling platform that supports bilingual content (English and Hindi). It features a clean, parchment-inspired design and leverages AI for story analysis and enhancement.

## Project Structure

- **[Frontend](file:///e:/Projects/Story-Website/Frontend)**: Next.js application with a modern, responsive UI.
- **[Backend](file:///e:/Projects/Story-Website/Backend)**: Node.js/Express API with MongoDB for data persistence.

## Key Features

- **Multilingual Support**: Write and read stories in English and Hindi.
- **AI Analysis**: Get suggested titles, categories, and realism scores using Gemini AI.
- **User Profiles**: Manage your profile, stories, and reading progress.
- **Story Series**: Organize your stories into series for a better reading experience.
- **Clean Design**: A warm, readable light theme with professional typography.

## Getting Started

### Backend Setup
1. Navigate to the `Backend` directory.
2. Create a `.env` file based on `.env.example`.
3. Run `npm install`.
4. Run `npm run dev`.

### Frontend Setup
1. Navigate to the `Frontend` directory.
2. Create a `.env.local` file with `NEXT_PUBLIC_API_URL`.
3. Run `npm install`.
4. Run `npm run dev`.

---

## API Documentation

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: User login (returns tokens).
- `POST /api/auth/logout`: Log out the current user.
- `GET /api/auth/me`: Get current user details.
- `PUT /api/auth/profile`: Update user profile details.
- `POST /api/auth/change-password`: Change user password.
- `POST /api/auth/refresh`: Refresh access token using refresh token.

### Stories
- `GET /api/stories`: Fetch public stories (supports `lang`, `page`, `limit`, `category`).
- `GET /api/stories/featured`: Get the currently featured story.
- `GET /api/stories/search`: Search stories by text query.
- `GET /api/stories/:slug`: Get a single story by its slug.
- `POST /api/stories`: Submit a new story for review.
- `GET /api/stories/me`: Get stories submitted by the logged-in user.
- `POST /api/stories/:id/like`: Toggle like on a story.
- `POST /api/stories/:id/comment`: Add a comment to a story.
- `POST /api/stories/upload`: Upload an image to the media registry.
- `POST /api/stories/analyze`: Analyze story content using AI.

### Drafts
- `GET /api/stories/drafts`: Get all drafts for the logged-in user.
- `GET /api/stories/draft/:id`: Get a specific draft by ID.
- `POST /api/stories/draft`: Create a new draft.
- `PUT /api/stories/draft/:id`: Update an existing draft.

### Series
- `GET /api/series/me`: Get series created by the logged-in user.
- `POST /api/series`: Create a new story series.

### Progress
- `GET /api/progress/:storyId`: Get user's reading progress for a story.
- `PUT /api/progress/:storyId`: Update user's reading progress.

### Settings
- `GET /api/settings/public`: Fetch public system settings (e.g., maintenance mode).
