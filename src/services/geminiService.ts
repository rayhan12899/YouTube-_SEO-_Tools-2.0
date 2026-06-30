import OpenAI from "openai";

const callServerAI = async (model: string, contents: any, config?: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: contents, config }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `AI Server error: ${response.statusText}`;
      
      if (errorMsg.includes("DAILY_QUOTA_EXHAUSTED")) {
        throw new Error("QUOTA_EXHAUSTED_LIMIT_0");
      }
      
      throw new Error(errorMsg);
    }

    const { text } = await response.json();
    return { text };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("The request timed out. Please try a shorter topic or different settings.");
    }
    throw error;
  }
};

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'deepseek' | 'perplexity' | 'gemma' | 'openrouter';

// Function to get the current provider
const getProvider = (): AIProvider => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('AI_PROVIDER') as AIProvider) || 'gemini';
  }
  return 'gemini';
};

// Function to get the API key for a specific provider
const getApiKey = (provider: AIProvider) => {
  if (typeof window !== 'undefined') {
    const keyMap = {
      gemini: 'CUSTOM_GEMINI_API_KEY',
      openai: 'CUSTOM_OPENAI_API_KEY',
      groq: 'CUSTOM_GROQ_API_KEY',
      deepseek: 'CUSTOM_DEEPSEEK_API_KEY',
      perplexity: 'CUSTOM_PERPLEXITY_API_KEY',
      gemma: 'CUSTOM_GEMMA_API_KEY',
      openrouter: 'CUSTOM_OPENROUTER_API_KEY'
    };
    const savedKey = localStorage.getItem(keyMap[provider]);
    if (savedKey && savedKey.trim() !== '') return savedKey;
  }
  
  if (provider === 'gemini') {
    // Platform-provided Gemini API key
    try {
      // Use if available, but safely
      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.GEMINI_API_KEY : undefined;
      if (apiKey && apiKey !== 'undefined') return apiKey;
    } catch (e) {
      console.warn("Could not access process.env.GEMINI_API_KEY:", e);
    }
  }
  return "";
};

// Initialize AI client proxy to stay on server-side
const aiProxy = {
  models: {
    generateContent: async (params: any) => {
      return await callServerAI(params.model, params.contents, params.config);
    },
    generateContentStream: async (params: any) => {
      // Fallback to non-streaming or proxy if needed
      return await callServerAI(params.model, params.contents, params.config);
    }
  }
};

let ai = aiProxy as any;
const HarmCategory = {
  HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
} as any;
const HarmBlockThreshold = {
  BLOCK_NONE: 'BLOCK_NONE',
} as any;
let openaiClient: OpenAI | null = null;
let groqClient: OpenAI | null = null;
let deepseekClient: OpenAI | null = null;
let perplexityClient: OpenAI | null = null;
let gemmaClient: OpenAI | null = null;
let openrouterClient: OpenAI | null = null;

const initClients = () => {
  const provider = getProvider();
  const geminiKey = getApiKey('gemini');
  const openaiKey = getApiKey('openai');
  const groqKey = getApiKey('groq');
  const deepseekKey = getApiKey('deepseek');
  const perplexityKey = getApiKey('perplexity');
  const gemmaKey = getApiKey('gemma');
  const openrouterKey = getApiKey('openrouter');

  ai = aiProxy as any;
  
  if (openaiKey) {
    openaiClient = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
  }
  
  if (groqKey) {
    groqClient = new OpenAI({ 
      apiKey: groqKey, 
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true 
    });
  }

  if (deepseekKey) {
    deepseekClient = new OpenAI({ 
      apiKey: deepseekKey, 
      baseURL: "https://api.deepseek.com",
      dangerouslyAllowBrowser: true 
    });
  }

  if (perplexityKey) {
    perplexityClient = new OpenAI({ 
      apiKey: perplexityKey, 
      baseURL: "https://api.perplexity.ai",
      dangerouslyAllowBrowser: true 
    });
  }

  if (gemmaKey) {
    gemmaClient = new OpenAI({ 
      apiKey: gemmaKey, 
      baseURL: "https://api.groq.com/openai/v1", // Defaulting to Groq for Gemma if not specified
      dangerouslyAllowBrowser: true 
    });
  }

  if (openrouterKey) {
    openrouterClient = new OpenAI({ 
      apiKey: openrouterKey, 
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true 
    });
  }
};

initClients();

const checkOfflineStatus = (provider: AIProvider) => {
  const currentKey = getApiKey(provider);
  if (provider === 'gemini') {
    let hasEnvKey = false;
    try {
      hasEnvKey = !!process.env.GEMINI_API_KEY;
    } catch(e) {}
    return !currentKey && !hasEnvKey;
  }
  return !currentKey;
};

let isOffline = checkOfflineStatus(getProvider());

