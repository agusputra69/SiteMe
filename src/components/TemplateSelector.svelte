<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CVTemplate from '$lib/../components/CVTemplate.svelte';
	import ModernTemplate from '$lib/../components/templates/ModernTemplate.svelte';
	import MinimalistTemplate from '$lib/../components/templates/MinimalistTemplate.svelte';
	import CreativeTemplate from '$lib/../components/templates/CreativeTemplate.svelte';
	import TemplateCustomizer from '$lib/../components/TemplateCustomizer.svelte';
	import { Settings, Palette, Eye } from 'lucide-svelte';
	import type { ProfileData, Theme } from '$lib/types';

	const dispatch = createEventDispatcher();

	export let profileData: ProfileData;
	export let customizable = false;
	export let selectedTemplate = 'classic';
	export let selectedTheme = 'blue';
	export let customization = {
		theme: 'blue',
		fontFamily: 'inter',
		fontSize: 'medium',
		layout: 'standard',
		spacing: 'normal',
		borderRadius: 'medium',
		shadow: 'medium',
		accentColor: '#3B82F6',
		textColor: '#1F2937',
		backgroundColor: '#FFFFFF',
		sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
		lineHeight: 'normal',
		letterSpacing: 'normal',
		headingFont: 'inter',
		containerWidth: 'standard',
		verticalSpacing: 'normal',
		horizontalPadding: 'normal'
	};

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
				{ name: 'Purple', primary: 'purple-500', secondary: 'purple-600', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Red', primary: 'red-500', secondary: 'red-600', accent: 'red-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Indigo', primary: 'indigo-500', secondary: 'indigo-600', accent: 'indigo-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Teal', primary: 'teal-500', secondary: 'teal-600', accent: 'teal-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Orange', primary: 'orange-500', secondary: 'orange-600', accent: 'orange-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Pink', primary: 'pink-500', secondary: 'pink-600', accent: 'pink-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			category: 'Professional'
		},
		{
			id: 'modern',
			name: 'Modern',
			description: 'Contemporary design with gradient header and card-based layout',
			component: ModernTemplate,
			themes: [
				{ name: 'Blue', primary: 'blue-600', secondary: 'blue-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Emerald', primary: 'emerald-600', secondary: 'emerald-500', accent: 'emerald-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Violet', primary: 'violet-600', secondary: 'violet-500', accent: 'violet-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Red', primary: 'red-600', secondary: 'red-500', accent: 'red-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Indigo', primary: 'indigo-600', secondary: 'indigo-500', accent: 'indigo-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Teal', primary: 'teal-600', secondary: 'teal-500', accent: 'teal-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Orange', primary: 'orange-600', secondary: 'orange-500', accent: 'orange-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Pink', primary: 'pink-600', secondary: 'pink-500', accent: 'pink-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			category: 'Contemporary'
		},
		{
			id: 'minimalist',
			name: 'Minimalist',
			description: 'Clean typography-focused design with elegant spacing',
			component: MinimalistTemplate,
			themes: [
				{ name: 'Classic', primary: 'gray-900', secondary: 'gray-700', accent: 'gray-200', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Navy', primary: 'slate-900', secondary: 'slate-700', accent: 'slate-200', text: 'slate-900', textSecondary: 'slate-600' },
				{ name: 'Blue', primary: 'blue-900', secondary: 'blue-700', accent: 'blue-200', text: 'blue-900', textSecondary: 'blue-600' },
				{ name: 'Green', primary: 'green-900', secondary: 'green-700', accent: 'green-200', text: 'green-900', textSecondary: 'green-600' },
				{ name: 'Purple', primary: 'purple-900', secondary: 'purple-700', accent: 'purple-200', text: 'purple-900', textSecondary: 'purple-600' },
				{ name: 'Red', primary: 'red-900', secondary: 'red-700', accent: 'red-200', text: 'red-900', textSecondary: 'red-600' },
				{ name: 'Indigo', primary: 'indigo-900', secondary: 'indigo-700', accent: 'indigo-200', text: 'indigo-900', textSecondary: 'indigo-600' },
				{ name: 'Teal', primary: 'teal-900', secondary: 'teal-700', accent: 'teal-200', text: 'teal-900', textSecondary: 'teal-600' }
			],
			category: 'Simple'
		},
		{
			id: 'creative',
			name: 'Creative',
			description: 'Artistic design with gradients, animations, and modern aesthetics',
			component: CreativeTemplate,
			themes: [
				{ name: 'Purple', primary: 'purple-600', secondary: 'pink-500', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Ocean', primary: 'blue-600', secondary: 'cyan-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Sunset', primary: 'orange-600', secondary: 'red-500', accent: 'orange-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Forest', primary: 'green-600', secondary: 'emerald-500', accent: 'green-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Galaxy', primary: 'indigo-600', secondary: 'purple-500', accent: 'indigo-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Rose', primary: 'pink-600', secondary: 'rose-500', accent: 'pink-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Mint', primary: 'teal-600', secondary: 'green-500', accent: 'teal-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Amber', primary: 'amber-600', secondary: 'yellow-500', accent: 'amber-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			category: 'Artistic'
		}
	];

	const themeColors: Record<string, string> = {
		blue: '#3B82F6',
		green: '#10B981',
		purple: '#8B5CF6',
		red: '#EF4444',
		indigo: '#6366F1',
		teal: '#14B8A6',
		orange: '#F97316',
		pink: '#EC4899'
	};

	let currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
	let currentTheme = currentTemplate.themes.find(t => t.name.toLowerCase() === selectedTheme) || currentTemplate.themes[0];
	let showCustomizer = false;
	let activeView = 'templates'; // templates, themes, customizer

	function selectTemplate(templateId: string) {
		selectedTemplate = templateId;
		currentTemplate = templates.find(t => t.id === templateId) || templates[0];
		currentTheme = currentTemplate.themes[0];
		selectedTheme = currentTheme.name.toLowerCase();
		dispatch('templateChange', { template: templateId, theme: selectedTheme, customization });
	}

	function selectTheme(theme: Theme) {
		currentTheme = theme;
		selectedTheme = theme.name.toLowerCase();
		customization.theme = selectedTheme;
		customization.accentColor = themeColors[selectedTheme] || '#3B82F6';
		dispatch('themeChange', { template: selectedTemplate, theme: selectedTheme, customization });
	}

	function handleCustomizationUpdate(event: CustomEvent) {
		customization = event.detail;
		dispatch('customizationChange', { template: selectedTemplate, theme: selectedTheme, customization });
	}

	function handleCustomizationPreview(event: CustomEvent) {
		dispatch('preview', event.detail);
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<!-- Navigation Tabs -->
	{#if customizable}
		<div class="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
			<button
				on:click={() => activeView = 'templates'}
				class="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
				class:border-blue-500={activeView === 'templates'}
				class:text-blue-600={activeView === 'templates'}
				class:border-transparent={activeView !== 'templates'}
				class:text-gray-500={activeView !== 'templates'}
			>
				<Eye class="w-4 h-4 mr-1 sm:mr-2" />
				<span class="hidden sm:inline">Templates</span>
				<span class="sm:hidden">Temp</span>
			</button>
			<button
				on:click={() => activeView = 'themes'}
				class="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
				class:border-blue-500={activeView === 'themes'}
				class:text-blue-600={activeView === 'themes'}
				class:border-transparent={activeView !== 'themes'}
				class:text-gray-500={activeView !== 'themes'}
			>
				<Palette class="w-4 h-4 mr-1 sm:mr-2" />
				Themes
			</button>
			<button
				on:click={() => activeView = 'customizer'}
				class="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
				class:border-blue-500={activeView === 'customizer'}
				class:text-blue-600={activeView === 'customizer'}
				class:border-transparent={activeView !== 'customizer'}
				class:text-gray-500={activeView !== 'customizer'}
			>
				<Settings class="w-4 h-4 mr-1 sm:mr-2" />
				<span class="hidden sm:inline">Customize</span>
				<span class="sm:hidden">Custom</span>
			</button>
		</div>
	{/if}

	<!-- Template Selector -->
	{#if !customizable || activeView === 'templates'}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Choose Template</h3>
			
			<!-- Template Options -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				{#each templates as template}
				<button
					on:click={() => selectTemplate(template.id)}
					class="p-3 rounded-lg border-2 transition-all duration-200 text-left {
						selectedTemplate === template.id
							? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
							: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
					}"
				>
					<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
						{template.name}
					</h4>
					<p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
						{template.description}
					</p>
				</button>
			{/each}
			</div>
		</div>
	{/if}

	<!-- Theme Options -->
	{#if !customizable || activeView === 'themes'}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Theme Colors</h3>
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
				{#each currentTemplate.themes as theme}
				<button
					on:click={() => selectTheme(theme)}
					class="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg border transition-colors duration-200 {
						currentTheme.name === theme.name
							? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
							: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
					}"
				>
					<div class="flex space-x-1 flex-shrink-0">
						<div class="w-3 h-3 rounded-full bg-{theme.primary}"></div>
						<div class="w-3 h-3 rounded-full bg-{theme.secondary}"></div>
					</div>
					<span class="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
						{theme.name}
					</span>
				</button>
			{/each}
			</div>
		</div>
	{/if}

	<!-- Advanced Customizer -->
	{#if customizable && activeView === 'customizer'}
		<TemplateCustomizer
			{selectedTemplate}
			{customization}
			on:update={handleCustomizationUpdate}
			on:preview={handleCustomizationPreview}
		/>
	{/if}

	<!-- Template Render -->
	<div>
		{#if selectedTemplate === 'classic'}
			<CVTemplate {profileData} {customizable} />
		{:else if selectedTemplate === 'modern'}
			<ModernTemplate {profileData} theme={currentTheme} {customizable} />
		{:else if selectedTemplate === 'minimalist'}
			<MinimalistTemplate {profileData} theme={currentTheme} {customizable} />
		{:else if selectedTemplate === 'creative'}
			<CreativeTemplate {profileData} theme={currentTheme} {customizable} />
		{/if}
	</div>
</div>