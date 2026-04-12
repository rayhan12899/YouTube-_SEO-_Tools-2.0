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
  Users as UsersIcon
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

interface HistoryItem {
  id: string;
  timestamp: number;
  topic: string;
  result: any;
  type: 'image-to-prompt' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'youtube' | 'shorts';
}

type ViewType = 'landing' | 'home' | 'youtube' | 'video' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'analyze' | 'transcribe' | 'shorts' | 'analytics';

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
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8e9299" fontSize={12} />
              <YAxis stroke="#8e9299" fontSize={12} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#d4af37' }}
              />
              <Area type="monotone" dataKey="views" stroke="#d4af37" fillOpacity={1} fill="url(#colorViews)" />
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
                className="w-full py-2 bg-hw-accent text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
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
                      msg.user === 'You' ? "bg-hw-accent text-black" : "bg-white/5 text-white"
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
    analytics: ''
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
    analytics: null
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest'>('newest');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'scifi'>('dark');
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
      language: 'bn' as 'bn' | 'en' | 'both' | 'hi',
      voice: 'Kore' as 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr',
      voiceTone: 'Professional',
      voiceAccent: 'US',
      voiceAge: 'Adult',
      voiceLanguage: 'bn' as 'bn' | 'en' | 'hi',
      videoDuration: 60,
      scriptWordCount: 500,
      scriptCharacterCount: 1000,
      aspectRatio: '16:9' as '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2' | '21:9',
      promptCategory: 'Video' as 'Video' | 'Story' | 'Image' | 'Voice Over',
      cameraAngle: 'Wide',
      lighting: 'Natural',
      mood: 'Cinematic'
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
    analytics: null
  });
  const [mediaMimeType, setMediaMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTopic = topics[currentView];
  const currentResult = results[currentView];
  const currentSelectedMedia = selectedMedia[currentView];
  const acceptType = currentView === 'video' ? "video/*" : (currentView === 'voiceExtractor' ? "audio/*,video/*" : (currentView === 'image' ? "video/*,image/*" : "image/*"));

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
    if (showSettings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSettings]);

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
        age: options.voiceAge
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
        setResults(prev => ({ ...prev, [activeView]: res }));
        saveToHistory(activeTopic, res, 'shorts');
        toast.success(uiLang === 'en' ? "Shorts Script Generated!" : "শর্টস স্ক্রিপ্ট তৈরি হয়েছে!");
        playNotificationSound();
      } else if (activeView === 'image') {
        if (currentSelectedMedia) {
          setLoadingStep(2); // Generating...
          setLoadingProgress(40);
          if (mediaMimeType.startsWith('video/')) {
            const res = await generatePromptsFromVideo(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Video Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            playNotificationSound();
          } else {
            const res = await analyzeImage(currentSelectedMedia, mediaMimeType);
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
          age: options.voiceAge
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
      } else if (activeView === 'video') {
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
            const res = await analyzeImage(currentSelectedMedia, mediaMimeType);
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
        
        if (currentView === 'image' || currentView === 'video' || currentView === 'voiceExtractor') {
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
              res = await analyzeImage(base64, file.type);
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
        <div style="border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; box-sizing: border-box !important;">
          <h1 style="color: #d4af37 !important; margin: 0; font-size: 32px; box-sizing: border-box !important;">YouTube AI Content Report</h1>
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
      };

      if (currentResult.prompts) {
        contentHtml += `
          <div style="margin-bottom: 30px; background-color: transparent !important; box-sizing: border-box !important;">
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #d4af37 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Unique Prompts</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.prompts.map((prompt: string, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #d4af37 !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Option ${i + 1}</strong>
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
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #d4af37 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Viral Video Ideas</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.ideas.map((idea: any, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #d4af37 !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Idea ${i + 1}: ${idea.title}</strong>
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
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; box-sizing: border-box !important; word-break: break-word !important;">Keyword</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; box-sizing: border-box !important; word-break: break-word !important;">Volume</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; box-sizing: border-box !important; word-break: break-word !important;">Competition</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentResult[key].map((kw: any) => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px; box-sizing: border-box !important; word-break: break-word !important;">${kw.keyword}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; box-sizing: border-box !important; word-break: break-word !important;">${kw.searchVolume}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; box-sizing: border-box !important; word-break: break-word !important;">${kw.competition}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          } else {
            content = currentResult[key];
          }

          contentHtml += `
            <div style="margin-bottom: 30px !important; page-break-inside: avoid !important; background-color: transparent !important; box-sizing: border-box !important;">
              <h2 style="color: #1a1a1a !important; border-left: 4px solid #d4af37 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${labelMap[key]}</h2>
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
                <h2 style="color: #1a1a1a !important; border-left: 4px solid #d4af37 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${mLabelMap[mKey] || mKey}</h2>
                <div style="padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; white-space: pre-wrap !important; font-size: 14px !important; color: #333333 !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  ${displayValue}
                </div>
              </div>
            `;
          }
        });
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
      analytics: ''
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
      analytics: null
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
      analytics: null
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
      color: #d4af37;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #d4af37;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .btn:hover {
      background: rgba(212, 175, 55, 0.2);
    }
    .btn-primary {
      background: #d4af37;
      color: #000;
    }
    .btn-primary:hover {
      background: #b8860b;
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
      color: #d4af37;
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
          ctx.fillStyle = '#d4af37';
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
    <div className={cn("min-h-screen mesh-gradient text-[var(--text-main)] font-sans selection:bg-[var(--accent-main)]/30 selection:text-white pb-24 md:pb-0", theme)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
        <Toaster position="top-right" richColors theme={theme === 'light' ? 'light' : 'dark'} />
        
        <AnimatePresence mode="wait">
          {currentView === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col bg-[var(--bg-main)]"
            >
              {/* Navigation */}
              <nav className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-[100] pointer-events-none">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4 cursor-pointer pointer-events-auto group"
                  onClick={() => setCurrentView('landing')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center border border-[var(--accent-main)]/20 group-hover:scale-105 transition-transform duration-300">
                    <Youtube className="text-[var(--accent-main)]" size={24} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors">{t.title}</span>
                </motion.div>
                
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="hidden lg:flex items-center gap-8 px-8 py-3 rounded-2xl glass-card pointer-events-auto"
                >
                  {['Features', 'About', 'Testimonials', 'Pricing', 'Contact'].map((item) => (
                    <button 
                      key={item}
                      className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="pointer-events-auto"
                >
                  <button
                    onClick={() => setCurrentView('home')}
                    className="btn-primary py-3 px-6 text-sm"
                  >
                    {t.getStarted}
                  </button>
                </motion.div>
              </nav>

              {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--accent-main)]/5 rounded-full blur-[100px] -z-10" />
                
                <div className="max-w-5xl mx-auto px-6 text-center space-y-12 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 text-[var(--accent-main)] text-xs font-semibold tracking-wide"
                  >
                    <Sparkles size={14} /> {t.subtitle}
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-[var(--text-main)]"
                  >
                    {uiLang === 'en' ? (
                      <>
                        Create <span className="text-[var(--accent-main)]">Viral</span><br />
                        Content with AI
                      </>
                    ) : (
                      <>
                        এআই দিয়ে তৈরি করুন <br />
                        <span className="text-[var(--accent-main)]">ভাইরাল কন্টেন্ট</span>
                      </>
                    )}
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-2xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
                  >
                    {t.heroSubtitle}
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                  >
                    <button 
                      onClick={() => setCurrentView('home')} 
                      className="btn-primary w-full sm:w-auto"
                    >
                      {t.getStarted} <ChevronRight size={18} />
                    </button>
                    <button className="btn-secondary w-full sm:w-auto">
                      {t.features}
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* About Section - Bento Style */}
              <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[var(--border-main)] to-transparent" />
                
                <div className="max-w-7xl mx-auto space-y-24">
                  <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/10 text-[var(--accent-main)] text-[10px] font-bold uppercase tracking-[0.2em]">
                      <Info size={14} />
                      {t.about}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold text-[var(--text-main)] tracking-tight leading-none">
                      Engineered for <span className="text-[var(--accent-main)] italic">Creators</span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed">
                      {uiLang === 'en' ? "We've built the most sophisticated AI engine specifically for video content creators. Every tool is optimized for engagement and growth." : "আমরা ভিডিও কন্টেন্ট ক্রিয়েটরদের জন্য বিশেষভাবে সবচেয়ে উন্নত এআই ইঞ্জিন তৈরি করেছি। প্রতিটি টুল এনগেজমেন্ট এবং গ্রোথের জন্য অপ্টিমাইজ করা হয়েছে।"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-8 p-8 md:p-10 rounded-[2.5rem] glass-card group relative overflow-hidden shadow-xl"
                    >
                      <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] group-hover:bg-[var(--accent-main)] group-hover:text-black transition-all duration-500">
                          <Zap size={28} />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">Lightning Fast Generation</h4>
                          <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed max-w-xl">
                            Our AI models are optimized for speed, delivering high-quality scripts, ideas, and images in under 5 seconds. No more waiting for inspiration.
                          </p>
                        </div>
                      </div>
                      <div className="mt-10 relative h-56 overflow-hidden rounded-2xl border border-[var(--border-main)]/50">
                        <img src="https://picsum.photos/seed/speed/1200/600" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide">
                            <Clock size={14} /> 4.2s Avg Response
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-4 p-8 md:p-10 rounded-[2.5rem] glass-card group shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] group-hover:bg-[var(--accent-main)] group-hover:text-black transition-all duration-500">
                          <Shield size={28} />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xl md:text-2xl font-bold text-[var(--text-main)] tracking-tight">Privacy First</h4>
                          <p className="text-[var(--text-muted)] leading-relaxed">
                            Your API keys and content never leave your browser. We prioritize your data security and creative intellectual property.
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 p-4 rounded-xl bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
                          <Lock size={16} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--accent-main)]">End-to-End Encrypted</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-4 p-8 md:p-10 rounded-[2.5rem] glass-card group shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] group-hover:bg-[var(--accent-main)] group-hover:text-black transition-all duration-500">
                          <Users size={28} />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xl md:text-2xl font-bold text-[var(--text-main)] tracking-tight">Creator Community</h4>
                          <p className="text-[var(--text-muted)] leading-relaxed">
                            Join thousands of creators who are scaling their channels with our AI tools. Share tips and grow together.
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                          <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-[var(--bg-card)] object-cover" referrerPolicy="no-referrer" />
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--bg-card)] bg-[var(--accent-main)] flex items-center justify-center text-black text-xs font-bold">
                          +10k
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-8 p-8 md:p-10 rounded-[2.5rem] glass-card group relative overflow-hidden shadow-xl"
                    >
                      <div className="flex flex-col md:flex-row gap-10 items-center h-full">
                        <div className="space-y-6 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] group-hover:bg-[var(--accent-main)] group-hover:text-black transition-all duration-500">
                            <Globe size={28} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">Multi-Language Support</h4>
                            <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                              Create content in English, Bengali, and Hindi with perfect cultural context and nuance. Reach a global audience effortlessly.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {['🇺🇸', '🇧🇩', '🇮🇳'].map(f => (
                            <motion.div 
                              key={f} 
                              whileHover={{ scale: 1.05, rotate: 5 }}
                              className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-3xl shadow-md"
                            >
                              {f}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="relative py-32 bg-[var(--bg-main)] overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--accent-main),transparent_70%)]" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 text-[var(--accent-main)] text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                        <Zap size={14} className="text-[var(--accent-main)]" />
                        {uiLang === 'en' ? "Powerful Capabilities" : "শক্তিশালী ক্ষমতা"}
                      </div>
                      <h2 className="text-5xl md:text-7xl font-bold text-[var(--text-main)] leading-[0.9] tracking-tight">
                        Our Powerful <br/> <span className="text-[var(--text-muted)] italic">Features</span>
                      </h2>
                      <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed max-w-lg">
                        {uiLang === 'en' ? "We provide everything you need to grow your channel and automate your content workflow with cutting-edge AI." : "আমরা আপনার চ্যানেল বড় করতে এবং অত্যাধুনিক এআই দিয়ে আপনার কন্টেন্ট ওয়ার্কফ্লো অটোমেট করতে প্রয়োজনীয় সবকিছু সরবরাহ করি।"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { title: "Script Generator", desc: "Viral scripts in seconds.", icon: <FileText size={20} /> },
                          { title: "Shorts Creator", desc: "Optimized for vertical video.", icon: <Zap size={20} /> },
                          { title: "SEO Tools", desc: "Rank higher on search.", icon: <Search size={20} /> },
                          { title: "Voice Over", desc: "Natural AI voices.", icon: <Mic size={20} /> }
                        ].map((f, i) => (
                          <motion.div 
                            key={i} 
                            whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            className="p-8 rounded-[2rem] bg-[var(--bg-card)]/40 border border-[var(--border-main)] backdrop-blur-xl group transition-all"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)] mb-6 group-hover:scale-110 transition-transform">
                              {f.icon}
                            </div>
                            <h4 className="text-lg font-bold text-[var(--text-main)] mb-2 tracking-tight">{f.title}</h4>
                            <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed">{f.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-[var(--accent-glow)] rounded-[4rem] blur-3xl group-hover:bg-[var(--accent-glow)]/20 transition-all duration-700" />
                      <img 
                        src="https://picsum.photos/seed/features/1000/1000" 
                        alt="Features" 
                        className="relative rounded-[3rem] shadow-2xl border border-[var(--border-main)] transform group-hover:scale-[1.02] transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section className="py-32 bg-[var(--bg-main)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-[var(--border-main)] to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6 space-y-24">
                  <div className="text-center space-y-6 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/10 text-[var(--accent-main)] text-[10px] font-bold uppercase tracking-[0.2em]">
                      <MessageSquare size={14} />
                      {uiLang === 'en' ? "User Stories" : "ব্যবহারকারীর গল্প"}
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-main)] tracking-tight leading-none">
                      Happy <span className="text-[var(--accent-main)] italic">Creators</span> <br/> Say
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg font-medium">
                      {uiLang === 'en' ? "Join thousands of successful creators who have transformed their content with our AI tools." : "হাজার হাজার সফল ক্রিয়েটরদের সাথে যোগ দিন যারা আমাদের এআই টুলস দিয়ে তাদের কন্টেন্ট পরিবর্তন করেছেন।"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { name: "John Doe", role: "YouTuber", text: "This tool changed my life. I can now produce 3 times more content than before with half the effort.", avatar: "https://i.pravatar.cc/150?u=john" },
                      { name: "Sarah Smith", role: "Content Creator", text: "The AI scripts are incredibly accurate and engaging. My audience retention has increased by 40%!", avatar: "https://i.pravatar.cc/150?u=sarah" },
                      { name: "Mike Johnson", role: "Digital Marketer", text: "Best AI tool for video marketing. The SEO features are top-notch and actually work for ranking.", avatar: "https://i.pravatar.cc/150?u=mike" }
                    ].map((t, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="p-8 md:p-10 rounded-[2.5rem] bg-[var(--bg-card)]/40 border border-[var(--border-main)] space-y-6 relative glass-card group transition-all shadow-md hover:shadow-xl"
                      >
                        <Quote className="absolute top-6 right-6 text-[var(--accent-main)]/5 group-hover:text-[var(--accent-main)]/10 transition-colors" size={48} />
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[var(--accent-main)] text-[var(--accent-main)]" />)}
                        </div>
                        <p className="text-[var(--text-main)] font-medium leading-relaxed text-base md:text-lg relative z-10">"{t.text}"</p>
                        <div className="flex items-center gap-4 pt-6 border-t border-[var(--border-main)]/50">
                          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--accent-main)]/20" referrerPolicy="no-referrer" />
                          <div>
                            <h5 className="font-bold text-[var(--text-main)] tracking-tight">{t.name}</h5>
                            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">{t.role}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section className="py-32 bg-[var(--bg-main)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-[var(--border-main)] to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6 space-y-24">
                  <div className="text-center space-y-6 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/10 text-[var(--accent-main)] text-[10px] font-bold uppercase tracking-[0.2em]">
                      <CreditCard size={14} />
                      {uiLang === 'en' ? "Simple Pricing" : "সহজ মূল্য নির্ধারণ"}
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-main)] tracking-tight leading-none">
                      Scale Your <span className="text-[var(--accent-main)] italic">Growth</span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg font-medium">
                      {uiLang === 'en' ? "Choose the plan that's right for your creative journey. No hidden fees." : "আপনার ক্রিয়েটিভ জার্নির জন্য সঠিক প্ল্যানটি বেছে নিন। কোনো লুকানো ফি নেই।"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { 
                        name: "Starter", 
                        price: "Free", 
                        desc: "Perfect for new creators.", 
                        features: ["5 Scripts / Month", "Basic SEO Tools", "Community Access", "Standard AI Models"],
                        button: "Get Started",
                        popular: false
                      },
                      { 
                        name: "Pro", 
                        price: "$19", 
                        desc: "For serious content creators.", 
                        features: ["Unlimited Scripts", "Advanced SEO Tools", "Priority Support", "Premium AI Models", "Image Generation"],
                        button: "Go Pro",
                        popular: true
                      },
                      { 
                        name: "Business", 
                        price: "$49", 
                        desc: "For agencies and teams.", 
                        features: ["Everything in Pro", "Team Collaboration", "Custom Branding", "API Access", "Dedicated Manager"],
                        button: "Contact Sales",
                        popular: false
                      }
                    ].map((plan, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className={cn(
                          "p-8 md:p-10 rounded-[2.5rem] border space-y-8 relative glass-card group transition-all shadow-xl flex flex-col justify-between",
                          plan.popular ? "bg-[var(--accent-main)]/5 border-[var(--accent-main)]/30 scale-105 z-10" : "bg-[var(--bg-card)]/40 border-[var(--border-main)]"
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--accent-main)] text-black text-[10px] font-bold uppercase tracking-widest shadow-md">
                            Most Popular
                          </div>
                        )}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-xl md:text-2xl font-bold text-[var(--text-main)] tracking-tight">{plan.name}</h4>
                            <p className="text-[var(--text-muted)] text-sm font-medium">{plan.desc}</p>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-bold text-[var(--text-main)] tracking-tighter">{plan.price}</span>
                            {plan.price !== "Free" && <span className="text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wide">/ Month</span>}
                          </div>
                          <div className="h-px bg-[var(--border-main)] w-full" />
                          <ul className="space-y-4">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-medium text-[var(--text-muted)]">
                                <div className="w-5 h-5 rounded-full bg-[var(--accent-main)]/10 flex items-center justify-center text-[var(--accent-main)]">
                                  <Check size={12} />
                                </div>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button className={cn(
                          "w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md",
                          plan.popular 
                            ? "bg-[var(--accent-main)] text-black hover:bg-[var(--accent-main)]/90" 
                            : "bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--bg-card)]"
                        )}>
                          {plan.button}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="relative bg-[var(--bg-card)] pt-32 pb-16 overflow-hidden border-t border-[var(--border-main)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[var(--accent-main)] via-[var(--text-main)] to-[var(--accent-main)] opacity-50" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
                    <div className="md:col-span-4 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center shadow-md border border-[var(--border-main)] group cursor-pointer">
                          <Youtube className="text-[var(--accent-main)] group-hover:scale-110 transition-transform" size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[var(--text-main)]">{t.title}</span>
                      </div>
                      <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm">
                        {uiLang === 'en' ? "The ultimate AI toolkit for modern content creators. Automate your workflow, grow your audience, and save time." : "আধুনিক কন্টেন্ট ক্রিয়েটরদের জন্য সেরা এআই টুলকিট। আপনার ওয়ার্কফ্লো অটোমেট করুন, অডিয়েন্স বাড়ান এবং সময় বাঁচান।"}
                      </p>
                      <div className="flex gap-3">
                        {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                          <motion.button 
                            key={i} 
                            whileHover={{ y: -2, color: "var(--accent-main)" }}
                            className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
                          >
                            <Icon size={14} />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <h4 className="text-[var(--text-main)] font-semibold uppercase tracking-wider text-xs">Quick Links</h4>
                      <ul className="space-y-3 text-[var(--text-muted)] text-sm font-medium">
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Home
                        </li>
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          About
                        </li>
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Features
                        </li>
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Contact
                        </li>
                      </ul>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <h4 className="text-[var(--text-main)] font-semibold uppercase tracking-wider text-xs">Support</h4>
                      <ul className="space-y-3 text-[var(--text-muted)] text-sm font-medium">
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Help Center
                        </li>
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Privacy Policy
                        </li>
                        <li className="hover:text-[var(--accent-main)] cursor-pointer transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          Terms of Service
                        </li>
                      </ul>
                    </div>

                    <div className="md:col-span-4 space-y-6">
                      <h4 className="text-[var(--text-main)] font-semibold uppercase tracking-wider text-xs">Stay Updated</h4>
                      <p className="text-[var(--text-muted)] text-sm">Subscribe to our newsletter for the latest AI tips.</p>
                      <div className="flex gap-2 p-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus-within:border-[var(--accent-main)]/50 transition-all">
                        <input 
                          type="text" 
                          placeholder="Email Address" 
                          className="bg-transparent px-3 py-2 text-[var(--text-main)] text-sm w-full outline-none" 
                        />
                        <button className="bg-[var(--accent-main)] text-black px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-md shadow-[var(--accent-main)]/20 hover:bg-[var(--accent-main)]/90">
                          Join
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-20 pt-8 border-t border-[var(--border-main)] flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--text-muted)] text-xs font-medium">
                    <p>© {new Date().getFullYear()} {t.title}. All Rights Reserved.</p>
                    <div className="flex gap-8">
                      <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">Privacy</span>
                      <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">Terms</span>
                      <span className="hover:text-[var(--text-main)] cursor-pointer transition-colors">Cookies</span>
                    </div>
                  </div>
                </div>
              </footer>
            </motion.div>
          ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="sticky top-0 z-50 w-full flex flex-col pointer-events-none">
              {/* Top Branding & Settings Bar */}
              <div className="w-full bg-black/90 backdrop-blur-2xl border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div 
                  className="flex items-center gap-4 cursor-pointer group" 
                  onClick={() => setCurrentView('home')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hw-accent via-yellow-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] group-hover:scale-105 transition-all duration-500">
                    <Youtube className="text-black" size={24} />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <h1 className="text-xl font-black tracking-[0.2em] uppercase text-white group-hover:text-hw-accent transition-colors duration-300">AI Studio</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn("w-2 h-2 rounded-full", isApiConnected ? "bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-hw-muted">{isApiConnected ? 'System Online' : 'System Offline'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  {/* Language Toggle */}
                  <div className="hidden md:flex items-center p-1 bg-white/5 rounded-full border border-white/10">
                    <button 
                      onClick={() => setUiLang('en')} 
                      className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", uiLang === 'en' ? "bg-white text-black shadow-md" : "text-hw-muted hover:text-white")}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => setUiLang('bn')} 
                      className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", uiLang === 'bn' ? "bg-white text-black shadow-md" : "text-hw-muted hover:text-white")}
                    >
                      BN
                    </button>
                  </div>
                  
                  <div className="w-[1px] h-8 bg-white/10 hidden md:block" />

                  <button 
                    onClick={handleRefresh} 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-hw-accent hover:text-black hover:border-hw-accent transition-all duration-300 group"
                  >
                    <RefreshCw size={16} className={cn(loading && "animate-spin", "group-hover:rotate-180 transition-transform duration-500")} />
                  </button>
                  
                  <button 
                    onClick={() => setShowSettings(true)} 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-hw-accent hover:text-black hover:border-hw-accent transition-all duration-300 group"
                  >
                    <Globe size={16} className="group-hover:animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Gorgeous Menu Bar */}
              <div className="w-full py-4 px-4 md:px-8 pointer-events-auto bg-gradient-to-b from-black/90 via-black/50 to-transparent">
                <nav className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x">
                  {[
                    { id: 'home', icon: Home, label: t.home, desc: 'Dashboard' },
                    { id: 'video', icon: Video, label: t.videoGen, desc: 'Full Scripts' },
                    { id: 'shorts', icon: Zap, label: t.shortsGen, desc: 'Vertical' },
                    { id: 'idea', icon: Lightbulb, label: t.ideaGen, desc: 'Brainstorm' },
                    { id: 'image', icon: Palette, label: t.imageGen, desc: 'Thumbnails' },
                    { id: 'voice', icon: Mic, label: t.voiceOver, desc: 'AI Audio' },
                    { id: 'voiceExtractor', icon: AudioLines, label: t.voiceExtractor, desc: 'Transcribe' },
                    { id: 'analytics', icon: BarChart3, label: 'Analytics', desc: 'Insights' },
                    { id: 'download', icon: Download, label: t.downloadReport, desc: 'Export PDF' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'download') {
                          downloadPdf();
                        } else {
                          setCurrentView(item.id as any);
                          if (item.id === 'video') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: true }));
                          } else if (item.id === 'shorts') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: false }));
                          }
                        }
                      }}
                      className={cn(
                        "snap-start flex-shrink-0 flex items-center gap-4 p-3 pr-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden min-w-[180px]",
                        currentView === item.id 
                          ? "bg-hw-accent/10 border-hw-accent shadow-[0_10px_20px_rgba(212,175,55,0.15)]" 
                          : "bg-black/60 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1"
                      )}
                    >
                      {currentView === item.id && (
                        <motion.div 
                          layoutId="menu-active-bg"
                          className="absolute inset-0 bg-gradient-to-r from-hw-accent/20 to-transparent opacity-50"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10",
                        currentView === item.id 
                          ? "bg-hw-accent text-black shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-105" 
                          : "bg-white/5 text-white group-hover:bg-white/20 group-hover:scale-110"
                      )}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex flex-col items-start relative z-10">
                        <span className={cn("text-sm font-black tracking-wide", currentView === item.id ? "text-hw-accent" : "text-white group-hover:text-hw-accent transition-colors")}>{item.label}</span>
                        <span className="text-[10px] text-hw-muted font-bold uppercase tracking-widest mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </header>


      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pt-6 md:pt-8 max-w-7xl mx-auto px-4 md:px-8"
      >
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-hw-muted flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-hw-accent to-transparent"></div>
            <LayoutDashboard size={14} className="text-hw-accent" /> {t.dashboardOverview}
          </h2>
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={installApp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-hw-accent to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all"
            >
              <Download size={14} />
              {uiLang === 'en' ? "Install App" : "অ্যাপ ইনস্টল"}
            </motion.button>
          )}
        </div>

        {/* Dashboard Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: t.activeModel, value: aiProvider, icon: Zap, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.totalHistory, value: history.length, icon: History, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.language, value: uiLang.toUpperCase(), icon: Globe, color: "text-hw-accent", bg: "bg-hw-accent/10" },
            { label: t.currentView, value: currentView, icon: Sparkles, color: "text-hw-accent", bg: "bg-hw-accent/10" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className="hw-panel p-6 flex items-center gap-5 group cursor-pointer"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                stat.bg, stat.color
              )}>
                <stat.icon size={24} />
              </div>
              <div className="space-y-1">
                <p className="hw-label">{stat.label}</p>
                <p className="text-xl font-black text-white capitalize tracking-tight leading-none group-hover:text-hw-accent transition-colors">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <section className="studio-card p-8 md:p-10 space-y-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-accent/20 to-transparent flex items-center justify-center text-hw-accent shadow-[0_0_30px_rgba(212,175,55,0.15)] border border-hw-accent/20">
                    {currentView === 'home' && <LayoutDashboard size={28} />}
                    {currentView === 'youtube' && <Youtube size={28} />}
                    {currentView === 'video' && <Video size={28} />}
                    {currentView === 'shorts' && <Zap size={28} />}
                    {currentView === 'idea' && <Lightbulb size={28} />}
                    {currentView === 'image' && <Palette size={28} />}
                    {currentView === 'voice' && <Mic size={28} />}
                    {currentView === 'voiceExtractor' && <AudioLines size={28} />}
                  </div>
                  <span className="text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    {currentView === 'home' ? t.dashboard : 
                     currentView === 'youtube' ? t.youtubeToolset : 
                     currentView === 'video' ? t.videoPrompter : 
                     currentView === 'shorts' ? t.shortsGenTitle : 
                     currentView === 'idea' ? t.viralIdeas :
                     currentView === 'image' ? t.imageGenerator : 
                     currentView === 'voice' ? t.voiceOverTitle :
                     currentView === 'voiceExtractor' ? t.voiceExtractorTitle : t.promptGen}
                  </span>
                </h2>
                <p className="text-sm font-bold tracking-widest uppercase text-hw-muted ml-[76px]">
                  {uiLang === 'en' ? "AI Powered Creative Studio" : "এআই চালিত ক্রিয়েটিভ স্টুডিও"}
                </p>
              </div>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="btn-secondary py-3 px-6 text-xs uppercase tracking-widest"
              >
                <History size={16} /> {t.history}
              </button>
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
                      currentView === 'video' ? t.videoDesc : 
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
                        currentView === 'video' ? t.videoDescPlaceholder : 
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

                  {(currentView === 'image' || currentView === 'video') && (
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
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
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
                                              whileHover={{ scale: 1.05, backgroundColor: isSelected ? "rgba(212, 175, 55, 0.3)" : "rgba(255, 255, 255, 0.1)" }}
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
                                                  ? "bg-hw-accent/20 border-hw-accent text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
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
                        options.language === 'en' ? "bg-[var(--accent-main)] text-black shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
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
                        options.language === 'bn' ? "bg-[var(--accent-main)] text-black shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
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
                        options.language === 'hi' ? "bg-[var(--accent-main)] text-black shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
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
                          options.promptCategory === cat ? "bg-[var(--accent-main)] text-black shadow-md shadow-[var(--accent-main)]/20" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(showAllTopics ? POPULAR_TOPICS : POPULAR_TOPICS.slice(0, 8)).map((topic, idx) => (
                      <div key={idx} className="space-y-2">
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === idx ? null : idx);
                            setTopics(prev => ({ ...prev, home: uiLang === 'bn' ? topic.bn : topic.en }));
                            toast.info(t.clickToUse);
                          }}
                          className={cn(
                            "w-full p-4 rounded-xl border transition-all duration-300 text-left group",
                            selectedCategory === idx 
                              ? "bg-[var(--accent-main)]/10 border-[var(--accent-main)]/50 shadow-lg shadow-[var(--accent-glow)]" 
                              : "bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--bg-card)]/80"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-medium transition-colors",
                            selectedCategory === idx ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
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
                              className="grid grid-cols-2 gap-1.5 overflow-hidden"
                            >
                              {topic.subs.map((sub, sIdx) => (
                                <motion.button
                                  key={sIdx}
                                  whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setTopics(prev => ({ ...prev, home: `${topic.en} - ${sub}` }));
                                    toast.success(`${sub} ${t.clickToUse}`);
                                  }}
                                  className="py-2 px-3 rounded-lg bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/20 text-[10px] font-bold text-[var(--accent-main)] text-center"
                                >
                                  {sub}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAllTopics(!showAllTopics)}
                      className="px-8 py-2.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)]/40 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-main)] transition-all flex items-center gap-2"
                    >
                      {showAllTopics ? t.showLess : t.showMore}
                      <span className={cn("transition-transform duration-300", showAllTopics ? "rotate-180" : "")}>
                        ↓
                      </span>
                    </motion.button>
                  </div>

                  {/* YouTube Title Generator Section */}
                  <div className="space-y-6 pt-8 border-t border-[var(--border-main)]" id="title-generator-section">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Zap size={20} className="text-[var(--accent-main)]" />
                        <h2 className="text-sm font-semibold text-[var(--text-main)] tracking-wide">
                          {uiLang === 'en' ? 'YouTube Title Generator' : 'ইউটিউব শিরোনাম জেনারেটর'}
                        </h2>
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--accent-main)] uppercase tracking-widest">
                        {uiLang === 'en' ? 'High CTR' : 'হাই সিটিআর'}
                      </div>
                    </div>

                    <div className="glass-card p-6 space-y-4 border-[var(--accent-main)]/20 bg-[var(--accent-main)]/5">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                          {uiLang === 'en' ? 'Video Topic' : 'ভিডিওর বিষয়'}
                        </label>
                        <input 
                          type="text" 
                          value={options.titleTopic || ''} 
                          onChange={(e) => setOptions(prev => ({ ...prev, titleTopic: e.target.value }))}
                          placeholder={uiLang === 'en' ? 'Enter your video topic...' : 'ভিডিওর বিষয় লিখুন...'}
                          className="w-full bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-xl p-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]/50 transition-colors"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          if (!options.titleTopic) return;
                          setLoading(true);
                          try {
                            const result = await generateYoutubeTitles(options.titleTopic, uiLang === 'bn' ? 'bn' : 'en');
                            setResults(prev => ({ ...prev, [currentView]: result }));
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-[var(--accent-main)] text-black text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-main)]/20 hover:bg-[var(--accent-main)]/90 transition-all"
                      >
                        {loading ? (uiLang === 'en' ? 'Generating...' : 'জেনারেট হচ্ছে...') : (uiLang === 'en' ? 'Generate High CTR Titles' : 'হাই সিটিআর শিরোনাম জেনারেট করুন')}
                      </motion.button>
                    </div>
                  </div>

                  {/* Unique Prompt Generator Section */}
                  <div className="space-y-6 pt-8 border-t border-[var(--border-main)]" id="prompt-generator-section">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-[var(--accent-main)]" />
                        <h2 className="text-sm font-semibold text-[var(--text-main)] tracking-wide">
                          {t.promptGen}
                        </h2>
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--accent-main)] uppercase tracking-widest">
                        {uiLang === 'en' ? 'AI Powered' : 'এআই চালিত'}
                      </div>
                    </div>

                    <div className="glass-card p-6 space-y-6 border-[var(--accent-main)]/20 bg-[var(--accent-main)]/5">
                      <div className="space-y-4">
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
                                "py-2.5 rounded-xl border border-[var(--border-main)] text-xs font-semibold transition-all flex items-center justify-center gap-2",
                                options.promptCategory === cat ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-glow)]" : "bg-[var(--bg-card)]/40 text-[var(--text-muted)] hover:bg-[var(--bg-card)]/60"
                              )}
                            >
                              {options.promptCategory === cat && <Check size={14} />} 
                              {cat === 'Video' ? (uiLang === 'en' ? 'Video' : 'ভিডিও') :
                               cat === 'Story' ? (uiLang === 'en' ? 'Story' : 'গল্প') :
                               cat === 'Image' ? (uiLang === 'en' ? 'Image' : 'ছবি') :
                               (uiLang === 'en' ? 'Voice Over' : 'ভয়েস ওভার')}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* New Dropdowns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Palette size={14} className="text-[var(--accent-main)]" /> Visual Style
                          </label>
                          <select value={formOptions.visualStyle} onChange={(e) => setFormOptions(prev => ({...prev, visualStyle: e.target.value}))} className="w-full bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-xl p-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]/50 transition-colors appearance-none cursor-pointer">
                            {['Cinematic', 'Realistic', 'Anime', '3D Render', 'Sketch', 'Cyberpunk', 'Vintage', 'Minimalist', 'Surreal'].map(style => <option key={style} value={style}>{style}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Camera size={14} className="text-[var(--accent-main)]" /> Camera Angle
                          </label>
                          <select value={formOptions.cameraAngle} onChange={(e) => setFormOptions(prev => ({...prev, cameraAngle: e.target.value}))} className="w-full bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-xl p-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]/50 transition-colors appearance-none cursor-pointer">
                            {['Wide', 'Close-up', 'Medium', 'Bird\'s Eye', 'Low Angle', 'High Angle', 'Dutch Angle', 'Over the Shoulder', 'POV'].map(angle => <option key={angle} value={angle}>{angle}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Sun size={14} className="text-[var(--accent-main)]" /> Lighting
                          </label>
                          <select value={formOptions.lighting} onChange={(e) => setFormOptions(prev => ({...prev, lighting: e.target.value}))} className="w-full bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-xl p-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]/50 transition-colors appearance-none cursor-pointer">
                            {['Natural', 'Studio', 'Neon', 'Golden Hour', 'Moody', 'High Key', 'Low Key', 'Soft Diffused', 'Volumetric'].map(light => <option key={light} value={light}>{light}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <Zap size={14} className="text-[var(--accent-main)]" /> Mood
                          </label>
                          <select value={formOptions.mood} onChange={(e) => setFormOptions(prev => ({...prev, mood: e.target.value}))} className="w-full bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-xl p-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]/50 transition-colors appearance-none cursor-pointer">
                            {['Energetic', 'Calm', 'Dark', 'Inspiring', 'Mysterious', 'Romantic', 'Tense', 'Playful', 'Epic'].map(mood => <option key={mood} value={mood}>{mood}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-2">
                          <FileText size={14} /> {uiLang === 'en' ? 'Topic for Prompt' : 'প্রম্পটের বিষয়'}
                        </label>
                        <textarea 
                          placeholder={uiLang === 'en' ? "Enter a topic to generate unique prompts (e.g. A futuristic city)" : "ইউনিক প্রম্পট তৈরি করতে একটি বিষয় লিখুন (যেমন: একটি ভবিষ্যতের শহর)"}
                          className="w-full input-field min-h-[100px] resize-none bg-[var(--bg-card)]/40 text-sm"
                          value={topics.promptGen}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTopics(prev => ({ ...prev, promptGen: val }));
                            if (val.trim()) {
                              // Clear home topic if typing in promptGen to avoid confusion
                              setTopics(prev => ({ ...prev, home: '' }));
                            }
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
              )}

              {currentView === 'voice' && (
                <div className="hw-panel p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_15px_rgba(212,175,55,0.2)]">
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
                                options.voiceLanguage === lang.id ? "bg-hw-accent text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-black/40 text-hw-muted hover:bg-black/60"
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
                              {[
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
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
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
                              {[
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
                                    options.voice === v.id ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-black/40 border-hw-border text-hw-muted hover:border-hw-accent/30"
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

              {(currentView === 'video' || currentView === 'image' || currentView === 'voiceExtractor') && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[var(--border-main)]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                      <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">
                        {currentView === 'video' ? (uiLang === 'en' ? "Upload Video" : "ভিডিও আপলোড করুন") : 
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
                          {currentView === 'video' ? <Video size={24} /> : 
                           currentView === 'voiceExtractor' ? <AudioLines size={24} /> : <Upload size={24} />}
                        </div>
                        <p className="text-sm font-medium text-[var(--text-muted)] text-center max-w-xs">
                          {currentView === 'video' ? (uiLang === 'en' ? "Click to upload video for analysis" : "বিশ্লেষণের জন্য ভিডিও আপলোড করতে ক্লিক করুন") : 
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
                <span className="text-[9px] uppercase tracking-widest text-hw-accent font-black bg-hw-accent/10 px-3 py-1 rounded-full border border-hw-accent/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
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
                        ? "bg-hw-accent/10 border-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                        : "bg-black/40 border-white/10 hover:border-hw-accent/40 hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner",
                      options[opt.id as keyof typeof options] ? "bg-hw-accent text-black" : "bg-white/5 text-hw-muted group-hover:text-hw-accent"
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
                      <div className="absolute top-4 right-4 w-5 h-5 shrink-0 rounded-full bg-hw-accent flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                        <Check size={12} className="text-black font-bold" />
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
                        options.language === lang.id ? "bg-hw-accent text-black border-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.3)]" : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
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
                          max="1200" 
                          step="1"
                          value={options.videoDuration}
                          onChange={(e) => {
                            const duration = parseInt(e.target.value);
                            // Calculate characters based on ~15 chars per second (rough estimate for speech)
                            const chars = Math.min(20000, Math.max(100, Math.round(duration * 15)));
                            setOptions(prev => ({ 
                              ...prev, 
                              videoDuration: duration,
                              scriptCharacterCount: chars
                            }));
                          }}
                          className="w-full h-1.5 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all"
                        />
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                          <span>8s</span>
                          <span>20m</span>
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
                          max="20000" 
                          step="50"
                          value={options.scriptCharacterCount}
                          onChange={(e) => setOptions(prev => ({ ...prev, scriptCharacterCount: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-[var(--bg-card)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)] hover:accent-[var(--accent-main)]/80 transition-all shadow-inner"
                        />
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                          <span>100</span>
                          <span>20000</span>
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
                        max="1200" 
                        step="1"
                        value={options.videoDuration}
                        onChange={(e) => {
                          const duration = parseInt(e.target.value);
                          // Calculate words based on ~160 words per minute speaking rate
                          const words = Math.min(5000, Math.max(100, Math.round((duration / 60) * 160)));
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
                        <span>20m</span>
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
                        max="5000" 
                        step="50"
                        value={options.scriptWordCount}
                        onChange={(e) => {
                          const words = parseInt(e.target.value);
                          // Calculate duration based on ~160 words per minute speaking rate
                          const duration = Math.min(1200, Math.max(8, Math.round((words / 160) * 60)));
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
                        <span>5000w</span>
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
                        ? "bg-hw-accent text-black border-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                        : "bg-black/40 text-white/50 border-white/10 hover:border-hw-accent/40 hover:text-white"
                    )}
                  >
                    {ratio}
                  </motion.button>
                ))}
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
                <span className="text-lg font-black tracking-widest uppercase">{t.processing}</span>
              </>
            ) : (
              <>
                <Zap size={24} className="text-black group-hover:rotate-12 transition-transform" /> 
                <span className="text-lg font-black tracking-widest uppercase">
                  {
                    currentView === 'video' ? t.genPrompt : 
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

        {/* Right Column: Results */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-32">
          <AnimatePresence mode="wait">
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="studio-card p-6 md:p-8 min-h-[500px] md:min-h-[600px] flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-main)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                    <Sparkles size={20} className="text-hw-accent" /> 
                    {t.outputPreview}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-hw-muted ml-8">
                    {uiLang === 'en' ? "AI Generated Result" : "এআই জেনারেটেড রেজাল্ট"}
                  </p>
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
                        // Filter out non-string values or special objects
                        allText = Object.entries(currentResult)
                          .filter(([k, v]) => typeof v === 'string')
                          .map(([k, v]) => `${k.toUpperCase()}:\n${v}`)
                          .join('\n\n');
                      }
                      copyToClipboard(allText, 'copy-all');
                    }}
                    className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-hw-accent/50 rounded-xl transition-all text-white/70 hover:text-hw-accent shadow-sm"
                  >
                    {copied === 'copy-all' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {t.copyAll}
                  </button>
                )}
              </div>

              {!currentResult && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-hw-accent/20 to-transparent flex items-center justify-center text-hw-accent animate-float shadow-[0_0_30px_rgba(212,175,55,0.15)] border border-hw-accent/20">
                    <Sparkles size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white tracking-tight">{t.readyToCreate}</h3>
                    <p className="text-sm font-medium text-white/50 max-w-xs mx-auto leading-relaxed">{t.readySubtitle}</p>
                  </div>
                  
                  {/* Quick Suggestions Bento Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full pt-8">
                    {[
                      { label: t.viralScript, icon: ScrollText, view: 'video', color: "text-hw-accent", bg: "bg-hw-accent/10", border: "border-hw-accent/20" },
                      { label: t.seoTags, icon: Tag, view: 'youtube', color: "text-hw-accent", bg: "bg-hw-accent/10", border: "border-hw-accent/20" },
                      { label: t.thumbnail, icon: ImageIcon, view: 'image', color: "text-hw-accent", bg: "bg-hw-accent/10", border: "border-hw-accent/20" },
                      { label: t.aiVideo, icon: Video, view: 'video', color: "text-hw-accent", bg: "bg-hw-accent/10", border: "border-hw-accent/20" }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setCurrentView(item.view as any);
                          if (item.view === 'video') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: true }));
                          }
                        }}
                        className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-hw-accent/50 transition-all duration-300 flex flex-col items-center gap-4 group relative overflow-hidden shadow-sm"
                      >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", item.bg)} />
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner", item.bg, item.color, item.border)}>
                          <item.icon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-hw-accent transition-colors">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-10 bg-black/40 rounded-[2rem] border border-white/10 backdrop-blur-xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hw-accent/20 rounded-full blur-[100px]" />
                    
                    <div className="relative z-10">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border border-white/10 border-t-hw-accent/80 border-r-hw-accent/40"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-white/10 border-b-yellow-500/80 border-l-yellow-500/40"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hw-accent/30 to-transparent flex items-center justify-center text-hw-accent border border-hw-accent/30 shadow-[0_0_40px_rgba(212,175,55,0.3)] backdrop-blur-md"
                          >
                            <Sparkles size={32} />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-sm space-y-6 z-10">
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] uppercase tracking-widest font-black text-hw-accent h-4">
                          <TypewriterText text={t.loadingSteps[loadingStep] || t.processing} className="typewriter-text" />
                        </div>
                        <span className="text-xs font-mono font-bold text-white/50">{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                        <div className="absolute inset-0 bg-hw-accent/10" />
                        <motion.div 
                          className="h-full bg-gradient-to-r from-hw-accent via-yellow-400 to-hw-accent relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ type: "spring", stiffness: 40, damping: 15 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine_2s_linear_infinite]" />
                        </motion.div>
                      </div>
                      <div className="flex justify-center gap-3">
                        {t.loadingSteps.map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full transition-all duration-700",
                              i <= loadingStep 
                                ? "bg-hw-accent shadow-[0_0_15px_rgba(212,175,55,0.8)] scale-125" 
                                : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-center max-w-xs leading-relaxed z-10">
                      {uiLang === 'en' 
                        ? "Synthesizing creative parameters..." 
                        : "সৃজনশীল পরামিতি সংশ্লেষণ করা হচ্ছে..."}
                    </p>
                  </div>
                )}

                {currentResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {(!currentResult.imageUrl && !currentResult.audioUrl) && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={downloadPdf}
                          className="py-3.5 rounded-xl bg-linear-to-r from-[var(--accent-main)] to-[var(--accent-main)]/80 text-white font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          {uiLang === 'en' ? "PDF" : "পিডিএফ"}
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={shareContent}
                          className="py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 size={18} />
                          {uiLang === 'en' ? "Share" : "শেয়ার"}
                        </motion.button>
                      </div>
                    )}
                    {currentResult.imageUrl ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                          <img src={currentResult.imageUrl} alt="Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                            <a 
                              href={currentResult.imageUrl} 
                              download="generated-image.png"
                              className="w-12 h-12 rounded-full bg-hw-accent flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                            >
                              <Download size={24} />
                            </a>
                          </div>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-white/50 text-center font-bold">{t.generatedImage}</p>
                      </div>
                    ) : currentResult.audioUrl ? (
                      <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-hw-accent/10 flex items-center justify-center text-hw-accent animate-pulse shadow-[0_0_30px_rgba(212,175,55,0.2)] border border-hw-accent/20">
                            <Volume2 size={48} />
                          </div>
                          <audio controls src={currentResult.audioUrl} className="w-full" />
                          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold text-center max-w-xs">{t.voiceNote}</p>
                          <a 
                            href={currentResult.audioUrl} 
                            download="voice-over.wav"
                            className="flex items-center gap-2 px-8 py-4 bg-hw-accent text-black rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
                          >
                            <Download size={20} /> {t.downloadAudio}
                          </a>
                        </div>
                      </div>
                    ) : currentResult.titles ? (
                      <div className="space-y-4">
                        {currentResult.titles.map((t: any, idx: number) => (
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
                    ) : currentResult.prompts ? (
                      <div className="space-y-4">
                        {currentResult.prompts.map((prompt: string, idx: number) => (
                          <div key={idx} className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 group shadow-sm hover:border-hw-accent/30 transition-all">
                            <div className="flex justify-between items-start">
                              <h3 className="text-hw-accent font-black text-[10px] uppercase tracking-widest">Option {idx + 1}</h3>
                              <button 
                                onClick={() => copyToClipboard(prompt, `prompt-${idx}`)}
                                className="text-white/50 hover:text-hw-accent transition-colors"
                              >
                                {copied === `prompt-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                              </button>
                            </div>
                            <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-medium">
                              <TypewriterText text={prompt} className="typewriter-text" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : currentResult.ideas ? (
                      <div className="space-y-4">
                        {currentResult.ideas.map((idea: any, idx: number) => (
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
                    ) : (
                      <div className="space-y-12">
                        {/* Featured Fields */}
                        {(currentResult.videoTitle || currentResult.imagePrompt || currentResult.videoPrompt) && (
                          <div className="space-y-6">
                            {currentResult.videoTitle && (
                              <div className="p-6 rounded-2xl bg-hw-accent/5 border border-hw-accent/20 space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black">Video Title</label>
                                <div className="text-lg font-black text-white">{currentResult.videoTitle}</div>
                                <button onClick={() => copyToClipboard(currentResult.videoTitle, 'videoTitle')} className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2">
                                  {copied === 'videoTitle' ? <Check size={14} /> : <Copy size={14} />} Copy
                                </button>
                              </div>
                            )}
                            {currentResult.imagePrompt && (
                              <div className="p-6 rounded-2xl bg-hw-accent/5 border border-hw-accent/20 space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black">Image Prompt</label>
                                <div className="text-sm text-white/90 leading-relaxed font-medium">{currentResult.imagePrompt}</div>
                                <button onClick={() => copyToClipboard(currentResult.imagePrompt, 'imagePrompt')} className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2">
                                  {copied === 'imagePrompt' ? <Check size={14} /> : <Copy size={14} />} Copy
                                </button>
                              </div>
                            )}
                            {currentResult.videoPrompt && (
                              <div className="p-6 rounded-2xl bg-hw-accent/5 border border-hw-accent/20 space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-hw-accent font-black">Video Prompt</label>
                                <div className="text-sm text-white/90 leading-relaxed font-medium">{currentResult.videoPrompt}</div>
                                <button onClick={() => copyToClipboard(currentResult.videoPrompt, 'videoPrompt')} className="text-[10px] uppercase tracking-widest font-bold text-hw-accent hover:text-hw-accent/80 flex items-center gap-1.5 pt-2">
                                  {copied === 'videoPrompt' ? <Check size={14} /> : <Copy size={14} />} Copy
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {Object.entries(currentResult).map(([key, value]) => {
                          if (!value || ['videoTitle', 'imagePrompt', 'videoPrompt'].includes(key)) return null;
                          
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
                                      instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500" },
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
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div className="space-y-4">
                                          <label className="text-[10px] uppercase tracking-widest text-white/50 font-black flex items-center gap-2">
                                            <Eye size={14} className="text-hw-accent" /> {uiLang === 'en' ? "Visual Prompt" : "ভিজ্যুয়াল প্রম্পট"}
                                          </label>
                                          <p className="text-sm text-white/70 italic leading-relaxed bg-hw-accent/5 p-5 rounded-2xl border border-hw-accent/10 font-medium">
                                            {scene.visual}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (['imageUrl', 'audioUrl', 'prompts', 'ideas', 'scenes'].includes(key)) {
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
                    <div className="mt-12 p-8 rounded-[2.5rem] bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3 mb-8 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent">
                          <Sparkles size={24} />
                        </div>
                        {uiLang === 'en' ? "Related Video Ideas" : "সম্পর্কিত ভিডিও আইডিয়া"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedIdeas.map((idea, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setTopics(prev => ({ ...prev, [currentView]: idea.title }));
                              handleGenerate();
                            }}
                            className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-hw-accent/30 transition-all text-left shadow-sm group"
                          >
                            <h4 className="text-sm font-black text-white group-hover:text-hw-accent transition-colors">{idea.title}</h4>
                            <p className="text-xs text-white/50 mt-3 leading-relaxed font-medium">{idea.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div> {/* End of Right Column */}
          </div> {/* End of Main Content Grid */}
          {currentView === 'analytics' && <AnalyticsView uiLang={uiLang} />}

        {/* Collaboration Chat */}
        <CollaborationChat 
          messages={messages}
          onSendMessage={sendMessage}
          roomId={roomId}
          onJoinRoom={setRoomId}
          isJoined={isJoined}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
        />
      </motion.main>

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
                      <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.2)]">
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
                                className="absolute inset-0 bg-hw-accent rounded-2xl -z-10 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
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
                                    aiProvider === p ? "bg-hw-accent text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]" : "bg-white/5 text-white/50"
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
                                      aiProvider === p ? "bg-hw-accent text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" : "bg-white/5 text-white/50 hover:text-white"
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
                        className="w-full py-5 rounded-[1.5rem] bg-hw-accent text-black font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
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

      <footer className="mt-12 text-center text-white/50 text-xs pb-8 space-y-4">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-green-500/60 font-mono font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-hw-accent animate-pulse" />
            SYSTEM LIVE
          </div>
          <a 
            href={APP_CONFIG.githubRepo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors font-bold"
          >
            <Github size={14} />
            GitHub
          </a>
        </div>
        <p className="font-medium">© {new Date().getFullYear()} YouTube AI Creator Studio. All Rights Reserved.</p>
      </footer>

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
          background: #D4AF37;
          opacity: 0.2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
          opacity: 0.4;
        }
      `}} />
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.2)]">
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
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.05)" }}
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
                  <div className="w-12 h-12 rounded-2xl bg-hw-accent/10 flex items-center justify-center text-hw-accent shadow-[0_0_20px_rgba(212,175,55,0.2)]">
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
                  className="w-full py-5 rounded-[1.5rem] bg-hw-accent text-black font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all active:scale-95"
                >
                  {uiLang === 'en' ? "Close" : "বন্ধ করুন"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
