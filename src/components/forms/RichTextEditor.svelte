<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		Bold,
		Italic,
		List,
		ListOrdered,
		AlignLeft,
		AlignCenter,
		AlignRight
	} from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let placeholder = '';
	export let rows = 4;
	export let label = '';
	export let id = '';

	let textarea: HTMLTextAreaElement;
	let isBold = false;
	let isItalic = false;
	let isBulletList = false;
	let isNumberedList = false;
	let alignment: 'left' | 'center' | 'right' = 'left';

	function formatText(command: string, value?: string) {
		textarea.focus();
		document.execCommand(command, false, value);
		updateValue();
	}

	function insertList(type: 'bullet' | 'numbered') {
		textarea.focus();
		const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
		const lines = selection.split('\n');
		const formattedLines = lines.map((line) => {
			if (type === 'bullet') {
				return line.trim() ? `• ${line.trim()}` : line;
			} else {
				return line.trim() ? `1. ${line.trim()}` : line;
			}
		});
		const formattedText = formattedLines.join('\n');

		// Replace the selected text
		const before = textarea.value.substring(0, textarea.selectionStart);
		const after = textarea.value.substring(textarea.selectionEnd);
		textarea.value = before + formattedText + after;

		updateValue();
	}

	function updateValue() {
		value = textarea.value;
		dispatch('input', { value });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			formatText('insertParagraph');
		}
	}
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
	{/if}

	<!-- Toolbar -->
	<div
		class="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-lg"
	>
		<button
			type="button"
			on:click={() => formatText('bold')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
			title="Bold (Ctrl+B)"
		>
			<Bold class="w-4 h-4" />
		</button>
		<button
			type="button"
			on:click={() => formatText('italic')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
			title="Italic (Ctrl+I)"
		>
			<Italic class="w-4 h-4" />
		</button>

		<div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

		<button
			type="button"
			on:click={() => insertList('bullet')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
			title="Bullet List"
		>
			<List class="w-4 h-4" />
		</button>
		<button
			type="button"
			on:click={() => insertList('numbered')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
			title="Numbered List"
		>
			<ListOrdered class="w-4 h-4" />
		</button>

		<div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

		<button
			type="button"
			on:click={() => (alignment = 'left')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors {alignment ===
			'left'
				? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
				: ''}"
			title="Align Left"
		>
			<AlignLeft class="w-4 h-4" />
		</button>
		<button
			type="button"
			on:click={() => (alignment = 'center')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors {alignment ===
			'center'
				? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
				: ''}"
			title="Align Center"
		>
			<AlignCenter class="w-4 h-4" />
		</button>
		<button
			type="button"
			on:click={() => (alignment = 'right')}
			class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors {alignment ===
			'right'
				? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
				: ''}"
			title="Align Right"
		>
			<AlignRight class="w-4 h-4" />
		</button>
	</div>

	<!-- Textarea -->
	<textarea
		bind:this={textarea}
		bind:value
		{id}
		{rows}
		{placeholder}
		on:input={updateValue}
		on:keydown={handleKeydown}
		class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
		style="text-align: {alignment}"
	/>

	<!-- Help text -->
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Use Ctrl+Enter for new line • Ctrl+B for bold • Ctrl+I for italic
	</div>
</div>
