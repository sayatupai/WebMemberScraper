import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProxyConfig {
  id: string;
  host: string;
  port: number;
  type: 'HTTP' | 'SOCKS5' | 'SOCKS4';
  username?: string;
  password?: string;
  status: 'active' | 'inactive' | 'testing';
  latency?: number;
  country?: string;
}

interface ProxyManagerProps {
  onSendMessage: (message: any) => void;
}

export function ProxyManager({ onSendMessage }: ProxyManagerProps) {
  const [proxies, setProxies] = useState<ProxyConfig[]>([
    {
      id: '1',
      host: '127.0.0.1',
      port: 8080,
      type: 'HTTP',
      status: 'active',
      latency: 45,
      country: 'US'
    },
    {
      id: '2',
      host: '192.168.1.100',
      port: 1080,
      type: 'SOCKS5',
      status: 'inactive',
      latency: 120,
      country: 'DE'
    }
  ]);

  const [newProxy, setNewProxy] = useState({
    host: '',
    port: '',
    type: 'HTTP',
    username: '',
    password: ''
  });

  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [rotationInterval, setRotationInterval] = useState('30');

  const addProxy = () => {
    if (newProxy.host && newProxy.port) {
      const proxy: ProxyConfig = {
        id: Date.now().toString(),
        host: newProxy.host,
        port: parseInt(newProxy.port),
        type: newProxy.type as 'HTTP' | 'SOCKS5' | 'SOCKS4',
        username: newProxy.username || undefined,
        password: newProxy.password || undefined,
        status: 'inactive'
      };
      setProxies([...proxies, proxy]);
      setNewProxy({ host: '', port: '', type: 'HTTP', username: '', password: '' });
      
      onSendMessage({
        action: 'add_proxy',
        proxy
      });
    }
  };

  const testProxy = (proxyId: string) => {
    setProxies(proxies.map(p => 
      p.id === proxyId ? { ...p, status: 'testing' } : p
    ));
    
    onSendMessage({
      action: 'test_proxy',
      proxyId
    });

    // Simulate test result
    setTimeout(() => {
      setProxies(proxies.map(p => 
        p.id === proxyId ? { 
          ...p, 
          status: Math.random() > 0.3 ? 'active' : 'inactive',
          latency: Math.floor(Math.random() * 200) + 20
        } : p
      ));
    }, 2000);
  };

  const removeProxy = (proxyId: string) => {
    setProxies(proxies.filter(p => p.id !== proxyId));
    onSendMessage({
      action: 'remove_proxy',
      proxyId
    });
  };

  const toggleRotation = () => {
    setRotationEnabled(!rotationEnabled);
    onSendMessage({
      action: 'toggle_rotation',
      enabled: !rotationEnabled,
      interval: parseInt(rotationInterval)
    });
  };

  return (
    <Card className="glass-card border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text font-orbitron">
          Proxy Management System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rotation Settings */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white font-exo">Auto Proxy Rotation</h4>
              <p className="text-sm text-gray-400">Automatically switch proxies to avoid detection</p>
            </div>
            <Switch
              checked={rotationEnabled}
              onCheckedChange={toggleRotation}
            />
          </div>
          {rotationEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Rotation Interval (seconds)</Label>
                <Input
                  value={rotationInterval}
                  onChange={(e) => setRotationInterval(e.target.value)}
                  className="bg-gray-700/50 border-orange-500/30 mt-1"
                  type="number"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Active Proxies</Label>
                <div className="mt-2 text-2xl font-bold text-orange-400 font-orbitron">
                  {proxies.filter(p => p.status === 'active').length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add New Proxy */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="font-bold text-white mb-4 font-exo">Add New Proxy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-300 text-sm">Host/IP</Label>
              <Input
                value={newProxy.host}
                onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                className="bg-gray-700/50 border-orange-500/30 mt-1"
                placeholder="127.0.0.1"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Port</Label>
              <Input
                value={newProxy.port}
                onChange={(e) => setNewProxy({...newProxy, port: e.target.value})}
                className="bg-gray-700/50 border-orange-500/30 mt-1"
                placeholder="8080"
                type="number"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Type</Label>
              <Select value={newProxy.type} onValueChange={(value) => setNewProxy({...newProxy, type: value})}>
                <SelectTrigger className="bg-gray-700/50 border-orange-500/30 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                  <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={addProxy}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Add Proxy
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label className="text-gray-300 text-sm">Username (Optional)</Label>
              <Input
                value={newProxy.username}
                onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                className="bg-gray-700/50 border-orange-500/30 mt-1"
                placeholder="proxy_user"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Password (Optional)</Label>
              <Input
                value={newProxy.password}
                onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                className="bg-gray-700/50 border-orange-500/30 mt-1"
                placeholder="proxy_pass"
                type="password"
              />
            </div>
          </div>
        </div>

        {/* Proxy List */}
        <div>
          <h4 className="font-bold text-white mb-4 font-exo">Configured Proxies</h4>
          <div className="space-y-3">
            {proxies.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic">
                No proxies configured. Add a proxy above to get started.
              </div>
            ) : (
              proxies.map((proxy) => (
                <div key={proxy.id} className="p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-cyan-400">
                          {proxy.host}:{proxy.port}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {proxy.type}
                        </Badge>
                        <Badge 
                          variant={
                            proxy.status === 'active' ? 'default' : 
                            proxy.status === 'testing' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {proxy.status.toUpperCase()}
                        </Badge>
                        {proxy.latency && (
                          <span className="text-xs text-gray-400">
                            {proxy.latency}ms
                          </span>
                        )}
                        {proxy.country && (
                          <Badge variant="outline" className="text-xs">
                            {proxy.country}
                          </Badge>
                        )}
                      </div>
                      {proxy.username && (
                        <div className="text-xs text-gray-500 mt-1">
                          Auth: {proxy.username}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => testProxy(proxy.id)}
                        disabled={proxy.status === 'testing'}
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                      >
                        {proxy.status === 'testing' ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        onClick={() => removeProxy(proxy.id)}
                        className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <Button
            onClick={() => onSendMessage({ action: 'test_all_proxies' })}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            Test All Proxies
          </Button>
          <Button
            onClick={() => onSendMessage({ action: 'clear_failed_proxies' })}
            className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600"
          >
            Clear Failed
          </Button>
          <Button
            onClick={() => onSendMessage({ action: 'import_proxy_list' })}
            className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600"
          >
            Import List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}