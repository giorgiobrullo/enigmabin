<script lang="ts">
	import MonacoEditor from '$lib/components/custom-ui/monaco-editor/monaco-editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Switch } from '$lib/components/ui/switch';
	import { Copy, Loader2, Check, AlertTriangle, Code, FileText } from '@lucide/svelte';
	import { encrypt } from '$lib/util/encryption';
	import { toast } from 'svelte-sonner';
	import { Carta, MarkdownEditor } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	import { slash } from '@cartamd/plugin-slash';
	import { code } from '@cartamd/plugin-code';
	import { MetaTags } from 'svelte-meta-tags';
	import 'carta-md/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import '@cartamd/plugin-code/default.css';
	import '$lib/styles/carta-github.scss';

	const carta = new Carta({
		sanitizer: false,
		extensions: [emoji(), slash(), code()]
	});

	const MAX_CHARS = 2000000;
	let content = $state('');
	let editorMode = $state<'code' | 'text'>('code');
	let expiration = $state('7d');
	let burnOnView = $state(false);
	let useQuantum = $state(false);
	let generatedUrl = $state('');
	let generatedBurnUrl = $state('');
	let isLoading = $state(false);
	let copiedUrl = $state(false);
	let copiedBurnUrl = $state(false);

	const expirationOptions = [
		{ value: '1h', label: '1 hour' },
		{ value: '1d', label: '1 day' },
		{ value: '7d', label: '1 week' },
		{ value: '30d', label: '30 days' },
		{ value: '', label: 'Never' }
	];

	const expirationTrigger = $derived(
		expirationOptions.find((option) => option.value === expiration)?.label ?? 'Select'
	);

	async function handleSubmit() {
		if (isLoading) return;
		isLoading = true;

		try {
			const initResponse = await fetch('/api/paste/init', { method: 'POST' });
			const { pasteId, burnToken } = await initResponse.json();

			const { encrypted, decryptionKey } = await encrypt(
				content,
				burnOnView ? burnToken : undefined,
				useQuantum
			);

			const response = await fetch('/api/paste', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: pasteId, encrypted, expiration, burnToken })
			});

			const { url } = await response.json();
			generatedUrl = `${window.location.origin}${url}#${decryptionKey}`;
			generatedBurnUrl = `${window.location.origin}${url}/delete#${burnToken}`;
			toast.success('Paste created');
		} catch (error) {
			console.error('Failed to create paste:', error);
			toast.error('Failed to create paste');
		} finally {
			isLoading = false;
		}
	}

	async function copyUrl(url: string, type: 'url' | 'burn') {
		try {
			await navigator.clipboard.writeText(url);
			if (type === 'url') {
				copiedUrl = true;
				setTimeout(() => copiedUrl = false, 2000);
			} else {
				copiedBurnUrl = true;
				setTimeout(() => copiedBurnUrl = false, 2000);
			}
		} catch {
			toast.error('Failed to copy');
		}
	}

	const charsRemaining = $derived(MAX_CHARS - content.length);
	const remainingSize = $derived(() => {
		const bytes = charsRemaining;
		if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
		return `${(bytes / 1000).toFixed(0)} KB`;
	});
	const isValid = $derived(content.length > 0 && content.length <= MAX_CHARS);
</script>

<MetaTags
	title="New Paste"
	description="Create a new encrypted paste. Your content is encrypted in your browser before upload. Optional quantum-resistant encryption available."
	canonical="https://enigmabin.com/new"
	openGraph={{
		images: [{ url: 'https://enigmabin.com/og/new.png', width: 1200, height: 630 }]
	}}
	twitter={{
		cardType: 'summary_large_image',
		image: 'https://enigmabin.com/og/new.png'
	}}
/>

