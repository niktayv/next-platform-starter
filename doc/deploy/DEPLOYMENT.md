# Deployment

This project deploys to Netlify as a Next.js app with an embedded Payload CMS.

Production deploys should normally be triggered by pushing the production branch
to the Git repository connected to Netlify. In this repository, the Netlify
build command is defined in `netlify.toml` as `npm run build`, which runs
`scripts/build-with-payload.mjs`.

That build script does two important things:

1. Runs `payload migrate` before `next build` when a database connection is available.
2. Fails the deploy if Payload migrations fail.

## Recommended Production Flow

1. Validate locally.
2. Verify Netlify production configuration.
3. Commit the changes.
4. Push to the production branch.
5. Watch the Netlify production deploy.
6. Run post-deploy checks on the live site.

## One-Time Netlify Setup

Before the first production deploy with Payload enabled, verify the following in
the Netlify project.

### 1. Confirm the production branch

In Netlify:

- Go to `Project configuration` -> `Build & deploy` -> `Continuous Deployment`.
- Confirm the production branch is the branch you intend to push, typically `main`.

### 2. Confirm the build settings

The repository already defines the build in `netlify.toml`:

```toml
[build]
  publish = ".next"
  command = "npm run build"
```

Do not override this in the Netlify UI unless you intentionally want different
deploy behavior.

### 3. Configure environment variables

In Netlify:

- Go to `Project configuration` -> `Environment variables`.
- Add `PAYLOAD_SECRET` for the `Production` context.

Recommended way to generate the secret locally:

```bash
openssl rand -base64 48 | tr '+/' '-_' | tr -d '\n'
```

Notes:

- `PAYLOAD_SECRET` is required in production. The code intentionally throws if
  it is missing in production.
- Do not store this secret in the repository.

### 4. Verify Netlify Database is attached

This project is written to prefer Netlify Database's environment-aware
connection resolution via `@netlify/database`.

Check in Netlify that:

- the project has Netlify Database enabled
- the production database is healthy

Important:

- Do not set `DATABASE_URL` in Netlify unless you intentionally want to
  override Netlify Database's branch-aware connection handling.
- This repository's code checks `DATABASE_URL` first, so a manually configured
  value would take precedence over `getConnectionString()`.

### 5. Optional: configure the media store name

The custom Netlify Blobs adapter defaults to `payload-media`.

If you want an explicit setting in Netlify, add:

```text
NETLIFY_BLOBS_MEDIA_STORE=payload-media
```

This is optional because the code already defaults to that store name.

## Pre-Deploy Local Validation

Run these checks from the repository root:

```bash
pnpm lint
pnpm build
pnpm netlify dev
```

During `pnpm netlify dev`, check at least:

- `/`
- `/edge`
- `/routing`
- `/api/health`
- `/middleware`
- `/cms`

Payload-specific checks:

- log in to `/cms`
- verify `Pages` create/edit/save works
- verify `Media` upload works

Database note:

- `pnpm build` only runs Payload migrations when a database connection is
  available in the environment.
- Local development can use `.env.local`, but production should rely on Netlify
  environment variables and Netlify Database.

## Prepare The Git State

1. Inspect the working tree:

```bash
git status --short --branch
```

2. Review the changes you are about to deploy.

3. Commit them:

```bash
git add .
git commit -m "Add Payload CMS to the Next.js Netlify starter"
```

4. Push the production branch:

```bash
git push origin main
```

That push should trigger the production deploy automatically if Netlify is
connected to this repository and `main` is configured as the production branch.

## Watch The Production Deploy

In Netlify:

1. Open the project dashboard.
2. Go to `Deploys`.
3. Open the newest production deploy.
4. Watch the build log.

Expected build behavior:

1. Netlify installs dependencies.
2. Netlify runs `npm run build`.
3. The build script attempts `payload migrate`.
4. If migration succeeds, Next.js production build runs.
5. If migration fails, the deploy fails before going live.

What to look for in the logs:

- no missing `PAYLOAD_SECRET` error
- no Payload migration error
- successful `next build`
- production deploy published successfully

## Post-Deploy Validation

After the deploy is live, validate the production site:

### Public routes

- `/`
- `/edge`
- `/routing`
- `/middleware`

### CMS routes

- `/cms`
- `/cms/api/pages`

### CMS behavior

1. Log in to `/cms`.
2. Open an existing `Pages` item or create a temporary one.
3. Upload a media item.
4. Confirm both save successfully.

If the production site uses a custom domain, run the checks on that domain, not
just the `netlify.app` URL.

## Recommended Rollout Pattern

For low-risk production releases:

1. Push the change to a non-production branch first.
2. Let Netlify create a Deploy Preview or branch deploy.
3. Test `/cms` there.
4. Push or merge to the production branch only after preview validation passes.

This is especially useful because Netlify Database gives deploy previews their
own isolated branch.

## Rollback

If production is broken after deploy:

1. Open the Netlify project.
2. Go to `Deploys`.
3. Find the last known good production deploy.
4. Use Netlify's rollback or publish that earlier deploy again.

If the issue is schema-related:

- inspect the failed migration in the build log first
- avoid pushing more changes until the database state is understood

## Manual Production Deploy Fallback

Use this only if you intentionally want to deploy manually instead of relying on
Git-triggered continuous deployment.

1. Confirm the project is linked:

```bash
npx netlify status
```

2. If needed, link it:

```bash
npx netlify link
```

3. Run a production deploy:

```bash
npx netlify deploy --prod
```

The Git-driven path is preferred for this repository because it keeps the
production deploy traceable to a specific commit on the production branch.

## Production Checklist

Use this checklist before every production deploy:

- Netlify production branch is correct
- `PAYLOAD_SECRET` is set in Netlify production environment variables
- Netlify Database is attached and healthy
- `DATABASE_URL` is not overriding Netlify Database unless intentional
- `pnpm lint` passes
- `pnpm build` passes
- `pnpm netlify dev` sanity checks pass
- changes are committed
- push goes to the intended production branch
- Netlify build log is reviewed
- `/cms` works after deploy
