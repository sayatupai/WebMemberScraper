import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface AdvancedAnalyticsProps {
  members: Member[];
  onSendMessage: (message: any) => void;
}

export function AdvancedAnalytics({ members, onSendMessage }: AdvancedAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members);
  const [aiAnalysisActive, setAiAnalysisActive] = useState(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    const filtered = members.filter(member => 
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const runAIAnalysis = () => {
    setAiAnalysisActive(true);
    // Simulate AI analysis
    setTimeout(() => {
      const detectedAnomalies = [
        {
          type: 'Suspicious Activity',
          description: 'Multiple accounts with similar naming patterns detected',
          severity: 'high',
          count: Math.floor(Math.random() * 10) + 1
        },
        {
          type: 'Bot Detection',
          description: 'Accounts with automated behavior patterns',
          severity: 'medium',
          count: Math.floor(Math.random() * 15) + 5
        },
        {
          type: 'Privacy Bypass',
          description: 'Hidden profiles successfully accessed',
          severity: 'low',
          count: members.filter(m => m.isHidden).length
        }
      ];
      setAnomalies(detectedAnomalies);
      setAiAnalysisActive(false);
    }, 3000);
  };

  const exportAdvanced = (format: string) => {
    onSendMessage({
      action: 'export_advanced',
      format,
      filters: { searchTerm },
      analysis: anomalies
    });
  };

  const stats = {
    totalMembers: members.length,
    hiddenMembers: members.filter(m => m.isHidden).length,
    onlineMembers: members.filter(m => m.isOnline).length,
    withPhone: members.filter(m => m.phone).length,
    withUsername: members.filter(m => m.username).length,
    privacyRate: members.length > 0 ? Math.round((members.filter(m => m.isHidden).length / members.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Advanced Statistics */}
      <Card className="glass-card border-green-500/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text font-orbitron">
            AI-Powered Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 font-orbitron">{stats.totalMembers}</div>
              <div className="text-sm text-gray-400">Total Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 font-orbitron">{stats.hiddenMembers}</div>
              <div className="text-sm text-gray-400">Hidden Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 font-orbitron">{stats.onlineMembers}</div>
              <div className="text-sm text-gray-400">Currently Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 font-orbitron">{stats.withPhone}</div>
              <div className="text-sm text-gray-400">Phone Numbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 font-orbitron">{stats.withUsername}</div>
              <div className="text-sm text-gray-400">With Username</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 font-orbitron">{stats.privacyRate}%</div>
              <div className="text-sm text-gray-400">Privacy Rate</div>
            </div>
          </div>

          {/* Privacy Analysis */}
          <div className="mb-6">
            <Label className="text-gray-300 font-medium mb-2 block">Privacy Distribution</Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Public Profiles</span>
                <span>{((stats.totalMembers - stats.hiddenMembers) / stats.totalMembers * 100).toFixed(1)}%</span>
              </div>
              <Progress value={((stats.totalMembers - stats.hiddenMembers) / stats.totalMembers * 100)} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>Hidden Profiles</span>
                <span>{stats.privacyRate}%</span>
              </div>
              <Progress value={stats.privacyRate} className="h-2" />
            </div>
          </div>

          {/* AI Analysis Button */}
          <div className="flex space-x-4">
            <Button
              onClick={runAIAnalysis}
              disabled={aiAnalysisActive || members.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 font-bold"
            >
              {aiAnalysisActive ? 'Analyzing...' : 'Run AI Analysis'}
            </Button>
            <Button
              onClick={() => exportAdvanced('detailed')}
              disabled={members.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            >
              Export Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="glass-card border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text font-exo">
            Advanced Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 font-medium">Smart Search</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/50 border-cyan-500/30 focus:border-purple-400 focus:ring-purple-400/20 mt-2"
                placeholder="Search by username, name, or phone..."
              />
            </div>
            <div className="text-sm text-gray-400">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {anomalies.length > 0 && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text font-orbitron">
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{anomaly.type}</h4>
                      <p className="text-gray-300 text-sm mt-1">{anomaly.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}
                        className="font-mono"
                      >
                        {anomaly.count}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${anomaly.severity === 'high' ? 'border-red-500 text-red-400' : 
                          anomaly.severity === 'medium' ? 'border-yellow-500 text-yellow-400' : 
                          'border-green-500 text-green-400'}
                      `}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Member List */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-space">
            Member Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">ID</th>
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">Profile</th>
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">Contact</th>
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">Status</th>
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">Privacy</th>
                  <th className="text-left py-3 px-2 text-gray-300 font-orbitron">Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                      {searchTerm ? 'No members match your search criteria' : 'No member data available'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.slice(-100).map((member, index) => {
                    const riskLevel = member.isHidden ? 'high' : member.phone ? 'low' : 'medium';
                    return (
                      <tr key={member.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-2 px-2 font-mono text-xs text-gray-400">
                          {member.id.slice(-8)}
                        </td>
                        <td className="py-2 px-2">
                          <div>
                            <div className="font-medium text-cyan-400">
                              @{member.username || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-300">
                              {member.firstName} {member.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 font-mono text-xs">
                          {member.phone || 'Hidden'}
                        </td>
                        <td className={`py-2 px-2 ${member.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                          <Badge variant={member.isOnline ? 'default' : 'secondary'} className="text-xs">
                            {member.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <Badge 
                            variant={member.isHidden ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {member.isHidden ? 'Hidden' : 'Public'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <Badge 
                            variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {riskLevel.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}