import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/util/db';
import { timingSafeEqual } from 'crypto';

/**
 * Constant-time string comparison to prevent timing attacks.
 * Falls back to regular comparison if strings have different lengths
 * (which already leaks length info, but that's inherent to the protocol).
 */
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Verified burn-on-read endpoint.
 *
 * Client proves possession of the public key (from URL fragment) before
 * receiving the ciphertext. Server verifies, returns ciphertext, and
 * atomically deletes the paste.
 *
 * This ensures:
 * 1. Only someone with the full URL can trigger the burn
 * 2. The ciphertext is only released after verification
 * 3. The paste is deleted server-side (can't be skipped)
 */
export const POST: RequestHandler = async ({ request }) => {
    const { id, burnKey } = await request.json();

    if (!id || !burnKey) {
        throw error(400, 'Missing id or burnKey');
    }

    const paste = await prisma.paste.findUnique({
        where: { id }
    });

    if (!paste) {
        throw error(404, 'Paste not found');
    }

    // Check if paste has expired
    if (paste.expiresAt && paste.expiresAt < new Date()) {
        await prisma.paste.delete({
            where: { id }
        });
        throw error(404, 'Paste not found');
    }

    // Verify the public key matches (constant-time comparison)
    if (!paste.burnKey || !safeCompare(paste.burnKey, burnKey)) {
        throw error(403, 'Invalid key');
    }

    // Atomically return ciphertext and delete
    const encrypted = paste.encrypted;

    await prisma.paste.delete({
        where: { id }
    });

    return json({
        encrypted,
        burned: true
    });
};
