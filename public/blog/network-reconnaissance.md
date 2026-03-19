# Network Reconnaissance: Techniques Used by Attackers and Defenders

**Classification:** PUBLIC  
**Category:** Offensive Security  
**Reading Time:** 4 min

---

## What Is Network Reconnaissance?

Network reconnaissance is the process of gathering information about a target network to identify potential vulnerabilities and attack vectors. It is the first phase of any penetration test or cyberattack, often referred to as the "information gathering" stage in the Cyber Kill Chain.

Both attackers and security professionals use the same reconnaissance techniques — the difference lies in authorization and intent.

## Passive Reconnaissance

Passive reconnaissance involves gathering information without directly interacting with the target, making it virtually undetectable.

### OSINT (Open Source Intelligence)

- **WHOIS lookups** — Reveal domain registration details, registrar information, and sometimes contact details
- **DNS enumeration** — Querying public DNS records (A, AAAA, MX, NS, TXT) reveals the target's infrastructure, mail servers, and service providers
- **Certificate Transparency logs** — Public databases of issued SSL certificates can reveal subdomains and infrastructure
- **Search engine dorking** — Advanced search operators can uncover exposed files, login pages, and misconfigured servers
- **Social media analysis** — Employee profiles, job postings, and company pages reveal technology stacks and organizational structure

### Shodan and Censys

These search engines index internet-connected devices and services, allowing researchers to discover exposed services, default configurations, and vulnerable systems without scanning the target directly.

## Active Reconnaissance

Active reconnaissance directly interacts with the target and may trigger security alerts.

### Port Scanning

Tools like **Nmap** probe target systems to identify open ports and running services. Common scan types include:

- **TCP SYN scan** — Sends SYN packets and analyzes responses without completing connections
- **TCP Connect scan** — Completes full TCP handshakes (more detectable)
- **UDP scan** — Probes UDP ports, which are often overlooked but can expose services like DNS, SNMP, and DHCP
- **Service version detection** — Identifies specific software and versions running on open ports

### Vulnerability Scanning

Automated scanners like **Nessus**, **OpenVAS**, and **Qualys** test discovered services against databases of known vulnerabilities, producing reports that prioritize risks by severity.

### Web Application Reconnaissance

- **Directory brute forcing** — Tools like **Gobuster** discover hidden pages and directories
- **Technology fingerprinting** — Tools like **Wappalyzer** identify web frameworks, CMS platforms, and JavaScript libraries
- **API discovery** — Identifying undocumented API endpoints that may lack proper authentication

## Defensive Measures

1. **Minimize your attack surface** — Disable unnecessary services and close unused ports
2. **Monitor for reconnaissance activity** — Watch for sequential port scans, high volumes of DNS queries, and repeated failed login attempts
3. **Implement rate limiting** — Throttle requests from individual IP addresses
4. **Use honeypots** — Deploy decoy systems to detect and study attacker behavior

---

*Practice legitimate reconnaissance with Aegis Core's tools: [IP Intelligence](/tools/ip-intelligence) for IP analysis, [Domain Analyzer](/tools/domain-analyzer) for DNS and SSL inspection, and [Hash Generator](/tools/hash-generator) for file verification.*
