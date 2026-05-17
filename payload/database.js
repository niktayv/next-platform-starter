import { MissingDatabaseConnectionError, getConnectionString } from '@netlify/database';

const FALLBACK_DATABASE_KEYS = ['DATABASE_URL', 'PAYLOAD_DATABASE_URL', 'NETLIFY_DATABASE_URL'];

export function resolveDatabaseConnectionString() {
  for (const key of FALLBACK_DATABASE_KEYS) {
    const value = process.env[key];

    if (value) {
      return value;
    }
  }

  try {
    return getConnectionString();
  } catch (error) {
    if (error instanceof MissingDatabaseConnectionError) {
      return '';
    }

    throw error;
  }
}
