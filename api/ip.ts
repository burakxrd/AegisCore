import { Router } from "express";

const router = Router();

router.get("/:ip", async (req, res) => {
  try {
    const { ip } = req.params;

    if (!ip) {
      return res.status(400).json({ status: "fail", message: "IP address missing." });
    }

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) {
      return res.status(400).json({ status: "fail", message: "Invalid IP format." });
    }

    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({
        status: "fail",
        message: "IP adresi bulunamadı veya geçersiz.",
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
      hostname: data.hostname, // <--- YENİ: Ters DNS kaydı (hostname)
      query: data.ip
    };

    return res.json(formattedData);

  } catch (error) {
    console.error("[AEGIS ERROR] IPinfo.io Sorgulama hatası:", error);
    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. Unable to resolve IP.",
      query: req.params.ip
    });
  }
});

export default router;