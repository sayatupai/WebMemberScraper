import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface MemberAnalyticsProps {
  members: Member[];
  scrapingProgress?: { current: number; total: number };
  isScrapingActive: boolean;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function MemberAnalytics({
  members,
  scrapingProgress,
  isScrapingActive,
  onExportCSV,
  onExportJSON
}: MemberAnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && typeof window !== 'undefined') {
      import('chart.js/auto').then((Chart) => {
        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const publicCount = members.filter(m => !m.isHidden).length;
        const hiddenCount = members.filter(m => m.isHidden).length;

        chartInstance.current = new Chart.default(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Public Members', 'Hidden Members', 'Pending'],
            datasets: [{
              data: [publicCount, hiddenCount, 0],
              backgroundColor: [
                'rgba(6, 182, 212, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(107, 114, 128, 0.8)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#D1D5DB' }
              }
            }
          }
        });
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [members]);

  const progressPercentage = scrapingProgress 
    ? Math.round((scrapingProgress.current / scrapingProgress.total) * 100)
    : 0;

  return (
    <Card className="glass-card border-cyan-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
            Member Analytics
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={onExportCSV}
              disabled={members.length === 0}
              className="bg-green-600 hover:bg-green-700 text-sm"
            >
              Export CSV
            </Button>
            <Button
              onClick={onExportJSON}
              disabled={members.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Tracking */}
        {isScrapingActive && scrapingProgress && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Scraping Progress</span>
              <span className="text-sm text-gray-400">
                {progressPercentage}% ({scrapingProgress.current}/{scrapingProgress.total})
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}

        {/* Chart Container */}
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-2 text-gray-300">Username</th>
                <th className="text-left py-3 px-2 text-gray-300">Name</th>
                <th className="text-left py-3 px-2 text-gray-300">Status</th>
                <th className="text-left py-3 px-2 text-gray-300">Last Seen</th>
                <th className="text-left py-3 px-2 text-gray-300">Privacy</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                    Select a group and start scraping to see member data...
                  </td>
                </tr>
              ) : (
                members.slice(-50).map((member) => (
                  <tr key={member.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-2 px-2 font-mono text-cyan-400">
                      @{member.username || 'N/A'}
                    </td>
                    <td className="py-2 px-2">
                      {member.firstName || ''} {member.lastName || ''}
                    </td>
                    <td className={`py-2 px-2 ${member.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                      {member.isOnline ? 'Online' : 'Offline'}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {member.lastSeen ? new Date(member.lastSeen).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="py-2 px-2">
                      {member.isHidden ? (
                        <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                          Hidden
                        </span>
                      ) : (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                          Public
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