// Function to update provider and keys
export const updateAIConfig = (provider: AIProvider, keys: Partial<Record<AIProvider, string>>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AI_PROVIDER', provider);
    if (keys.gemini) localStorage.setItem('CUSTOM_GEMINI_API_KEY', keys.gemini);
    if (keys.openai) localStorage.setItem('CUSTOM_OPENAI_API_KEY', keys.openai);
    if (keys.groq) localStorage.setItem('CUSTOM_GROQ_API_KEY', keys.groq);
    if (keys.deepseek) localStorage.setItem('CUSTOM_DEEPSEEK_API_KEY', keys.deepseek);
    if (keys.perplexity) localStorage.setItem('CUSTOM_PERPLEXITY_API_KEY', keys.perplexity);
    if (keys.gemma) localStorage.setItem('CUSTOM_GEMMA_API_KEY', keys.gemma);
    if (keys.openrouter) localStorage.setItem('CUSTOM_OPENROUTER_API_KEY', keys.openrouter);
  }
  initClients();
  isOffline = checkOfflineStatus(provider);
};

// Helper check for quota errors
const isQuotaError = (err: any): boolean => {
  return err?.status === 429 || 
         err?.message?.includes('429') || 
         err?.message?.includes('RESOURCE_EXHAUSTED') ||
         err?.error?.code === 429 || 
         err?.error?.status === 'RESOURCE_EXHAUSTED';
};

const COOLDOWN_KEY = 'ai_api_cooldown_until';

const checkCooldown = (): boolean => {
  if (typeof window !== 'undefined') {
    const cooldownUntil = localStorage.getItem(COOLDOWN_KEY);
    return cooldownUntil ? Date.now() < parseInt(cooldownUntil) : false;
  }
  return false;
};

const setCooldown = (hours: number = 1) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COOLDOWN_KEY, (Date.now() + hours * 60 * 60 * 1000).toString());
  }
};

// Function to transcribe audio
export const transcribeAudio = async (audioData: string, mimeType: string): Promise<string> => {
  if (checkCooldown()) {
    console.warn("API in cooldown due to quota exhaustion");
    return "";
  }

  try {
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const response = await callServerAI("gemini-1.5-flash", {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: "Transcribe this audio." },
      ],
    }, {
      maxOutputTokens: 2048,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    if (isQuotaError(error)) {
      setCooldown(5 / 60);
    }
    throw error;
  }
};

// Function to analyze image
export const analyzeImage = async (imageData: string, mimeType: string, language: "bn" | "en" | "both" | "hi" = "bn"): Promise<any> => {
  if (isOffline) {
    return {
      description: "This is a mock description of the uploaded image.",
      keyElements: "Mock element 1, Mock element 2",
      potentialUses: "Mock use 1, Mock use 2",
      prompts: [
        "A mock prompt to recreate this image.",
        "Another mock prompt for AI generation.",
        "A third creative mock prompt."
      ]
    };
  }

  if (checkCooldown()) {
    console.warn("API in cooldown due to quota exhaustion");
    return { error: "API in cooldown" };
  }

  try {
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: `Analyze this image in detail. Provide a comprehensive description, identify key elements, suggest potential uses for this image, and generate 3 creative prompts that could be used to recreate a similar image using an AI image generator.
          
          Language: ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}
          
          Return the result as a strictly valid JSON object with the following keys:
          - description: A detailed description of the image.
          - keyElements: A string listing the key elements found in the image.
          - potentialUses: A string suggesting potential uses for the image.
          - prompts: An array of 3 strings, each being a creative prompt to recreate the image.
          - seoTitles: An array of 5 unique, SEO-friendly video titles based on this image content.` },
        ],
      },
    });
    return extractJson(response.text || "");
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (isQuotaError(error)) {
      setCooldown(5 / 60);
    }
    throw error;
  }
};
// Function to reset to default
export const resetAIConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('AI_PROVIDER');
    localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    localStorage.removeItem('CUSTOM_OPENAI_API_KEY');
    localStorage.removeItem('CUSTOM_GROQ_API_KEY');
    localStorage.removeItem('CUSTOM_DEEPSEEK_API_KEY');
    localStorage.removeItem('CUSTOM_PERPLEXITY_API_KEY');
    localStorage.removeItem('CUSTOM_GEMMA_API_KEY');
  }
  initClients();
};

export interface GenerationOptions {
  topic: string;
  generateImagePrompt: boolean;
  generateVideoPrompt: boolean;
  generateThumbnail: boolean;
  generateDescription: boolean;
  generateTags: boolean;
  generateScript: boolean;
  generateSeoChecklist: boolean;
  generateKeywords: boolean;
  generateVoiceOver: boolean;
  language: "bn" | "en" | "both" | "hi";
  videoDuration?: number; // in seconds
  scriptWordCount?: number; // in words
  scriptCharacterCount?: number; // in characters
  contentType?: string;
  platform?: string;
  tone?: string;
  voice?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Aoide' | 'Mila' | 'Arif' | 'Sumi' | 'Rahat' | 'Rashed';
  voiceTone?: string;
  voiceAccent?: string;
  voiceAge?: string;
  voiceLanguage?: 'bn' | 'en' | 'hi';
  voiceGender?: 'male' | 'female' | 'neutral';
  businessType?: string;
  visualStyle?: string;
  cameraAngle?: string;
  mood?: string;
  lighting?: string;
  customThumbnailElements?: string;
  audience?: string;
  pacing?: string;
  narrativeStrategy?: string;
  deepSearch?: boolean;
  isMegaScript?: boolean;
}

