import { InferModel } from "drizzle-orm";
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenId: text("token_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type RefreshToken = InferModel<typeof refreshTokens>;
export type NewRefreshToken = InferModel<typeof refreshTokens, "insert">;