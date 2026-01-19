<script lang="ts">
	import '../app.css';
	import 'overlayscrollbars/overlayscrollbars.css';
	import { ModeWatcher } from "mode-watcher";
	import { toggleMode } from "mode-watcher";
	import { Sun, Moon } from '@lucide/svelte';
	import { Button } from "$lib/components/ui/button/index.js";
	import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { MetaTags } from 'svelte-meta-tags';

	let { children } = $props();

	const defaultMeta = {
		title: 'EnigmaBin',
		titleTemplate: '%s | EnigmaBin',
		description: 'Zero-knowledge encrypted pastebin. Your content is encrypted in your browser before it leaves. We can\'t read your pastes.',
		canonical: 'https://enigmabin.com',
		openGraph: {
			type: 'website',
			url: 'https://enigmabin.com',
			title: 'EnigmaBin',
			description: 'Zero-knowledge encrypted pastebin. End-to-end encryption means we can\'t read your pastes.',
			siteName: 'EnigmaBin',
			images: [{ url: 'https://enigmabin.com/og/home.png', width: 1200, height: 630, alt: 'EnigmaBin - Zero-knowledge encrypted pastebin' }]
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			title: 'EnigmaBin',
			description: 'Zero-knowledge encrypted pastebin. End-to-end encryption means we can\'t read your pastes.',
			image: 'https://enigmabin.com/og/home.png'
		}
	};
</script>

<MetaTags {...defaultMeta} />

<OverlayScrollbarsComponent
	element="div"
	options={{ scrollbars: { autoHide: 'scroll' } }}
	class="h-screen flex flex-col"
	defer
>
	<header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
		<div class="container flex h-14 items-center justify-between">
			<a href="/" class="font-semibold text-lg tracking-tight">
				enigmabin
			</a>
			<nav class="flex items-center gap-1">
				<a href="/about" class="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
					About
				</a>
				<a href="/faq" class="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
					FAQ
				</a>
				<a href="/new" class="ml-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
					New Paste
				</a>
				<Button onclick={toggleMode} variant="ghost" size="icon" class="ml-1 h-8 w-8">
					<Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span class="sr-only">Toggle theme</span>
				</Button>
			</nav>
		</div>
	</header>

	<ModeWatcher />
	<Toaster />

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t py-6 text-sm text-muted-foreground">
		<div class="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<p>End-to-end encrypted. Zero knowledge.</p>
			<div class="flex gap-4">
				<a href="mailto:contact@enigmabin.com" class="hover:text-foreground transition-colors">Contact</a>
				<a href="https://github.com/giorgiobrullo/enigmabin" target="_blank" rel="noreferrer" class="hover:text-foreground transition-colors">GitHub</a>
			</div>
		</div>
	</footer>
</OverlayScrollbarsComponent>
