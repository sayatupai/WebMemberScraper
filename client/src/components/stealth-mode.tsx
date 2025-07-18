import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface StealthModeProps {
  onSendMessage: (message: any) => void;
  isActive: boolean;
}

export function StealthMode({ onSendMessage, isActive }: StealthModeProps) {
  const [stealthSettings, setStealthSettings] = useState({
    antiDetection: true,
    userAgentRotation: true,
    randomDelays: true,
    requestThrottling: true,
    headerSpoofing: true,
    fingerprinting: false
  });

  const [delayRange, setDelayRange] = useState([1, 5]);
  const [requestsPerMinute, setRequestsPerMinute] = useState([30]);
  const [stealthLevel, setStealthLevel] = useState(75);

  const toggleSetting = (setting: keyof typeof stealthSettings) => {
    const newSettings = {
      ...stealthSettings,
      [setting]: !stealthSettings[setting]
    };
    setStealthSettings(newSettings);
    
    onSendMessage({
      action: 'update_stealth_settings',
      settings: newSettings
    });
  };

  const activateStealthMode = () => {
    onSendMessage({
      action: 'activate_stealth_mode',
      settings: stealthSettings,
      delayRange,
      requestsPerMinute: requestsPerMinute[0],
      stealthLevel
    });
  };

  const deactivateStealthMode = () => {
    onSendMessage({
      action: 'deactivate_stealth_mode'
    });
  };

  return (
    <Card className="glass-card border-red-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 text-transparent bg-clip-text font-orbitron">
            Stealth Mode Control
          </CardTitle>
          <Badge 
            variant={isActive ? 'default' : 'secondary'}
            className={`${isActive ? 'bg-red-500/20 text-red-300 border-red-500' : ''} animate-pulse`}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stealth Level Indicator */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-gray-300 font-medium">Stealth Level</Label>
            <span className="text-xl font-bold text-red-400 font-orbitron">{stealthLevel}%</span>
          </div>
          <Progress value={stealthLevel} className="h-3 mb-4" />
          <Slider
            value={[stealthLevel]}
            onValueChange={(value) => setStealthLevel(value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-2">
            Higher levels provide better protection but slower speeds
          </div>
        </div>

        {/* Anti-Detection Features */}
        <div className="space-y-4">
          <h4 className="font-bold text-white font-exo">Anti-Detection Features</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">Anti-Detection</div>
                <div className="text-xs text-gray-400">Bypass Telegram's detection systems</div>
              </div>
              <Switch
                checked={stealthSettings.antiDetection}
                onCheckedChange={() => toggleSetting('antiDetection')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">User Agent Rotation</div>
                <div className="text-xs text-gray-400">Randomize browser signatures</div>
              </div>
              <Switch
                checked={stealthSettings.userAgentRotation}
                onCheckedChange={() => toggleSetting('userAgentRotation')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">Random Delays</div>
                <div className="text-xs text-gray-400">Human-like timing patterns</div>
              </div>
              <Switch
                checked={stealthSettings.randomDelays}
                onCheckedChange={() => toggleSetting('randomDelays')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">Request Throttling</div>
                <div className="text-xs text-gray-400">Limit request frequency</div>
              </div>
              <Switch
                checked={stealthSettings.requestThrottling}
                onCheckedChange={() => toggleSetting('requestThrottling')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">Header Spoofing</div>
                <div className="text-xs text-gray-400">Modify HTTP headers</div>
              </div>
              <Switch
                checked={stealthSettings.headerSpoofing}
                onCheckedChange={() => toggleSetting('headerSpoofing')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium text-white">Fingerprinting Protection</div>
                <div className="text-xs text-gray-400">Advanced device masking</div>
              </div>
              <Switch
                checked={stealthSettings.fingerprinting}
                onCheckedChange={() => toggleSetting('fingerprinting')}
              />
            </div>
          </div>
        </div>

        {/* Timing Configuration */}
        <div className="space-y-4">
          <h4 className="font-bold text-white font-exo">Timing Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <Label className="text-gray-300 font-medium mb-2 block">Delay Range (seconds)</Label>
              <div className="mb-2">
                <Slider
                  value={delayRange}
                  onValueChange={setDelayRange}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{delayRange[0]}s</span>
                <span>{delayRange[1]}s</span>
              </div>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg">
              <Label className="text-gray-300 font-medium mb-2 block">Requests per Minute</Label>
              <div className="mb-2">
                <Slider
                  value={requestsPerMinute}
                  onValueChange={setRequestsPerMinute}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="text-center text-xl font-bold text-red-400 font-orbitron">
                {requestsPerMinute[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-green-400 font-orbitron">98.7%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-yellow-400 font-orbitron">2.4s</div>
            <div className="text-xs text-gray-400">Avg Response</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400 font-orbitron">847</div>
            <div className="text-xs text-gray-400">Requests Made</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-purple-400 font-orbitron">0</div>
            <div className="text-xs text-gray-400">Blocks Detected</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          {!isActive ? (
            <Button
              onClick={activateStealthMode}
              className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 flex-1 font-bold transform hover:scale-105 transition-all"
            >
              Activate Stealth Mode
            </Button>
          ) : (
            <Button
              onClick={deactivateStealthMode}
              className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 flex-1 font-bold"
            >
              Deactivate Stealth Mode
            </Button>
          )}
          <Button
            onClick={() => onSendMessage({ action: 'test_stealth_mode' })}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            Test Configuration
          </Button>
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-500 font-bold">⚠️</div>
            <div>
              <div className="font-bold text-yellow-400 text-sm">Advanced Feature Warning</div>
              <div className="text-xs text-gray-300 mt-1">
                Stealth mode uses advanced techniques to bypass detection. Use responsibly and in compliance with terms of service.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}