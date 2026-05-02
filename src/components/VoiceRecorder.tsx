import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Check, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, url: string) => void;
  uiLang: 'en' | 'bn';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, uiLang }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = {
    en: {
      start: "Start Recording",
      stop: "Stop",
      discard: "Discard",
      use: "Use Real Voice",
      recording: "Recording...",
      preview: "Preview Recording"
    },
    bn: {
      start: "রেকর্ডিং শুরু করুন",
      stop: "থামান",
      discard: "বাতিল করুন",
      use: "রিয়েল ভয়েস ব্যবহার করুন",
      recording: "রেকর্ড হচ্ছে...",
      preview: "রেকর্ডিং প্রিভিউ"
    }
  }[uiLang];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(uiLang === 'en' ? "Could not access microphone." : "মাইক্রোফোন অ্যাক্সেস করা যায়নি।");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const handleUseVoice = () => {
    if (audioChunksRef.current.length > 0 && audioUrl) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      onRecordingComplete(audioBlob, audioUrl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hw-panel p-6 flex flex-col items-center justify-center space-y-6 bg-black/40 border-hw-accent/20">
      <AnimatePresence mode="wait">
        {!audioUrl ? (
          <motion.div 
            key="recording-ui"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-4"
          >
            {isRecording ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      <Square size={20} className="text-white fill-white" />
                    </div>
                  </motion.div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-red-500 font-bold border border-red-500/30">
                    LIVE
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="hw-display text-4xl mb-1 tracking-widest">{formatTime(recordingTime)}</div>
                  <p className="text-hw-muted text-xs animate-pulse">{t.recording}</p>
                </div>

                <button 
                  onClick={stopRecording}
                  className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-hw-muted transition-colors flex items-center gap-2"
                >
                  <Square size={16} /> {t.stop}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-hw-accent/10 border-2 border-hw-accent/30 flex items-center justify-center">
                  <Mic size={32} className="text-hw-accent" />
                </div>
                
                <div className="text-center max-w-xs">
                  <h3 className="text-lg font-bold text-white mb-2">{uiLang === 'en' ? "Record Your Voice" : "আপনার কণ্ঠ রেকর্ড করুন"}</h3>
                  <p className="text-hw-muted text-xs">
                    {uiLang === 'en' ? "Use your biological voice for 100% real human content and better audience connection." : "১০০% রিয়েল হিউম্যান কন্টেন্ট এবং দর্শকদের সাথে আরও ভালো সংযোগের জন্য আপনার নিজের কণ্ঠ ব্যবহার করুন।"}
                  </p>
                </div>

                <button 
                  onClick={startRecording}
                  className="px-10 py-4 bg-hw-accent text-white font-bold rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-transform flex items-center gap-3"
                >
                  <Mic size={20} /> {t.start}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="preview-ui"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-6 w-full"
          >
            <div className="w-full hw-panel p-4 bg-white/5 border-white/10 flex items-center gap-4">
              <button 
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full bg-hw-accent flex items-center justify-center text-white"
              >
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
              </button>
              
              <div className="flex-1">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-hw-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: isPlaying ? "100%" : "0%" }}
                    transition={{ duration: recordingTime, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-hw-accent font-bold uppercase tracking-wider">{t.preview}</span>
                  <span className="text-[10px] text-hw-muted font-mono">{formatTime(recordingTime)}</span>
                </div>
              </div>

              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-4 w-full">
              <button 
                onClick={discardRecording}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 text-hw-muted hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-xl border border-white/10"
              >
                <Trash2 size={16} /> {t.discard}
              </button>
              
              <button 
                onClick={handleUseVoice}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-hw-accent text-white font-bold hover:opacity-90 transition-opacity rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                <Check size={16} /> {t.use}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
