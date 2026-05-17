import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const payloadAdminUsers = pgTable(
  "payload_admin_users",
  {
    id: serial().primaryKey(),
    email: varchar({ length: 320 }).notNull(),
    passwordHash: text("password_hash"),
    name: text(),
    roles: jsonb().notNull().default(["admin"]),
    resetPasswordToken: text("reset_password_token"),
    resetPasswordExpiration: timestamp("reset_password_expiration", {
      withTimezone: true,
    }),
    loginAttempts: integer("login_attempts").notNull().default(0),
    lockUntil: timestamp("lock_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("payload_admin_users_email_idx").on(table.email),
    index("payload_admin_users_created_at_idx").on(table.createdAt),
  ],
);

export const payloadPages = pgTable(
  "payload_pages",
  {
    id: serial().primaryKey(),
    slug: varchar({ length: 180 }).notNull(),
    title: text().notNull(),
    status: varchar({ length: 24 }).notNull().default("draft"),
    content: jsonb().notNull().default({}),
    seo: jsonb().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("payload_pages_slug_idx").on(table.slug),
    index("payload_pages_status_idx").on(table.status),
    index("payload_pages_published_at_idx").on(table.publishedAt),
  ],
);

export const payloadMedia = pgTable(
  "payload_media",
  {
    id: serial().primaryKey(),
    filename: text().notNull(),
    alt: text(),
    mimeType: varchar("mime_type", { length: 120 }),
    filesize: integer(),
    width: integer(),
    height: integer(),
    blobKey: text("blob_key").notNull(),
    metadata: jsonb().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("payload_media_blob_key_idx").on(table.blobKey),
    index("payload_media_created_at_idx").on(table.createdAt),
  ],
);

export const editorialEntries = pgTable(
  "editorial_entries",
  {
    id: serial().primaryKey(),
    slug: varchar({ length: 180 }).notNull(),
    title: text().notNull(),
    summary: text(),
    body: jsonb().notNull().default({}),
    status: varchar({ length: 24 }).notNull().default("draft"),
    featured: boolean().notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("editorial_entries_slug_idx").on(table.slug),
    index("editorial_entries_status_idx").on(table.status),
    index("editorial_entries_published_at_idx").on(table.publishedAt),
  ],
);
