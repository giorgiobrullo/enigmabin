<script lang="ts">
	import { ArrowRight, RotateCcw, Copy, Check, ShieldCheck } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { encrypt, type EncryptedData } from '$lib/util/encryption';
	import { decrypt } from '$lib/util/decryption';
	import { MetaTags } from 'svelte-meta-tags';

	// Word list for generating random content
	const words = [
		'password', 'secret', 'token', 'apikey', 'database', 'connection', 'string',
		'private', 'credential', 'auth', 'bearer', 'session', 'cookie', 'jwt',
		'encryption', 'decrypt', 'hash', 'salt', 'key', 'certificate', 'ssl',
		'admin', 'root', 'user', 'login', 'access', 'permission', 'role'
	];

	const values = [
		'sk_fake_4eC39HqLyjWDarjtT1zdp7dc',
		'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		'mongodb+srv://admin:pass@cluster.mongodb.net',
		'AKIAIOSFODNN7EXAMPLE',
		'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
		'xoxb-not-a-real-token-this-is-fake',
		'postgres://user:password@localhost:5432/db'
	];

	function generateContent(): string {
		const word = words[Math.floor(Math.random() * words.length)];
		const value = values[Math.floor(Math.random() * values.length)];
		return `const ${word} = "${value}";`;
	}

	let quantumMode = $state(false);
	let isEncrypting = $state(false);
	let isVerifying = $state(false);
	let verified = $state<{ success: boolean; content?: string } | null>(null);
	let copied = $state(false);

	// Demo state
	let plaintext = $state(generateContent());
	let result = $state<{
		encrypted: EncryptedData;
		decryptionKey: string;
	} | null>(null);

	async function runEncryption(useQuantum: boolean) {
		if (isEncrypting) return;
		isEncrypting = true;
		result = null;
		verified = null;

		// Small delay so the encrypting state is visible
		await new Promise(r => setTimeout(r, 400));

		try {
			const output = await encrypt(plaintext, undefined, useQuantum);
			result = output;
		} catch (e) {
			console.error('Encryption failed:', e);
		} finally {
			isEncrypting = false;
		}
	}

	function regenerate() {
		plaintext = generateContent();
		result = null;
		runEncryption(quantumMode);
	}

	function toggleMode() {
		quantumMode = !quantumMode;
		runEncryption(quantumMode);
	}

	function truncate(str: string, len: number): string {
		if (str.length <= len) return str;
		return str.slice(0, len) + '...';
	}

	async function copyKey() {
		if (!result) return;
		await navigator.clipboard.writeText(result.decryptionKey);
		copied = true;
		setTimeout(() => copied = false, 2000);
	}

	async function verifyDecryption() {
		if (!result || isVerifying) return;
		isVerifying = true;
		verified = null;

		try {
			const decrypted = await decrypt(result.encrypted, result.decryptionKey);
			verified = {
				success: decrypted.content === plaintext,
				content: decrypted.content
			};
		} catch (e) {
			console.error('Verification failed:', e);
			verified = { success: false };
		} finally {
			isVerifying = false;
		}
	}

	onMount(() => {
		runEncryption(false);
	});
</script>

<MetaTags
	title="Encrypted Pastes, Zero Knowledge"
	description="Zero-knowledge encrypted pastebin. Your content is encrypted in your browser before it leaves. The key lives in your URL—we only store ciphertext."
	canonical="https://enigmabin.com"
	openGraph={{
		images: [{ url: 'https://enigmabin.com/og/home.png', width: 1200, height: 630 }]
	}}
	twitter={{
		cardType: 'summary_large_image',
		image: 'https://enigmabin.com/og/home.png'
	}}
/>

