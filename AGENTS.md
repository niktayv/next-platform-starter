# AGENTS.md

<!-- lean-ctx -->
## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: `~/.codex/LEAN-CTX.md`
<!-- /lean-ctx -->

## Project Summary

- This repository is a Netlify-generated Next.js starter based on `netlify-templates/next-platform-starter`.
- It uses Next.js 16 App Router, React 19, Tailwind CSS v4, and Netlify platform primitives.
- Treat the current app as a demo/reference implementation of Netlify features, not as a mature product with business-specific domain rules.

## Working Style

- Ground decisions in the actual repository files before changing behavior.
- Prefer small, targeted edits over broad cleanup or stylistic churn.
- Preserve the existing JavaScript/JSX style and path usage unless the user asks for a refactor.
- Do not remove demo pages or Netlify examples unless the user explicitly asks to replace or simplify them.

## Key Commands

- Install dependencies: `pnpm install`
- Primary local dev command: `pnpm netlify dev`
- Fallback Next-only dev server: `pnpm dev`
- Production build: `pnpm build`
- Lint: `pnpm lint`

## Local Development Rules

- Use `pnpm netlify dev` for meaningful local verification. This project relies on Netlify runtime behavior that plain `next dev` does not fully simulate.
- Prefer `pnpm dev` only for narrow UI work that does not depend on Netlify context, Edge Functions, Blobs, form handling, or image/CDN behavior.
- When changing Netlify-specific features, verify them through `http://localhost:8888`.

## Repository Structure

- `app/`: Next.js App Router pages and route handlers.
- `components/`: shared UI components used across demo pages.
- `public/`: static assets, including `__forms.html` for Netlify Forms discovery.
- `netlify/edge-functions/`: explicit Netlify Edge Function examples.
- `data/quotes.json`: local sample data for the random quote route.
- `styles/globals.css`: shared Tailwind v4 theme tokens and component classes.
- `middleware.js`: Next.js middleware demo applied across most routes.
- `next.config.js`: redirects and rewrites examples.
- `netlify.toml`: deploy/build configuration for Netlify.

## Important Feature Surfaces

- Homepage: [app/page.jsx](app/page.jsx) shows the runtime-context demo and random quote client fetch flow.
- Random quote API: [app/quotes/random/route.js](app/quotes/random/route.js) is the main route-handler example.
- Blobs demo: [app/blobs/page.jsx](app/blobs/page.jsx) and [app/blobs/actions.js](app/blobs/actions.js) are the main `@netlify/blobs` integration surface.
- Edge Function demo: [netlify/edge-functions/rewrite.js](netlify/edge-functions/rewrite.js) drives `/edge`.
- Middleware demo: [middleware.js](middleware.js) sets headers, logs requests, and redirects `/admin`.
- Revalidation demo: [app/revalidation/page.jsx](app/revalidation/page.jsx) demonstrates tagged fetch caching and `revalidateTag`.
- Image CDN demo: [app/image-cdn/page.jsx](app/image-cdn/page.jsx) demonstrates `next/image` plus explicit `/.netlify/images` usage.
- Routing demo: [app/routing/page.jsx](app/routing/page.jsx) reflects rules declared in [next.config.js](next.config.js).
- Form handling demo: [components/feedback-form.jsx](components/feedback-form.jsx) depends on [public/__forms.html](public/__forms.html).

## Netlify-Specific Notes

- `process.env.CONTEXT` is used as a server-side runtime signal via [utils.js](utils.js). Do not rewrite this to client-only logic without checking the impact on demo pages.
- `NEXT_PUBLIC_DISABLE_UPLOADS` disables the Blobs upload flow. Keep that guard intact unless the user asks to change upload behavior.
- `netlify.toml` currently builds with `npm run build` while local development uses `pnpm`. Do not change package-manager wiring casually; treat deploy config changes as intentional operational changes.
- Several examples intentionally demonstrate behavior that only makes sense on Netlify. If something appears broken under plain `next dev`, verify whether it is expected before changing code.

## Conventions

- The repo uses JavaScript with ESM, not TypeScript.
- `jsconfig.json` sets `baseUrl` to the repo root, so imports like `components/card` and `data/quotes.json` are intentional.
- Keep JSX components simple and colocated with their feature unless there is a clear reuse reason.
- Preserve the existing Tailwind utility style and shared classes in `styles/globals.css`.
- The ESLint config explicitly allows raw `<img>` usage for the Image CDN demo; do not "fix" those cases unless the user wants a behavior change.

## Validation Expectations

- For UI-only changes, validate the affected route in local dev.
- For Netlify feature changes, validate with `pnpm netlify dev`.
- For routing changes, verify both the page UI and the actual redirect/rewrite behavior.
- For middleware changes, verify headers and `/admin` behavior in the browser network inspector or via HTTP requests.
- For Blobs, Edge Functions, forms, or image handling, prefer end-to-end checks over static reasoning.

## Change Boundaries

- Do not rotate the project away from Netlify primitives unless the user explicitly asks for that migration.
- Do not add heavy architecture, state management, or new dependencies just to polish a starter example.
- Do not delete lockfiles or normalize package-manager artifacts unless the user asks. This repo currently contains both `package-lock.json` and `pnpm-lock.yaml`.
- If a requested change touches both framework behavior and Netlify behavior, document which part was validated locally and which part still requires deployed verification.
