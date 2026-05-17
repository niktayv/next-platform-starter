import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import process from 'node:process';

import { resolveDatabaseConnectionString } from '../payload/database.js';

const env = { ...process.env };
const databaseURL = resolveDatabaseConnectionString();

if (databaseURL) {
  env.DATABASE_URL = databaseURL;

  execFileSync('pnpm', ['payload', 'migrate'], {
    env,
    stdio: 'inherit',
  });
} else {
  console.warn('[payload] Skipping migrations because no database connection is configured.');
}

rmSync('.next/lock', { force: true });

execFileSync('pnpm', ['exec', 'next', 'build'], {
  env,
  stdio: 'inherit',
});
