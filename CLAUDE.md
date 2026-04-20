# Storycard Survey

A lightweight, interaction-driven survey tool that presents one question at a time through visually guided cards, inspired by Duolingo's learning flow.

## Project Overview

- **Frontend**: Next.js 16+ with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js (TODO)
- **Charts**: Recharts

## Architecture

```
Frontend (Next.js + React)
    ↓
API Routes (app/api)
    ↓
Prisma ORM
    ↓
Supabase PostgreSQL
```

## Folder Structure

```
app/
  components/
    survey/          # Survey taker UI
    dashboard/       # Creator dashboard
    auth/           # Login/signup
  api/
    surveys/        # Survey CRUD
    responses/      # Response submission & retrieval
lib/
  prisma.ts        # Prisma client instance
prisma/
  schema.prisma    # Database schema
```

## MVP Features

### 1. Survey Creation
- Add survey title and description
- Add sections/intro text
- Create questions in card flow
- Question types: single choice, multiple choice, short text, long text, linear scale, rating

### 2. Participant Survey Flow
- Open survey from shared link
- See intro screen
- Answer one card at a time
- Move forward/backward
- Progress indicator
- Submit survey

### 3. Visual Design
- Card-based layout
- One task at a time
- Duolingo-inspired but professional
- Lightweight and engaging

### 4. Response Dashboard
- View response count
- View all responses in table
- View charts for objective questions
- Export as CSV

## Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Get the connection string from Settings > Database > Connection String
- Paste into `.env` as `DATABASE_URL`

### 2. Initialize Database
```bash
npx prisma migrate dev --name init
```

### 3. Run Development Server
```bash
npm run dev
```

## Database Schema

- **User**: Survey creators
- **Survey**: Survey metadata and settings
- **Section**: Organized groups of questions
- **Question**: Individual survey questions
- **AnswerOption**: Predefined options for choice questions
- **Response**: Complete survey submission
- **ResponseAnswer**: Individual answers within a response

## Next Steps

1. Set up NextAuth for creator authentication
2. Create survey builder UI components
3. Create survey taker UI (card-based)
4. Implement dashboard with analytics
5. Add CSV export functionality
