import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dns from "dns";
import tls from "tls";
import { promisify } from "util";
import https from "https";

const resolveAny = promisify(dns.resolveAny);
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://static.cloudflareinsights.com", "https://pagead2.googlesyndication.com", "https://partner.googleadservices.com", "https://adservice.google.com", "https://www.googletagservices.com", "https://*.adtrafficquality.google"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https://picsum.photos", "https://grainy-gradients.vercel.app", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://*.doubleclick.net", "https://www.google.com", "https://*.adtrafficquality.google"],
          "connect-src": ["'self'", "ws:", "wss:", "https://*.run.app", "http://ip-api.com", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com", "https://*.adtrafficquality.google", "https://www.google-analytics.com"],
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
  });

  app.use("/api/", limiter);
  app.use(express.json({ limit: "1mb" }));

  // --- AI Endpoint ---
  app.post("/api/ai", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") return res.status(400).json({ error: "Invalid input." });
      if (message.length > 2000) return res.status(400).json({ error: "Input too long." });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key not configured." });

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction: "You are the AEGIS Core Intelligence. Your tone is professional, high-tech, and slightly cold. You provide expert cybersecurity and technology advice. Keep responses concise and technical."
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      res.status(500).json({ error: "Neural link failure." });
    }
  });

  // --- Tool Endpoints ---

  // 1. IP Geolocation Proxy
  app.get("/api/tools/ip/:ip", async (req, res) => {
    try {
      const response = await fetch(`http://ip-api.com/json/${req.params.ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "IP lookup failed." });
    }
  });

  // 2. DNS Lookup
app.get("/api/tools/dns/:domain", (req, res) => {
  const cleanDomain = req.params.domain.trim().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  https.get(`https://dns.google/resolve?name=${cleanDomain}&type=A`, (apiRes) => {
    let rawData = '';
    apiRes.on('data', (chunk) => { rawData += chunk; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(rawData);
        const records = (data.Answer || []).map((ans: any) => ({
          type: 'A',
          address: ans.data,
          ttl: ans.TTL
        }));
        res.json({ records });
      } catch (e) {
        res.status(500).json({ error: "Parse error", details: "Google DNS format mismatch" });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: "API error", details: err.message });
  });
});

  // 3. SSL Check
  app.get("/api/tools/ssl/:domain", (req, res) => {
    const domain = req.params.domain.replace(/^https?:\/\//, '').split('/')[0];
    try {
      const socket = tls.connect(443, domain, { servername: domain }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (cert && Object.keys(cert).length > 0) {
          res.json({
            subject: cert.subject,
            issuer: cert.issuer,
            valid_from: cert.valid_from,
            valid_to: cert.valid_to,
            fingerprint: cert.fingerprint,
            serialNumber: cert.serialNumber
          });
        } else {
          res.status(404).json({ error: "No SSL certificate found." });
        }
      });
      socket.on('error', (err) => {
        res.status(500).json({ error: "SSL connection failed: " + err.message });
      });
      socket.setTimeout(5000, () => {
        socket.destroy();
        res.status(500).json({ error: "SSL check timed out." });
      });
    } catch (error) {
      res.status(500).json({ error: "SSL check failed." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AEGIS CORE online at http://localhost:${PORT}`);
  });
}

startServer();