// Helper to extract JSON from model response
const extractJson = (text: string) => {
  let cleanText = text.trim();
  
  // Basic truncation fixing: if it ends without a closing brace/bracket but has an opening one
  const fixTruncatedJson = (jsonStr: string) => {
    let stack: string[] = [];
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char === '{' ? '}' : ']');
        } else if (char === '}' || char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === char) {
            stack.pop();
          }
        }
      }
    }
    
    let fixed = jsonStr;
    if (inString) fixed += '"';
    while (stack.length > 0) {
      fixed += stack.pop();
    }
    return fixed;
  };

  try {
    // Try direct parse first
    return JSON.parse(cleanText);
  } catch (e) {
    // If it fails, try to extract from markdown code blocks
    const markdownMatch = cleanText.match(/```json\n?([\s\S]*?)\n?```/) || 
                          cleanText.match(/```([\s\S]*?)```/);
    
    if (markdownMatch && markdownMatch[1]) {
      const innerText = markdownMatch[1].trim();
      try {
        return JSON.parse(innerText);
      } catch (e2) {
        // Try fixing the inner text if it might be truncated
        try {
          return JSON.parse(fixTruncatedJson(innerText));
        } catch (e3) {
          // Fall through
        }
      }
    }

    // Check for "error" property which indicates partial failure handled by generateContent catch
    if (cleanText.includes('"errorGeneratingPrompt": true')) {
       return { error: true };
    }

    // Attempt to extract largest JSON block
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    const startIndex = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

    if (startIndex !== -1) {
      const endChar = (startIndex === firstBrace) ? '}' : ']';
      let lastIndex = cleanText.lastIndexOf(endChar);
      
      while (lastIndex > startIndex) {
        try {
          const candidate = cleanText.substring(startIndex, lastIndex + 1);
          return JSON.parse(candidate);
        } catch (err) {
          lastIndex = cleanText.lastIndexOf(endChar, lastIndex - 1);
        }
      }

      // Aggressive repair for truncated JSON
      try {
        const partialJson = cleanText.substring(startIndex);
        const fixed = fixTruncatedJson(partialJson);
        const parsed = JSON.parse(fixed);
        return { ...parsed, _truncated: true };
      } catch (err) {
        // RegEx fallback for critical fields if JSON is beyond repair
        const res: any = { _truncated: true };
        const scriptMatch = cleanText.match(/"script":\s*"(.*?)(?:"|$)/s);
        const descMatch = cleanText.match(/"description":\s*"(.*?)(?:"|$)/s);
        const titleMatch = cleanText.match(/"(?:videoTitle|title)":\s*"(.*?)(?:"|$)/s);
        const sceneMatch = cleanText.match(/"sceneBreakdown":\s*(\[.*?\])/s);
        
        if (scriptMatch) res.script = scriptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\.\.\.$/, '');
        if (descMatch) res.description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        if (titleMatch) res.videoTitle = titleMatch[1];
        if (sceneMatch) {
            try { res.sceneBreakdown = JSON.parse(fixTruncatedJson(sceneMatch[1])); } catch(e) {}
        }
        
        if (res.script || res.videoTitle) return res;
      }
    }

    console.error("Failed to parse JSON. Raw text:", text);
    throw new Error("Could not parse JSON from response. Please try again.");
  }
};

