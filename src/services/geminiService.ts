import { GoogleGenAI, Modality, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";
import OpenAI from "openai";

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
    if (savedKey) return savedKey;
  }
  
  if (provider === 'gemini') return process.env.GEMINI_API_KEY || "";
  return "";
};

// Initialize AI clients
let ai = new GoogleGenAI({ apiKey: getApiKey('gemini') || "OFFLINE_MODE" });
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

  ai = new GoogleGenAI({ apiKey: geminiKey || "OFFLINE_MODE" });
  
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
    return !currentKey && !process.env.GEMINI_API_KEY;
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

// Function to transcribe audio
export const transcribeAudio = async (audioData: string, mimeType: string): Promise<string> => {
  try {
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        maxOutputTokens: 2048,
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
          { text: "Transcribe this audio." },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
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

  try {
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
  voice?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  voiceTone?: string;
  voiceAccent?: string;
  voiceAge?: string;
  voiceLanguage?: 'bn' | 'en' | 'hi';
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

    // Fallback: try to find the first '{' and search backwards for the matching '}'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    // Choose the one that appears first
    const startIndex = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

    if (startIndex !== -1) {
      // First try standard extraction (largest valid block)
      const endChar = startIndex === firstBrace ? '}' : ']';
      let lastIndex = cleanText.lastIndexOf(endChar);
      while (lastIndex > startIndex) {
        try {
          const candidate = cleanText.substring(startIndex, lastIndex + 1);
          return JSON.parse(candidate);
        } catch (err) {
          lastIndex = cleanText.lastIndexOf(endChar, lastIndex - 1);
        }
      }
      
      // If that fails, the JSON might be truncated. Try to fix it from the start.
      try {
        const partialJson = cleanText.substring(startIndex);
        return JSON.parse(fixTruncatedJson(partialJson));
      } catch (err) {
        // Final fallback
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
        model: "gemini-3-flash-preview",
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
                  CRITICAL: Provide a highly detailed, cinematic prompt for AI video generators. 
                  SCALING REQUIREMENT: 
                  - For short videos (8s - 60s), provide 2-4 highly dynamic scenes.
                  - For medium videos (1m - 5m), provide 5-10 detailed scenes.
                  - For long videos (10m - 60m), provide a comprehensive breakdown of 15-25 detailed chapters or segments that cover the entire duration of ${options.videoDuration} seconds. Focus on depth for each segment rather than excessive scene fragmenting to ensure the response completes successfully within token limits.
                  
                  The video prompt MUST be broken down into SCENES/SEGMENTS that correspond EXACTLY to the script's scenes in the 'sceneBreakdown'. 
                  Include specific details about:
                  1. Camera Angles & Movements: Incorporate "${options.cameraAngle || 'dynamic tracking shots, low-angle pans, or drone fly-throughs'}".
                  2. Lighting & Atmosphere: Incorporate "${options.lighting || 'cinematic neon lighting'} and ${options.mood || 'golden hour, or moody and atmospheric'}".
                  3. Specific Visual Sequences: Describe the exact action, pacing, and subject details. Ensure the motion is "${options.mood === 'Energetic' ? 'fast-paced and dynamic' : 'smooth and cinematic'}".
                  4. Pacing: Ensure the prompt aligns with the target duration and word count (${options.scriptWordCount || 'N/A'} words).
                  5. Visual Style: The overall aesthetic must be strictly "${options.visualStyle || 'photorealistic cinematic'}".)` : ""}
              - Thumbnail Idea: ${options.generateThumbnail}
              - Description: ${options.generateDescription}
              - Tags: ${options.generateTags}
              - Script: ${options.generateScript} ${options.scriptWordCount ? `(Target length: approximately ${options.scriptWordCount} words for a ${options.videoDuration}s video. 
                  DYNAMIC PACING & DEPTH:
                  - Total Duration: ${options.videoDuration} seconds.
                  - Target Word Count: ${options.scriptWordCount} words.
                  - Calculated speaking rate is ~${Math.round((options.scriptWordCount / (options.videoDuration || 60)) * 60)} words per minute.
                  - CRITICAL: For videos between 10m to 60m, you MUST generate a "LONG-FORM NARRATIVE STORY". This is NOT a summary. It is a full, minute-by-minute script.
                  - EXPANSION REQUIREMENT: Divide the script into at least 10 detailed chapters or sections. Each section must have substantial and engaging content to fill the time.
                  - Ensure the script timing matches ${options.videoDuration} seconds exactly. If the video is 50 minutes, the script MUST be long enough for a 50-minute professional narration.
                  
                  SCALES OF CONTENT:
                  - For short-form: High-energy hooks and fast transitions.
                  - For long-form (10-60 min): Extensive storytelling, detailed examples, sub-topics, and expert analysis.
                  - The script MUST be a professional production script including: 
                  1. Explicit vocal directions for every segment.
                  2. Engaging dialogue/voiceover that covers the ENTIRE duration.
                  3. Exact timestamps in the scene breakdown that span from 0:00 to ${Math.floor(options.videoDuration / 60)}:${(options.videoDuration % 60).toString().padStart(2, '0')}.)` : ""}
              - SEO Checklist: ${options.generateSeoChecklist} (A comprehensive YouTube SEO checklist including keyword research, title optimization, description best practices, tag strategy, thumbnail effectiveness, and end screen/card usage. Return as a structured list.)
              - Keyword Research: ${options.generateKeywords} (Provide a list of 10-15 relevant keywords for the topic. For each keyword, include an estimated 'searchVolume' (Low, Medium, High, or a number) and 'competition' (Low, Medium, High). Return as an array of objects.)
              
              Special Instruction for Content Type: If the Content Type is 'shorts', focus on high-energy, fast-paced vertical content. If it's 'thumbnail', provide detailed visual descriptions for a high-CTR thumbnail. If it's 'titleIdea', provide 5 catchy, viral-style titles. If it's 'description', provide an SEO-optimized video description. If it's 'fullScript', provide a comprehensive video script with scene details.
              
              Return the result as a strictly valid JSON object with keys: videoTitle, seoTitles, imagePrompt, videoPrompt, thumbnailIdea, description, tags, script, seoChecklist, keywords, sceneBreakdown. If a section is not requested, return null for that key. 
              
              - videoTitle: A catchy, SEO-optimized title for the video.
              - seoTitles: An array of 5 unique, SEO-friendly video title variations.
              - script: The FULL narrative script.
              - sceneBreakdown: An array of objects, each representing a scene or segment. For 10-60m videos, provide 15-25 detailed chapters/segments.
                CRITICAL: To avoid hitting token limits, the 'script' field inside 'sceneBreakdown' objects MUST only be a 1-sentence summary or reference to that segment from the main script. DO NOT repeat the full dialogue here.
                Each object MUST have:
                - 'scene': The scene number (1, 2, 3...).
                - 'time': The timestamp range (e.g., "0:00 - 0:10" or "45:00 - 45:15").
                - 'script': A short (10-15 words) summary of the dialogue for this scene.
                - 'visual': A comprehensive, cinematic visual prompt for AI video generators (like Runway Gen-3 or Sora). Include specific camera techniques (e.g., "Fpv drone shot", "Extreme close-up"), specific lighting ("Cinematic volumetric lighting"), and character actions that perfectly synchronize with the 'script'.
              
              CRITICAL: The number of scenes in 'sceneBreakdown' MUST match the total duration and the complexity of the topic. Each scene's 'script' and 'visual' MUST be perfectly synchronized.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any preamble, postamble, or explanation outside the JSON object. Ensure the JSON is valid and properly escaped.`;

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
      model: 'gemini-3.1-flash-image-preview',
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
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore',
  options?: { tone?: string; accent?: string; age?: string }
) => {
  let promptText = text;
  if (options && (options.tone || options.accent || options.age)) {
    const instructions = [
      options.tone && `${options.tone} tone`,
      options.age && `${options.age} age`,
      options.accent && `${options.accent} accent`
    ].filter(Boolean).join(', ');
    promptText = `Say in a ${instructions} voice: ${text}`;
  }

  if (isOffline) {
    return ""; 
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const rawData = atob(base64Audio);
      const buffer = new ArrayBuffer(44 + rawData.length);
      const view = new DataView(buffer);

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
      model: "gemini-3-flash-preview",
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
          model: "gemini-3-flash-preview",
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
      model: "gemini-3-flash-preview",
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
                 - SCALING: If the duration is ${videoDuration || 'longer than 10 minutes'} seconds, provide an "EXTENDED NARRATIVE" script with multiple detailed chapters.
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
              
              - 'script': The FULL extracted narrative script.
              - 'sceneBreakdown': An array of objects, with 'scene', 'time', 'script', and 'visual' keys. For 10-60m videos, provide 15-25 detailed segments. CRITICAL: To avoid token limits and truncated responses, the 'script' field within 'sceneBreakdown' MUST only be a 1-sentence summary of the dialogue. The full text should be in the top-level 'script' field.
              
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
      model: "gemini-3-flash-preview",
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
