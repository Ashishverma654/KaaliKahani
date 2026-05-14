# StoryHub API Documentation (v2.4.0)

Comprehensive technical documentation for the StoryHub ecosystem. This documentation covers all endpoints for the User Platform, Series Management, and the Admin Dashboard.

## Base Configuration
- **Base URL:** `http://localhost:5000/api` (Development) | `https://story-weaver-s3rj.onrender.com/api` (Production)
- **Content-Type:** `application/json` (Payload limit: **10MB**)
- **Rate Limiting:** Auth endpoints are limited to 5 attempts per 15 minutes; Interactions (likes/comments) are limited to 5 per minute (Submission/Interaction).

## Authentication (JWT)
StoryHub uses a dual-token system with access and refresh tokens.
- **Authorization:** `Authorization: Bearer <accessToken>`
- **Refresh Flow:** If a request returns `401`, call `POST /auth/refresh` to obtain a new access token using the stored refresh token.

---

## 1. Authentication & Profile (`/auth`)

### Register
- **URL:** `POST /auth/register`
- **Body:** `{ "name", "email", "password" }`
- **Response:** User object + `accessToken` & `refreshToken`.

### Login
- **URL:** `POST /auth/login`
- **Body:** `{ "email", "password" }`
- **Response:** `{ "user", "accessToken", "refreshToken" }`

### Token Refresh
- **URL:** `POST /auth/refresh`
- **Response:** New `accessToken`.

---

## 2. Stories Content (`/stories`)

### Discovery
- **GET /stories**: List all approved stories (Paginated).
  - **Auth Note:** Uses `softProtect`. Returns `isLiked: boolean` for authenticated users.
- **GET /stories/featured**: Returns a manually curated featured story.
- **GET /stories/search**: Search stories by title or content.

### Story Details
- **GET /stories/:slug**: Returns story body, comments, and metrics.
  - **Auth Note:** Uses `softProtect`. Returns `isLiked: boolean` for authenticated users.

### Writing & Submission (Protected)
- **POST /stories**: Submit a new story for review.
  - **Body:** `{ "title", "content", "category", "language", "images": [], "coverImage": string, "seriesId": string, "seriesOrder": number }`
  - **Note:** Stories are created with `status: 'pending'` and `isPublished: false`. 
  - **Category Lock:** If `seriesId` is provided, the story inherits the series category.
  - **Read Time:** Automatically calculated and formatted as `X min read`.
- **GET /stories/me**: List all stories authored by the current user.
- **POST /stories/upload**: Upload a story image (Multipart/form-data, field: `image`).
  - **Response:** `{ "success": true, "data": { "imageUrl": "..." } }`

---

## 3. Series Management (`/series`)

### User Series (Protected)
- **POST /series**: Create a new story series.
  - **Body:** `{ "title", "description", "category" }`
- **GET /series/me**: List all series created by the current user.

### Series Discovery
- **GET /series/:id**: Get series details and all stories belonging to it.

---

## 4. Drafts & AI Intelligence (`/stories`)

### Draft Management (Protected)
- **GET /stories/drafts**: List all story drafts.
- **POST /stories/draft**: Create a new draft.
  - **Body:** `{ "title", "content", "category", "seriesId", "seriesOrder", "coverImage", "images" }`
- **PUT /stories/draft/:id**: Update an existing draft.
- **DELETE /stories/draft/:id**: Delete an existing draft.

### AI Capabilities
- **POST /stories/analyze**: Get AI suggestions for title, category, and content improvements.
- **POST /stories/refine**: Use AI to redesign/rewrite story content based on a prompt.

---

## 5. Admin Dashboard (`/admin`)

### Story Moderation
- **GET /admin/stories**: List all stories in the system (all statuses).
- **POST /admin/stories**: Directly create an approved/published story.
- **PATCH /admin/stories/:id/status**: Update story status (`approved`, `rejected`, `pending`).

### User & Comment Moderation
- **GET /admin/users**: List all registered users.
- **PATCH /admin/users/:id/role**: Change user role (`user`, `admin`).
- **GET /admin/comments**: List all comments for moderation.
- **PATCH /admin/comments/:id/status**: Approve/Reject comments.

### Analytics & Stats
- **GET /admin/stats**: Get overview statistics for the dashboard.
- **GET /admin/stats/analytics**: Detailed traffic and engagement analytics.

---

## Implementation Details

### Personalization State (isLiked/isBookmarked)
Public story retrieval endpoints utilize **Soft Protection** to inject user-specific state (`isLiked`) without requiring a login for the request itself.

### Language Object Pattern
All textual content (Title, Content, Slug) is stored as a multilingual object (e.g., `{ "en": "..." }`). The `lang` parameter in requests determines which key is used for filtering and retrieval.

### Image Handling
The API supports both a `coverImage` (primary hero) and an `images` array (gallery). Cloudinary is used for archival storage.
