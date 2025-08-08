<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { Sparkles, Loader2, Copy, Check, Zap, Target } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let value = '';

	// Ensure value is never undefined
	$: value = value || '';
	export let placeholder = 'Write a brief summary of your professional background and goals...';
	export let label = 'Professional Summary';
	export let id = '';

	let isEnhancing = false;
	let enhancedText = '';
	let showEnhanced = false;
	let copied = false;
	let enhancementLevel = 'standard'; // standard, detailed, executive
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	async function enhanceSummary() {
		if (!value || !value.trim()) return;

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
					const prompt = getEnhancementPrompt();

					const response = await fetch('/api/together', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							model: model,
							max_tokens: 600,
							temperature: 0.7,
							top_p: 0.9,
							prompt: prompt
						})
					});

					if (response.ok) {
						const data = await response.json();
						console.log('AI Summary Response:', data);

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
						console.error(`API Error with model ${model}:`, errorData);
						continue; // Try next model
					}
				} catch (error) {
					console.error(`Error with model ${model}:`, error);
					continue; // Try next model
				}
			}

			// If all models failed
			enhancedText = 'Unable to enhance summary. Please try again.';
			showEnhanced = true;
		} catch (error) {
			console.error('Error enhancing summary:', error);
			enhancedText = 'Unable to enhance summary. Please try again.';
			showEnhanced = true;
		} finally {
			isEnhancing = false;
		}
	}

	function getEnhancementPrompt() {
		const basePrompt = `You are an expert professional resume writer and career coach. Please enhance the following professional summary to make it more compelling, impactful, and professional. 

Original summary: "${value}"

Requirements:
1. Use powerful action verbs and professional language
2. Include specific achievements and quantifiable results where possible
3. Highlight key skills and expertise
4. Make it concise but comprehensive (2-3 sentences)
5. Focus on value proposition and career goals
6. Use industry-standard terminology
7. Make it engaging and memorable

Enhancement level: ${enhancementLevel}

${
	enhancementLevel === 'detailed'
		? 'Provide a more detailed version with specific examples and achievements.'
		: ''
}
${
	enhancementLevel === 'executive'
		? 'Focus on leadership, strategic thinking, and executive-level achievements.'
		: ''
}

IMPORTANT: Return ONLY the enhanced summary. Do NOT include any prefixes like "Result:", "Enhanced:", "Here is:", or any other text. Start directly with the enhanced content.`;

		return basePrompt;
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
		if (cleaned.length > 300) {
			// Try to find the most important sentences
			const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 10);
			if (sentences.length > 2) {
				// Take the first 2-3 most impactful sentences
				cleaned = sentences.slice(0, 3).join('. ') + '.';
			}
		}

		return cleaned;
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
			console.error('Failed to copy text:', error);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			enhanceSummary();
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

	<!-- Enhancement Level Selector -->
	<div class="flex items-center space-x-4 mb-3">
		<span class="text-sm text-gray-600 dark:text-gray-400">Enhancement Level:</span>
		<div class="flex space-x-2">
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={enhancementLevel}
					value="standard"
					class="w-3 h-3 text-blue-600 focus:ring-blue-500"
				/>
				<span class="ml-1 text-xs text-gray-600 dark:text-gray-400">Standard</span>
			</label>
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={enhancementLevel}
					value="detailed"
					class="w-3 h-3 text-blue-600 focus:ring-blue-500"
				/>
				<span class="ml-1 text-xs text-gray-600 dark:text-gray-400">Detailed</span>
			</label>
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={enhancementLevel}
					value="executive"
					class="w-3 h-3 text-blue-600 focus:ring-blue-500"
				/>
				<span class="ml-1 text-xs text-gray-600 dark:text-gray-400">Executive</span>
			</label>
		</div>
	</div>

	<!-- Summary Input -->
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
			on:click={enhanceSummary}
			disabled={isEnhancing || !value || !value.trim()}
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

	<!-- Enhanced Summary -->
	{#if showEnhanced}
		<div
			class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center">
					<Target class="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
					<h4 class="text-sm font-medium text-green-800 dark:text-green-200">Enhanced Summary</h4>
				</div>
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
		Use AI to enhance your summary with professional language and impactful achievements
	</div>
</div>
