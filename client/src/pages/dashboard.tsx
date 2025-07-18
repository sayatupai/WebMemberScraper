import React, { useState, useEffect } from 'react';
import { SpaceBackground } from '@/components/space-background';
import { LoginSection } from '@/components/login-section';
import { DashboardSection } from '@/components/dashboard-section';
import { MemberAnalytics } from '@/components/member-analytics';
import { AdvancedAnalytics } from '@/components/advanced-analytics';
import { ProxyManager } from '@/components/proxy-manager';
import { StealthMode } from '@/components/stealth-mode';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  title: string;
  member_count?: number;
  is_private?: boolean;
}

interface Member {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isHidden: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

interface Stats {
  totalGroups: number;
  totalMembers: number;
  hiddenMembers: number;
  activeSessions: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isConnected, sendMessage, lastMessage } = useWebSocket();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalMembers: 0,
    hiddenMembers: 0,
    activeSessions: 1
  });
  
  // Scraping state
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState<{ current: number; total: number } | null>(null);
  const [stealthModeActive, setStealthModeActive] = useState(false);
  
  // Logs
  const [logs, setLogs] = useState<string[]>(['System ready. Waiting for connection...']);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleServerMessage(lastMessage);
    }
  }, [lastMessage]);

  const handleServerMessage = (data: any) => {
    addLog(`Server: ${data.message || data.status}`);
    
    switch (data.status) {
      case 'connected':
        toast({ title: 'Connected', description: 'WebSocket connection established' });
        break;
        
      case 'code_sent':
        setLoginStep('code');
        setIsLoading(false);
        break;
        
      case 'password_needed':
        setLoginStep('password');
        setIsLoading(false);
        break;
        
      case 'login_success':
        setIsAuthenticated(true);
        setIsLoading(false);
        toast({ title: 'Success', description: 'Authentication successful' });
        break;
        
      case 'groups_found':
        setGroups(data.groups || []);
        setStats(prev => ({ ...prev, totalGroups: data.groups?.length || 0 }));
        break;
        
      case 'scraping_progress':
        setScrapingProgress({ current: data.current, total: data.total });
        break;
        
      case 'member_found':
        const member = data.member;
        setMembers(prev => [...prev, {
          id: member.id,
          username: member.username,
          firstName: member.first_name,
          lastName: member.last_name,
          phone: member.phone,
          isHidden: member.is_hidden,
          isOnline: member.is_online,
          lastSeen: member.last_seen
        }]);
        
        setStats(prev => ({
          ...prev,
          totalMembers: prev.totalMembers + 1,
          hiddenMembers: member.is_hidden ? prev.hiddenMembers + 1 : prev.hiddenMembers
        }));
        break;
        
      case 'scraping_complete':
        setIsScrapingActive(false);
        setScrapingProgress(null);
        toast({ title: 'Complete', description: 'Scraping completed successfully' });
        break;
        
      case 'error':
        setIsLoading(false);
        toast({ 
          title: 'Error', 
          description: data.message,
          variant: 'destructive'
        });
        break;
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-100));
  };

  // Authentication handlers
  const handleSendCode = (phone: string) => {
    setIsLoading(true);
    sendMessage({ action: 'login_phone', phone });
    addLog(`Sending verification code to ${phone}...`);
  };

  const handleVerifyCode = (phone: string, code: string) => {
    setIsLoading(true);
    sendMessage({ action: 'login_code', phone, code });
    addLog('Verifying code...');
  };

  const handleVerifyPassword = (password: string) => {
    setIsLoading(true);
    sendMessage({ action: 'login_password', password });
    addLog('Verifying 2FA password...');
  };

  // Dashboard handlers
  const handleSearchGroups = (keyword: string) => {
    sendMessage({ action: 'search_groups', keyword });
    addLog(`Searching for groups with keyword: ${keyword}`);
  };

  const handleStartScraping = (config: any) => {
    setIsScrapingActive(true);
    setMembers([]);
    setScrapingProgress({ current: 0, total: config.max_members });
    sendMessage({ action: 'start_scraping', ...config });
    addLog('Starting advanced member scraping...');
  };

  const handleStopScraping = () => {
    sendMessage({ action: 'stop_scraping' });
    setIsScrapingActive(false);
    setScrapingProgress(null);
    addLog('Stopping scraping...');
  };

  const handleClearData = () => {
    setMembers([]);
    setStats(prev => ({ ...prev, totalMembers: 0, hiddenMembers: 0 }));
    addLog('All member data cleared');
  };

  const handleExportCSV = () => {
    if (members.length === 0) {
      toast({ title: 'Warning', description: 'No data to export', variant: 'destructive' });
      return;
    }

    const headers = ['Username', 'First Name', 'Last Name', 'Phone', 'Is Hidden', 'Is Online', 'Last Seen'];
    const csvContent = [
      headers.join(','),
      ...members.map(member => [
        member.username || '',
        member.firstName || '',
        member.lastName || '',
        member.phone || '',
        member.isHidden ? 'Yes' : 'No',
        member.isOnline ? 'Yes' : 'No',
        member.lastSeen || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telegram_members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addLog('Data exported to CSV successfully');
    toast({ title: 'Success', description: 'Data exported to CSV' });
  };

  const handleExportJSON = () => {
    if (members.length === 0) {
      toast({ title: 'Warning', description: 'No data to export', variant: 'destructive' });
      return;
    }

    const jsonContent = JSON.stringify(members, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telegram_members_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    addLog('Data exported to JSON successfully');
    toast({ title: 'Success', description: 'Data exported to JSON' });
  };

  return (
    <div className="min-h-screen text-white font-sans">
      <SpaceBackground />
      
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20"></div>
        <div className="container mx-auto p-4 relative z-10">
          {/* 3D Spline Animation */}
          <div className="w-full h-80 my-8 rounded-2xl overflow-hidden shadow-2xl">
            <iframe 
              src='https://my.spline.design/interactivelibraryroom-9e099e44f1e31358999902c67b9d7e5b/' 
              frameBorder='0' 
              width='100%' 
              height='100%' 
              className="rounded-2xl"
            />
          </div>
          
          <div className="text-center">
            <div className="logo-container mb-6 animate-float">
              <img 
                src="https://i.postimg.cc/3dMdRCkH/Tahukah-Kalian-Di-Jhon-wick-4-85.png" 
                alt="Telegram Soxmed Ranger Logo" 
                className="logo-glow mx-auto h-24 w-24 md:h-32 md:w-32 rounded-full border-2 border-purple-500/30"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-orbitron font-black gradient-text mb-4 animate-neon tracking-wider">
              TELEGRAM SOXMED
            </h1>
            <h2 className="text-3xl md:text-4xl font-exo font-bold bg-gradient-to-r from-cyan-400 to-green-400 text-transparent bg-clip-text mb-6 tracking-wide">
              RANGER
            </h2>
            <p className="text-xl font-space text-gray-300 mb-2">Advanced Social Media Intelligence Platform</p>
            <p className="text-gray-400 mb-8 font-exo">Next-generation member scraping with privacy bypass technology</p>
            
            {/* Status Indicators */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="glass-card rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="glass-card rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm">API Ready</span>
              </div>
              <div className="glass-card rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Rate Limit: Normal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-7xl">
        {!isAuthenticated ? (
          <LoginSection
            onSendCode={handleSendCode}
            onVerifyCode={handleVerifyCode}
            onVerifyPassword={handleVerifyPassword}
            currentStep={loginStep}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card text-center p-6">
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">{stats.totalGroups}</div>
                  <div className="text-gray-400 text-sm">Groups Found</div>
                </CardContent>
              </Card>
              <Card className="glass-card text-center p-6">
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400">{stats.totalMembers}</div>
                  <div className="text-gray-400 text-sm">Members Scraped</div>
                </CardContent>
              </Card>
              <Card className="glass-card text-center p-6">
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{stats.hiddenMembers}</div>
                  <div className="text-gray-400 text-sm">Hidden Members</div>
                </CardContent>
              </Card>
              <Card className="glass-card text-center p-6">
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">{stats.activeSessions}</div>
                  <div className="text-gray-400 text-sm">Active Sessions</div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Tabs Interface */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-5 glass-card">
                <TabsTrigger value="dashboard" className="font-exo">Dashboard</TabsTrigger>
                <TabsTrigger value="analytics" className="font-exo">Analytics</TabsTrigger>
                <TabsTrigger value="stealth" className="font-exo">Stealth Mode</TabsTrigger>
                <TabsTrigger value="proxy" className="font-exo">Proxy Manager</TabsTrigger>
                <TabsTrigger value="intelligence" className="font-exo">Intelligence</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <DashboardSection
                  onSearchGroups={handleSearchGroups}
                  onStartScraping={handleStartScraping}
                  onStopScraping={handleStopScraping}
                  onClearData={handleClearData}
                  groups={groups}
                  isScrapingActive={isScrapingActive}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <MemberAnalytics
                  members={members}
                  scrapingProgress={scrapingProgress}
                  isScrapingActive={isScrapingActive}
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                />
              </TabsContent>

              <TabsContent value="stealth" className="mt-6">
                <StealthMode
                  onSendMessage={sendMessage}
                  isActive={stealthModeActive}
                />
              </TabsContent>

              <TabsContent value="proxy" className="mt-6">
                <ProxyManager
                  onSendMessage={sendMessage}
                />
              </TabsContent>

              <TabsContent value="intelligence" className="mt-6">
                <AdvancedAnalytics
                  members={members}
                  onSendMessage={sendMessage}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Real-time Log Panel */}
        <div className="mt-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
                  System Logs
                </h3>
                <button 
                  onClick={() => setLogs(['Logs cleared'])}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
                >
                  Clear
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-300">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
