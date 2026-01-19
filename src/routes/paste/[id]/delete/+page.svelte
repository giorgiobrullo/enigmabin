<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Loader2, Check, AlertTriangle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let isDeleted = $state(false);

	const burnToken = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';

	async function handleDelete() {
		if (isLoading || !burnToken) return;
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/paste/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: $page.params.id,
					burnToken
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to delete');
			}

			isDeleted = true;
			toast.success('Paste deleted');
		} catch (e: any) {
			error = e.message || 'Failed to delete paste';
			toast.error(error ?? 'Failed to delete paste');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container py-16 md:py-24">
	<div class="max-w-md mx-auto">
		{#if !burnToken}
			<div class="text-center space-y-4 p-6 rounded-lg border">
				<AlertTriangle class="h-10 w-10 text-muted-foreground mx-auto" />
				<div>
					<h1 class="text-lg font-semibold mb-2">Invalid URL</h1>
					<p class="text-sm text-muted-foreground">
						This deletion URL is incomplete. Make sure you have the full URL including the part after the #.
					</p>
				</div>
			</div>
		{:else if isDeleted}
			<div class="text-center space-y-4 p-6 rounded-lg border">
				<Check class="h-10 w-10 text-primary mx-auto" />
				<div>
					<h1 class="text-lg font-semibold mb-2">Paste deleted</h1>
					<p class="text-sm text-muted-foreground">
						The paste has been permanently removed from our servers.
					</p>
				</div>
			</div>
		{:else}
			<div class="space-y-6 p-6 rounded-lg border">
				<div class="text-center">
					<h1 class="text-lg font-semibold mb-2">Delete paste</h1>
					<p class="text-sm text-muted-foreground">
						This will permanently delete paste <code class="px-1.5 py-0.5 rounded bg-muted text-xs">{$page.params.id}</code>
					</p>
				</div>

				{#if error}
					<div class="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
						{error}
					</div>
				{/if}

				<Button
					variant="destructive"
					disabled={isLoading}
					onclick={handleDelete}
					class="w-full"
				>
					{#if isLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Deleting...
					{:else}
						Delete permanently
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</div>
