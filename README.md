# Кулинарная библиотека

Responsive Russian-language recipe library concept, designed as a warm historic manor house bookcase.

## Development

```sh
pnpm install
pnpm dev
```

## Production build

```sh
pnpm build
pnpm preview
```

The bookshelf uses local typed sample data and CSS-drawn book spines. The Supabase client is optional: without environment variables, the sample library remains visible. When configured, the app reads the count of published recipes from Supabase.

For local Supabase configuration, copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Set the same two variables in the Render Static Site's Environment settings so Vite can include them in the production build. Never use a Supabase secret key in this frontend. Keep Row Level Security enabled.
