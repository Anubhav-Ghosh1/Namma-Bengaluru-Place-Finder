# 🏙️ Namma Bengaluru — Community Explorer

A community-powered place discovery platform for Bangalore. Users can discover places, upvote/downvote, share tips, and get AI-powered summaries — all without logging in.

## Features

- **Interactive Map** — Leaflet + OpenStreetMap with colored category markers
- **Community Voting** — Upvote/downvote with anonymous user tracking (one vote per person per place, stored in MongoDB)
- **Community Tips** — Anyone can add tips; AI summarizes similar tips using Claude API
- **Search & Filter** — By name, tips text, or category (food, culture, nature, shopping, nightlife, adventure, wellness)
- **Sort** — By top-voted, newest, or alphabetical
- **Add Places** — Click on map to pin, name it, categorize, add first tip
- **Admin Panel** — PIN-protected admin access to blacklist/restore/delete places
- **Login-Free** — Anonymous user IDs via localStorage; all data in MongoDB
- **Responsive** — Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB + Mongoose
- **Maps**: Leaflet + react-leaflet + OpenStreetMap
- **AI**: Anthropic Claude API (tip summarization)
- **Deployment**: Vercel (recommended) or any Node.js host

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/namma-bengaluru.git
cd namma-bengaluru
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Atlas connection string (free tier works great)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/namma-bengaluru?retryWrites=true&w=majority

# Admin PIN for the admin panel
ADMIN_PIN=namma2026

# Anthropic API key (optional — fallback dedup works without it)
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Seed the Database

Populate initial Bangalore places:

```bash
npx tsx src/lib/seed.ts
```

This adds 15 curated places with tips (Cubbon Park, VV Puram, Nandi Hills, MTR, etc.).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places` | List places (query: `category`, `search`, `sort`, `admin`) |
| POST | `/api/places` | Create a new place |
| GET | `/api/places/[id]` | Get single place |
| DELETE | `/api/places/[id]` | Delete place (admin, header: `x-admin-pin`) |
| POST | `/api/places/[id]/vote` | Vote (body: `{ userId, vote: "up"/"down" }`) |
| POST | `/api/places/[id]/tips` | Add tip (body: `{ tip }`) or summarize (body: `{ summarize: true }`) |
| PATCH | `/api/places/[id]/blacklist` | Toggle blacklist (admin, header: `x-admin-pin`) |
| POST | `/api/admin/auth` | Verify admin PIN |

## Deployment (Vercel — Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `ADMIN_PIN`
   - `ANTHROPIC_API_KEY`
4. Deploy!

> **Note on GitHub Pages**: GitHub Pages only serves static files, so it can't run the Next.js API routes or connect to MongoDB. Use **Vercel** (free tier) for full functionality. If you absolutely need GitHub Pages, you'd need to extract the API into a separate backend (e.g., Railway, Render) and point the frontend to it.

## Admin Usage

1. Click the ⚙️ icon in the header
2. Enter the admin PIN (default: `namma2026`)
3. You can now:
   - **Ban** — Blacklist a place (hides from public, reversible)
   - **Restore** — Unblacklist a place
   - **Delete** — Permanently remove a place
   - Admin controls also appear in the place detail panel

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── places/
│   │   │   ├── route.ts              # GET all / POST new
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET one / DELETE
│   │   │       ├── vote/route.ts     # POST vote
│   │   │       ├── tips/route.ts     # POST tip / summarize
│   │   │       └── blacklist/route.ts # PATCH blacklist
│   │   └── admin/auth/route.ts       # POST auth
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main app page
├── components/
│   ├── MapView.tsx                   # Leaflet map
│   ├── PlaceDetail.tsx               # Place detail panel
│   ├── Sidebar.tsx                   # Search, filters, place list
│   └── AdminPanel.tsx                # Admin management
├── lib/
│   ├── api.ts                        # Frontend API client
│   ├── constants.ts                  # Categories, colors, icons
│   ├── db.ts                         # Mongoose connection singleton
│   └── seed.ts                       # Database seeder
├── models/
│   └── Place.ts                      # Mongoose Place schema
└── types/
    └── index.ts                      # TypeScript interfaces
```

## License

MIT — Open source, free to use and modify.
