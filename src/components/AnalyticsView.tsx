import React, { useMemo, memo } from 'react';
import { Activity, TrendingUp, Users } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AnalyticsView = memo(({ uiLang }: { uiLang: 'en' | 'bn' }) => {
  const data = useMemo(() => [
    { name: 'Mon', views: 4000, viral: 2400 },
    { name: 'Tue', views: 3000, viral: 1398 },
    { name: 'Wed', views: 2000, viral: 9800 },
    { name: 'Thu', views: 2780, viral: 3908 },
    { name: 'Fri', views: 1890, viral: 4800 },
    { name: 'Sat', views: 2390, viral: 3800 },
    { name: 'Sun', views: 3490, viral: 4300 },
  ], []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hw-panel p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="hw-label">Total Reach</span>
            <Activity className="w-4 h-4 text-hw-accent" />
          </div>
          <div className="hw-display text-2xl">1.2M</div>
          <div className="text-[10px] text-green-500 mt-2">+12.5% from last week</div>
        </div>
        <div className="hw-panel p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="hw-label">Viral Potential</span>
            <TrendingUp className="w-4 h-4 text-hw-accent" />
          </div>
          <div className="hw-display text-2xl">84%</div>
          <div className="text-[10px] text-hw-muted mt-2">Based on current trends</div>
        </div>
        <div className="hw-panel p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="hw-label">Active Creators</span>
            <Users className="w-4 h-4 text-hw-accent" />
          </div>
          <div className="hw-display text-2xl">24</div>
          <div className="text-[10px] text-hw-muted mt-2">Connected to your studio</div>
        </div>
      </div>

      <div className="hw-panel p-6">
        <h3 className="hw-label mb-6">Content Performance Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2e93" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff2e93" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8e9299" fontSize={12} />
              <YAxis stroke="#8e9299" fontSize={12} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#ff2e93' }}
              />
              <Area type="monotone" dataKey="viral" stroke="#ff2e93" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

AnalyticsView.displayName = 'AnalyticsView';

export default AnalyticsView;
