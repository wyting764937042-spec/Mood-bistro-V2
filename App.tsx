import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatWithBaron, mixCocktailForMood } from './services/geminiService';
import { AppState, ChatMessage, Cocktail, BaronAction } from './types';
import { BaronAvatar } from './components/BaronAvatar';
import { CocktailCard } from './components/CocktailCard';
import { WhisperCard } from './components/WhisperCard';

// Separated narration and dialog
const INITIAL_NARRATION = "夜色温柔，风铃轻响。我是 Baron，你今夜的听众。";
const INITIAL_GREETING = "欢迎来到情绪小酒馆... 喵。今晚想喝点什么，或者聊聊你的心情？";

// Royalty-free Jazz track - Slower, smoother, more atmospheric
const JAZZ_TRACK_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3"; 

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [baronAction, setBaronAction] = useState<BaronAction>('IDLE');
  const [narration, setNarration] = useState<string>(""); 
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, baronAction, narration]);

  // Audio initialization
  useEffect(() => {
    // Initialize audio object once
    const audio = new Audio(JAZZ_TRACK_URL);
    audio.loop = true;
    audio.volume = 0.3; // Lower volume for background ambience
    audio.preload = 'auto';
    audioRef.current = audio;
    
    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }
  }, []);

  const playMusic = () => {
    if (audioRef.current) {
        // Explicit user interaction required to play audio
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsMusicPlaying(true);
            }).catch(error => {
                console.log("Audio play failed (browser policy):", error);
                setIsMusicPlaying(false);
            });
        }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
        if (isMusicPlaying) {
            audioRef.current.pause();
            setIsMusicPlaying(false);
        } else {
            playMusic();
        }
    }
  };

  const startExperience = () => {
    // PLAY MUSIC IMMEDIATELY ON CLICK
    playMusic();
    
    setAppState(AppState.CHATTING);
    setNarration(INITIAL_NARRATION);
    
    setTimeout(() => {
      setMessages([
        {
          id: uuidv4(),
          role: 'model',
          content: INITIAL_GREETING,
          timestamp: Date.now(),
        },
      ]);
    }, 1000);
  };

  const handleInputFocus = () => {
    if (baronAction === 'IDLE') setBaronAction('LISTENING');
  };

  const handleInputBlur = () => {
    if (baronAction === 'LISTENING') setBaronAction('IDLE');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || baronAction === 'THINKING' || baronAction === 'MIXING') return;

    // Ensure music is playing if it stopped
    if (audioRef.current && audioRef.current.paused && isMusicPlaying) {
        playMusic();
    }

    const userContent = input;
    setInput('');
    setBaronAction('THINKING');
    setNarration("Baron 正在倾听...");

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userContent }] });

      const replyText = await chatWithBaron(userContent, history);
      
      setBaronAction('TALKING');
      setNarration("Baron 轻声回应...");
      
      const replyMsg: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: replyText || "...",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, replyMsg]);

      setTimeout(async () => {
        const shouldMix = true;

        if (shouldMix) {
           setBaronAction('MIXING');
           setNarration("Baron 拿起雪克壶，冰块撞击声在夜色中格外清脆...");
           
           const cocktail = await mixCocktailForMood(userContent);
           
           setTimeout(() => {
             setBaronAction('SERVING');
             setNarration("一杯特调沿着吧台滑到你面前，酒液在灯光下分层流转...");
             
             if (cocktail) {
                const cocktailMsg: ChatMessage = {
                  id: uuidv4(),
                  role: 'model',
                  content: '', 
                  isCocktail: true,
                  cocktailData: cocktail,
                  timestamp: Date.now(),
                };
                setMessages(prev => [...prev, cocktailMsg]);
             }
             
             setTimeout(() => {
               setBaronAction('IDLE');
               setNarration("Baron 擦拭着酒杯，静静地等待你品尝。");
             }, 5000);

           }, 3000); 
        } else {
           setBaronAction('IDLE');
           setNarration("");
        }
      }, 2000);

    } catch (e) {
      console.error(e);
      setBaronAction('IDLE');
      setNarration("");
    }
  };

  const handleCocktailReveal = (cocktail: Cocktail) => {
      setNarration("随着酒液入口，一张黑金色的卡片浮现在眼前...");
      
      setTimeout(() => {
        const whisperMsg: ChatMessage = {
            id: uuidv4(),
            role: 'model',
            content: '',
            isWhisper: true,
            cocktailData: cocktail,
            timestamp: Date.now()
        };
        setMessages(prev => {
            if (prev.some(m => m.isWhisper && m.cocktailData?.name === cocktail.name)) return prev;
            return [...prev, whisperMsg];
        });
      }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Views ---

  if (appState === AppState.INTRO) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent text-white">
        {/* Subtle dark ambience */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-0"></div>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 text-center space-y-8 max-w-lg animate-fade-in relative">
          <BaronAvatar size="lg" className="mx-auto shadow-2xl shadow-black/50 mb-8" />
          
          <div>
            <h1 className="font-display text-5xl md:text-6xl mb-2 text-white/90 drop-shadow-lg tracking-wide">
              情绪小酒馆
            </h1>
            <p className="text-amber-500/80 tracking-[0.4em] text-sm uppercase font-serif font-bold">Mood Bistro</p>
          </div>

          <p className="text-gray-400 font-serif leading-relaxed italic text-lg">
            "在这里，每一杯酒都是一种心情。<br/>夜深了，进来坐坐吗？喵。"
          </p>

          <button 
            onClick={startExperience}
            className="group relative px-10 py-4 bg-white/5 overflow-hidden rounded-full transition-all duration-500 hover:bg-white/10 border border-white/20 hover:border-amber-500/50 shadow-lg mt-8"
          >
            <span className="relative z-10 text-gray-300 font-serif tracking-[0.2em] text-sm font-bold group-hover:text-amber-100 transition-colors">
              推开门 (PUSH DOOR)
            </span>
            <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-500 group-hover:scale-100 group-hover:bg-amber-900/20"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-transparent relative">
      
      {/* Music Control */}
      <button 
        onClick={toggleMusic}
        className={`absolute top-4 right-4 z-50 p-2 rounded-full border transition-all duration-300 backdrop-blur-md shadow-lg ${isMusicPlaying ? 'border-amber-700/50 text-amber-500 bg-black/40' : 'border-white/10 text-gray-600 hover:text-gray-300 bg-black/20'}`}
        title={isMusicPlaying ? "Pause Jazz" : "Play Jazz"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isMusicPlaying ? 'animate-spin-slow' : ''}`}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-2.53-2.093 1.803 1.803 0 012.53 2.093v-6.31h-7V16.82a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-2.53-2.093 1.803 1.803 0 012.53 2.093V5.625a1.5 1.5 0 011.5-1.5h10.5a1.5 1.5 0 011.5 1.5v6.553z" />
        </svg>
      </button>

      {/* 1. The Stage (Bar Counter Area) */}
      <div className="flex-shrink-0 bg-gradient-to-b from-black/80 to-transparent pt-8 pb-4 px-6 relative z-10">
        <div className="flex flex-col items-center justify-center">
           {/* Spotlight Effect - Darker */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-900/10 blur-[50px] rounded-full pointer-events-none"></div>
           
           <BaronAvatar 
             size="md" 
             action={baronAction} 
             className="z-10 transition-all duration-500 mb-4" 
           />
           
           {/* Narrative Area */}
           <div className="min-h-[2.5rem] max-w-lg text-center px-4">
              {narration ? (
                 <p className="text-gray-400 font-serif italic text-sm leading-relaxed animate-fade-in tracking-wide drop-shadow-sm">
                   {narration}
                 </p>
              ) : (
                <div className="h-4"></div>
              )}
           </div>

        </div>
      </div>

      {/* 2. Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            
            <div className={`max-w-[90%] md:max-w-[80%] ${msg.isCocktail || msg.isWhisper ? 'w-full max-w-md' : ''}`}>
              {msg.isCocktail && msg.cocktailData ? (
                <CocktailCard 
                    data={msg.cocktailData} 
                    onReveal={() => handleCocktailReveal(msg.cocktailData!)}
                />
              ) : msg.isWhisper && msg.cocktailData ? (
                <WhisperCard 
                  text={msg.cocktailData.whisper} 
                  cocktailData={msg.cocktailData}
                />
              ) : (
                <div 
                  className={`
                    px-5 py-4 rounded-2xl text-sm leading-relaxed font-serif shadow-lg relative backdrop-blur-md
                    ${msg.role === 'user' 
                      ? 'bg-amber-900/30 border border-amber-700/30 text-gray-100 rounded-br-sm' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'}
                  `}
                >
                  {/* Decorative quote mark for model */}
                  {msg.role === 'model' && (
                    <span className="absolute -top-2 -left-2 text-4xl text-white/10 font-display">“</span>
                  )}
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {baronAction === 'THINKING' && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
               <div className="flex space-x-1">
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* 3. Input Area */}
      <footer className="p-4 bg-gradient-to-t from-black/90 to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={baronAction === 'MIXING' || baronAction === 'THINKING' || baronAction === 'SERVING'}
            placeholder={baronAction === 'MIXING' ? "Baron 正在为你调酒..." : "说说你的心情..."}
            className="w-full bg-black/40 text-gray-200 placeholder-gray-600 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-amber-500/30 border border-white/10 shadow-lg backdrop-blur-md transition-all font-serif disabled:opacity-50 disabled:cursor-wait"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || baronAction === 'MIXING' || baronAction === 'THINKING'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-3 font-serif opacity-70">Mood Bistro © 2024</p>
      </footer>
    </div>
  );
};

export default App;