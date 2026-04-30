import React, { useState, useMemo, useCallback, memo } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const InteractiveChecklist = memo(({ data }: { data: any }) => {
  const items = useMemo(() => Array.isArray(data) ? data : String(data).split('\n').filter(Boolean), [data]);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleItem = useCallback((idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  return (
    <div className="space-y-3 mt-4">
      {items.map((item, idx) => {
        const isChecked = completed[idx];
        const text = String(item).replace(/^[-*✓]\s*/, '').trim();
        if (!text) return null;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isChecked ? 0.6 : 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all duration-500 relative overflow-hidden group",
              isChecked ? "bg-black/20 border-green-500/30" : "bg-black/40 border-[var(--border-main)] hover:border-[var(--color-hw-accent)]/50"
            )}
            onClick={() => toggleItem(idx)}
          >
            {isChecked && (
              <motion.div 
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent origin-left z-0"
              />
            )}
            <div className={cn(
              "w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500",
              isChecked ? "border-green-500 bg-green-500 text-[var(--color-black)] scale-110 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "border-[var(--border-main)] text-transparent group-hover:border-[var(--color-hw-accent)]"
            )}>
              <AnimatePresence mode="popLayout">
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className={cn(
              "text-sm z-10 transition-all duration-500 flex-1 leading-relaxed", 
              isChecked ? "text-[var(--text-muted)] line-through" : "text-[var(--text-main)]"
            )}>
              {text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
});

InteractiveChecklist.displayName = 'InteractiveChecklist';

export default InteractiveChecklist;
