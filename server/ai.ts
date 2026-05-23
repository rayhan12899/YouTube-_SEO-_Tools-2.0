import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const parseRetryDelay = (error: any): number => {
  try {
    // Check details for retryDelay
    const details = error?.details || [];
    const retryInfo = details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
    if (retryInfo?.retryDelay) {
      // Format is often "50s" or "50.4s"
      const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
      if (!isNaN(seconds)) return seconds * 1000;
    }
    
    // Look for message patterns like "retry in 14.39s"
    const message = error?.message || "";
    const match = message.match(/retry in ([\d.]+)s/);
    if (match && match[1]) {
      return parseFloat(match[1]) * 1000;
    }
  } catch (e) {
    console.error("Error parsing retry delay:", e);
  }
  return 0;
};

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

  // Backup models for fallback
  const modelsToTry = [
    "gemini-3.1-flash-tts-preview",
    "gemini-3.5-flash",
    "gemini-3.1-flash-live-preview",
    "gemini-2.0-flash-exp"
  ];

  for (let i = 0; i <= maxRetries; i++) {
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName, 
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
        if (base64Audio) return base64Audio;
        throw new Error("No audio data in response");

      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message || "";
        const isQuotaError = errorMsg.includes('429') || 
                            errorMsg.includes('RESOURCE_EXHAUSTED') ||
                            error?.status === 429;
        
        if (isQuotaError) {
          const suggestedDelay = parseRetryDelay(error);
          const isLimitZero = errorMsg.includes('limit: 0');

          if (suggestedDelay > 0 && !isLimitZero) {
              console.warn(`VoiceOver Quota exceeded for ${modelName}. API suggests waiting ${Math.round(suggestedDelay)}ms.`);
              await new Promise(resolve => setTimeout(resolve, suggestedDelay + 1000));
              continue; // Retry SAME model after suggested delay
          }
          console.warn(`VoiceOver Quota exceeded for ${modelName}${isLimitZero ? ' (limit: 0)' : ''}. Trying next model...`);
          continue; // Try next model in modelsToTry
        }
        
        // If it's a 404 (model not found) or 400 (modality not supported), also try next model
        if (errorMsg.includes('404') || error?.status === 404 || errorMsg.includes('400') || error?.status === 400) {
          console.warn(`VoiceOver model ${modelName} not found or doesn't support audio. Trying next...`);
          continue;
        }

        console.error(`Server VoiceOver Error (${modelName}):`, error);
        throw error;
      }
    }

    // If we've tried all models and still have quota error, wait and retry the whole loop
    if (i < maxRetries) {
      const delay = Math.pow(2, i) * 6000 + Math.random() * 2000;
      console.warn(`All VoiceOver models hit quota or failed. Retrying all in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const handleGenerateContent = async (model: string, prompt: any, config?: any) => {
  const maxRetries = 5;
  let lastError: any;

  // Cleanup model name to avoid 404s on deprecated models
  let activeModel = model || "gemini-3.5-flash";
  if (activeModel.includes("1.5") || activeModel.includes("2.0") || activeModel === "gemini-pro") {
    activeModel = "gemini-3.5-flash";
  }

  // Backup models to try if 429 or 404 occurs
  const fallbackModels = [
    "gemini-3.1-flash-lite", 
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash"
  ];
  let modelIndex = -1;

  for (let i = 0; i <= maxRetries; i++) {
    const currentModel = modelIndex === -1 ? activeModel : fallbackModels[modelIndex];
    
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: config,
      });
      return response.text;
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isQuotaError = errorMsg.includes('429') || 
                          errorMsg.includes('RESOURCE_EXHAUSTED') ||
                          error?.status === 429;
      
      // If we hit quota on the current model, try a fallback model if available
      if (isQuotaError || errorMsg.includes('404') || error?.status === 404 || errorMsg.includes('400') || error?.status === 400) {
        const suggestedDelay = parseRetryDelay(error);
        const isLimitZero = errorMsg.includes('limit: 0');
        
        if (isQuotaError && suggestedDelay > 0 && !isLimitZero) {
            console.warn(`Quota exceeded for ${currentModel}. API suggests waiting ${Math.round(suggestedDelay)}ms.`);
            await new Promise(resolve => setTimeout(resolve, suggestedDelay + 1000));
            i--; 
            continue;
        }

        if (modelIndex < fallbackModels.length - 1) {
          modelIndex++;
          if (isQuotaError) {
            console.warn(`Quota exceeded for ${currentModel}${isLimitZero ? ' (limit: 0)' : ''}. Trying fallback model ${fallbackModels[modelIndex]}...`);
          } else {
            console.warn(`Model ${currentModel} not found. Trying fallback model ${fallbackModels[modelIndex]}...`);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          i = -1; 
          continue;
        }

        if (isLimitZero) {
          const finalError = new Error("DAILY_QUOTA_EXHAUSTED");
          (finalError as any).status = 429;
          throw finalError;
        }

        if (isQuotaError && i < maxRetries) {
          const delay = Math.pow(2, i) * 8000 + Math.random() * 2000;
          console.warn(`All models hitting quota. Waiting ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          modelIndex = -1; 
          continue;
        }
      }
      
      console.error(`Server AI Error (${currentModel}):`, error);
      throw error;
    }
  }
  throw lastError;
};
