# Melio 🍲

A full-stack recipe discovery app where users can search recipes (powered by the Spoonacular API), view detailed cooking info, and save favorites to their account.

**Live app:** https://melio-two.vercel.app/
**API:** https://melio-api.binsadik.online

---

## Screenshots

| Home | Search Results |
|---|---|
| ![Home](./screenshots/home.png) | ![Search](./screenshots/recipe-details.png) |

| Recipe Details | Saved Recipes |
|---|---|
| ![Recipe Details](./screenshots/recipe.png) | ![Saved Recipes](./screenshots/saved-recipes.png) |

| Login |
|---|
| ![Login](./screenshots/login.png) |

---

## Features

- 🔍 Search recipes via the Spoonacular API
- 📖 View detailed recipe info (ingredients, instructions, images)
- 🔐 User authentication (register/login) with JWT access & refresh tokens stored in httpOnly cookies
- ❤️ Save recipes to a personal collection, paginated
- 🗑️ Remove saved recipes
- 🛡️ Rate-limited auth routes, input validation with Zod, security headers via Helmet

---

## Tech Stack

**Backend**
- Node.js, Express, TypeScript
- PostgreSQL + Prisma ORM
- JWT auth (access + refresh tokens, httpOnly cookies)
- Zod for request validation
- Helmet, CORS, express-rate-limit, compression, morgan

**Frontend**
- React 18 + TypeScript
- Vite
- TanStack Query (React Query)
- React Router
- Tailwind CSS

**Deployment**
- Backend + PostgreSQL: Railway
- Frontend: Vercel
- Custom domain (`melio-api.binsadik.online`) via GoDaddy

---

## Project Structure

```
melio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── lib/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── validators/
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── api/
        ├── components/
        │   ├── common/
        │   ├── layout/
        │   └── recipes/
        ├── context/
        ├── hooks/
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── RecipeDetailsPage.tsx
        │   ├── SavedRecipesPage.tsx
        │   └── NotFoundPage.tsx
        └── types/
```

---

## Data Models

**User** — id, name, email, passwordHash, timestamps
**RefreshToken** — hashed token, linked to user, expiry, revoked flag
**SavedRecipe** — linked to user, Spoonacular recipe id, title, image (unique per user+recipe)

---

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new account |
| POST | `/login` | Log in, sets httpOnly auth cookies |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Log out and revoke refresh token |

### Recipes (`/api/v1/recipes`)
| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/search` | No | Search recipes via Spoonacular |
| GET | `/:id` | No | Get full recipe details |
| GET | `/saved/me` | Yes | List current user's saved recipes (paginated) |
| POST | `/saved` | Yes | Save a recipe |
| DELETE | `/saved/:id` | Yes | Remove a saved recipe |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Server uptime check |

---

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL database
- A [Spoonacular API key](https://spoonacular.com/food-api)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run prisma:migrate
npm run dev
```

**Backend environment variables (`.env`):**
```dotenv
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/recipe_app?schema=public"

JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

SPOONACULAR_API_KEY=replace_with_your_spoonacular_key
SPOONACULAR_BASE_URL=https://api.spoonacular.com
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # then fill in the value below
npm run dev
```

**Frontend environment variables (`.env`):**
```dotenv
VITE_API_BASE_URL=/api/v1
```

---

## Available Scripts

**Backend**
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run Prisma migrations and start production server |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint` / `npm run format` | Lint / format code |

**Frontend**
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` / `npm run format` | Lint / format code |

---

## Author

**Muhammed Risan Bin Sadik**
GitHub: [@risansadik](https://github.com/risansadik)
LinkedIn: [risan-bin-sadik](https://linkedin.com/in/risan-bin-sadik-515857312)