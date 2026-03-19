# SSL/TLS Explained: How HTTPS Keeps Your Data Secure

**Classification:** PUBLIC  
**Category:** Encryption  
**Reading Time:** 4 min

---

## What Are SSL and TLS?

SSL (Secure Sockets Layer) and TLS (Transport Layer Security) are cryptographic protocols designed to provide secure communication over a computer network. TLS is the successor to SSL, and although the term "SSL" is still widely used, virtually all modern secure connections use TLS 1.2 or TLS 1.3.

When you see HTTPS in your browser's address bar, it means the connection between your browser and the server is encrypted using TLS.

## How the TLS Handshake Works

Every secure connection begins with a TLS handshake — a negotiation process between the client and server:

1. **Client Hello** — The client sends its supported TLS versions, cipher suites, and a random number
2. **Server Hello** — The server responds with its chosen TLS version, cipher suite, and its digital certificate
3. **Certificate Verification** — The client verifies the server's certificate against trusted Certificate Authorities (CAs)
4. **Key Exchange** — Both parties use asymmetric encryption to establish a shared secret key
5. **Secure Connection** — All subsequent data is encrypted using the shared symmetric key

TLS 1.3 simplified this process from a two-round-trip handshake to a single round trip, significantly reducing latency.

## Certificate Types

### Domain Validation (DV)

The most basic certificate type, DV certificates only verify that the applicant controls the domain. They are issued automatically and provide encryption but no identity verification. Let's Encrypt provides free DV certificates.

### Organization Validation (OV)

OV certificates require the CA to verify the organization's identity, including its legal name and location. They provide a moderate level of trust.

### Extended Validation (EV)

EV certificates require the most thorough vetting process, including verification of the organization's legal existence, physical address, and operational status. They previously displayed a green bar in browsers, though most modern browsers have removed this visual indicator.

## Common SSL/TLS Vulnerabilities

- **Expired Certificates** — A certificate past its validity date triggers browser warnings and erodes user trust
- **Weak Cipher Suites** — Using outdated algorithms like RC4 or 3DES exposes connections to cryptographic attacks
- **Mixed Content** — Loading HTTP resources on an HTTPS page weakens the security of the entire page
- **Protocol Downgrade Attacks** — Attackers force a connection to use an older, vulnerable protocol version

## Best Practices

1. Use **TLS 1.3** wherever possible — it is faster and more secure than older versions
2. Enable **HSTS** (HTTP Strict Transport Security) to prevent protocol downgrade attacks
3. Monitor certificate expiration dates and automate renewals
4. Disable support for SSL 3.0, TLS 1.0, and TLS 1.1

---

*Aegis Core's [Domain Analyzer](/tools/domain-analyzer) can inspect your website's SSL certificate, including protocol version, issuer, expiration date, and wildcard status.*
