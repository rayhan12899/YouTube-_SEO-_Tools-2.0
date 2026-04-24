/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Creator Studio - Viral YouTube Content Generator
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Youtube, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Tag, 
  Type, 
  Sparkles, 
  Clock, 
  Calendar, 
  Upload, 
  History, 
  Trash2, 
  Copy, 
  Check,
  CheckCircle2,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Languages,
  Home,
  Download,
  LayoutDashboard,
  Zap,
  Lightbulb,
  Mic,
  Volume2,
  Palette,
  ScrollText,
  Facebook,
  Twitter,
  MessageCircle,
  Share2,
  RefreshCw,
  Globe,
  Key,
  User,
  Menu,
  X,
  AudioLines,
  Hash,
  LayoutTemplate,
  BookOpen,
  Star,
  Camera,
  Github,
  Moon,
  Sun,
  Rocket,
  Play,
  Film,
  Send,
  Quote,
  Shield,
  Users,
  MessageSquare,
  Eye,
  Info,
  CreditCard,
  Instagram,
  Linkedin,
  Repeat,
  Save,
  ArrowDownWideNarrow, 
  ArrowUpWideNarrow, 
  Lock,
  BarChart3,
  TrendingUp,
  Activity,
  MessageSquare as ChatIcon,
  Send as SendIcon,
  Users as UsersIcon,
  Expand,
  ArrowRight
} from 'lucide-react';
import { APP_CONFIG } from './config';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { translations } from './translations';
import { io, Socket } from 'socket.io-client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Initialize Socket.io
const socket: Socket = io();
import { 
  POPULAR_TOPICS,
  BEST_POSTING_TIMES, 
  PLATFORMS, 
  CONTENT_TYPES, 
  TONES, 
  VISUAL_STYLES, 
  AUDIENCE_TYPES,
  PACING_TYPES,
  NARRATIVE_STRATEGIES,
  PROMPT_ELEMENTS, 
  SCENE_PRESETS, 
  MODEL_INFO 
} from './constants';
import { 
  generateContent, 
  generatePromptsFromVideo,
  generateVideoIdeas, 
  generateYoutubeTitles,
  generateImage, 
  analyzeImage,
  generateVoiceOver, 
  generateVoiceExtractor,
  getTrendingTopics,
  GenerationOptions,
  AIProvider,
  updateAIConfig,
  resetAIConfig,
  callAI
} from './services/geminiService';

const TypewriterText = ({ text, className }: { text: string, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
      }
    }, 10); // Adjust speed here
    
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayedText}</span>;
};

const InteractiveChecklist = ({ data }: { data: any }) => {
  const items = Array.isArray(data) ? data : String(data).split('\n').filter(Boolean);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

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
};

interface HistoryItem {
  id: string;
  timestamp: number;
  topic: string;
  result: any;
  type: 'image-to-prompt' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'youtube' | 'shorts';
}

type ViewType = 'landing' | 'home' | 'youtube' | 'video' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'analyze' | 'transcribe' | 'shorts' | 'analytics' | 'longVideo';

// Constants moved to constants.ts

