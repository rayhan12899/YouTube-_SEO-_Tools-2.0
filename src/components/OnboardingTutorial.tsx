import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Youtube, 
  Lightbulb, 
  Zap, 
  Users, 
  Rocket,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import TypewriterText from './TypewriterText';

interface OnboardingTutorialProps {
  uiLang: 'en' | 'bn';
  onComplete: () => void;
}

const steps = [
  {
    icon: Rocket,
    title: { en: "Welcome to AI Creator Studio", bn: "এআই ক্রিয়েটর স্টুডিওতে স্বাগতম" },
    description: { 
      en: "Synthesize high-retention viral content for YouTube, TikTok, and more using advanced neural processing.", 
      bn: "অ্যাডভান্সড নিউরাল প্রসেসিং ব্যবহার করে ইউটিউব, টিকটক এবং আরও অনেক কিছুর জন্য হাই-রিটেনশন ভাইরাল কন্টেন্ট তৈরি করুন।" 
    },
    color: "text-hw-accent"
  },
  {
    icon: Youtube,
    title: { en: "Viral Toolset", bn: "ভাইরাল টুলসেট" },
    description: { 
      en: "From scripts and SEO to AI voiceovers and thumbnails - everything you need to dominate the algorithm.", 
      bn: "স্ক্রিপ্ট এবং এসইও থেকে শুরু করে এআই ভয়েসওভার এবং থাম্বনেইল - অ্যালগরিদম ডমিনেট করার জন্য আপনার যা কিছু প্রয়োজন।" 
    },
    color: "text-red-500"
  },
  {
    icon: Zap,
    title: { en: "Neural Generation", bn: "নিউরাল জেনারেশন" },
    description: { 
      en: "Input your topic and let our AI engine analyze trends to generate content optimized for maximum engagement.", 
      bn: "আপনার টপিক দিন এবং আমাদের এআই ইঞ্জিনকে ট্রেন্ড বিশ্লেষণ করে সর্বাধিক এনগেজমেন্টের জন্য অপ্টিমাইজড কন্টেন্ট তৈরি করতে দিন।" 
    },
    color: "text-yellow-400"
  },
  {
    icon: Users,
    title: { en: "Studio Collaboration", bn: "স্টুডিও কোলাবরেশন" },
    description: { 
      en: "Invite other creators to your studio room and collaborate on viral projects in real-time.", 
      bn: "অন্যান্য ক্রিয়েটরদের আপনার স্টুডিও রুমে আমন্ত্রণ জানান এবং রিয়েল-টাইমে ভাইরাল প্রজেক্টে সহযোগিতা করুন।" 
    },
    color: "text-blue-400"
  },
  {
    icon: Sparkles,
    title: { en: "Launch Your Vision", bn: "আপনার লক্ষ্য শুরু করুন" },
    description: { 
      en: "Ready to go viral? Start by entering your first topic in the Neural Input field.", 
      bn: "ভাইরাল হতে প্রস্তুত? নিউরাল ইনপুট ফিল্ডে আপনার প্রথম টপিক লিখে শুরু করুন।" 
    },
    color: "text-hw-accent"
  }
];

const OnboardingTutorial = memo(({ uiLang, onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('onboarding_complete');
    if (!hasSeenTutorial) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finish = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_complete', 'true');
    setTimeout(onComplete, 500);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={finish}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="hw-panel w-full max-w-lg relative overflow-hidden bg-black/60 border-hw-accent/20"
        >
          {/* Decorative Grid */}
          <div className="absolute inset-0 studio-grid-bg opacity-10 pointer-events-none" />
          
          {/* Header */}
          <div className="p-6 border-b border-hw-border flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-hw-accent/10 flex items-center justify-center border border-hw-accent/20">
                <Sparkles size={20} className="text-hw-accent animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="hw-label text-[10px]">{uiLang === 'en' ? "System Onboarding" : "সিস্টেম অনবোর্ডিং"}</span>
                <span className="text-white font-black">{uiLang === 'en' ? "Studio Protocol" : "স্টুডিও প্রোটোকল"}</span>
              </div>
            </div>
            <button 
              onClick={finish}
              className="w-8 h-8 rounded-full flex items-center justify-center text-hw-muted hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={cn("w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-hw-border", step.color)}
              >
                <Icon size={40} strokeWidth={1.5} />
              </motion.div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white leading-tight">
                  <TypewriterText text={step.title[uiLang]} speed={25} />
                </h2>
                <p className="text-hw-muted text-sm leading-relaxed max-w-sm mx-auto">
                  {step.description[uiLang]}
                </p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === currentStep ? "w-8 bg-hw-accent" : "w-2 bg-white/10"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-hw-border flex items-center justify-between bg-black/20 relative z-10">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-hw-muted hover:text-white disabled:opacity-0 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <ChevronLeft size={16} />
              {uiLang === 'en' ? "Back" : "পিছনে"}
            </button>
            
            <button
              onClick={handleNext}
              className="hw-btn-industrial !px-6 !py-2.5 bg-hw-accent/10 border-hw-accent/20 group"
            >
              <span className="text-hw-accent group-hover:text-white font-bold text-xs uppercase tracking-widest">
                {currentStep === steps.length - 1 
                  ? (uiLang === 'en' ? "Get Started" : "শুরু করুন") 
                  : (uiLang === 'en' ? "Next" : "পরবর্তী")}
              </span>
              <ChevronRight size={16} className="text-hw-accent group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

OnboardingTutorial.displayName = 'OnboardingTutorial';

export default OnboardingTutorial;
