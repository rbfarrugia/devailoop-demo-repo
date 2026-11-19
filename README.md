# devailoop-demo-repo

A React app (Vite + TypeScript), tested with Vitest. For now it shows a single "Hello World" page; the app will be built out in later tickets. Deployment is not set up yet.

## Prerequisites

- Node.js 20 or newer (`.nvmrc` pins 24; `nvm use` picks it up)
- npm (comes with Node)

## Running locally

```sh
npm ci            # install dependencies
npm run dev       # start the dev server at http://localhost:5173
```

## Other commands

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm test`           | Run the tests once with Vitest                |
| `npm run test:watch` | Run Vitest in watch mode                      |
| `npm run lint`       | Lint with ESLint                              |
| `npm run build`      | Type-check and build to `dist/`               |
| `npm run preview`    | Serve the production build locally            |

## Structure

- `src/main.tsx` – entry point
- `src/App.tsx` – the main page
- `src/App.test.tsx` – tests (next to the code they cover)
- `vite.config.ts` – Vite and Vitest configuration
