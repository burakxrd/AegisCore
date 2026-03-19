# Two-Factor Authentication (2FA): Why It Matters and How It Works

**Classification:** PUBLIC  
**Category:** Authentication  
**Reading Time:** 4 min

---

## What Is Two-Factor Authentication?

Two-Factor Authentication (2FA) adds a second layer of security to your accounts by requiring two different types of verification before granting access. Even if an attacker obtains your password through phishing, data breaches, or brute force, they still cannot access your account without the second factor.

The three categories of authentication factors are:
- **Something you know** — Password, PIN, or security question
- **Something you have** — Phone, hardware key, or authenticator app
- **Something you are** — Fingerprint, face recognition, or iris scan

2FA combines two of these categories to verify your identity.

## Types of 2FA Methods

### SMS-Based 2FA

The most common but least secure method. After entering your password, a one-time code is sent to your phone via SMS. While better than no 2FA, SMS codes are vulnerable to **SIM swapping** attacks, where an attacker convinces your carrier to transfer your phone number to their SIM card.

### Authenticator Apps (TOTP)

Apps like Google Authenticator, Authy, and Microsoft Authenticator generate Time-based One-Time Passwords (TOTP) that refresh every 30 seconds. These codes are generated locally on your device using a shared secret, making them immune to SIM swapping attacks.

The TOTP algorithm works by combining the shared secret with the current timestamp using HMAC-SHA1, producing a unique 6-digit code for each 30-second window.

### Hardware Security Keys (FIDO2/WebAuthn)

Physical devices like YubiKey and Google Titan use the FIDO2/ WebAuthn standard to provide the strongest form of 2FA. The key generates a unique cryptographic signature for each authentication request, making it phishing-resistant — even if you visit a fake website, the key won't authenticate because the domain doesn't match.

### Push Notifications

Services like Duo Security and Microsoft Authenticator send push notifications to your phone, asking you to approve or deny the login attempt. This is convenient but can be vulnerable to **MFA fatigue attacks**, where attackers repeatedly send push notifications until the user accidentally approves one.

### Biometric Authentication

Fingerprint scanners, facial recognition, and iris scanners use unique biological characteristics for verification. While convenient, biometric data cannot be changed if compromised, unlike passwords or security keys.

## Why You Need 2FA

- **82%** of data breaches involve compromised credentials
- **99.9%** of automated attacks are blocked by MFA
- Account takeover attacks have increased by **131%** in recent years

## Best Practices

1. **Use hardware keys** for high-value accounts (email, banking, cloud services)
2. **Prefer authenticator apps** over SMS for general-purpose 2FA
3. **Save backup codes** in a secure location in case you lose access to your 2FA device
4. **Enable 2FA on email first** — if an attacker compromises your email, they can reset passwords on all linked accounts

---

*Protect your digital identity by understanding how authentication works. Explore Aegis Core's [security tools](/tools) to analyze your online infrastructure.*
