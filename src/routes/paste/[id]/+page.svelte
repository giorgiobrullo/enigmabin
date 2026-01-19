<script lang="ts">
	import { onMount } from 'svelte';
	import MonacoEditor from '$lib/components/custom-ui/monaco-editor/monaco-editor.svelte';
	import { decrypt } from '$lib/util/decryption';
	import { Button } from '$lib/components/ui/button';
	import { Copy, Check } from '@lucide/svelte';
	import type { EncryptedData, PasteContent } from '$lib/util/encryption';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let decryptedContent: PasteContent | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(true);
	let copied = $state(false);

	async function copyContent() {
		if (decryptedContent) {
			await navigator.clipboard.writeText(decryptedContent.content);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}

	async function decryptPaste(decryptionKey: string) {
		if (!data.id) return;

		try {
			decryptedContent = await decrypt(
				data.encrypted as unknown as EncryptedData,
				decryptionKey
			);
			error = null;

			if (decryptedContent && decryptedContent.burnToken) {
				await fetch('/api/paste/delete', {
					method: 'POST',
					body: JSON.stringify({ id: data.id, burnToken: decryptedContent.burnToken })
				});
			}
		} catch (e) {
			error = 'Failed to decrypt. The URL might be incomplete or invalid.';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!data.encrypted) {
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
		decryptPaste(key);
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

					{#if decryptedContent.burnToken}
						<div class="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
							This paste has been deleted
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
