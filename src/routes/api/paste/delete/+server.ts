import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/util/db';
import { timingSafeEqual, createHash } from 'crypto';

/**
 * Hash a token using SHA-256 (matches storage format).
 */
function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('base64');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const paste = await prisma.paste.findUnique({
        where: { id: data.id }
    });

    if (!paste || !paste.burnToken) {
        throw error(404, 'Paste not found');
    }

    // Hash incoming token and compare with stored hash (constant-time)
    if (!safeCompare(hashToken(data.burnToken), paste.burnToken)) {
        throw error(403, 'Invalid burn token');
    }

    await prisma.paste.delete({
        where: { id: data.id }
    });
    return json({ success: true });
};