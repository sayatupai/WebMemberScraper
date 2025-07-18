import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface Group {
  id: string;
  title: string;
  member_count?: number;
  is_private?: boolean;
}

interface DashboardSectionProps {
  onSearchGroups: (keyword: string) => void;
  onStartScraping: (config: any) => void;
  onStopScraping: () => void;
  onClearData: () => void;
  groups: Group[];
  isScrapingActive: boolean;
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
}

export function DashboardSection({
  onSearchGroups,
  onStartScraping,
  onStopScraping,
  onClearData,
  groups,
  isScrapingActive,
  selectedGroup,
  onSelectGroup
}: DashboardSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [scrapingMode, setScrapingMode] = useState('standard');
  const [rateLimit, setRateLimit] = useState([3]);
  const [maxMembers, setMaxMembers] = useState(1000);
  const [includePrivate, setIncludePrivate] = useState(false);
  const [bypassPrivacy, setBypassPrivacy] = useState(true);
  const [realTimeExport, setRealTimeExport] = useState(false);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      onSearchGroups(searchKeyword.trim());
    }
  };

  const handleStartScraping = () => {
    if (!selectedGroup) {
      alert('Please select a group first');
      return;
    }

    const config = {
      group_id: selectedGroup.id,
      mode: scrapingMode,
      rate_limit: rateLimit[0],
      max_members: maxMembers,
      bypass_privacy: bypassPrivacy,
      real_time_export: realTimeExport
    };

    onStartScraping(config);
  };

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Group Search & Selection */}
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text">
              Group Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300 font-medium">Search Keywords</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="bg-gray-800/50 border-purple-500/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                  placeholder="e.g., crypto, trading, python..."
                />
                <Button
                  onClick={handleSearch}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Search
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Direct Group Link</Label>
              <Input
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                placeholder="https://t.me/groupname or @groupname"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-private"
                checked={includePrivate}
                onCheckedChange={(checked) => setIncludePrivate(checked as boolean)}
              />
              <Label htmlFor="include-private" className="text-gray-300">
                Include private groups
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Scraping Options */}
        <Card className="glass-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 text-transparent bg-clip-text">
              Scraping Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300 font-medium">Scraping Mode</Label>
              <Select value={scrapingMode} onValueChange={setScrapingMode}>
                <SelectTrigger className="bg-gray-800/50 border-cyan-500/30 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Members</SelectItem>
                  <SelectItem value="hidden">Hidden Members (Advanced)</SelectItem>
                  <SelectItem value="all">All Members + Hidden</SelectItem>
                  <SelectItem value="recent">Recent Activity Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 font-medium">Rate Limit (req/sec)</Label>
                <div className="mt-2">
                  <Slider
                    value={rateLimit}
                    onValueChange={setRateLimit}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-400 mt-1">
                    {rateLimit[0]}/sec
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Max Members</Label>
                <Input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value) || 1000)}
                  className="bg-gray-800/50 border-cyan-500/30 focus:border-purple-400 focus:ring-purple-400/20 mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bypass-privacy"
                  checked={bypassPrivacy}
                  onCheckedChange={(checked) => setBypassPrivacy(checked as boolean)}
                />
                <Label htmlFor="bypass-privacy" className="text-gray-300">
                  Enable privacy bypass techniques
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="real-time-export"
                  checked={realTimeExport}
                  onCheckedChange={(checked) => setRealTimeExport(checked as boolean)}
                />
                <Label htmlFor="real-time-export" className="text-gray-300">
                  Real-time export to CSV
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Discovered Groups
            </CardTitle>
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
              {groups.length} groups
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">
                Search for groups to get started...
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`p-3 bg-gray-800/30 rounded-lg border cursor-pointer transition-all ${
                    selectedGroup?.id === group.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-600/30 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-medium text-white truncate">{group.title}</div>
                  <div className="text-sm text-gray-400">ID: {group.id}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {group.member_count || 'Unknown'} members
                    </span>
                    {group.is_private && (
                      <span className="inline-block bg-red-500/20 text-red-300 px-2 py-1 rounded ml-2">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isScrapingActive ? (
          <Button
            onClick={handleStartScraping}
            disabled={!selectedGroup}
            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all shadow-lg"
          >
            Start Advanced Scraping
          </Button>
        ) : (
          <Button
            onClick={onStopScraping}
            className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all shadow-lg"
          >
            Stop Scraping
          </Button>
        )}
        <Button
          onClick={onClearData}
          className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all shadow-lg"
        >
          Clear Data
        </Button>
      </div>
    </div>
  );
}
