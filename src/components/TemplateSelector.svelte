<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CVTemplate from '$lib/../components/CVTemplate.svelte';
	import ModernTemplate from '$lib/../components/templates/ModernTemplate.svelte';
	import MinimalistTemplate from '$lib/../components/templates/MinimalistTemplate.svelte';
	import CreativeTemplate from '$lib/../components/templates/CreativeTemplate.svelte';
	import PortfolioTemplate from '$lib/../components/templates/PortfolioTemplate.svelte';
	import PersonalTemplate from '$lib/../components/templates/PersonalTemplate.svelte';
	import CreativePortfolioTemplate from '$lib/../components/templates/CreativePortfolioTemplate.svelte';
	import TemplateCustomizer from '$lib/../components/TemplateCustomizer.svelte';
	import { Settings, Palette, Eye } from 'lucide-svelte';
	import type { ProfileData, TemplateCustomization } from '$lib/types';
	import { 
		TEMPLATES, 
		THEME_COLORS, 
		getTemplateById, 
		getThemeByName, 
		getThemeDescription,
		type Theme,
		type TemplateConfig
	} from '$lib/templateConfig';

	const dispatch = createEventDispatcher();

	export let profileData: ProfileData;
	export let customizable = false;
	export let selectedTemplate = 'classic';
	export let selectedTheme = 'blue';
        export let customization: TemplateCustomization = {
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

	/**
	 * Template configurations imported from external config
	 */
	const templates = TEMPLATES;


	/**
	 * Theme colors imported from external config
	 */
	const themeColors = THEME_COLORS;

	let currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];
	let currentTheme =
		currentTemplate?.themes?.find((t) => t.name.toLowerCase() === selectedTheme) ||
		currentTemplate?.themes?.[0] ||
		templates[0]?.themes?.[0];
	let showCustomizer = false;
	let activeView = 'templates'; // templates, themes, customizer

	/**
	 * Updates current template when selectedTemplate prop changes
	 */
	$: if (selectedTemplate) {
		currentTemplate = getTemplateById(selectedTemplate) || templates[0];
	}

	/**
	 * Updates current theme when selectedTheme prop changes
	 */
	$: if (selectedTheme && currentTemplate && currentTemplate.themes) {
		currentTheme = getThemeByName(currentTemplate, selectedTheme) || currentTemplate.themes[0];
	}

	/**
	 * Handles template selection and updates related state
	 * @param templateId - The ID of the selected template
	 */
	function selectTemplate(templateId: string) {
		selectedTemplate = templateId;
		currentTemplate = getTemplateById(templateId) || templates[0];
		if (currentTemplate?.themes?.length) {
			currentTheme = currentTemplate.themes[0];
			selectedTheme = currentTheme.name.toLowerCase();
		}
		dispatch('templateChange', { template: templateId, theme: selectedTheme, customization });
	}

	/**
	 * Handles theme selection and updates customization
	 * @param theme - The selected theme object
	 */
	function selectTheme(theme: Theme) {
		currentTheme = theme;
		selectedTheme = theme.name.toLowerCase();
		customization.theme = selectedTheme;
		customization.accentColor = themeColors[selectedTheme] || '#3B82F6';
		dispatch('themeChange', { template: selectedTemplate, theme: selectedTheme, customization });
	}

	/**
	 * Handles customization updates from TemplateCustomizer
	 * @param event - CustomEvent containing customization data
	 */
	function handleCustomizationUpdate(event: CustomEvent) {
		customization = event.detail;
		dispatch('customizationChange', {
			template: selectedTemplate,
			theme: selectedTheme,
			customization
		});
	}

	/**
	 * Handles customization preview events
	 * @param event - CustomEvent containing preview data
	 */
	function handleCustomizationPreview(event: CustomEvent) {
		dispatch('preview', event.detail);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Design Your Resume</h2>
		<p class="text-sm text-gray-600 dark:text-gray-400">Choose a template, customize colors, and make it uniquely yours</p>
	</div>

	<!-- Navigation Tabs -->
	{#if customizable}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
			<div class="grid grid-cols-3 gap-1">
				<button
					on:click={() => (activeView = 'templates')}
					class="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200"
					class:bg-white={activeView === 'templates'}
					class:shadow-sm={activeView === 'templates'}
					class:text-blue-600={activeView === 'templates'}
					class:text-gray-600={activeView !== 'templates'}
					class:hover:text-gray-900={activeView !== 'templates'}
				>
					<Eye class="w-4 h-4 mr-2" />
					Templates
				</button>
				<button
					on:click={() => (activeView = 'themes')}
					class="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200"
					class:bg-white={activeView === 'themes'}
					class:shadow-sm={activeView === 'themes'}
					class:text-blue-600={activeView === 'themes'}
					class:text-gray-600={activeView !== 'themes'}
					class:hover:text-gray-900={activeView !== 'themes'}
				>
					<Palette class="w-4 h-4 mr-2" />
					Colors
				</button>
				<button
					on:click={() => (activeView = 'customizer')}
					class="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200"
					class:bg-white={activeView === 'customizer'}
					class:shadow-sm={activeView === 'customizer'}
					class:text-blue-600={activeView === 'customizer'}
					class:text-gray-600={activeView !== 'customizer'}
					class:hover:text-gray-900={activeView !== 'customizer'}
				>
					<Settings class="w-4 h-4 mr-2" />
					Advanced
				</button>
			</div>
		</div>
	{/if}

	<!-- Template Selector -->
	{#if !customizable || activeView === 'templates'}
		<div class="space-y-4">
			<div class="text-center">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					Choose Your Template
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Select a professional layout that matches your style
				</p>
			</div>

			<!-- Template Options -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each templates as template}
					<button
						on:click={() => selectTemplate(template.id)}
						class="group relative p-4 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg {selectedTemplate ===
						template.id
							? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
							: 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 bg-white dark:bg-gray-800'}"
					>
						{#if selectedTemplate === template.id}
							<div class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}
						<div class="mb-3">
							<span class="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full mb-2">
								{template.category}
							</span>
						</div>
						<h4 class="font-semibold text-gray-900 dark:text-white text-base mb-2">
							{template.name}
						</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
							{template.description}
						</p>
						<div class="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
							<span class="mr-3">{template.themes.length} color themes</span>
							<span>Professional</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Theme Options -->
	{#if !customizable || activeView === 'themes'}
		<div class="space-y-4">
			<div class="text-center">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					Choose Your Colors
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Select a color scheme that represents your personality
				</p>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{#each currentTemplate?.themes || [] as theme}
						<button
							on:click={() => selectTheme(theme)}
							class="group relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md {currentTheme.name ===
							theme.name
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
								: 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'}"
						>
							{#if currentTheme.name === theme.name}
								<div class="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
									<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
							<div class="flex justify-center space-x-1 mb-3">
								<div class="w-6 h-6 rounded-full bg-{theme.primary} border-2 border-white shadow-sm" />
								<div class="w-6 h-6 rounded-full bg-{theme.secondary} border-2 border-white shadow-sm" />
							</div>
							<div class="text-center">
								<span class="text-sm font-medium text-gray-900 dark:text-white">
									{theme.name}
								</span>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{theme.name === 'Blue' ? 'Professional & Trustworthy' : 
									 theme.name === 'Green' ? 'Fresh & Growth-oriented' :
									 theme.name === 'Purple' ? 'Creative & Innovative' :
									 theme.name === 'Red' ? 'Bold & Energetic' :
									 theme.name === 'Indigo' ? 'Modern & Sophisticated' :
									 theme.name === 'Teal' ? 'Calm & Balanced' :
									 theme.name === 'Orange' ? 'Vibrant & Enthusiastic' :
									 theme.name === 'Pink' ? 'Creative & Approachable' : 'Professional'}
								</p>
							</div>
						</button>
					{/each}
				</div>
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
		<!-- Debug: Current template: {selectedTemplate}, theme: {selectedTheme} -->
		{#if selectedTemplate === 'classic'}
			<CVTemplate
				profileData={{
					...profileData,
					skills: profileData.skills || [],
					certifications: profileData.certifications || [],
					languages: profileData.languages || [],
					projects: profileData.projects || [],
					awards: profileData.awards || []
				}}
				{customizable}
				{customization}
			/>
		{:else if selectedTemplate === 'modern'}
			<ModernTemplate {profileData} theme={currentTheme} {customizable} {customization} />
		{:else if selectedTemplate === 'minimalist'}
			<MinimalistTemplate {profileData} theme={currentTheme} {customizable} {customization} />
		{:else if selectedTemplate === 'creative'}
			<CreativeTemplate {profileData} theme={currentTheme} {customizable} {customization} />
		{:else if selectedTemplate === 'portfolio'}
			<PortfolioTemplate {profileData} theme={currentTheme} {customizable} />
		{:else if selectedTemplate === 'personal'}
			<PersonalTemplate {profileData} theme={currentTheme} {customizable} />
		{:else if selectedTemplate === 'creative-portfolio'}
			<CreativePortfolioTemplate {profileData} theme={currentTheme} {customizable} />
		{/if}
	</div>
</div>
