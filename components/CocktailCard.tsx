import React, { useState } from 'react';
import { Cocktail, VisualStructure } from '../types';

interface CocktailCardProps {
  data: Cocktail;
  onReveal?: () => void;
}

// Internal component to draw the glass based on structured data
const CocktailVisual: React.FC<{ visual: VisualStructure; scale?: number }> = ({ visual, scale = 1 }) => {
  const { glassType, garnish, ice, colorHex } = visual;
  const liquidColor = colorHex || '#ea580c';

  // --- Glass Path Definitions ---
  // ViewBox is 0 0 100 120
  
  let glassPath = "";
  let liquidPath = "";
  let rimCx = 50;
  let rimCy = 20;
  let rimRx = 30;
  let rimRy = 5; // Default ellipses details
  let stemPath = "";
  let basePath = "";

  // Define paths based on glass type
  switch (glassType) {
    case 'rocks': // Old Fashioned
      glassPath = "M25 25 L28 95 Q28 100 50 100 Q72 100 72 95 L75 25";
      liquidPath = "M27 45 L28 92 Q28 96 50 96 Q72 96 72 92 L73 45"; // Liquid level
      rimCy = 25;
      rimRx = 25;
      rimRy = 5;
      break;
    case 'highball': // Tall glass
      glassPath = "M30 15 L32 95 Q32 100 50 100 Q68 100 68 95 L70 15";
      liquidPath = "M31 30 L32 92 Q32 96 50 96 Q68 96 68 92 L69 30";
      rimCy = 15;
      rimRx = 20;
      rimRy = 4;
      break;
    case 'martini': // V-shape
      glassPath = "M15 20 L50 60 L85 20";
      liquidPath = "M25 32 L50 60 L75 32"; // Filled partially
      stemPath = "M50 60 L50 95";
      basePath = "M30 100 L70 100";
      rimCy = 20;
      rimRx = 35;
      rimRy = 6;
      break;
    case 'coupe': // Rounded wide
      glassPath = "M20 20 Q20 60 50 60 Q80 60 80 20";
      liquidPath = "M25 25 Q25 55 50 55 Q75 55 75 25";
      stemPath = "M50 60 L50 95";
      basePath = "M30 100 L70 100";
      rimCy = 20;
      rimRx = 30;
      rimRy = 6;
      break;
    case 'flute': // Champagne
      glassPath = "M35 15 Q30 70 50 70 Q70 70 65 15";
      liquidPath = "M37 25 Q35 65 50 65 Q65 65 63 25";
      stemPath = "M50 70 L50 95";
      basePath = "M35 100 L65 100";
      rimCy = 15;
      rimRx = 15;
      rimRy = 3;
      break;
    default: // Fallback to Rocks
      glassPath = "M25 25 L28 95 Q28 100 50 100 Q72 100 72 95 L75 25";
      liquidPath = "M27 45 L28 92 Q28 96 50 96 Q72 96 72 92 L73 45";
      rimCy = 25;
      rimRx = 25;
      rimRy = 5;
  }

  // --- Rendering Helpers ---

  const renderIce = () => {
    if (ice === 'none') return null;
    if (glassType === 'martini' || glassType === 'coupe' || glassType === 'flute') return null; // Usually no ice in these unless specified, but visual structure rules. Assuming logic follows glass.
    
    // Ice positioning is generally in the liquid
    if (ice === 'sphere') {
      return (
         <circle cx="50" cy="70" r="14" fill="url(#iceGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" className="animate-float-ice" />
      );
    } else if (ice === 'cubes') {
      return (
        <g className="animate-float-ice">
           <rect x="35" y="60" width="12" height="12" rx="1" fill="url(#iceGradient)" stroke="rgba(255,255,255,0.3)" transform="rotate(10 41 66)" />
           <rect x="52" y="75" width="14" height="14" rx="1" fill="url(#iceGradient)" stroke="rgba(255,255,255,0.3)" transform="rotate(-15 59 82)" />
           <rect x="45" y="50" width="10" height="10" rx="1" fill="url(#iceGradient)" stroke="rgba(255,255,255,0.3)" transform="rotate(5 50 55)" />
        </g>
      );
    } else if (ice === 'crushed') {
      return (
        <g opacity="0.7">
           <polygon points="35,60 40,55 45,62" fill="white" opacity="0.4" />
           <polygon points="50,70 55,65 60,72" fill="white" opacity="0.4" />
           <polygon points="45,80 40,85 55,85" fill="white" opacity="0.4" />
           <polygon points="60,60 65,55 70,60" fill="white" opacity="0.4" />
        </g>
      );
    }
  };

  const renderGarnish = () => {
     if (garnish === 'none') return null;
     
     // Position depends on rim
     const gx = rimCx + rimRx - 5; 
     const gy = rimCy;

     switch (garnish) {
       case 'orange_peel':
         // A twist path
         return (
            <path d={`M${gx-5} ${gy-5} Q${gx+10} ${gy-5} ${gx+5} ${gy+5} Q${gx} ${gy+15} ${gx-5} ${gy+10}`} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" className="drop-shadow-md" />
         );
       case 'cherry':
         return (
            <g>
              <path d={`M${gx} ${gy+5} Q${gx+5} ${gy-10} ${gx+10} ${gy-15}`} stroke="#3f2c2c" strokeWidth="1" fill="none" />
              <circle cx={gx} cy={gy+5} r="5" fill="#9f1239" className="drop-shadow-md" />
              <circle cx={gx-1} cy={gy+3} r="1.5" fill="white" opacity="0.4" />
            </g>
         );
       case 'mint':
         return (
            <g transform={`translate(${gx-10}, ${gy-10})`}>
               <path d="M10 10 Q5 0 0 5 Q5 15 10 10 Z" fill="#22c55e" stroke="#14532d" strokeWidth="0.5" />
               <path d="M10 10 Q15 0 20 5 Q15 15 10 10 Z" fill="#22c55e" stroke="#14532d" strokeWidth="0.5" />
               <path d="M10 10 Q10 -5 10 5" stroke="#14532d" strokeWidth="1" />
            </g>
         );
       case 'lemon_slice':
          return (
             <g transform={`translate(${rimCx-rimRx}, ${rimCy-5}) rotate(-20)`}>
                <circle cx="0" cy="0" r="10" fill="#fef08a" stroke="#fde047" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="10" stroke="#fde047" strokeWidth="1" />
                <line x1="0" y1="0" x2="8" y2="-6" stroke="#fde047" strokeWidth="1" />
                <line x1="0" y1="0" x2="-8" y2="-6" stroke="#fde047" strokeWidth="1" />
                {/* Cutout for rim */}
                <path d="M0 0 L10 10 L-10 10 Z" fill="rgba(0,0,0,0.5)" opacity="0.1" /> 
             </g>
          );
       case 'olive':
          return (
             <g>
                 <line x1={rimCx-10} y1={rimCy-5} x2={rimCx+20} y2={rimCy-15} stroke="#a3a3a3" strokeWidth="1" />
                 <ellipse cx={rimCx} cy={rimCy-8} rx="4" ry="5" fill="#65a30d" transform="rotate(15)" />
                 <circle cx={rimCx+1} cy={rimCy-9} r="1" fill="#bef264" opacity="0.6" />
             </g>
          );
       case 'flower':
          return (
             <g transform={`translate(${gx-5}, ${gy})`}>
                <circle cx="0" cy="-5" r="3" fill="#f472b6" />
                <circle cx="5" cy="0" r="3" fill="#f472b6" />
                <circle cx="0" cy="5" r="3" fill="#f472b6" />
                <circle cx="-5" cy="0" r="3" fill="#f472b6" />
                <circle cx="0" cy="0" r="2" fill="#fef08a" />
             </g>
          );
       default: return null;
     }
  };


  return (
    <div className="relative flex items-end justify-center group transition-transform duration-700" style={{ width: `${10 * scale}rem`, height: `${12 * scale}rem` }}>
        {/* Glow behind */}
        <div className="absolute inset-0 bg-gradient-to-t from-current to-transparent opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-1000" style={{ color: liquidColor }}></div>
        
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
           {[...Array(6)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
               style={{
                 left: `${20 + Math.random() * 60}%`,
                 top: `${40 + Math.random() * 40}%`,
                 animationDelay: `${Math.random() * 3}s`,
                 boxShadow: `0 0 4px ${liquidColor}`
               }}
             />
           ))}
        </div>

        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl z-10 filter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-500">
            <defs>
                <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={liquidColor} stopOpacity="0.7" />
                    <stop offset="50%" stopColor={liquidColor} stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
                </linearGradient>
                <radialGradient id="iceGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.3" />
                </radialGradient>
            </defs>

            {/* Stem & Base (if any) */}
            {stemPath && <path d={stemPath} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />}
            {basePath && <path d={basePath} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />}

            {/* Liquid */}
            <path d={liquidPath} fill="url(#liquidGradient)" />

            {/* Ice Layers (Behind/Inside liquid) */}
            {renderIce()}

            {/* Glass Outline */}
            <path d={glassPath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            
            {/* Rim */}
            <ellipse cx={rimCx} cy={rimCy} rx={rimRx} ry={rimRy} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            
            {/* Liquid Surface */}
            <ellipse cx={rimCx} cy={glassType === 'martini' || glassType === 'coupe' ? rimCy + 10 : (glassType === 'highball' ? 30 : 45)} rx={rimRx * (glassType === 'martini' ? 0.7 : 0.9)} ry={rimRy} fill={liquidColor} fillOpacity="0.3" />

            {/* Garnish (On top/Rim) */}
            {renderGarnish()}

            {/* Bubbles */}
            <circle cx={rimCx - 5} cy={60} r="1" fill="white" opacity="0.6">
                <animate attributeName="cy" values="60;40" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={rimCx + 5} cy={70} r="1.5" fill="white" opacity="0.5">
                <animate attributeName="cy" values="70;45" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="3s" repeatCount="indefinite" />
            </circle>
        </svg>
    </div>
  );
};

