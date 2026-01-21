<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { MetaTags } from 'svelte-meta-tags';
</script>

<MetaTags
	title="About"
	description="Learn how EnigmaBin uses X25519 key exchange and ChaCha20-Poly1305 encryption to keep your pastes private. Optional ML-KEM-1024 for quantum resistance."
	canonical="https://enigmabin.com/about"
	openGraph={{
		images: [{ url: 'https://enigmabin.com/og/about.png', width: 1200, height: 630 }]
	}}
	twitter={{
		cardType: 'summary_large_image',
		image: 'https://enigmabin.com/og/about.png'
	}}
/>

<Tooltip.Provider>
<div class="container py-16 md:py-24">
	<div class="max-w-2xl">
		<h1 class="text-2xl font-bold tracking-tight mb-8">Zero-knowledge pastebin</h1>

		<div class="space-y-6 text-muted-foreground">
			<p>
				Most pastebins store your content in plain text. The service can read it. Anyone
				who breaches their servers can read it. Law enforcement can request it.
			</p>

			<p>
				EnigmaBin is different. Your browser encrypts everything <em>before</em> it leaves
				your device. The decryption key lives in the
				<Tooltip.Root>
					<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">URL fragment</Tooltip.Trigger>
					<Tooltip.Content>The part after #. Per RFC 3986, browsers strip this before sending requests.</Tooltip.Content>
				</Tooltip.Root>, which never reaches our servers.
			</p>

			<p class="text-foreground font-medium">
				We can't read your pastes. Not because we promise not to, but because we
				physically can't.
			</p>
		</div>

		<hr class="my-12 border-border" />

		<div class="space-y-8">
			<div>
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Crypto</h2>
				<p class="text-muted-foreground">
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">X25519</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Curve25519 ECDH. 128-bit security, constant-time, no weak keys. Designed by djb.</Tooltip.Content>
					</Tooltip.Root> key exchange with
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">ChaCha20-Poly1305</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Stream cipher + MAC. AEAD construction—encrypts and authenticates in one pass. Faster than AES on devices without hardware acceleration.</Tooltip.Content>
					</Tooltip.Root> authenticated encryption.
					Same primitives as WireGuard and Signal.
					Optional
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">ML-KEM-1024</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Module-Lattice KEM, NIST FIPS 203. Formerly known as Kyber. Resistant to Shor's algorithm—safe against quantum computers.</Tooltip.Content>
					</Tooltip.Root> for post-quantum protection.
				</p>
			</div>

			<div>
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">What we store</h2>
				<p class="text-muted-foreground">
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">Ciphertext</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Indistinguishable from random bytes without the key. Even with full database access, content is unrecoverable.</Tooltip.Content>
					</Tooltip.Root>. Expiration timestamp.
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">Burn token hash</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">SHA-256 of a random token. You get the token, we store only the hash. Database access can't recover it.</Tooltip.Content>
					</Tooltip.Root>. That's it.
					No IPs, no user agents, no cookies.
				</p>
			</div>

			<div>
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Source</h2>
				<p class="text-muted-foreground">
					Fully open source. Audit it, fork it, self-host it.
					<a
						href="https://github.com/giorgiobrullo/enigmabin"
						target="_blank"
						rel="noreferrer"
						class="text-foreground underline underline-offset-4 hover:text-primary"
					>GitHub →</a>
				</p>
			</div>

			<div>
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Tor</h2>
				<p class="text-muted-foreground">
					Available as a Tor hidden service for anonymous access.
					<a
						href="http://enigmabinwlvg6hyekqa6ks3cw3b6jyynmpqrc5zc23g3rgngvu4w3id.onion"
						class="text-foreground underline underline-offset-4 hover:text-primary break-all"
					>enigmabinwlvg6hyekqa6ks3cw3b6jyynmpqrc5zc23g3rgngvu4w3id.onion</a>
				</p>
			</div>

			<div>
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Who</h2>
				<p class="text-muted-foreground">
					Solo project by <a
						href="https://github.com/giorgiobrullo"
						target="_blank"
						rel="noreferrer"
						class="text-foreground underline underline-offset-4 hover:text-primary"
					>Giorgio</a>.
				</p>
			</div>
		</div>
	</div>
</div>
</Tooltip.Provider>
