import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

let ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Invalid input." });
    if (message.length > 2000) return res.status(400).json({ error: "Input too long." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key not configured." });

    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = [
      //  "gemini-3-flash-preview",
      "gemini-3.0-flash",
      // "gemini-2.5-flash",
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
      console.error("[AEGIS CRITICAL] AI model returned empty response.");
      return res.status(503).json({ error: "Neural link returned no response. Please try again." });
    }

  } catch (error: any) {
    console.error("[AEGIS ERROR] AI request failed:", error.message);
    res.status(500).json({ error: "Neural link failure. Core dump saved." });
  }
});

export default router;