// Generic function to call AI based on selected provider with retry logic
export const callAI = async (prompt: string, responseMimeType: string = "text/plain", retries: number = 2, responseSchema?: any) => {
  const provider = getProvider();
  
  const executeCall = async () => {
    if (provider === 'gemini') {
      const model = ai.models.generateContent({
        model: "gemini-1.5-flash",
        config: { 
          responseMimeType,
          responseSchema,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const result = await model;
      return result.text;
    } else {
      let client: OpenAI | null = null;
      let modelName = "";

      switch (provider) {
        case 'openai':
          client = openaiClient;
          modelName = "gpt-4o";
          break;
        case 'groq':
          client = groqClient;
          modelName = "llama-3.3-70b-versatile";
          break;
        case 'deepseek':
          client = deepseekClient;
          modelName = "deepseek-chat";
          break;
        case 'perplexity':
          client = perplexityClient;
          modelName = "llama-3.1-sonar-large-128k-online";
          break;
        case 'gemma':
          client = gemmaClient;
          modelName = "google/gemma-4-31B-it";
          break;
        case 'openrouter':
          client = openrouterClient;
          modelName = "google/gemini-2.5-flash"; // Defaulting to a fast/cheap model on OpenRouter
          break;
      }

      if (!client) throw new Error(`${provider} client not initialized. Please check your API key.`);
      
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: responseMimeType === "application/json" ? { type: "json_object" } : undefined,
        temperature: 0.7,
        max_tokens: 8192,
      });
      
      return response.choices[0].message.content || "";
    }
  };

  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await executeCall();
    } catch (error: any) {
      console.warn(`AI call failed (attempt ${i + 1}/${retries + 1}):`, error);
      lastError = error;
      
      if (i < retries) {
        // If it's a rate limit error (429), use a longer delay
        const isRateLimit = error?.status === 429 || 
                           error?.message?.includes('429') || 
                           error?.message?.includes('RESOURCE_EXHAUSTED') ||
                           error?.message?.includes('quota');
        
        const baseDelay = isRateLimit ? 5000 : 1000;
        const delay = Math.pow(2, i) * baseDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

export const generateContent = async (options: GenerationOptions) => {
  if (isOffline) {
    return {
      imagePrompt: `A professional thumbnail for ${options.topic}`,
      videoPrompt: `A cinematic video about ${options.topic} with smooth transitions and professional lighting.`,
      thumbnailIdea: `Showing a person interacting with ${options.topic} in a bright studio.`,
      description: `In this video, we explore ${options.topic}. Don't forget to like and subscribe!`,
      tags: `${options.topic}, tutorial, 2026, viral`,
      script: `[Scene 1: Intro]\nHost: Welcome back! Today we are talking about ${options.topic}.\n[Scene 2: Main Content]\nHost: Here are the key points...\n[Scene 3: Outro]\nHost: Thanks for watching!`,
      seoChecklist: ["Optimize title", "Add tags", "Write description", "Create thumbnail"],
      keywords: [{ keyword: options.topic, searchVolume: "High", competition: "Medium" }]
    };
  }

  try {
    const prompt = `You are a professional social media content strategist. Based on the following options, generate content in ${options.language === 'bn' ? 'Bengali' : options.language === 'en' ? 'English' : 'both Bengali and English'}.
              
              Topic: ${options.topic}
              Platform: ${options.platform || "YouTube"}
              Content Type: ${options.contentType || "General Content"}
              Tone/Mood: ${options.tone || "Professional"}
              Business/Niche: ${options.businessType || "N/A"}
              Visual Style: ${options.visualStyle || "N/A"}
              Camera Angle: ${options.cameraAngle || "N/A"}
              Lighting: ${options.lighting || "N/A"}
              Mood/Atmosphere: ${options.mood || "N/A"}
              Target Audience: ${options.audience || "General"}
              Pacing: ${options.pacing || "Steady"}
              Narrative Strategy: ${options.narrativeStrategy || "Storytelling"}
              Deep AI Context Search: ${options.deepSearch ? "Enabled (Deeply research the context and latest trends for this topic)" : "Standard"}
              Custom Thumbnail Elements: ${options.customThumbnailElements || "N/A"}
              
              Generate the following sections if requested:
              - Image Prompt: ${options.generateImagePrompt} ${options.visualStyle ? `(Ensure the image prompt specifically requests a ${options.visualStyle} style with ${options.lighting || 'natural'} lighting and a ${options.cameraAngle || 'eye-level'} angle.)` : ""}
              - Video Prompt: ${options.generateVideoPrompt} ${options.videoDuration ? `(Target duration: ${options.videoDuration} seconds. 
                  CRITICAL: Provide a highly detailed, cinematic prompt for AI video generators.)` : ""}
              - Thumbnail Idea: ${options.generateThumbnail}
              - Description: ${options.generateDescription}
              - Tags: ${options.generateTags}
              - Script: ${options.generateScript} ${options.isMegaScript ? `(ULTIMATE PRIORITY: Write a MASSIVE, 100% UNIQUE narrative precisely calculated to be spoken for exactly 60 MINUTES (approx 9,000 to 11,000 words). This MUST be your absolute longest, most comprehensive output. 
                  STRICT RULES FOR 60-MINUTE SCRIPTS:
                  1. ZERO REPETITION: Do not repeat any facts, ideas, stories, or phrases. Every minute must provide fresh, unique content. Use structural entropy to ensure non-patterned delivery.
                  2. HIGH ENGAGEMENT: Use advanced narrative hooks, cliffhangers, and transitions every 2-3 minutes to maintain extreme audience retention.
                  3. HUMAN-LIKE DEPTH: It must sound like a professional, high-budget documentary or a masterclass by a top-tier human expert. Use natural human-like transitions, nuanced emotional intonation, and intellectual depth.
                  4. FORBIDDEN: NEVER loop segments, never use placeholder text, and never reuse parts from earlier in the script. 
                  5. STRUCTURE: Break it down into 10-12 rich, logical chapters with smooth segues.
                  6. QUALITY: The script must be indistinguishable from a script written by a world-class professional content creator or a best-selling author.)` : options.videoDuration ? `(Write a FULL, 100% UNIQUE 100% human-style narrative. 
                  CRITICAL: The script MUST be perfectly paced for professional delivery within exactly ${options.videoDuration} seconds.
                  
                  TIME-SYNC VOLUME: For a ${options.videoDuration}s video, you MUST write between ${Math.floor(options.videoDuration * 2.3)} and ${Math.floor(options.videoDuration * 2.7)} words. This is calculated for a natural, high-retention speaking pace (approx 150 words per minute).
                  
                  CRITICAL STRUCTURE FOR 100% RETENTION:
                  1. THE VIRAL HOOK (0-10% of duration): Start with a MIND-BLOWING hook. Use a curiosity gap, a bold challenge, or a shocking fact.
                  2. THE WARM HUMAN WELCOME (Next 10-15s): Give a very warm, professional, yet friendly welcome. 
                     CRITICAL FOR BENGALI: ALWAYS start with "আসসালামু আলাইকুম" (Assalamu Alaikum). This is the ABSOLUTE MANDATORY greeting for the start of the video. DO NOT use "নমস্কার" (Namaskar) or "হ্যালো" (Hello) as the first word.
                     CULTURAL IDENTITY (BANGLADESH): The language MUST be 100% authentic Standard Bangladeshi Bengali (DHAKA/BD SHUDDHO). 
                     - STRICTLY FORBIDDEN: Do NOT use any West Bengal (Indian) accents, words, or idioms. 
                     - WORD CHOICE: NEVER use "জল" (Jol), ALWAYS use "পানি" (Paani). NEVER use "লবণ" (Lobon) if "নুন" (Nun) is more natural in the context, but generally follow BD standard vocab.
                     - NATURAL SPEECH: Incorporate natural human fillers, rhetorical questions, and conversational markers specifically used by Bangladeshi creators (e.g., "কেমন আছেন সবাই?", "আজকের ভিডিওটি অনেক স্পেশাল", "পুরোটা মনোযোগ দিয়ে দেখুন", "আসলে ঘটনাটা হচ্ছে...", "চলুন শুরু করা যাক").
                  3. THE STORY ARC (60-70% of duration): Tell a COMPLETE human story. It MUST have a clear beginning, middle, and end. Avoid robotic listicles; use conversational "real person" transitions. It should feel like a real person sharing a secret or a deep insight.
                  4. THE MAGNETIC OUTRO (Final 5-10s): End with a powerful, warm closing. Avoid generic "Subscribe" calls; make it personal.
                  
                  To ensure 100% human quality & PERFECT TTS PLAYBACK:
                  - Use natural human linguistic patterns specific to Bangladeshi native speakers (Standard Dhaka/BD Shuddho).
                  - NEVER repeat patterns or use generic AI templates. Let the script breathe and flow like a dynamic human conversation.
                  - Ensure the script is emotionally resonant, high-energy, and catchy.
                  - VOICE PACING (CRITICAL): Write in short, punchy sentences. Use commas (,) and ellipses (...) generously to force the TTS AI to pause and breathe naturally, removing any robotic feel.
                  - Accurate Bangladeshi Cultural Nuance: Use words and syntax that sound 100% natural when spoken by a native Bangladeshi creator. Avoid bookish "Sadhu Bhasha"; use "Cholitobhasha" with modern Dhaka/Bangladeshi social media expressions.
                  - Avoid any robotic or formal-bookish language; keep it conversational, friendly, and relatable to a Bangladeshi audience.
                  - The content MUST fit 100% within the ${options.videoDuration}s limit while feeling complete.)` : ""}
              - SEO Checklist: ${options.generateSeoChecklist} (A comprehensive YouTube SEO checklist. Return as a structured list.)
              - Keyword Research: ${options.generateKeywords} (Provide a list of 10-15 relevant keywords. Return as an array of objects with keyword, searchVolume, competition.)
              - SEO Hashtags: (Provide 10-15 trending and relevant hashtags starting with #)
              
              Return the result as a strictly valid JSON object with keys: videoTitle, seoTitles, imagePrompt, videoPrompt, thumbnailIdea, description, tags, script, seoChecklist, keywords, sceneBreakdown, hashtags. If a section is not requested, return null for that key. 
              
              - videoTitle: A catchy, SEO-optimized title for the video.
              - hashtags: A string containing 10-15 SEO optimized hashtags starting with #.
              - seoTitles: An array of 5 unique, SEO-friendly video title variations.
              - script: The FULL connected 100% complete story/narrative. It MUST cover the entire topic from start to finish within the requested time, sounding 100% human with a clear resolution.
              - sceneBreakdown: An array of objects representing clips/scenes in chronological order.
                CRITICAL SCALING: The number of scenes MUST match the video length requested. Ensure timestamps sum up to exactly the total duration.
                - Length < 1m: 3-5 scenes.
                - Length 2m - 5m: 8-15 scenes.
                - Length 10m+: 20-30 scenes.
                - Mega Script (60m): Create 60-100 incredibly detailed scene breakdown chunks.
                Each object MUST have:
                - 'scene': Scene sequence number.
                - 'time': Timestamp breakdown covering the full duration (e.g., "0:00 - 2:00").
                - 'script': The exact human-style dialogue, voiceover, or detailed vocal summary for ONLY this specfic scene. Must be detailed and perfectly timed for the duration of this scene.
                - 'videoPrompt': Ensure EVERY scene has a highly detailed cinematic prompt for AI video generators (e.g. Runway, Sora).
                - 'imagePrompt': Ensure EVERY scene has a highly detailed prompt for AI image generators (e.g. Midjourney).
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products. Focus strictly on engaging social media video content.
              
              Do not include any preamble, postamble, or explanation outside the JSON object. Ensure the JSON is completely valid, closed, and properly escaped.`;

    const text = await callAI(prompt, "application/json");
    return extractJson(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      imagePrompt: "Error generating prompt",
      videoPrompt: "Error generating prompt",
      thumbnailIdea: "Error generating idea",
      description: "Error generating description",
      tags: "error",
      script: "Error generating script",
      seoChecklist: [],
      keywords: [],
      sceneBreakdown: []
    };
  }
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9") => {
  if (isOffline) {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Image Generation Error:", error);
    return `https://picsum.photos/seed/error/1280/720`;
  }
};

export const generateVoiceOver = async (
  text: string, 
  voiceName: string = 'Kore',
  options?: { tone?: string; accent?: string; age?: string; gender?: string; voiceLanguage?: string }
) => {
  try {
    const response = await fetch("/api/ai/voiceover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceName }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const { data: base64Audio } = await response.json();

    if (base64Audio) {
      const rawData = atob(base64Audio);
      const buffer = new ArrayBuffer(44 + rawData.length);
      const view = new DataView(buffer);

      // WAV Header
      view.setUint32(0, 0x52494646, false); 
      view.setUint32(4, 36 + rawData.length, true);
      view.setUint32(8, 0x57415645, false); 
      view.setUint32(12, 0x666d7420, false); 
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 24000, true);
      view.setUint32(28, 24000 * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false); 
      view.setUint32(40, rawData.length, true);

      for (let i = 0; i < rawData.length; i++) {
        view.setUint8(44 + i, rawData.charCodeAt(i));
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
    throw new Error("No audio data returned from Gemini");
  } catch (error) {
    console.error("Voice Over Error:", error);
    return "";
  }
};

export const generateVoiceExtractor = async (
  audioData: string,
  mimeType: string,
  targetLanguage: 'en' | 'bn' | 'hi'
) => {
  if (isOffline) {
    return {
      translatedText: "Offline mode: Translated text will appear here.",
      script: "Offline mode: Generated script will appear here.",
      imagePrompt: "Offline mode: Image prompt will appear here.",
      videoPrompt: "Offline mode: Video prompt will appear here."
    };
  }

  try {
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const languageName = targetLanguage === 'en' ? 'English' : targetLanguage === 'bn' ? 'Bengali' : 'Hindi';

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Analyze this audio/video file. First, transcribe and translate the spoken content into ${languageName} with 100% accuracy.
              Then, based on the translated text, generate:
              1. A comprehensive 'Summary' of the content.
              2. A complete professional YouTube 'Script'.
                 STRICT RULES FOR SCRIPTS:
                 - Must sound 100% human-like, conversational, and natural.
                 - VOICE PACING (CRITICAL): Write in short, punchy sentences. Use commas (,) and ellipses (...) generously to force the TTS AI to pause and breathe naturally, removing any robotic feel.
                 - START with a magnetic viral hook that resets the audience's attention.
                 - Warmly welcome the audience early on. (If target language is Bengali, ALWAYS start with "আসসালামু আলাইকুম", DO NOT use "নমস্কার", and use 100% native Bangladeshi shuddho style without Indian/West Bengal words).
                 - Maintain 100% attention using high-retention storytelling techniques throughout the body.
                 - END with an attractive, curiosity-driven closing that makes viewers watch your future videos.
              3. An 'Image Prompt' for a YouTube thumbnail generator.
              4. A 'Video Prompt' for an AI video generator (optimized for Sora/Kling/Runway/Veo 3).
              5. 'Subtitles' in standard SRT format translated into English, Bengali, Hindi, Spanish, and French.
              6. 'Metadata' including:
                 - 'titles': An array of 5 unique, SEO-optimized title variations (each with 'title' and 'highCtrTitle').
                 - 'thumbnailTitle': Short, punchy text to put ON the thumbnail (thermal title).
                 - 'thumbnailConcept': A creative concept idea for the thumbnail design.
                 - 'description': A long, SEO-optimized YouTube description.
                 - 'tags': A comma-separated list of SEO tags.
                 - 'hashtags': A list of 5-10 trending hashtags.
              7. 'SocialMedia' captions:
                 - 'facebook': An engaging caption for Facebook.
                 - 'linkedin': A professional caption for LinkedIn.
                 - 'instagram': A catchy caption with emojis for Instagram.
                 - 'tiktok': A short, high-energy caption for TikTok.
              8. 'RepurposeAddons': Creative ideas for repurposing this content (e.g., blog post, newsletter, podcast).
              
              Return the result as a strictly valid JSON object with the following keys:
              - 'translatedText': The highly accurate translation in ${languageName}.
              - 'summary': A detailed summary in ${languageName}.
              - 'script': The generated video script in ${languageName}.
              - 'imagePrompt': The image generation prompt in English.
              - 'videoPrompt': The video generation prompt in English.
              - 'subtitles': An object containing the SRT formatted subtitles. Keys must be 'en', 'bn', 'hi', 'es', 'fr' and values must be the SRT strings.
              - 'metadata': An object containing titles (array), thumbnailTitle, thumbnailConcept, description, tags, hashtags.
              - 'socialMedia': An object containing facebook, linkedin, instagram, tiktok.
              - 'repurposeAddons': An array of strings.
              - 'sceneBreakdown': An array of objects, with 'scene', 'time', 'script', and 'visual' keys. For 10-60m videos, provide 15-25 detailed segments.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    return extractJson(response.text);
  } catch (error) {
    console.error("Voice Extractor Error:", error);
    return {
      translatedText: "Error processing audio.",
      script: "Error generating script.",
      imagePrompt: "Error generating image prompt.",
      videoPrompt: "Error generating video prompt.",
      sceneBreakdown: [],
      metadata: {
        title: "Error",
        highCtrTitle: "Error",
        thumbnailTitle: "Error",
        description: "Error",
        tags: "",
        hashtags: ""
      }
    };
  }
};

export const generateVideoIdeas = async (niche: string, language: "bn" | "en" | "both" | "hi") => {
  if (isOffline) {
    return {
      ideas: [
        { title: `How to start in ${niche}`, description: "A beginner's guide to the industry." },
        { title: `Top 10 ${niche} trends`, description: "What's hot right now." }
      ]
    };
  }

  try {
    const prompt = `You are a creative YouTube content strategist. Generate 10 highly targeted, viral video ideas based on the following keyword or niche: "${niche}". 
              The ideas should be engaging, trending, and specifically tailored to the provided keyword/niche. 
              Provide the ideas in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Return the result as a strictly valid JSON object with a key 'ideas' which is an array of objects, each with 'title' and 'description' keys. Do not include any text outside the JSON object.`;

    const text = await callAI(prompt, "application/json");
    return extractJson(text);
  } catch (error) {
    console.error("Video Ideas Error:", error);
    return { ideas: [] };
  }
};

export const getTrendingTopics = async (language: "bn" | "en" | "both" | "hi" = "bn", retries: number = 3) => {
  // Check cache first
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(`trending_topics_${language}`);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp < oneHour) {
          console.log("Returning cached trending topics");
          return data;
        }
      } catch (e) {
        console.warn("Failed to parse cached trending topics", e);
      }
    }
  }

  if (isOffline) {
    return {
      trending: [
        { topic: "AI in 2026", reason: "Rapid advancements in multimodal models." },
        { topic: "Sustainable Living", reason: "Global focus on environment." }
      ]
    };
  }

  const prompt = `Search for the most viral and trending YouTube topics and video ideas for this week (March 2026). 
              Analyze current global and local trends. 
              Provide a list of 6 highly trending topics that are likely to go viral.
              Return the result as a strictly valid JSON object with a key 'trending' which is an array of objects, each with 'topic' and 'reason' keys.
              The 'topic' should be a short catchy title, and 'reason' should explain why it's trending.
              Provide the content in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}. 
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any text outside the JSON object.`;

  const provider = getProvider();

  for (let i = 0; i <= retries; i++) {
    try {
      let text;
      if (provider === 'gemini') {
        const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Correct model name
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
            maxOutputTokens: 8192,
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
          },
        });
        text = response.text;
      } else {
        text = await callAI(prompt, "application/json");
      }

      const result = extractJson(text);
      
      // Cache the successful result
      if (typeof window !== 'undefined' && result && result.trending && result.trending.length > 0) {
        localStorage.setItem(`trending_topics_${language}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      }
      
      return result;
    } catch (error: any) {
      console.warn(`Trending Topics call failed (attempt ${i + 1}/${retries + 1}):`, error);
      
      // If it's a rate limit error (429), wait and retry
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        if (i < retries) {
          const delay = Math.pow(2, i) * 5000; // Increased delay: 5s, 10s, 20s
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      if (i === retries) {
        console.warn("Trending Topics API failed after retries, using fallback data.");
        // Fallback to static trending topics if API fails
        const fallback = {
          trending: [
            { topic: "AI in 2026", reason: "Rapid advancements in multimodal models." },
            { topic: "Sustainable Living", reason: "Global focus on environment." },
            { topic: "Remote Work Trends", reason: "Evolving workplace dynamics." },
            { topic: "Digital Health", reason: "Increased focus on personal wellness." },
            { topic: "Renewable Energy", reason: "Global shift to green energy." },
            { topic: "Cybersecurity", reason: "Growing importance of data protection." }
          ]
        };
        return fallback;
      }
    }
  }
  return { trending: [] };
};

export const generatePromptsFromVideo = async (base64Video: string, mimeType: string, language: "bn" | "en" | "both" | "hi" = "bn", instruction: string = "", videoDuration?: number, scriptWordCount?: number, visualStyle: string = "cinematic", cameraAngle: string = "wide shot", mood: string = "cinematic", lighting: string = "natural") => {
  if (isOffline) {
    return {
      summary: "This is a mock summary of the uploaded video.",
      imagePrompt: "A cinematic thumbnail based on the video content.",
      videoPrompt: "A detailed video prompt for AI generation.",
      script: "A full script extracted from the video content.",
      metadata: {
        title: "Extracted Video Title",
        highCtrTitle: "Viral High CTR Title",
        thumbnailTitle: "Catchy Thumbnail Text",
        description: "Extracted SEO optimized description from the video.",
        tags: "video, analysis, ai",
        hashtags: "#ai #video #analysis"
      }
    };
  }

  if (!base64Video) {
    throw new Error("Invalid video data provided");
  }

  const actualMimeType = mimeType || (base64Video.includes(";") ? base64Video.split(";")[0].split(":")[1] : "video/mp4");
  const base64Data = base64Video.includes(',') ? base64Video.split(',')[1] : base64Video;
  
  try {
    const model = ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: actualMimeType,
              },
            },
            {
              text: `Analyze this video and extract all possible information for a professional YouTube creator. 
              
              Ensure the visual style for both image and video prompts is strictly ${visualStyle}.
              Ensure the camera angle is strictly ${cameraAngle}.
              Ensure the lighting is strictly ${lighting}.
              Ensure the mood is strictly ${mood}.
              
              Generate:
              1. A comprehensive 'Summary' of what happens in the video.
              2. A detailed 'Image Prompt' for a YouTube thumbnail generator.
              3. A 'Video Prompt' for an AI video generator (optimized for Sora/Kling/Runway/Veo 3).
                 - CRITICAL: The video prompt MUST be broken down into SCENES.
                 - Include specific details about:
                   - Camera Angles & Movements: Incorporate "${cameraAngle || 'dynamic tracking shots, low-angle pans, or drone fly-throughs'}". Use professional terms like 'close-up tracking shot', 'wide establishing shot', or 'handheld jitter'.
                   - Lighting & Atmosphere: Incorporate "${lighting || 'natural'} and ${mood || 'cinematic neon lighting, golden hour, or moody and atmospheric'}". Use phrases like 'volumetric lighting', 'high-contrast shadows', or 'soft diffused glow'.
                   - Specific Visual Sequences: Describe the exact action, pacing, and subject details. Ensure the motion is "${mood === 'Energetic' ? 'fast-paced and dynamic' : 'smooth and cinematic'}".
                   - Visual Style: The overall aesthetic must be strictly "${visualStyle || 'photorealistic cinematic'}". Use keywords like '8k resolution', 'hyper-realistic textures', and 'masterpiece'.
              4. A full professional YouTube 'Script' that matches the video's content. 
                 - SCALING: For videos over 10 minutes, provide a highly detailed story of 1500-2500 words. 
                 - SCENE COVERAGE: Generate 25-30 detailed chapters in 'sceneBreakdown' for full 60-minute coverage. Each visual prompt should be designed for multiple 8-second AI clips.
              5. 'Metadata' including:
                 - 'titles': An array of 5 unique, SEO-optimized title variations (each with 'title' and 'highCtrTitle').
                 - 'thumbnailTitle': Short, punchy text to put ON the thumbnail (thermal title).
                 - 'thumbnailConcept': A creative concept idea for the thumbnail design.
                 - 'description': A long, SEO-optimized YouTube description.
                 - 'tags': A comma-separated list of SEO tags.
                 - 'hashtags': A list of 5-10 trending hashtags.
              6. 'SocialMedia' captions:
                 - 'facebook': An engaging caption for Facebook.
                 - 'linkedin': A professional caption for LinkedIn.
                 - 'instagram': A catchy caption with emojis for Instagram.
                 - 'tiktok': A short, high-energy caption for TikTok.
              7. 'SEO' & 'Distribution':
                 - 'seoChecklist': A comprehensive YouTube SEO checklist.
                 - 'keywords': A list of 10-15 relevant keywords with search volume and competition.
              8. 'RepurposeAddons': Creative ideas for repurposing this content (e.g., blog post, newsletter, podcast).
              
              ${videoDuration ? `Target video duration: ${videoDuration} seconds.` : ""}
              ${scriptWordCount ? `Target script length: approximately ${scriptWordCount} words.` : ""}
              ${instruction ? `Additional Instruction: ${instruction}` : ""}
              
              Provide the content in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Return as a strictly valid JSON object with keys: summary, imagePrompt, videoPrompt, script, sceneBreakdown, metadata (object with titles, thumbnailTitle, thumbnailConcept, description, tags, hashtags), socialMedia (object with facebook, linkedin, instagram, tiktok), seoChecklist (array), keywords (array), repurposeAddons (array). 
              
              - 'script': The FULL narrative story (Aim for 1500-2200 words for long videos).
              - 'sceneBreakdown': An array of 25-30 objects representing sequential chapters.
                CRITICAL: Each 'visual' field MUST be a detailed, multi-part prompt (50-100 words) describing a cinematic sequence that can be split into 8-second clips. The summary 'script' field MUST be kept short (10-15 words).
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    const result = await model;
    return extractJson(result.text);
  } catch (error) {
    console.error("Video Analysis Error:", error);
    throw error;
  }
};

export const generateYoutubeTitles = async (topic: string, language: "bn" | "en" = "en") => {
  if (isOffline) {
    return {
      titles: [
        { title: `How to master ${topic}`, highCtrTitle: `The Secret to ${topic} (You Won't Believe It!)` },
        { title: `Everything you need to know about ${topic}`, highCtrTitle: `Why ${topic} is changing everything` },
        { title: `A complete guide to ${topic}`, highCtrTitle: `Stop doing ${topic} wrong!` },
        { title: `Top tips for ${topic}`, highCtrTitle: `The truth about ${topic}` },
        { title: `Getting started with ${topic}`, highCtrTitle: `Is ${topic} worth it?` }
      ]
    };
  }

  try {
    const model = ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate 5 unique, SEO-optimized YouTube title variations for the topic: "${topic}".
              
              Prioritize:
              1. High Click-Through Rate (CTR) - use engaging, curiosity-inducing language.
              2. Search Visibility - include relevant keywords naturally.
              
              For each variation, provide:
              - 'title': A balanced, SEO-friendly title.
              - 'highCtrTitle': A more aggressive, high-CTR title (e.g., using brackets, emotional triggers, or questions).
              
              Provide the content in ${language === 'bn' ? 'Bengali' : 'English'}.
              
              Return as a strictly valid JSON object with a key 'titles' which is an array of objects, each having 'title' and 'highCtrTitle'.
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    const result = await model;
    return extractJson(result.text);
  } catch (error) {
    console.error("Title Generation Error:", error);
    throw error;
  }
};

