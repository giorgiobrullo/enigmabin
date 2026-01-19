<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { MetaTags } from 'svelte-meta-tags';
</script>

<MetaTags
	title="FAQ"
	description="Frequently asked questions about EnigmaBin. Learn about encryption, URL security, burn-after-reading, quantum mode, and more."
	canonical="https://enigmabin.com/faq"
	openGraph={{
		images: [{ url: 'https://enigmabin.com/og/faq.png', width: 1200, height: 630 }]
	}}
	twitter={{
		cardType: 'summary_large_image',
		image: 'https://enigmabin.com/og/faq.png'
	}}
/>

<Tooltip.Provider>
<div class="container py-16 md:py-24">
	<div class="max-w-2xl">
		<h1 class="text-2xl font-bold tracking-tight mb-12">FAQ</h1>

		<div class="space-y-8">
			<div>
				<h2 class="font-medium mb-2">How secure is this?</h2>
				<p class="text-muted-foreground">
					Content is encrypted in your browser before it leaves. The key stays in the
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">URL fragment</Tooltip.Trigger>
						<Tooltip.Content>The part after #. Browsers strip this before sending requests to servers.</Tooltip.Content>
					</Tooltip.Root>,
					which browsers don't send to servers per
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">RFC 3986</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">The URI standard. Section 3.5 defines fragments as client-only; they're never transmitted in HTTP requests.</Tooltip.Content>
					</Tooltip.Root>. We only store
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">ciphertext</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Encrypted data. Indistinguishable from random bytes without the key.</Tooltip.Content>
					</Tooltip.Root>. Even with full database access, your content is unrecoverable without the key.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">What URLs do I get?</h2>
				<p class="text-muted-foreground">
					Two separate URLs: a <span class="text-foreground">decryption URL</span> to view/share the paste,
					and a <span class="text-foreground">deletion URL</span> to manually delete it. Keep them separate.
					The decryption URL contains the key; the deletion URL contains a token we hash and store.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">I lost my decryption URL. Can you recover it?</h2>
				<p class="text-muted-foreground">
					No. The key only exists in your URL. Without it, the data is unrecoverable. By design.
					We never see the key, so we can't help you.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">I lost my deletion URL. Can I still delete the paste?</h2>
				<p class="text-muted-foreground">
					No. The deletion token is only given once at creation. You'll need to wait for expiration,
					or use burn-after-reading if you enabled it.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">How does burn-after-reading work?</h2>
				<p class="text-muted-foreground">
					The server verifies you possess the decryption key before releasing the ciphertext,
					then deletes atomically. The recipient can still save content after viewing, but
					the paste itself is gone.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">Should I use quantum mode?</h2>
				<p class="text-muted-foreground">
					Default
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">X25519</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Curve25519 elliptic-curve Diffie-Hellman. 128-bit security, constant-time, no weak keys.</Tooltip.Content>
					</Tooltip.Root> is fine for most cases. Quantum mode adds
					<Tooltip.Root>
						<Tooltip.Trigger class="text-foreground underline decoration-dotted underline-offset-4 cursor-help">ML-KEM-1024</Tooltip.Trigger>
						<Tooltip.Content class="max-w-xs">Module-Lattice KEM, NIST FIPS 203. Formerly Kyber. Resistant to Shor's algorithm for quantum computers.</Tooltip.Content>
					</Tooltip.Root>
					for protection against future quantum computers. Tradeoff: URLs grow from ~88 bytes to ~4.3KB.
					Use it for data that needs to stay secure for decades.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">Why should I trust you?</h2>
				<p class="text-muted-foreground">
					You don't have to. The code is <a href="https://github.com/giorgiobrullo/enigmabin" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:text-primary">open source</a>.
					Encryption happens client-side before anything leaves your browser. Verify it yourself,
					or self-host if you prefer.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">Size limit?</h2>
				<p class="text-muted-foreground">
					2MB. Enough for code and configs. For larger files, use something else.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">Expiration options?</h2>
				<p class="text-muted-foreground">
					1 hour, 1 day, 1 week, 30 days, or never. Expired pastes are deleted automatically.
				</p>
			</div>

			<div>
				<h2 class="font-medium mb-2">Contact?</h2>
				<p class="text-muted-foreground">
					<a href="mailto:contact@enigmabin.com" class="text-foreground underline underline-offset-4 hover:text-primary">contact@enigmabin.com</a> or
					<a href="https://github.com/giorgiobrullo/enigmabin/issues" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:text-primary">GitHub issues</a>.
				</p>
			</div>
		</div>
	</div>
</div>
</Tooltip.Provider>
