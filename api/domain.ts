import { Router } from "express";
import tls from "node:tls";
import dns from "node:dns/promises";

const router = Router();

// ─── SSRF Protection ──────────────────────────────────────────────
function isPrivateIp(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // IPv4 private/reserved ranges
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|100\.(6[4-9]|[7-9]\d|1[0-2]\d)\.|198\.1[89]\.|198\.51\.100\.|203\.0\.113\.|224\.|240\.)/.test(normalized)) return true;

  // IPv6 private/reserved ranges
  if (/^(::1$|::$|fe80:|fc|fd|ff0[0-9a-f]:)/.test(normalized)) return true;

  // IPv4-mapped IPv6 (::ffff:x.x.x.x) — recursively check the v4 part
  const v4MappedMatch = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4MappedMatch) return isPrivateIp(v4MappedMatch[1]);

  return false;
}

// Google DNS-over-HTTPS (DoH) API — A/AAAA kayıtlarında private IP filtresi uygulanır
async function resolveDns(domain: string, type: string) {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    const answers = data.Answer || [];

    // A ve AAAA kayıtları için private/reserved IP'leri filtrele
    if (type === "A" || type === "AAAA") {
      return answers.filter((record: any) => {
        if (isPrivateIp(record.data)) {
          console.warn(`[AEGIS SSRF] Filtered private IP ${record.data} from ${type} record of ${domain}`);
          return false;
        }
        return true;
      });
    }

    return answers;
  } catch (error: any) {
    console.error(`[AEGIS DNS ERROR] Failed resolving ${type} for ${domain}:`, error?.message || "Unknown error");
    throw new Error("DNS_RESOLUTION_FAILED");
  }
}

// SSL sertifika bilgisini çeken yardımcı fonksiyon
async function checkSsl(domain: string): Promise<any> {
  // SSRF koruması: DNS çözümle, private IP'ye bağlanmayı engelle (IPv4 + IPv6)
  const [v4Addresses, v6Addresses] = await Promise.all([
    dns.resolve4(domain).catch(() => []),
    dns.resolve6(domain).catch(() => []),
  ]);
  const addresses = [...v4Addresses, ...v6Addresses];
  if (addresses.length === 0) {
    throw new Error("Domain could not be resolved");
  }
  if (addresses.some(isPrivateIp)) {
    throw new Error("Domain resolves to a private/reserved IP address");
  }

  const ip = addresses[0];

  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, ip, { servername: domain, timeout: 5000 }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || !cert.subject) {
        socket.destroy();
        return reject(new Error("No certificate returned"));
      }

      resolve({
        subject: cert.subject.CN || cert.subject.O || domain,
        issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        serialNumber: cert.serialNumber,
        protocol: socket.getProtocol(),
        fingerprint: cert.fingerprint256 || cert.fingerprint,
      });

      socket.destroy();
    });

    socket.on("error", (err) => reject(err));
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Connection timed out"));
    });
  });
}

// SSL sertifika kontrolü
router.get("/ssl/:domain", async (req, res) => {
  try {
    const domain = req.params.domain?.trim();

    const domainRegex = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/;
    if (!domain || !domainRegex.test(domain)) {
      return res.status(400).json({ status: "fail", message: "Invalid domain format." });
    }

    const sslData = await checkSsl(domain);
    return res.json({ status: "success", ...sslData });

  } catch (error: any) {
    console.error("[AEGIS ERROR] SSL check failed:", error?.message || "Unknown error");
    return res.status(500).json({
      status: "fail",
      message: "SSL handshake failed.",
    });
  }
});

// DNS kayıt analizi
router.get("/:domain", async (req, res) => {
  try {
    const domain = req.params.domain?.trim();

    if (!domain) {
      return res.status(400).json({ status: "fail", message: "Target domain missing." });
    }

    const domainRegex = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ status: "fail", message: "Invalid domain format." });
    }

    const results: any = {
      query: domain,
      status: "success",
      records: { A: [], AAAA: [], MX: [], TXT: [], NS: [], DMARC: [] }
    };

    const [aData, aaaaData, mxData, txtData, nsData, dmarcData] = await Promise.all([
      resolveDns(domain, "A"),
      resolveDns(domain, "AAAA"),
      resolveDns(domain, "MX"),
      resolveDns(domain, "TXT"),
      resolveDns(domain, "NS"),
      resolveDns(`_dmarc.${domain}`, "TXT")
    ]);

    results.records.A = aData.map((r: any) => r.data);
    results.records.AAAA = aaaaData.map((r: any) => r.data);

    results.records.MX = mxData.map((r: any) => {
      const parts = r.data.split(' ');
      return {
        priority: parseInt(parts[0], 10) || 0,
        exchange: parts[1] || r.data
      };
    }).sort((a: any, b: any) => a.priority - b.priority);

    results.records.TXT = txtData.map((r: any) => r.data.replace(/(^"|"$)/g, ''));
    results.records.NS = nsData.map((r: any) => r.data);
    results.records.DMARC = dmarcData.map((r: any) => r.data.replace(/(^"|"$)/g, ''));

    const hasAnyRecord = Object.values(results.records).some((arr: any) => arr.length > 0);
    if (!hasAnyRecord) {
      return res.status(404).json({
        status: "fail",
        message: "No DNS records found. Domain might be inactive.",
        query: domain
      });
    }

    return res.json(results);

  } catch (error: any) {
    console.error(`[AEGIS FATAL] DoH Analyzer error for ${req.params.domain}:`, error?.message || "Unknown error");

    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. DoH resolution failed or target is unreachable.",
      query: req.params.domain
    });
  }
});

export default router;