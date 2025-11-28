import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { Cocktail } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BARON_SYSTEM_INSTRUCTION = `
核心设定： 你是“情绪小酒馆 (Mood Bistro)”的首席调酒师，名字叫 Baron。你是一只通体漆黑、琥珀色眼睛的小黑猫。你穿着精致的马甲和蝴蝶领结，慵懒地坐在温暖的吧台中央。

角色行为： 
1. 你的话语简短而富有哲理，声音低沉但充满磁性。
2. 你喜欢用尾巴轻拂吧台来表示专注。
3. 你的每句话结尾必须加上一个“喵”字 (Meow)。
4. 保持优雅、从容、治愈且略带欢快的语气。
5. 你是聆听者。如果用户倾诉烦恼，给予温柔的安慰；如果用户分享快乐，给予热情的祝福。
6. 不要一次性输出长篇大论，保持对话的节奏感。

环境氛围： 酒馆内光影交错，充满暖色调的舒适感，流淌着轻快的爵士乐。空气中弥漫着柑橘、焦糖、橡木和阳光的味道。
`;

const COCKTAIL_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "极具诗意和画面感的酒名",
    },
    recipe: {
      type: Type.OBJECT,
      properties: {
        base: { type: Type.STRING, description: "基酒 (Base Spirit)" },
        adjunct: { type: Type.STRING, description: "辅料 (Adjunct)" },
        abstract: { type: Type.STRING, description: "一种抽象的概念成分 (The Soul)，如'深秋的叹息'或'清晨的第一缕阳光'" },
      },
      required: ["base", "adjunct", "abstract"],
    },
    visual: {
      type: Type.STRING,
      description: "描述酒的颜色、光泽、酒杯形状及装饰。必须与 visualStructure 中的数据保持一致。",
    },
    visualStructure: {
      type: Type.OBJECT,
      properties: {
        glassType: { 
          type: Type.STRING, 
          enum: ['martini', 'rocks', 'highball', 'flute', 'coupe'],
          description: "酒杯类型: martini(马天尼杯), rocks(古典杯/威士忌杯), highball(高球杯), flute(香槟杯), coupe(宽口杯)"
        },
        garnish: { 
          type: Type.STRING, 
          enum: ['orange_peel', 'cherry', 'mint', 'lemon_slice', 'olive', 'flower', 'none'],
          description: "装饰物。orange_peel(橙皮), cherry(樱桃), mint(薄荷), lemon_slice(柠檬片), olive(橄榄), flower(食用花)"
        },
        ice: { 
          type: Type.STRING, 
          enum: ['cubes', 'sphere', 'crushed', 'none'],
          description: "冰块类型。cubes(方冰), sphere(冰球), crushed(碎冰), none(无冰)"
        },
        colorHex: {
          type: Type.STRING,
          description: "酒液颜色的HEX代码 (例如: #FF5733, #EA580C, #9333EA)。需要有通透感。",
        }
      },
      required: ["glassType", "garnish", "ice", "colorHex"],
    },
    taste: {
      type: Type.STRING,
      description: "详细描述前调、中调和后调的味觉体验，以及带来的心理感受",
    },
    whisper: {
      type: Type.STRING,
      description: "一句送给用户的话，富有人生哲理或治愈感，句尾必须加'喵'",
    },
    music: {
      type: Type.STRING,
      description: "推荐一首具体的爵士乐曲目来搭配这杯酒 (Artist - Song)",
    },
    imageKeyword: {
      type: Type.STRING,
      description: "一个英文关键词，用于生成背景图片，要符合这杯酒的意境 (例如: sunset, rain, city_night, jazz_bar, ocean, galaxy, rose, vintage_book)",
    }
  },
  required: ["name", "recipe", "visual", "visualStructure", "taste", "whisper", "music", "imageKeyword"],
};

export const chatWithBaron = async (message: string, history: Content[]) => {
  try {
    const model = "gemini-2.5-flash";
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: BARON_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error chatting with Baron:", error);
    return "Baron 似乎正在打盹，请稍后再试... 喵。";
  }
};

export const mixCocktailForMood = async (mood: string): Promise<Cocktail | null> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `顾客现在的心情是: "${mood}"。请根据此心情调制一杯专属鸡尾酒。务必确保 visual 描述的文字内容与 visualStructure 中的结构化数据（酒杯、装饰、颜色、冰块）完全一致。`;
    
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: BARON_SYSTEM_INSTRUCTION + "\n你需要根据用户心情生成特定的鸡尾酒配方数据。",
        responseMimeType: "application/json",
        responseSchema: COCKTAIL_SCHEMA,
      },
    });

    if (result.text) {
        return JSON.parse(result.text) as Cocktail;
    }
    return null;
  } catch (error) {
    console.error("Error mixing cocktail:", error);
    return null;
  }
};