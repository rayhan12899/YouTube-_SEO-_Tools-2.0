/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Eye
} from 'lucide-react';
import { APP_CONFIG } from './config';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { 
  generateContent, 
  generatePromptsFromImage, 
  generatePromptsFromVideo,
  generateVideoIdeas, 
  generateImage, 
  generateVoiceOver, 
  generateVoiceExtractor,
  getTrendingTopics,
  GenerationOptions,
  AIProvider,
  updateAIConfig,
  resetAIConfig
} from './services/geminiService';

interface HistoryItem {
  id: string;
  timestamp: number;
  topic: string;
  result: any;
  type: 'image-to-prompt' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'youtube' | 'shorts';
}

type ViewType = 'landing' | 'home' | 'youtube' | 'video' | 'idea' | 'image' | 'voice' | 'voiceExtractor' | 'promptGen' | 'analyze' | 'transcribe' | 'shorts';

const translations = {
  en: {
    title: "YouTube AI Creator Studio",
    subtitle: "Next-Gen AI | V3.0",
    landing: "Landing",
    home: "Home",
    videoGen: "Script & Video Generator",
    ideaGen: "Idea Generate",
    imageGen: "Image Extractor",
    voiceOver: "Voice Over",
    shortsGen: "Shorts Generator",
    voiceExtractor: "Voice/Video Extractor",
    downloadReport: "Download",
    dashboard: "Dashboard Overview",
    youtubeToolset: "YouTube Toolset",
    videoPrompter: "AI Script & Video Prompter",
    shortsGenTitle: "AI YouTube Shorts Generator",
    viralIdeas: "Viral Video Ideas",
    imageGenerator: "AI Image Extractor & Analysis",
    voiceOverTitle: "AI Voice Over",
    voiceExtractorTitle: "AI Voice & Video Extractor",
    promptGen: "Unique Prompt Generator",
    promptGenPlaceholder: "Enter a topic to generate unique prompts (e.g. A futuristic city)",
    history: "History",
    getStarted: "Get Started",
    heroTitle: "Create Viral Content with AI",
    heroSubtitle: "The all-in-one platform for YouTube creators. Generate scripts, ideas, images, and voiceovers in seconds.",
    features: "Features",
    faq: "FAQ",
    about: "About",
    contact: "Contact",
    videoDesc: "Video Description (Optional)",
    nicheInput: "Enter your Niche or Keyword *",
    imageInput: "Image Prompt *",
    voiceInput: "Enter Voice Over Text *",
    audioInput: "Upload Audio for Extraction *",
    topicInput: "Video Topic for Script & Prompts *",
    videoDescPlaceholder: "Give some instructions for the video...",
    nichePlaceholder: "e.g., Technology, Cooking, Gaming...",
    imagePlaceholder: "e.g., A futuristic city with neon lights...",
    voicePlaceholder: "Text you want to convert to voice...",
    audioPlaceholder: "Upload an audio file to extract script and prompts...",
    topicPlaceholder: "e.g., Travel vlogs, Tech reviews, Cooking tips...",
    uploadImage: "Upload Image",
    uploadAudio: "Upload Audio/Video",
    uploadPrompt: "Click here to generate prompt from image",
    uploadAudioPrompt: "Click here to upload audio/video for extraction",
    whatToCreate: "What should I create?",
    imagePromptLabel: "AI Image Prompt",
    videoPromptLabel: "AI Video Prompt (Sora/Kling/Runway/Veo3)",
    thumbnailLabel: "Thumbnail Idea",
    descLabel: "Video Description",
    tagsLabel: "SEO Tags",
    scriptLabel: "Full YouTube Script",
    seoChecklistLabel: "YouTube SEO Checklist",
    keywordsLabel: "Keyword Research Tool",
    imagePromptDesc: "Create high-quality prompts for AI image generators.",
    videoPromptDesc: "Detailed prompts for Sora, Kling, Runway, and Veo3.",
    thumbnailDesc: "Creative and catchy thumbnail concepts for your video.",
    descriptionDesc: "SEO-optimized video descriptions to boost visibility.",
    tagsDesc: "The most relevant SEO tags for your YouTube content.",
    scriptDesc: "Full professional YouTube scripts with scene details.",
    seoChecklistDesc: "A step-by-step guide to optimize your video for search.",
    keywordsDesc: "Find high-volume, low-competition keywords for your niche.",
    highCtrTitle: "High CTR Title",
    thumbnailTitle: "Thumbnail Title",
    hashtags: "Hashtags",
    seoDescription: "SEO Description",
    selectLanguage: "Select Output Language",
    targetLanguage: "Target Language",
    bn: "Bengali",
    en: "English",
    hi: "Hindi",
    both: "Both",
    processing: "AI is processing...",
    genPrompt: "Generate Full Script & Prompts",
    genIdea: "Generate Ideas",
    genImage: "Generate Image",
    genVoice: "Generate Voice",
    genVoiceExtractor: "Extract & Generate",
    recentHistory: "Recent History",
    noHistory: "No history found",
    outputPreview: "Output Preview",
    emptyPreview: "Enter a topic and click generate or upload an image/audio.",
    voiceLang: "Voice Language",
    selectVoice: "Select Voice",
    femaleVoices: "Female Voices",
    maleVoices: "Male Voices",
    downloadAudio: "Download Audio",
    generatedImage: "AI Generated Image (16:9)",
    readyToCreate: "Ready to create?",
    readySubtitle: "Choose a tool from the menu or enter a topic to start your viral journey.",
    activeModel: "Active Model",
    totalHistory: "Total History",
    currentView: "Current View",
    language: "Language",
    quickTools: "Quick Tools",
    viralScript: "Viral Script",
    seoTags: "SEO Tags",
    aiVideo: "AI Video",
    dashboardOverview: "Dashboard Overview",
    copy: "Copy",
    copied: "Copied!",
    copyAll: "Copy All",
    clearHistory: "Clear History",
    failed: "Generation failed. Please check your API key.",
    noContent: "No content found to download!",
    enterNiche: "Please enter your niche or keyword.",
    enterImage: "Please enter image prompt.",
    enterVoice: "Please enter voice over text.",
    voiceNote: "Note: The AI will speak in the language of the text provided.",
    ideaGenHistory: "Idea Gen",
    imageGenHistory: "Image Gen",
    voiceGenHistory: "Voice Gen",
    imageAnalysis: "Image Analysis",
    trendingNow: "Trending Now (This Week)",
    loadingTrends: "Analyzing global trends...",
    clickToUse: "Click to use as topic",
    popularCategories: "Popular Categories (24 Topics)",
    videoDuration: "Video Duration",
    scriptWords: "Script Word Count",
    scriptCharacters: "Character Limit",
    charLimit: "Characters",
    seconds: "Seconds",
    words: "Words",
    refresh: "Refresh",
    showMore: "Show More",
    showLess: "Show Less",
    bestPostingTime: "Best Posting Time",
    productTopic: "Content Topic",
    businessType: "Channel Niche",
    platform: "Platform",
    contentType: "Content Type",
    toneMood: "Tone / Mood",
    visualStyle: "Visual Style",
    styleCinematic: "Cinematic",
    stylePhotorealistic: "Photorealistic",
    styleIllustrative: "Illustrative",
    styleAnime: "Anime",
    style3dRender: "3D Render",
    shorts: "Shorts Script",
    description: "Video Description",
    titleIdea: "Title Idea",
    thumbnail: "Thumbnail Concept",
    fullScript: "Full Video Script",
    professional: "Professional",
    funny: "Funny",
    emotional: "Emotional",
    urgent: "Urgent",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    allPlatforms: "All Platforms",
    voiceTone: "Voice Tone",
    voiceAccent: "Accent",
    voiceAge: "Age",
    toneExcited: "Excited",
    toneCalm: "Calm",
    toneSerious: "Serious",
    toneProfessional: "Professional",
    toneStoryteller: "Storyteller",
    accentUS: "US",
    accentUK: "UK",
    accentIndian: "Indian",
    accentAustralian: "Australian",
    ageYoung: "Young",
    ageAdult: "Adult",
    ageSenior: "Senior",
    settings: "Settings",
    apiKeyLabel: "Gemini API Key",
    apiKeyPlaceholder: "Enter your Gemini API key...",
    save: "Save",
    apiStatus: "API Status",
    connected: "Connected",
    disconnected: "Disconnected (Offline Mode)",
    apiNote: "Note: Your API key is stored locally in your browser and never sent to our servers.",
    loadingSteps: [
      "Analyzing your topic...",
      "Researching viral trends...",
      "Generating viral script...",
      "Optimizing SEO metadata...",
      "Crafting AI prompts...",
      "Finalizing your content..."
    ],
  },
  bn: {
    title: "YouTube AI Creator Studio",
    subtitle: "নেক্সট-জেন এআই | V3.0",
    home: "হোম",
    videoGen: "স্ক্রিপ্ট ও ভিডিও জেনারেটর",
    ideaGen: "আইডিয়া জেনারেট",
    imageGen: "ইমেজ এক্সট্র্যাক্টর",
    voiceOver: "ভয়েস ওভার",
    shortsGen: "শর্টস জেনারেটর",
    voiceExtractor: "ভয়েস/ভিডিও এক্সট্র্যাক্টর",
    downloadReport: "ডাউনলোড",
    dashboard: "ড্যাশবোর্ড ওভারভিউ",
    youtubeToolset: "ইউটিউব টুলসেট",
    videoPrompter: "এআই স্ক্রিপ্ট ও ভিডিও প্রম্পটার",
    shortsGenTitle: "এআই ইউটিউব শর্টস জেনারেটর",
    viralIdeas: "ভাইরাল ভিডিও আইডিয়া",
    imageGenerator: "এআই ইমেজ এক্সট্র্যাক্টর ও বিশ্লেষণ",
    voiceOverTitle: "এআই ভয়েস ওভার",
    voiceExtractorTitle: "এআই ভয়েস ও ভিডিও এক্সট্র্যাক্টর",
    promptGen: "ইউনিক প্রম্পট জেনারেটর",
    promptGenPlaceholder: "ইউনিক প্রম্পট তৈরি করতে একটি বিষয় লিখুন (যেমন: একটি ভবিষ্যতের শহর)",
    history: "হিস্ট্রি",
    landing: "ল্যান্ডিং",
    getStarted: "শুরু করুন",
    heroTitle: "AI দিয়ে ভাইরাল কন্টেন্ট তৈরি করুন",
    heroSubtitle: "ইউটিউব ক্রিয়েটরদের জন্য অল-ইন-ওয়ান প্ল্যাটফর্ম। সেকেন্ডের মধ্যে স্ক্রিপ্ট, আইডিয়া, ছবি এবং ভয়েসওভার তৈরি করুন।",
    features: "বৈশিষ্ট্য",
    faq: "সাধারণ জিজ্ঞাসা",
    about: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    videoDesc: "ভিডিওর বর্ণনা (ঐচ্ছিক)",
    nicheInput: "আপনার নিস বা কি-ওয়ার্ড লিখুন *",
    imageInput: "ইমেজ প্রম্পট *",
    voiceInput: "ভয়েস ওভার টেক্সট লিখুন *",
    audioInput: "এক্সট্র্যাক্ট করার জন্য অডিও আপলোড করুন *",
    topicInput: "স্ক্রিপ্ট ও প্রম্পটের জন্য ভিডিওর বিষয় *",
    videoDescPlaceholder: "ভিডিওর জন্য কিছু ইনস্ট্রাকশন দিন...",
    nichePlaceholder: "যেমন: টেকনোলজি, কুকিং, গেমিং...",
    imagePlaceholder: "যেমন: A futuristic city with neon lights...",
    voicePlaceholder: "যে টেক্সটটি ভয়েস ওভারে রূপান্তর করতে চান...",
    audioPlaceholder: "স্ক্রিপ্ট এবং প্রম্পট এক্সট্র্যাক্ট করতে একটি অডিও ফাইল আপলোড করুন...",
    topicPlaceholder: "যেমন: বোরো ধান চাষের পদ্ধতি, টেক রিভিউ, গল্প বলা...",
    uploadImage: "ইমেজ আপলোড করুন",
    uploadAudio: "অডিও/ভিডিও আপলোড করুন",
    uploadPrompt: "ইমেজ থেকে প্রম্পট তৈরি করতে এখানে ক্লিক করুন",
    uploadAudioPrompt: "অডিও/ভিডিও আপলোড করে এক্সট্র্যাক্ট করতে এখানে ক্লিক করুন",
    whatToCreate: "কি তৈরি করবো?",
    imagePromptLabel: "এআই ইমেজ প্রম্পট",
    videoPromptLabel: "এআই ভিডিও প্রম্পট (Sora/Kling/Runway/Veo3)",
    thumbnailLabel: "থাম্বনেইল আইডিয়া",
    descLabel: "ভিডিও বিবরণ",
    tagsLabel: "এসইও ট্যাগ",
    scriptLabel: "ফুল ইউটিউব স্ক্রিপ্ট",
    seoChecklistLabel: "ইউটিউব এসইও চেকলিস্ট",
    keywordsLabel: "কি-ওয়ার্ড রিসার্চ টুল",
    imagePromptDesc: "এআই ইমেজ জেনারেটরের জন্য হাই-কোয়ালিটি প্রম্পট তৈরি করুন।",
    videoPromptDesc: "Sora, Kling, Runway এবং Veo3 এর জন্য বিস্তারিত প্রম্পট।",
    thumbnailDesc: "আপনার ভিডিওর জন্য আকর্ষণীয় থাম্বনেইল আইডিয়া।",
    descriptionDesc: "ভিডিওর ভিউ বাড়াতে এসইও-অপ্টিমাইজড ডেসক্রিপশন।",
    tagsDesc: "আপনার ইউটিউব কন্টেন্টের জন্য সবচেয়ে কার্যকর এসইও ট্যাগ।",
    scriptDesc: "সীন ডিটেইলস সহ প্রফেশনাল ইউটিউব স্ক্রিপ্ট।",
    seoChecklistDesc: "সার্চে ভিডিও র‍্যাঙ্ক করানোর জন্য স্টেপ-বাই-স্টেপ গাইড।",
    keywordsDesc: "আপনার নিশের জন্য হাই-ভলিউম কিওয়ার্ড খুঁজে বের করুন।",
    highCtrTitle: "হাই সিটিআর টাইটেল",
    thumbnailTitle: "থাম্বনেইল টাইটেল",
    hashtags: "হ্যাশট্যাগসমূহ",
    seoDescription: "এসইও ডেসক্রিপশন",
    selectLanguage: "ভাষা নির্বাচন করুন",
    targetLanguage: "টার্গেট ভাষা",
    bn: "বাংলা",
    en: "English",
    hi: "হিন্দি",
    both: "উভয়",
    processing: "AI প্রসেস করছে...",
    genPrompt: "স্ক্রিপ্ট ও প্রম্পট জেনারেট করুন",
    genIdea: "আইডিয়া জেনারেট করুন",
    genImage: "ইমেজ জেনারেট করুন",
    genVoice: "ভয়েস জেনারেট করুন",
    genVoiceExtractor: "এক্সট্র্যাক্ট ও জেনারেট করুন",
    recentHistory: "সাম্প্রতিক হিস্ট্রি",
    noHistory: "কোন হিস্ট্রি পাওয়া যায়নি",
    outputPreview: "আউটপুট প্রিভিউ",
    emptyPreview: "টপিক লিখে জেনারেট বাটনে ক্লিক করুন অথবা ইমেজ/অডিও আপলোড করুন।",
    voiceLang: "ভয়েস ল্যাঙ্গুয়েজ",
    selectVoice: "ভয়েস নির্বাচন করুন",
    femaleVoices: "নারী কণ্ঠ",
    maleVoices: "পুরুষ কণ্ঠ",
    downloadAudio: "অডিও ডাউনলোড",
    generatedImage: "এআই জেনারেটেড ইমেজ (16:9)",
    readyToCreate: "তৈরি করতে প্রস্তুত?",
    readySubtitle: "মেনু থেকে একটি টুল বেছে নিন অথবা শুরু করতে একটি টপিক লিখুন।",
    activeModel: "সক্রিয় মডেল",
    totalHistory: "মোট হিস্ট্রি",
    currentView: "বর্তমান ভিউ",
    language: "ভাষা",
    quickTools: "কুইক টুলস",
    viralScript: "ভাইরাল স্ক্রিপ্ট",
    seoTags: "এসইও ট্যাগ",
    aiVideo: "এআই ভিডিও",
    dashboardOverview: "ড্যাশবোর্ড ওভারভিউ",
    copy: "কপি",
    copied: "কপি হয়েছে!",
    copyAll: "সব কপি করুন",
    clearHistory: "হিস্ট্রি মুছুন",
    failed: "জেনারেশন ব্যর্থ হয়েছে। দয়া করে আপনার API কী চেক করুন।",
    noContent: "ডাউনলোড করার জন্য কোন কন্টেন্ট পাওয়া যায়নি!",
    enterNiche: "দয়া করে আপনার নিস বা কি-ওয়ার্ড লিখুন।",
    enterImage: "দয়া করে ইমেজ প্রম্পট লিখুন।",
    enterVoice: "দয়া করে ভয়েস ওভার টেক্সট লিখুন।",
    voiceNote: "দ্রষ্টব্য: আপনি যে ভাষায় টেক্সট দেবেন, এআই সেই ভাষায় কথা বলবে।",
    ideaGenHistory: "আইডিয়া জেন",
    imageGenHistory: "ইমেজ জেন",
    voiceGenHistory: "ভয়েস জেন",
    imageAnalysis: "ইমেজ অ্যানালাইসিস",
    trendingNow: "এই সপ্তাহের ট্রেন্ডিং টপিক",
    loadingTrends: "গ্লোবাল ট্রেন্ড অ্যানালাইসিস করা হচ্ছে...",
    clickToUse: "টপিক হিসেবে ব্যবহার করতে ক্লিক করুন",
    popularCategories: "জনপ্রিয় ২৪টি ক্যাটাগরি",
    videoDuration: "ভিডিওর দৈর্ঘ্য",
    scriptWords: "স্ক্রিপ্ট শব্দের সংখ্যা",
    scriptCharacters: "অক্ষর সীমা",
    charLimit: "অক্ষর",
    seconds: "সেকেন্ড",
    words: "শব্দ",
    refresh: "রিফ্রেশ",
    showMore: "আরো দেখুন",
    showLess: "কম দেখুন",
    bestPostingTime: "সেরা পোস্ট সময়",
    productTopic: "কন্টেন্ট টপিক",
    businessType: "চ্যানেল নিশ",
    platform: "প্ল্যাটফর্ম",
    contentType: "কনটেন্ট টাইপ",
    toneMood: "টোন / মেজাজ",
    visualStyle: "ভিজ্যুয়াল স্টাইল",
    styleCinematic: "সিনেমাটিক",
    stylePhotorealistic: "ফটোরিয়ালিস্টিক",
    styleIllustrative: "ইলাস্ট্রেটিভ",
    styleAnime: "অ্যানিমে",
    style3dRender: "থ্রিডি রেন্ডার",
    shorts: "শর্টস স্ক্রিপ্ট",
    description: "ভিডিও ডেসক্রিপশন",
    titleIdea: "টাইটেল আইডিয়া",
    thumbnail: "থাম্বনেইল কনসেপ্ট",
    fullScript: "ফুল ভিডিও স্ক্রিপ্ট",
    professional: "প্রফেশনাল",
    funny: "ফানি",
    emotional: "ইমোশনাল",
    urgent: "আর্জেন্ট",
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    night: "রাত",
    allPlatforms: "সব প্ল্যাটফর্ম",
    voiceTone: "ভয়েস টোন",
    voiceAccent: "অ্যাকসেন্ট",
    voiceAge: "বয়স",
    toneExcited: "উত্তেজিত",
    toneCalm: "শান্ত",
    toneSerious: "গম্ভীর",
    toneProfessional: "পেশাদার",
    toneStoryteller: "গল্পকার",
    accentUS: "ইউএস",
    accentUK: "ইউকে",
    accentIndian: "ইন্ডিয়ান",
    accentAustralian: "অস্ট্রেলিয়ান",
    ageYoung: "তরুণ",
    ageAdult: "প্রাপ্তবয়স্ক",
    ageSenior: "বয়স্ক",
    settings: "সেটিংস",
    apiKeyLabel: "জেমিনি API কী",
    apiKeyPlaceholder: "আপনার জেমিনি API কী লিখুন...",
    save: "সংরক্ষণ করুন",
    apiStatus: "API স্ট্যাটাস",
    connected: "সংযুক্ত",
    disconnected: "বিচ্ছিন্ন (অফলাইন মোড)",
    apiNote: "দ্রষ্টব্য: আপনার API কী আপনার ব্রাউজারে স্থানীয়ভাবে সংরক্ষিত থাকে এবং আমাদের সার্ভারে পাঠানো হয় না।",
    loadingSteps: [
      "আপনার বিষয়টি বিশ্লেষণ করা হচ্ছে...",
      "ভাইরাল ট্রেন্ড রিসার্চ করা হচ্ছে...",
      "ভাইরাল স্ক্রিপ্ট তৈরি করা হচ্ছে...",
      "এসইও মেটাডেটা অপ্টিমাইজ করা হচ্ছে...",
      "এআই প্রম্পট তৈরি করা হচ্ছে...",
      "আপনার কন্টেন্ট চূড়ান্ত করা হচ্ছে..."
    ],
  }
};

