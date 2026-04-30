import React, { useState, useEffect, memo } from 'react';
import { Zap, Activity, Shield, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const SystemMetrics = memo(({ t }: { t: any }) => {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 62,
    noise: 12,
    uptime: "24:00:00"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.floor(35 + Math.random() * 30),
        memory: Math.floor(55 + Math.random() * 20),
        noise: Math.floor(2 + Math.random() * 10),
        uptime: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: t.processingPower || "AI Compute Power", value: `${metrics.cpu}%`, icon: Zap, color: "text-hw-accent" },
        { label: "Memory Usage", value: `${metrics.memory}%`, icon: Activity, color: "text-blue-400" },
        { label: t.threatLevel || "Noise interference", value: `${metrics.noise}dB`, icon: Shield, color: "text-orange-400" },
        { label: t.uptime || "System Uptime", value: metrics.uptime, icon: Clock, color: "text-purple-400" }
      ].map((m, i) => (
        <div key={i} className="hw-panel p-4 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-3">
             <m.icon size={14} className={m.color} />
             <span className="hw-label text-[8px] truncate">{m.label}</span>
          </div>
          <div className="text-xl font-black text-white">{m.value}</div>
          <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
            <motion.div 
               animate={{ width: m.value.includes('%') ? m.value : '100%' }}
               className={cn("h-full", m.color.replace('text-', 'bg-'))} 
            />
          </div>
        </div>
      ))}
    </div>
  );
});

SystemMetrics.displayName = 'SystemMetrics';

export default SystemMetrics;
