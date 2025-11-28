import React from 'react';
import { BaronAction } from '../types';

interface BaronAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  action?: BaronAction;
}

export const BaronAvatar: React.FC<BaronAvatarProps> = ({ 
  size = 'sm', 
  className = '', 
  action = 'IDLE' 
}) => {
  // Dimensions map
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-40 h-40'
  };
  
  const dim = sizeMap[size];
  
  // Dynamic classes based on action
  const isMixing = action === 'MIXING';
  const isListening = action === 'LISTENING';
  const isThinking = action === 'THINKING';
  const isTalking = action === 'TALKING';

  const containerShakeClass = isMixing ? 'animate-shake' : '';

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      {/* Background with lighter gradient - Darker border for night mode */}
      <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-[#1a103c] to-black border-2 border-amber-600/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] ${dim} ${containerShakeClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Background Atmosphere */}
          <circle cx="50" cy="50" r="50" fill="#0f0f15" />
          
          {/* Ears Group - Animated when listening */}
          <g className={isListening ? 'animate-ear' : ''}>
             <path d="M20 38 L32 15 L50 38 Z" fill="#151515" /> {/* Left Ear */}
          </g>
          <path d="M80 38 L68 15 L50 38 Z" fill="#151515" /> {/* Right Ear */}
          
          {/* Head Shape */}
          <circle cx="50" cy="55" r="32" fill="#151515" />
          
          {/* Eyes Group - Blinks when idle or listening */}
          <g className={(!isMixing && !isThinking) ? 'animate-blink' : ''}>
            {/* Left Eye - Brighter Amber */}
            <ellipse cx="38" cy="50" rx="7" ry="9" fill="#f59e0b" />
            <circle cx="38" cy="50" r="2" fill="#201030">
               {isListening && <animate attributeName="cx" values="37;39;37" dur="2s" repeatCount="indefinite" />}
            </circle> 
            {/* Eye Shine */}
            <circle cx="40" cy="46" r="2" fill="#fff" opacity="0.8" />

            {/* Right Eye */}
            <ellipse cx="62" cy="50" rx="7" ry="9" fill="#f59e0b" />
            <circle cx="62" cy="50" r="2" fill="#201030">
               {isListening && <animate attributeName="cx" values="61;63;61" dur="2s" repeatCount="indefinite" />}
            </circle>
            {/* Eye Shine */}
            <circle cx="64" cy="46" r="2" fill="#fff" opacity="0.8" />
          </g>

          {/* Nose & Mouth */}
          <path d="M48 64 L52 64 L50 67 Z" fill="#f472b6" opacity="0.4" />
          
          {/* Mouth - Animates when talking */}
          <g transform={isTalking ? "translate(0, 1)" : ""}>
             <path d="M50 67 Q45 72 38 69" fill="none" stroke="#666" strokeWidth="1.5" />
             <path d="M50 67 Q55 72 62 69" fill="none" stroke="#666" strokeWidth="1.5" />
             {isTalking && <animate attributeName="stroke-width" values="1.5;2;1.5" dur="0.2s" repeatCount="indefinite" />}
          </g>
          
          {/* Bowtie - Warmer Red/Orange */}
          <path d="M40 88 L60 88 L50 98 Z" fill="#b91c1c" transform="rotate(-90 50 93) scale(0.65)" />
          <path d="M40 88 L60 88 L50 98 Z" fill="#b91c1c" transform="rotate(90 50 93) scale(0.65)" />
          <circle cx="50" cy="93" r="3.5" fill="#ef4444" />
          
          {/* Vest hint */}
          <path d="M18 100 Q50 92 82 100" fill="#1e1b4b" />

          {/* Mixing Overlay: A shaker that appears */}
          {isMixing && (
            <g transform="translate(60, 50) rotate(-15)">
              <rect x="0" y="0" width="20" height="30" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <path d="M0 0 L20 0 L15 -10 L5 -10 Z" fill="#64748b" stroke="#475569" strokeWidth="1" />
              <rect x="5" y="-14" width="10" height="4" rx="1" fill="#cbd5e1" />
              <animateTransform attributeName="transform" type="rotate" values="-15 10 15; 15 10 15; -15 10 15" dur="0.2s" repeatCount="indefinite" />
            </g>
          )}
        </svg>
      </div>
      
      {/* State Bubble/Indicator */}
      {isMixing && (
        <div className="absolute -top-2 -right-2 bg-amber-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow-lg animate-bounce font-bold border border-black">
          Mixing
        </div>
      )}
      {isThinking && (
        <div className="absolute -top-2 -right-2 bg-indigo-900 text-[10px] text-gray-200 px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20">
          ...
        </div>
      )}
    </div>
  );
};