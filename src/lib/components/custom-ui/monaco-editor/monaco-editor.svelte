<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as monaco from 'monaco-editor';
    import { cn } from "$lib/utils.js";

    // We only need the editor worker for basic functionality
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

    let {
        value = $bindable(''),
        language = $bindable('javascript'),
        class: className = '',
        readOnly = false,
        automaticLayout = true,
    } = $props();

    let editorElement: HTMLElement;
    let editor: monaco.editor.IStandaloneCodeEditor;
    let observer: MutationObserver;

    function getTheme(): 'vs' | 'vs-dark' {
        return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs';
    }

    onMount(() => {
        // Simple worker setup for basic functionality
        self.MonacoEnvironment = {
            getWorker: function () {
                return new editorWorker();
            }
        };

        editor = monaco.editor.create(editorElement, {
            value,
            language,
            theme: getTheme(),
            automaticLayout,
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: true,
            padding: { top: 8, bottom: 8 },
        });

        editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            if (newValue !== value) {
                value = newValue;
            }
        });

        // Watch for dark mode changes on <html> element
        observer = new MutationObserver(() => {
            monaco.editor.setTheme(getTheme());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    onDestroy(() => {
        observer?.disconnect();
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });

    $effect(() => {
        if (editor) {
            if (editor.getValue() !== value) {
                editor.setValue(value);
            }
            // Update language when it changes
            const model = editor.getModel();
            if (model && model.getLanguageId() !== language) {
                monaco.editor.setModelLanguage(model, language);
            }
        }
    });
</script>

<div
    bind:this={editorElement}
    class={cn(
        "h-full w-full",
        className
    )}
>
</div>