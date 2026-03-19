# Base64 Encoding Explained: What It Is, How It Works, and When to Use It

> **CLASSIFICATION:** Technical Documentation
> **RELATED TOOL:** [Base64 Codec →](/tools/base64-codec)

---

## What Is Base64?

**Base64** is an encoding scheme that converts binary data into a text format using a set of 64 printable ASCII characters: uppercase letters (`A–Z`), lowercase letters (`a–z`), digits (`0–9`), and two special characters (`+` and `/`), with `=` used for padding.

It's important to understand that Base64 is **encoding**, not **encryption**. It does not provide any security — anyone can decode a Base64 string instantly. Its purpose is purely to ensure binary data can be safely transmitted through systems designed to handle text.

## How Base64 Encoding Works

The encoding process follows a straightforward algorithm:

1. **Convert** the input data into its binary representation (a stream of bits).
2. **Split** the binary stream into groups of **6 bits** each (since 2⁶ = 64 characters).
3. **Map** each 6-bit group to a character in the Base64 alphabet.
4. **Pad** with `=` characters if the input length isn't divisible by 3 bytes.

For example, the text `Hi` becomes `SGk=` in Base64:

```
H (72) → 01001000
i (105) → 01101001

Binary: 010010 000110 100100
Base64:    S      G      k     =
```

Base64 encoding increases the data size by approximately **33%** — every 3 bytes of input produce 4 bytes of output. This overhead is the trade-off for text-safe transmission.

## Common Use Cases

Base64 encoding appears throughout modern web development and cybersecurity:

- **Email Attachments (MIME)** — Email protocols like SMTP were originally designed for 7-bit ASCII text. Base64 allows binary files (images, PDFs, archives) to be transmitted as email attachments through these text-only channels.

- **Data URIs** — Embed small images or fonts directly into HTML or CSS files without additional HTTP requests: `data:image/png;base64,iVBOR...`

- **API Communication** — REST APIs and JSON payloads can only contain text. Binary data like images, certificates, or encrypted tokens must be Base64-encoded before inclusion.

- **Basic Authentication** — HTTP Basic Auth sends credentials as a Base64-encoded `username:password` string in the `Authorization` header. (This is why HTTPS is mandatory — Base64 provides zero security.)

- **JWT Tokens** — JSON Web Tokens use Base64url encoding (a URL-safe variant) for their header and payload sections.

- **Obfuscation** — While not truly secure, Base64 is sometimes used to lightly obfuscate data in configuration files or scripts to prevent casual inspection.

## Base64 Is NOT Encryption

This is the single most important thing to understand: **Base64 provides zero confidentiality**. It is a reversible encoding — not a cryptographic operation. Sensitive data should be encrypted using proper cryptographic algorithms like AES or RSA before any encoding is applied.

## Encode and Decode Locally

Our **[Base64 Codec](/tools/base64-codec)** supports encoding and decoding of both text and files, with drag-and-drop file upload and one-click download of decoded output. All operations are performed **entirely in your browser** — no data ever leaves your machine.

---

> **📌 REMINDER:** Base64 is a transport encoding, not a security measure. Never rely on Base64 alone to protect sensitive information. Always use proper encryption for confidential data.
