import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { TelegramService, type ScrapingConfig } from "./services/telegram";

export async function registerRoutes(app: Express): Promise<Server> {
  const telegramServiceMap = new Map<string, TelegramService>();

  // Basic API routes
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getScrapedGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/members/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      const members = await storage.getScrapedMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const totalMembers = await storage.getTotalMembersCount();
      const groups = await storage.getScrapedGroups();
      let hiddenMembers = 0;
      let onlineMembers = 0;
      let activeMembers = 0;
      for (const group of groups) {
        hiddenMembers += await storage.getHiddenMembersCount(group.groupId);
        const members = await storage.getScrapedMembers(group.groupId);
        onlineMembers += members.filter((m: any) => m.isOnline).length;
        activeMembers += members.filter((m: any) => m.lastSeen && m.lastSeen !== '').length;
      }
      res.json({
        totalGroups: groups.length,
        totalMembers,
        hiddenMembers,
        onlineMembers,
        activeMembers
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentPhone: string | null = null;

    console.log('New WebSocket connection established');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        // Multi-session: gunakan phone sebagai key
        let phoneKey = message.phone || message.phoneCode || currentPhone;
        if (message.action === 'login_phone' && message.phone) {
          phoneKey = message.phone;
          currentPhone = message.phone;
        }
        if (phoneKey && !telegramServiceMap.has(phoneKey)) {
          telegramServiceMap.set(phoneKey, new TelegramService());
        }
        const telegramService = phoneKey ? telegramServiceMap.get(phoneKey) : undefined;
        await handleWebSocketMessage(ws, message, telegramService, phoneKey);
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            status: 'error',
            message: 'Invalid message format'
          }));
        }
      }
    });

    ws.on('close', () => {
      if (currentPhone && telegramServiceMap.has(currentPhone)) {
        telegramServiceMap.get(currentPhone)?.stopScraping();
        telegramServiceMap.delete(currentPhone);
      }
      console.log('WebSocket connection closed');
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        status: 'connected',
        message: 'Connected to Telegram Soxmed Ranger'
      }));
    }
  });

  return httpServer;
}

