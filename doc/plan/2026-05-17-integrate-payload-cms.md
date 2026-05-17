# Add Payload CMS to Netlify Starter

## Summary

Add Payload as a sidecar CMS inside the existing Next.js app, keep the current starter UI intact, mount the admin and Payload HTTP surface under `/cms`, use Netlify Database as the Postgres backend, and phase Netlify Blobs in as a custom media adapter after the core CMS is stable.

## Key Changes

- Upgrade framework compatibility first.
  - Bump `next` and `eslint-config-next` from the current `16.0.8` line to a Payload-supported version `>=16.2.2`.
  - Keep the repo ESM and JS-first; introduce a minimal TypeScript island only where Payload expects it.

- Isolate Payload from the current app routes.
  - Move the current app tree into a frontend route group such as `app/(site)`.
  - Add the official Payload route group under `app/(payload)`.
  - Namespace Payload routes under `/cms` to avoid collisions with the existing middleware and `/api/health` rewrite.
  - Set Payload routes explicitly:
    - admin: `/cms`
    - REST API: `/cms/api`
    - GraphQL: `/cms/graphql`
    - GraphQL playground: `/cms/graphql-playground`

- Add Payload core with Netlify Database.
  - Install `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, and the normal optional packages needed for a usable CMS slice (`@payloadcms/richtext-lexical`, `sharp`; `graphql` only if GraphQL stays enabled).
  - Add `withPayload(...)` to `next.config.js`.
  - Replace `jsconfig.json` with a minimal `tsconfig.json` that preserves `baseUrl` and adds `@payload-config -> ./payload.config.ts`.
  - Create `payload.config.ts` at repo root and bootstrap only a minimal schema:
    - `users` auth collection
    - `media` upload collection
    - one simple content collection such as `pages`
  - Configure Payload to use Postgres via `@payloadcms/db-postgres`, with the connection sourced from Netlify Database’s branch-aware connection mechanism. Use a local fallback only for non-Netlify tooling if needed.

- Keep one migration system authoritative.
  - Use Payload migrations as the schema source of truth.
  - Do not introduce a second hand-authored Netlify SQL migration workflow for the same schema.
  - Add package scripts so production builds run Payload migrations before `next build`.
  - Keep `netlify.toml` on `npm run build` if possible; move the migration step into the package script rather than changing package-manager wiring.

- Make middleware and runtime behavior Payload-safe.
  - Stop redirecting or decorating Payload-owned routes in `middleware.js`.
  - Exclude `/cms`, `/cms/api`, `/cms/graphql`, and Payload static/admin assets from the demo middleware matcher.
  - Preserve current demo behavior for the rest of the site.

- Phase Netlify Blobs as a custom adapter.
  - Implement media storage with `@payloadcms/plugin-cloud-storage` and a custom Netlify Blobs adapter only after the CMS works end-to-end on Netlify Database.
  - The adapter should implement the Payload cloud-storage contract:
    - `handleUpload`
    - `handleDelete`
    - `staticHandler`
    - `generateURL`
  - Store media in a site-scoped Blobs store such as `payload-media`.
  - Keep Payload access control in front of files by default, so URLs continue to resolve through Payload instead of requiring public direct blob URLs.
  - Treat this as editorial-media storage, not a high-concurrency asset pipeline.

## Public Interfaces / Config Changes

- New user-facing routes:
  - `/cms`
  - `/cms/api/*`
  - `/cms/graphql`
  - `/cms/graphql-playground`
- New config surface:
  - `payload.config.ts`
  - `@payload-config` path alias in `tsconfig.json`
  - `withPayload` wrapper in `next.config.js`
- New env/config requirements:
  - `PAYLOAD_SECRET`
  - Netlify-linked database access for build and runtime
  - optional custom media-store name for Blobs adapter, if we make that configurable

## Test Plan

- Compatibility and build
  - `pnpm lint`
  - `pnpm build`
  - `pnpm netlify dev`
- Existing starter regression checks
  - `/`
  - `/edge`
  - `/routing`
  - `/api/health`
- Payload core checks
  - open `/cms`
  - create first admin user
  - create, edit, publish, and delete a `pages` record
  - verify REST API under `/cms/api`
- Database checks
  - confirm content persists through Netlify Database
  - verify deploy-preview branch isolation before trusting production rollout
- Blobs phase checks
  - upload media into `media`
  - fetch file through Payload URL
  - delete media and confirm blob cleanup

## Assumptions

- Keep the current starter frontend mostly unchanged in the initial rollout.
- Namespacing all Payload HTTP routes under `/cms` is preferred over sharing `/api`.
- Payload migrations, not Netlify SQL migrations, will own the CMS schema.
- Netlify Blobs support is a second-phase custom adapter because there is no official Payload Netlify Blobs adapter today.
- If the Blobs adapter proves too costly for the first shipping slice, the fallback is to ship Netlify Database first and temporarily keep local Payload upload storage disabled or minimal until the custom adapter lands.
