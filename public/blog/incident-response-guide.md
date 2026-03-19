# Incident Response: A Step-by-Step Guide for Security Teams

**Classification:** PUBLIC  
**Category:** Security Operations  
**Reading Time:** 4 min

---

## What Is Incident Response?

Incident Response (IR) is the organized approach to detecting, containing, and recovering from cybersecurity incidents. A well-prepared incident response plan can mean the difference between a minor security event and a catastrophic data breach. The NIST (National Institute of Standards and Technology) framework defines four phases of incident response.

## Phase 1: Preparation

Preparation is the most critical phase, yet often the most neglected. Before any incident occurs, organizations should:

- **Establish an IR team** with clearly defined roles and responsibilities
- **Create and maintain an IR plan** that documents procedures for different incident types
- **Deploy monitoring tools** such as SIEM (Security Information and Event Management) systems, EDR solutions, and network monitoring
- **Conduct tabletop exercises** — simulate incidents to test the team's readiness and identify gaps
- **Maintain an asset inventory** — you cannot protect what you don't know exists

## Phase 2: Detection and Analysis

This phase involves identifying potential security incidents and determining their scope and severity:

- **Monitor alerts** from security tools (IDS/IPS, firewalls, EDR)
- **Correlate events** across multiple data sources to distinguish real incidents from false positives
- **Classify the incident** based on severity (Critical, High, Medium, Low)
- **Document everything** — maintain a detailed timeline of events and actions taken

Common indicators of compromise (IoCs) include unusual outbound network traffic, unexpected system file changes, anomalous login patterns, and unexplained privilege escalations.

## Phase 3: Containment, Eradication, and Recovery

### Short-Term Containment
Immediately isolate affected systems to prevent the incident from spreading. This may include disconnecting compromised machines from the network, blocking malicious IP addresses, or disabling compromised accounts.

### Eradication
Remove the threat from all affected systems. This includes deleting malware, closing backdoors, patching exploited vulnerabilities, and resetting compromised credentials.

### Recovery
Restore affected systems to normal operation. Rebuild compromised systems from clean backups, implement additional monitoring on recovered systems, and gradually restore network connectivity while watching for signs of reinfection.

## Phase 4: Post-Incident Activity

The lessons learned phase is where organizations improve their defenses:

- **Conduct a post-mortem** within 48 hours of incident resolution
- **Document the full timeline**, root cause, and remediation steps
- **Update the IR plan** based on lessons learned
- **Share intelligence** with relevant communities (ISACs, CERTs) to help others defend against similar threats

## Key Metrics to Track

- **Mean Time to Detect (MTTD)** — How quickly you identify incidents
- **Mean Time to Respond (MTTR)** — How quickly you contain and remediate
- **False Positive Rate** — Percentage of alerts that aren't real incidents

---

*Aegis Core provides tools to help with incident investigation. Use [IP Intelligence](/tools/ip-intelligence) to trace suspicious IPs and [Domain Analyzer](/tools/domain-analyzer) to investigate potentially malicious domains.*
