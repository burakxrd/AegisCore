import { Router } from "express";
import net from "node:net";

const router = Router();

function isValidIp(ip: string): boolean {
  return net.isIPv4(ip) || net.isIPv6(ip);
}

// ─── In-Memory IP Cache ──────────────────────────────────────────
// ip-api.com ücretsiz plan: sunucu IP'si başına 45 istek/dk.
// Birden fazla kullanıcı aynı IP'yi sorgularsa, cache sayesinde
// dış servise gereksiz istek atılmaz ve rate limit korunur.

interface CacheEntry {
  data: any;
  timestamp: number;
}

const IP_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat
const CACHE_MAX_SIZE = 500;           // Max cache girişi (bellek koruması)

function getCachedIp(ip: string): any | null {
  const entry = IP_CACHE.get(ip);
  if (!entry) return null;

  // TTL dolmuşsa sil
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    IP_CACHE.delete(ip);
    return null;
  }

  return entry.data;
}

function setCachedIp(ip: string, data: any): void {
  // LRU benzeri eviction: max boyuta ulaşınca en eski girişi sil
  if (IP_CACHE.size >= CACHE_MAX_SIZE) {
    const oldestKey = IP_CACHE.keys().next().value;
    if (oldestKey) IP_CACHE.delete(oldestKey);
  }
  IP_CACHE.set(ip, { data, timestamp: Date.now() });
}

// MY IP detection is handled client-side (direct fetch to api.ipify.org)

router.get("/:ip", async (req, res) => {
  try {
    const { ip } = req.params;

    if (!ip) {
      return res.status(400).json({ status: "fail", message: "IP address missing." });
    }

    if (!isValidIp(ip)) {
      return res.status(400).json({ status: "fail", message: "Invalid IP format." });
    }

    // Cache kontrolü — daha önce sorgulanan IP varsa dış servise istek atma
    const cached = getCachedIp(ip);
    if (cached) {
      return res.json(cached);
    }

    // ip-api.com provides ISP, ASN, hosting/proxy/mobile detection for free
    const fields = "status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,as,reverse,hosting,proxy,mobile,query";
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);
    const data = await response.json();

    if (response.status === 429 || (data.status === "fail" && data.message?.toLowerCase().includes("rate limit"))) {
      return res.status(429).json({
        status: "fail",
        message: "Uplink rate limit exceeded. Neural query throttled. Please try again soon.",
        query: ip
      });
    }

    if (data.status === "fail") {
      return res.status(404).json({
        status: "fail",
        message: data.message || "IP not found or invalid.",
        query: ip
      });
    }

    const formattedData = {
      status: "success",
      country: data.country,
      countryCode: data.countryCode,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp || "N/A",
      as: data.as || "UNKNOWN",
      hostname: data.reverse || undefined,
      query: data.query,
      // Privacy detection
      hosting: data.hosting ?? false,
      proxy: data.proxy ?? false,
      mobile: data.mobile ?? false,
    };

    // Başarılı sonucu cache'e yaz
    setCachedIp(ip, formattedData);

    return res.json(formattedData);

  } catch (error) {
    console.error("[AEGIS ERROR] IP API query failed:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. Unable to resolve IP.",
      query: req.params.ip
    });
  }
});

export default router;