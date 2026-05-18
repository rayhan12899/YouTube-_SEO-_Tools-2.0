import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const handleVoiceOver = async (text: string, voiceName: string = 'Kore') => {
  // Map custom voice names to prebuilt ones
  const voiceMap: Record<string, string> = {
    'Mila': 'Zephyr',
    'Arif': 'Puck',
    'Sumi': 'Kore',
    'Rahat': 'Charon',
    'Rashed': 'Fenrir',
    'Aoide': 'Aoide'
  };

  const actualVoiceName = voiceMap[voiceName] || voiceName;
  const maxRetries = 5;
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", 
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: actualVoiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio;
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED') ||
                          error?.status === 429;
      
      if (isQuotaError && i < maxRetries) {
        // More aggressive wait: 5s, 10s, 20s, 40s...
        const delay = Math.pow(2, i) * 5000 + Math.random() * 2000;
        console.warn(`VoiceOver Quota exceeded. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error("Server VoiceOver Error:", error);
      throw error;
    }
  }
  throw lastError;
};

export const handleGenerateContent = async (model: string, prompt: any, config?: any) => {
  const maxRetries = 5;
  let lastError: any;

  // Cleanup model name to avoid 404s on deprecated models
  let activeModel = model || "gemini-2.0-flash";
  if (activeModel.includes("1.5-flash") || activeModel.includes("3-flash")) {
    activeModel = "gemini-2.0-flash";
  }

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: config,
      });
      return response.text;
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED') ||
                          error?.status === 429;
      
      if (isQuotaError && i < maxRetries) {
        // More aggressive wait: 5s, 10s, 20s, 40s...
        const delay = Math.pow(2, i) * 5000 + Math.random() * 2000;
        console.warn(`Quota exceeded for ${model}. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If we reach here, it's either not a quota error or we've exhausted retries
      console.error("Server AI Error:", error);
      throw error;
    }
  }
  throw lastError;
};
