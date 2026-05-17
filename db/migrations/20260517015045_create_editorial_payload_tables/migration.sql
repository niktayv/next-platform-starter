CREATE TABLE "editorial_entries" (
	"id" serial PRIMARY KEY,
	"slug" varchar(180) NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" jsonb DEFAULT '{}' NOT NULL,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payload_admin_users" (
	"id" serial PRIMARY KEY,
	"email" varchar(320) NOT NULL,
	"password_hash" text,
	"name" text,
	"roles" jsonb DEFAULT '["admin"]' NOT NULL,
	"reset_password_token" text,
	"reset_password_expiration" timestamp with time zone,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"lock_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payload_media" (
	"id" serial PRIMARY KEY,
	"filename" text NOT NULL,
	"alt" text,
	"mime_type" varchar(120),
	"filesize" integer,
	"width" integer,
	"height" integer,
	"blob_key" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payload_pages" (
	"id" serial PRIMARY KEY,
	"slug" varchar(180) NOT NULL,
	"title" text NOT NULL,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '{}' NOT NULL,
	"seo" jsonb DEFAULT '{}' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_entries_slug_idx" ON "editorial_entries" ("slug");--> statement-breakpoint
CREATE INDEX "editorial_entries_status_idx" ON "editorial_entries" ("status");--> statement-breakpoint
CREATE INDEX "editorial_entries_published_at_idx" ON "editorial_entries" ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payload_admin_users_email_idx" ON "payload_admin_users" ("email");--> statement-breakpoint
CREATE INDEX "payload_admin_users_created_at_idx" ON "payload_admin_users" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payload_media_blob_key_idx" ON "payload_media" ("blob_key");--> statement-breakpoint
CREATE INDEX "payload_media_created_at_idx" ON "payload_media" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payload_pages_slug_idx" ON "payload_pages" ("slug");--> statement-breakpoint
CREATE INDEX "payload_pages_status_idx" ON "payload_pages" ("status");--> statement-breakpoint
CREATE INDEX "payload_pages_published_at_idx" ON "payload_pages" ("published_at");