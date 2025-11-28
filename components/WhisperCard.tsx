import React, { useState } from 'react';
import { BaronAvatar } from './BaronAvatar';
import { Cocktail } from '../types';

interface WhisperCardProps {
  text: string;
  cocktailData?: Cocktail; 
}

export const WhisperCard: React.FC<WhisperCardProps> = ({ text, cocktailData }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Use imageKeyword from cocktail data or fallback to 'jazz'
  const imageKeyword = cocktailData?.imageKeyword || 'abstract_art';
  const bgImage = `https://image.pollinations.ai/prompt/${imageKeyword}%20mysterious%20cinematic%20atmospheric%20dark?width=300&height=450&nologo=true`;

  return (
    <div className="w-full flex justify-center my-8 animate-fade-in perspective-1000" style={{ animationDuration: '1.5s' }}>
      
      {/* 3D Card Container */}
      <div 
        onClick={handleFlip}
        className={`relative w-64 h-96 group cursor-pointer transition-transform duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        
        {/* --- FRONT SIDE (Design) --- */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#1a1a1a] border border-amber-900/40">
            {/* Pattern/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            
            {/* Center Content */}
            <div className="flex flex-col items-center justify-center h-full relative z-10 border-[12px] border-[#111] m-2">
                <div className="border border-amber-600/30 w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 mb-4 opacity-80">
                         <BaronAvatar size="md" className="scale-75 shadow-none border-none grayscale opacity-60" />
                    </div>
                    <div className="h-px w-12 bg-amber-700/50 mb-2"></div>
                    <h3 className="text-xs tracking-[0.4em] text-amber-600 font-bold uppercase font-serif text-center">
                        Mood<br/>Bistro
                    </h3>
                    <div className="h-px w-12 bg-amber-700/50 mt-2"></div>
                    <p className="mt-8 text-[9px] text-gray-600 uppercase tracking-widest animate-pulse">Tap to Reveal</p>
                </div>
            </div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-700/40"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-700/40"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-700/40"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-700/40"></div>
        </div>

        {/* --- BACK SIDE (Image + Text) --- */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black">
            
            {/* Background Image */}
            <div className="absolute inset-0">
               <img src={bgImage} alt="Mood Atmosphere" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4">
                  <span className="text-[10px] text-amber-400/80 uppercase tracking-widest border-b border-amber-400/30 pb-1">Baron's Whisper</span>
                </div>
                
                <p className="font-serif text-sm leading-7 text-gray-100 italic drop-shadow-md font-medium">
                   “{text}”
                </p>

                <div className="mt-6 flex justify-center items-center opacity-60">
                    <div className="w-1 h-1 bg-amber-500 rotate-45 mx-1"></div>
                    <div className="w-1 h-1 bg-amber-500 rotate-45 mx-1"></div>
                    <div className="w-1 h-1 bg-amber-500 rotate-45 mx-1"></div>
                </div>
            </div>

            {/* Golden Frame Border */}
            <div className="absolute inset-3 border border-amber-200/20 rounded-lg pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
};