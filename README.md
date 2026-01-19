<p align="center">
  <img src="static/favicon.svg" alt="EnigmaBin" width="80" height="80">
</p>

<h1 align="center">EnigmaBin</h1>

<p align="center">
  <a href="https://kit.svelte.dev/"><img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"></a>
</p>

<p align="center">
  A zero-knowledge pastebin with end-to-end encryption. Classical or quantum-resistant.
</p>

<p align="center">
  <a href="https://enigmabin.com"><strong>enigmabin.com</strong></a>
</p>

## About

EnigmaBin is a privacy-focused pastebin where all content is encrypted in your browser before reaching the server. The server never sees your plaintext data, only ciphertext it cannot decrypt.

You choose your security level: fast classical encryption using X25519 key exchange, or dual-layer quantum-resistant protection combining ML-KEM-1024 with X25519. Both use XChaCha20-Poly1305 for authenticated symmetric encryption.

Pastes can auto-expire after a set time or self-destruct after a single view. No account required.

## Security

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Key Exchange | X25519 | Classical ECDH |
| Key Exchange | ML-KEM-1024 | Post-quantum KEM (optional) |
| Symmetric | XChaCha20-Poly1305 | Authenticated encryption |

The encryption key is derived client-side and stored only in the URL fragment, which is never sent to the server. Even with full database access, pastes cannot be decrypted without the URL.

## Quick Start

```bash
bun install
bunx prisma generate
bunx prisma db push
bun dev
```

Requires a PostgreSQL database. Set `DATABASE_URL` in your environment.

## License

All rights reserved. © 2026 Giorgio Brullo