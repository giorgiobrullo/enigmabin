<script lang="ts">
	import { onMount } from 'svelte';
	import MonacoEditor from '$lib/components/custom-ui/monaco-editor/monaco-editor.svelte';
	import { decrypt } from '$lib/util/decryption';
	import { Button } from '$lib/components/ui/button';
	import { Copy, Check } from '@lucide/svelte';
	import type { EncryptedData, PasteContent } from '$lib/util/encryption';
	import { toast } from 'svelte-sonner';
	import _sodium from 'libsodium-wrappers';

	let { data } = $props();

	let decryptedContent: PasteContent | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(true);
	let copied = $state(false);
	let burned = $state(false);

	async function copyContent() {
		if (decryptedContent) {
			await navigator.clipboard.writeText(decryptedContent.content);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}

	/**
	 * Extract the X25519 public key from the combined decryption key.
	 * The public key is always the last 32 bytes.
	 */
	async function extractBurnKey(decryptionKeyBase64: string): Promise<string> {
		await _sodium.ready;
		const sodium = _sodium;
		const combinedKey = sodium.from_base64(decryptionKeyBase64);
		const publicKey = combinedKey.slice(-32);  // Last 32 bytes
		return sodium.to_base64(publicKey);
	}

	/**
	 * Verify key possession and get encrypted data for burn-on-read pastes.
	 * Server atomically returns ciphertext and deletes the paste.
	 */
	async function verifyAndGetEncrypted(decryptionKey: string): Promise<EncryptedData | null> {
		const burnKey = await extractBurnKey(decryptionKey);

		const response = await fetch('/api/paste/verify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: data.id, burnKey })
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Paste not found');
			}
			if (response.status === 403) {
				throw new Error('Invalid key');
			}
			throw new Error('Verification failed');
		}

		const result = await response.json();
		burned = result.burned;
		return result.encrypted as EncryptedData;
	}

	async function decryptPaste(decryptionKey: string, encrypted: EncryptedData) {
		if (!data.id) return;

		try {
			decryptedContent = await decrypt(encrypted, decryptionKey);
			error = null;

			// Legacy burn-on-read (for pastes without burnKey stored)
			if (decryptedContent && decryptedContent.burnToken && !burned) {
				await fetch('/api/paste/delete', {
					method: 'POST',
					body: JSON.stringify({ id: data.id, burnToken: decryptedContent.burnToken })
				});
				burned = true;
			}
		} catch (e) {
			error = 'Failed to decrypt. The URL might be incomplete or invalid.';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		// Check for paste not found
		if (!data.id) {
			error = 'Paste not found';
			loading = false;
			return;
		}

		const key = window.location.hash.slice(1);
		if (!key) {
			error = 'No decryption key found. Make sure you have the complete URL.';
			loading = false;
			return;
		}

		try {
			let encrypted: EncryptedData;

			if (data.needsVerification) {
				// New verified burn-on-read flow
				const result = await verifyAndGetEncrypted(key);
				if (!result) {
					error = 'Failed to retrieve paste';
					loading = false;
					return;
				}
				encrypted = result;
			} else if (data.encrypted) {
				// Standard flow (no burn or legacy burn)
				encrypted = data.encrypted as unknown as EncryptedData;
			} else {
				error = 'Paste not found';
				loading = false;
				return;
			}

			await decryptPaste(key, encrypted);
		} catch (e: any) {
			error = e.message || 'Failed to decrypt. The URL might be incomplete or invalid.';
			loading = false;
		}
	});
</script>

<div class="container py-8 md:py-12">
	<div class="max-w-4xl mx-auto">
		{#if loading}
			<div class="flex items-center justify-center h-[400px] rounded-lg border bg-muted/20">
				<p class="text-muted-foreground">Decrypting...</p>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center h-[400px] rounded-lg border bg-destructive/5 text-center p-6">
				<p class="text-destructive font-medium mb-2">{error}</p>
				{#if error.includes('not found')}
					<p class="text-sm text-muted-foreground">This paste may have expired or been deleted.</p>
				{/if}
			</div>
		{:else if decryptedContent}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h1 class="text-xl font-semibold">Encrypted paste</h1>
					<Button variant="outline" size="sm" onclick={copyContent}>
						{#if copied}
							<Check class="h-4 w-4 mr-2" />
							Copied
						{:else}
							<Copy class="h-4 w-4 mr-2" />
							Copy
						{/if}
					</Button>
				</div>

				<div class="h-[500px] rounded-lg border overflow-hidden">
					<MonacoEditor value={decryptedContent.content} readOnly={true} />
				</div>

				<div class="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
					<div class="flex flex-wrap gap-4">
						{#if data.createdAt}
							<span>Created {new Date(data.createdAt).toLocaleDateString()}</span>
						{/if}
						{#if data.expiresAt}
							<span>Expires {new Date(data.expiresAt).toLocaleDateString()}</span>
						{/if}
					</div>

					{#if burned || decryptedContent.burnToken}
						<div class="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
							This paste has been deleted
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
