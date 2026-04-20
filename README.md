# Storycard Survey

A lightweight, interaction-driven survey tool that presents one question at a time through visually guided cards, inspired by Duolingo's learning flow.

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### 1. Setup Database

Create a free Supabase project:
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the connection string (ensure you select "Prisma" mode)
5. Add to `.env`:
```bash
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

### 2. Initialize Database

```bash
npx prisma migrate dev --name init
```

This creates all tables from the schema.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  api/              # API routes
  components/       # React components
  (auth)/           # Auth pages
  (creator)/        # Creator dashboard
  (participant)/    # Survey taker
  layout.tsx        # Root layout
  page.tsx          # Landing page
  globals.css       # Tailwind CSS

lib/
  prisma.ts         # Prisma client
  types.ts          # TypeScript types

prisma/
  schema.prisma     # Database schema
  migrations/       # Database migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Database Schema

See `CLAUDE.md` for detailed schema documentation.

## MVP Roadmap

- [ ] Authentication (creator accounts)
- [ ] Survey builder UI
- [ ] Survey taker flow (card-based)
- [ ] Response dashboard
- [ ] CSV export
- [ ] Analytics charts
- [ ] Share survey links

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set `DATABASE_URL` environment variable
5. Deploy

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Charts**: Recharts
- **Auth**: NextAuth.js (coming soon)

## License

MIT
