import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Invalid input." });
    if (message.length > 2000) return res.status(400).json({ error: "Input too long." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key not configured." });

    const ai = new GoogleGenAI({ apiKey });
    
    const modelsToTry = [
      // "gemini-3-flash-preview",
      // "gemini-3.0-flash",       
      "gemini-2.5-flash",       
    ];

    let finalResponseText = "";
    let success = false;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: message,
          config: {
            systemInstruction: "You are the AEGIS Core Intelligence. Your tone is professional, high-tech, and slightly cold. You provide expert cybersecurity and technology advice. Keep responses concise and technical."
          }
        });

        if (response && response.text) {
          finalResponseText = response.text;
          success = true;
          break; 
        }
      } catch (modelError: any) {
        console.warn(`[AEGIS WARN] Model ${model} failed: ${modelError.message}`);
      }
    }

    if (success) {
      return res.json({ text: finalResponseText });
    } else {
      console.error("[AEGIS CRITICAL] Bütün yapay zeka modelleri çöktü.");
      return res.status(503).json({ error: "Tüm neural link bağlantıları şu an meşgul. Lütfen daha sonra tekrar deneyin." });
    }

  } catch (error) {
    console.error("[AEGIS ERROR] Beklenmeyen sistem hatası:", error);
    res.status(500).json({ error: "Neural link failure. Core dump saved." });
  }
});

export default router;