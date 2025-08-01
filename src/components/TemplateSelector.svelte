<script lang="ts">
	import CVTemplate from '$lib/../components/CVTemplate.svelte';
	import ModernTemplate from '$lib/../components/templates/ModernTemplate.svelte';
	import MinimalistTemplate from '$lib/../components/templates/MinimalistTemplate.svelte';
	import CreativeTemplate from '$lib/../components/templates/CreativeTemplate.svelte';
	import type { ProfileData, Theme } from '$lib/types';

	export let profileData: ProfileData;
	export let customizable = false;

	// Template definitions
	const templates = [
		{
			id: 'classic',
			name: 'Classic',
			description: 'Clean and professional design with browser-style header',
			component: CVTemplate,
			themes: [
				{ name: 'Blue', primary: 'blue-500', secondary: 'blue-600', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Green', primary: 'green-500', secondary: 'green-600', accent: 'green-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Purple', primary: 'purple-500', secondary: 'purple-600', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' }
			]
		},
		{
			id: 'modern',
			name: 'Modern',
			description: 'Contemporary design with gradient header and card-based layout',
			component: ModernTemplate,
			themes: [
				{ name: 'Blue', primary: 'blue-600', secondary: 'blue-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Emerald', primary: 'emerald-600', secondary: 'emerald-500', accent: 'emerald-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Violet', primary: 'violet-600', secondary: 'violet-500', accent: 'violet-100', text: 'gray-900', textSecondary: 'gray-600' }
			]
		},
		{
			id: 'minimalist',
			name: 'Minimalist',
			description: 'Clean typography-focused design with elegant spacing',
			component: MinimalistTemplate,
			themes: [
				{ name: 'Classic', primary: 'gray-900', secondary: 'gray-700', accent: 'gray-200', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Navy', primary: 'slate-900', secondary: 'slate-700', accent: 'slate-200', text: 'slate-900', textSecondary: 'slate-600' }
			]
		},
		{
			id: 'creative',
			name: 'Creative',
			description: 'Artistic design with gradients, animations, and modern aesthetics',
			component: CreativeTemplate,
			themes: [
				{ name: 'Purple', primary: 'purple-600', secondary: 'pink-500', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Ocean', primary: 'blue-600', secondary: 'cyan-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' }
			]
		}
	];

	let selectedTemplate = templates[0];
	let selectedTheme = selectedTemplate.themes[0];

	function selectTemplate(template: typeof templates[0]) {
		selectedTemplate = template;
		selectedTheme = template.themes[0];
	}

	function selectTheme(theme: Theme) {
		selectedTheme = theme;
	}
</script>

<div class="space-y-6">
	<!-- Template Selector -->
	{#if customizable}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-4">Choose Template</h3>
			
			<!-- Template Options -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
				{#each templates as template}
					<button
						on:click={() => selectTemplate(template)}
						class="p-3 rounded-lg border-2 transition-all duration-200 text-left {
							selectedTemplate.id === template.id
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
						}"
					>
						<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
							{template.name}
						</h4>
						<p class="text-xs text-gray-600 dark:text-gray-400">
							{template.description}
						</p>
					</button>
				{/each}
			</div>

			<!-- Theme Options -->
			<div>
				<h4 class="font-medium text-gray-900 dark:text-white mb-2 text-sm">Theme Colors</h4>
				<div class="flex flex-wrap gap-2">
					{#each selectedTemplate.themes as theme}
						<button
							on:click={() => selectTheme(theme)}
							class="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors duration-200 {
								selectedTheme.name === theme.name
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
							}"
						>
							<div class="flex space-x-1">
								<div class="w-3 h-3 rounded-full bg-{theme.primary}"></div>
								<div class="w-3 h-3 rounded-full bg-{theme.secondary}"></div>
							</div>
							<span class="text-sm font-medium text-gray-900 dark:text-white">
								{theme.name}
							</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Template Render -->
	<div>
		{#if selectedTemplate.id === 'classic'}
			<CVTemplate {profileData} {customizable} />
		{:else if selectedTemplate.id === 'modern'}
			<ModernTemplate {profileData} theme={selectedTheme} {customizable} />
		{:else if selectedTemplate.id === 'minimalist'}
			<MinimalistTemplate {profileData} theme={selectedTheme} {customizable} />
		{:else if selectedTemplate.id === 'creative'}
			<CreativeTemplate {profileData} theme={selectedTheme} {customizable} />
		{/if}
	</div>
</div>