import { getStore } from '@netlify/blobs';
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types';
import { getFileKey } from '@payloadcms/plugin-cloud-storage/utilities';

type NetlifyBlobsAdapterOptions = {
  storeName?: string;
  useCompositePrefixes?: boolean;
};

const readMetadataString = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

const getStoreMetadata = (file) => ({
  cacheControl: 'public, max-age=31536000, immutable',
  contentType: file.mimeType,
  filename: file.filename,
  filesize: file.filesize,
});

export const netlifyBlobsAdapter =
  ({ storeName = process.env.NETLIFY_BLOBS_MEDIA_STORE || 'payload-media', useCompositePrefixes = true }: NetlifyBlobsAdapterOptions = {}): Adapter =>
  ({ prefix: collectionPrefix }) => {
    return {
      handleDelete: async ({ doc, filename }) => {
        const store = getStore({ consistency: 'strong', name: storeName });
        const { fileKey } = getFileKey({
          collectionPrefix,
          docPrefix: doc.prefix,
          filename,
          useCompositePrefixes,
        });

        await store.delete(fileKey);
      },
      handleUpload: async ({ data, file }) => {
        const store = getStore({ consistency: 'strong', name: storeName });
        const { fileKey, sanitizedFilename } = getFileKey({
          collectionPrefix,
          docPrefix: data?.prefix,
          filename: file.filename,
          useCompositePrefixes,
        });

        const fileBytes = Uint8Array.from(file.buffer);
        const fileBody = new Blob([fileBytes], {
          type: file.mimeType,
        });

        await store.set(fileKey, fileBody, {
          metadata: getStoreMetadata(file),
        });

        return {
          filename: sanitizedFilename,
        };
      },
      name: 'netlify-blobs',
      staticHandler: async (_req, { headers, params }) => {
        const store = getStore({ consistency: 'strong', name: storeName });
        const { fileKey } = getFileKey({
          collectionPrefix,
          docPrefix: params.prefix,
          filename: params.filename,
          useCompositePrefixes,
        });

        const [metadata, data] = await Promise.all([
          store.getMetadata(fileKey),
          store.get(fileKey, { type: 'arrayBuffer' }),
        ]);

        if (!data) {
          return new Response('Not found', { status: 404 });
        }

        const responseHeaders = new Headers(headers);
        const cacheControl = readMetadataString(metadata?.metadata?.cacheControl, 'public, max-age=31536000, immutable');
        const contentType = readMetadataString(metadata?.metadata?.contentType, 'application/octet-stream');

        responseHeaders.set('Cache-Control', cacheControl);
        responseHeaders.set('Content-Length', String(data.byteLength));
        responseHeaders.set('Content-Type', contentType);

        return new Response(data, {
          headers: responseHeaders,
          status: 200,
        });
      },
    };
  };
