# KaaliKahani Backend Architecture

A production-ready Node.js/Express API designed for the "KaaliKahani" multilingual story platform. This system relies heavily on Clean Architecture, RBAC, and automated algorithmic indexing.

## Core Features
1. **Multilingual Story Storage**: MongoDB handles compound objects storing `en` and `hi` iterations gracefully, tracking localized slugs seamlessly.
2. **Strict RBAC & Auth**: Leveraging JWT paired with `bcrypt` encoding, specific endpoints like Submission, Liking, and Commenting are restricted. Explicit Admin routes control the `pending -> approved` pipeline.
3. **Advanced Rate-Limiting**: Spam bots are cut off automatically.
4. **Algorithmic Utilities**: Auto-parsing "Read Time" ratios map correctly to the payload constraints securely.

## Tech Setup
- Node.js & Express
- Mongoose (MongoDB)
- JWT (JSON Web Tokens)
- Helmet / CORS for native environment safety

## Initialization
1. Ensure your MongoDB Atlas map is configured and injected into `.env`. Use `.env.example` as a structural reference.
2. Run standard installation mappings:
   ```bash
   cd Backend/
   npm install
   npm run dev
   ```

## Folder Structure (Clean Flow)
- `config/`: MongoDB execution handlers and config constraints.
- `controllers/`: Request parsing and HTTP formatting.
- `middlewares/`: JWT Extractor shields, RBAC shields, Validation Shields.
- `models/`: Heavy Mongoose data shaping and schema relations.
- `routes/`: Explicit mapping arrays defining route paths and logic gates.
- `services/`: The absolute core of standard algorithmic parsing. No routes interact with DBs directly.
- `utils/`: Reusable math generators.
