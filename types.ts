export interface VisualStructure {
  glassType: 'martini' | 'rocks' | 'highball' | 'flute' | 'coupe';
  garnish: 'orange_peel' | 'cherry' | 'mint' | 'lemon_slice' | 'olive' | 'flower' | 'none';
  ice: 'cubes' | 'sphere' | 'crushed' | 'none';
  colorHex: string;
}

export interface Cocktail {
  name: string;
  recipe: {
    base: string;
    adjunct: string;
    abstract: string;
  };
  visual: string; // The poetic text description
  visualStructure: VisualStructure; // The data for rendering
  taste: string;
  whisper: string;
  music: string;
  imageKeyword: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string; 
  isCocktail?: boolean;
  isWhisper?: boolean; 
  cocktailData?: Cocktail;
  timestamp: number;
}

export enum AppState {
  INTRO = 'INTRO',
  CHATTING = 'CHATTING',
}

export type BaronAction = 'IDLE' | 'LISTENING' | 'THINKING' | 'TALKING' | 'MIXING' | 'SERVING';