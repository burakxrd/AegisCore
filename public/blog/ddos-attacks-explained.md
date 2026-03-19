# DDoS Attacks Explained: How They Work and How to Defend Against Them

**Classification:** PUBLIC  
**Category:** Network Security  
**Reading Time:** 4 min

---

## What Is a DDoS Attack?

A Distributed Denial of Service (DDoS) attack is an attempt to make an online service unavailable by overwhelming it with traffic from multiple sources. Unlike a simple DoS attack that originates from a single source, DDoS attacks use thousands or even millions of compromised devices — collectively known as a **botnet** — to flood the target simultaneously.

DDoS attacks can target any layer of the network stack, from raw bandwidth flooding to application-layer resource exhaustion.

## Types of DDoS Attacks

### Volumetric Attacks

The most common type, volumetric attacks aim to saturate the target's bandwidth. Techniques include UDP floods, ICMP floods, and DNS amplification attacks. In amplification attacks, the attacker sends small requests to public servers (like DNS resolvers) with a spoofed source IP, causing the servers to send large responses to the victim.

Modern volumetric attacks can reach **terabits per second** of traffic, overwhelming even well-provisioned networks.

### Protocol Attacks

Protocol attacks exploit weaknesses in network protocols to consume server resources. The most well-known example is the **SYN Flood**, where the attacker sends a barrage of SYN packets (the first step of the TCP three-way handshake) without completing the connection, exhausting the server's connection table.

Other protocol attacks include Ping of Death, Smurf attacks, and fragmented packet attacks.

### Application Layer Attacks

The most sophisticated type, application layer attacks target specific web application features. **HTTP Flood** attacks send seemingly legitimate HTTP requests that consume significant server resources. **Slowloris** attacks keep connections open by sending partial HTTP headers very slowly, tying up server threads.

These attacks are difficult to detect because the traffic appears legitimate and the volume may be relatively low.

## How to Defend Against DDoS

1. **Rate Limiting** — Restrict the number of requests a single IP address can make within a given timeframe
2. **CDN and Traffic Distribution** — Services like Cloudflare, AWS Shield, and Akamai distribute traffic across global points of presence, absorbing attack traffic
3. **Anycast Routing** — Distributes incoming traffic across multiple data centers, preventing any single location from being overwhelmed
4. **Traffic Analysis** — Monitor network traffic patterns to detect anomalies early. Sudden spikes in traffic from unusual geographic locations or targeting specific endpoints may indicate an attack
5. **Blackhole Routing** — As a last resort, route attack traffic to a null route to protect the rest of the network

## The Cost of DDoS Attacks

The average DDoS attack costs businesses between $20,000 and $40,000 per hour in lost revenue, with major attacks costing millions. Beyond financial losses, DDoS attacks damage brand reputation, erode customer trust, and can serve as a smokescreen for more targeted attacks occurring simultaneously.

---

*Analyze your domain's infrastructure and DNS configuration with Aegis Core's [Domain Analyzer](/tools/domain-analyzer) to understand your network's architecture and potential exposure points.*
