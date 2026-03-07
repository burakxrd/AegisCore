import { Router } from "express";

const router = Router();

// Google DNS-over-HTTPS (DoH) API ile filtresiz sorgu
async function resolveDns(domain: string, type: string) {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
    const data = await response.json();
    return data.Answer || [];
  } catch (e) {
    return [];
  }
}

router.get("/:domain", async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({ status: "fail", message: "Target domain missing." });
    }

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ status: "fail", message: "Invalid domain format." });
    }

    const results: any = {
      query: domain,
      status: "success",
      records: { A: [], AAAA: [], MX: [], TXT: [], NS: [] }
    };

    // Bütün sorguları aynı anda (paralel) atarak API'yi inanılmaz hızlandırıyoruz
    const [aData, aaaaData, mxData, txtData, nsData] = await Promise.all([
      resolveDns(domain, "A"),
      resolveDns(domain, "AAAA"),
      resolveDns(domain, "MX"),
      resolveDns(domain, "TXT"),
      resolveDns(domain, "NS")
    ]);

    // Gelen verileri React önyüzünün beklediği temiz formata çeviriyoruz
    results.records.A = aData.map((r: any) => r.data);
    results.records.AAAA = aaaaData.map((r: any) => r.data);

    // Google DoH, MX verisini "10 mail.example.com." gibi tek metin döner. Önceliği ve adresi ayırıyoruz.
    results.records.MX = mxData.map((r: any) => {
      const parts = r.data.split(' ');
      return {
        priority: parseInt(parts[0], 10) || 0,
        exchange: parts[1] || r.data
      };
    }).sort((a: any, b: any) => a.priority - b.priority);

    // TXT kayıtları tırnak işaretleriyle gelir, başındaki ve sonundaki tırnakları siliyoruz
    results.records.TXT = txtData.map((r: any) => r.data.replace(/(^"|"$)/g, ''));

    results.records.NS = nsData.map((r: any) => r.data);

    // Eğer hiçbir kayıt dönmediyse domain ölüdür
    const hasAnyRecord = Object.values(results.records).some((arr: any) => arr.length > 0);
    if (!hasAnyRecord) {
      return res.status(404).json({
        status: "fail",
        message: "No DNS records found. Domain might be inactive.",
        query: domain
      });
    }

    return res.json(results);

  } catch (error) {
    console.error("[AEGIS ERROR] DoH Analyzer hatası:", error);
    return res.status(500).json({
      status: "fail",
      message: "Uplink severed. DoH resolution failed.",
      query: req.params.domain
    });
  }
});

export default router;