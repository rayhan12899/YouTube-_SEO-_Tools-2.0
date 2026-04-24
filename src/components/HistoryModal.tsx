import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trash2, Copy, Download, Clock, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  onClear: () => void;
  onCopy: (text: string) => void;
  onDownload: (item: any) => void;
  uiLang: 'en' | 'bn';
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterChange: (val: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClear,
  onCopy,
  onDownload,
  uiLang,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-black/80 border border-white/10 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">
                    {uiLang === 'en' ? "Neural Archives" : "আর্কাইভস"}
                  </h2>
                  <p className="text-[10px] text-hw-muted uppercase tracking-[0.2em] mt-1 font-bold">
                    Chronological Log of Generated Assets
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hw-muted" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={uiLang === 'en' ? "Search archives..." : "আর্কাইভস খুঁজুন..."}
                    className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 focus:border-hw-accent/50 outline-none transition-all w-full md:w-64"
                  />
                </div>
                
                <select 
                  value={filterType}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white font-black uppercase tracking-widest outline-none focus:border-hw-accent/50 transition-all cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="idea">Ideas</option>
                  <option value="image">Images</option>
                  <option value="video">Prompts</option>
                  <option value="voice">Voice</option>
                </select>

                {history.length > 0 && (
                  <button 
                    onClick={onClear}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all transform active:scale-95"
                  >
                    <Trash2 size={14} /> {uiLang === 'en' ? "Purge" : "মুছুন"}
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Clock size={32} />
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] font-black text-white/50">NO ARCHIVES FOUND</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-hw-accent/30 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-4 flex-1 pr-6">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-hw-accent/20 text-hw-accent text-[8px] font-black uppercase tracking-widest rounded-md border border-hw-accent/20">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-white/30 font-bold">
                              {format(item.timestamp, 'MMM dd, HH:mm:ss')}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-relaxed uppercase tracking-tight">
                            {item.topic}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                             onClick={() => onCopy(JSON.stringify(item.result, null, 2))}
                             className="p-3 rounded-xl bg-black/40 text-hw-muted hover:text-hw-accent hover:bg-hw-accent/10 transition-all"
                             title="Copy Data"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                             onClick={() => onDownload(item)}
                             className="p-3 rounded-xl bg-black/40 text-hw-muted hover:text-hw-accent hover:bg-hw-accent/10 transition-all"
                             title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-hw-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(HistoryModal);
