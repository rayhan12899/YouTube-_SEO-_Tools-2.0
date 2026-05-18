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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
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
  } catch (error) {
    console.error("Server VoiceOver Error:", error);
    throw error;
  }
};

export const handleGenerateContent = async (model: string, prompt: any, config?: any) => {
  try {
    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: prompt,
      config: config,
    });
    return response.text;
  } catch (error) {
    console.error("Server AI Error:", error);
    throw error;
  }
};
