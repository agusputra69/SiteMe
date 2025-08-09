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
        import type { ProfileData, Theme, TemplateCustomization } from '$lib/types';

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

	// Template definitions
	const templates = [
		{
			id: 'classic',
			name: 'Classic',
			description: 'Clean and professional design with browser-style header',
			component: CVTemplate,
			themes: [
				{
					name: 'Blue',
					primary: 'blue-500',
					secondary: 'blue-600',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Green',
					primary: 'green-500',
					secondary: 'green-600',
					accent: 'green-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Purple',
					primary: 'purple-500',
					secondary: 'purple-600',
					accent: 'purple-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Red',
					primary: 'red-500',
					secondary: 'red-600',
					accent: 'red-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Indigo',
					primary: 'indigo-500',
					secondary: 'indigo-600',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Teal',
					primary: 'teal-500',
					secondary: 'teal-600',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Orange',
					primary: 'orange-500',
					secondary: 'orange-600',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Pink',
					primary: 'pink-500',
					secondary: 'pink-600',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Professional'
		},
		{
			id: 'modern',
			name: 'Modern',
			description: 'Contemporary design with gradient header and card-based layout',
			component: ModernTemplate,
			themes: [
				{
					name: 'Blue',
					primary: 'blue-600',
					secondary: 'blue-500',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Emerald',
					primary: 'emerald-600',
					secondary: 'emerald-500',
					accent: 'emerald-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Violet',
					primary: 'violet-600',
					secondary: 'violet-500',
					accent: 'violet-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Red',
					primary: 'red-600',
					secondary: 'red-500',
					accent: 'red-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Indigo',
					primary: 'indigo-600',
					secondary: 'indigo-500',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Teal',
					primary: 'teal-600',
					secondary: 'teal-500',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Orange',
					primary: 'orange-600',
					secondary: 'orange-500',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Pink',
					primary: 'pink-600',
					secondary: 'pink-500',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Contemporary'
		},
		{
			id: 'minimalist',
			name: 'Minimalist',
			description: 'Clean typography-focused design with elegant spacing',
			component: MinimalistTemplate,
			themes: [
				{
					name: 'Classic',
					primary: 'gray-900',
					secondary: 'gray-700',
					accent: 'gray-200',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Navy',
					primary: 'slate-900',
					secondary: 'slate-700',
					accent: 'slate-200',
					text: 'slate-900',
					textSecondary: 'slate-600'
				},
				{
					name: 'Blue',
					primary: 'blue-900',
					secondary: 'blue-700',
					accent: 'blue-200',
					text: 'blue-900',
					textSecondary: 'blue-600'
				},
				{
					name: 'Green',
					primary: 'green-900',
					secondary: 'green-700',
					accent: 'green-200',
					text: 'green-900',
					textSecondary: 'green-600'
				},
				{
					name: 'Purple',
					primary: 'purple-900',
					secondary: 'purple-700',
					accent: 'purple-200',
					text: 'purple-900',
					textSecondary: 'purple-600'
				},
				{
					name: 'Red',
					primary: 'red-900',
					secondary: 'red-700',
					accent: 'red-200',
					text: 'red-900',
					textSecondary: 'red-600'
				},
				{
					name: 'Indigo',
					primary: 'indigo-900',
					secondary: 'indigo-700',
					accent: 'indigo-200',
					text: 'indigo-900',
					textSecondary: 'indigo-600'
				},
				{
					name: 'Teal',
					primary: 'teal-900',
					secondary: 'teal-700',
					accent: 'teal-200',
					text: 'teal-900',
					textSecondary: 'teal-600'
				}
			],
			category: 'Simple'
		},
		{
			id: 'creative',
			name: 'Creative',
			description: 'Artistic design with gradients, animations, and modern aesthetics',
			component: CreativeTemplate,
			themes: [
				{
					name: 'Purple',
					primary: 'purple-600',
					secondary: 'pink-500',
					accent: 'purple-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Ocean',
					primary: 'blue-600',
					secondary: 'cyan-500',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Sunset',
					primary: 'orange-600',
					secondary: 'red-500',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Forest',
					primary: 'green-600',
					secondary: 'emerald-500',
					accent: 'green-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Galaxy',
					primary: 'indigo-600',
					secondary: 'purple-500',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Rose',
					primary: 'pink-600',
					secondary: 'rose-500',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Mint',
					primary: 'teal-600',
					secondary: 'green-500',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Amber',
					primary: 'amber-600',
					secondary: 'yellow-500',
					accent: 'amber-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Artistic'
		},
		{
			id: 'portfolio',
			name: 'Portfolio',
			description: 'Dynamic portfolio website with project showcase and modern layout',
			component: PortfolioTemplate,
			themes: [
				{
					name: 'Blue',
					primary: 'blue-600',
					secondary: 'blue-500',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Purple',
					primary: 'purple-600',
					secondary: 'purple-500',
					accent: 'purple-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Green',
					primary: 'green-600',
					secondary: 'green-500',
					accent: 'green-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Red',
					primary: 'red-600',
					secondary: 'red-500',
					accent: 'red-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Indigo',
					primary: 'indigo-600',
					secondary: 'indigo-500',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Teal',
					primary: 'teal-600',
					secondary: 'teal-500',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Orange',
					primary: 'orange-600',
					secondary: 'orange-500',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Pink',
					primary: 'pink-600',
					secondary: 'pink-500',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Portfolio'
		},
		{
			id: 'personal',
			name: 'Personal',
			description: 'Personal branding focused template with clean modern design',
			component: PersonalTemplate,
			themes: [
				{
					name: 'Blue',
					primary: 'blue-600',
					secondary: 'blue-500',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Purple',
					primary: 'purple-600',
					secondary: 'purple-500',
					accent: 'purple-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Green',
					primary: 'green-600',
					secondary: 'green-500',
					accent: 'green-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Red',
					primary: 'red-600',
					secondary: 'red-500',
					accent: 'red-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Indigo',
					primary: 'indigo-600',
					secondary: 'indigo-500',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Teal',
					primary: 'teal-600',
					secondary: 'teal-500',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Orange',
					primary: 'orange-600',
					secondary: 'orange-500',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Pink',
					primary: 'pink-600',
					secondary: 'pink-500',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Portfolio'
		},
		{
			id: 'creative-portfolio',
			name: 'Creative Portfolio',
			description: 'Creative portfolio with gradients, animations and modern aesthetics',
			component: CreativePortfolioTemplate,
			themes: [
				{
					name: 'Purple',
					primary: 'purple-600',
					secondary: 'pink-500',
					accent: 'purple-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Ocean',
					primary: 'blue-600',
					secondary: 'cyan-500',
					accent: 'blue-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Sunset',
					primary: 'orange-600',
					secondary: 'red-500',
					accent: 'orange-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Forest',
					primary: 'green-600',
					secondary: 'emerald-500',
					accent: 'green-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Galaxy',
					primary: 'indigo-600',
					secondary: 'purple-500',
					accent: 'indigo-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Rose',
					primary: 'pink-600',
					secondary: 'rose-500',
					accent: 'pink-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Mint',
					primary: 'teal-600',
					secondary: 'green-500',
					accent: 'teal-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				},
				{
					name: 'Amber',
					primary: 'amber-600',
					secondary: 'yellow-500',
					accent: 'amber-100',
					text: 'gray-900',
					textSecondary: 'gray-600'
				}
			],
			category: 'Portfolio'
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

	let currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];
	let currentTheme =
		currentTemplate.themes.find((t) => t.name.toLowerCase() === selectedTheme) ||
		currentTemplate.themes[0];
	let showCustomizer = false;
	let activeView = 'templates'; // templates, themes, customizer

	// Update current template and theme when props change
	$: if (selectedTemplate) {
		currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];
	}
	$: if (selectedTheme && currentTemplate) {
		currentTheme =
			currentTemplate.themes.find((t) => t.name.toLowerCase() === selectedTheme) ||
			currentTemplate.themes[0];
	}

	function selectTemplate(templateId: string) {
		selectedTemplate = templateId;
		currentTemplate = templates.find((t) => t.id === templateId) || templates[0];
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
		dispatch('customizationChange', {
			template: selectedTemplate,
			theme: selectedTheme,
			customization
		});
	}

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
					{#each currentTemplate.themes as theme}
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
