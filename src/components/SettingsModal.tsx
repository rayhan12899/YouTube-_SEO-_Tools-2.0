import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, X, Moon, Sun, Rocket, Palette, Zap, RefreshCw, Key, Save, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { AIProvider } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiLang: 'en' | 'bn';
  theme: 'dark' | 'light' | 'scifi';
  setTheme: (theme: 'dark' | 'light' | 'scifi') => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  connectionStatus: Record<string, string>;
  testingConnection: Record<string, boolean>;
  testConnection: (p: AIProvider) => void;
  customGeminiKey: string;
  setCustomGeminiKey: (val: string) => void;
  customOpenaiKey: string;
  setCustomOpenaiKey: (val: string) => void;
  customGroqKey: string;
  setCustomGroqKey: (val: string) => void;
  customDeepseekKey: string;
  setCustomDeepseekKey: (val: string) => void;
  customPerplexityKey: string;
  setCustomPerplexityKey: (val: string) => void;
  customGemmaKey: string;
  setCustomGemmaKey: (val: string) => void;
  customOpenrouterKey: string;
  setCustomOpenrouterKey: (val: string) => void;
  setConnectionStatus: any;
  saveAIConfig: () => void;
  resetAIConfig: () => void;
  downloadHistory: () => void;
  deferredPrompt: any;
  installApp: () => void;
  clearHistory: () => void;
  t: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  uiLang,
  theme,
  setTheme,
  aiProvider,
  setAiProvider,
  connectionStatus,
  testingConnection,
  testConnection,
  customGeminiKey,
  setCustomGeminiKey,
  customOpenaiKey,
  setCustomOpenaiKey,
  customGroqKey,
  setCustomGroqKey,
  customDeepseekKey,
  setCustomDeepseekKey,
  customPerplexityKey,
  setCustomPerplexityKey,
  customGemmaKey,
  setCustomGemmaKey,
  customOpenrouterKey,
  setCustomOpenrouterKey,
  setConnectionStatus,
  saveAIConfig,
  resetAIConfig,
  downloadHistory,
  deferredPrompt,
  installApp,
  clearHistory,
  t
}) => {
  const providers = useMemo(() => ['gemini', 'openai', 'groq', 'deepseek', 'perplexity', 'gemma', 'openrouter'] as AIProvider[], []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-black/80 border border-white/10 rounded-[2rem] p-6 sm:p-8 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hw-accent to-transparent" />
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <Globe size={24} />
                  </div>
                  <span>{t.settings}</span>
                </h2>
                <button 
                  onClick={onClose}
                  className="p-3 text-white/50 hover:text-hw-accent transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2 px-1">
                    <Palette size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Appearance Theme" : "অ্যাপিয়ারেন্স থিম"}
                  </label>
                  <div className="grid grid-cols-3 gap-4 p-2 bg-black/40 rounded-[1.5rem] border border-white/10 shadow-inner">
                    {[
                      { id: 'dark', label: uiLang === 'en' ? 'Dark' : 'ডার্ক', icon: Moon },
                      { id: 'light', label: uiLang === 'en' ? 'Light' : 'লাইট', icon: Sun },
                      { id: 'scifi', label: uiLang === 'en' ? 'Sci-Fi' : 'সাই-ফাই', icon: Rocket }
                    ].map((themeBtn) => (
                      <motion.button
                        key={themeBtn.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(themeBtn.id as any)}
                        className={cn(
                          "relative py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 z-10",
                          theme === themeBtn.id ? "text-black" : "text-white/50 hover:text-white"
                        )}
                      >
                        {theme === themeBtn.id && (
                          <motion.div
                            layoutId="activeTheme"
                            className="absolute inset-0 bg-hw-accent rounded-2xl -z-10 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <themeBtn.icon size={20} className={cn(
                          "transition-all duration-500",
                          theme === themeBtn.id ? "scale-110" : "scale-100"
                        )} />
                        {themeBtn.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2 px-1">
                      <Zap size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Manage API Keys" : "এপিআই কী ম্যানেজমেন্ট"}
                    </label>
                    
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {providers.map((p) => (
                        <div key={p} className="p-6 rounded-[1.5rem] bg-black/40 border border-white/10 space-y-5 group hover:border-hw-accent/30 transition-all shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase tracking-widest shadow-inner",
                                aiProvider === p ? "bg-hw-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]" : "bg-white/5 text-white/50"
                              )}>
                                {p.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">{p === 'groq' ? 'Groq' : p === 'perplexity' ? 'Perplexity' : p === 'gemma' ? 'Gemma' : p === 'openrouter' ? 'OpenRouter' : p}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    connectionStatus[p] === 'connected' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                                    connectionStatus[p] === 'testing' ? "bg-blue-500 animate-pulse" :
                                    connectionStatus[p] === 'error' ? "bg-red-500" : "bg-white/20"
                                  )} />
                                  <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest",
                                    connectionStatus[p] === 'connected' ? "text-green-500" : 
                                    connectionStatus[p] === 'testing' ? "text-blue-500" :
                                    connectionStatus[p] === 'error' ? "text-red-500" : "text-white/50"
                                  )}>
                                    {connectionStatus[p]}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => testConnection(p)}
                                disabled={testingConnection[p]}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-hw-accent hover:border-hw-accent/30 transition-all disabled:opacity-50"
                              >
                                {testingConnection[p] ? <RefreshCw size={14} className="animate-spin" /> : "Test"}
                              </button>
                              <button
                                onClick={() => setAiProvider(p)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                  aiProvider === p ? "bg-hw-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" : "bg-white/5 text-white/50 hover:text-white"
                                )}
                              >
                                {aiProvider === p ? "Active" : "Select"}
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            <input 
                              type="password" 
                              placeholder={`${p.toUpperCase()} API Key...`}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-hw-accent/50 transition-all text-white placeholder:text-white/30 shadow-inner"
                              value={
                                p === 'gemini' ? customGeminiKey : 
                                p === 'openai' ? customOpenaiKey : 
                                p === 'groq' ? customGroqKey :
                                p === 'deepseek' ? customDeepseekKey :
                                p === 'perplexity' ? customPerplexityKey :
                                p === 'gemma' ? customGemmaKey :
                                customOpenrouterKey
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (p === 'gemini') setCustomGeminiKey(val);
                                else if (p === 'openai') setCustomOpenaiKey(val);
                                else if (p === 'groq') setCustomGroqKey(val);
                                else if (p === 'deepseek') setCustomDeepseekKey(val);
                                else if (p === 'perplexity') setCustomPerplexityKey(val);
                                else if (p === 'gemma') setCustomGemmaKey(val);
                                else if (p === 'openrouter') setCustomOpenrouterKey(val);
                                
                                setConnectionStatus((prev: any) => ({ ...prev, [p]: val ? 'connected' : 'disconnected' }));
                              }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                              <Key size={14} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-[10px] text-white/40 italic leading-relaxed px-1">
                      {t.apiNote}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
                  <button 
                    onClick={saveAIConfig}
                    className="w-full py-5 rounded-[1.5rem] bg-hw-accent text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Save size={20} />
                    {uiLang === 'en' ? "Save Configuration" : "কনফিগারেশন সেভ করুন"}
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
                  >
                    {uiLang === 'en' ? "Close Settings" : "সেটিংস বন্ধ করুন"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={resetAIConfig}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center gap-3"
                  >
                    <RefreshCw size={16} /> {uiLang === 'en' ? "Reset Default" : "ডিফল্ট রিসেট"}
                  </button>

                  <button 
                    onClick={downloadHistory}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black text-[10px] uppercase tracking-widest hover:bg-hw-accent/10 hover:text-hw-accent hover:border-hw-accent/30 transition-all flex items-center justify-center gap-3"
                  >
                    <Download size={16} /> {uiLang === 'en' ? "Export Data" : "ডেটা এক্সপোর্ট"}
                  </button>
                </div>

                {deferredPrompt && (
                  <button 
                    onClick={installApp}
                    className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Download size={22} /> {uiLang === 'en' ? "Install as App" : "অ্যাপ হিসেবে ইনস্টল করুন"}
                  </button>
                )}

                <button 
                  onClick={clearHistory}
                  className="w-full py-4 text-[9px] uppercase tracking-[0.3em] font-black text-red-500/50 hover:text-red-500 transition-colors"
                >
                  {uiLang === 'en' ? "DESTROY LOCAL CACHE" : "লোকাল ক্যাশ মুছে ফেলুন"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SettingsModal);