const AnalyticsView = ({ uiLang }: { uiLang: 'en' | 'bn' }) => {
  const data = [
    { name: 'Mon', views: 4000, viral: 2400 },
    { name: 'Tue', views: 3000, viral: 1398 },
    { name: 'Wed', views: 2000, viral: 9800 },
    { name: 'Thu', views: 2780, viral: 3908 },
    { name: 'Fri', views: 1890, viral: 4800 },
    { name: 'Sat', views: 2390, viral: 3800 },
    { name: 'Sun', views: 3490, viral: 4300 },
  ];

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
            <UsersIcon className="w-4 h-4 text-hw-accent" />
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
              <Area type="monotone" dataKey="views" stroke="#ff2e93" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CollaborationChat = ({ 
  messages, 
  onSendMessage, 
  roomId, 
  onJoinRoom, 
  isJoined,
  isOpen,
  onToggle
}: { 
  messages: any[], 
  onSendMessage: (text: string) => void, 
  roomId: string, 
  onJoinRoom: (id: string) => void,
  isJoined: boolean,
  isOpen: boolean,
  onToggle: () => void
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300",
      isOpen ? "w-80 h-[450px]" : "w-12 h-12"
    )}>
      {!isOpen ? (
        <button 
          onClick={onToggle}
          className="w-full h-full rounded-full bg-hw-accent flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <ChatIcon className="w-6 h-6 text-black" />
        </button>
      ) : (
        <div className="hw-panel w-full h-full flex flex-col">
          <div className="p-3 border-b border-hw-border flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-hw-accent" />
              <span className="hw-label">Studio Collaboration</span>
            </div>
            <button onClick={onToggle} className="text-hw-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isJoined ? (
            <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-4">
              <p className="text-xs text-hw-muted text-center">Enter a Room ID to start collaborating with other creators in real-time.</p>
              <input 
                type="text" 
                placeholder="Room ID (e.g. viral-video-1)" 
                className="hw-display w-full text-center"
                value={roomId}
                onChange={(e) => onJoinRoom(e.target.value)}
              />
              <button 
                onClick={() => onJoinRoom(roomId)}
                className="w-full py-2 bg-hw-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Join Studio
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.user === 'You' ? "ml-auto items-end" : "items-start"
                  )}>
                    <span className="text-[10px] text-hw-muted mb-1">{msg.user} • {msg.time}</span>
                    <div className={cn(
                      "p-2 rounded-lg text-sm",
                      msg.user === 'You' ? "bg-hw-accent text-white" : "bg-white/5 text-white"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-hw-border flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSendMessage(inputText);
                      setInputText('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    onSendMessage(inputText);
                    setInputText('');
                  }}
                  className="text-hw-accent hover:scale-110 transition-transform"
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [uiLang, setUiLang] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('uiLang');
    return (saved === 'en' || saved === 'bn') ? saved : 'en';
  });

  // Collaboration State
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<{user: string, text: string, time: string}[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, { user: data.user, text: data.message, time: new Date().toLocaleTimeString() }]);
    });

    socket.on('new-generation', (data) => {
      toast.info(`New ${data.type} shared by a collaborator!`);
      setResults(prev => ({ ...prev, [data.type]: data.result }));
    });

    return () => {
      socket.off('receive-message');
      socket.off('new-generation');
    };
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit('join-room', roomId);
      setIsJoined(true);
      toast.success(`Joined room: ${roomId}`);
    }
  };

  const sendMessage = (text: string) => {
    if (text && isJoined) {
      socket.emit('send-message', { roomId, message: text, user: 'Creator' });
      setMessages(prev => [...prev, { user: 'You', text, time: new Date().toLocaleTimeString() }]);
    }
  };

  const t = translations[uiLang];

  useEffect(() => {
    localStorage.setItem('uiLang', uiLang);
  }, [uiLang]);

  const [topics, setTopics] = useState<Record<ViewType, string>>({
    landing: '',
    home: '',
    youtube: '',
    video: '',
    idea: '',
    image: '',
    voice: '',
    voiceExtractor: '',
    promptGen: '',
    analyze: '',
    transcribe: '',
    shorts: '',
    analytics: '',
    longVideo: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [relatedIdeas, setRelatedIdeas] = useState<{title: string, description: string}[]>([]);

  const simulateProgress = () => {
    setLoadingProgress(0);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const next = prev + Math.random() * 5;
        setLoadingStep(Math.floor((next / 100) * t.loadingSteps.length));
        return next;
      });
    }, 500);
    return interval;
  };
  const [results, setResults] = useState<Record<ViewType, any>>({
    landing: null,
    home: null,
    youtube: null,
    video: null,
    idea: null,
    image: null,
    voice: null,
    voiceExtractor: null,
    promptGen: null,
    analyze: null,
    transcribe: null,
    shorts: null,
    analytics: null,
    longVideo: null
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest'>('newest');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'scifi'>('scifi');
  const [showContact, setShowContact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [customGeminiKey, setCustomGeminiKey] = useState('');
  const [customOpenaiKey, setCustomOpenaiKey] = useState('');
  const [customGroqKey, setCustomGroqKey] = useState('');
  const [customDeepseekKey, setCustomDeepseekKey] = useState('');
  const [customPerplexityKey, setCustomPerplexityKey] = useState('');
  const [customGemmaKey, setCustomGemmaKey] = useState('');
  const [customOpenrouterKey, setCustomOpenrouterKey] = useState('');
  const [testingConnection, setTestingConnection] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    openai: false,
    groq: false,
    deepseek: false,
    perplexity: false,
    gemma: false,
    openrouter: false
  });
  const [connectionStatus, setConnectionStatus] = useState<Record<AIProvider, 'connected' | 'disconnected' | 'testing' | 'error'>>({
    gemini: customGeminiKey ? 'connected' : 'disconnected',
    openai: customOpenaiKey ? 'connected' : 'disconnected',
    groq: customGroqKey ? 'connected' : 'disconnected',
    deepseek: customDeepseekKey ? 'connected' : 'disconnected',
    perplexity: customPerplexityKey ? 'connected' : 'disconnected',
    gemma: customGemmaKey ? 'connected' : 'disconnected',
    openrouter: customOpenrouterKey ? 'connected' : 'disconnected'
  });

  const testConnection = async (provider: AIProvider) => {
    const keyMap: Record<AIProvider, string> = {
      gemini: customGeminiKey,
      openai: customOpenaiKey,
      groq: customGroqKey,
      deepseek: customDeepseekKey,
      perplexity: customPerplexityKey,
      gemma: customGemmaKey,
      openrouter: customOpenrouterKey
    };

    const key = keyMap[provider];
    if (!key) {
      toast.error(uiLang === 'en' ? `Please enter an API key for ${provider.toUpperCase()}` : `${provider.toUpperCase()} এর জন্য একটি এপিআই কী লিখুন`);
      return;
    }

    setTestingConnection(prev => ({ ...prev, [provider]: true }));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      // Minimal request to test connection
      const { GoogleGenAI } = await import('@google/genai');
      const OpenAI = (await import('openai')).default;

      if (provider === 'gemini') {
        const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          config: {
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
          },
          contents: "hi",
        });
        if (response.text) {
          setConnectionStatus(prev => ({ ...prev, [provider]: 'connected' }));
          toast.success(uiLang === 'en' ? `Gemini Connected Successfully!` : `জেমিনি সফলভাবে কানেক্ট হয়েছে!`);
        }
      } else {
        const baseURLs: Record<string, string | undefined> = {
          groq: "https://api.groq.com/openai/v1",
          deepseek: "https://api.deepseek.com",
          perplexity: "https://api.perplexity.ai",
          gemma: "https://api.groq.com/openai/v1",
          openrouter: "https://openrouter.ai/api/v1"
        };
        const models: Record<string, string> = {
          openai: "gpt-4o",
          groq: "llama-3.3-70b-versatile",
          deepseek: "deepseek-chat",
          perplexity: "llama-3.1-sonar-large-128k-online",
          gemma: "google/gemma-4-31B-it",
          openrouter: "google/gemini-2.5-flash"
        };

        const client = new OpenAI({ 
          apiKey: key, 
          baseURL: baseURLs[provider],
          dangerouslyAllowBrowser: true 
        });

        const response = await client.chat.completions.create({
          model: models[provider],
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1
        });

        if (response.choices[0].message.content) {
          setConnectionStatus(prev => ({ ...prev, [provider]: 'connected' }));
          toast.success(uiLang === 'en' ? `${provider.toUpperCase()} Connected Successfully!` : `${provider.toUpperCase()} সফলভাবে কানেক্ট হয়েছে!`);
        }
      }
    } catch (error) {
      console.error(`Connection Test Error (${provider}):`, error);
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
      toast.error(uiLang === 'en' ? `Failed to connect to ${provider.toUpperCase()}. Check your key.` : `${provider.toUpperCase()} কানেক্ট করতে ব্যর্থ হয়েছে। কী চেক করুন।`);
    } finally {
      setTestingConnection(prev => ({ ...prev, [provider]: false }));
    }
  };
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['subject', 'camera']);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sceneAudioUrls, setSceneAudioUrls] = useState<Record<string, string>>({});
  const [loadingSceneAudio, setLoadingSceneAudio] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast.success(uiLang === 'en' ? "App installed successfully!" : "অ্যাপটি সফলভাবে ইনস্টল করা হয়েছে!");
    }
  };

  const [formOptions, setFormOptions] = useState(() => {
    const saved = localStorage.getItem('form_options');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved form options", e);
      }
    }
    return {
      platform: 'youtube',
      contentType: 'shorts',
      tone: 'professional',
      businessType: 'eCommerce / অনলাইন শপ',
      visualStyle: 'cinematic',
      cameraAngle: 'Wide',
      lighting: 'Natural',
      mood: 'Cinematic',
      customThumbnailElements: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('form_options', JSON.stringify(formOptions));
  }, [formOptions]);

  const menuVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };
  const [copied, setCopied] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<{topic: string, reason: string}[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  
  // Generation Toggles
  const [options, setOptions] = useState(() => {
    const saved = localStorage.getItem('gen_options');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved options", e);
      }
    }
    return {
      generateImagePrompt: true,
      generateVideoPrompt: true,
      generateThumbnail: true,
      generateDescription: true,
      generateTags: true,
      generateScript: true,
      generateSeoChecklist: true,
      generateKeywords: true,
      generateVoiceOver: true,
      language: 'bn' as 'bn' | 'en' | 'both' | 'hi',
      voice: 'Sumi' as any,
      voiceTone: 'Professional',
      voiceAccent: 'US',
      voiceAge: 'Adult',
      voiceGender: 'neutral',
      voiceLanguage: 'bn' as 'bn' | 'en' | 'hi',
      videoDuration: 60,
      scriptWordCount: 500,
      scriptCharacterCount: 1000,
      aspectRatio: '16:9' as '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2' | '21:9',
      promptCategory: 'Video' as 'Video' | 'Story' | 'Image' | 'Voice Over',
      cameraAngle: 'Wide',
      lighting: 'Natural',
      mood: 'Cinematic',
      audience: 'General',
      pacing: 'Steady',
      narrativeStrategy: 'Storytelling',
      deepSearch: false
    };
  });

  useEffect(() => {
    localStorage.setItem('gen_options', JSON.stringify(options));
  }, [options]);

  // Media to Prompt state
  const [selectedMedia, setSelectedMedia] = useState<Record<ViewType, string | null>>({
    landing: null,
    home: null,
    youtube: null,
    video: null,
    idea: null,
    image: null,
    voice: null,
    voiceExtractor: null,
    promptGen: null,
    transcribe: null,
    analyze: null,
    shorts: null,
    analytics: null,
    longVideo: null
  });
  const [mediaMimeType, setMediaMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTopic = topics[currentView];
  const currentResult = results[currentView];
  const currentSelectedMedia = selectedMedia[currentView];
  const acceptType = (currentView === 'video' || currentView === 'longVideo') ? "video/*" : (currentView === 'voiceExtractor' ? "audio/*,video/*" : (currentView === 'image' ? "video/*,image/*" : "image/*"));

  const filteredSuggestions = useMemo(() => {
    const query = currentTopic.trim().toLowerCase();
    const suggestions: { text: string, icon: string, isTrending: boolean }[] = [];
    
    // Add matching trending topics
    trendingTopics.forEach(t => {
      if (!query || t.topic.toLowerCase().includes(query)) {
        suggestions.push({ text: t.topic, icon: '🔥', isTrending: true });
      }
    });
    
    // Add matching popular topics
    POPULAR_TOPICS.forEach(t => {
      const text = uiLang === 'bn' ? t.bn : t.en;
      if (!query || text.toLowerCase().includes(query)) {
        suggestions.push({ text, icon: t.icon, isTrending: false });
      }
    });
    
    // Filter out exact matches to avoid showing suggestion for what's already typed
    const filtered = suggestions.filter(s => s.text.toLowerCase() !== query);
    
    // Remove duplicates based on text
    const unique = Array.from(new Map(filtered.map(item => [item.text, item])).values());
    
    return unique.slice(0, 8); // Limit to 8 suggestions
  }, [currentTopic, trendingTopics, uiLang]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const savedHistory = localStorage.getItem('yt_gen_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedProvider = localStorage.getItem('AI_PROVIDER') as AIProvider;
    if (savedProvider) setAiProvider(savedProvider);
    
    const savedGeminiKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY');
    if (savedGeminiKey) setCustomGeminiKey(savedGeminiKey);
    
    const savedOpenaiKey = localStorage.getItem('CUSTOM_OPENAI_API_KEY');
    if (savedOpenaiKey) setCustomOpenaiKey(savedOpenaiKey);
    
    const savedGroqKey = localStorage.getItem('CUSTOM_GROQ_API_KEY');
    if (savedGroqKey) setCustomGroqKey(savedGroqKey);

    const savedDeepseekKey = localStorage.getItem('CUSTOM_DEEPSEEK_API_KEY');
    if (savedDeepseekKey) setCustomDeepseekKey(savedDeepseekKey);

    const savedPerplexityKey = localStorage.getItem('CUSTOM_PERPLEXITY_API_KEY');
    if (savedPerplexityKey) setCustomPerplexityKey(savedPerplexityKey);

    const savedGemmaKey = localStorage.getItem('CUSTOM_GEMMA_API_KEY');
    if (savedGemmaKey) setCustomGemmaKey(savedGemmaKey);

    const savedTheme = localStorage.getItem('app_theme') as 'dark' | 'light' | 'scifi';
    if (savedTheme) setTheme(savedTheme);
    else setTheme('scifi');

    // Handle extension API connection
    const params = new URLSearchParams(window.location.search);
    const ytUrl = params.get('yt_url');
    const ytTitle = params.get('yt_title');
    const ytChannel = params.get('yt_channel');
    
    const pageUrl = params.get('page_url');
    const pageTitle = params.get('page_title');
    const pageDesc = params.get('page_desc');
    
    if (ytUrl) {
      let topic = ytUrl;
      if (ytTitle && ytChannel) {
        topic = `${ytTitle} (by ${ytChannel}) - ${ytUrl}`;
      } else if (ytTitle) {
        topic = `${ytTitle} - ${ytUrl}`;
      }
      
      setTopics(prev => ({ 
        ...prev, 
        youtube: topic, 
        video: topic, 
        idea: topic,
        home: topic
      }));
      setCurrentView('youtube');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      setTimeout(() => {
        toast.success(uiLang === 'en' ? "YouTube Video Connected!" : "ইউটিউব ভিডিও কানেক্ট হয়েছে!");
      }, 500);
    } else if (pageUrl) {
      let topic = `Analyze this webpage:\nURL: ${pageUrl}`;
      if (pageTitle) topic += `\nTitle: ${pageTitle}`;
      if (pageDesc) topic += `\nContext: ${pageDesc}`;
      
      setTopics(prev => ({ 
        ...prev, 
        youtube: topic, 
        video: topic, 
        idea: topic,
        home: topic
      }));
      setCurrentView('idea'); // Default to viral ideas for general webpages
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      setTimeout(() => {
        toast.success(uiLang === 'en' ? "Webpage Connected! Ready for AI Analysis." : "ওয়েবপেজ কানেক্ট হয়েছে! এআই বিশ্লেষণের জন্য প্রস্তুত।");
      }, 500);
    }
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light', 'theme-scifi');
    if (theme !== 'dark') {
      body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (showSettings || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSettings, isMobileMenuOpen]);

  const isApiConnected = !!(
    aiProvider === 'gemini' ? customGeminiKey : 
    aiProvider === 'openai' ? customOpenaiKey : 
    aiProvider === 'groq' ? customGroqKey :
    aiProvider === 'deepseek' ? customDeepseekKey :
    customPerplexityKey
  );

  useEffect(() => {
    if (trendingTopics.length === 0) {
      const fetchTrends = async () => {
        setLoadingTrends(true);
        try {
          const res = await getTrendingTopics(uiLang);
          setTrendingTopics(res.trending || []);
        } catch (error) {
          console.error("Failed to fetch trends:", error);
        } finally {
          setLoadingTrends(false);
        }
      };
      fetchTrends();
    }
  }, [uiLang]);

  const saveToHistory = (topic: string, result: any, type: 'image-to-prompt' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'youtube' | 'shorts') => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      topic,
      result,
      type
    };
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('yt_gen_history', JSON.stringify(updatedHistory));
  };

  const handleSceneVoiceOver = async (sceneIdx: number, text: string) => {
    setLoadingSceneAudio(`scene-${sceneIdx}`);
    try {
      const audioUrl = await generateVoiceOver(text, options.voice, {
        tone: options.voiceTone,
        accent: options.voiceAccent,
        age: options.voiceAge,
        gender: options.voiceGender
      });
      if (audioUrl) {
        setSceneAudioUrls(prev => ({ ...prev, [`scene-${sceneIdx}`]: audioUrl }));
        toast.success(uiLang === 'en' ? `Voiceover for Scene ${sceneIdx + 1} ready!` : `সীন ${sceneIdx + 1}-এর ভয়েসওভার তৈরি!`);
      } else {
        toast.error(uiLang === 'en' ? "Failed to generate voiceover." : "ভয়েসওভার তৈরি করতে ব্যর্থ হয়েছে।");
      }
    } catch (error) {
      console.error("Scene Voiceover Error:", error);
      toast.error(uiLang === 'en' ? "Error generating voiceover." : "ভয়েসওভার তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setLoadingSceneAudio(null);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Sound play failed:", e));
  };

  const handleGenerate = async () => {
    setRelatedIdeas([]);
    
    let activeView = currentView;
    let activeTopic = currentTopic;

    // If on home page and promptGen topic is filled, switch to promptGen logic
    if (currentView === 'home' && topics.promptGen.trim()) {
      activeView = 'promptGen';
      activeTopic = topics.promptGen;
      setCurrentView('promptGen');
    }

    if (!activeTopic && !currentSelectedMedia) {
      if (activeView === 'idea') {
        toast.error(t.enterNiche);
      } else if (activeView === 'image') {
        toast.error(t.enterImage);
      } else if (activeView === 'voice') {
        toast.error(t.enterVoice);
      } else if (activeView === 'voiceExtractor') {
        toast.error(uiLang === 'en' ? "Please upload an audio or video file first." : "অনুগ্রহ করে প্রথমে একটি অডিও বা ভিডিও ফাইল আপলোড করুন।");
      } else {
        toast.error(uiLang === 'en' ? "Please enter a topic or upload media." : "অনুগ্রহ করে একটি বিষয় লিখুন বা মিডিয়া আপলোড করুন।");
      }
      return;
    }
    setLoading(true);
    setLoadingProgress(10);
    setLoadingStep(0); // Analyzing...
    let progressInterval: NodeJS.Timeout | null = null;
    
    // Revoke previous audio URL if it exists to prevent memory leaks
    if (currentResult?.audioUrl && currentResult.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentResult.audioUrl);
    }

    setResults(prev => ({ ...prev, [activeView]: null }));
    try {
      if (activeView === 'idea') {
        setLoadingStep(1); // Researching...
        setLoadingProgress(30);
        const res = await generateVideoIdeas(activeTopic, options.language);
        setResults(prev => ({ ...prev, [activeView]: res }));
        saveToHistory(activeTopic, res, 'idea');
        toast.success(t.ideaGenHistory + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
        playNotificationSound();
      } else if (activeView === 'shorts') {
        setLoadingStep(2); // Generating script...
        setLoadingProgress(50);
        const res = await generateContent({
          topic: activeTopic,
          ...options,
          generateScript: true,
          generateImagePrompt: false,
          generateVideoPrompt: false,
          generateThumbnail: false,
          generateDescription: false,
          generateTags: false,
          generateSeoChecklist: false,
          generateKeywords: false,
          contentType: 'shorts'
        });

        // Auto-generate Voice Over if enabled
        if (options.generateVoiceOver && res.script) {
          try {
            const cleanScript = res.script.replace(/\[Scene.*?\]/g, '').replace(/Host:|Narrator:/g, '').trim();
            const audioUrl = await generateVoiceOver(cleanScript, options.voice, {
              tone: options.voiceTone,
              accent: options.voiceAccent,
              age: options.voiceAge,
              gender: options.voiceGender,
              voiceLanguage: options.voiceLanguage
            });
            if (audioUrl) {
              res.audioUrl = audioUrl;
            }
          } catch (vError) {
            console.error("Auto Voice Over Failed:", vError);
          }
        }

        setResults(prev => ({ ...prev, [activeView]: res }));
        saveToHistory(activeTopic, res, 'shorts');
        toast.success(uiLang === 'en' ? "Shorts Script Generated!" : "শর্টস স্ক্রিপ্ট তৈরি হয়েছে!");
        playNotificationSound();
      } else if (activeView === 'image') {
        if (currentSelectedMedia) {
          setLoadingStep(2); // Generating...
          setLoadingProgress(40);
          if (mediaMimeType.startsWith('video/')) {
            const res = await generatePromptsFromVideo(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood, formOptions.lighting);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Video Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
          } else {
            const res = await analyzeImage(currentSelectedMedia, mediaMimeType, options.language);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Image Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Image Extraction & Analysis" : "ইমেজ এক্সট্র্যাকশন ও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
          }
        } else {
            setLoadingStep(2); // Generating...
            setLoadingProgress(40);
            const res = await generateImage(activeTopic, options.aspectRatio as any);
            setResults(prev => ({ ...prev, [activeView]: { imageUrl: res } }));
            saveToHistory(activeTopic, { imageUrl: res }, 'image');
            toast.success(t.imageGenHistory + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
        }
      } else if (activeView === 'promptGen') {
        setLoadingStep(2);
        setLoadingProgress(40);
        const prompt = `তুমি একজন প্রম্পট ইঞ্জিনিয়ারিং এক্সপার্ট। আমাকে ${activeTopic} বিষয়ের উপর ${options.promptCategory} তৈরির জন্য ৩টি সম্পূর্ণ নতুন, ইউনিক এবং সৃজনশীল প্রম্পট তৈরি করে দাও। 
        
প্রম্পটগুলো অবশ্যই বাংলায় হতে হবে।

গুরুত্বপূর্ণ শর্ত: 
১. প্রম্পটগুলো যেন একে অপরের থেকে সম্পূর্ণ আলাদা হয়।
২. নিচে দেওয়া পূর্ববর্তী প্রম্পটগুলোর সাথে যেন কোনোভাবেই মিল না থাকে। সম্পূর্ণ নতুন আইডিয়া ব্যবহার করবে।
৩. প্রতিটি প্রম্পট বিস্তারিত এবং ব্যবহারযোগ্য হতে হবে।
৪. প্রম্পটগুলো এমনভাবে লিখবে যেন সেগুলো সরাসরি কোনো AI টুল (যেমন: Midjourney, ChatGPT, ElevenLabs, Runway) এ ব্যবহার করা যায়।

পূর্ববর্তী প্রম্পট (এগুলো এড়িয়ে চলো):
${history.filter(h => h.type === 'promptGen').map(h => h.result?.prompts || []).flat().slice(-30).map((p: string, i: number) => `${i+1}. ${p}`).join('\n') || 'কোনো পূর্ববর্তী প্রম্পট নেই।'}
        
Return the result as a JSON object with a key 'prompts' which is an array of strings.`;
        const { Type } = await import('@google/genai');
        
        const responseText = await callAI(prompt, 'application/json', 3, {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              }
            }
          }
        });
        
        const parsed = JSON.parse(responseText || '{"prompts": []}');
        setResults(prev => ({ ...prev, [activeView]: parsed }));
        saveToHistory(activeTopic, parsed, 'promptGen');
        toast.success(t.promptGen + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
        playNotificationSound();
      } else if (activeView === 'voice') {
        setLoadingStep(2); // Generating...
        setLoadingProgress(40);
        const res = await generateVoiceOver(activeTopic, options.voice, {
          tone: options.voiceTone,
          accent: options.voiceAccent,
          age: options.voiceAge,
          gender: options.voiceGender
        });
        setResults(prev => ({ ...prev, [activeView]: { audioUrl: res } }));
        saveToHistory(activeTopic, { audioUrl: res }, 'voice');
        toast.success(t.voiceGenHistory + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
        playNotificationSound();
      } else if (activeView === 'voiceExtractor') {
        if (currentSelectedMedia && (mediaMimeType.startsWith('audio/') || mediaMimeType.startsWith('video/'))) {
          setLoadingStep(3); // Optimizing...
          setLoadingProgress(60);
          const targetLang = options.language === 'both' ? 'bn' : options.language as 'en' | 'bn' | 'hi';
          const res = await generateVoiceExtractor(currentSelectedMedia, mediaMimeType, targetLang);
          setResults(prev => ({ ...prev, [activeView]: res }));
          saveToHistory(activeTopic || "Media Analysis", res, 'voiceExtractor');
          const msg = mediaMimeType.startsWith('video/') ? (uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") : (uiLang === 'en' ? "Audio Analysis" : "অডিও বিশ্লেষণ");
          toast.success(msg + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
          playNotificationSound();
        } else {
          toast.error(uiLang === 'en' ? "Please upload an audio or video file first." : "অনুগ্রহ করে প্রথমে একটি অডিও বা ভিডিও ফাইল আপলোড করুন।");
          setLoading(false);
          return;
        }
      } else if (activeView === 'video' || activeView === 'longVideo') {
        if (currentSelectedMedia) {
          setLoadingStep(2); // Generating...
          setLoadingProgress(40);
          // If it's a video file
          if (mediaMimeType.startsWith('video/')) {
            const res = await generatePromptsFromVideo(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood, formOptions.lighting);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Video Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
          } else {
            const res = await analyzeImage(currentSelectedMedia, mediaMimeType, options.language);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Image Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Image Extraction & Analysis" : "ইমেজ এক্সট্র্যাকশন ও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
          }
        } else {
          setLoadingStep(2); // Generating...
          setLoadingProgress(40);
          const res = await generateContent({
            topic: activeTopic,
            ...options,
            ...formOptions,
            generateVideoPrompt: true,
            generateImagePrompt: false,
            generateThumbnail: false,
            generateDescription: false,
            generateTags: false,
            generateScript: true
          });

          // Auto-generate Voice Over if enabled
          if (options.generateVoiceOver && res.script) {
            try {
              const cleanScript = res.script.replace(/\[Scene.*?\]/g, '').replace(/Host:|Narrator:/g, '').trim();
              const audioUrl = await generateVoiceOver(cleanScript, options.voice, {
                tone: options.voiceTone,
                accent: options.voiceAccent,
                age: options.voiceAge,
                gender: options.voiceGender,
                voiceLanguage: options.voiceLanguage
              });
              if (audioUrl) {
                res.audioUrl = audioUrl;
              }
            } catch (vError) {
              console.error("Auto Voice Over Failed:", vError);
            }
          }

          setResults(prev => ({ ...prev, [activeView]: res }));
          saveToHistory(activeTopic, res, 'youtube');
          toast.success((uiLang === 'en' ? "YouTube Content" : "ইউটিউব কন্টেন্ট") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
          playNotificationSound();
        }
      } else {
        const res = await generateContent({
          topic: activeTopic,
          ...options,
          ...formOptions
        });

        // Auto-generate Voice Over if enabled
        if (options.generateVoiceOver && res.script) {
          try {
            const cleanScript = res.script.replace(/\[Scene.*?\]/g, '').replace(/Host:|Narrator:/g, '').trim();
            const audioUrl = await generateVoiceOver(cleanScript, options.voice, {
              tone: options.voiceTone,
              accent: options.voiceAccent,
              age: options.voiceAge,
              gender: options.voiceGender,
              voiceLanguage: options.voiceLanguage
            });
            if (audioUrl) {
              res.audioUrl = audioUrl;
            }
          } catch (vError) {
            console.error("Auto Voice Over Failed:", vError);
          }
        }

        setResults(prev => ({ ...prev, [activeView]: res }));
        saveToHistory(activeTopic, res, 'youtube');
        toast.success((uiLang === 'en' ? "YouTube Content" : "ইউটিউব কন্টেন্ট") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
        playNotificationSound();
        
        // Fetch related ideas
        const ideasRes = await generateVideoIdeas(activeTopic, options.language);
        setRelatedIdeas(ideasRes.ideas || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.failed);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep(0);
      }, 500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB for stability with inlineData)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(uiLang === 'en' ? "File too large. Please upload a file smaller than 10MB for analysis." : "ফাইলটি অনেক বড়। বিশ্লেষণের জন্য অনুগ্রহ করে ১০ মেগাবাইটের চেয়ে ছোট ফাইল আপলোড করুন।");
        return;
      }
      setMediaMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSelectedMedia(prev => ({ ...prev, [currentView]: base64 }));
        setTopics(prev => ({ ...prev, [currentView]: '' }));
        
        if (currentView === 'image' || currentView === 'video' || currentView === 'longVideo' || currentView === 'voiceExtractor') {
          setLoading(true);
          const progressInterval = simulateProgress();
          try {
            let res;
            if (currentView === 'voiceExtractor') {
              res = await generateVoiceExtractor(base64, file.type, options.language as 'en' | 'bn' | 'hi');
              const msg = file.type.startsWith('video/') ? (uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") : (uiLang === 'en' ? "Audio Analysis" : "অডিও বিশ্লেষণ");
              toast.success(msg + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            } else if (file.type.startsWith('video/')) {
              res = await generatePromptsFromVideo(base64, file.type, options.language, currentTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood, formOptions.lighting);
              toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            } else {
              res = await analyzeImage(base64, file.type, options.language);
              toast.success((uiLang === 'en' ? "Image Extraction & Analysis" : "ইমেজ এক্সট্র্যাকশন ও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            }
            setResults(prev => ({ ...prev, [currentView]: res }));
          } catch (error) {
            console.error(error);
            toast.error(t.failed);
          } finally {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setTimeout(() => {
              setLoading(false);
              setLoadingProgress(0);
              setLoadingStep(0);
            }, 500);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const shareScript = async (platform: string, text: string) => {
    const topic = currentTopic || "YouTube Script";
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: `YouTube Script: ${topic}`,
          text: `Check out this YouTube script for "${topic}":\n\n${text.substring(0, 200)}...`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        console.error("Share failed:", err);
      }
    }

    const encodedText = encodeURIComponent(`Check out this YouTube script for "${topic}":\n\n`);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = "";
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const downloadPdf = async () => {
    if (!currentResult) {
      toast.error(t.noContent);
      return;
    }
    
    setLoading(true);
    const progressInterval = simulateProgress();
    try {
      // Import html2pdf.js dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a temporary element to render the content
      const element = document.createElement('div');
      element.className = 'pdf-content-wrapper';
      element.style.padding = '20px';
      element.style.color = '#1a1a1a';
      element.style.backgroundColor = '#ffffff';
      element.style.fontFamily = "'SolaimanLipi', 'Inter', sans-serif";
      element.style.width = '180mm'; // Adjusted for A4 width (210mm) minus margins
      element.style.boxSizing = 'border-box';
      element.style.lineHeight = '1.6';
      element.style.wordBreak = 'break-word';
      
      // Add content to the element
      let contentHtml = `
        <style>
          * {
            color-scheme: light !important;
            -webkit-print-color-adjust: exact;
          }
          body, div, h1, h2, p, li, strong, ul {
            color: #333 !important;
            background-color: transparent !important;
            border-color: #eee !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
        </style>
        <div style="border-bottom: 2px solid #00E5FF; padding-bottom: 20px; margin-bottom: 30px; box-sizing: border-box !important;">
          <h1 style="color: #00E5FF !important; margin: 0; font-size: 32px; box-sizing: border-box !important;">YouTube AI Content Report</h1>
          <p style="color: #666 !important; margin: 10px 0 0 0; box-sizing: border-box !important;">Topic: ${currentTopic || "Generated Content"}</p>
          <p style="color: #666 !important; margin: 5px 0 0 0; box-sizing: border-box !important;">Date: ${format(new Date(), 'dd MMM, yyyy HH:mm')}</p>
        </div>
      `;

      const labelMap: any = {
        summary: uiLang === 'en' ? "Summary" : "সারাংশ",
        translatedText: uiLang === 'en' ? "Transcribed & Translated Text" : "ট্রান্সক্রাইব এবং অনুবাদিত টেক্সট",
        imagePrompt: t.imagePromptLabel,
        videoPrompt: t.videoPromptLabel,
        thumbnailIdea: t.thumbnailLabel,
        description: t.descLabel,
        tags: t.tagsLabel,
        script: t.scriptLabel,
        seoChecklist: t.seoChecklistLabel,
        keywords: t.keywordsLabel,
        socialMedia: uiLang === 'en' ? "Social Media Captions" : "সোশ্যাল মিডিয়া ক্যাপশন",
        repurposeAddons: uiLang === 'en' ? "Repurposing Ideas" : "রিপারপাসিং আইডিয়া",
      };

      if (currentResult.prompts) {
        contentHtml += `
          <div style="margin-bottom: 30px; background-color: transparent !important; box-sizing: border-box !important;">
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #00E5FF !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Unique Prompts</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.prompts.map((prompt: string, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #00E5FF !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Option ${i + 1}</strong>
                  <p style="margin: 0 !important; font-size: 14px !important; color: #444444 !important; background-color: transparent !important; white-space: pre-wrap !important;">${prompt}</p>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }

      if (currentResult.ideas) {
        contentHtml += `
          <div style="margin-bottom: 30px; background-color: transparent !important; box-sizing: border-box !important;">
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #00E5FF !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Viral Video Ideas</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.ideas.map((idea: any, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #00E5FF !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Idea ${i + 1}: ${idea.title}</strong>
                  <p style="margin: 0 !important; font-size: 14px !important; color: #444444 !important; background-color: transparent !important;">${idea.reason || idea.description}</p>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }

      Object.keys(labelMap).forEach(key => {
        if (currentResult[key]) {
          let content = '';
          if (key === 'keywords' && Array.isArray(currentResult[key])) {
            content = `
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px; box-sizing: border-box !important; table-layout: fixed;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; box-sizing: border-box !important; word-break: break-word !important; font-size: 14px;">Keyword</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; box-sizing: border-box !important; word-break: break-word !important; font-size: 14px;">Volume</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; box-sizing: border-box !important; word-break: break-word !important; font-size: 14px;">Competition</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentResult[key].map((kw: any) => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 10px; box-sizing: border-box !important; word-break: break-word !important; font-size: 12px; font-weight: bold; color: #00E5FF;">${kw.keyword}</td>
                      <td style="border: 1px solid #ddd; padding: 10px; box-sizing: border-box !important; word-break: break-word !important; font-size: 12px;">${kw.searchVolume}</td>
                      <td style="border: 1px solid #ddd; padding: 10px; box-sizing: border-box !important; word-break: break-word !important; font-size: 12px;">${kw.competition}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          } else if (key === 'socialMedia' && typeof currentResult[key] === 'object') {
            content = `
              <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                ${Object.entries(currentResult[key]).map(([sKey, sValue]) => `
                  <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
                    <strong style="text-transform: uppercase; font-size: 12px; color: #00E5FF;">${sKey}</strong>
                    <p style="margin-top: 8px; font-size: 14px; color: #444; line-height: 1.5; white-space: pre-wrap;">${String(sValue)}</p>
                  </div>
                `).join('')}
              </div>
            `;
          } else if (key === 'seoChecklist' && (Array.isArray(currentResult[key]) || typeof currentResult[key] === 'string')) {
            const list = Array.isArray(currentResult[key]) ? currentResult[key] : String(currentResult[key]).split('\n').filter(Boolean);
            content = `
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${list.map((item: string) => `<li style="margin-bottom: 8px; padding: 10px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #00E5FF; font-size: 13px; color: #333;">✓ ${item}</li>`).join('')}
              </ul>
            `;
          } else {
            content = currentResult[key];
          }

          contentHtml += `
            <div style="margin-bottom: 30px !important; page-break-inside: avoid !important; background-color: transparent !important; box-sizing: border-box !important;">
              <h2 style="color: #1a1a1a !important; border-left: 4px solid #00E5FF !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${labelMap[key]}</h2>
              <div style="padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; white-space: pre-wrap !important; font-size: 14px !important; color: #333333 !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                ${content}
              </div>
            </div>
          `;
        }
      });

      if (currentResult.metadata) {
        const mLabelMap: any = {
          title: uiLang === 'en' ? "Suggested Title" : "প্রস্তাবিত শিরোনাম",
          highCtrTitle: t.highCtrTitle,
          thumbnailTitle: t.thumbnailTitle,
          description: t.seoDescription,
          tags: t.tagsLabel,
          hashtags: t.hashtags,
        };

        Object.entries(currentResult.metadata).forEach(([mKey, mValue]) => {
          if (mValue) {
            const displayValue = Array.isArray(mValue) ? mValue.join(', ') : String(mValue);
            contentHtml += `
              <div style="margin-bottom: 30px !important; page-break-inside: avoid !important; background-color: transparent !important; box-sizing: border-box !important;">
                <h2 style="color: #1a1a1a !important; border-left: 4px solid #00E5FF !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${mLabelMap[mKey] || mKey}</h2>
                <div style="padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; white-space: pre-wrap !important; font-size: 14px !important; color: #333333 !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  ${displayValue}
                </div>
              </div>
            `;
          }
        });
      }

      if (currentResult.socialMedia && !labelMap.socialMedia) {
        // Fallback for social media if not in labelMap loop
      }

      if (currentResult.sceneBreakdown && Array.isArray(currentResult.sceneBreakdown)) {
        contentHtml += `
          <div style="margin-top: 40px; page-break-before: always;">
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #00E5FF !important; padding-left: 15px !important; margin-bottom: 25px !important; font-size: 22px !important;">Scene-by-Scene Production Breakdown</h2>
            ${currentResult.sceneBreakdown.map((scene: any, i: number) => `
              <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #eee; border-radius: 15px; background: #fff; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                  <strong style="color: #00E5FF; font-size: 16px;">Scene ${scene.scene || i + 1}</strong>
                  <span style="color: #666; font-size: 14px; font-weight: bold;">${scene.time || "0:00"}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 5px;">Script / Voiceover</strong>
                  <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0; white-space: pre-wrap;">${scene.script}</p>
                </div>
                <div style="padding-top: 10px; border-top: 1px dashed #eee;">
                  <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 5px;">Visual Prompt</strong>
                  <p style="font-size: 13px; color: #666; font-style: italic; margin: 0;">${scene.visual}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      element.innerHTML = contentHtml;
      
      // Options for html2pdf
      const opt = {
        margin: 10,
        filename: `AI_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true, 
          logging: false,
          onclone: (clonedDoc: Document) => {
            // Remove global stylesheets to avoid oklch parsing errors in html2canvas
            // We use inline styles with !important in our contentHtml so this is safe
            const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styleSheets.forEach(sheet => {
              // Keep the style tag we just added in contentHtml (it's inside the element we're printing)
              if (!sheet.closest('.pdf-content-wrapper')) {
                sheet.remove();
              }
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      // Generate PDF with a small delay to ensure rendering
      setTimeout(async () => {
        await html2pdf().from(element).set(opt).save();
      }, 500);
      toast.success(uiLang === 'en' ? "PDF Downloaded!" : "PDF ডাউনলোড সম্পন্ন হয়েছে!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error(uiLang === 'en' ? "Failed to generate PDF" : "PDF তৈরি করতে ব্যর্থ হয়েছে");
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep(0);
      }, 500);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success(t.copied);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareContent = async () => {
    if (!currentResult) return;
    
    let textToShare = "";
    if (currentResult.prompts) {
      textToShare = currentResult.prompts.map((p: string, idx: number) => `Option ${idx + 1}:\n${p}`).join('\n\n');
    } else if (currentResult.ideas) {
      textToShare = currentResult.ideas.map((i: any) => `${i.title}: ${i.description}`).join('\n\n');
    } else if (currentResult.script) {
      textToShare = currentResult.script;
    } else if (currentResult.description) {
      textToShare = currentResult.description;
    } else {
      textToShare = JSON.stringify(currentResult, null, 2);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YouTube AI Creator Studio Report',
          text: textToShare,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      copyToClipboard(textToShare, 'share');
      toast.info(uiLang === 'en' ? "Content copied to clipboard for sharing!" : "শেয়ার করার জন্য কন্টেন্ট ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yt_gen_history');
    toast.info(uiLang === 'en' ? "History Cleared" : "হিস্ট্রি মুছে ফেলা হয়েছে");
  };

  const handleRefresh = () => {
    setTopics({
      landing: '',
      home: '',
      youtube: '',
      video: '',
      idea: '',
      image: '',
      voice: '',
      voiceExtractor: '',
      promptGen: '',
      analyze: '',
      transcribe: '',
      shorts: '',
      analytics: '',
      longVideo: ''
    });
    setResults({
      landing: null,
      home: null,
      youtube: null,
      video: null,
      idea: null,
      image: null,
      voice: null,
      voiceExtractor: null,
      promptGen: null,
      analyze: null,
      transcribe: null,
      shorts: null,
      analytics: null,
      longVideo: null
    });
    setSelectedMedia({
      landing: null,
      home: null,
      youtube: null,
      video: null,
      idea: null,
      image: null,
      voice: null,
      voiceExtractor: null,
      promptGen: null,
      analyze: null,
      transcribe: null,
      shorts: null,
      analytics: null,
      longVideo: null
    });
    setMediaMimeType('');
    toast.success(uiLang === 'en' ? "Data Refreshed!" : "সব তথ্য রিফ্রেশ করা হয়েছে!");
  };

  const saveAIConfig = () => {
    updateAIConfig(aiProvider, {
      gemini: customGeminiKey,
      openai: customOpenaiKey,
      groq: customGroqKey,
      deepseek: customDeepseekKey,
      perplexity: customPerplexityKey,
      gemma: customGemmaKey,
      openrouter: customOpenrouterKey
    });
    toast.success(uiLang === 'en' ? "AI Configuration Saved!" : "AI কনফিগারেশন সেভ করা হয়েছে!");
    setShowSettings(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast.success(uiLang === 'en' ? "App installed successfully!" : "অ্যাপ সফলভাবে ইনস্টল হয়েছে!");
      }
    } else {
      toast.info(uiLang === 'en' ? "Install option is not available or app is already installed." : "ইনস্টল অপশনটি উপলব্ধ নেই বা অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে।");
    }
  };

  const downloadChromeExtension = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const fileSaver = await import('file-saver');
      const saveAs = fileSaver.saveAs || fileSaver.default;
      
      const zip = new JSZip();
      
      const manifest = {
        manifest_version: 3,
        name: "AI Creator Studio",
        version: "3.0",
        description: "Extract and analyze webpages with Gemini AI",
        permissions: ["activeTab", "scripting"],
        host_permissions: ["<all_urls>"],
        action: {
          default_popup: "popup.html",
          default_title: "AI Creator Studio"
        },
        icons: {
          "16": "icon16.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      };
      
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      
      const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Creator Studio</title>
  <style>
    body {
      width: 400px;
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f1117;
      color: #fff;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .header h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #00E5FF;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: #00E5FF;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .btn:hover {
      background: rgba(0, 229, 255, 0.2);
    }
    .btn-primary {
      background: #00E5FF;
      color: #000;
    }
    .btn-primary:hover {
      background: #00b3cc;
    }
    #result {
      margin-top: 16px;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      display: none;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
    }
    .loader {
      display: none;
      text-align: center;
      margin: 16px 0;
      color: #00E5FF;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="icon48.png" alt="Logo">
    <h1>AI Creator Studio</h1>
  </div>
  
  <button id="btn-summarize" class="btn">📝 Summarize Page</button>
  <button id="btn-ideas" class="btn">💡 Generate Video Ideas</button>
  <button id="btn-open" class="btn btn-primary">🚀 Open Full Studio</button>
  
  <div id="loader" class="loader">AI is thinking...</div>
  <div id="result"></div>

  <script src="popup.js"></script>
</body>
</html>
      `;
      zip.file("popup.html", popupHtml);

      const popupJs = `
const API_KEY = "${localStorage.getItem('CUSTOM_GEMINI_API_KEY') || process.env.GEMINI_API_KEY || ''}";
const BASE_URL = "${window.location.origin}";

document.getElementById('btn-open').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let targetUrl = BASE_URL;
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const isYouTube = window.location.hostname.includes("youtube.com") && window.location.pathname.includes("/watch");
        if (isYouTube) {
          const title = document.title.replace(" - YouTube", "");
          const channelElement = document.querySelector("#upload-info .ytd-channel-name a, .ytd-channel-name a");
          const channelName = channelElement ? channelElement.textContent.trim() : "";
          return { type: 'youtube', title, channelName, url: window.location.href };
        } else {
          const title = document.title;
          const metaDesc = document.querySelector('meta[name="description"]');
          const description = metaDesc ? metaDesc.content : "";
          const bodyText = document.body.innerText.substring(0, 500).trim();
          return { type: 'webpage', title, description, bodyText, url: window.location.href };
        }
      }
    });

    if (results && results[0] && results[0].result) {
      const data = results[0].result;
      if (data.type === 'youtube') {
        targetUrl += \`/?yt_url=\${encodeURIComponent(data.url)}&yt_title=\${encodeURIComponent(data.title)}&yt_channel=\${encodeURIComponent(data.channelName)}\`;
      } else {
        targetUrl += \`/?page_url=\${encodeURIComponent(data.url)}&page_title=\${encodeURIComponent(data.title)}&page_desc=\${encodeURIComponent(data.description || data.bodyText)}\`;
      }
    }
  } catch (e) {
    if (tab && tab.url) {
      targetUrl += \`/?page_url=\${encodeURIComponent(tab.url)}&page_title=\${encodeURIComponent(tab.title || "")}\`;
    }
  }
  
  chrome.tabs.create({ url: targetUrl });
});

async function callGemini(prompt) {
  if (!API_KEY) {
    document.getElementById('result').textContent = "Error: Gemini API Key not found. Please open the Full Studio to configure.";
    document.getElementById('result').style.display = 'block';
    return;
  }
  
  document.getElementById('loader').style.display = 'block';
  document.getElementById('result').style.display = 'none';
  
  try {
    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=\${API_KEY}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      })
    });
    
    const data = await response.json();
    document.getElementById('loader').style.display = 'none';
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      document.getElementById('result').textContent = text;
      document.getElementById('result').style.display = 'block';
    } else if (data.error) {
      document.getElementById('result').textContent = "API Error: " + data.error.message;
      document.getElementById('result').style.display = 'block';
    } else {
      document.getElementById('result').textContent = "Error generating content.";
      document.getElementById('result').style.display = 'block';
    }
  } catch (err) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('result').textContent = "Error: " + err.message;
    document.getElementById('result').style.display = 'block';
  }
}

async function getPageContext() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          title: document.title,
          url: window.location.href,
          text: document.body.innerText.substring(0, 3000)
        };
      }
    });
    return results[0].result;
  } catch (e) {
    return { title: tab.title, url: tab.url, text: "" };
  }
}

document.getElementById('btn-summarize').addEventListener('click', async () => {
  const context = await getPageContext();
  const prompt = \`Summarize the following webpage in 3-4 bullet points:\\nTitle: \${context.title}\\nURL: \${context.url}\\nContent: \${context.text}\`;
  callGemini(prompt);
});

document.getElementById('btn-ideas').addEventListener('click', async () => {
  const context = await getPageContext();
  const prompt = \`Based on this webpage, generate 3 highly engaging YouTube video ideas. Format as a numbered list with catchy titles.\\nTitle: \${context.title}\\nURL: \${context.url}\\nContent: \${context.text}\`;
  callGemini(prompt);
});
      `;
      zip.file("popup.js", popupJs);
      
      const generateIconBase64 = (size: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#00E5FF';
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${size/2.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('AI', size/2, size/2);
          return canvas.toDataURL('image/png').split(',')[1];
        }
        return "";
      };
      
      zip.file("icon16.png", generateIconBase64(16), {base64: true});
      zip.file("icon48.png", generateIconBase64(48), {base64: true});
      zip.file("icon128.png", generateIconBase64(128), {base64: true});
      
      const content = await zip.generateAsync({type: "blob"});
      saveAs(content, "yt-ai-creator-extension.zip");
      toast.success(uiLang === 'en' ? "Extension downloaded! Unzip and load unpacked in Chrome." : "এক্সটেনশন ডাউনলোড হয়েছে! আনজিপ করে ক্রোমে লোড করুন।");
    } catch (error) {
      console.error("Failed to generate extension:", error);
      toast.error(uiLang === 'en' ? "Failed to generate extension" : "এক্সটেনশন তৈরি করতে ব্যর্থ হয়েছে");
    }
  };

  const downloadHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = `yt_gen_history_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
    
    toast.success(uiLang === 'en' ? "History Downloaded!" : "হিস্ট্রি ডাউনলোড করা হয়েছে!");
  };

  return (
    <div className={cn("min-h-screen studio-shell bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-hw-accent/30 selection:text-white", theme)}>
      <Toaster position="top-right" richColors theme={theme === 'light' ? 'light' : 'dark'} />
      
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto overflow-x-hidden relative"
          >
            <div className="studio-grid-bg" />
            
            {/* Landing Navigation */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-[100]">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl border-b border-white/5" />
              <div className="absolute inset-0 studio-grid-bg opacity-10" />
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative flex items-center gap-4 cursor-pointer group"
                onClick={() => setCurrentView('landing')}
              >
                <div className="w-12 h-12 rounded-xl bg-hw-accent/10 flex items-center justify-center border border-hw-accent/20 group-hover:bg-hw-accent/20 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <Youtube className="text-hw-accent" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-hw-accent transition-colors uppercase">AI Studio</span>
              </motion.div>
              
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative hidden lg:flex items-center gap-8 px-8 py-3.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-3xl shadow-2xl"
              >
                {['Features', 'Intelligence', 'Systems', 'Manual'].map((item) => (
                  <button 
                    key={item}
                    className="text-[10px] font-bold text-hw-muted hover:text-hw-accent transition-all uppercase tracking-[0.2em]"
                  >
                    {item}
                  </button>
                ))}
              </motion.div>

              <div className="relative flex items-center gap-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className="hw-btn-industrial py-3 px-8 text-[10px]"
                >
                  <Rocket size={16} className="hw-icon text-hw-accent" />
                  {t.getStarted}
                </button>

                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </nav>

              {/* Mobile Menu for Landing Page */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col p-8 overflow-y-auto overscroll-contain touch-pan-y"
                  >
                    <div className="flex justify-between items-center mb-12">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hw-accent to-[#D4AF37] flex items-center justify-center">
                          <Youtube className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-widest text-white uppercase">AI Studio</span>
                      </div>
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-6">
                      {['Features', 'Intelligence', 'Systems', 'Manual'].map((item, i) => (
                        <motion.button 
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-4xl font-black text-white hover:text-hw-accent transition-colors text-left tracking-tighter"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>

                    <div className="space-y-8 pt-8 border-t border-white/10">
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={() => {
                          setCurrentView('home');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-hw-accent text-white py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(139,92,246,0.3)] active:scale-95 transition-all"
                      >
                        {t.getStarted}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center pt-40 pb-20 overflow-hidden">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-hw-accent/5 rounded-full blur-[120px] -z-10" />
                  <div className="absolute top-0 left-0 w-full h-full studio-grid-bg opacity-20 -z-10" />
                  
                  <div className="max-w-5xl mx-auto px-6 text-center space-y-16 relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-hw-accent/10 border border-hw-accent/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                    >
                      <div className="hw-led bg-hw-accent animate-pulse" />
                      <span className="hw-label text-hw-accent text-[10px] uppercase tracking-[0.3em] font-black">{t.subtitle}</span>
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-white uppercase italic overflow-visible py-4"
                    >
                      {uiLang === 'en' ? (
                        <>
                          Neural <span className="text-hw-accent hw-text-gradient">Viral</span><br />
                          Synthesis
                        </>
                      ) : (
                        <>
                          এআই <span className="text-hw-accent hw-text-gradient">সংশ্লেষণ</span> <br />
                          ভাইরাল কন্টেন্ট
                        </>
                      )}
                    </motion.h1>

                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="max-w-2xl mx-auto text-sm md:text-base text-hw-muted font-black tracking-[0.2em] uppercase leading-relaxed italic"
                    >
                      {uiLang === 'en' 
                        ? "The world's most advanced hardware-integrated creative engine for elite content creators."
                        : "এলিট কন্টেন্ট ক্রিয়েটরদের জন্য বিশ্বের সবচেয়ে উন্নত হার্ডওয়্যার-ইন্টিগ্রেটেড ক্রিয়েটিভ ইঞ্জিন।"}
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
                    >
                      <button
                        onClick={() => setCurrentView('home')}
                        className="hw-btn-industrial py-5 px-14 text-sm group min-w-[240px]"
                      >
                        <Sparkles size={20} className="hw-icon text-hw-accent" />
                        {t.getStarted}
                        <ArrowRight size={20} className="hw-icon ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="hw-btn-industrial py-5 px-14 text-xs bg-black/40 border-white/5 text-hw-muted hover:text-white min-w-[240px]">
                        <Video size={18} className="hw-icon" />
                        System Overview
                      </button>
                    </motion.div>
                  </div>
                </section>

                {/* Advanced Systems Section */}
                <section className="py-32 relative group">
                  <div className="absolute inset-0 studio-grid-bg opacity-10" />
                  <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
                    <div className="text-center space-y-4">
                      <h2 className="hw-label text-hw-accent text-[12px] uppercase tracking-[0.5em] font-black">Generation Modules</h2>
                      <div className="h-px w-32 bg-hw-accent/20 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { icon: <Search size={32} />, title: "SEO_CORE", desc: "Advanced keyword extraction and CTR projection engine." },
                        { icon: <Sparkles size={32} />, title: "GEN_NEURAL", desc: "Multi-layered content synthesis with ethical boundary monitoring." },
                        { icon: <Volume2 size={32} />, title: "VOICE_SYNTH", desc: "Elite-grade neural voice extraction and transcription." },
                        { icon: <ImageIcon size={32} />, title: "V_RENDER", desc: "Studio-quality visual prompt engineering and generation." },
                        { icon: <Zap size={32} />, title: "RAPID_SHORTS", desc: "Viral-optimized short-form content scaling systems." },
                        { icon: <RefreshCw size={32} />, title: "SYNC_MATRIX", desc: "Real-time collaborative production environments." }
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="hw-panel p-10 bg-black/40 border-white/5 hover:border-hw-accent/30 transition-all space-y-8 group"
                        >
                           <div className="w-16 h-16 rounded-2xl bg-hw-accent/5 border border-hw-accent/10 flex items-center justify-center text-hw-accent shadow-inner group-hover:bg-hw-accent/10 transition-colors">
                             {feature.icon}
                           </div>
                           <div className="space-y-4">
                             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{feature.title}</h3>
                             <p className="text-[10px] font-black text-hw-muted uppercase tracking-widest leading-loose">{feature.desc}</p>
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-32 relative">
                  <div className="max-w-7xl mx-auto px-6 space-y-24">
                    <div className="text-center space-y-4">
                      <h2 className="hw-label text-hw-accent text-[12px] uppercase tracking-[0.5em] font-black">Operator Testimonials</h2>
                      <div className="h-px w-32 bg-hw-accent/20 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { name: "Unit 742", role: "Verification Specialist", text: "Synthesis output exceeds human limits by 400%." },
                        { name: "Node Alpha", role: "Creative Director", text: "Zero latentcy. Pure industrial-grade content production." },
                        { name: "Core Beta", role: "Scaling Agent", text: "The most robust neural environment I've operated in." }
                      ].map((t, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -5 }}
                          className="hw-panel p-10 bg-black/40 border-white/5 space-y-8 relative group overflow-hidden"
                        >
                          <Quote className="absolute top-6 right-6 text-hw-accent/10 group-hover:text-hw-accent/20 transition-colors" size={48} />
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-hw-accent text-hw-accent" />)}
                          </div>
                          <p className="text-white font-black italic tracking-tighter text-lg leading-relaxed relative z-10 uppercase">"{t.text}"</p>
                          <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-hw-accent/10 border border-hw-accent/20 flex items-center justify-center">
                              <User size={20} className="text-hw-accent" />
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-white italic tracking-tighter uppercase">{t.name}</h5>
                              <p className="text-[10px] text-hw-muted font-black uppercase tracking-widest">{t.role}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Pricing Systems */}
                <section className="py-32 relative overflow-hidden bg-black/40">
                  <div className="max-w-7xl mx-auto px-6 space-y-24">
                    <div className="text-center space-y-4">
                      <h2 className="hw-label text-hw-accent text-[12px] uppercase tracking-[0.5em] font-black">Subscription Modules</h2>
                      <div className="h-px w-32 bg-hw-accent/20 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { 
                          name: "Free_Tier", 
                          price: "0.00", 
                          desc: "Basic neural access.", 
                          features: ["5 Reports / Week", "Core SEO Tools", "Community Terminal"],
                        },
                        { 
                          name: "Pro_Forge", 
                          price: "19.99", 
                          desc: "Elite production module.", 
                          features: ["Unlimited Synthesis", "Advanced SEO", "Priority Compute", "Visual Render Engine"],
                          popular: true
                        },
                        { 
                          name: "Enterprise", 
                          price: "Custom", 
                          desc: "High-scale architecture.", 
                          features: ["Node Scaling", "Team Matrix", "API Interface", "Dedicated Agent"],
                        }
                      ].map((plan, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -5 }}
                          className={cn(
                            "hw-panel p-10 border space-y-10 relative flex flex-col justify-between overflow-hidden",
                            plan.popular ? "border-hw-accent/40 bg-hw-accent/5 scale-105 z-10 shadow-[0_0_50px_rgba(34,197,94,0.1)]" : "bg-black/60 border-white/10"
                          )}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-hw-accent text-black text-[10px] font-black uppercase tracking-widest italic rounded-bl-xl">
                              Recommended
                            </div>
                          )}
                          <div className="space-y-8">
                            <div className="space-y-3">
                              <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{plan.name}</h4>
                              <p className="text-hw-muted text-[10px] font-black uppercase tracking-widest">{plan.desc}</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-hw-muted text-xs uppercase font-black">$</span>
                              <span className="text-5xl font-black text-white italic tracking-tighter">{plan.price}</span>
                              {plan.price !== "Custom" && <span className="text-hw-muted text-[10px] font-black uppercase tracking-widest italic">/ Cycle</span>}
                            </div>
                            <div className="h-px bg-white/5 w-full" />
                            <ul className="space-y-4">
                              {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-[10px] font-black text-hw-muted uppercase tracking-widest">
                                  <div className="w-1.5 h-1.5 rounded-full bg-hw-accent/40" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button className={cn(
                            "hw-btn-industrial py-4 w-full text-xs",
                            plan.popular ? "bg-hw-accent text-black hover:bg-hw-accent/90" : "bg-white/5 border-white/10 text-white"
                          )}>
                            Deploy Unit
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Final Footer */}
                <footer className="py-20 border-t border-white/5 relative bg-black">
                  <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-hw-accent/10 border border-hw-accent/20 flex items-center justify-center">
                        <Youtube className="text-hw-accent" size={20} />
                      </div>
                      <span className="text-lg font-black italic tracking-tighter text-white uppercase">AI Studio Systems v4.0</span>
                    </div>
                    <p className="text-[10px] font-black text-hw-muted uppercase tracking-[0.4em]">© 2026 Neural Synthesis Labs. Hardware Integrated Design.</p>
                  </div>
                </footer>
              </div>
            </motion.div>
          ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="studio-shell w-full"
          >
            {/* Sidebar Desktop (Hidden since nav is now in header) */}
            <aside className="studio-sidebar hidden">
              <div 
                className="w-14 h-14 rounded-2xl bg-hw-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.3)] mb-12 cursor-pointer group-hover:scale-110 transition-transform duration-500"
                onClick={() => setCurrentView('home')}
              >
                <Youtube size={28} className="text-black" />
              </div>

              <div className="flex-1 w-full space-y-2">
                {[
                  { id: 'home', icon: Home, label: t.home },
                  { id: 'video', icon: Video, label: t.videoGen },
                  { id: 'shorts', icon: Zap, label: t.shortsGen },
                  { id: 'idea', icon: Lightbulb, label: t.ideaGen },
                  { id: 'image', icon: Palette, label: t.imageGen },
                  { id: 'longVideo', icon: Film, label: 'Long Video' },
                  { id: 'voice', icon: Mic, label: t.voiceOver },
                  { id: 'voiceExtractor', icon: AudioLines, label: 'Transcribe' },
                  { id: 'analytics', icon: BarChart3, label: 'Insights' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    className={cn(
                      "studio-nav-item w-full",
                      currentView === item.id && "active"
                    )}
                  >
                    <item.icon size={20} className="hw-icon shrink-0" />
                    <span className="studio-nav-label uppercase font-black tracking-widest text-[10px] ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.label}
                    </span>
                    {currentView === item.id && (
                      <motion.div 
                        layoutId="nav-glow"
                        className="absolute left-[-4px] top-1/4 bottom-1/4 w-[4px] rounded-r-full bg-hw-accent shadow-[0_0_15px_rgba(0,229,255,0.6)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center group-hover:items-start">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="studio-nav-item"
                >
                  <Globe size={20} className="hw-icon" />
                  <span className="studio-nav-label uppercase font-black tracking-widest text-[10px] ml-4">Settings</span>
                </button>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="studio-nav-item"
                >
                  <History size={20} className="hw-icon" />
                  <span className="studio-nav-label uppercase font-black tracking-widest text-[10px] ml-4">History</span>
                </button>
              </div>
            </aside>

            {/* Mobile Nav Overlay for App Layout */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl md:hidden flex flex-col overflow-y-auto"
                >
                  <div className="p-6 flex justify-between items-center border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-hw-accent flex items-center justify-center">
                        <Youtube className="text-black" size={20} />
                      </div>
                      <span className="text-xl font-black italic tracking-tighter uppercase text-white">AI Studio</span>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-2 flex-1">
                    {[
                      { id: 'home', icon: Home, label: t.home },
                      { id: 'video', icon: Video, label: t.videoGen },
                      { id: 'shorts', icon: Zap, label: t.shortsGen },
                      { id: 'idea', icon: Lightbulb, label: t.ideaGen },
                      { id: 'image', icon: Palette, label: t.imageGen },
                      { id: 'longVideo', icon: Film, label: 'Long Video' },
                      { id: 'voice', icon: Mic, label: t.voiceOver },
                      { id: 'voiceExtractor', icon: AudioLines, label: 'Transcribe' },
                      { id: 'analytics', icon: BarChart3, label: 'Insights' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-4 w-full p-4 rounded-xl transition-all",
                          currentView === item.id ? "bg-hw-accent/15 text-hw-accent border border-hw-accent/20" : "text-white/50 hover:bg-white/5"
                        )}
                      >
                        <item.icon size={20} />
                        <span className="uppercase font-black tracking-widest text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 border-t border-white/5 space-y-2 shrink-0">
                    <button 
                      onClick={() => { setShowSettings(true); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 w-full p-4 rounded-xl text-white/50 hover:bg-white/5 transition-all"
                    >
                      <Globe size={20} />
                      <span className="uppercase font-black tracking-widest text-[10px]">Settings</span>
                    </button>
                    <button 
                      onClick={() => { setShowHistory(true); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 w-full p-4 rounded-xl text-white/50 hover:bg-white/5 transition-all"
                    >
                      <History size={20} />
                      <span className="uppercase font-black tracking-widest text-[10px]">History</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="studio-main w-full">
              <div className="studio-grid-bg opacity-30" />
              
              <header className="studio-header relative p-4 md:px-10 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 min-h-[5rem] h-auto z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3 w-fit shrink-0">
                  <div className="md:hidden w-10 h-10 rounded-xl shrink-0 bg-hw-accent flex items-center justify-center cursor-pointer" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={20} className="text-black" />
                  </div>
                  <div className="flex flex-col justify-center max-w-[120px] sm:max-w-none px-1 overflow-hidden">
                    <h2 className="text-base sm:text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white leading-tight truncate">
                      <span className="text-hw-accent">AI</span> Studio
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isApiConnected ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-hw-muted truncate hidden sm:block">Hardware Phase: Alpha v0.8</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Header Navigation */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar px-4 max-w-full">
                  {[
                    { id: 'home', icon: Home, label: t.home },
                    { id: 'video', icon: Video, label: t.videoGen },
                    { id: 'shorts', icon: Zap, label: t.shortsGen },
                    { id: 'idea', icon: Lightbulb, label: t.ideaGen },
                    { id: 'image', icon: Palette, label: t.imageGen },
                    { id: 'longVideo', icon: Film, label: 'Long Video' },
                    { id: 'voice', icon: Mic, label: t.voiceOver },
                    { id: 'voiceExtractor', icon: AudioLines, label: 'Transcribe' },
                    { id: 'analytics', icon: BarChart3, label: 'Insights' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                        currentView === item.id ? "bg-hw-accent/20 text-hw-accent border border-hw-accent/30" : "text-white/50 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon size={16} />
                      <span className="uppercase font-black tracking-widest text-[9px] hidden xl:block">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {/* Lang Switch */}
                  <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-3xl shrink-0 hidden sm:flex">
                    <button 
                      onClick={() => setUiLang('en')}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", uiLang === 'en' ? "bg-hw-accent text-black" : "text-hw-muted hover:text-white")}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => setUiLang('bn')}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", uiLang === 'bn' ? "bg-hw-accent text-black" : "text-hw-muted hover:text-white")}
                    >
                      BN
                    </button>
                  </div>
                  
                  {/* Mobile Lang Button (compact) */}
                  <button 
                    onClick={() => setUiLang(uiLang === 'en' ? 'bn' : 'en')}
                    className="sm:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-[10px] text-hw-accent shrink-0 uppercase"
                  >
                    {uiLang}
                  </button>

                  <button 
                    onClick={() => setShowSettings(true)}
                    className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/5 items-center justify-center text-hw-muted hover:text-hw-accent hover:border-hw-accent/30 transition-all duration-300 shrink-0"
                    title="Settings"
                  >
                    <Globe size={16} />
                  </button>
                  
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/5 items-center justify-center text-hw-muted hover:text-hw-accent hover:border-hw-accent/30 transition-all duration-300 shrink-0"
                    title="History"
                  >
                    <History size={16} />
                  </button>

                  <button 
                    onClick={handleRefresh}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-hw-muted hover:text-hw-accent hover:border-hw-accent/30 transition-all duration-300 shrink-0"
                  >
                    <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-hw-accent/20 border border-hw-accent/30 flex items-center justify-center text-hw-accent shadow-[0_0_15px_rgba(0,229,255,0.1)] shrink-0">
                    <User size={18} />
                  </div>
                </div>
              </header>

              <div className="studio-content scrollbar-hide">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    {/* View Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                      <div className="space-y-2">
                        <div className="hw-label text-hw-accent flex items-center gap-2">
                          <Activity size={12} /> Live Processing Studio
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase leading-tight break-words">
                          {currentView === 'home' ? t.dashboard : 
                           currentView === 'youtube' ? 'YouTube Lab' : 
                           currentView === 'video' ? 'Script Forge' : 
                           currentView === 'longVideo' ? 'Pro Video Cinema' : 
                           currentView === 'shorts' ? 'Vertical Viral' : 
                           currentView === 'idea' ? 'Idea Machine' :
                           currentView === 'image' ? 'Lens Alchemy' : 
                           currentView === 'voice' ? 'Vocal Synthesis' :
                           currentView === 'voiceExtractor' ? 'Frequency Extractor' : 'Core Processing'}
                        </h1>
                        <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[8px] md:text-[10px] mt-2">
                          Status: <span className="text-hw-accent">Operational</span> • Buffer: <span className="text-hw-accent">Clear</span>
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => downloadPdf()}
                          className="hw-btn-industrial py-2.5 px-6 text-[10px] whitespace-nowrap hidden sm:flex"
                        >
                          <Download size={14} className="hw-icon text-hw-accent" /> Export Report
                        </button>
                      </div>
                    </div>

        {/* Dashboard Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: t.activeModel, value: aiProvider, icon: Zap, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.totalHistory, value: history.length, icon: History, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.language, value: uiLang.toUpperCase(), icon: Globe, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.currentView, value: currentView, icon: Sparkles, color: "text-hw-accent", bg: "bg-hw-accent/10" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className="hw-panel p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 group cursor-pointer text-center sm:text-left"
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                stat.bg, stat.color
              )}>
                <stat.icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
              </div>
              <div className="space-y-0.5 sm:space-y-1 overflow-hidden w-full max-w-full">
                <p className="hw-label text-[8px] sm:text-[10px] truncate">{stat.label}</p>
                <p className="text-sm sm:text-lg md:text-xl font-bold text-white capitalize tracking-tight leading-none group-hover:text-hw-accent transition-colors truncate">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        {currentView !== 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-20">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-12 xl:col-span-12 space-y-8 md:space-y-12">
            <section className="hw-panel p-5 sm:p-8 md:p-14 space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-10">
              <div className="space-y-3 md:space-y-4">
                <div className="hw-label text-hw-accent flex items-center gap-2">
                  <div className="hw-led bg-hw-accent" /> Signal Reception Path
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase text-white flex items-center gap-6 break-words">
                  Forge Parameters
                </h2>
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-hw-muted">
                  Input Stream: <span className="text-white">Active</span> • Analysis: <span className="text-white">Standby</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="hw-btn-industrial py-2.5 sm:py-3 px-6 sm:px-8 text-[10px] w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <History size={14} className="sm:w-4 sm:h-4 hw-icon text-hw-accent" /> {t.history}
                </button>
              </div>
            </div>

            <motion.div 
              key={currentView}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentView !== 'voiceExtractor' && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-hw-muted font-bold flex items-center gap-2">
                    <FileText size={14} className="text-hw-accent" /> {
                      (currentView === 'video' || currentView === 'longVideo') ? t.videoDesc : 
                      currentView === 'shorts' ? t.topicInput : 
                      currentView === 'idea' ? t.nicheInput : 
                      currentView === 'image' ? t.imageInput :
                      currentView === 'voice' ? t.voiceInput :
                      t.topicInput
                    }
                  </label>
                  <div className="relative w-full">
                    <textarea 
                      placeholder={
                        (currentView === 'video' || currentView === 'longVideo') ? t.videoDescPlaceholder : 
                        currentView === 'shorts' ? (uiLang === 'en' ? "Enter your shorts topic (e.g., 'Life hacks for busy people')" : "আপনার শর্টস এর বিষয় লিখুন (যেমন, 'ব্যস্ত মানুষের জন্য লাইফ হ্যাকস')") :
                        currentView === 'idea' ? t.nichePlaceholder :
                        currentView === 'image' ? t.imagePlaceholder :
                        currentView === 'voice' ? t.voicePlaceholder :
                        currentView === 'promptGen' ? t.promptGenPlaceholder :
                        t.topicPlaceholder
                      }
                      className="w-full input-field min-h-[140px] resize-none text-base font-medium shadow-inner"
                      value={currentTopic}
                      onFocus={() => setShowAllTopics(true)}
                      onBlur={() => setTimeout(() => setShowAllTopics(false), 200)}
                      onChange={(e) => {
                        setTopics(prev => ({ ...prev, [currentView]: e.target.value }));
                        if (currentView !== 'video' && currentView !== 'idea' && currentView !== 'voice') {
                          setSelectedMedia(prev => ({ ...prev, [currentView]: null }));
                        }
                      }}
                    />
                    {showAllTopics && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                        <div className="p-3 text-[10px] uppercase tracking-widest text-hw-muted font-bold border-b border-white/10 bg-white/5">
                          {uiLang === 'en' ? "Suggestions" : "পরামর্শ"}
                        </div>
                        {filteredSuggestions.map((suggestion, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 hover:bg-white/10 cursor-pointer text-sm text-white/70 hover:text-white flex items-center gap-4 transition-colors border-b border-white/5 last:border-0"
                            onClick={() => {
                              setTopics(prev => ({ ...prev, [currentView]: suggestion.text }));
                              setShowAllTopics(false);
                            }}
                          >
                            <span className="text-xl">{suggestion.icon}</span>
                            <span className="flex-1 truncate font-medium">{suggestion.text}</span>
                            {suggestion.isTrending && (
                              <span className="text-[9px] uppercase tracking-wider bg-hw-accent/20 text-hw-accent px-2.5 py-1 rounded-full font-bold border border-hw-accent/30">
                                {uiLang === 'en' ? "Trending" : "ট্রেন্ডিং"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {(currentView === 'image' || currentView === 'video' || currentView === 'longVideo') && (
                    <div className="space-y-5 mt-6 animate-in fade-in slide-in-from-top-2 duration-500 bg-white/5 rounded-2xl p-6 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-hw-accent font-bold">
                          <Sparkles size={14} /> {uiLang === 'en' ? "Prompt Suggestions" : "প্রম্পট সাজেশন"}
                        </div>
                        {topics[currentView].trim() !== "" && (
                          <button 
                            onClick={() => {
                              setTopics(prev => ({ ...prev, [currentView]: "" }));
                              toast.info(uiLang === 'en' ? "Prompt cleared" : "প্রম্পট মুছে ফেলা হয়েছে");
                            }}
                            className="text-[10px] uppercase tracking-widest text-hw-muted hover:text-red-400 transition-colors font-bold flex items-center gap-1.5"
                          >
                            <Trash2 size={12} /> {uiLang === 'en' ? "Clear" : "মুছুন"}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        {/* Scene Presets */}
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-hw-accent/80 font-bold px-1 flex items-center gap-1.5">
                            <Zap size={12} /> {uiLang === 'en' ? "Scene Presets" : "সিন প্রিসেট"}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {SCENE_PRESETS.map((preset, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 229, 255, 0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const currentText = topics[currentView];
                                  const elementsToAdd = preset.elements.filter(el => !currentText.includes(el));
                                  if (elementsToAdd.length === 0) {
                                    toast.info(uiLang === 'en' ? "Preset already applied" : "প্রিসেট ইতিমধ্যে যুক্ত আছে");
                                    return;
                                  }
                                  const separator = currentText.trim() ? ", " : "";
                                  setTopics(prev => ({ 
                                    ...prev, 
                                    [currentView]: currentText + separator + elementsToAdd.join(', ') 
                                  }));
                                  toast.success(`${preset[uiLang]} ${uiLang === 'en' ? "applied!" : "যুক্ত হয়েছে!"}`);
                                }}
                                className="text-[11px] px-3 py-2 rounded-xl bg-hw-accent/10 border border-hw-accent/20 hover:border-hw-accent/50 transition-all flex items-center gap-2 text-hw-accent font-bold shadow-sm"
                              >
                                <span>{preset.icon}</span>
                                {preset[uiLang]}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Granular Categories */}
                        {Object.entries(PROMPT_ELEMENTS)
                          .filter(([category]) => {
                            if (currentView === 'image' && category === 'movement') return false;
                            return true;
                          })
                          .map(([category, elements]) => {
                            const isExpanded = expandedCategories.includes(category);
                            return (
                              <div key={category} className="space-y-2 border-t border-white/5 pt-4 first:border-0 first:pt-0">
                                <button 
                                  onClick={() => setExpandedCategories(prev => 
                                    prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
                                  )}
                                  className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-hw-muted font-bold px-1 hover:text-white transition-colors"
                                >
                                  <span>
                                    {category === 'subject' ? (uiLang === 'en' ? "Subjects" : "বিষয়") :
                                     category === 'camera' ? (uiLang === 'en' ? "Camera Angles" : "ক্যামেরা অ্যাঙ্গেল") :
                                     category === 'lighting' ? (uiLang === 'en' ? "Lighting Styles" : "লাইটিং স্টাইল") :
                                     category === 'style' ? (uiLang === 'en' ? "Artistic Styles" : "আর্টিস্টিক স্টাইল") :
                                     category === 'mood' ? (uiLang === 'en' ? "Mood & Atmosphere" : "মুড ও পরিবেশ") :
                                     category === 'environment' ? (uiLang === 'en' ? "Environments" : "পরিবেশ") :
                                     category === 'composition' ? (uiLang === 'en' ? "Composition" : "কম্পোজিশন") :
                                     category === 'colors' ? (uiLang === 'en' ? "Color Palettes" : "রঙের প্যালেট") :
                                     category === 'weather' ? (uiLang === 'en' ? "Weather" : "আবহাওয়া") :
                                     category === 'time' ? (uiLang === 'en' ? "Time of Day" : "দিনের সময়") :
                                     category === 'texture' ? (uiLang === 'en' ? "Textures" : "টেক্সচার") :
                                     (uiLang === 'en' ? "Movements" : "মুভমেন্ট")}
                                  </span>
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                                
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-wrap gap-2 py-2">
                                        {elements.map((el, idx) => {
                                          const isSelected = topics[currentView].split(',').map(s => s.trim()).includes(el.en);
                                          return (
                                            <motion.button
                                              key={idx}
                                              whileHover={{ scale: 1.05, backgroundColor: isSelected ? "rgba(0, 229, 255, 0.3)" : "rgba(255, 255, 255, 0.1)" }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => {
                                                const currentText = topics[currentView];
                                                const promptValue = el.en;
                                                
                                                if (isSelected) {
                                                  const newText = currentText
                                                    .split(',')
                                                    .map(s => s.trim())
                                                    .filter(s => s !== promptValue)
                                                    .join(', ');
                                                  setTopics(prev => ({ ...prev, [currentView]: newText }));
                                                  toast.info(`${el[uiLang]} ${uiLang === 'en' ? "removed!" : "মুছে ফেলা হয়েছে!"}`);
                                                } else {
                                                  const separator = currentText.trim() ? ", " : "";
                                                  setTopics(prev => ({ 
                                                    ...prev, 
                                                    [currentView]: currentText + separator + promptValue 
                                                  }));
                                                  toast.success(`${el[uiLang]} ${uiLang === 'en' ? "added!" : "যুক্ত হয়েছে!"}`);
                                                }
                                              }}
                                              className={cn(
                                                "text-[11px] px-3 py-2 rounded-xl border transition-all flex items-center gap-2 font-medium",
                                                isSelected 
                                                  ? "bg-hw-accent/20 border-hw-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
                                                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                              )}
                                            >
                                              <span>{el.icon}</span>
                                              {el[uiLang]}
                                            </motion.button>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'voiceExtractor' && (
                <div className="space-y-4 pt-4">
                  <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                    <Languages size={14} className="text-[var(--accent-main)]" /> {t.targetLanguage}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'en' }))}
                      className={cn(
                        "py-3 rounded-xl border border-[var(--border-main)] text-sm font-semibold transition-all flex items-center justify-center gap-2",
                        options.language === 'en' ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
                      )}
                    >
                      {options.language === 'en' && <Check size={16} />} {t.en}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'bn' }))}
                      className={cn(
                        "py-3 rounded-xl border border-[var(--border-main)] text-sm font-semibold transition-all flex items-center justify-center gap-2",
                        options.language === 'bn' ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
                      )}
                    >
                      {options.language === 'bn' && <Check size={16} />} {t.bn}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'hi' }))}
                      className={cn(
                        "py-3 rounded-xl border border-[var(--border-main)] text-sm font-semibold transition-all flex items-center justify-center gap-2",
                        options.language === 'hi' ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
                      )}
                    >
                      {options.language === 'hi' && <Check size={16} />} {t.hi}
                    </motion.button>
                  </div>
                </div>
              )}

              {currentView === 'promptGen' && (
                <div className="space-y-4 pt-4">
                  <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent-main)]" /> {uiLang === 'en' ? 'Prompt Category' : 'প্রম্পট ক্যাটাগরি'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Video', 'Story', 'Image', 'Voice Over'].map((cat) => (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setOptions(prev => ({ ...prev, promptCategory: cat as any }))}
                        className={cn(
                          "py-3 rounded-xl border border-[var(--border-main)] text-sm font-semibold transition-all flex items-center justify-center gap-2",
                          options.promptCategory === cat ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
                        )}
                      >
                        {options.promptCategory === cat && <Check size={16} />} 
                        {cat === 'Video' ? (uiLang === 'en' ? 'Video' : 'ভিডিও') :
                         cat === 'Story' ? (uiLang === 'en' ? 'Story' : 'গল্প') :
                         cat === 'Image' ? (uiLang === 'en' ? 'Image' : 'ছবি') :
                         (uiLang === 'en' ? 'Voice Over' : 'ভয়েস ওভার')}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'idea' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                      <Sparkles size={14} className="text-[var(--accent-main)]" /> {t.trendingNow}
                    </label>
                    {loadingTrends && <Loader2 size={14} className="animate-spin text-[var(--accent-main)]" />}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {loadingTrends ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-[var(--bg-card)]/5 animate-pulse border border-[var(--border-main)]/5" />
                      ))
                    ) : (
                      trendingTopics.map((trend, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--accent-main-rgb), 0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setTopics(prev => ({ ...prev, idea: trend.topic }));
                            toast.info(t.clickToUse);
                          }}
                          className="p-3 rounded-xl bg-[var(--bg-card)]/20 border border-brand-border hover:border-[var(--accent-main)] transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-1 bg-[var(--accent-main)]/20 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap size={10} className="text-[var(--accent-main)]" />
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors line-clamp-1">
                            {trend.topic}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-tight">
                            {trend.reason}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentView === 'home' && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-2 px-1">
                    <LayoutDashboard size={16} className="text-[var(--text-muted)]" />
                    <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {t.popularCategories}
                    </h2>
                  </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="hw-label text-hw-accent flex items-center gap-2">
                      <Zap size={14} /> Neural Frequency Topics
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="hw-led bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <span className="text-[8px] font-black uppercase text-hw-muted">Verified Trends</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(showAllTopics ? POPULAR_TOPICS : POPULAR_TOPICS.slice(0, 8)).map((topic, idx) => (
                      <div key={idx} className="space-y-3">
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === idx ? null : idx);
                            setTopics(prev => ({ ...prev, home: uiLang === 'bn' ? topic.bn : topic.en }));
                            toast.info(t.clickToUse);
                          }}
                          className={cn(
                            "hw-btn-industrial w-full py-4 text-left px-5 h-auto flex flex-col items-start gap-2",
                            selectedCategory === idx && "active border-hw-accent shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                          )}
                        >
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            selectedCategory === idx ? "text-hw-accent" : "text-hw-muted"
                          )}>
                            {uiLang === 'bn' ? topic.bn : topic.en}
                          </span>
                        </motion.button>
                        
                        <AnimatePresence>
                          {selectedCategory === idx && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-1 gap-2 p-3 bg-black/20 rounded-xl border border-white/5"
                            >
                              {topic.subs.map((sub, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    setTopics(prev => ({ ...prev, home: `${topic.en} - ${sub}` }));
                                    toast.success(`${sub} Loaded`);
                                  }}
                                  className="py-2.5 px-4 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-hw-muted hover:text-hw-accent hover:border-hw-accent/20 transition-all text-left"
                                >
                                  {sub}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setShowAllTopics(!showAllTopics)}
                      className="hw-btn-industrial py-2 px-10 text-[9px]"
                    >
                      {showAllTopics ? t.showLess : t.showMore}
                    </button>
                  </div>
                </div>

                {/* YouTube Title Generator Section */}
                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="hw-label text-hw-accent flex items-center gap-2 uppercase tracking-[0.3em]">
                      <Sparkles size={14} /> CTR Projection Engine
                    </h3>
                  </div>

                  <div className="hw-panel p-8 bg-hw-accent/5 border-hw-accent/10 space-y-6">
                    <div className="space-y-3">
                      <label className="hw-label text-white/50">{uiLang === 'en' ? 'Target Topic' : 'টার্গেট টপিক'}</label>
                      <input 
                        type="text" 
                        value={options.titleTopic || ''} 
                        onChange={(e) => setOptions(prev => ({ ...prev, titleTopic: e.target.value }))}
                        placeholder={uiLang === 'en' ? 'ENTER DATA STREAM...' : 'ডেটা স্ট্রিম লিখুন...'}
                        className="hw-display w-full text-base p-4"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!options.titleTopic) return;
                        setLoading(true);
                        try {
                          const result = await generateYoutubeTitles(options.titleTopic, uiLang === 'bn' ? 'bn' : 'en');
                          setResults(prev => ({ ...prev, [currentView]: result }));
                        } catch (err) { console.error(err); } finally { setLoading(false); }
                      }}
                      className="hw-btn-industrial w-full py-4 text-xs shadow-[0_10px_30px_rgba(34,197,94,0.1)]"
                    >
                      {loading ? (uiLang === 'en' ? 'ANALYZING...' : 'বিশ্লেষণ হচ্ছে...') : (uiLang === 'en' ? 'EXECUTE CTR OPTIMIZATION' : 'CTR অপ্টিমাইজেশান চালান')}
                    </button>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="hw-label text-hw-accent flex items-center gap-2 uppercase tracking-[0.3em]">
                      <Sparkles size={14} /> Semantic Prompt Core
                    </h3>
                  </div>

                  <div className="hw-panel p-10 space-y-10 group overflow-hidden">
                    <div className="space-y-4">
                      <label className="hw-label text-white/50">Frequency Matrix</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Video', 'Story', 'Image', 'Voice Over'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setOptions(prev => ({ ...prev, promptCategory: cat as any }))}
                            className={cn(
                              "hw-btn-industrial py-3 text-[9px]",
                              options.promptCategory === cat && "active"
                            )}
                          >
                            {cat === 'Video' ? (uiLang === 'en' ? 'Video' : 'ভিডিও') :
                             cat === 'Story' ? (uiLang === 'en' ? 'Story' : 'গল্প') :
                             cat === 'Image' ? (uiLang === 'en' ? 'Image' : 'ছবি') :
                             (uiLang === 'en' ? 'Voice Over' : 'ভয়েস ওভার')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Optics', value: formOptions.visualStyle, key: 'visualStyle', options: ['Cinematic', 'Realistic', 'Anime', 'Cyberpunk', 'Minimalist'] },
                        { label: 'Angle', value: formOptions.cameraAngle, key: 'cameraAngle', options: ['Wide', 'Close-up', 'POV', 'High Angle'] },
                        { label: 'Photon', value: formOptions.lighting, key: 'lighting', options: ['Natural', 'Neon', 'Moody', 'Studio'] },
                        { label: 'Phase', value: formOptions.mood, key: 'mood', options: ['Energetic', 'Epic', 'Mysterious', 'Calm'] },
                      ].map(field => (
                        <div key={field.key} className="space-y-3">
                          <label className="hw-label opacity-60 text-[8px]">{field.label}</label>
                          <select 
                            value={field.value} 
                            onChange={(e) => setFormOptions(prev => ({...prev, [field.key]: e.target.value}))} 
                            className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-[10px] font-black uppercase text-hw-muted outline-none focus:border-hw-accent/30 transition-colors appearance-none cursor-pointer"
                          >
                            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <label className="hw-label text-white/50">{uiLang === 'en' ? 'Input Stream Core' : 'ইনপুট স্ট্রিম কোর'}</label>
                      <textarea 
                        placeholder={uiLang === 'en' ? "ENTER SYSTEM INSTRUCTIONS..." : "সিস্টেম ইনস্ট্রাকশন লিখুন..."}
                        className="hw-display w-full min-h-[140px] p-5 text-sm"
                        value={topics.promptGen}
                        onChange={(e) => {
                          setTopics(prev => ({ ...prev, promptGen: e.target.value, home: '' }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                  {/* Best Posting Time Section */}
                  <div className="space-y-6 pt-8 border-t border-[var(--border-main)]">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xl">⏰</span>
                      <h2 className="text-sm font-semibold text-[var(--text-main)] tracking-wide">
                        {t.bestPostingTime}
                      </h2>
                    </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BEST_POSTING_TIMES.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -2, backgroundColor: "rgba(var(--accent-main-rgb), 0.05)" }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[var(--bg-card)]/40 border border-[var(--border-main)] text-center glass-card shadow-sm"
                      >
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-sm font-bold text-[var(--accent-main)] tracking-tight">
                          {item.time}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {item.platform} {uiLang === 'bn' ? (
                            item.period === 'morning' ? 'সকাল' :
                            item.period === 'afternoon' ? 'দুপুর' :
                            item.period === 'evening' ? 'সন্ধ্যা' :
                            item.period === 'night' ? 'রাত' : ''
                          ) : item.period}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            )}

              {currentView === 'voice' && (
                <div className="hw-panel p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Mic size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Voice Synthesizer</h3>
                        <p className="hw-label">Professional Grade Output</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="hw-knob" style={{ transform: 'rotate(45deg)' }}></div>
                        <span className="hw-label">Gain</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="hw-knob" style={{ transform: 'rotate(-30deg)' }}></div>
                        <span className="hw-label">Pitch</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Duration Slider for Voice */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="hw-label flex items-center gap-2">
                            <Clock size={14} className="text-hw-accent" /> {t.videoDuration}
                          </label>
                          <span className="text-hw-accent font-bold text-sm">
                            {options.videoDuration} {t.seconds} ({Math.floor(options.videoDuration / 60)}m {options.videoDuration % 60}s)
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="8" 
                          max="3600" 
                          step="1"
                          value={options.videoDuration}
                          onChange={(e) => {
                            const duration = parseInt(e.target.value);
                            // ~150 words per minute, ~5 characters per word
                            // Capped at 4000 words to ensure LLM output doesn't truncate for long videos
                            const words = Math.min(4000, Math.max(20, Math.round((duration / 60) * 150)));
                            const chars = Math.min(20000, Math.max(100, words * 5));
                            setOptions(prev => ({ 
                              ...prev, 
                              videoDuration: duration,
                              scriptWordCount: words,
                              scriptCharacterCount: chars
                            }));
                          }}
                          className="w-full h-2 bg-hw-accent/20 rounded-lg appearance-none cursor-pointer accent-hw-accent"
                        />
                        <div className="flex justify-between text-[10px] text-hw-muted font-bold">
                          <span>8s</span>
                          <span>60m</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="hw-label flex items-center gap-2">
                          <Languages size={14} className="text-hw-accent" /> {t.voiceLang}
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: 'bn', label: t.bn, flag: '🇧🇩' },
                            { id: 'en', label: t.en, flag: '🇺🇸' },
                            { id: 'hi', label: 'Hindi', flag: '🇮🇳' },
                          ].map((lang) => (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={lang.id}
                              onClick={() => setOptions(prev => ({ ...prev, voiceLanguage: lang.id as any }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg border border-hw-border text-xs font-bold transition-all",
                                options.voiceLanguage === lang.id ? "bg-hw-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-black/40 text-hw-muted hover:bg-black/60"
                              )}
                            >
                              {lang.flag} {lang.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="hw-label flex items-center gap-2">
                          <Volume2 size={14} className="text-hw-accent" /> {t.selectVoice}
                        </label>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="hw-label opacity-50">{t.femaleVoices}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {options.voiceLanguage === 'bn' ? [
                                { id: 'Mila', label: 'Mila (Pro)', desc: 'Clear & Professional' },
                                { id: 'Sumi', label: 'Sumi (Sweet)', desc: 'Natural & Warm' },
                                { id: 'Aoide', label: 'Aoide (Calm)', desc: 'Smooth & Steady' },
                                { id: 'Kore', label: 'Kore', desc: 'Default Female' }
                              ].map((v) => (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={v.id}
                                  onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                                  className={cn(
                                    "p-3 rounded-lg border transition-all text-left flex flex-col gap-1",
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", options.voice === v.id ? "text-hw-accent" : "text-white")}>{v.label}</span>
                                  <span className="text-[9px] opacity-60">{v.desc}</span>
                                </motion.button>
                              )) : [
                                { id: 'Kore', label: 'Kore (Warm)', desc: 'Natural & Soft' },
                                { id: 'Zephyr', label: 'Zephyr (Pro)', desc: 'Clear & Crisp' }
                              ].map((v) => (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={v.id}
                                  onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                                  className={cn(
                                    "p-3 rounded-lg border transition-all text-left flex flex-col gap-1",
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", options.voice === v.id ? "text-hw-accent" : "text-white")}>{v.label}</span>
                                  <span className="text-[9px] opacity-60">{v.desc}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="hw-label opacity-50">{t.maleVoices}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {options.voiceLanguage === 'bn' ? [
                                { id: 'Arif', label: 'Arif (Vlog)', desc: 'Friendly & Casual' },
                                { id: 'Rahat', label: 'Rahat (News)', desc: 'Deep & Formal' },
                                { id: 'Rashed', label: 'Rashed (Action)', desc: 'High Energy' },
                                { id: 'Puck', label: 'Puck', desc: 'Default Male' }
                              ].map((v) => (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={v.id}
                                  onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                                  className={cn(
                                    "p-3 rounded-lg border transition-all text-left flex flex-col gap-1",
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", options.voice === v.id ? "text-hw-accent" : "text-white")}>{v.label}</span>
                                  <span className="text-[9px] opacity-60">{v.desc}</span>
                                </motion.button>
                              )) : [
                                { id: 'Puck', label: 'Puck', desc: 'Friendly' },
                                { id: 'Charon', label: 'Charon', desc: 'Deep' },
                                { id: 'Fenrir', label: 'Fenrir', desc: 'Strong' }
                              ].map((v) => (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={v.id}
                                  onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                                  className={cn(
                                    "p-3 rounded-lg border transition-all text-left flex flex-col gap-1",
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", options.voice === v.id ? "text-hw-accent" : "text-white")}>{v.label}</span>
                                  <span className="text-[9px] opacity-60">{v.desc}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="hw-label flex items-center gap-2">
                          <Sparkles size={14} className="text-hw-accent" /> {t.voiceTone}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Excited', label: t.toneExcited },
                            { id: 'Calm', label: t.toneCalm },
                            { id: 'Serious', label: t.toneSerious },
                            { id: 'Professional', label: t.toneProfessional },
                            { id: 'Storyteller', label: t.toneStoryteller },
                          ].map((tone) => (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={tone.id}
                              onClick={() => setOptions(prev => ({ ...prev, voiceTone: tone.id }))}
                              className={cn(
                                "py-2 rounded-lg border border-hw-border text-[10px] font-bold transition-all",
                                options.voiceTone === tone.id ? "bg-hw-accent/20 text-hw-accent border-hw-accent" : "bg-black/40 text-hw-muted hover:bg-black/60"
                              )}
                            >
                              {tone.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="hw-label flex items-center gap-2">
                            <Globe size={14} className="text-hw-accent" /> {t.voiceAccent}
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: 'US', label: t.accentUS },
                              { id: 'UK', label: t.accentUK },
                              { id: 'Indian', label: t.accentIndian },
                            ].map((acc) => (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={acc.id}
                                onClick={() => setOptions(prev => ({ ...prev, voiceAccent: acc.id }))}
                                className={cn(
                                  "py-2 rounded-lg border border-hw-border text-[10px] font-bold transition-all",
                                  options.voiceAccent === acc.id ? "bg-hw-accent/20 text-hw-accent border-hw-accent" : "bg-black/40 text-hw-muted hover:bg-black/60"
                                )}
                              >
                                {acc.label}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="hw-label flex items-center gap-2">
                            <User size={14} className="text-hw-accent" /> {t.voiceAge}
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: 'Young', label: t.ageYoung },
                              { id: 'Adult', label: t.ageAdult },
                              { id: 'Senior', label: t.ageSenior },
                            ].map((age) => (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={age.id}
                                onClick={() => setOptions(prev => ({ ...prev, voiceAge: age.id }))}
                                className={cn(
                                  "py-2 rounded-lg border border-hw-border text-[10px] font-bold transition-all",
                                  options.voiceAge === age.id ? "bg-hw-accent/20 text-hw-accent border-hw-accent" : "bg-black/40 text-hw-muted hover:bg-black/60"
                                )}
                              >
                                {age.label}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(currentView === 'video' || currentView === 'longVideo' || currentView === 'image' || currentView === 'voiceExtractor') && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[var(--border-main)]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                      <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">
                        {(currentView === 'video' || currentView === 'longVideo') ? (uiLang === 'en' ? "Upload Video" : "ভিডিও আপলোড করুন") : 
                         currentView === 'voiceExtractor' ? t.uploadAudio : t.uploadImage}
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed border-[var(--border-main)] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-[var(--accent-main)]/5 hover:border-[var(--accent-main)]/50",
                      currentSelectedMedia && "border-[var(--accent-main)] bg-[var(--accent-main)]/5"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept={acceptType}
                      onChange={handleFileUpload}
                    />
                    {currentSelectedMedia ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--accent-main)] bg-black flex items-center justify-center shadow-lg">
                        {mediaMimeType.startsWith('video/') ? (
                          <video src={currentSelectedMedia} className="w-full h-full object-contain" controls />
                        ) : mediaMimeType.startsWith('audio/') ? (
                          <audio src={currentSelectedMedia} className="w-full" controls />
                        ) : (
                          <img src={currentSelectedMedia} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(prev => ({ ...prev, [currentView]: null }));
                          }}
                          className="absolute top-3 right-3 p-2.5 bg-black/60 rounded-full text-white hover:text-red-500 hover:bg-black/80 transition-all z-10 backdrop-blur-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] shadow-inner">
                          {(currentView === 'video' || currentView === 'longVideo') ? <Video size={24} /> : 
                           currentView === 'voiceExtractor' ? <AudioLines size={24} /> : <Upload size={24} />}
                        </div>
                        <p className="text-sm font-medium text-[var(--text-muted)] text-center max-w-xs">
                          {(currentView === 'video' || currentView === 'longVideo') ? (uiLang === 'en' ? "Click to upload video for analysis" : "বিশ্লেষণের জন্য ভিডিও আপলোড করতে ক্লিক করুন") : 
                           currentView === 'image' ? (uiLang === 'en' ? "Click to upload image for extraction & analysis" : "এক্সট্র্যাকশন ও বিশ্লেষণের জন্য ইমেজ আপলোড করতে ক্লিক করুন") :
                           currentView === 'voiceExtractor' ? t.uploadAudioPrompt :
                           t.uploadPrompt}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* Template Presets */}
          {currentView !== 'video' && currentView !== 'idea' && currentView !== 'image' && currentView !== 'voice' && currentView !== 'voiceExtractor' && currentView !== 'promptGen' && !currentSelectedMedia && (
            <section className="space-y-6 mb-10">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                  <LayoutTemplate size={16} className="text-hw-accent" /> {uiLang === 'en' ? 'Template Presets' : 'টেমপ্লেট প্রিসেট'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { 
                    id: 'tutorial', 
                    label: uiLang === 'en' ? 'Tutorial' : 'টিউটোরিয়াল', 
                    icon: BookOpen,
                    preset: { generateScript: true, generateDescription: true, generateTags: true, generateSeoChecklist: true, generateKeywords: true, generateImagePrompt: false, generateVideoPrompt: false, generateThumbnail: true }
                  },
                  { 
                    id: 'review', 
                    label: uiLang === 'en' ? 'Review' : 'রিভিউ', 
                    icon: Star,
                    preset: { generateScript: true, generateDescription: true, generateTags: true, generateSeoChecklist: true, generateKeywords: true, generateImagePrompt: true, generateVideoPrompt: true, generateThumbnail: true }
                  },
                  { 
                    id: 'vlog', 
                    label: uiLang === 'en' ? 'Vlog' : 'ভ্লগ', 
                    icon: Camera,
                    preset: { generateScript: false, generateDescription: true, generateTags: true, generateSeoChecklist: false, generateKeywords: true, generateImagePrompt: false, generateVideoPrompt: false, generateThumbnail: true }
                  },
                  { 
                    id: 'shorts', 
                    label: uiLang === 'en' ? 'Shorts' : 'শর্টস', 
                    icon: Zap,
                    preset: { generateScript: true, generateDescription: true, generateTags: true, generateSeoChecklist: false, generateKeywords: true, generateImagePrompt: false, generateVideoPrompt: false, generateThumbnail: false }
                  }
                ].map(template => (
                  <button
                    key={template.id}
                    onClick={() => setOptions(prev => ({ ...prev, ...template.preset }))}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-hw-accent/50 hover:bg-hw-accent/10 transition-all text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-hw-accent shadow-sm"
                  >
                    <template.icon size={16} className="text-hw-accent" />
                    {template.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Options Grid (Original for all views) */}
          {currentView !== 'video' && currentView !== 'idea' && currentView !== 'image' && currentView !== 'voice' && currentView !== 'voiceExtractor' && !currentSelectedMedia && (
            <section className="space-y-8">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                  <Sparkles size={16} className="text-hw-accent animate-pulse" /> {t.whatToCreate}
                </h2>
                <span className="text-[9px] uppercase tracking-widest text-hw-accent font-black bg-hw-accent/10 px-3 py-1 rounded-full border border-hw-accent/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  AI Powered
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { id: 'generateImagePrompt', label: t.imagePromptLabel, desc: t.imagePromptDesc, icon: ImageIcon, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateVideoPrompt', label: t.videoPromptLabel, desc: t.videoPromptDesc, icon: Video, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateThumbnail', label: t.thumbnailLabel, desc: t.thumbnailDesc, icon: Palette, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateDescription', label: t.descLabel, desc: t.descriptionDesc, icon: FileText, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateTags', label: t.tagsLabel, desc: t.tagsDesc, icon: Tag, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateScript', label: t.scriptLabel, desc: t.scriptDesc, icon: ScrollText, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateSeoChecklist', label: t.seoChecklistLabel, desc: t.seoChecklistDesc, icon: CheckCircle2, color: "from-hw-accent/20 to-hw-accent/10" },
                  { id: 'generateKeywords', label: t.keywordsLabel, desc: t.keywordsDesc, icon: Search, color: "from-hw-accent/20 to-hw-accent/10" },
                ].map((opt) => (
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    key={opt.id}
                    onClick={() => setOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                    className={cn(
                      "relative group cursor-pointer rounded-2xl p-5 transition-all duration-300 border overflow-hidden flex flex-col gap-4",
                      options[opt.id as keyof typeof options] 
                        ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                        : "bg-black/40 border-white/10 hover:border-hw-accent/40 hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner",
                      options[opt.id as keyof typeof options] ? "bg-hw-accent text-white" : "bg-white/5 text-hw-muted group-hover:text-hw-accent"
                    )}>
                      <opt.icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-black text-[10px] transition-colors uppercase tracking-widest",
                        options[opt.id as keyof typeof options] ? "text-hw-accent" : "text-white"
                      )}>
                        {opt.label}
                      </h3>
                      <p className="text-[10px] text-white/50 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                        {opt.desc}
                      </p>
                    </div>
                    {options[opt.id as keyof typeof options] && (
                      <div className="absolute top-4 right-4 w-5 h-5 shrink-0 rounded-full bg-hw-accent flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        <Check size={12} className="text-white font-bold" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-hw-muted font-black flex items-center gap-2">
                  <Languages size={14} className="text-hw-accent" /> {t.selectLanguage}
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'bn', label: t.bn },
                    { id: 'en', label: t.en },
                    { id: 'both', label: t.both },
                  ].map((lang) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={lang.id}
                      onClick={() => setOptions(prev => ({ ...prev, language: lang.id as any }))}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all shadow-inner",
                        options.language === lang.id ? "bg-hw-accent text-white border-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]" : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {lang.id === 'bn' && '🇧🇩 '}
                      {lang.id === 'en' && '🇺🇸 '}
                      {lang.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {(options.generateVideoPrompt || options.generateScript || currentView === 'shorts') && (
                <div className="space-y-6 pt-4 border-t border-[var(--border-main)]">
                  {currentView === 'shorts' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Clock size={14} className="text-[var(--accent-main)]" /> {t.videoDuration}
                          </label>
                          <span className="text-[var(--accent-main)] font-semibold text-sm">
                            {options.videoDuration} {t.seconds} ({Math.floor(options.videoDuration / 60)}m {options.videoDuration % 60}s)
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="8" 
                          max="3600" 
                          step="1"
                          value={options.videoDuration}
                          onChange={(e) => {
                            const duration = parseInt(e.target.value);
                            // ~150 words per minute, ~5 characters per word
                            // Capped at 4000 words to ensure LLM output doesn't truncate for long videos
                            const words = Math.min(4000, Math.max(20, Math.round((duration / 60) * 150)));
                            const chars = Math.min(20000, Math.max(100, words * 5));
                            setOptions(prev => ({ 
                              ...prev, 
                              videoDuration: duration,
                              scriptWordCount: words,
                              scriptCharacterCount: chars
                            }));
                          }}
                          className="w-full h-1.5 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all"
                        />
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                          <span>8s</span>
                          <span>60m</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Type size={14} className="text-[var(--accent-main)]" /> {t.scriptCharacters}
                          </label>
                          <span className="text-[var(--accent-main)] font-semibold text-sm bg-[var(--accent-main)]/10 px-3 py-1 rounded-lg">
                            {options.scriptCharacterCount} {t.charLimit}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="50000" 
                          step="50"
                          value={options.scriptCharacterCount}
                          onChange={(e) => setOptions(prev => ({ ...prev, scriptCharacterCount: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all shadow-inner"
                        />
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                          <span>100</span>
                          <span>50000</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {options.generateVideoPrompt && currentView !== 'shorts' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                          <Clock size={14} className="text-[var(--accent-main)]" /> {t.videoDuration}
                        </label>
                        <span className="text-[var(--accent-main)] font-semibold text-sm bg-[var(--accent-main)]/10 px-3 py-1 rounded-lg">
                          {options.videoDuration} {t.seconds} ({Math.floor(options.videoDuration / 60)}m {options.videoDuration % 60}s)
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="8" 
                        max="3600" 
                        step="1"
                        value={options.videoDuration}
                        onChange={(e) => {
                          const duration = parseInt(e.target.value);
                          // Calculate words based on ~160 words per minute speaking rate
                          // Capped at 4000 words to prevent LLM truncation
                          const words = Math.min(4000, Math.max(100, Math.round((duration / 60) * 160)));
                          setOptions(prev => ({ 
                            ...prev, 
                            videoDuration: duration,
                            scriptWordCount: words
                          }));
                        }}
                        className="w-full h-2 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all shadow-inner"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        <span>8s</span>
                        <span>60m</span>
                      </div>
                    </div>
                  )}

                  {options.generateScript && currentView !== 'shorts' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                          <Type size={14} className="text-[var(--accent-main)]" /> {t.scriptWords}
                        </label>
                        <span className="text-[var(--accent-main)] font-semibold text-sm bg-[var(--accent-main)]/10 px-3 py-1 rounded-lg">
                          {options.scriptWordCount} {t.words}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="10000" 
                        step="50"
                        value={options.scriptWordCount}
                        onChange={(e) => {
                          const words = parseInt(e.target.value);
                          // Calculate duration based on ~160 words per minute speaking rate
                          const duration = Math.min(3600, Math.max(8, Math.round((words / 160) * 60)));
                          setOptions(prev => ({ 
                            ...prev, 
                            scriptWordCount: words,
                            videoDuration: duration
                          }));
                        }}
                        className="w-full h-2 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all shadow-inner"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        <span>100w</span>
                        <span>10000w</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {currentView === 'image' && (
            <section className="glass-card p-8 space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                <ImageIcon size={16} className="text-hw-accent" /> {uiLang === 'en' ? "Aspect Ratio" : "অ্যাসপেক্ট রেশিও"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2', '21:9'].map((ratio) => (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={ratio}
                    onClick={() => setOptions(prev => ({ ...prev, aspectRatio: ratio as any }))}
                    className={cn(
                      "py-3 rounded-xl border text-xs font-bold transition-all shadow-inner",
                      options.aspectRatio === ratio 
                        ? "bg-hw-accent text-white border-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                        : "bg-black/40 text-white/50 border-white/10 hover:border-hw-accent/40 hover:text-white"
                    )}
                  >
                    {ratio}
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Advanced AI Context & Strategy */}
          {(currentView === 'video' || currentView === 'longVideo' || currentView === 'shorts' || options.generateScript) && (
            <section className="hw-panel p-8 md:p-12 space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-hw-accent/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="hw-label text-hw-accent flex items-center gap-2 uppercase tracking-[0.3em]">
                  <Rocket size={16} /> Advanced AI Strategy
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-hw-muted">{t.deepSearch}</span>
                  <button 
                    onClick={() => setOptions(prev => ({ ...prev, deepSearch: !prev.deepSearch }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative border border-white/10",
                      options.deepSearch ? "bg-hw-accent shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-black/40"
                    )}
                  >
                    <motion.div 
                      animate={{ x: options.deepSearch ? 26 : 4 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md shadow-black/50"
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Target Audience */}
                <div className="space-y-6">
                  <label className="hw-label opacity-40 text-[9px] flex items-center gap-2">
                    <UsersIcon size={14} className="text-hw-accent" /> {t.audience}
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {AUDIENCE_TYPES.map((aud) => (
                      <button
                        key={aud.id}
                        onClick={() => setOptions(prev => ({ ...prev, audience: aud.id }))}
                        className={cn(
                          "hw-btn-industrial w-full py-3.5 text-left px-5 text-[10px] flex items-center gap-3",
                          options.audience === aud.id && "active bg-hw-accent/20 border-hw-accent/40"
                        )}
                      >
                        <span className="text-xl filter grayscale group-[.active]:grayscale-0">{aud.icon}</span>
                        {translations[uiLang][aud.label as keyof typeof translations['en']]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Pacing */}
                <div className="space-y-6">
                  <label className="hw-label opacity-40 text-[9px] flex items-center gap-2">
                    <Zap size={14} className="text-hw-accent" /> {t.pacing}
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {PACING_TYPES.map((pace) => (
                      <button
                        key={pace.id}
                        onClick={() => setOptions(prev => ({ ...prev, pacing: pace.id }))}
                        className={cn(
                          "hw-btn-industrial w-full py-3.5 text-left px-5 text-[10px] flex items-center gap-3",
                          options.pacing === pace.id && "active bg-hw-accent/20 border-hw-accent/40"
                        )}
                      >
                        <span className="text-xl filter grayscale group-[.active]:grayscale-0">{pace.icon}</span>
                        {translations[uiLang][pace.label as keyof typeof translations['en']]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Narrative Strategy */}
                <div className="space-y-6">
                  <label className="hw-label opacity-40 text-[9px] flex items-center gap-2">
                    <ScrollText size={14} className="text-hw-accent" /> {t.narrativeStrategy}
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {NARRATIVE_STRATEGIES.map((strat) => (
                      <button
                        key={strat.id}
                        onClick={() => setOptions(prev => ({ ...prev, narrativeStrategy: strat.id }))}
                        className={cn(
                          "hw-btn-industrial w-full py-3.5 text-left px-5 text-[10px] flex items-center gap-3",
                          options.narrativeStrategy === strat.id && "active bg-hw-accent/20 border-hw-accent/40"
                        )}
                      >
                        <span className="text-xl filter grayscale group-[.active]:grayscale-0">{strat.icon}</span>
                        {translations[uiLang][strat.label as keyof typeof translations['en']]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={loading || (!(currentView === 'home' ? (topics.home || topics.promptGen) : currentTopic) && !currentSelectedMedia)}
            className="w-full btn-primary mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-black" size={24} /> 
                <span className="text-lg font-bold tracking-wider uppercase">{t.processing}</span>
              </>
            ) : (
              <>
                <Zap size={24} className="text-white group-hover:rotate-12 transition-transform" /> 
                <span className="text-lg font-bold tracking-wider uppercase">
                  {
                    (currentView === 'video' || currentView === 'longVideo') ? t.genPrompt : 
                    currentView === 'idea' ? t.genIdea : 
                    currentView === 'image' ? t.genImage :
                    currentView === 'voice' ? t.genVoice :
                    currentView === 'voiceExtractor' ? t.genVoiceExtractor :
                    (currentView === 'promptGen' || (currentView === 'home' && topics.promptGen.trim())) ? (uiLang === 'en' ? "Generate Prompt" : "প্রম্পট তৈরি করুন") :
                    (uiLang === 'en' ? "Generate Content" : "কন্টেন্ট তৈরি করুন")
                  }
                </span>
              </>
            )}
          </motion.button>
        </div>

                <div className="lg:col-span-12 xl:col-span-12 w-full max-w-7xl mx-auto pt-20 border-t border-white/5 space-y-12 pb-32">
                  <div className="flex items-center justify-between">
                    <h3 className="hw-label text-hw-accent flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Sparkles size={14} /> Neural Synthetic Result
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="hw-led bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-hw-muted">Process Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="hw-panel p-10 md:p-16 min-h-[700px] flex flex-col relative group">
                    <div className="studio-grid-bg opacity-10" />
                    
                    <div className="flex items-center justify-between mb-12 relative z-10 border-b border-white/5 pb-8">
                      <div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white uppercase leading-tight">
                          System <span className="text-hw-accent">Output</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="p-1 px-3 bg-hw-accent/20 border border-hw-accent/30 rounded text-[9px] font-black uppercase text-hw-accent tracking-widest">
                            {currentView}
                          </div>
                          <span className="text-[8px] font-black text-hw-muted uppercase tracking-[0.3em]">Hash: AX-902-88B</span>
                        </div>
                      </div>
                      
                      {currentResult && !currentResult.imageUrl && !currentResult.audioUrl && (
                        <button 
                          onClick={() => {
                            let allText = "";
                            if (currentResult.prompts) {
                              allText = currentResult.prompts.map((p: string, idx: number) => `Option ${idx + 1}:\n${p}`).join('\n\n');
                            } else if (currentResult.ideas) {
                              allText = currentResult.ideas.map((i: any, idx: number) => `${idx + 1}. ${i.title}\n${i.description}`).join('\n\n');
                            } else {
                              allText = Object.entries(currentResult)
                                .filter(([k, v]) => typeof v === 'string')
                                .map(([k, v]) => `${k.toUpperCase()}:\n${v}`)
                                .join('\n\n');
                            }
                            copyToClipboard(allText, 'copy-all');
                          }}
                          className="hw-btn-industrial py-3 px-8 text-[10px]"
                        >
                          {copied === 'copy-all' ? <Check size={14} className="text-green-500" /> : <Copy size={16} className="hw-icon text-hw-accent" />}
                          {t.copyAll}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 relative z-10 overflow-y-auto scrollbar-hide pr-2">
                      {!currentResult && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-10">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-hw-accent/10 flex items-center justify-center text-hw-accent border border-hw-accent/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative">
                             <div className="absolute inset-[-10px] border border-hw-accent/10 rounded-[3rem] animate-pulse" />
                             <Sparkles size={64} />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-4xl font-bold text-white tracking-tight uppercase leading-tight">{t.readyToCreate}</h3>
                            <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em]">{t.readySubtitle}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {[
                              { label: t.viralScript, icon: ScrollText, view: 'video' },
                              { label: t.seoTags, icon: Tag, view: 'youtube' },
                              { label: t.thumbnail, icon: ImageIcon, view: 'image' },
                              { label: t.aiVideo, icon: Video, view: 'video' }
                            ].map((item, i) => (
                              <button 
                                key={i}
                                onClick={() => setCurrentView(item.view as any)}
                                className="hw-panel p-6 bg-black/40 hover:border-hw-accent/40 transition-all group"
                              >
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-hw-muted group-hover:text-hw-accent group-hover:scale-110 transition-all mb-4">
                                  <item.icon size={22} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-hw-muted">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-12 bg-black/60 rounded-[2rem] border border-hw-accent/20 backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 studio-grid-bg opacity-20" />
                    
                    <div className="relative z-10 w-48 h-48">
                      <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                        className="absolute inset-0 rounded-full border-2 border-hw-accent/30 border-t-hw-accent shadow-[0_0_50px_rgba(34,197,94,0.15)]"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border border-hw-accent/10 border-b-hw-accent/50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-hw-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]"
                          >
                            <Sparkles size={56} strokeWidth={1} />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-sm space-y-8 z-10">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <div className="hw-label text-hw-accent text-[10px] h-4">
                            <TypewriterText text={t.loadingSteps[loadingStep] || t.processing} className="font-black italic uppercase italic tracking-widest" />
                          </div>
                          <span className="hw-display p-1 px-2 text-[10px] leading-none">{Math.round(loadingProgress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                          <motion.div 
                            className="h-full bg-hw-accent relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{ type: "spring", stiffness: 45, damping: 12 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_1.5s_linear_infinite]" />
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        {[0, 1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-6 rounded-sm transition-all duration-500",
                              i <= loadingStep 
                                ? "bg-hw-accent shadow-[0_0_15px_rgba(139,92,246,0.6)]" 
                                : "bg-white/5"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="hw-panel bg-black/40 p-4 border-white/5 z-10 w-full max-w-xs">
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-hw-muted text-center leading-loose">
                        {uiLang === 'en' 
                          ? "Calibrating Neural Synthesis Matrix..." 
                          : "নিউরাল সিন্থেসিস মেট্রিক্স ক্যালিব্রেট করা হচ্ছে..."}
                      </p>
                    </div>
                  </div>
                )}

                {currentResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 space-y-10 overflow-y-auto pr-4 scrollbar-hide"
                  >
                    {(!currentResult.imageUrl && !currentResult.audioUrl) && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={downloadPdf}
                          className="hw-btn-industrial py-4 text-[10px] bg-hw-accent/20 border-hw-accent/20 text-hw-accent"
                        >
                          <Download size={18} className="hw-icon" />
                          {uiLang === 'en' ? "Export PDF" : "পিডিএফ এক্সপোর্ট"}
                        </button>
                        <button
                          onClick={shareContent}
                          className="hw-btn-industrial py-4 text-[10px] bg-blue-500/10 border-blue-500/20 text-blue-400"
                        >
                          <Share2 size={18} className="hw-icon" />
                          {uiLang === 'en' ? "Direct Share" : "সরাসরি শেয়ার"}
                        </button>
                      </div>
                    )}
                    
                    {currentResult.imageUrl && (
                      <div className="space-y-6">
                        <div className="hw-panel aspect-video p-0 overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                          <img src={currentResult.imageUrl} alt="Generated" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-md">
                            <a 
                              href={currentResult.imageUrl} 
                              download="gen-img.png"
                              className="w-16 h-16 rounded-full bg-hw-accent flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                            >
                              <Download size={32} />
                            </a>
                            <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:scale-110 transition-transform border border-white/20">
                              <Expand size={32} />
                            </button>
                          </div>
                        </div>
                        <div className="hw-panel py-3 bg-black/40 border-white/5">
                           <p className="text-[10px] uppercase tracking-[0.3em] text-hw-muted text-center font-black">{t.generatedImage}</p>
                        </div>
                      </div>
                    )}
                    {(currentResult.audioUrl && currentView === 'voice') && (
                      <div className="hw-panel p-10 md:p-16 flex flex-col items-center gap-10 bg-hw-accent/5">
                        <div className="w-32 h-32 rounded-full bg-hw-accent/10 flex items-center justify-center text-hw-accent animate-pulse shadow-[0_0_40px_rgba(139,92,246,0.15)] border border-hw-accent/20">
                          <Volume2 size={64} />
                        </div>
                        <div className="w-full space-y-6">
                          <audio controls src={currentResult.audioUrl} className="w-full hw-audio-player" />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                           <a 
                             href={currentResult.audioUrl} 
                             download="synth-voice.wav"
                             className="hw-btn-industrial py-5 px-12 text-sm shadow-[0_15px_40px_rgba(34,197,94,0.1)]"
                           >
                             <Download size={24} className="hw-icon" /> {t.downloadAudio}
                           </a>
                           <p className="text-[9px] uppercase tracking-[0.5em] text-hw-muted font-black">{t.voiceNote}</p>
                        </div>
                      </div>
                    )}
                    {(!currentResult.imageUrl && !(currentResult.audioUrl && currentView === 'voice')) && (
                      <div className="space-y-16">
                        {/* Audio Module */}
                        {currentResult.audioUrl && (
                          <div className="hw-panel p-8 bg-hw-accent/5 border-hw-accent/20 space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="hw-label text-hw-accent flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Volume2 size={16} /> Synthesis Module Activated
                              </h4>
                              <a href={currentResult.audioUrl} download className="text-hw-muted hover:text-hw-accent transition-colors">
                                <Download size={20} />
                              </a>
                            </div>
                            <audio controls src={currentResult.audioUrl} className="w-full h-10 hw-audio-player" />
                          </div>
                        )}

                        {/* Top Performance Components */}
                        {(currentResult.videoTitle || currentResult.imagePrompt || currentResult.videoPrompt) && (
                          <div className="space-y-8">
                            {currentResult.videoTitle && (
                              <div className="hw-panel p-8 bg-hw-accent/10 border-hw-accent/30 space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="hw-label text-hw-accent uppercase tracking-[0.2em]">Alpha Title</label>
                                  <button onClick={() => copyToClipboard(currentResult.videoTitle, 'videoTitle')} className="text-hw-muted hover:text-hw-accent transition-colors">
                                    {copied === 'videoTitle' ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                                </div>
                                <div className="text-2xl font-bold text-white leading-tight italic">{currentResult.videoTitle}</div>
                              </div>
                            )}

                            {currentResult.imagePrompt && (
                              <div className="hw-panel p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="hw-label text-white/40 uppercase tracking-[0.2em]">Image Render Prompt</label>
                                  <button onClick={() => copyToClipboard(currentResult.imagePrompt, 'imagePrompt')} className="text-hw-muted hover:text-hw-accent transition-colors">
                                    {copied === 'imagePrompt' ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                                </div>
                                <div className="hw-display p-6 text-sm text-hw-muted leading-relaxed italic">{currentResult.imagePrompt}</div>
                              </div>
                            )}

                            {currentResult.videoPrompt && (
                              <div className="hw-panel p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="hw-label text-white/40 uppercase tracking-[0.2em]">Video Render Prompt</label>
                                  <button onClick={() => copyToClipboard(currentResult.videoPrompt, 'videoPrompt')} className="text-hw-muted hover:text-hw-accent transition-colors">
                                    {copied === 'videoPrompt' ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                                </div>
                                <div className="hw-display p-6 text-sm text-hw-muted leading-relaxed italic">{currentResult.videoPrompt}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Iterative Result Set */}
                        {Object.entries(currentResult).map(([key, value]) => {
                          if (!value || ['videoTitle', 'imagePrompt', 'videoPrompt', 'imageUrl', 'audioUrl'].includes(key)) return null;
                          
                          if (key === 'prompts' && Array.isArray(value)) {
                            return (
                              <div key="p-sec" className="space-y-8">
                                <h3 className="hw-label text-white/50 flex items-center gap-3 uppercase tracking-[0.5em] text-[10px]">
                                  <div className="w-2 h-2 rounded-full bg-hw-accent animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                  Neural Prompt Variations
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                  {value.map((prompt: string, idx: number) => (
                                    <div key={idx} className="hw-panel p-8 bg-black/40 border-white/5 hover:border-hw-accent/20 transition-all group">
                                      <div className="flex justify-between items-center mb-6">
                                        <div className="hw-label text-hw-accent/60 text-[9px]">Iteration_{idx + 1}</div>
                                        <button onClick={() => copyToClipboard(prompt, `p-${idx}`)} className="text-hw-muted hover:text-hw-accent">
                                          {copied === `p-${idx}` ? <Check size={20} className="text-hw-accent" /> : <Copy size={20} />}
                                        </button>
                                      </div>
                                      <div className="hw-display p-6 text-sm text-hw-muted leading-relaxed italic">
                                        <TypewriterText text={prompt} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle checklists specifically
                          if (key === 'seoChecklist' || key === 'contentChecklist') {
                            return (
                              <div key={key} className="space-y-8">
                                <h3 className="hw-label text-white/50 flex items-center gap-3 uppercase tracking-[0.5em] text-[10px]">
                                  <div className="hw-led bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                  Optimization Protocol
                                </h3>
                                <div className="hw-panel p-10 bg-hw-accent/5 overflow-hidden">
                                  <InteractiveChecklist
                                    data={Array.isArray(value) ? value : String(value).split('\n').filter(l => l.trim())}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Handle ideas array
                          if (key === 'ideas' && Array.isArray(value)) {
                            return (
                              <div key="ideas-section" className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2 px-2">
                                  <Lightbulb size={14} /> {uiLang === 'en' ? 'Video Ideas' : 'ভিডিও আইডিয়া'}
                                </label>
                                <div className="grid grid-cols-1 gap-4">
                                  {value.map((idea: any, idx: number) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 group shadow-sm hover:border-hw-accent/30 transition-all">
                                      <div className="flex justify-between items-start">
                                        <h3 className="text-hw-accent font-black text-[10px] uppercase tracking-widest">{idx + 1}. {idea.title}</h3>
                                        <button 
                                          onClick={() => copyToClipboard(`${idea.title}\n\n${idea.description}`, `idea-${idx}`)}
                                          className="text-white/50 hover:text-hw-accent transition-colors"
                                        >
                                          {copied === `idea-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        </button>
                                      </div>
                                      <div className="text-sm text-white/80 leading-relaxed font-medium">
                                        <TypewriterText text={idea.description} className="typewriter-text" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Handle titles array (top level)
                          if (key === 'titles' && Array.isArray(value)) {
                            return (
                              <div key="titles-section" className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2 px-2">
                                  <LayoutTemplate size={14} /> {uiLang === 'en' ? 'Title Variations' : 'শিরোনাম বৈচিত্র্য'}
                                </label>
                                <div className="grid grid-cols-1 gap-4">
                                  {value.map((t: any, idx: number) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 group shadow-sm hover:border-hw-accent/30 transition-all">
                                      <div className="flex justify-between items-start">
                                        <h3 className="text-hw-accent font-black text-[10px] uppercase tracking-widest">Variation {idx + 1}</h3>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="p-5 rounded-xl bg-hw-accent/5 border border-hw-accent/20 space-y-2">
                                          <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black">SEO Title</label>
                                          <div className="text-sm font-bold text-white leading-relaxed">{t.title}</div>
                                          <button onClick={() => copyToClipboard(t.title, `title-${idx}`)} className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2">
                                            {copied === `title-${idx}` ? <Check size={14} /> : <Copy size={14} />} Copy
                                          </button>
                                        </div>
                                        <div className="p-5 rounded-xl bg-hw-accent/5 border border-hw-accent/20 space-y-2">
                                          <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black">High CTR Title</label>
                                          <div className="text-sm font-black text-white leading-relaxed">{t.highCtrTitle}</div>
                                          <button onClick={() => copyToClipboard(t.highCtrTitle, `highCtr-${idx}`)} className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2">
                                            {copied === `highCtr-${idx}` ? <Check size={14} /> : <Copy size={14} />} Copy
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Handle seoTitles array (top level)
                          if (key === 'seoTitles' && Array.isArray(value)) {
                            return (
                              <div key="seo-titles-section" className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2 px-2">
                                  <Zap size={14} /> {uiLang === 'en' ? 'SEO Friendly Video Titles' : 'SEO ফ্রেন্ডলি ভিডিও টাইটেল'}
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                  {value.map((title: string, idx: number) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center group/title hover:border-hw-accent/30 transition-all">
                                      <div className="text-base font-bold text-white leading-relaxed">
                                        <TypewriterText text={title} className="typewriter-text" />
                                      </div>
                                      <button onClick={() => copyToClipboard(title, `seoTitle-${idx}`)} className="text-white/30 hover:text-hw-accent transition-colors">
                                        {copied === `seoTitle-${idx}` ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle nested subtitles object
                          if (key === 'subtitles' && typeof value === 'object' && value !== null) {
                            return Object.entries(value).map(([langKey, langValue]) => {
                              const langNames: any = {
                                en: 'English',
                                bn: 'Bengali',
                                hi: 'Hindi',
                                es: 'Spanish',
                                fr: 'French'
                              };
                              const langName = langNames[langKey] || langKey;
                              
                              return (
                                <div key={`subtitle-${langKey}`} className="space-y-4 group">
                                  <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-hw-accent/10 flex items-center justify-center">
                                        <Languages size={14} />
                                      </div>
                                      {uiLang === 'en' ? `${langName} Subtitles` : `${langName} সাবটাইটেল`}
                                    </label>
                                    <div className="flex gap-4">
                                      <button 
                                        onClick={() => {
                                          const blob = new Blob([String(langValue)], { type: 'text/plain' });
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `subtitles_${langKey}.srt`;
                                          a.click();
                                          URL.revokeObjectURL(url);
                                        }}
                                        className="text-white/50 hover:text-hw-accent transition-all hover:scale-110"
                                        title="Download .srt"
                                      >
                                        <Download size={18} />
                                      </button>
                                      <button 
                                        onClick={() => copyToClipboard(String(langValue), `subtitle-${langKey}`)}
                                        className="text-white/50 hover:text-hw-accent transition-all hover:scale-110"
                                      >
                                        {copied === `subtitle-${langKey}` ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-8 rounded-3xl bg-black/40 border border-white/10 text-sm text-white/90 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar shadow-inner group-hover:border-hw-accent/30 transition-all duration-500 font-medium">
                                    <TypewriterText text={String(langValue)} className="typewriter-text" />
                                  </div>
                                </div>
                              );
                            });
                          }

                          // Handle nested metadata object from video analysis
                          if (key === 'metadata' && typeof value === 'object' && value !== null) {
                            return (
                              <div key="metadata-section" className="space-y-6 pt-8 border-t border-white/10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                                  <FileText size={16} className="text-hw-accent" />
                                  {uiLang === 'en' ? "Video Metadata" : "ভিডিও মেটাডেটা"}
                                </h3>
                                {Object.entries(value).map(([mKey, mValue]) => {
                                  const mLabelMap: any = {
                                    title: { label: uiLang === 'en' ? "Suggested Title" : "প্রস্তাবিত শিরোনাম", icon: FileText },
                                    titles: { label: uiLang === 'en' ? "Multiple Title Variations" : "একাধিক শিরোনাম বৈচিত্র্য", icon: LayoutTemplate },
                                    seoTitles: { label: uiLang === 'en' ? "SEO Friendly Titles" : "SEO ফ্রেন্ডলি টাইটেল", icon: Zap },
                                    highCtrTitle: { label: t.highCtrTitle, icon: Zap },
                                    thumbnailTitle: { label: t.thumbnailTitle, icon: ImageIcon },
                                    thumbnailConcept: { label: uiLang === 'en' ? "Thumbnail Concept" : "থাম্বনেইল কনসেপ্ট", icon: Palette },
                                    description: { label: t.seoDescription, icon: FileText },
                                    tags: { label: t.tagsLabel, icon: Tag },
                                    hashtags: { label: t.hashtags, icon: Hash },
                                  };
                                  const mConfig = mLabelMap[mKey] || { label: mKey, icon: Sparkles };
                                  
                                  if (mKey === 'titles' && Array.isArray(mValue)) {
                                    return (
                                      <div key={`${key}-${mKey}`} className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2 px-2">
                                          <mConfig.icon size={14} /> {mConfig.label}
                                        </label>
                                        <div className="grid grid-cols-1 gap-4">
                                          {mValue.map((t: any, idx: number) => (
                                            <div key={idx} className="p-5 rounded-2xl bg-hw-accent/5 border border-hw-accent/20 space-y-3">
                                              <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-hw-accent/60 uppercase tracking-widest">Variation {idx + 1}</span>
                                                <button onClick={() => copyToClipboard(`${t.title}\n${t.highCtrTitle}`, `titles-${idx}`)} className="text-white/50 hover:text-hw-accent transition-colors">
                                                  {copied === `titles-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                              </div>
                                              <div className="space-y-2">
                                                <div className="text-sm font-medium text-white"><span className="text-hw-accent/50 mr-2 font-bold">SEO:</span> {t.title}</div>
                                                <div className="text-sm font-black text-white"><span className="text-hw-accent/50 mr-2 font-bold">CTR:</span> {t.highCtrTitle}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (mKey === 'seoTitles' && Array.isArray(mValue)) {
                                    return (
                                      <div key={`${key}-${mKey}`} className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2 px-2">
                                          <mConfig.icon size={14} /> {mConfig.label}
                                        </label>
                                        <div className="grid grid-cols-1 gap-3">
                                          {mValue.map((title: string, idx: number) => (
                                            <div key={idx} className="p-4 rounded-xl bg-hw-accent/5 border border-hw-accent/20 flex justify-between items-center group/title">
                                              <div className="text-sm font-bold text-white">{title}</div>
                                              <button onClick={() => copyToClipboard(title, `seoTitle-${idx}`)} className="text-white/30 hover:text-hw-accent transition-colors">
                                                {copied === `seoTitle-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  const displayValue = Array.isArray(mValue) ? mValue.join(', ') : String(mValue);
                                  
                                  // Make title more prominent
                                  if (mKey === 'title' || mKey === 'highCtrTitle') {
                                    return (
                                      <div key={`${key}-${mKey}`} className="p-6 rounded-2xl bg-hw-accent/5 border border-hw-accent/20 space-y-3">
                                        <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2">
                                          <mConfig.icon size={14} /> {mConfig.label}
                                        </label>
                                        <div className="text-lg font-black text-white">
                                          {displayValue}
                                        </div>
                                        <button 
                                          onClick={() => copyToClipboard(displayValue, `${key}-${mKey}`)}
                                          className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2"
                                        >
                                          {copied === `${key}-${mKey}` ? <Check size={14} /> : <Copy size={14} />}
                                          {uiLang === 'en' ? "Copy Title" : "শিরোনাম কপি করুন"}
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={`${key}-${mKey}`} className="space-y-3 group">
                                      <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-xl bg-hw-accent/10 flex items-center justify-center">
                                            <mConfig.icon size={14} />
                                          </div>
                                          {mConfig.label}
                                        </label>
                                        <button 
                                          onClick={() => copyToClipboard(displayValue, `${key}-${mKey}`)}
                                          className="text-white/50 hover:text-hw-accent transition-all hover:scale-110"
                                        >
                                          {copied === `${key}-${mKey}` ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                      </div>
                                      <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-sm text-white/90 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar font-medium shadow-inner">
                                        {displayValue}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }

                          // Handle socialMedia object
                          if (key === 'socialMedia' && typeof value === 'object' && value !== null) {
                            return (
                              <div key="social-media-section" className="space-y-6 pt-8 border-t border-white/10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                                  <Share2 size={16} className="text-hw-accent" />
                                  {uiLang === 'en' ? "Social Media Captions" : "সোশ্যাল মিডিয়া ক্যাপশন"}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(value).map(([sKey, sValue]) => {
                                    const sLabelMap: any = {
                                      facebook: { label: "Facebook", icon: Facebook, color: "text-blue-500" },
                                      linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
                                      instagram: { label: "Instagram", icon: Instagram, color: "text-hw-accent" },
                                      tiktok: { label: "TikTok", icon: Video, color: "text-white" },
                                    };
                                    const sConfig = sLabelMap[sKey] || { label: sKey, icon: MessageSquare, color: "text-hw-accent" };
                                    
                                    return (
                                      <div key={`social-${sKey}`} className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 group shadow-sm hover:border-hw-accent/30 transition-all">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <sConfig.icon size={18} className={sConfig.color} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{sConfig.label}</span>
                                          </div>
                                          <button 
                                            onClick={() => copyToClipboard(String(sValue), `social-${sKey}`)}
                                            className="text-white/50 hover:text-hw-accent transition-colors"
                                          >
                                            {copied === `social-${sKey}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                          </button>
                                        </div>
                                        <p className="text-sm text-white/90 leading-relaxed line-clamp-6 font-medium">
                                          {String(sValue)}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // Handle repurposeAddons array
                          if (key === 'repurposeAddons' && Array.isArray(value)) {
                            return (
                              <div key="repurpose-section" className="space-y-6 pt-8 border-t border-white/10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-hw-muted flex items-center gap-2">
                                  <Repeat size={16} className="text-emerald-500" />
                                  {uiLang === 'en' ? "Content Repurposing Ideas" : "কন্টেন্ট রিপারপাসিং আইডিয়া"}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {value.map((addon: string, idx: number) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                        <Lightbulb size={20} />
                                      </div>
                                      <span className="text-sm font-bold text-white leading-relaxed">{addon}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Handle sceneBreakdown array
                          if (key === 'sceneBreakdown' && Array.isArray(value)) {
                            return (
                              <div key="scene-breakdown" className="space-y-6 mt-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                  <Film className="text-hw-accent" size={20} />
                                  <h3 className="text-[10px] font-black uppercase tracking-widest text-hw-muted">
                                    {uiLang === 'en' ? "Scene-by-Scene Breakdown" : "সীন-বাই-সীন ব্রেকডাউন"}
                                  </h3>
                                </div>
                                <div className="space-y-6">
                                  {value.map((scene: any, idx: number) => (
                                    <div key={idx} className="p-8 rounded-[2rem] bg-black/40 border border-white/10 space-y-6 hover:border-hw-accent/30 transition-all group shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-hw-accent/20 flex items-center justify-center text-hw-accent font-black text-lg shadow-inner">
                                            {scene.scene || idx + 1}
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            <Clock size={14} className="text-hw-accent" /> {scene.time || "0:00"}
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => copyToClipboard(`Scene ${scene.scene}\nTime: ${scene.time}\nScript: ${scene.script}\nVisual: ${scene.visual}`, `scene-${idx}`)}
                                          className="text-white/50 hover:text-hw-accent transition-colors"
                                        >
                                          {copied === `scene-${idx}` ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2">
                                              <MessageSquare size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Script / Voiceover" : "স্ক্রিপ্ট / ভয়েসওভার"}
                                            </label>
                                            <div className="flex items-center gap-2">
                                              {sceneAudioUrls[`scene-${idx}`] ? (
                                                <audio 
                                                  src={sceneAudioUrls[`scene-${idx}`]} 
                                                  controls 
                                                  className="h-8 w-40 custom-audio-mini"
                                                />
                                              ) : (
                                                <button
                                                  onClick={() => handleSceneVoiceOver(idx, scene.script)}
                                                  disabled={loadingSceneAudio === `scene-${idx}`}
                                                  className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-hw-accent/10 text-hw-accent border border-hw-accent/20 hover:bg-hw-accent/20 transition-all flex items-center gap-2",
                                                    loadingSceneAudio === `scene-${idx}` && "opacity-50 cursor-not-allowed"
                                                  )}
                                                >
                                                  {loadingSceneAudio === `scene-${idx}` ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                  ) : (
                                                    <Volume2 size={14} />
                                                  )}
                                                  {uiLang === 'en' ? "Voice" : "ভয়েস"}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-sm text-white/90 leading-relaxed bg-black/40 p-5 rounded-2xl border border-white/10 font-medium shadow-inner">
                                            {scene.script}
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {(scene.visual || scene.videoPrompt) && (
                                            <div className="space-y-4">
                                              <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2">
                                                <Video size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Video Prompt" : "ভিডিও প্রম্পট"}
                                              </label>
                                              <p className="text-sm text-white/70 italic leading-relaxed bg-hw-accent/5 p-5 rounded-2xl border border-hw-accent/10 font-medium">
                                                {scene.videoPrompt || scene.visual}
                                              </p>
                                            </div>
                                          )}
                                          {scene.imagePrompt && (
                                            <div className="space-y-4">
                                              <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2">
                                                <ImageIcon size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Image Prompt" : "ইমেজ প্রম্পট"}
                                              </label>
                                              <p className="text-sm text-white/70 italic leading-relaxed bg-hw-accent/5 p-5 rounded-2xl border border-hw-accent/10 font-medium">
                                                {scene.imagePrompt}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (['videoTitle', 'imagePrompt', 'imageUrl', 'audioUrl', 'prompts', 'ideas', 'scenes', 'titles', 'seoTitles', 'subtitles', 'metadata', 'socialMedia', 'repurposeAddons', 'sceneBreakdown', 'seoChecklist', 'contentChecklist'].includes(key)) {
                            return null;
                          }

                          const labelMap: any = {
                            summary: { label: uiLang === 'en' ? "Video Summary" : "ভিডিও সারাংশ", icon: FileText },
                            translatedText: { label: uiLang === 'en' ? "Translated Text" : "অনুবাদিত টেক্সট", icon: Languages },
                            imagePrompt: { label: t.imagePromptLabel, icon: ImageIcon },
                            videoPrompt: { label: t.videoPromptLabel, icon: Video },
                            thumbnailIdea: { label: t.thumbnailLabel, icon: ImageIcon },
                            description: { label: t.descLabel, icon: FileText },
                            tags: { label: t.tagsLabel, icon: Tag },
                            script: { label: t.scriptLabel, icon: ScrollText },
                            seoChecklist: { label: t.seoChecklistLabel, icon: Check },
                            keywords: { label: t.keywordsLabel, icon: Tag },
                            highCtrTitle: { label: t.highCtrTitle, icon: Zap },
                            thumbnailTitle: { label: t.thumbnailTitle, icon: ImageIcon },
                            hashtags: { label: t.hashtags, icon: Hash },
                          };

                          const config = labelMap[key] || { label: key, icon: Sparkles };
                          
                          return (
                            <div key={key} className="space-y-4 group">
                              <div className="flex items-center justify-between px-2">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-hw-accent/10 flex items-center justify-center">
                                    <config.icon size={14} />
                                  </div>
                                  {config.label}
                                </label>
                                <div className="flex gap-4">
                                  {key === 'script' && (
                                    <div className="flex gap-4 items-center">
                                      <button 
                                        onClick={() => shareScript('facebook', String(value))}
                                        className="text-white/50 hover:text-[#1877F2] transition-all hover:scale-110"
                                        title="Share on Facebook"
                                      >
                                        <Facebook size={18} />
                                      </button>
                                      <button 
                                        onClick={() => shareScript('twitter', String(value))}
                                        className="text-white/50 hover:text-[#1DA1F2] transition-all hover:scale-110"
                                        title="Share on Twitter"
                                      >
                                        <Twitter size={18} />
                                      </button>
                                      <button 
                                        onClick={() => shareScript('whatsapp', String(value))}
                                        className="text-white/50 hover:text-[#25D366] transition-all hover:scale-110"
                                        title="Share on WhatsApp"
                                      >
                                        <MessageCircle size={18} />
                                      </button>
                                      <button 
                                        onClick={() => shareScript('native', String(value))}
                                        className="text-white/50 hover:text-hw-accent transition-all hover:scale-110"
                                        title="Share"
                                      >
                                        <Share2 size={18} />
                                      </button>
                                      <button 
                                        onClick={downloadPdf}
                                        className="text-white/50 hover:text-indigo-400 transition-all hover:scale-110"
                                        title="Download PDF"
                                      >
                                        <Download size={18} />
                                      </button>
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => {
                                      if (key === 'keywords' && Array.isArray(value)) {
                                        const text = value.map((kw: any) => `${kw.keyword} (Vol: ${kw.searchVolume}, Comp: ${kw.competition})`).join('\n');
                                        copyToClipboard(text, key);
                                      } else {
                                        copyToClipboard(String(value), key);
                                      }
                                    }}
                                    className="text-white/50 hover:text-hw-accent transition-all hover:scale-110"
                                  >
                                    {copied === key ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                  </button>
                                </div>
                              </div>
                              <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 text-sm text-white/90 leading-relaxed whitespace-pre-wrap shadow-inner group-hover:border-hw-accent/30 transition-all duration-500 font-medium">
                                {key === 'keywords' && Array.isArray(value) ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="border-b border-white/10">
                                          <th className="py-4 px-4 text-[10px] uppercase text-white/50 font-black tracking-widest">Keyword</th>
                                          <th className="py-4 px-4 text-[10px] uppercase text-white/50 font-black tracking-widest">Volume</th>
                                          <th className="py-4 px-4 text-[10px] uppercase text-white/50 font-black tracking-widest">Competition</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {value.map((kw: any, i: number) => (
                                          <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-hw-accent/5 transition-colors">
                                            <td className="py-4 px-4 font-bold text-hw-accent">{kw.keyword}</td>
                                            <td className="py-4 px-4">
                                              <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                kw.searchVolume === 'High' ? "bg-green-500/20 text-green-500" :
                                                kw.searchVolume === 'Medium' ? "bg-yellow-500/20 text-yellow-500" :
                                                "bg-blue-500/20 text-blue-500"
                                              )}>
                                                {kw.searchVolume}
                                              </span>
                                            </td>
                                            <td className="py-4 px-4">
                                              <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                kw.competition === 'Low' ? "bg-green-500/20 text-green-500" :
                                                kw.competition === 'Medium' ? "bg-yellow-500/20 text-yellow-500" :
                                                "bg-red-500/20 text-red-500"
                                              )}>
                                                {kw.competition}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : key === 'seoChecklist' ? (
                                  <InteractiveChecklist data={value} />
                                ) : (
                                  <TypewriterText text={String(value)} className="typewriter-text" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                    {relatedIdeas.length > 0 && (
                      <div className="mt-20 space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="hw-label text-hw-accent flex items-center gap-3 uppercase tracking-[0.4em]">
                            <Sparkles size={16} /> Synthetic Expansion
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {relatedIdeas.map((idea, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setTopics(prev => ({ ...prev, [currentView]: idea.title }));
                                handleGenerate();
                              }}
                              className="hw-panel p-8 text-left bg-black/40 border-white/5 hover:border-hw-accent/30 transition-all group shadow-sm"
                            >
                              <div className="flex flex-col gap-4">
                                <h4 className="text-sm font-black text-white italic group-hover:text-hw-accent transition-colors uppercase tracking-tight">{idea.title}</h4>
                                <p className="text-[10px] font-black text-hw-muted leading-relaxed uppercase tracking-wider">{idea.description}</p>
                              </div>
                              <div className="mt-6 flex justify-end">
                                <Zap size={14} className="text-hw-muted group-hover:text-hw-accent transition-colors" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
        
        {currentView === 'analytics' && <AnalyticsView uiLang={uiLang} />}
      </motion.div>
    </AnimatePresence>

    <CollaborationChat 
      messages={messages}
      onSendMessage={sendMessage}
      roomId={roomId}
      onJoinRoom={setRoomId}
      isJoined={isJoined}
      isOpen={chatOpen}
      onToggle={() => setChatOpen(!chatOpen)}
    />
  </div>
</div>
</motion.div>
)}
</AnimatePresence>

      {/* Settings Modal */}
          <AnimatePresence>
            {showSettings && (
              <div className="fixed inset-0 z-[100] overflow-y-auto">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSettings(false)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-md"
                />
                
                {/* Centering Container */}
                <div className="min-h-screen flex items-center justify-center p-4">
                  {/* Modal Container */}
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
                      onClick={() => setShowSettings(false)}
                      className="p-3 text-white/50 hover:text-hw-accent transition-colors rounded-full hover:bg-white/5"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2 px-1">
                        <Palette size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Appearance Theme" : "অ্যাপিয়ারেন্স থিম"}
                      </label>
                      <div className="grid grid-cols-3 gap-4 p-2 bg-black/40 rounded-[1.5rem] border border-white/10 shadow-inner">
                        {[
                          { id: 'dark', label: uiLang === 'en' ? 'Dark' : 'ডার্ক', icon: Moon },
                          { id: 'light', label: uiLang === 'en' ? 'Light' : 'লাইট', icon: Sun },
                          { id: 'scifi', label: uiLang === 'en' ? 'Sci-Fi' : 'সাই-ফাই', icon: Rocket }
                        ].map((t) => (
                          <motion.button
                            key={t.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme(t.id as any)}
                            className={cn(
                              "relative py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 z-10",
                              theme === t.id ? "text-black" : "text-white/50 hover:text-white"
                            )}
                          >
                            {theme === t.id && (
                              <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 bg-hw-accent rounded-2xl -z-10 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <t.icon size={20} className={cn(
                              "transition-all duration-500",
                              theme === t.id ? "scale-110" : "scale-100"
                            )} />
                            {t.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* API Keys List */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2 px-1">
                          <Zap size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Manage API Keys" : "এপিআই কী ম্যানেজমেন্ট"}
                        </label>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          {(['gemini', 'openai', 'groq', 'deepseek', 'perplexity', 'gemma', 'openrouter'] as AIProvider[]).map((p) => (
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
                                    
                                    // Reset status when key changes
                                    setConnectionStatus(prev => ({ ...prev, [p]: val ? 'connected' : 'disconnected' }));
                                  }}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/40">
                                  <Key size={14} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed px-1">
                          {t.apiNote}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
                      <button 
                        onClick={saveAIConfig}
                        className="w-full py-5 rounded-[1.5rem] bg-hw-accent text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        <Save size={20} />
                        {uiLang === 'en' ? "Save Configuration" : "কনফিগারেশন সেভ করুন"}
                      </button>
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="w-full py-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
                      >
                        {uiLang === 'en' ? "Close Settings" : "সেটিংস বন্ধ করুন"}
                      </button>
                    </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            resetAIConfig();
                            setAiProvider('gemini');
                            setCustomGeminiKey('');
                            setCustomOpenaiKey('');
                            setCustomGroqKey('');
                            setCustomDeepseekKey('');
                            setCustomPerplexityKey('');
                            toast.success(uiLang === 'en' ? "AI Configuration Reset!" : "AI কনফিগারেশন রিসেট করা হয়েছে!");
                            setTimeout(() => window.location.reload(), 1000);
                          }}
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
                          <Download size={22} /> {uiLang === 'en' ? "Install as Android App" : "অ্যান্ড্রয়েড অ্যাপ হিসেবে ইনস্টল করুন"}
                        </button>
                      )}

                      <button 
                        onClick={clearHistory}
                        className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500/70 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-3"
                      >
                        <Trash2 size={16} /> {t.clearHistory}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00E5FF;
          opacity: 0.2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00E5FF;
          opacity: 0.4;
        }
      `}} />

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-black/80 border border-white/10 rounded-[2rem] p-6 sm:p-8 h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hw-accent to-transparent" />
              
              <div className="flex flex-col gap-6 w-full mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                      <History size={24} />
                    </div>
                    <span>{uiLang === 'en' ? "Generation History" : "জেনারেশন হিস্ট্রি"}</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={downloadHistory} 
                      className="p-3 rounded-xl text-white/50 hover:text-hw-accent hover:bg-white/5 transition-colors"
                      title="Download History"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={clearHistory} 
                      className="p-3 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Clear History"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="p-3 rounded-xl text-white/50 hover:text-hw-accent hover:bg-white/5 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={historyFilter} 
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="bg-black/50 text-[10px] uppercase font-black text-white/50 px-5 py-3 rounded-full border border-white/10 outline-none focus:border-hw-accent/50 transition-all cursor-pointer hover:bg-white/5 shadow-inner"
                  >
                    <option value="all">All Categories</option>
                    <option value="idea">Idea Gen</option>
                    <option value="image">Image Gen</option>
                    <option value="voice">Voice Gen</option>
                    <option value="shorts">Shorts Gen</option>
                    <option value="youtube">YouTube AI</option>
                  </select>
                  <button 
                    onClick={() => setHistorySort(s => s === 'newest' ? 'oldest' : 'newest')}
                    className="bg-black/50 text-[10px] uppercase font-black text-white/50 px-5 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 shadow-inner"
                  >
                    {historySort === 'newest' ? <ArrowDownWideNarrow size={12} /> : <ArrowUpWideNarrow size={12} />}
                    {historySort === 'newest' ? 'Newest First' : 'Oldest First'}
                  </button>
                  <div className="flex-1 min-w-[200px] relative">
                    <input 
                      type="text"
                      placeholder="Search keywords..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full bg-black/50 text-[10px] font-black text-white px-10 py-3 rounded-full border border-white/10 outline-none focus:border-hw-accent/50 transition-all placeholder:text-white/30 shadow-inner"
                    />
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50 px-3">Date Range:</span>
                    <input type="date" onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-transparent text-[10px] font-black text-white px-2 py-1 outline-none cursor-pointer" />
                    <span className="text-white/30 text-[10px]">→</span>
                    <input type="date" onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-transparent text-[10px] font-black text-white px-2 py-1 outline-none cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {history
                  .filter(item => 
                    (historyFilter === 'all' || item.type === historyFilter) &&
                    (historySearch === '' || item.topic.toLowerCase().includes(historySearch.toLowerCase())) &&
                    (dateRange.start === '' || new Date(item.id) >= new Date(dateRange.start)) &&
                    (dateRange.end === '' || new Date(item.id) <= new Date(dateRange.end))
                  )
                  .sort((a, b) => historySort === 'newest' ? Number(new Date(b.id)) - Number(new Date(a.id)) : Number(new Date(a.id)) - Number(new Date(b.id)))
                  .length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/30">
                    <Clock size={64} className="mb-4 opacity-10" />
                    <p className="font-medium">{t.noHistory}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history
                      .filter(item => 
                        (historyFilter === 'all' || item.type === historyFilter) &&
                        (historySearch === '' || item.topic.toLowerCase().includes(historySearch.toLowerCase())) &&
                        (dateRange.start === '' || new Date(item.id) >= new Date(dateRange.start)) &&
                        (dateRange.end === '' || new Date(item.id) <= new Date(dateRange.end))
                      )
                      .sort((a, b) => historySort === 'newest' ? Number(new Date(b.id)) - Number(new Date(a.id)) : Number(new Date(a.id)) - Number(new Date(b.id)))
                      .map((item) => (
                      <motion.div 
                        key={item.id}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 229, 255, 0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const targetView = item.type === 'youtube' ? 'home' : (item.type === 'image-to-prompt' ? 'image' : item.type as ViewType);
                          setCurrentView(targetView);
                          setResults(prev => ({ ...prev, [targetView]: item.result }));
                          setShowHistory(false);
                        }}
                        className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-hw-accent/30 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-inner">
                              {item.type === 'idea' && <Lightbulb size={18} />}
                              {item.type === 'image' && <ImageIcon size={18} />}
                              {item.type === 'voice' && <Mic size={18} />}
                              {item.type === 'voiceExtractor' && <AudioLines size={18} />}
                              {item.type === 'promptGen' && <Sparkles size={18} />}
                              {item.type === 'shorts' && <Zap size={18} />}
                              {item.type === 'image-to-prompt' && <Search size={18} />}
                              {item.type === 'youtube' && <Video size={18} />}
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-hw-accent font-black">
                              {
                                item.type === 'youtube' ? (uiLang === 'en' ? 'YouTube AI' : 'ইউটিউব এআই') : 
                                item.type === 'idea' ? t.ideaGenHistory : 
                                item.type === 'image' ? t.imageGenHistory :
                                item.type === 'voice' ? t.voiceGenHistory :
                                item.type === 'voiceExtractor' ? (uiLang === 'en' ? 'Voice Extractor' : 'ভয়েস এক্সট্র্যাক্টর') :
                                item.type === 'shorts' ? (uiLang === 'en' ? 'Shorts Gen' : 'শর্টস জেন') :
                                item.type === 'promptGen' ? t.promptGen :
                                t.imageAnalysis
                              }
                            </span>
                          </div>
                          <span className="text-[9px] text-white/50 font-black uppercase tracking-widest flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
                            <Clock size={10} />
                            {format(item.timestamp, 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-black line-clamp-2 group-hover:text-hw-accent transition-colors text-white leading-relaxed">
                          {item.topic}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-black/80 border border-white/10 rounded-[2rem] p-6 sm:p-8 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hw-accent to-transparent" />
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <MessageCircle size={24} />
                  </div>
                  <span>{t.contact}</span>
                </h2>
                <button 
                  onClick={() => setShowContact(false)}
                  className="p-3 text-white/50 hover:text-hw-accent transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                  {uiLang === 'en' ? "Have questions or feedback? We'd love to hear from you. Our team is here to help you grow your channel." : "আপনার কি কোনো প্রশ্ন বা মতামত আছে? আমরা আপনার কথা শুনতে পছন্দ করব। আমাদের টিম আপনার চ্যানেল বড় করতে সাহায্য করার জন্য এখানে আছে।"}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-black/40 border border-white/10 group hover:border-hw-accent/30 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent group-hover:scale-110 transition-transform shadow-inner">
                      <Globe size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Support Email</span>
                      <span className="text-sm text-white font-black">{APP_CONFIG.supportEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-black/40 border border-white/10 group hover:border-hw-accent/30 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent group-hover:scale-110 transition-transform shadow-inner">
                      <Facebook size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Facebook Page</span>
                      <span className="text-sm text-white font-black">{APP_CONFIG.facebookPage.replace('https://', '')}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContact(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-hw-accent text-white font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all active:scale-95"
                >
                  {uiLang === 'en' ? "Close" : "বন্ধ করুন"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
