import { json } from '@sveltejs/kit';
import _sodium from 'libsodium-wrappers';
import { createHash } from 'crypto';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/util/db';

/**
 * Hash a token using SHA-256.
 * Stored hash prevents token recovery from database access.
 */
function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('base64');
}

export const POST: RequestHandler = async () => {
    await _sodium.ready;
    const sodium = _sodium;

    const pasteId = crypto.randomUUID();
    const burnToken = sodium.to_base64(sodium.randombytes_buf(32));

    await prisma.paste.create({
        data: {
            id: pasteId,
            burnToken: hashToken(burnToken)  // Store hash, not raw token
        }
    });

    return json({
        pasteId,
        burnToken  // Return raw token to client
    });
};