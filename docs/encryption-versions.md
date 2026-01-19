# Encryption Versions

This document describes the encryption format versions used by EnigmaBin.

## Version 2 (Current)

**Introduced:** January 2026

### Algorithms
| Layer | Algorithm | Notes |
|-------|-----------|-------|
| Key Exchange | X25519 | Classical ECDH |
| Key Exchange | ML-KEM-1024 | Post-quantum KEM (optional) |
| Symmetric | XChaCha20-Poly1305 | 24-byte nonce, AEAD |

### Changes from v1
- Switched symmetric cipher from ChaCha20-Poly1305-IETF to XChaCha20-Poly1305
- Nonce size increased from 12 bytes to 24 bytes

### Format
```typescript
{
  content: string;       // Base64 encrypted content
  ciphertext1?: string;  // Base64 ML-KEM encapsulated key (quantum mode only)
  ciphertext2: string;   // Base64 sealed shared secret
  nonce1?: string;       // Base64 24-byte nonce (quantum mode only)
  nonce2: string;        // Base64 24-byte nonce
  version: '2';
}
```

---

## Version 1 (Legacy)

**Introduced:** Initial release
**Status:** Read-only (decryption supported, no new pastes created)

### Algorithms
| Layer | Algorithm | Notes |
|-------|-----------|-------|
| Key Exchange | X25519 | Classical ECDH |
| Key Exchange | ML-KEM-1024 | Post-quantum KEM (optional) |
| Symmetric | ChaCha20-Poly1305-IETF | 12-byte nonce, AEAD |

### Format
```typescript
{
  content: string;       // Base64 encrypted content
  ciphertext1?: string;  // Base64 ML-KEM encapsulated key (quantum mode only)
  ciphertext2: string;   // Base64 sealed shared secret
  nonce1?: string;       // Base64 12-byte nonce (quantum mode only)
  nonce2: string;        // Base64 12-byte nonce
  version: '1';
}
```

---

## Decryption Key Format

The decryption key is a Base64-encoded concatenation of raw key bytes, stored in the URL fragment.

### Classical Mode
```
[X25519 secret key: 32 bytes][X25519 public key: 32 bytes]
```
Total: 64 bytes → ~88 Base64 chars

### Quantum Mode
```
[ML-KEM-1024 secret key: 3168 bytes][X25519 secret key: 32 bytes][X25519 public key: 32 bytes]
```
Total: 3232 bytes → ~4.3KB Base64 chars
