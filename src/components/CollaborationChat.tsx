import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageSquare as ChatIcon, Send as SendIcon, Users as UsersIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface CollaborationChatProps {
  messages: { user: string; text: string; time: string }[];
  onSendMessage: (text: string) => void;
  roomId: string;
  setRoomId: (id: string) => void;
  onJoin: () => void;
  isJoined: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const CollaborationChat = memo(({ 
  messages, 
  onSendMessage, 
  roomId, 
  setRoomId,
  onJoin,
  isJoined,
  isOpen,
  onToggle
}: CollaborationChatProps) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  }, [inputText, onSendMessage]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[100] transition-all duration-300",
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
        <div className="hw-panel w-full h-full flex flex-col bg-black/80 backdrop-blur-md">
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
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button 
                onClick={onJoin}
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
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                />
                <button 
                  onClick={handleSend}
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
});

CollaborationChat.displayName = 'CollaborationChat';

export default CollaborationChat;
