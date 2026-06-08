ALTER TABLE "refresh_tokens" ADD COLUMN "token_hash" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash");