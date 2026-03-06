import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import { get } from "https";

dotenv.config();

const logger = {
  info: (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  ai: (msg: string) => console.log(`\x1b[35m[AI]\x1b[0m ${msg}`),
};

const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const path = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${req.method}]\x1b[0m ${path} - ${status} (${duration}ms)`);
  });
  
  next();
};

async function startServer() {
  if (!process.env.GEMINI_API_KEY) {
    logger.error("GEMINI_API_KEY is not set in .env file");
    logger.warn("AI endpoint will not function without API key");
    process.exit(1);
  }

  logger.info("Initializing AEGIS CORE server...");

  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  logger.error(`Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

  app.use(compression());

  app.set("trust proxy", 1);

  app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5');
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://static.cloudflareinsights.com", "https://pagead2.googlesyndication.com", "https://partner.googleadservices.com", "https://adservice.google.com", "https://www.googletagservices.com", "https://*.adtrafficquality.google"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https://picsum.photos", "https://grainy-gradients.vercel.app", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://*.doubleclick.net", "https://www.google.com", "https://*.adtrafficquality.google"],
          "connect-src": ["'self'", "ws:", "wss:", "https://*.run.app", "https://dns.google", "http://ip-api.com", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com", "https://*.adtrafficquality.google", "https://www.google-analytics.com"],
          "frame-src": ["'self'", "https://googleads.g.doubleclick.net", "https://*.adtrafficquality.google", "https://tpc.googlesyndication.com", "https://www.google.com", "https://*.googlesyndication.com", "https://*.doubleclick.net"],
        },
      },
    })
  );

  const allowedOrigins = [
    process.env.APP_URL,
    "http://localhost:3000",
  ].filter(Boolean).map(url => url?.replace(/\/$/, "")) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.endsWith(".run.app")) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from: ${origin}`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }));

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { error: "Too many requests. Neural link throttled." },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded from IP: ${req.ip}`);
      res.status(429).json({ error: "Too many requests. Neural link throttled." });
    },
  });

  app.use("/api/", limiter);
  app.use(express.json({ limit: "1mb" }));

  app.use(requestLogger);

  let aiInstance: GoogleGenAI | null = null;

const getAIInstance = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY!;
    aiInstance = new GoogleGenAI({ apiKey }); 
    logger.success("AI model instance initialized (GenAI SDK)");
  }
  return aiInstance;
};
  
app.post("/api/ai", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Invalid input." });
    if (message.length > 2000) return res.status(400).json({ error: "Input too long." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key not configured." });

    const ai = new GoogleGenAI({ apiKey });
    
    const modelsToTry = [
      "gemini-3-flash-preview",
      "gemini-3.0-flash",       
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
      } catch (modelError) {
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

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "operational", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    logger.info("Running in DEVELOPMENT mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Running in PRODUCTION mode");
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
    res.status(500).json({ error: "Internal server error" });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("\n");
    logger.success("═══════════════════════════════════════");
    logger.success("    🚀 AEGIS CORE ONLINE");
    logger.success("═══════════════════════════════════════");
    logger.info(`    Server: http://localhost:${PORT}`);
    logger.info(`    Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.ai(`    AI Endpoint: POST /api/ai`);
    logger.info(`    Health Check: GET /api/health`);
    logger.success("═══════════════════════════════════════\n");
  });

  process.on('SIGTERM', () => {
    logger.warn("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      logger.success("Server closed");
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.warn("\nSIGINT received, shutting down gracefully...");
    server.close(() => {
      logger.success("Server closed");
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

function getAI() {
  throw new Error("Function not implemented.");
}
