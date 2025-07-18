import { 
  users, 
  telegramSessions, 
  scrapedGroups, 
  scrapedMembers,
  proxyConfigs,
  stealthSettings,
  type User, 
  type InsertUser,
  type TelegramSession,
  type InsertTelegramSession,
  type ScrapedGroup,
  type InsertScrapedGroup,
  type ScrapedMember,
  type InsertScrapedMember,
  type ProxyConfig,
  type InsertProxyConfig,
  type StealthSettings,
  type InsertStealthSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Telegram session management
  getTelegramSession(phoneNumber: string): Promise<TelegramSession | undefined>;
  createTelegramSession(session: InsertTelegramSession): Promise<TelegramSession>;
  updateTelegramSession(phoneNumber: string, sessionData: string): Promise<void>;
  
  // Group management
  getScrapedGroups(): Promise<ScrapedGroup[]>;
  createScrapedGroup(group: InsertScrapedGroup): Promise<ScrapedGroup>;
  updateGroupMemberCount(groupId: string, memberCount: number): Promise<void>;
  
  // Member management
  getScrapedMembers(groupId: string): Promise<ScrapedMember[]>;
  createScrapedMember(member: InsertScrapedMember): Promise<ScrapedMember>;
  getHiddenMembersCount(groupId: string): Promise<number>;
  getTotalMembersCount(): Promise<number>;
  
  // Proxy management
  getProxyConfigs(): Promise<ProxyConfig[]>;
  createProxyConfig(proxy: InsertProxyConfig): Promise<ProxyConfig>;
  updateProxyStatus(id: number, isActive: boolean, latency?: number): Promise<void>;
  deleteProxyConfig(id: number): Promise<void>;
  
  // Stealth settings
  getStealthSettings(userId: string): Promise<StealthSettings | undefined>;
  createOrUpdateStealthSettings(settings: InsertStealthSettings): Promise<StealthSettings>;
}



// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTelegramSession(phoneNumber: string): Promise<TelegramSession | undefined> {
    const [session] = await db
      .select()
      .from(telegramSessions)
      .where(eq(telegramSessions.phoneNumber, phoneNumber));
    return session || undefined;
  }

  async createTelegramSession(insertSession: InsertTelegramSession): Promise<TelegramSession> {
    const [session] = await db
      .insert(telegramSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateTelegramSession(phoneNumber: string, sessionData: string): Promise<void> {
    await db
      .update(telegramSessions)
      .set({ sessionData, lastLogin: new Date() })
      .where(eq(telegramSessions.phoneNumber, phoneNumber));
  }

  async getScrapedGroups(): Promise<ScrapedGroup[]> {
    return await db.select().from(scrapedGroups);
  }

  async createScrapedGroup(insertGroup: InsertScrapedGroup): Promise<ScrapedGroup> {
    const [group] = await db
      .insert(scrapedGroups)
      .values(insertGroup)
      .returning();
    return group;
  }

  async updateGroupMemberCount(groupId: string, memberCount: number): Promise<void> {
    await db
      .update(scrapedGroups)
      .set({ memberCount, lastScraped: new Date() })
      .where(eq(scrapedGroups.groupId, groupId));
  }

  async getScrapedMembers(groupId: string): Promise<ScrapedMember[]> {
    return await db
      .select()
      .from(scrapedMembers)
      .where(eq(scrapedMembers.groupId, groupId));
  }

  async createScrapedMember(insertMember: InsertScrapedMember): Promise<ScrapedMember> {
    const [member] = await db
      .insert(scrapedMembers)
      .values(insertMember)
      .returning();
    return member;
  }

  async getHiddenMembersCount(groupId: string): Promise<number> {
    const members = await db
      .select()
      .from(scrapedMembers)
      .where(eq(scrapedMembers.groupId, groupId));
    return members.filter(member => member.isHidden).length;
  }

  async getTotalMembersCount(): Promise<number> {
    const members = await db.select().from(scrapedMembers);
    return members.length;
  }

  async getProxyConfigs(): Promise<ProxyConfig[]> {
    return await db.select().from(proxyConfigs);
  }

  async createProxyConfig(insertProxy: InsertProxyConfig): Promise<ProxyConfig> {
    const [proxy] = await db
      .insert(proxyConfigs)
      .values(insertProxy)
      .returning();
    return proxy;
  }

  async updateProxyStatus(id: number, isActive: boolean, latency?: number): Promise<void> {
    await db
      .update(proxyConfigs)
      .set({ isActive, latency })
      .where(eq(proxyConfigs.id, id));
  }

  async deleteProxyConfig(id: number): Promise<void> {
    await db
      .delete(proxyConfigs)
      .where(eq(proxyConfigs.id, id));
  }

  async getStealthSettings(userId: string): Promise<StealthSettings | undefined> {
    const [settings] = await db
      .select()
      .from(stealthSettings)
      .where(eq(stealthSettings.userId, userId));
    return settings || undefined;
  }

  async createOrUpdateStealthSettings(insertSettings: InsertStealthSettings): Promise<StealthSettings> {
    const existing = await this.getStealthSettings(insertSettings.userId);
    
    if (existing) {
      const [updated] = await db
        .update(stealthSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(stealthSettings.userId, insertSettings.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(stealthSettings)
        .values(insertSettings)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