<Tooltip.Provider>
<div class="container py-8 md:py-12">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold tracking-tight mb-1">New paste</h1>
			<p class="text-sm text-muted-foreground">Encrypted in your browser before it leaves.</p>
		</div>

		<form
			class="space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<!-- Editor -->
			<div class="space-y-2">
				<!-- Mode toggle -->
				<div class="flex items-center justify-between">
					<div class="flex rounded-md border bg-muted/50 p-0.5">
						<button
							type="button"
							onclick={() => editorMode = 'code'}
							class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors {editorMode === 'code' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}"
						>
							<Code class="h-3.5 w-3.5" />
							Code
						</button>
						<button
							type="button"
							onclick={() => editorMode = 'text'}
							class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors {editorMode === 'text' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}"
						>
							<FileText class="h-3.5 w-3.5" />
							Text
						</button>
					</div>
					<p class="text-xs text-muted-foreground">{remainingSize()} remaining</p>
				</div>

				<!-- Editor area -->
				{#if editorMode === 'code'}
					<div class="h-[600px] rounded-lg border overflow-hidden">
						<MonacoEditor bind:value={content} />
					</div>
				{:else}
					<div class="h-[600px] rounded-lg border overflow-hidden carta-wrapper">
						<MarkdownEditor {carta} bind:value={content} mode="tabs" theme="github" placeholder="Write your text or markdown here..." />
					</div>
				{/if}
			</div>

			<!-- Options -->
			<div class="grid sm:grid-cols-2 gap-4">
				<div class="space-y-4 p-4 rounded-lg border bg-card">
					<div class="space-y-2">
						<span class="text-sm font-medium">Expiration</span>
						<Select.Root type="single" bind:value={expiration}>
							<Select.Trigger class="w-full">{expirationTrigger}</Select.Trigger>
							<Select.Content>
								{#each expirationOptions as option}
									<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if expiration === ''}
							<p class="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
								<AlertTriangle class="h-3 w-3 mt-0.5 shrink-0" />
								<span>Stored indefinitely. Only deletable via deletion URL{burnOnView ? ' or burn-after-reading' : ''}.</span>
							</p>
						{/if}
					</div>

					<div class="flex items-center justify-between">
						<div>
							<Tooltip.Root>
								<Tooltip.Trigger class="text-sm font-medium underline decoration-dotted underline-offset-4 cursor-help">Burn after reading</Tooltip.Trigger>
								<Tooltip.Content class="max-w-xs">Deletes after successful decryption. Client-side enforced, so treat as convenience, not security guarantee.</Tooltip.Content>
							</Tooltip.Root>
							<p class="text-xs text-muted-foreground">Delete after first view</p>
						</div>
						<Switch bind:checked={burnOnView} />
					</div>

					<div class="flex items-center justify-between">
						<div>
							<Tooltip.Root>
								<Tooltip.Trigger class="text-sm font-medium underline decoration-dotted underline-offset-4 cursor-help">Quantum-resistant</Tooltip.Trigger>
								<Tooltip.Content class="max-w-xs">Adds ML-KEM-1024 on top of X25519. Safe against future quantum computers, but URLs grow to ~4.5k chars.</Tooltip.Content>
							</Tooltip.Root>
							<p class="text-xs text-muted-foreground">Longer URLs (~4.5k chars)</p>
						</div>
						<Switch bind:checked={useQuantum} />
					</div>
				</div>

				<div class="space-y-4 p-4 rounded-lg border bg-card">
					<Button type="submit" disabled={!isValid || isLoading} class="w-full">
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating...
						{:else}
							Create paste
						{/if}
					</Button>

					{#if generatedUrl}
						<div class="space-y-4">
							<!-- Share URL -->
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<span class="text-xs font-medium text-muted-foreground">Decryption URL</span>
									<span class="text-xs text-muted-foreground/60">share this</span>
								</div>
								<div class="flex gap-2">
									<input
										type="text"
										readonly
										value={generatedUrl}
										class="flex-1 h-9 px-3 text-sm rounded-md border bg-muted/50 truncate"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										class="h-9 w-9 shrink-0"
										onclick={() => copyUrl(generatedUrl, 'url')}
									>
										{#if copiedUrl}
											<Check class="h-4 w-4 text-primary" />
										{:else}
											<Copy class="h-4 w-4" />
										{/if}
									</Button>
								</div>
								<p class="text-xs text-muted-foreground">Contains the key. Lose it = lose access forever.</p>
							</div>

							<!-- Delete URL -->
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<span class="text-xs font-medium text-muted-foreground">Deletion URL</span>
									<span class="text-xs text-amber-600 dark:text-amber-400">keep private</span>
								</div>
								<div class="flex gap-2">
									<input
										type="text"
										readonly
										value={generatedBurnUrl}
										class="flex-1 h-9 px-3 text-sm rounded-md border bg-muted/50 truncate"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										class="h-9 w-9 shrink-0"
										onclick={() => copyUrl(generatedBurnUrl, 'burn')}
									>
										{#if copiedBurnUrl}
											<Check class="h-4 w-4 text-primary" />
										{:else}
											<Copy class="h-4 w-4" />
										{/if}
									</Button>
								</div>
								<p class="text-xs text-muted-foreground">Allows permanent deletion. Cannot be recovered.</p>
							</div>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground text-center py-4">
							You'll get two URLs: one to share, one to delete.
						</p>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>
</Tooltip.Provider>

<style>
	.carta-wrapper :global(.carta-editor) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
