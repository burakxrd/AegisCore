# DNS Records Explained: A Complete Guide to Domain Name System

> **CLASSIFICATION:** Technical Documentation
> **RELATED TOOL:** [Domain Analyzer →](/tools/domain-analyzer)

---

## What Is DNS?

The **Domain Name System (DNS)** is often called the "phone book of the internet." It translates human-readable domain names like `google.com` into machine-readable IP addresses like `142.250.185.14`. Without DNS, you would need to memorize numeric addresses for every website you visit.

When you type a URL into your browser, a DNS query is sent to a **recursive resolver**, which then queries **authoritative name servers** to find the correct IP address. This entire process — called **DNS resolution** — typically happens in under 50 milliseconds.

## Types of DNS Records

DNS doesn't just map domains to IP addresses. It stores multiple types of records, each serving a specific purpose:

### A and AAAA Records (Address Records)

These are the most fundamental DNS records. An **A record** maps a domain to an **IPv4** address, while an **AAAA record** maps it to an **IPv6** address. A single domain can have multiple A/AAAA records for load balancing and redundancy.

### MX Records (Mail Exchange)

**MX records** specify which mail servers are responsible for receiving email on behalf of the domain. Each MX record includes a **priority value** — lower numbers indicate higher priority. This allows organizations to configure primary and fallback mail servers.

### NS Records (Name Server)

**NS records** identify the authoritative name servers for a domain. These servers hold the definitive DNS records for the domain and respond to queries from recursive resolvers.

### TXT Records (Text)

**TXT records** store arbitrary text data and serve multiple critical security functions:

- **SPF (Sender Policy Framework)** — Specifies which IP addresses are authorized to send email on behalf of the domain, preventing email spoofing.
- **DKIM (DomainKeys Identified Mail)** — Publishes cryptographic public keys used to verify email signatures.
- **DMARC (Domain-based Message Authentication)** — Defines policies for handling emails that fail SPF or DKIM checks.
- **Domain Verification** — Used by services like Google and Microsoft to verify domain ownership.

## DNS and Security

DNS is a fundamental attack vector in cybersecurity. Common threats include:

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **DNS Spoofing** | Injecting false DNS responses to redirect traffic | DNSSEC validation |
| **DNS Hijacking** | Compromising DNS settings to redirect queries | Monitor NS records, use registrar locks |
| **DNS Tunneling** | Encoding data in DNS queries to bypass firewalls | Monitor query anomalies |
| **Zone Transfer Leaks** | Unauthorized access to complete DNS zone data | Restrict AXFR to authorized servers |

Implementing **SPF**, **DKIM**, and **DMARC** records is considered baseline security hygiene for any domain. Our **Domain Analyzer** automatically checks for these records and reports their status.

## Analyze Your Domain

Use our **[Domain Analyzer](/tools/domain-analyzer)** to perform comprehensive DNS lookups, inspect SSL certificates, and evaluate the security posture of any domain — all from a single interface.

---

> **📌 NOTE:** DNS records are public by design — querying them is a standard diagnostic practice, not an intrusion. Always use DNS analysis tools for legitimate purposes such as troubleshooting, security auditing, or infrastructure planning.
