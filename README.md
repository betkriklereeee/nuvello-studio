# Nuvello Studio

Client portal for Nuvello Web agency.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local` and fill in your values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `GOOGLE_DRIVE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Google Cloud Console → Credentials |

## Supabase Auth Setup

After creating your Supabase project, configure the following in **Authentication → URL Configuration**:

- **Site URL**: `https://studio.nuvelloweb.com`
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/callback`
  - `https://studio.nuvelloweb.com/auth/callback`

## Database

Run migrations in order against your Supabase project:

```bash
supabase db push
# or apply manually via the SQL editor:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_profiles.sql
```

### Promoting yourself to admin

1. Log in for the first time (magic link or password)
2. Copy your user UUID from **Authentication → Users** in the Supabase dashboard
3. Replace the placeholder UUID in `supabase/seed.sql`
4. Run `seed.sql` against your database

## Design Tokens

All tokens are available as Tailwind classes. Nuvello-specific tokens use the `nv-` prefix:

| Token | Class | Value |
|---|---|---|
| Background | `bg-background` | `#F8F8FA` |
| Surface | `bg-card` | `#FFFFFF` |
| Border | `border-border` | `#E2E0EB` |
| Text primary | `text-foreground` | `#2B2B2E` |
| Text secondary | `text-nv-text-secondary` | `#5A5575` |
| Text muted | `text-muted-foreground` | `#9490A8` |
| Accent (brand) | `bg-primary` / `bg-nv-accent` | `#1E1F6B` |
| Accent light | `bg-accent` / `bg-nv-accent-light` | `#EEEDF8` |
| Accent subtle | `bg-nv-accent-subtle` | `#C5C4E0` |
| Success | `bg-nv-success` | `#8EECD4` |
| Danger | `bg-destructive` / `bg-nv-danger` | `#B33A3A` |
