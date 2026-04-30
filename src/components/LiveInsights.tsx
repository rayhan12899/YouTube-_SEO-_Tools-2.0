import React, { memo } from 'react';
import { Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveInsightsProps {
  insights: string[];
  loading: boolean;
  t: any;
}

const LiveInsights = memo(({ insights, loading, t }: LiveInsightsProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-xl bg-hw-accent/5 border border-hw-accent/10 flex items-start gap-4 group hover:bg-hw-accent/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-hw-accent/20 flex items-center justify-center shrink-0 mt-0.5">
             <Lightbulb size={16} className="text-hw-accent" />
          </div>
          <p className="text-sm text-white/90 font-medium leading-relaxed group-hover:text-hw-accent transition-colors">
            {insight}
          </p>
        </motion.div>
      ))}
    </div>
  );
});

LiveInsights.displayName = 'LiveInsights';

export default LiveInsights;
