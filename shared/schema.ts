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
  riskLevel: text("risk_level").default("low"),
  privacyScore: integer("privacy_score").default(0),
});

export const proxyConfigs = pgTable("proxy_configs", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  type: text("type").notNull(),
  username: text("username"),
  password: text("password"),
  isActive: boolean("is_active").default(false),
  latency: integer("latency"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stealthSettings = pgTable("stealth_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  antiDetection: boolean("anti_detection").default(true),
  userAgentRotation: boolean("user_agent_rotation").default(true),
  randomDelays: boolean("random_delays").default(true),
  requestThrottling: boolean("request_throttling").default(true),
  headerSpoofing: boolean("header_spoofing").default(true),
  fingerprinting: boolean("fingerprinting").default(false),
  stealthLevel: integer("stealth_level").default(75),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  riskLevel: true,
  privacyScore: true,
});

export const insertProxyConfigSchema = createInsertSchema(proxyConfigs).pick({
  host: true,
  port: true,
  type: true,
  username: true,
  password: true,
  country: true,
});

export const insertStealthSettingsSchema = createInsertSchema(stealthSettings).pick({
  userId: true,
  antiDetection: true,
  userAgentRotation: true,
  randomDelays: true,
  requestThrottling: true,
  headerSpoofing: true,
  fingerprinting: true,
  stealthLevel: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TelegramSession = typeof telegramSessions.$inferSelect;
export type InsertTelegramSession = z.infer<typeof insertTelegramSessionSchema>;
export type ScrapedGroup = typeof scrapedGroups.$inferSelect;
export type InsertScrapedGroup = z.infer<typeof insertScrapedGroupSchema>;
export type ScrapedMember = typeof scrapedMembers.$inferSelect;
export type InsertScrapedMember = z.infer<typeof insertScrapedMemberSchema>;
export type ProxyConfig = typeof proxyConfigs.$inferSelect;
export type InsertProxyConfig = z.infer<typeof insertProxyConfigSchema>;
export type StealthSettings = typeof stealthSettings.$inferSelect;
export type InsertStealthSettings = z.infer<typeof insertStealthSettingsSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
