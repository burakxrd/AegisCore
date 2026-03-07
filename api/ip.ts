import { Router } from "express";

const router = Router();

const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

function isValidIp(ip: string): boolean {
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Kullanıcının gerçek public IP'sini döndüren endpoint
router.get("/me", async (req, res) => {
  try {
    // Harici servis ile gerçek public IP'yi al (localhost'ta da çalışır)
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();

    if (ipData.ip) {
      return res.json({ status: "success", ip: ipData.ip });
    }

    // Fallback: Express'in algıladığı client IP
    let clientIp = (req.ip || req.socket.remoteAddress || "").replace(/^::ffff:/, "");
    return res.json({ status: "success", ip: clientIp || "unknown" });
  } catch (error) {
    console.error("[AEGIS ERROR] IP detection failed:", error);
    return res.status(500).json({ status: "fail", message: "IP detection failed." });
  }
});

router.get("/:ip", async (req, res) => {
  try {
    const { ip } = req.params;

    if (!ip) {
      return res.status(400).json({ status: "fail", message: "IP address missing." });
    }

    if (!isValidIp(ip)) {
      return res.status(400).json({ status: "fail", message: "Invalid IP format." });
    }

    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({
        status: "fail",
        message: "IP not found or invalid.",
        query: ip
      });
    }

    const [lat, lon] = data.loc ? data.loc.split(',') : [null, null];

    const formattedData = {
      status: "success",
      country: data.country,
      countryCode: data.country,
      regionName: data.region,
      city: data.city,
      zip: data.postal,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      timezone: data.timezone,
      isp: data.org,
      org: data.org,
      as: data.org,
      hostname: data.hostname,
      query: data.ip
    };

    return res.json(formattedData);

  } catch (error) {
    console.error("[AEGIS ERROR] IPinfo.io query failed:", error);
    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. Unable to resolve IP.",
      query: req.params.ip
    });
  }
});

export default router;