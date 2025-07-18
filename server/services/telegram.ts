import { WebSocket } from 'ws';
import { StringSession } from "telegram/sessions/index.js";
import { TelegramClient } from 'telegram';
import { Api } from 'telegram';
import { storage } from '../storage';

export interface TelegramGroup {
  id: string;
  title: string;
  member_count?: number;
  is_private?: boolean;
  is_group?: boolean;
  is_channel?: boolean;
}

export interface TelegramMember {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_hidden: boolean;
  is_online: boolean;
  last_seen?: string;
  privacy_level?: string;
}

export interface ScrapingConfig {
  mode: 'standard' | 'hidden' | 'all' | 'recent';
  rate_limit: number;
  max_members: number;
  bypass_privacy: boolean;
  real_time_export: boolean;
}

export class TelegramService {
  private isAuthenticated = false;
  private phoneNumber: string | null = null;
  private phoneCodeHash: string | null = null;
  private scrapingActive = false;
  private scrapingProgress = 0;
  private totalToScrape = 0;
  private currentGroup: TelegramGroup | null = null;
  private client: TelegramClient | null = null;
  private session: StringSession | null = null;

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    const apiId = Number(process.env.TELEGRAM_API_ID || process.env.API_ID || 0);
    const apiHash = String(process.env.TELEGRAM_API_HASH || process.env.API_HASH || '');
    if (!apiId || !apiHash) {
      console.warn('Telegram API credentials not found in environment variables');
    }
    this.session = new StringSession("");
    this.client = new TelegramClient(this.session, apiId, apiHash, {
      connectionRetries: 5,
    });
  }

  async sendCodeRequest(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Telegram client not initialized');
      await this.client.connect();
      // Cek session di database
      const sessionDb = await storage.getTelegramSession(phone);
      if (sessionDb && sessionDb.sessionData) {
        // Restore session
        this.session = new StringSession(sessionDb.sessionData);
        this.client = new TelegramClient(this.session, (this.client as any).apiId, (this.client as any).apiHash, { connectionRetries: 5 });
        await this.client.connect();
        if (await (this.client as any).isUserAuthorized()) {
          this.isAuthenticated = true;
          return { success: true, message: 'Login otomatis berhasil dari sesi sebelumnya.' };
        }
      }
      // Jika tidak ada session, kirim OTP
      const apiId = (this.client as any).apiId || Number(process.env.TELEGRAM_API_ID || process.env.API_ID || 0);
      const apiHash = (this.client as any).apiHash || String(process.env.TELEGRAM_API_HASH || process.env.API_HASH || '');
      if (!apiId || !apiHash) throw new Error('API ID/HASH not set');
      const result = await (this.client as any).sendCode(phone, apiId, apiHash);
      this.phoneNumber = phone;
      this.phoneCodeHash = result.phoneCodeHash || result.phone_code_hash;
      return { success: true, message: 'Kode verifikasi telah dikirim ke Telegram Anda.' };
    } catch (error) {
      return { success: false, message: `Gagal mengirim kode: ${error}` };
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean; needsPassword?: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Telegram client not initialized');
      await this.client.connect();
      const result = await this.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCodeHash: this.phoneCodeHash || '',
          phoneCode: code,
        })
      );
      this.isAuthenticated = true;
      // Simpan session ke database
      if (this.session) {
        await storage.updateTelegramSession(phone, this.session.save());
      }
      return { success: true, message: 'Login berhasil!' };
    } catch (error: any) {
      if (error.message && error.message.includes('SESSION_PASSWORD_NEEDED')) {
        return { success: false, needsPassword: true, message: 'Akun memerlukan verifikasi 2FA' };
      }
      return { success: false, message: `Gagal verifikasi: ${error}` };
    }
  }

  async verifyPassword(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Telegram client not initialized');
      await this.client.connect();
      const pwd = await this.client.invoke(new Api.account.GetPassword());
      const checkPassword = await (this.client as any).computeCheckPassword(pwd, password);
      await this.client.invoke(new Api.auth.CheckPassword({ password: checkPassword }));
      this.isAuthenticated = true;
      return { success: true, message: '2FA berhasil' };
    } catch (error) {
      return { success: false, message: `Password verification failed: ${error}` };
    }
  }

  async searchGroups(keyword: string): Promise<TelegramGroup[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Simulate group search with realistic results
    await this.delay(2000);
    
    const mockGroups: TelegramGroup[] = [
      {
        id: '1001234567890',
        title: `${keyword} Discussion Group`,
        member_count: Math.floor(Math.random() * 10000) + 100,
        is_private: false,
        is_group: true,
        is_channel: false,
      },
      {
        id: '1001234567891',
        title: `${keyword} Trading Signals`,
        member_count: Math.floor(Math.random() * 5000) + 50,
        is_private: true,
        is_group: false,
        is_channel: true,
      },
      {
        id: '1001234567892',
        title: `Advanced ${keyword} Community`,
        member_count: Math.floor(Math.random() * 15000) + 200,
        is_private: false,
        is_group: true,
        is_channel: false,
      }
    ];

    return mockGroups;
  }

  async startScraping(
    groupId: string, 
    config: ScrapingConfig, 
    ws: WebSocket,
    onProgress?: (current: number, total: number) => void,
    onMemberFound?: (member: TelegramMember) => void
  ): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    this.scrapingActive = true;
    this.scrapingProgress = 0;
    this.totalToScrape = config.max_members;

    try {
      // Simulate member scraping with advanced techniques
      for (let i = 0; i < config.max_members && this.scrapingActive; i++) {
        await this.delay(1000 / config.rate_limit);

        const member = this.generateMockMember(i, config);
        
        if (onMemberFound) {
          onMemberFound(member);
        }

        this.scrapingProgress = i + 1;
        if (onProgress) {
          onProgress(this.scrapingProgress, this.totalToScrape);
        }

        // Send real-time updates via WebSocket
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            status: 'scraping_progress',
            current: this.scrapingProgress,
            total: this.totalToScrape
          }));

          ws.send(JSON.stringify({
            status: 'member_found',
            member: member
          }));
        }
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          status: 'scraping_complete',
          total_scraped: this.scrapingProgress
        }));
      }

    } catch (error) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          status: 'error',
          message: `Scraping failed: ${error}`
        }));
      }
    } finally {
      this.scrapingActive = false;
    }
  }

  stopScraping(): void {
    this.scrapingActive = false;
  }

  private generateMockMember(index: number, config: ScrapingConfig): TelegramMember {
    const isHidden = config.mode === 'hidden' || (config.mode === 'all' && Math.random() > 0.7);
    const isOnline = Math.random() > 0.6;
    
    const usernames = ['alice_crypto', 'bob_trader', 'charlie_dev', 'diana_analyst', 'eve_investor'];
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    return {
      id: `user_${index + 1000000}`,
      username: Math.random() > 0.3 ? usernames[index % usernames.length] + index : undefined,
      first_name: firstNames[index % firstNames.length],
      last_name: Math.random() > 0.4 ? lastNames[index % lastNames.length] : undefined,
      phone: Math.random() > 0.8 ? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
      is_hidden: isHidden,
      is_online: isOnline,
      last_seen: isOnline ? undefined : this.generateLastSeen(),
      privacy_level: isHidden ? 'high' : 'normal'
    };
  }

  private generateLastSeen(): string {
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 10080); // Up to 7 days
    const lastSeen = new Date(now.getTime() - randomMinutes * 60 * 1000);
    return lastSeen.toISOString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getScrapingStatus() {
    return {
      active: this.scrapingActive,
      progress: this.scrapingProgress,
      total: this.totalToScrape
    };
  }

  async getProfile(): Promise<any> {
    if (!this.client) throw new Error('Telegram client not initialized');
    await this.client.connect();
    const me = await this.client.getMe();
    return me;
  }
}
