<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { Sparkles, Loader2, Copy, Check } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let placeholder = 'Describe your responsibilities and achievements...';
	export let label = 'Description';
	export let id = '';

	let isEnhancing = false;
	let enhancedText = '';
	let showEnhanced = false;
	let copied = false;
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	let errorMessage = '';

	async function enhanceDescription() {
		if (!value.trim()) return;

		isEnhancing = true;
		showEnhanced = false;

		try {
			// Try different models in order of preference
			const models = [
				'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
				'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
				'lgai/exaone-deep-32b'
			];

			for (const model of models) {
				try {
					const response = await fetch('/api/together', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							model: model,
							max_tokens: 400,
							temperature: 0.6,
							top_p: 0.9,
							prompt: `You are an expert professional resume writer with 15+ years of experience. Please enhance the following job description to make it more compelling, professional, and impactful.

Original description: "${value}"

Requirements:
1. Use powerful action verbs (e.g., "Led", "Developed", "Implemented", "Optimized", "Delivered")
2. Include specific metrics, percentages, and quantifiable results where possible
3. Focus on achievements and outcomes, not just responsibilities
4. Use industry-standard terminology and professional language
5. Make it concise but comprehensive (3-4 bullet points or 2-3 sentences)
6. Highlight leadership, problem-solving, and innovation
7. Include relevant technical skills and tools used
8. Emphasize business impact and value delivered

IMPORTANT: Return ONLY the enhanced description. Do NOT include any prefixes like "Result:", "Enhanced:", "Here is:", or any other text. Start directly with the enhanced content.`
						})
					});

					if (response.ok) {
						const data = await response.json();
						// AI response received

						// Handle different response formats
						let extractedText = '';
						if (data.output?.choices?.[0]?.text) {
							extractedText = data.output.choices[0].text;
						} else if (data.output) {
							extractedText = data.output;
						} else if (data.choices?.[0]?.text) {
							extractedText = data.choices[0].text;
						} else {
							continue; // Try next model
						}

						// Clean and summarize the enhanced text
						enhancedText = cleanAndSummarizeText(extractedText.trim());
						showEnhanced = true;
						return; // Success, exit the function
					} else {
						const errorData = await response.json();
						errorMessage = `API Error with model ${model}. Please try again.`;
						continue; // Try next model
					}
				} catch (error) {
					errorMessage = `Error with model ${model}. Please try again.`;
					continue; // Try next model
				}
			}

			// If all models failed
			enhancedText = 'Unable to enhance description. Please try again.';
			showEnhanced = true;
		} catch (error) {
			errorMessage = 'Error enhancing description. Please try again.';
			enhancedText = 'Unable to enhance description. Please try again.';
			showEnhanced = true;
		} finally {
			isEnhancing = false;
		}
	}

	function useEnhancedText() {
		value = enhancedText;
		dispatch('input', { value: enhancedText });
		showEnhanced = false;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(enhancedText);
			copied = true;

			// Clear any existing timeout
			if (copyTimeout) {
				clearTimeout(copyTimeout);
			}

			copyTimeout = setTimeout(() => {
				copied = false;
				copyTimeout = null;
			}, 2000);
		} catch (error) {
			errorMessage = 'Failed to copy text. Please try again.';
		}
	}

	function cleanAndSummarizeText(text: string): string {
		// Remove any markdown formatting
		let cleaned = text.replace(/```[\s\S]*?```/g, '');
		cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
		cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
		cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

		// Remove any thinking tags or system messages
		cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '');
		cleaned = cleaned.replace(/\[.*?\]/g, '');

		// Remove common AI response prefixes
		cleaned = cleaned.replace(
			/^(Result|Enhanced|Here is|Here's|The enhanced|Enhanced description):\s*/i,
			''
		);
		cleaned = cleaned.replace(
			/^(Here is the enhanced|Here's the enhanced|The enhanced description|Enhanced version):\s*/i,
			''
		);
		cleaned = cleaned.replace(/^(Result|Output|Response):\s*/i, '');

		// Clean up extra whitespace
		cleaned = cleaned.replace(/\s+/g, ' ').trim();

		// If the text is too long, summarize it
		if (cleaned.length > 400) {
			// Try to find the most important sentences or bullet points
			const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 10);
			if (sentences.length > 3) {
				// Take the first 3-4 most impactful sentences
				cleaned = sentences.slice(0, 4).join('. ') + '.';
			}
		}

		return cleaned;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			enhanceDescription();
		}
	}

	// Cleanup on component destroy
	onDestroy(() => {
		if (copyTimeout) {
			clearTimeout(copyTimeout);
		}
	});
</script>

<div class="space-y-3">
	<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>

	<!-- Description Input -->
	<textarea
		bind:value
		{id}
		rows="4"
		{placeholder}
		on:keydown={handleKeydown}
		class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
	/>

	<!-- AI Enhancement Button -->
	<div class="flex items-center justify-between">
		<button
			type="button"
			on:click={enhanceDescription}
			disabled={isEnhancing || !value.trim()}
			class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
		>
			{#if isEnhancing}
				<Loader2 class="w-4 h-4 mr-2 animate-spin" />
				Enhancing...
			{:else}
				<Sparkles class="w-4 h-4 mr-2" />
				Enhance with AI
			{/if}
		</button>

		<div class="text-xs text-gray-500 dark:text-gray-400">Press Ctrl+Enter to enhance</div>
	</div>

	<!-- Enhanced Description -->
	{#if showEnhanced}
		<div
			class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
		>
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-sm font-medium text-green-800 dark:text-green-200">Enhanced Description</h4>
				<div class="flex items-center space-x-2">
					<button
						type="button"
						on:click={copyToClipboard}
						class="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
						title="Copy to clipboard"
					>
						{#if copied}
							<Check class="w-4 h-4" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
					</button>
				</div>
			</div>

			<p class="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-3">
				{enhancedText}
			</p>

			<div class="flex items-center space-x-3">
				<button
					type="button"
					on:click={useEnhancedText}
					class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
				>
					Use Enhanced Version
				</button>
				<button
					type="button"
					on:click={() => (showEnhanced = false)}
					class="px-3 py-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm transition-colors"
				>
					Dismiss
				</button>
			</div>
		</div>
	{/if}

	<!-- Help Text -->
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Use AI to enhance your description with professional language and quantifiable achievements
	</div>
</div>
