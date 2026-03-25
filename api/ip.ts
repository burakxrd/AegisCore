import { Router } from "express";
import net from "node:net";

const router = Router();

function isValidIp(ip: string): boolean {
  return net.isIPv4(ip) || net.isIPv6(ip);
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

    // ip-api.com provides ISP, ASN, hosting/proxy/mobile detection for free
    const fields = "status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,as,reverse,hosting,proxy,mobile,query";
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);
    const data = await response.json();

    if (data.status === "fail") {
      if (data.message && data.message.includes("rate limit")) {
        return res.status(429).json({
          status: "fail",
          message: "Uplink rate limit exceeded. Neural query throttled. Please try again soon.",
          query: ip
        });
      }
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

    return res.json(formattedData);

  } catch (error) {
    console.error("[AEGIS ERROR] IP API query failed:", error);
    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. Unable to resolve IP.",
      query: req.params.ip
    });
  }
});

export default router;