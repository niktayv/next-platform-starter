import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Media } from './payload/collections/Media';
import { Pages } from './payload/collections/Pages';
import { Users } from './payload/collections/Users';
import { resolveDatabaseConnectionString } from './payload/database.js';
import { netlifyBlobsAdapter } from './payload/storage/netlifyBlobs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURL = resolveDatabaseConnectionString();

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'app/(payload)/cms'),
      importMapFile: path.resolve(dirname, 'app/(payload)/cms/importMap.js'),
    },
    user: Users.slug,
  },
  collections: [Users, Media, Pages],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'payload/migrations'),
    pool: {
      connectionString: databaseURL || 'postgres://postgres:postgres@127.0.0.1:5432/payload',
    },
  }),
  editor: lexicalEditor(),
  graphQL: {
    disablePlaygroundInProduction: false,
  },
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: netlifyBlobsAdapter({
            useCompositePrefixes: true,
          }),
          disableLocalStorage: true,
          prefix: 'media',
        },
      },
      enabled: true,
      useCompositePrefixes: true,
    }),
  ],
  routes: {
    admin: '/cms',
    api: '/cms/api',
    graphQL: '/cms/graphql',
    graphQLPlayground: '/cms/graphql-playground',
  },
  secret: process.env.PAYLOAD_SECRET || 'payload-local-development-secret',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