const POPULAR_TOPICS = [
  { en: "Viral Hooks & Scripts", bn: "ভাইরাল হুক ও স্ক্রিপ্ট", icon: "🪝", subs: ["Shorts Hooks", "Storytelling", "Call to Action", "Retention Tips"] },
  { en: "AI Video Creation", bn: "এআই ভিডিও তৈরি", icon: "🤖", subs: ["AI Avatars", "Voice Cloning", "Auto-Captions", "AI B-Roll"] },
  { en: "YouTube SEO Mastery", bn: "ইউটিউব এসইও মাস্টার", icon: "🔍", subs: ["Keyword Research", "Title Optimization", "Tag Strategy", "CTR Secrets"] },
  { en: "Thumbnail Design", bn: "থাম্বনেইল ডিজাইন", icon: "🖼️", subs: ["Clickbait Psychology", "Color Theory", "Face Expressions", "Typography"] },
  { en: "Niche Discovery", bn: "নিশ ডিসকভারি", icon: "🎯", subs: ["Low Competition", "High CPM", "Faceless Channels", "Trending Topics"] },
  { en: "Social Media Growth", bn: "সোশ্যাল মিডিয়া গ্রোথ", icon: "📈", subs: ["Algorithm Hacks", "Posting Schedule", "Engagement Boost", "Cross-Promotion"] },
  { en: "Monetization Hacks", bn: "মনিটাইজেশন হ্যাকস", icon: "💰", subs: ["Sponsorships", "Brand Deals", "Exclusive Content", "AdSense Optimization"] },
  { en: "Cinematic Editing", bn: "সিনেমাটিক এডিটিং", icon: "🎬", subs: ["Color Grading", "Sound Design", "Transitions", "Speed Ramping"] },
  { en: "Personal Branding", bn: "পার্সোনাল ব্র্যান্ডিং", icon: "👤", subs: ["Visual Identity", "Voice & Tone", "Logo Design", "Bio Optimization"] },
  { en: "Podcast & Audio", bn: "পডকাস্ট ও অডিও", icon: "🎙️", subs: ["Audio Quality", "Interview Skills", "Distribution", "Background Music"] },
  { en: "Short-Form Content", bn: "শর্ট-ফর্ম কন্টেন্ট", icon: "📱", subs: ["Reels Strategy", "TikTok Trends", "Shorts Loop", "Vertical Video"] },
  { en: "Content Strategy", bn: "কন্টেন্ট স্ট্র্যাটেজি", icon: "📅", subs: ["Content Calendar", "Batch Producing", "Repurposing", "Analytics"] },
  { en: "Integrated Farming", bn: "সমন্বিত কৃষি খামার", icon: "🏡", subs: ["Fish & Poultry", "Modern Irrigation", "Bio-Floc System", "Sustainable Farming"] },
  { en: "Modern Livestock", bn: "আধুনিক গবাদি পশু পালন", icon: "🐄", subs: ["Dairy Management", "Goat Fattening", "Fodder Production", "Disease Control"] },
  { en: "Smart Agriculture", bn: "স্মার্ট কৃষি প্রযুক্তি", icon: "🌱", subs: ["Hydroponics", "Greenhouse", "Vertical Farming", "Drip Irrigation"] },
  { en: "Farming Vlogs", bn: "কৃষি ব্লগিং আইডিয়া", icon: "🚀", subs: ["Daily Farm Life", "Harvesting Vlogs", "Farming Tips", "Agri-Education"] }
];

const BEST_POSTING_TIMES = [
  { platform: "Facebook", time: "8-10 AM", period: "morning", icon: "📘" },
  { platform: "Instagram", time: "6-9 PM", period: "evening", icon: "📸" },
  { platform: "TikTok", time: "7-10 PM", period: "night", icon: "🎵" },
  { platform: "YouTube", time: "2-4 PM", period: "afternoon", icon: "▶️" },
  { platform: "WhatsApp", time: "8-11 AM", period: "morning", icon: "💬" },
  { platform: "All Platforms", time: "9-11 PM", period: "night", icon: "🌙" }
];

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' }
];

