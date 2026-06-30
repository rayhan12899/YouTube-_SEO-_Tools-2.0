import { GoogleGenAI } from "@google/genai";
async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: "Hello" }] }],
      config: {
        responseModalities: ["AUDIO"],
      }
    });
    console.log("Success:", response.candidates[0]?.content?.parts[0] ? "Audio found" : "No audio");
  } catch (e: any) {
    console.error("Error:", e?.message);
  }
}
run();