export const CocktailCard: React.FC<CocktailCardProps> = ({ data, onReveal }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  // Support visualStructure color or fallback
  const liquidColor = data.visualStructure?.colorHex || '#ea580c'; 

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      if (onReveal) onReveal();
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto my-6 transition-all duration-700 ${!isRevealed ? 'cursor-pointer hover:scale-105' : ''}`} onClick={handleReveal}>
      {/* Dark Glass Panel */}
      <div className={`glass-panel rounded-2xl p-1 shadow-2xl transition-colors duration-500 ${!isRevealed ? 'bg-black/30 hover:bg-black/40' : 'bg-black/20'}`}>
        
        {/* Inner Card Content */}
        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-xl p-6 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
          
          {/* Decorative Background Elements */}
          <div 
             className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-all duration-1000"
             style={{ backgroundColor: liquidColor, opacity: isRevealed ? 0.15 : 0.3 }}
          ></div>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase block mb-2 font-bold">Mood Bistro Special</span>
            <h2 className={`font-display text-3xl text-gray-200 italic transition-all duration-700 drop-shadow-md ${isRevealed ? '' : 'scale-110'}`}>{data.name}</h2>
          </div>

          {/* Visual Glass Representation - Now using structured data */}
          <div className="mb-4">
             <CocktailVisual visual={data.visualStructure} scale={isRevealed ? 0.8 : 1.2} />
          </div>

          {/* Mystery / Hint Text */}
          {!isRevealed && (
            <div className="mt-8 text-center animate-pulse">
                <p className="text-gray-400 font-serif italic text-sm tracking-widest uppercase border-b border-gray-600 pb-1 inline-block drop-shadow-sm">
                    点击品尝 (Click to Taste)
                </p>
            </div>
          )}

          {/* Revealed Content (Animated Height/Opacity) */}
          <div className={`transition-all duration-1000 ease-in-out w-full ${isRevealed ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              
              {/* Recipe Section - Spacious Grid Layout */}
              <div className="mb-6 relative z-10">
                <div className="grid grid-cols-2 gap-3 mb-3">
                   {/* Base Spirit */}
                   <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center flex flex-col items-center justify-center shadow-md">
                      <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Base</span>
                      <span className="text-gray-200 font-serif text-sm font-medium">{data.recipe.base}</span>
                   </div>
                   {/* Adjunct */}
                   <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center flex flex-col items-center justify-center shadow-md">
                      <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Adjunct</span>
                      <span className="text-gray-200 font-serif text-sm font-medium">{data.recipe.adjunct}</span>
                   </div>
                </div>
                {/* Soul - Full Width */}
                <div className="bg-gradient-to-r from-black/40 via-white/5 to-black/40 border border-white/10 rounded-lg p-4 text-center shadow-md">
                   <span className="text-[10px] uppercase text-amber-500/80 font-bold tracking-[0.2em] mb-1 block">The Soul</span>
                   <span className="text-amber-100 font-serif italic text-lg">{data.recipe.abstract}</span>
                </div>
              </div>

              {/* Description Text */}
              <div className="mb-6 text-sm leading-relaxed text-center px-2">
                <p className="text-gray-400 italic mb-3 opacity-80 text-xs">"{data.visual}"</p>
                <div className="w-12 h-px bg-white/10 mx-auto my-4"></div>
                <p className="text-gray-300 font-serif animate-fade-in leading-7 drop-shadow-sm" style={{ animationDelay: '0.3s' }}>
                  {data.taste}
                </p>
              </div>

              {/* Music Recommendation */}
              <div className="flex items-center justify-center space-x-3 text-xs text-gray-400 mb-2 bg-white/5 py-2 px-4 rounded-full border border-white/5 mx-auto max-w-fit">
                <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <span className="tracking-wider font-mono font-bold truncate max-w-[200px]">{data.music}</span>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};