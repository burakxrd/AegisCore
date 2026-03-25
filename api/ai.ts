import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Non-streaming endpoint (kept as fallback)
router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Invalid input." });
    if (message.length > 2000) return res.status(400).json({ error: "Input too long." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key not configured." });

    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = [
      // "gemini-3-flash-preview",
      "gemini-2.5-flash"
    ];

    let finalResponseText = "";
    let success = false;

    for (const model of modelsToTry) {
      try {
        const contents = [];
        if (history && Array.isArray(history)) {
          for (const msg of history) {
            contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
          }
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
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