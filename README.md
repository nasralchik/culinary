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

The initial version uses local typed sample data and CSS-drawn book spines. `src/data` and `src/types` provide a clean seam for a later data provider (such as Supabase); no backend credentials or external service integrations are included.
