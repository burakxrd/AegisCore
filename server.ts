import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import aiRoutes from "./api/ai";
import ipRoutes from "./api/ip";
import dns from "node:dns";
import domainRoutes from "./api/domain";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

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
  }

  logger.info("Initializing AEGIS CORE server...");

  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    logger.error(`Invalid PORT: ${process.env.PORT}`);
    process.exit(1);
  }

  app.use(compression());

  // app.set("trust proxy", 1); // Removed: prevents X-Forwarded-For spoofing if not behind a trusted proxy

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
          "script-src": process.env.NODE_ENV === "production"
            ? ["'self'", "'unsafe-inline'", "https://cloudflareinsights.com", "https://static.cloudflareinsights.com", "https://pagead2.googlesyndication.com", "https://partner.googleadservices.com", "https://adservice.google.com", "https://www.googletagservices.com", "https://*.adtrafficquality.google", "https://www.googletagmanager.com"]
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cloudflareinsights.com", "https://static.cloudflareinsights.com", "https://pagead2.googlesyndication.com", "https://partner.googleadservices.com", "https://adservice.google.com", "https://www.googletagservices.com", "https://*.adtrafficquality.google", "https://www.googletagmanager.com"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https://picsum.photos", "https://grainy-gradients.vercel.app", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://*.doubleclick.net", "https://www.google.com", "https://*.adtrafficquality.google"],
          "connect-src": ["'self'", "ws:", "wss:", "https://*.run.app", "https://cloudflareinsights.com", "https://dns.google", "http://ip-api.com", "https://api.ipify.org", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com", "https://*.adtrafficquality.google", "https://www.google-analytics.com"],
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

  const createLimiter = (max: number, message: string) => rateLimit({
    windowMs: 1 * 60 * 1000,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded from IP: ${req.ip}`);
      res.status(429).json({ error: message });
    },
  });

  const aiLimiter = createLimiter(15, "Too many AI requests. Neural link throttled.");
  const toolsLimiter = createLimiter(40, "Too many tool requests. Please wait a minute.");
  app.use(express.json({ limit: "1mb" }));

  app.use(requestLogger);


  // api calls
  app.use("/api/ai", aiLimiter, aiRoutes);
  app.use("/api/tools/ip", toolsLimiter, ipRoutes);
  app.use("/api/tools/domain", toolsLimiter, domainRoutes);

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
    app.use(express.static("dist", {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
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