const CONTENT_TYPES = [
  { id: 'shorts', name: 'Shorts Script', icon: '🎬' },
  { id: 'description', name: 'Video Description', icon: '📝' },
  { id: 'titleIdea', name: 'Title Idea', icon: '💡' },
  { id: 'thumbnail', name: 'Thumbnail Concept', icon: '🖼️' },
  { id: 'fullScript', name: 'Full Video Script', icon: '📜' }
];

const TONES = [
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'funny', name: 'Funny', icon: '😂' },
  { id: 'emotional', name: 'Emotional', icon: '❤️' },
  { id: 'urgent', name: 'Urgent', icon: '🚨' }
];

const VISUAL_STYLES = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸' },
  { id: 'illustrative', name: 'Illustrative', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '🌸' },
  { id: '3dRender', name: '3D Render', icon: '🧊' }
];

const PROMPT_ELEMENTS = {
  subject: [
    { en: "Cybernetic Human", bn: "সাইবারনেটিক মানুষ", icon: "👤" },
    { en: "Mythical Creature", bn: "পৌরাণিক প্রাণী", icon: "🐉" },
    { en: "Futuristic Robot", bn: "ভবিষ্যত রোবট", icon: "🤖" },
    { en: "Ethereal Landscape", bn: "স্বর্গীয় ল্যান্ডস্কেপ", icon: "🏔️" },
    { en: "Abstract Geometry", bn: "বিমূর্ত জ্যামিতি", icon: "📐" },
    { en: "Historical Figure", bn: "ঐতিহাসিক ব্যক্তিত্ব", icon: "📜" },
    { en: "Sci-fi Vehicle", bn: "সাই-ফাই যানবাহন", icon: "🛸" },
    { en: "Nature Close-up", bn: "প্রকৃতির ক্লোজ-আপ", icon: "🌿" }
  ],
  camera: [
    { en: "Low Angle", bn: "নিচ থেকে অ্যাঙ্গেল", icon: "📸" },
    { en: "High Angle", bn: "উপর থেকে অ্যাঙ্গেল", icon: "📸" },
    { en: "Bird's Eye View", bn: "পাখির চোখের মতো ভিউ", icon: "🦅" },
    { en: "Close-up", bn: "ক্লোজ-আপ", icon: "🔍" },
    { en: "Wide Shot", bn: "ওয়াইড শট", icon: "🖼️" },
    { en: "Dutch Angle", bn: "ডাচ অ্যাঙ্গেল", icon: "📐" },
    { en: "Tracking Shot", bn: "ট্র্যাকিং শট", icon: "🏃" },
    { en: "Drone Shot", bn: "ড্রোন শট", icon: "🚁" }
  ],
  lighting: [
    { en: "Cinematic Lighting", bn: "সিনেমাটিক লাইটিং", icon: "💡" },
    { en: "Soft Lighting", bn: "সফট লাইটিং", icon: "☁️" },
    { en: "Neon Glow", bn: "নিয়ন গ্লো", icon: "🌈" },
    { en: "Golden Hour", bn: "গোল্ডেন আওয়ার", icon: "🌅" },
    { en: "Moody Atmosphere", bn: "মুডি অ্যাটমোস্ফিয়ার", icon: "🌫️" },
    { en: "Studio Lighting", bn: "স্টুডিও লাইটিং", icon: "🔦" },
    { en: "Natural Light", bn: "প্রাকৃতিক আলো", icon: "☀️" },
    { en: "Cyberpunk Glow", bn: "সাইবারপাঙ্ক গ্লো", icon: "🌃" }
  ],
  mood: [
    { en: "Mysterious", bn: "রহস্যময়", icon: "🕵️" },
    { en: "Joyful", bn: "আনন্দময়", icon: "😊" },
    { en: "Melancholic", bn: "বিষণ্ণ", icon: "😢" },
    { en: "Epic", bn: "মহাকাব্যিক", icon: "⚔️" },
    { en: "Futuristic", bn: "ভবিষ্যতবাদী", icon: "🚀" },
    { en: "Nostalgic", bn: "স্মৃতিবেদনাতুর", icon: "🎞️" },
    { en: "Aggressive", bn: "আক্রমণাত্মক", icon: "💢" },
    { en: "Peaceful", bn: "শান্তিপূর্ণ", icon: "🕊️" }
  ],
  environment: [
    { en: "Cyberpunk City", bn: "সাইবারপাঙ্ক শহর", icon: "🏙️" },
    { en: "Ancient Forest", bn: "প্রাচীন বন", icon: "🌳" },
    { en: "Outer Space", bn: "মহাকাশ", icon: "🌌" },
    { en: "Underwater World", bn: "পানির নিচের জগত", icon: "🌊" },
    { en: "Desert Oasis", bn: "মরুভূমির মরূদ্যান", icon: "🏜️" },
    { en: "Snowy Mountains", bn: "তুষারাবৃত পাহাড়", icon: "🏔️" },
    { en: "Post-Apocalyptic", bn: "ধ্বংসাত্মক পরবর্তী", icon: "🏚️" },
    { en: "Cozy Interior", bn: "আরামদায়ক অভ্যন্তর", icon: "🏠" }
  ],
  style: [
    { en: "Cyberpunk", bn: "সাইবারপাঙ্ক", icon: "🤖" },
    { en: "Minimalist", bn: "মিনিমালিস্ট", icon: "⚪" },
    { en: "Surrealism", bn: "সুররিয়ালিজম", icon: "🌀" },
    { en: "Hyper-realistic", bn: "হাইপার-রিয়েলিস্টিক", icon: "💎" },
    { en: "Oil Painting", bn: "তৈলচিত্র", icon: "🎨" },
    { en: "Digital Art", bn: "ডিজিটাল আর্ট", icon: "💻" },
    { en: "Vaporwave", bn: "ভেপারওয়েভ", icon: "📼" },
    { en: "Steampunk", bn: "স্টিমপাঙ্ক", icon: "⚙️" },
    { en: "Anime Style", bn: "অ্যানিমে স্টাইল", icon: "🌸" },
    { en: "3D Render", bn: "থ্রিডি রেন্ডার", icon: "🧊" }
  ],
  movement: [
    { en: "Slow Motion", bn: "স্লো মোশন", icon: "🐢" },
    { en: "Fast Paced", bn: "ফাস্ট পেসড", icon: "⚡" },
    { en: "Smooth Transitions", bn: "স্মুথ ট্রানজিশন", icon: "✨" },
    { en: "Dynamic Motion", bn: "ডাইনামিক মোশন", icon: "🔥" },
    { en: "Static Shot", bn: "স্ট্যাটিক শট", icon: "📍" },
    { en: "Time-lapse", bn: "টাইম-ল্যাপস", icon: "⏳" }
  ],
  composition: [
    { en: "Rule of Thirds", bn: "রুল অফ থার্ডস", icon: "📏" },
    { en: "Symmetrical", bn: "প্রতিসম", icon: "⚖️" },
    { en: "Leading Lines", bn: "লিডিং লাইনস", icon: "🛤️" },
    { en: "Golden Ratio", bn: "গোল্ডেন রেশিও", icon: "🌀" },
    { en: "Minimalist Framing", bn: "মিনিমালিস্ট ফ্রেমিং", icon: "🖼️" },
    { en: "Deep Depth of Field", bn: "ডিপ ডেপথ অফ ফিল্ড", icon: "🏔️" },
    { en: "Shallow Depth of Field", bn: "শ্যালো ডেপথ অফ ফিল্ড", icon: "📸" }
  ],
  colors: [
    { en: "Vibrant Colors", bn: "প্রাণবন্ত রঙ", icon: "🌈" },
    { en: "Monochrome", bn: "মনোক্রোম", icon: "⚫" },
    { en: "Pastel Tones", bn: "প্যাস্টেল টোন", icon: "🎨" },
    { en: "High Contrast", bn: "উচ্চ বৈপরীত্য", icon: "🌓" },
    { en: "Warm Tones", bn: "উষ্ণ টোন", icon: "🔥" },
    { en: "Cool Tones", bn: "শীতল টোন", icon: "❄️" },
    { en: "Sepia", bn: "সেপিয়া", icon: "🎞️" },
    { en: "Neon Palette", bn: "নিয়ন প্যালেট", icon: "🌃" }
  ],
  weather: [
    { en: "Rainy", bn: "বৃষ্টির দিন", icon: "🌧️" },
    { en: "Foggy", bn: "কুয়াশাচ্ছন্ন", icon: "🌫️" },
    { en: "Stormy", bn: "ঝড়ো", icon: "⛈️" },
    { en: "Sunny", bn: "রৌদ্রোজ্জ্বল", icon: "☀️" },
    { en: "Snowing", bn: "তুষারপাত", icon: "❄️" },
    { en: "Cloudy", bn: "মেঘলা", icon: "☁️" }
  ],
  time: [
    { en: "Dawn", bn: "ভোর", icon: "🌅" },
    { en: "Midnight", bn: "মধ্যরাত", icon: "🌑" },
    { en: "Noon", bn: "দুপুর", icon: "☀️" },
    { en: "Twilight", bn: "গোধূলি", icon: "🌇" },
    { en: "Golden Hour", bn: "গোল্ডেন আওয়ার", icon: "✨" },
    { en: "Blue Hour", bn: "ব্লু আওয়ার", icon: "🌌" }
  ],
  texture: [
    { en: "Metallic", bn: "ধাতব", icon: "🔩" },
    { en: "Glassy", bn: "কাঁচের মতো", icon: "💎" },
    { en: "Fabric", bn: "কাপড়", icon: "👕" },
    { en: "Liquid", bn: "তরল", icon: "💧" },
    { en: "Holographic", bn: "হলোগ্রাফিক", icon: "💿" },
    { en: "Rough", bn: "অমসৃণ", icon: "🧱" }
  ]
};

const SCENE_PRESETS = [
  {
    en: "Cinematic Night",
    bn: "সিনেমাটিক রাত",
    icon: "🎬",
    elements: ["Cinematic Lighting", "Midnight", "Low Angle", "Moody Atmosphere"]
  },
  {
    en: "Cyberpunk City",
    bn: "সাইবারপাঙ্ক শহর",
    icon: "🌃",
    elements: ["Cyberpunk", "Neon Glow", "Cyberpunk City", "High Contrast"]
  },
  {
    en: "Ethereal Nature",
    bn: "স্বর্গীয় প্রকৃতি",
    icon: "🌿",
    elements: ["Ethereal Landscape", "Soft Lighting", "Golden Hour", "Ancient Forest"]
  },
  {
    en: "Epic Action",
    bn: "অ্যাকশন দৃশ্য",
    icon: "🔥",
    elements: ["Epic", "Dynamic Motion", "Wide Shot", "High Contrast"]
  }
];