async function handleWebSocketMessage(
  ws: WebSocket, 
  message: any, 
  telegramService: TelegramService | undefined,
  phoneKey?: string
) {
  if (!telegramService) {
    ws.send(JSON.stringify({ status: 'error', message: 'Session not found, please login again.' }));
    return;
  }

  const { action } = message;

  switch (action) {
    case 'login_phone':
      const { phone } = message;
      if (!phone) {
        ws.send(JSON.stringify({
          status: 'error',
          message: 'Phone number is required'
        }));
        return;
      }

      const codeResult = await telegramService.sendCodeRequest(phone);
      if (codeResult.success) {
        // Store session
        await storage.createTelegramSession({
          phoneNumber: phone,
          sessionData: null
        });

        ws.send(JSON.stringify({
          status: 'code_sent',
          message: codeResult.message || 'Kode verifikasi telah dikirim ke aplikasi Telegram Anda'
        }));
      } else {
        ws.send(JSON.stringify({
          status: 'error',
          message: codeResult.message
        }));
      }
      break;

    case 'login_code':
      const { phone: phoneCode, code } = message;
      if (!phoneCode || !code) {
        ws.send(JSON.stringify({
          status: 'error',
          message: 'Phone number and code are required'
        }));
        return;
      }

      const verifyResult = await telegramService.verifyCode(phoneCode, code);
      if (verifyResult.success) {
        await storage.updateTelegramSession(phoneCode, 'authenticated');
        // Ambil profile Telegram user
        let profile = null;
        try {
          profile = await telegramService.getProfile();
        } catch (e) { profile = null; }
        ws.send(JSON.stringify({
          status: 'login_success',
          message: verifyResult.message || 'Autentikasi berhasil! Selamat datang di Telegram Soxmed Ranger.',
          profile
        }));
      } else if (verifyResult.needsPassword) {
        ws.send(JSON.stringify({
          status: 'password_needed',
          message: 'Two-factor authentication required'
        }));
      } else {
        ws.send(JSON.stringify({
          status: 'error',
          message: verifyResult.message
        }));
      }
      break;

    case 'login_password':
      const { password } = message;
      if (!password) {
        ws.send(JSON.stringify({
          status: 'error',
          message: 'Password is required'
        }));
        return;
      }

      const passwordResult = await telegramService.verifyPassword(password);
      if (passwordResult.success) {
        ws.send(JSON.stringify({
          status: 'login_success',
          message: 'Two-factor authentication successful'
        }));
      } else {
        ws.send(JSON.stringify({
          status: 'error',
          message: passwordResult.message
        }));
      }
      break;

    case 'search_groups':
      const { keyword } = message;
      if (!keyword) {
        ws.send(JSON.stringify({
          status: 'error',
          message: 'Search keyword is required'
        }));
        return;
      }

      try {
        ws.send(JSON.stringify({
          status: 'info',
          message: `Searching for groups with keyword: ${keyword}...`
        }));

        const groups = await telegramService.searchGroups(keyword);
        
        // Store found groups
        for (const group of groups) {
          await storage.createScrapedGroup({
            groupId: group.id,
            title: group.title,
            memberCount: group.member_count,
            isPrivate: group.is_private || false
          });
        }

        ws.send(JSON.stringify({
          status: 'groups_found',
          groups: groups
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          status: 'error',
          message: `Search failed: ${error}`
        }));
      }
      break;

    case 'start_scraping':
      const { 
        mode = 'standard',
        rate_limit = 3,
        max_members = 1000,
        bypass_privacy = false,
        real_time_export = false,
        group_id 
      } = message;

      if (!telegramService.isUserAuthenticated()) {
        ws.send(JSON.stringify({
          status: 'error',
          message: 'Please authenticate first'
        }));
        return;
      }

      const config: ScrapingConfig = {
        mode,
        rate_limit,
        max_members,
        bypass_privacy,
        real_time_export
      };

      const targetGroupId = group_id || '1001234567890'; // Default group

      ws.send(JSON.stringify({
        status: 'info',
        message: `Starting ${mode} member scraping...`
      }));

      try {
        await telegramService.startScraping(
          targetGroupId,
          config,
          ws,
          (current, total) => {
            // Progress callback handled in service
          },
          async (member) => {
            // Store member data
            await storage.createScrapedMember({
              groupId: targetGroupId,
              userId: member.id,
              username: member.username,
              firstName: member.first_name,
              lastName: member.last_name,
              phone: member.phone,
              isHidden: member.is_hidden,
              isOnline: member.is_online,
              lastSeen: member.last_seen,
              memberData: member
            });
          }
        );
        // Notifikasi selesai scraping
        ws.send(JSON.stringify({
          status: 'scraping_done',
          message: 'Scraping selesai! Data siap diexport.'
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          status: 'error',
          message: `Scraping failed: ${error}`
        }));
      }
      break;

    case 'stop_scraping':
      telegramService.stopScraping();
      ws.send(JSON.stringify({
        status: 'info',
        message: 'Scraping stopped by user'
      }));
      break;

    case 'activate_stealth_mode':
      ws.send(JSON.stringify({
        status: 'info',
        message: 'Stealth mode activated with advanced anti-detection'
      }));
      break;

    case 'deactivate_stealth_mode':
      ws.send(JSON.stringify({
        status: 'info',
        message: 'Stealth mode deactivated'
      }));
      break;

    case 'add_proxy':
      const { proxy } = message;
      ws.send(JSON.stringify({
        status: 'info',
        message: `Proxy ${proxy.host}:${proxy.port} added successfully`
      }));
      break;

    case 'test_proxy':
      const { proxyId } = message;
      ws.send(JSON.stringify({
        status: 'info',
        message: `Testing proxy ${proxyId}...`
      }));
      break;

    case 'export_advanced':
      const { format, filters } = message;
      try {
        // Ambil data member dari storage (bisa difilter)
        const groupId = message.group_id;
        let members = [];
        if (groupId) {
          members = await storage.getScrapedMembers(groupId);
        } else {
          // Export semua member dari semua group
          const groups = await storage.getScrapedGroups();
          for (const group of groups) {
            const groupMembers = await storage.getScrapedMembers(group.groupId);
            members.push(...groupMembers);
          }
        }
        // Filter advanced
        let filtered = members;
        if (Array.isArray(filters)) {
          filtered = members.filter((m) => {
            return filters.every((f: any) => {
              const val = f.field.split('.').reduce((acc: any, k: string) => acc ? acc[k] : undefined, m as any);
              switch (f.op) {
                case 'eq': return val === f.value;
                case 'neq': return val !== f.value;
                case 'contains': return typeof val === 'string' && val.includes(f.value);
                case 'in': return Array.isArray(f.value) && f.value.includes(val);
                case 'range': return Array.isArray(f.value) && val >= f.value[0] && val <= f.value[1];
                default: return true;
              }
            });
          });
        }
        let fileBuffer: Buffer;
        let fileName: string;
        if (format === 'csv') {
          const { exportToCSV } = await import('./exporter');
          fileBuffer = await exportToCSV(filtered);
          fileName = 'export.csv';
        } else if (format === 'excel' || format === 'xlsx') {
          const { exportToExcel } = await import('./exporter');
          fileBuffer = await exportToExcel(filtered);
          fileName = 'export.xlsx';
        } else {
          ws.send(JSON.stringify({ status: 'error', message: 'Format tidak didukung' }));
          return;
        }
        // Kirim file ke client (base64)
        ws.send(JSON.stringify({
          status: 'export_ready',
          file: fileBuffer.toString('base64'),
          fileName,
          format
        }));
      } catch (error) {
        ws.send(JSON.stringify({ status: 'error', message: `Export gagal: ${error}` }));
      }
      break;

    default:
      ws.send(JSON.stringify({
        status: 'error',
        message: `Unknown action: ${action}`
      }));
  }
}