<div class="container py-16 md:py-24">
	<!-- Hero -->
	<div class="max-w-xl mb-16 md:mb-24">
		<h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
			Encrypted pastes.<br/>
			Zero knowledge.
		</h1>
		<p class="text-lg text-muted-foreground mb-8 leading-relaxed">
			Your content is encrypted in your browser before we ever see it.
			The key lives in your URL—we only store ciphertext.
		</p>
		<a
			href="/new"
			class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
		>
			New paste
			<ArrowRight class="h-4 w-4" />
		</a>
	</div>

	<!-- Live Demo -->
	<div class="border-t pt-12">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-lg font-semibold">Live demo</h2>
				<p class="text-sm text-muted-foreground">Real encryption running in your browser right now</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					onclick={regenerate}
					disabled={isEncrypting}
					class="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
					title="Generate new content"
				>
					<RotateCcw class="w-4 h-4" />
				</button>
				<button
					onclick={toggleMode}
					disabled={isEncrypting}
					class="text-xs font-mono px-3 py-2 rounded-md border transition-colors disabled:opacity-50
						{quantumMode
							? 'border-primary text-primary bg-primary/5'
							: 'border-border text-muted-foreground hover:text-foreground'}"
				>
					{quantumMode ? 'quantum' : 'classical'}
				</button>
			</div>
		</div>

		<div class="space-y-4">
			<!-- Input -->
			<div>
				<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Input</div>
				<div class="font-mono text-sm bg-card border rounded-lg p-4">
					<span class="text-foreground">{plaintext}</span>
				</div>
			</div>

			<!-- Arrow -->
			<div class="flex items-center gap-3 text-muted-foreground/50 py-2">
				<div class="flex-1 h-px bg-current"></div>
				<span class="text-xs">
					{#if isEncrypting}
						encrypting...
					{:else}
						{quantumMode ? 'ML-KEM-1024 + X25519 → XChaCha20 ×2' : 'X25519 → XChaCha20-Poly1305'}
					{/if}
				</span>
				<div class="flex-1 h-px bg-current"></div>
			</div>

			{#if result}
				<!-- Encrypted output -->
				<div in:fade={{ duration: 150 }}>
					<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ciphertext</div>
					<div class="font-mono text-xs bg-card border rounded-lg p-4 text-muted-foreground break-all max-h-[80px] overflow-hidden">
						{truncate(result.encrypted.content, 200)}
					</div>
				</div>

				<!-- Crypto details -->
				<div class="grid sm:grid-cols-2 gap-4" in:fade={{ duration: 150, delay: 50 }}>
					<div>
						<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
							{quantumMode ? 'Sealed secrets' : 'Sealed secret'}
						</div>
						<div class="font-mono text-xs bg-card border rounded-lg p-4 space-y-1.5">
							{#if quantumMode && result.encrypted.ciphertext1}
								<div class="flex gap-2">
									<span class="text-muted-foreground/60 shrink-0">quantum:</span>
									<span class="text-muted-foreground truncate">{truncate(result.encrypted.ciphertext1, 24)}</span>
								</div>
							{/if}
							<div class="flex gap-2">
								<span class="text-muted-foreground/60 shrink-0">{quantumMode ? 'classical:' : 'sealed:'}</span>
								<span class="text-muted-foreground truncate">{truncate(result.encrypted.ciphertext2, 24)}</span>
							</div>
							{#if quantumMode && result.encrypted.nonce1}
								<div class="flex gap-2">
									<span class="text-muted-foreground/60 shrink-0">nonce₁:</span>
									<span class="text-muted-foreground truncate">{result.encrypted.nonce1}</span>
								</div>
							{/if}
							<div class="flex gap-2">
								<span class="text-muted-foreground/60 shrink-0">{quantumMode ? 'nonce₂:' : 'nonce:'}</span>
								<span class="text-muted-foreground truncate">{result.encrypted.nonce2}</span>
							</div>
						</div>
					</div>

					<div>
						<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Decryption key</div>
						<div class="font-mono text-xs bg-card border rounded-lg p-4">
							<div class="text-primary break-all">{truncate(result.decryptionKey, 64)}</div>
							<div class="mt-3 flex items-center justify-between">
								<span class="text-muted-foreground/60">
									{result.decryptionKey.length} chars ({quantumMode ? '~4.3KB' : '88B'} decoded)
								</span>
								<div class="flex gap-2">
									<button
										onclick={copyKey}
										class="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
										title="Copy key"
									>
										{#if copied}
											<Check class="w-3 h-3 text-primary" />
										{:else}
											<Copy class="w-3 h-3" />
										{/if}
									</button>
									<button
										onclick={verifyDecryption}
										disabled={isVerifying}
										class="p-1.5 rounded border transition-colors disabled:opacity-50
											{verified?.success === true ? 'border-primary text-primary bg-primary/5' : verified?.success === false ? 'border-destructive text-destructive' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}"
										title="Verify decryption"
									>
										<ShieldCheck class="w-3 h-3" />
									</button>
								</div>
							</div>
							{#if verified?.success === true}
								<div class="mt-3 pt-3 border-t border-border/50">
									<div class="text-xs text-primary flex items-center gap-1.5 mb-1.5">
										<Check class="w-3 h-3" />
										Decryption verified
									</div>
									<div class="text-muted-foreground/80 text-[10px] font-mono truncate">
										→ {truncate(verified.content || '', 50)}
									</div>
								</div>
							{:else if verified?.success === false}
								<div class="mt-2 text-xs text-destructive">Verification failed</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- URL preview -->
				<div in:fade={{ duration: 150, delay: 100 }}>
					<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Share URL</div>
					<div class="font-mono text-sm bg-card border rounded-lg p-4">
						<span class="text-muted-foreground">enigmabin.com/p/</span><span class="text-foreground">demo</span><span class="text-muted-foreground">#</span><span class="text-primary">{truncate(result.decryptionKey, 20)}</span>
					</div>
				</div>
			{:else if isEncrypting}
				<!-- Skeleton: Ciphertext -->
				<div>
					<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ciphertext</div>
					<div class="font-mono text-xs bg-card border rounded-lg p-4 max-h-[80px] overflow-hidden">
						<div class="h-4 bg-muted rounded animate-pulse w-full"></div>
						<div class="h-4 bg-muted rounded animate-pulse w-3/4 mt-1"></div>
					</div>
				</div>

				<!-- Skeleton: Crypto details -->
				<div class="grid sm:grid-cols-2 gap-4">
					<div>
						<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
							{quantumMode ? 'Sealed secrets' : 'Sealed secret'}
						</div>
						<div class="font-mono text-xs bg-card border rounded-lg p-4 space-y-1.5">
							{#if quantumMode}
								<div class="h-4 bg-muted rounded animate-pulse w-full"></div>
							{/if}
							<div class="h-4 bg-muted rounded animate-pulse w-5/6"></div>
							{#if quantumMode}
								<div class="h-4 bg-muted rounded animate-pulse w-3/4"></div>
							{/if}
							<div class="h-4 bg-muted rounded animate-pulse w-2/3"></div>
						</div>
					</div>

					<div>
						<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Decryption key</div>
						<div class="font-mono text-xs bg-card border rounded-lg p-4">
							<div class="h-4 bg-muted rounded animate-pulse w-full"></div>
							<div class="h-4 bg-muted rounded animate-pulse w-1/2 mt-2"></div>
						</div>
					</div>
				</div>

				<!-- Skeleton: URL preview -->
				<div>
					<div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Share URL</div>
					<div class="font-mono text-sm bg-card border rounded-lg p-4">
						<div class="h-5 bg-muted rounded animate-pulse w-3/4"></div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Tech summary -->
		<div class="mt-8 pt-6 border-t flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
			<span><span class="text-foreground">{quantumMode ? 'ML-KEM-1024 + X25519' : 'X25519'}</span> key exchange</span>
			<span><span class="text-foreground">XChaCha20-Poly1305</span>{quantumMode ? ' ×2' : ''}</span>
			<span><span class="text-foreground">{quantumMode ? '~4.3KB' : '88B'}</span> key in URL fragment</span>
		</div>
	</div>
</div>