const MODEL_INFO: Record<AIProvider, { 
  name: string; 
  description: string; 
  strengths: string[]; 
  weaknesses: string[]; 
  useCases: string[]; 
  pricing: string;
}> = {
  gemini: {
    name: "Google Gemini",
    description: "Google's most capable AI model, integrated with the Google ecosystem.",
    strengths: ["Multimodal (Text, Image, Video)", "Massive context window (up to 2M tokens)", "Fast & Efficient"],
    weaknesses: ["Can be overly restrictive in safety filters"],
    useCases: ["Long document analysis", "Complex multimodal tasks", "General content creation"],
    pricing: "Free tier available; Paid for high-volume usage."
  },
  openai: {
    name: "OpenAI GPT-4o",
    description: "The industry standard for high-reasoning AI tasks.",
    strengths: ["State-of-the-art reasoning", "Excellent instruction following", "Reliable performance"],
    weaknesses: ["Higher latency", "More expensive than competitors"],
    useCases: ["Complex logic & coding", "High-quality creative writing", "Strategic planning"],
    pricing: "~$5.00 per 1M input tokens; ~$15.00 per 1M output tokens."
  },
  groq: {
    name: "Groq (Llama 3.3 70B)",
    description: "The world's fastest AI inference engine, powered by LPU technology.",
    strengths: ["Ultra-fast response times", "Excellent for real-time apps", "High throughput"],
    weaknesses: ["Smaller context window compared to Gemini"],
    useCases: ["Real-time script generation", "Fast brainstorming", "Interactive AI agents"],
    pricing: "Extremely low cost; Free for some models on Groq Cloud."
  },
  deepseek: {
    name: "DeepSeek-V3",
    description: "A high-performance, open-source model optimized for coding and math.",
    strengths: ["Exceptional coding capability", "Very low cost", "Strong logical reasoning"],
    weaknesses: ["Newer provider with potentially lower stability"],
    useCases: ["Technical content writing", "Code generation", "Mathematical problem solving"],
    pricing: "~$0.10 per 1M input tokens; ~$0.20 per 1M output tokens."
  },
  perplexity: {
    name: "Perplexity Sonar",
    description: "AI-powered search engine that provides real-time information with citations.",
    strengths: ["Real-time web access", "Accurate source citations", "Up-to-date information"],
    weaknesses: ["Primarily optimized for search/research tasks"],
    useCases: ["SEO research", "Fact-checking", "Market analysis & trends"],
    pricing: "~$5.00 per 1M tokens (includes search cost)."
  },
  gemma: {
    name: "Google Gemma 4",
    description: "Google's open-weights model, optimized for high performance and efficiency.",
    strengths: ["Open-weights flexibility", "High performance for its size", "Efficient inference"],
    weaknesses: ["Smaller context window than Gemini Pro"],
    useCases: ["Local deployment", "Fine-tuning for specific tasks", "General AI assistance"],
    pricing: "Free on some platforms (e.g., Groq); Low cost via API providers."
  }
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [uiLang, setUiLang] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('uiLang');
    return (saved === 'en' || saved === 'bn') ? saved : 'en';
  });

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
    shorts: ''
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
    shorts: null
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
      cameraAngle: 'wide shot',
      mood: 'cinematic',
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
      promptCategory: 'Video' as 'Video' | 'Story' | 'Image' | 'Voice Over'
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
    shorts: null
  });
  const [mediaMimeType, setMediaMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[uiLang];

  const currentTopic = topics[currentView];
  const currentResult = results[currentView];
  const currentSelectedMedia = selectedMedia[currentView];
  const acceptType = currentView === 'video' ? "video/*" : (currentView === 'voiceExtractor' ? "audio/*,video/*" : (currentView === 'image' ? "video/*,image/*" : "image/*"));

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
    if (currentView === 'idea' && trendingTopics.length === 0) {
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
  }, [currentView, uiLang]);

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
      } else if (activeView === 'image') {
        if (currentSelectedMedia) {
          setLoadingStep(2); // Generating...
          setLoadingProgress(40);
          if (mediaMimeType.startsWith('video/')) {
            const res = await generatePromptsFromVideo(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Video Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
          } else {
            const res = await generatePromptsFromImage(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Image Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Image Extraction & Analysis" : "ইমেজ এক্সট্র্যাকশন ও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
          }
        } else {
            setLoadingStep(2); // Generating...
            setLoadingProgress(40);
            const res = await generateImage(activeTopic, options.aspectRatio as any);
            setResults(prev => ({ ...prev, [activeView]: { imageUrl: res } }));
            saveToHistory(activeTopic, { imageUrl: res }, 'image');
            toast.success(t.imageGenHistory + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
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
        const { GoogleGenAI, Type } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prompts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING
                  }
                }
              }
            },
            temperature: 0.95,
          }
        });
        
        const parsed = JSON.parse(response.text || '{"prompts": []}');
        setResults(prev => ({ ...prev, [activeView]: parsed }));
        saveToHistory(activeTopic, parsed, 'promptGen');
        toast.success(t.promptGen + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
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
            const res = await generatePromptsFromVideo(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Video Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
          } else {
            const res = await generatePromptsFromImage(currentSelectedMedia, mediaMimeType, options.language, activeTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
            setResults(prev => ({ ...prev, [activeView]: res }));
            saveToHistory(activeTopic || "Image Analysis", res, 'image-to-prompt');
            toast.success((uiLang === 'en' ? "Image Extraction & Analysis" : "ইমেজ এক্সট্র্যাকশন ও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
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
              res = await generatePromptsFromVideo(base64, file.type, options.language, currentTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
              toast.success((uiLang === 'en' ? "Video Analysis" : "ভিডিও বিশ্লেষণ") + " " + (uiLang === 'en' ? "Completed!" : "সম্পন্ন হয়েছে!"));
            } else {
              res = await generatePromptsFromImage(base64, file.type, options.language, currentTopic, options.videoDuration, options.scriptWordCount, formOptions.visualStyle, formOptions.cameraAngle, formOptions.mood);
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
        <div style="border-bottom: 2px solid #f27d26; padding-bottom: 20px; margin-bottom: 30px; box-sizing: border-box !important;">
          <h1 style="color: #f27d26 !important; margin: 0; font-size: 32px; box-sizing: border-box !important;">YouTube AI Content Report</h1>
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
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #f27d26 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Unique Prompts</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.prompts.map((prompt: string, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #f27d26 !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Option ${i + 1}</strong>
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
            <h2 style="color: #1a1a1a !important; border-left: 4px solid #f27d26 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">Viral Video Ideas</h2>
            <ul style="list-style-type: none !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              ${currentResult.ideas.map((idea: any, i: number) => `
                <li style="margin-bottom: 15px !important; padding: 15px !important; background-color: #f9f9f9 !important; border-radius: 8px !important; border: 1px solid #eeeeee !important; box-sizing: border-box !important; overflow-wrap: break-word !important; word-break: break-word !important;">
                  <strong style="color: #f27d26 !important; display: block !important; margin-bottom: 5px !important; font-size: 16px !important;">Idea ${i + 1}: ${idea.title}</strong>
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
              <h2 style="color: #1a1a1a !important; border-left: 4px solid #f27d26 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${labelMap[key]}</h2>
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
                <h2 style="color: #1a1a1a !important; border-left: 4px solid #f27d26 !important; padding-left: 15px !important; margin-bottom: 15px !important; font-size: 20px !important; box-sizing: border-box !important;">${mLabelMap[mKey] || mKey}</h2>
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
      shorts: ''
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
      shorts: null
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
      shorts: null
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
      gemma: customGemmaKey
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
      color: #f27d26;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(242, 125, 38, 0.1);
      border: 1px solid rgba(242, 125, 38, 0.3);
      color: #f27d26;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .btn:hover {
      background: rgba(242, 125, 38, 0.2);
    }
    .btn-primary {
      background: #f27d26;
      color: #fff;
    }
    .btn-primary:hover {
      background: #e06c15;
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
      color: #f27d26;
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
        contents: [{ parts: [{ text: prompt }] }]
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
          ctx.fillStyle = '#f27d26';
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
    <div className="min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-brand-orange selection:text-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
        <Toaster position="top-right" richColors />
        
        <AnimatePresence mode="wait">
          {currentView === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col -mt-4 md:-mt-10"
            >
              {/* Navigation */}
              <nav className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-50">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2 md:gap-4 group cursor-pointer"
                  onClick={() => setCurrentView('landing')}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-linear-to-br from-brand-orange to-[#ff5c00] flex items-center justify-center shadow-xl shadow-brand-orange/20 group-hover:scale-110 transition-transform duration-500">
                    <Youtube className="text-white" size={24} />
                  </div>
                  <span className="text-lg md:text-2xl font-display font-black tracking-tighter uppercase glow-text">{t.title}</span>
                </motion.div>
                
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-400"
                >
                  {['Features', 'How it Works', 'FAQ'].map((item) => (
                    <button 
                      key={item}
                      onClick={() => document.getElementById(item.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-brand-orange transition-colors relative group"
                    >
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
                    </button>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <button
                    onClick={() => setCurrentView('home')}
                    className="btn-primary px-4 md:px-8 py-2 md:py-3.5 text-xs md:text-sm"
                  >
                    {t.getStarted}
                  </button>
                </motion.div>
              </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <motion.div 
                  animate={{ 
                    y: [0, 20, 0],
                    opacity: [0.1, 0.15, 0.1]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[150px]" 
                />
                <motion.div 
                  animate={{ 
                    y: [0, -30, 0],
                    opacity: [0.1, 0.12, 0.1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px]" 
                />
              </div>

              <div className="relative max-w-7xl mx-auto px-6 text-center space-y-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md"
                >
                  <Sparkles size={14} className="animate-pulse" /> {t.subtitle}
                </motion.div>

                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tight leading-[0.9] max-w-5xl mx-auto"
                >
                  {t.heroTitle.split(' ').map((word, i) => (
                    <span key={i} className={i === 2 ? "orange-glow-text block md:inline" : "glow-text"}>{word} </span>
                  ))}
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-2xl mx-auto text-base md:text-xl text-slate-400 font-light leading-relaxed px-4 md:px-0"
                >
                  {t.heroSubtitle}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                >
                  <button
                    onClick={() => setCurrentView('home')}
                    className="btn-primary group px-10 py-5 text-lg"
                  >
                    <span className="relative flex items-center gap-3">
                      {t.getStarted} <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md"
                  >
                    {t.features}
                  </button>
                </motion.div>
              </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="py-32 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-display font-black tracking-tighter glow-text"
                  >
                    {t.features}
                  </motion.h2>
                  <div className="w-24 h-1.5 bg-brand-orange mx-auto rounded-full shadow-[0_0_15px_rgba(242,125,38,0.5)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Feature 1: Main */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-8 glass-card p-10 flex flex-col justify-between min-h-[400px] group"
                  >
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-500">
                        <Video size={32} />
                      </div>
                      <h3 className="text-3xl font-display font-bold">{t.videoGen}</h3>
                      <p className="text-slate-400 text-lg max-w-md leading-relaxed">Generate full scripts with viral potential using advanced AI models tailored for your niche.</p>
                    </div>
                    <div className="pt-8 flex gap-4">
                      <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500">Scripting</div>
                      <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500">SEO</div>
                      <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500">Viral</div>
                    </div>
                  </motion.div>

                  {/* Feature 2: Side */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-4 glass-card p-10 flex flex-col justify-between group"
                  >
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                        <Lightbulb size={32} />
                      </div>
                      <h3 className="text-2xl font-display font-bold">{t.viralIdeas}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Find trending topics and niche-specific video ideas instantly with our global trend analyzer.</p>
                    </div>
                    <button onClick={() => setCurrentView('idea')} className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Explore Ideas <ChevronRight size={16} />
                    </button>
                  </motion.div>

                  {/* Feature 3: Bottom Left */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-4 glass-card p-10 flex flex-col justify-between group"
                  >
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <Mic size={32} />
                      </div>
                      <h3 className="text-2xl font-display font-bold">{t.voiceOver}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Professional AI voiceovers in multiple languages, tones, and accents for your videos.</p>
                    </div>
                  </motion.div>

                  {/* Feature 4: Bottom Right */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-8 glass-card p-10 flex flex-col justify-between min-h-[300px] group"
                  >
                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                      <div className="space-y-6 flex-1">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                          <Palette size={32} />
                        </div>
                        <h3 className="text-3xl font-display font-bold">{t.imageGen}</h3>
                        <p className="text-slate-400 text-lg leading-relaxed">Extract high-quality prompts and generate stunning AI visuals for thumbnails and b-roll.</p>
                      </div>
                      <div className="w-full md:w-48 aspect-square rounded-2xl bg-linear-to-br from-purple-500/20 to-brand-orange/20 border border-white/5 flex items-center justify-center">
                        <ImageIcon size={64} className="text-white/20" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">How it Works</h2>
                  <div className="w-20 h-1 bg-brand-orange mx-auto rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { step: "01", title: "Input Topic", desc: "Enter your video topic or niche." },
                    { step: "02", title: "AI Generation", desc: "Our AI crafts the perfect script and visuals." },
                    { step: "03", title: "Review & Export", desc: "Review, edit, and export your content." }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 }}
                      className="text-center space-y-4"
                    >
                      <div className="text-4xl font-black text-brand-orange/20">{item.step}</div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24">
              <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">{t.faq}</h2>
                  <div className="w-20 h-1 bg-brand-orange mx-auto rounded-full" />
                </div>

                <div className="space-y-4">
                  {[
                    { q: "Is this tool free to use?", a: "Yes, you can use it with our default API or connect your own for higher limits." },
                    { q: "Which AI models are supported?", a: "We support Google Gemini, OpenAI (GPT-4), and Groq for lightning-fast speeds." },
                    { q: "Can I download my scripts?", a: "Absolutely! You can download your generated content as a professional PDF report." }
                  ].map((item, i) => (
                    <motion.details 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card group"
                    >
                      <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-bold">
                        {item.q}
                        <ChevronRight size={18} className="group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-6 pb-6 text-slate-400 text-sm">
                        {item.a}
                      </div>
                    </motion.details>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-12 border-t border-brand-border bg-black/40 rounded-t-3xl">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-lg shadow-brand-orange/20">
                      <Youtube className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">{t.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Empowering creators with the world's most advanced AI tools for YouTube growth.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300">{t.features}</h4>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="hover:text-brand-orange cursor-pointer transition-colors" onClick={() => setCurrentView('video')}>{t.videoGen}</li>
                    <li className="hover:text-brand-orange cursor-pointer transition-colors" onClick={() => setCurrentView('idea')}>{t.ideaGen}</li>
                    <li className="hover:text-brand-orange cursor-pointer transition-colors" onClick={() => setCurrentView('image')}>{t.imageGen}</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300">Company</h4>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="hover:text-brand-orange cursor-pointer transition-colors">{t.about}</li>
                    <li 
                      className="hover:text-brand-orange cursor-pointer transition-colors"
                      onClick={() => setShowContact(true)}
                    >
                      {t.contact}
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300">Connect</h4>
                  <div className="flex gap-4">
                    <Facebook size={20} className="text-slate-500 hover:text-brand-orange cursor-pointer transition-colors" />
                    <Twitter size={20} className="text-slate-500 hover:text-brand-orange cursor-pointer transition-colors" />
                    <Github size={20} className="text-slate-500 hover:text-brand-orange cursor-pointer transition-colors" />
                    <Share2 size={20} className="text-slate-500 hover:text-brand-orange cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-brand-border text-center text-[10px] text-slate-600">
                © {new Date().getFullYear()} {t.title}. All Rights Reserved.
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
            <header className="sticky top-0 z-50 w-full mb-8 md:mb-12">
              {/* Tier 1: Branding & Utilities */}
              <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 md:gap-4 cursor-pointer group"
                    onClick={() => setCurrentView('landing')}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 glass-card flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform duration-500 shadow-brand-glow/20">
                      <Youtube size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h1 className="text-lg md:text-2xl font-display font-black tracking-tighter glow-text uppercase group-hover:text-brand-orange transition-colors leading-none">{t.title}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500 text-[8px] md:text-[10px] flex items-center gap-1 font-medium">
                          <Sparkles size={10} className="text-brand-orange animate-pulse" /> {t.subtitle}
                        </p>
                        <div className={cn(
                          "px-1.5 py-0.5 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-widest flex items-center gap-1",
                          isApiConnected ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full", isApiConnected ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                          {isApiConnected ? (uiLang === 'en' ? "Active" : "সক্রিয়") : (uiLang === 'en' ? "Offline" : "অফলাইন")}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2 md:gap-3"
                  >
                    <div className="relative group">
                      <select
                        value={uiLang}
                        onChange={(e) => setUiLang(e.target.value as 'en' | 'bn')}
                        className="appearance-none glass-card px-3 py-1.5 md:px-4 md:py-2 pr-8 text-[10px] md:text-xs font-bold text-slate-400 hover:text-brand-orange transition-all outline-none cursor-pointer bg-transparent border-white/5"
                      >
                        <option value="en" className="bg-brand-card text-slate-300">English</option>
                        <option value="bn" className="bg-brand-card text-slate-300">বাংলা</option>
                      </select>
                      <Languages size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-brand-orange transition-colors" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      className="glass-card p-1.5 md:p-2 flex items-center justify-center text-slate-400 hover:text-brand-orange transition-all border-white/5"
                      title={t.refresh}
                    >
                      <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSettings(true)}
                      className="glass-card p-1.5 md:p-2 flex items-center justify-center text-slate-400 hover:text-brand-orange transition-all border-white/5"
                      title={t.settings}
                    >
                      <Globe size={14} />
                    </motion.button>
                  </motion.div>
                </div>
              </div>

              {/* Tier 2: Navigation Bar */}
              <div className="bg-slate-900/40 backdrop-blur-md border-b border-white/10 py-2 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                  <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                    {[
                      { id: 'home', icon: Home, label: t.home },
                      { id: 'video', icon: Video, label: t.videoGen },
                      { id: 'shorts', icon: Zap, label: t.shortsGen },
                      { id: 'idea', icon: Lightbulb, label: t.ideaGen },
                      { id: 'image', icon: Palette, label: t.imageGen },
                      { id: 'voice', icon: Mic, label: t.voiceOver },
                      { id: 'voiceExtractor', icon: AudioLines, label: t.voiceExtractor },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id as any);
                          if (item.id === 'video') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: true }));
                          } else if (item.id === 'shorts') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: false }));
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 shrink-0 border border-transparent",
                          currentView === item.id 
                            ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20 font-bold" 
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        )}
                      >
                        <item.icon size={16} />
                        <span className="text-[10px] md:text-xs whitespace-nowrap">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                  
                  <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <button 
                      onClick={downloadPdf}
                      disabled={!currentResult || currentResult.imageUrl || currentResult.audioUrl}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300 shrink-0 border",
                        (currentResult && !currentResult.imageUrl && !currentResult.audioUrl) 
                          ? "text-blue-500 border-blue-500/20 hover:bg-blue-500/10" 
                          : "text-slate-600 border-white/5 cursor-not-allowed opacity-50"
                      )}
                      title={t.downloadReport}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </header>


      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-brand-orange/30"></div>
            <LayoutDashboard size={14} className="text-brand-orange" /> {t.dashboardOverview}
          </h2>
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={installApp}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
            >
              <Download size={14} />
              {uiLang === 'en' ? "Install App" : "অ্যাপ ইনস্টল"}
            </motion.button>
          )}
        </div>

        {/* Dashboard Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-4 flex items-center gap-4 bg-linear-to-br from-brand-orange/10 to-transparent border-brand-orange/20"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shadow-lg shadow-brand-orange/20">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{t.activeModel}</p>
              <p className="text-sm font-black text-white capitalize">{aiProvider}</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-4 flex items-center gap-4 bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
              <History size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{t.totalHistory}</p>
              <p className="text-sm font-black text-white">{history.length}</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-4 flex items-center gap-4 bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{t.language}</p>
              <p className="text-sm font-black text-white uppercase">{uiLang}</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-4 flex items-center gap-4 bg-linear-to-br from-purple-500/10 to-transparent border-purple-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{t.currentView}</p>
              <p className="text-sm font-black text-white capitalize">{currentView}</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <section className="glass-card p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {currentView === 'home' && <LayoutDashboard size={20} className="text-brand-orange" />}
                {currentView === 'youtube' && <Youtube size={20} className="text-brand-orange" />}
                {currentView === 'video' && <Video size={20} className="text-brand-orange" />}
                {currentView === 'shorts' && <Zap size={20} className="text-brand-orange" />}
                {currentView === 'idea' && <Lightbulb size={20} className="text-brand-orange" />}
                {currentView === 'image' && (
                  <div className="flex items-center gap-1">
                    <Palette size={20} className="text-brand-orange" />
                    <Search size={16} className="text-brand-orange/60" />
                  </div>
                )}
                {currentView === 'voice' && <Mic size={20} className="text-brand-orange" />}
                {currentView === 'voiceExtractor' && <AudioLines size={20} className="text-brand-orange" />}
                {currentView === 'home' ? t.dashboard : 
                 currentView === 'youtube' ? t.youtubeToolset : 
                 currentView === 'video' ? t.videoPrompter : 
                 currentView === 'shorts' ? t.shortsGenTitle : 
                 currentView === 'idea' ? t.viralIdeas :
                 currentView === 'image' ? t.imageGenerator : 
                 currentView === 'voice' ? t.voiceOverTitle :
                 currentView === 'voiceExtractor' ? t.voiceExtractorTitle : t.promptGen}
              </h2>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-slate-400 hover:text-brand-orange transition-colors flex items-center gap-2 text-sm"
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
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <FileText size={14} /> {
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
                      className="w-full input-field min-h-[100px] resize-none"
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
                    {showAllTopics && (currentView === 'idea' || currentView === 'home') && (
                      <div className="absolute z-10 w-full mt-1 bg-black/90 border border-brand-border rounded-xl shadow-xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                        {currentView === 'idea' ? (
                          trendingTopics.map((trend, idx) => (
                            <div 
                              key={idx} 
                              className="p-2 hover:bg-brand-orange/20 cursor-pointer text-sm text-slate-300 hover:text-white"
                              onClick={() => {
                                setTopics(prev => ({ ...prev, [currentView]: trend.topic }));
                                setShowAllTopics(false);
                              }}
                            >
                              {trend.topic}
                            </div>
                          ))
                        ) : (
                          POPULAR_TOPICS.map((topic, idx) => (
                            <div 
                              key={idx} 
                              className="p-2 hover:bg-brand-orange/20 cursor-pointer text-sm text-slate-300 hover:text-white"
                              onClick={() => {
                                setTopics(prev => ({ ...prev, [currentView]: uiLang === 'bn' ? topic.bn : topic.en }));
                                setShowAllTopics(false);
                              }}
                            >
                              {uiLang === 'bn' ? topic.bn : topic.en}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {(currentView === 'image' || currentView === 'video') && (
                    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-orange font-black">
                          <Sparkles size={12} /> {uiLang === 'en' ? "Prompt Suggestions" : "প্রম্পট সাজেশন"}
                        </div>
                        {topics[currentView].trim() !== "" && (
                          <button 
                            onClick={() => {
                              setTopics(prev => ({ ...prev, [currentView]: "" }));
                              toast.info(uiLang === 'en' ? "Prompt cleared" : "প্রম্পট মুছে ফেলা হয়েছে");
                            }}
                            className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-brand-orange transition-colors font-bold flex items-center gap-1"
                          >
                            <Trash2 size={10} /> {uiLang === 'en' ? "Clear" : "মুছুন"}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {/* Scene Presets */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-tighter text-brand-orange font-black px-1 flex items-center gap-1">
                            <Zap size={10} /> {uiLang === 'en' ? "Scene Presets" : "সিন প্রিসেট"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {SCENE_PRESETS.map((preset, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(242, 125, 38, 0.2)" }}
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
                                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 hover:border-brand-orange/50 transition-all flex items-center gap-1.5 text-brand-orange font-bold"
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
                              <div key={category} className="space-y-1.5 border-t border-white/5 pt-2 first:border-0 first:pt-0">
                                <button 
                                  onClick={() => setExpandedCategories(prev => 
                                    prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
                                  )}
                                  className="w-full flex items-center justify-between text-[9px] uppercase tracking-tighter text-slate-500 font-bold px-1 hover:text-slate-300 transition-colors"
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
                                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                </button>
                                
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-wrap gap-1.5 py-1">
                                        {elements.map((el, idx) => {
                                          const isSelected = topics[currentView].split(',').map(s => s.trim()).includes(el.en);
                                          return (
                                            <motion.button
                                              key={idx}
                                              whileHover={{ scale: 1.05, backgroundColor: isSelected ? "rgba(242, 125, 38, 0.3)" : "rgba(242, 125, 38, 0.2)" }}
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
                                                "text-[10px] px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5",
                                                isSelected 
                                                  ? "bg-brand-orange/20 border-brand-orange text-white shadow-[0_0_10px_rgba(242,125,38,0.2)]" 
                                                  : "bg-white/5 border-white/5 text-slate-300 hover:border-brand-orange/30 hover:text-white"
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
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <Languages size={14} className="text-brand-orange" /> {t.targetLanguage}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'en' }))}
                      className={cn(
                        "py-3 rounded-xl border border-brand-border text-sm font-bold transition-all flex items-center justify-center gap-2",
                        options.language === 'en' ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "bg-black/40 text-slate-400 hover:bg-black/60"
                      )}
                    >
                      {options.language === 'en' && <Check size={16} />} {t.en}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'bn' }))}
                      className={cn(
                        "py-3 rounded-xl border border-brand-border text-sm font-bold transition-all flex items-center justify-center gap-2",
                        options.language === 'bn' ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "bg-black/40 text-slate-400 hover:bg-black/60"
                      )}
                    >
                      {options.language === 'bn' && <Check size={16} />} {t.bn}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOptions(prev => ({ ...prev, language: 'hi' }))}
                      className={cn(
                        "py-3 rounded-xl border border-brand-border text-sm font-bold transition-all flex items-center justify-center gap-2",
                        options.language === 'hi' ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "bg-black/40 text-slate-400 hover:bg-black/60"
                      )}
                    >
                      {options.language === 'hi' && <Check size={16} />} {t.hi}
                    </motion.button>
                  </div>
                </div>
              )}

              {currentView === 'promptGen' && (
                <div className="space-y-4 pt-4">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-orange" /> {uiLang === 'en' ? 'Prompt Category' : 'প্রম্পট ক্যাটাগরি'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Video', 'Story', 'Image', 'Voice Over'].map((cat) => (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setOptions(prev => ({ ...prev, promptCategory: cat as any }))}
                        className={cn(
                          "py-3 rounded-xl border border-brand-border text-sm font-bold transition-all flex items-center justify-center gap-2",
                          options.promptCategory === cat ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "bg-black/40 text-slate-400 hover:bg-black/60"
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
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                      <Sparkles size={14} className="text-brand-orange" /> {t.trendingNow}
                    </label>
                    {loadingTrends && <Loader2 size={14} className="animate-spin text-brand-orange" />}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {loadingTrends ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                      ))
                    ) : (
                      trendingTopics.map((trend, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setTopics(prev => ({ ...prev, idea: trend.topic }));
                            toast.info(t.clickToUse);
                          }}
                          className="p-3 rounded-xl bg-black/20 border border-brand-border hover:border-brand-orange transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-1 bg-brand-orange/20 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap size={10} className="text-brand-orange" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-brand-orange transition-colors line-clamp-1">
                            {trend.topic}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
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
                    <LayoutDashboard size={16} className="text-slate-400" />
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t.popularCategories}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(showAllTopics ? POPULAR_TOPICS : POPULAR_TOPICS.slice(0, 6)).map((topic, idx) => (
                      <div key={idx} className="space-y-2">
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === idx ? null : idx);
                            setTopics(prev => ({ ...prev, home: uiLang === 'bn' ? topic.bn : topic.en }));
                            toast.info(t.clickToUse);
                          }}
                          className={cn(
                            "w-full flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all group",
                            selectedCategory === idx 
                              ? "bg-brand-orange/10 border-brand-orange/50 shadow-[0_0_20px_rgba(242,125,38,0.1)]" 
                              : "bg-[#1a1c23] border-white/5 hover:border-brand-orange/30"
                          )}
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                            {topic.icon}
                          </span>
                          <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
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
                                  whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.2)" }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setTopics(prev => ({ ...prev, home: `${topic.en} - ${sub}` }));
                                    toast.success(`${sub} ${t.clickToUse}`);
                                  }}
                                  className="py-2 px-3 rounded-lg bg-brand-orange/5 border border-brand-orange/20 text-[10px] font-bold text-brand-orange text-center"
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
                      className="px-8 py-2.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                    >
                      {showAllTopics ? t.showLess : t.showMore}
                      <span className={cn("transition-transform duration-300", showAllTopics ? "rotate-180" : "")}>
                        ↓
                      </span>
                    </motion.button>
                  </div>

                  {/* Unique Prompt Generator Section */}
                  <div className="space-y-6 pt-8 border-t border-white/5" id="prompt-generator-section">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-brand-orange" />
                        <h2 className="text-sm font-bold text-white tracking-wide">
                          {t.promptGen}
                        </h2>
                      </div>
                      <div className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">
                        {uiLang === 'en' ? 'AI Powered' : 'এআই চালিত'}
                      </div>
                    </div>

                    <div className="glass-card p-6 space-y-6 border-brand-orange/20 bg-brand-orange/5">
                      <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                          <Sparkles size={14} className="text-brand-orange" /> {uiLang === 'en' ? 'Prompt Category' : 'প্রম্পট ক্যাটাগরি'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['Video', 'Story', 'Image', 'Voice Over'].map((cat) => (
                            <motion.button
                              key={cat}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setOptions(prev => ({ ...prev, promptCategory: cat as any }))}
                              className={cn(
                                "py-2.5 rounded-xl border border-brand-border text-xs font-bold transition-all flex items-center justify-center gap-2",
                                options.promptCategory === cat ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "bg-black/40 text-slate-400 hover:bg-black/60"
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Visual Style</label>
                          <select value={formOptions.visualStyle} onChange={(e) => setFormOptions(prev => ({...prev, visualStyle: e.target.value}))} className="w-full bg-black/40 border border-brand-border rounded-xl p-2 text-sm text-slate-300">
                            {['Cinematic', 'Realistic', 'Anime', '3D Render', 'Sketch'].map(style => <option key={style} value={style}>{style}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Camera Angle</label>
                          <select value={formOptions.cameraAngle} onChange={(e) => setFormOptions(prev => ({...prev, cameraAngle: e.target.value}))} className="w-full bg-black/40 border border-brand-border rounded-xl p-2 text-sm text-slate-300">
                            {['Wide', 'Close-up', 'Medium', 'Bird\'s Eye', 'Low Angle'].map(angle => <option key={angle} value={angle}>{angle}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Mood</label>
                          <select value={formOptions.mood} onChange={(e) => setFormOptions(prev => ({...prev, mood: e.target.value}))} className="w-full bg-black/40 border border-brand-border rounded-xl p-2 text-sm text-slate-300">
                            {['Energetic', 'Calm', 'Dark', 'Inspiring', 'Mysterious'].map(mood => <option key={mood} value={mood}>{mood}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                          <FileText size={14} /> {uiLang === 'en' ? 'Topic for Prompt' : 'প্রম্পটের বিষয়'}
                        </label>
                        <textarea 
                          placeholder={uiLang === 'en' ? "Enter a topic to generate unique prompts (e.g. A futuristic city)" : "ইউনিক প্রম্পট তৈরি করতে একটি বিষয় লিখুন (যেমন: একটি ভবিষ্যতের শহর)"}
                          className="w-full input-field min-h-[100px] resize-none bg-black/40"
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
                  <div className="space-y-6 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xl">⏰</span>
                      <h2 className="text-sm font-bold text-white tracking-wide">
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
                          whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#1a1c23] border border-white/5 text-center"
                        >
                          <span className="text-2xl mb-1">{item.icon}</span>
                          <span className="text-sm font-black text-brand-orange tracking-tight">
                            {item.time}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                      <Languages size={14} /> {t.voiceLang}
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
                            "flex-1 py-2 rounded-xl border border-brand-border text-sm transition-all",
                            options.voiceLanguage === lang.id ? "bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.3)]" : "bg-black/20 text-slate-400"
                          )}
                        >
                          {lang.flag} {lang.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                      <Volume2 size={14} /> {t.selectVoice}
                    </label>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.femaleVoices}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Kore', label: 'Kore (Warm)', desc: 'Natural & Soft' },
                            { id: 'Zephyr', label: 'Zephyr (Pro)', desc: 'Clear & Crisp' }
                          ].map((v) => (
                            <motion.button
                              whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.05)" }}
                              whileTap={{ scale: 0.98 }}
                              key={v.id}
                              onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                              className={cn(
                                "p-3 rounded-xl border transition-all text-left flex flex-col gap-1",
                                options.voice === v.id ? "bg-brand-orange/10 border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.2)]" : "bg-black/20 border-brand-border text-slate-400"
                              )}
                            >
                              <span className={cn("text-sm font-bold", options.voice === v.id ? "text-brand-orange" : "text-slate-300")}>{v.label}</span>
                              <span className="text-[10px] opacity-60">{v.desc}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.maleVoices}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'Puck', label: 'Puck', desc: 'Friendly' },
                            { id: 'Charon', label: 'Charon', desc: 'Deep' },
                            { id: 'Fenrir', label: 'Fenrir', desc: 'Strong' }
                          ].map((v) => (
                            <motion.button
                              whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.05)" }}
                              whileTap={{ scale: 0.98 }}
                              key={v.id}
                              onClick={() => setOptions(prev => ({ ...prev, voice: v.id as any }))}
                              className={cn(
                                "p-3 rounded-xl border transition-all text-left flex flex-col gap-1",
                                options.voice === v.id ? "bg-brand-orange/10 border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.2)]" : "bg-black/20 border-brand-border text-slate-400"
                              )}
                            >
                              <span className={cn("text-sm font-bold", options.voice === v.id ? "text-brand-orange" : "text-slate-300")}>{v.label}</span>
                              <span className="text-[10px] opacity-60">{v.desc}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                      <Sparkles size={14} className="text-brand-orange" /> {t.voiceTone}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            "py-2 rounded-xl border border-brand-border text-xs transition-all",
                            options.voiceTone === tone.id ? "bg-brand-orange/20 text-brand-orange border-brand-orange" : "bg-black/20 text-slate-400"
                          )}
                        >
                          {tone.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                        <Globe size={14} className="text-brand-orange" /> {t.voiceAccent}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'US', label: t.accentUS },
                          { id: 'UK', label: t.accentUK },
                          { id: 'Indian', label: t.accentIndian },
                          { id: 'Australian', label: t.accentAustralian },
                        ].map((acc) => (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={acc.id}
                            onClick={() => setOptions(prev => ({ ...prev, voiceAccent: acc.id }))}
                            className={cn(
                              "py-2 rounded-xl border border-brand-border text-xs transition-all",
                              options.voiceAccent === acc.id ? "bg-brand-orange/20 text-brand-orange border-brand-orange" : "bg-black/20 text-slate-400"
                            )}
                          >
                            {acc.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                        <User size={14} className="text-brand-orange" /> {t.voiceAge}
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
                              "py-2 rounded-xl border border-brand-border text-xs transition-all",
                              options.voiceAge === age.id ? "bg-brand-orange/20 text-brand-orange border-brand-orange" : "bg-black/20 text-slate-400"
                            )}
                          >
                            {age.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(currentView === 'video' || currentView === 'image' || currentView === 'voiceExtractor') && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-brand-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-brand-card px-2 text-slate-500">
                        {currentView === 'video' ? (uiLang === 'en' ? "Upload Video" : "ভিডিও আপলোড করুন") : 
                         currentView === 'voiceExtractor' ? t.uploadAudio : t.uploadImage}
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-brand-orange/5",
                      currentSelectedMedia && "border-brand-orange bg-brand-orange/5"
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
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-brand-orange bg-black flex items-center justify-center">
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
                          className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:text-red-500 z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                          {currentView === 'video' ? <Video size={20} /> : 
                           currentView === 'voiceExtractor' ? <AudioLines size={20} /> : <Upload size={20} />}
                        </div>
                        <p className="text-xs text-slate-400">
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
            <section className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <LayoutTemplate size={24} className="text-brand-orange" /> {uiLang === 'en' ? 'Template Presets' : 'টেমপ্লেট প্রিসেট'}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-brand-orange/20 hover:border-brand-orange/50 transition-all text-sm text-slate-300 hover:text-white"
                  >
                    <template.icon size={16} className="text-brand-orange" />
                    {template.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Options Grid (Original for all views) */}
          {currentView !== 'video' && currentView !== 'idea' && currentView !== 'image' && currentView !== 'voice' && currentView !== 'voiceExtractor' && !currentSelectedMedia && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Sparkles size={24} className="text-brand-orange animate-pulse" /> {t.whatToCreate}
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-brand-orange font-bold bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">
                  AI Powered
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { id: 'generateImagePrompt', label: t.imagePromptLabel, desc: t.imagePromptDesc, icon: ImageIcon, color: "from-blue-500/20 to-cyan-500/20" },
                  { id: 'generateVideoPrompt', label: t.videoPromptLabel, desc: t.videoPromptDesc, icon: Video, color: "from-purple-500/20 to-pink-500/20" },
                  { id: 'generateThumbnail', label: t.thumbnailLabel, desc: t.thumbnailDesc, icon: Palette, color: "from-orange-500/20 to-red-500/20" },
                  { id: 'generateDescription', label: t.descLabel, desc: t.descriptionDesc, icon: FileText, color: "from-green-500/20 to-emerald-500/20" },
                  { id: 'generateTags', label: t.tagsLabel, desc: t.tagsDesc, icon: Tag, color: "from-yellow-500/20 to-orange-500/20" },
                  { id: 'generateScript', label: t.scriptLabel, desc: t.scriptDesc, icon: ScrollText, color: "from-indigo-500/20 to-blue-500/20" },
                  { id: 'generateSeoChecklist', label: t.seoChecklistLabel, desc: t.seoChecklistDesc, icon: CheckCircle2, color: "from-teal-500/20 to-cyan-500/20" },
                  { id: 'generateKeywords', label: t.keywordsLabel, desc: t.keywordsDesc, icon: Search, color: "from-rose-500/20 to-pink-500/20" },
                ].map((opt) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={opt.id}
                    onClick={() => setOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                    className={cn(
                      "relative group cursor-pointer rounded-xl p-3 transition-all duration-300 border overflow-hidden flex items-center gap-3",
                      options[opt.id as keyof typeof options] 
                        ? "bg-brand-orange/10 border-brand-orange shadow-sm" 
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all duration-300",
                      options[opt.id as keyof typeof options] ? "bg-brand-orange text-white" : "bg-white/10 text-slate-400 group-hover:text-white"
                    )}>
                      <opt.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-bold text-[11px] transition-colors truncate",
                        options[opt.id as keyof typeof options] ? "text-brand-orange" : "text-white"
                      )}>
                        {opt.label}
                      </h3>
                      <p className="text-[9px] text-slate-500 line-clamp-1">
                        {opt.desc}
                      </p>
                    </div>
                    {options[opt.id as keyof typeof options] && (
                      <div className="w-4 h-4 shrink-0 rounded-full bg-brand-orange flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                  <Languages size={14} /> {t.selectLanguage}
                </label>
                <div className="flex gap-2">
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
                        "flex-1 py-2 rounded-xl border border-brand-border text-sm transition-all",
                        options.language === lang.id ? "bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.3)]" : "bg-black/20 text-slate-400"
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
                <div className="space-y-6 pt-4 border-t border-brand-border">
                  {currentView === 'shorts' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                          <Clock size={14} /> {t.videoDuration}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[15, 30, 60].map((dur) => (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={dur}
                              onClick={() => setOptions(prev => ({ 
                                ...prev, 
                                videoDuration: dur,
                                scriptWordCount: Math.round((dur / 60) * 160)
                              }))}
                              className={cn(
                                "py-2 rounded-xl border border-brand-border text-sm transition-all",
                                options.videoDuration === dur ? "bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.3)]" : "bg-black/20 text-slate-400"
                              )}
                            >
                              {dur}s
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                            <Type size={14} /> {t.scriptCharacters}
                          </label>
                          <span className="text-brand-orange font-bold text-sm">
                            {options.scriptCharacterCount} {t.charLimit}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50"
                          value={options.scriptCharacterCount}
                          onChange={(e) => setOptions(prev => ({ ...prev, scriptCharacterCount: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange hover:accent-brand-orange/80 transition-all"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>100</span>
                          <span>2000</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {options.generateVideoPrompt && currentView !== 'shorts' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                          <Clock size={14} /> {t.videoDuration}
                        </label>
                        <span className="text-brand-orange font-bold text-sm">
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
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange hover:accent-brand-orange/80 transition-all"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>8s</span>
                        <span>20m</span>
                      </div>
                    </div>
                  )}

                  {options.generateScript && currentView !== 'shorts' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                          <Type size={14} /> {t.scriptWords}
                        </label>
                        <span className="text-brand-orange font-bold text-sm">
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
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange hover:accent-brand-orange/80 transition-all"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
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
            <section className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon size={20} className="text-brand-orange" /> {uiLang === 'en' ? "Aspect Ratio" : "অ্যাসপেক্ট রেশিও"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2', '21:9'].map((ratio) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={ratio}
                    onClick={() => setOptions(prev => ({ ...prev, aspectRatio: ratio as any }))}
                    className={cn(
                      "py-2 rounded-xl border border-brand-border text-sm transition-all",
                      options.aspectRatio === ratio ? "bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(242,125,38,0.3)]" : "bg-black/20 text-slate-400"
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
            className="w-full btn-primary py-4 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> {t.processing}
              </>
            ) : (
              <>
                <Zap size={20} /> {
                  currentView === 'video' ? t.genPrompt : 
                  currentView === 'idea' ? t.genIdea : 
                  currentView === 'image' ? t.genImage :
                  currentView === 'voice' ? t.genVoice :
                  currentView === 'voiceExtractor' ? t.genVoiceExtractor :
                  (currentView === 'promptGen' || (currentView === 'home' && topics.promptGen.trim())) ? (uiLang === 'en' ? "Generate Prompt" : "প্রম্পট তৈরি করুন") :
                  (uiLang === 'en' ? "Generate Content" : "কন্টেন্ট তৈরি করুন")
                }
              </>
            )}
          </motion.button>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 lg:sticky lg:top-32">
          <AnimatePresence mode="wait">
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8 min-h-[400px] md:min-h-[500px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-brand-orange" /> {t.outputPreview}
                </h2>
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
                    className="text-xs flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-brand-orange"
                  >
                    {copied === 'copy-all' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {t.copyAll}
                  </button>
                )}
              </div>

              {!currentResult && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="w-24 h-24 rounded-3xl bg-brand-orange/5 flex items-center justify-center text-brand-orange/20 animate-float">
                    <Sparkles size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-300">{t.readyToCreate}</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">{t.readySubtitle}</p>
                  </div>
                  
                  {/* Quick Suggestions Bento Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full pt-8">
                    {[
                      { label: t.viralScript, icon: ScrollText, view: 'video' },
                      { label: t.seoTags, icon: Tag, view: 'youtube' },
                      { label: t.thumbnail, icon: ImageIcon, view: 'image' },
                      { label: t.aiVideo, icon: Video, view: 'video' }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setCurrentView(item.view as any);
                          if (item.view === 'video') {
                            setOptions(prev => ({ ...prev, generateScript: true, generateVideoPrompt: true }));
                          }
                        }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-orange/30 hover:bg-white/10 transition-all flex flex-col items-center gap-3 group"
                      >
                        <item.icon size={20} className="text-slate-500 group-hover:text-brand-orange transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-2 border-dashed border-brand-orange/30"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-2 border-dashed border-brand-orange/20"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange glow-border"
                          >
                            <Sparkles size={32} />
                          </motion.div>
                          <motion.div 
                            className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-brand-orange animate-pulse">
                          {t.loadingSteps[loadingStep] || t.processing}
                        </span>
                        <span className="text-slate-500">{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className="h-full bg-linear-to-r from-brand-orange to-orange-600 shadow-[0_0_15px_rgba(242,125,38,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ type: "spring", stiffness: 50 }}
                        />
                      </div>
                      <div className="flex justify-center gap-1">
                        {t.loadingSteps.map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-500",
                              i <= loadingStep ? "bg-brand-orange scale-110 shadow-[0_0_8px_rgba(242,125,38,0.5)]" : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic animate-pulse text-center max-w-xs">
                      {uiLang === 'en' 
                        ? "Our AI is crafting your viral content using advanced algorithms..." 
                        : "আমাদের এআই উন্নত অ্যালগরিদম ব্যবহার করে আপনার ভাইরাল কন্টেন্ট তৈরি করছে..."}
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
                          className="py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-3"
                        >
                          <Download size={20} />
                          {uiLang === 'en' ? "PDF" : "পিডিএফ"}
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={shareContent}
                          className="py-4 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3"
                        >
                          <Share2 size={20} />
                          {uiLang === 'en' ? "Share" : "শেয়ার"}
                        </motion.button>
                      </div>
                    )}
                    {currentResult.imageUrl ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-brand-border group">
                          <img src={currentResult.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <a 
                              href={currentResult.imageUrl} 
                              download="generated-image.png"
                              className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white hover:scale-110 transition-transform"
                            >
                              <Download size={20} />
                            </a>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center italic">{t.generatedImage}</p>
                      </div>
                    ) : currentResult.audioUrl ? (
                      <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange animate-pulse">
                            <Volume2 size={40} />
                          </div>
                          <audio controls src={currentResult.audioUrl} className="w-full" />
                          <p className="text-[10px] text-slate-500 italic text-center max-w-xs">{t.voiceNote}</p>
                          <a 
                            href={currentResult.audioUrl} 
                            download="voice-over.wav"
                            className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(242,125,38,0.4)] transition-all"
                          >
                            <Download size={18} /> {t.downloadAudio}
                          </a>
                        </div>
                      </div>
                    ) : currentResult.prompts ? (
                      <div className="space-y-4">
                        {currentResult.prompts.map((prompt: string, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 group">
                            <div className="flex justify-between items-start">
                              <h3 className="text-brand-orange font-bold text-sm">Option {idx + 1}</h3>
                              <button 
                                onClick={() => copyToClipboard(prompt, `prompt-${idx}`)}
                                className="text-slate-500 hover:text-brand-orange transition-colors"
                              >
                                {copied === `prompt-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{prompt}</p>
                          </div>
                        ))}
                      </div>
                    ) : currentResult.ideas ? (
                      <div className="space-y-4">
                        {currentResult.ideas.map((idea: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 group">
                            <div className="flex justify-between items-start">
                              <h3 className="text-brand-orange font-bold text-sm">{idx + 1}. {idea.title}</h3>
                              <button 
                                onClick={() => copyToClipboard(`${idea.title}\n\n${idea.description}`, `idea-${idx}`)}
                                className="text-slate-500 hover:text-brand-orange transition-colors"
                              >
                                {copied === `idea-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
    Object.entries(currentResult).map(([key, value]) => {
      if (!value) return null;
      
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
            <div key={`subtitle-${langKey}`} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-brand-orange font-bold flex items-center gap-2">
                  <Languages size={12} /> {uiLang === 'en' ? `${langName} Subtitles` : `${langName} সাবটাইটেল`}
                </label>
                <div className="flex gap-2">
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
                    className="text-slate-500 hover:text-brand-orange transition-colors"
                    title="Download .srt"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(String(langValue), `subtitle-${langKey}`)}
                    className="text-slate-500 hover:text-brand-orange transition-colors"
                  >
                    {copied === `subtitle-${langKey}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-brand-border text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                {String(langValue)}
              </div>
            </div>
          );
        });
      }

      // Handle nested metadata object from video analysis
      if (key === 'metadata' && typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([mKey, mValue]) => {
          const mLabelMap: any = {
            title: { label: uiLang === 'en' ? "Suggested Title" : "প্রস্তাবিত শিরোনাম", icon: FileText },
            highCtrTitle: { label: t.highCtrTitle, icon: Zap },
            thumbnailTitle: { label: t.thumbnailTitle, icon: ImageIcon },
            description: { label: t.seoDescription, icon: FileText },
            tags: { label: t.tagsLabel, icon: Tag },
            hashtags: { label: t.hashtags, icon: Hash },
          };
          const mConfig = mLabelMap[mKey] || { label: mKey, icon: Sparkles };
          const displayValue = Array.isArray(mValue) ? mValue.join(', ') : String(mValue);
          
          return (
            <div key={`${key}-${mKey}`} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-brand-orange font-bold flex items-center gap-2">
                  <mConfig.icon size={12} /> {mConfig.label}
                </label>
                <button 
                  onClick={() => copyToClipboard(displayValue, `${key}-${mKey}`)}
                  className="text-slate-500 hover:text-brand-orange transition-colors"
                >
                  {copied === `${key}-${mKey}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-brand-border text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {displayValue}
              </div>
            </div>
          );
        });
      }

      // Handle sceneBreakdown array
      if (key === 'sceneBreakdown' && Array.isArray(value)) {
        return (
          <div key="scene-breakdown" className="space-y-6 mt-4">
            <div className="flex items-center gap-3 pb-2 border-b border-brand-border">
              <Film className="text-brand-orange" size={20} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200">
                {uiLang === 'en' ? "Scene-by-Scene Breakdown" : "সীন-বাই-সীন ব্রেকডাউন"}
              </h3>
            </div>
            <div className="space-y-4">
              {value.map((scene: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-brand-border space-y-4 hover:border-brand-orange/30 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange font-black text-xs">
                        {scene.scene || idx + 1}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Clock size={12} /> {scene.time || "0:00"}
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`Scene ${scene.scene}\nTime: ${scene.time}\nScript: ${scene.script}\nVisual: ${scene.visual}`, `scene-${idx}`)}
                      className="text-slate-500 hover:text-brand-orange transition-colors"
                    >
                      {copied === `scene-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-2">
                          <MessageSquare size={12} className="text-brand-orange" /> {uiLang === 'en' ? "Script / Voiceover" : "স্ক্রিপ্ট / ভয়েসওভার"}
                        </label>
                        <div className="flex items-center gap-2">
                          {sceneAudioUrls[`scene-${idx}`] ? (
                            <audio 
                              src={sceneAudioUrls[`scene-${idx}`]} 
                              controls 
                              className="h-6 w-32 custom-audio-mini"
                            />
                          ) : (
                            <button
                              onClick={() => handleSceneVoiceOver(idx, scene.script)}
                              disabled={loadingSceneAudio === `scene-${idx}`}
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-all flex items-center gap-1",
                                loadingSceneAudio === `scene-${idx}` && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {loadingSceneAudio === `scene-${idx}` ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Volume2 size={10} />
                              )}
                              {uiLang === 'en' ? "Gen Voice" : "ভয়েস তৈরি"}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {scene.script}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-2">
                        <Eye size={12} className="text-brand-orange" /> {uiLang === 'en' ? "Visual Prompt" : "ভিজ্যুয়াল প্রম্পট"}
                      </label>
                      <p className="text-xs text-slate-400 italic leading-relaxed bg-brand-orange/5 p-3 rounded-xl border border-brand-orange/10">
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
                          <div key={key} className="space-y-2 group">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase tracking-widest text-brand-orange font-bold flex items-center gap-2">
                                <config.icon size={12} /> {config.label}
                              </label>
                              <div className="flex gap-2">
                                {key === 'script' && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => shareScript('facebook', String(value))}
                                      className="text-slate-500 hover:text-[#1877F2] transition-colors"
                                      title="Share on Facebook"
                                    >
                                      <Facebook size={14} />
                                    </button>
                                    <button 
                                      onClick={() => shareScript('twitter', String(value))}
                                      className="text-slate-500 hover:text-[#1DA1F2] transition-colors"
                                      title="Share on Twitter"
                                    >
                                      <Twitter size={14} />
                                    </button>
                                    <button 
                                      onClick={() => shareScript('whatsapp', String(value))}
                                      className="text-slate-500 hover:text-[#25D366] transition-colors"
                                      title="Share on WhatsApp"
                                    >
                                      <MessageCircle size={14} />
                                    </button>
                                    <button 
                                      onClick={() => shareScript('native', String(value))}
                                      className="text-slate-500 hover:text-white transition-colors"
                                      title="Share"
                                    >
                                      <Share2 size={14} />
                                    </button>
                                    <button 
                                      onClick={downloadPdf}
                                      className="text-slate-500 hover:text-blue-400 transition-colors"
                                      title="Download PDF"
                                    >
                                      <Download size={14} />
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
                                  className="text-slate-500 hover:text-brand-orange transition-colors"
                                >
                                  {copied === key ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-black/40 border border-brand-border text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {key === 'keywords' && Array.isArray(value) ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-brand-border">
                                        <th className="py-2 px-3 text-[10px] uppercase text-slate-500 font-bold">Keyword</th>
                                        <th className="py-2 px-3 text-[10px] uppercase text-slate-500 font-bold">Volume</th>
                                        <th className="py-2 px-3 text-[10px] uppercase text-slate-500 font-bold">Competition</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {value.map((kw: any, i: number) => (
                                        <tr key={i} className="border-b border-brand-border/50 hover:bg-white/5 transition-colors">
                                          <td className="py-2 px-3 font-medium text-slate-200">{kw.keyword}</td>
                                          <td className="py-2 px-3">
                                            <span className={cn(
                                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                              kw.searchVolume === 'High' ? "bg-green-500/20 text-green-400" :
                                              kw.searchVolume === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                                              "bg-blue-500/20 text-blue-400"
                                            )}>
                                              {kw.searchVolume}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3">
                                            <span className={cn(
                                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                              kw.competition === 'Low' ? "bg-green-500/20 text-green-400" :
                                              kw.competition === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                                              "bg-red-500/20 text-red-400"
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
                                String(value)
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  {relatedIdeas.length > 0 && (
                    <div className="mt-8 p-6 rounded-2xl bg-black/20 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4">
                        {uiLang === 'en' ? "Related Video Ideas" : "সম্পর্কিত ভিডিও আইডিয়া"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedIdeas.map((idea, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setTopics(prev => ({ ...prev, [currentView]: idea.title }));
                              handleGenerate();
                            }}
                            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-brand-orange transition-all text-left"
                          >
                            <h4 className="text-sm font-bold text-slate-200">{idea.title}</h4>
                            <p className="text-xs text-slate-400 mt-1">{idea.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  </motion.div>
                )}
              </motion.div>
          </AnimatePresence>
        </div> {/* End of Right Column */}
      </div> {/* End of Main Content Grid */}

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
                    className="relative w-full max-w-lg glass-card p-5 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand-orange to-orange-600" />
                  
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-3">
                      <Globe size={28} className="text-brand-orange" /> {t.settings}
                    </h2>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="p-2 -mr-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black flex items-center gap-2">
                        <Palette size={14} className="text-brand-orange" /> {uiLang === 'en' ? "Appearance Theme" : "অ্যাপিয়ারেন্স থিম"}
                      </label>
                      <div className="grid grid-cols-3 gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5">
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
                              "relative py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex flex-col items-center gap-2 z-10",
                              theme === t.id ? "text-brand-orange" : "text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {theme === t.id && (
                              <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 bg-brand-orange/10 border border-brand-orange/20 rounded-xl -z-10 shadow-[0_0_15px_rgba(242,125,38,0.1)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <t.icon size={16} className={cn(
                              "transition-transform duration-300",
                              theme === t.id ? "scale-110" : "scale-100"
                            )} />
                            {t.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* AI Provider */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black flex items-center gap-2">
                        <Globe size={14} className="text-brand-orange" /> {uiLang === 'en' ? "AI Provider" : "AI প্রোভাইডার"}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {(['gemini', 'openai', 'groq', 'deepseek', 'perplexity', 'gemma'] as AIProvider[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setAiProvider(p)}
                            className={cn(
                              "py-3.5 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter transition-all border",
                              aiProvider === p 
                                ? "bg-brand-orange/20 border-brand-orange text-brand-orange shadow-[0_0_15_rgba(242,125,38,0.2)]" 
                                : "bg-white/5 border-brand-border text-slate-500 hover:bg-white/10"
                            )}
                          >
                            {p === 'groq' ? 'Groq' : p === 'perplexity' ? 'Perplex' : p === 'gemma' ? 'Gemma' : p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Model Info Card */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={aiProvider}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="p-5 rounded-2xl bg-black/40 border border-brand-border space-y-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-black text-brand-orange tracking-tight">{MODEL_INFO[aiProvider].name}</h3>
                          <span className="shrink-0 text-[10px] font-black px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 uppercase tracking-wider">
                            {MODEL_INFO[aiProvider].pricing}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {MODEL_INFO[aiProvider].description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-widest text-green-500 font-black flex items-center gap-2">
                              <CheckCircle2 size={12} /> Strengths
                            </span>
                            <ul className="text-[11px] text-slate-400 space-y-2">
                              {MODEL_INFO[aiProvider].strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                                  <span className="leading-tight">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-widest text-red-500 font-black flex items-center gap-2">
                              <X size={12} /> Weaknesses
                            </span>
                            <ul className="text-[11px] text-slate-400 space-y-2">
                              {MODEL_INFO[aiProvider].weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0" />
                                  <span className="leading-tight">{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                          <span className="text-[10px] uppercase tracking-widest text-brand-orange font-black">Best For</span>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-medium">
                            {MODEL_INFO[aiProvider].useCases.join(", ")}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* API Key Input */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black flex items-center gap-2">
                        <Zap size={14} className="text-brand-orange" /> {aiProvider.toUpperCase()} {t.apiKeyLabel}
                      </label>
                      <div className="relative group">
                        <input 
                          type="password" 
                          placeholder={`${aiProvider.toUpperCase()} API Key...`}
                          className="w-full input-field pr-12 py-4 text-sm font-medium"
                          value={
                            aiProvider === 'gemini' ? customGeminiKey : 
                            aiProvider === 'openai' ? customOpenaiKey : 
                            aiProvider === 'groq' ? customGroqKey :
                            aiProvider === 'deepseek' ? customDeepseekKey :
                            aiProvider === 'perplexity' ? customPerplexityKey :
                            customGemmaKey
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (aiProvider === 'gemini') setCustomGeminiKey(val);
                            else if (aiProvider === 'openai') setCustomOpenaiKey(val);
                            else if (aiProvider === 'groq') setCustomGroqKey(val);
                            else if (aiProvider === 'deepseek') setCustomDeepseekKey(val);
                            else if (aiProvider === 'perplexity') setCustomPerplexityKey(val);
                            else if (aiProvider === 'gemma') setCustomGemmaKey(val);
                          }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-orange transition-colors">
                          <Sparkles size={18} />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic leading-relaxed px-1">
                        {t.apiNote}
                      </p>
                    </div>

                    {/* API Status */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-brand-border flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.apiStatus}</span>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          (aiProvider === 'gemini' ? customGeminiKey : 
                           aiProvider === 'openai' ? customOpenaiKey : 
                           aiProvider === 'groq' ? customGroqKey :
                           aiProvider === 'deepseek' ? customDeepseekKey :
                           aiProvider === 'perplexity' ? customPerplexityKey :
                           customGemmaKey) ? "bg-green-500" : "bg-yellow-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          (aiProvider === 'gemini' ? customGeminiKey : 
                           aiProvider === 'openai' ? customOpenaiKey : 
                           aiProvider === 'groq' ? customGroqKey :
                           aiProvider === 'deepseek' ? customDeepseekKey :
                           aiProvider === 'perplexity' ? customPerplexityKey :
                           customGemmaKey) ? "text-green-400" : "text-yellow-400"
                        )}>
                          {(aiProvider === 'gemini' ? customGeminiKey : 
                            aiProvider === 'openai' ? customOpenaiKey : 
                            aiProvider === 'groq' ? customGroqKey :
                            aiProvider === 'deepseek' ? customDeepseekKey :
                            aiProvider === 'perplexity' ? customPerplexityKey :
                            customGemmaKey) ? t.connected : t.disconnected}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                      <button 
                        onClick={saveAIConfig}
                        className="w-full py-4.5 rounded-2xl bg-brand-orange text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(242,125,38,0.3)] hover:shadow-[0_15px_40px_rgba(242,125,38,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        <Check size={22} /> {t.save}
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full py-3.5 rounded-xl bg-white/5 border border-brand-border text-slate-400 font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={16} /> {uiLang === 'en' ? "Reset to Default" : "ডিফল্ট এ ফিরে যান"}
                        </button>

                        <button 
                          onClick={downloadHistory}
                          className="w-full py-3.5 rounded-xl bg-white/5 border border-brand-border text-slate-300 font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> {uiLang === 'en' ? "Export JSON" : "JSON এক্সপোর্ট"}
                        </button>
                      </div>

                      {deferredPrompt && (
                        <button 
                          onClick={installApp}
                          className="w-full py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                          <Download size={22} /> {uiLang === 'en' ? "Install as Android App" : "অ্যান্ড্রয়েড অ্যাপ হিসেবে ইনস্টল করুন"}
                        </button>
                      )}

                      <button 
                        onClick={clearHistory}
                        className="w-full py-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500/70 font-bold text-[11px] uppercase tracking-wider hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> {t.clearHistory}
                      </button>
                      
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="sm:hidden w-full py-3 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                      >
                        {uiLang === 'en' ? "Close Settings" : "সেটিংস বন্ধ করুন"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.main>

      <footer className="mt-12 text-center text-slate-600 text-xs pb-8 space-y-4">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-green-500/60 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            SYSTEM LIVE
          </div>
          <a 
            href={APP_CONFIG.githubRepo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Github size={14} />
            GitHub
          </a>
        </div>
        <p>© {new Date().getFullYear()} YouTube AI Creator Studio. All Rights Reserved.</p>
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
          background: rgba(242, 125, 38, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(242, 125, 38, 0.4);
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-6 h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-orange to-orange-600" />
              
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <select 
                      value={historyFilter} 
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="bg-black/40 text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 rounded-full border border-brand-border outline-none"
                    >
                      <option value="all">All</option>
                      <option value="idea">Idea Gen</option>
                      <option value="image">Image Gen</option>
                      <option value="voice">Voice Gen</option>
                      <option value="shorts">Shorts Gen</option>
                      <option value="youtube">YouTube AI</option>
                    </select>
                    <button 
                      onClick={() => setHistorySort(s => s === 'newest' ? 'oldest' : 'newest')}
                      className="bg-black/40 text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 rounded-full border border-brand-border"
                    >
                      {historySort === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                    <button 
                      onClick={downloadHistory} 
                      className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-orange transition-colors"
                      title="Download History"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={clearHistory} 
                      className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="Search keywords..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="bg-black/40 text-[10px] font-bold text-slate-400 px-3 py-1.5 rounded-full border border-brand-border outline-none flex-1"
                    />
                    <input type="date" onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-black/40 text-[10px] text-slate-400 px-2 py-1.5 rounded-full border border-brand-border" />
                    <input type="date" onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-black/40 text-[10px] text-slate-400 px-2 py-1.5 rounded-full border border-brand-border" />
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
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Clock size={64} className="mb-4 opacity-10" />
                    <p className="font-medium">{t.noHistory}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const targetView = item.type === 'youtube' ? 'home' : (item.type === 'image-to-prompt' ? 'image' : item.type as ViewType);
                          setCurrentView(targetView);
                          setResults(prev => ({ ...prev, [targetView]: item.result }));
                          setShowHistory(false);
                        }}
                        className="p-4 rounded-xl bg-white/5 border border-brand-border hover:border-brand-orange transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1.5">
                            {item.type === 'idea' && <Lightbulb size={14} className="text-yellow-500" />}
                            {item.type === 'image' && <ImageIcon size={14} className="text-blue-500" />}
                            {item.type === 'voice' && <Mic size={14} className="text-purple-500" />}
                            {item.type === 'voiceExtractor' && <AudioLines size={14} className="text-green-500" />}
                            {item.type === 'promptGen' && <Sparkles size={14} className="text-brand-orange" />}
                            {item.type === 'shorts' && <Zap size={14} className="text-brand-orange" />}
                            {item.type === 'image-to-prompt' && <Search size={14} className="text-cyan-500" />}
                            <span className="text-[10px] uppercase tracking-tighter text-brand-orange font-bold">
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
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                            <Clock size={10} />
                            {format(item.timestamp, 'MMM d, yyyy • HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-brand-orange transition-colors text-slate-300">
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-orange to-orange-600" />
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                  <MessageCircle size={24} className="text-brand-orange" /> {t.contact}
                </h2>
                <button 
                  onClick={() => setShowContact(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Have questions or feedback? We'd love to hear from you.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-brand-border">
                    <Globe size={18} className="text-brand-orange" />
                    <span className="text-sm text-slate-300">{APP_CONFIG.supportEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-brand-border">
                    <Facebook size={18} className="text-brand-orange" />
                    <span className="text-sm text-slate-300">{APP_CONFIG.facebookPage.replace('https://', '')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContact(false)}
                  className="w-full py-3 rounded-xl bg-brand-orange text-white font-bold text-sm shadow-[0_0_20px_rgba(242,125,38,0.3)] hover:shadow-[0_0_30px_rgba(242,125,38,0.5)] transition-all"
                >
                  Close
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
