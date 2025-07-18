import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const telegramSessions = pgTable("telegram_sessions", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  sessionData: text("session_data"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const scrapedGroups = pgTable("scraped_groups", {
  id: serial("id").primaryKey(),
  groupId: text("group_id").notNull(),
  title: text("title").notNull(),
  memberCount: integer("member_count"),
  isPrivate: boolean("is_private").default(false),
  lastScraped: timestamp("last_scraped").defaultNow(),
});

export const scrapedMembers = pgTable("scraped_members", {
  id: serial("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isHidden: boolean("is_hidden").default(false),
  isOnline: boolean("is_online").default(false),
  lastSeen: text("last_seen"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  memberData: jsonb("member_data"),
});

export const insertTelegramSessionSchema = createInsertSchema(telegramSessions).pick({
  phoneNumber: true,
  sessionData: true,
});

export const insertScrapedGroupSchema = createInsertSchema(scrapedGroups).pick({
  groupId: true,
  title: true,
  memberCount: true,
  isPrivate: true,
});

export const insertScrapedMemberSchema = createInsertSchema(scrapedMembers).pick({
  groupId: true,
  userId: true,
  username: true,
  firstName: true,
  lastName: true,
  phone: true,
  isHidden: true,
  isOnline: true,
  lastSeen: true,
  memberData: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TelegramSession = typeof telegramSessions.$inferSelect;
export type InsertTelegramSession = z.infer<typeof insertTelegramSessionSchema>;
export type ScrapedGroup = typeof scrapedGroups.$inferSelect;
export type InsertScrapedGroup = z.infer<typeof insertScrapedGroupSchema>;
export type ScrapedMember = typeof scrapedMembers.$inferSelect;
export type InsertScrapedMember = z.infer<typeof insertScrapedMemberSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
