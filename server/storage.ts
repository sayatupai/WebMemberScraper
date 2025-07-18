import { 
  users, 
  telegramSessions, 
  scrapedGroups, 
  scrapedMembers,
  type User, 
  type InsertUser,
  type TelegramSession,
  type InsertTelegramSession,
  type ScrapedGroup,
  type InsertScrapedGroup,
  type ScrapedMember,
  type InsertScrapedMember
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private telegramSessions: Map<string, TelegramSession>;
  private scrapedGroups: Map<string, ScrapedGroup>;
  private scrapedMembers: Map<string, ScrapedMember[]>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentGroupId: number;
  private currentMemberId: number;

  constructor() {
    this.users = new Map();
    this.telegramSessions = new Map();
    this.scrapedGroups = new Map();
    this.scrapedMembers = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentGroupId = 1;
    this.currentMemberId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTelegramSession(phoneNumber: string): Promise<TelegramSession | undefined> {
    return this.telegramSessions.get(phoneNumber);
  }

  async createTelegramSession(insertSession: InsertTelegramSession): Promise<TelegramSession> {
    const id = this.currentSessionId++;
    const session: TelegramSession = {
      ...insertSession,
      id,
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    this.telegramSessions.set(insertSession.phoneNumber, session);
    return session;
  }

  async updateTelegramSession(phoneNumber: string, sessionData: string): Promise<void> {
    const session = this.telegramSessions.get(phoneNumber);
    if (session) {
      session.sessionData = sessionData;
      session.lastLogin = new Date();
      this.telegramSessions.set(phoneNumber, session);
    }
  }

  async getScrapedGroups(): Promise<ScrapedGroup[]> {
    return Array.from(this.scrapedGroups.values());
  }

  async createScrapedGroup(insertGroup: InsertScrapedGroup): Promise<ScrapedGroup> {
    const id = this.currentGroupId++;
    const group: ScrapedGroup = {
      ...insertGroup,
      id,
      lastScraped: new Date(),
    };
    this.scrapedGroups.set(insertGroup.groupId, group);
    return group;
  }

  async updateGroupMemberCount(groupId: string, memberCount: number): Promise<void> {
    const group = this.scrapedGroups.get(groupId);
    if (group) {
      group.memberCount = memberCount;
      group.lastScraped = new Date();
      this.scrapedGroups.set(groupId, group);
    }
  }

  async getScrapedMembers(groupId: string): Promise<ScrapedMember[]> {
    return this.scrapedMembers.get(groupId) || [];
  }

  async createScrapedMember(insertMember: InsertScrapedMember): Promise<ScrapedMember> {
    const id = this.currentMemberId++;
    const member: ScrapedMember = {
      ...insertMember,
      id,
      scrapedAt: new Date(),
    };
    
    const groupMembers = this.scrapedMembers.get(insertMember.groupId) || [];
    groupMembers.push(member);
    this.scrapedMembers.set(insertMember.groupId, groupMembers);
    
    return member;
  }

  async getHiddenMembersCount(groupId: string): Promise<number> {
    const members = this.scrapedMembers.get(groupId) || [];
    return members.filter(member => member.isHidden).length;
  }

  async getTotalMembersCount(): Promise<number> {
    let total = 0;
    for (const members of this.scrapedMembers.values()) {
      total += members.length;
    }
    return total;
  }
}

export const storage = new MemStorage();
