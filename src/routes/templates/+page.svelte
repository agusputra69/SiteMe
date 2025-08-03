<script lang="ts">
	import ModernTemplate from '$lib/../components/templates/ModernTemplate.svelte';
	import MinimalistTemplate from '$lib/../components/templates/MinimalistTemplate.svelte';
	import CreativeTemplate from '$lib/../components/templates/CreativeTemplate.svelte';
	import CVTemplate from '$lib/../components/CVTemplate.svelte';
	import type { ProfileData, Theme, Template } from '$lib/types';

	// Sample data for previews
	const sampleData: ProfileData = {
		name: 'Alex Johnson',
		avatar: 'AJ',
		about: "I'm a passionate software engineer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud technologies, with a focus on creating user-centric solutions that drive business growth.",
		workExperience: [
			{
				title: 'Senior Software Engineer',
				company: 'TechCorp Inc.',
				type: 'Full-Time',
				period: '2022 - Present',
				current: true,
				description: 'Lead development of microservices architecture serving 1M+ users'
			},
			{
				title: 'Full Stack Developer',
				company: 'StartupXYZ',
				type: 'Full-Time',
				period: '2020 - 2022',
				current: false,
				description: 'Built and maintained React applications with Node.js backends'
			}
		],
		education: [
			{
				institution: 'University of Technology',
				degree: 'Bachelor of Science in Computer Science',
				period: '2016 - 2020'
			}
		],
		skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL'],
		projects: [],
		certifications: [],
		languages: [],
		awards: [],
		links: [],
		contact: {
			email: 'alex@example.com',
			phone: '+1 (555) 123-4567',
			location: 'San Francisco, CA'
		}
	};

	// Template definitions
	const templates = [
		{
			id: 'classic',
			name: 'Classic',
			description: 'Clean and professional design with browser-style header',
			component: CVTemplate,
			category: 'Professional',
			themes: [
				{ name: 'Blue', primary: 'blue-500', secondary: 'blue-600', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Green', primary: 'green-500', secondary: 'green-600', accent: 'green-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Purple', primary: 'purple-500', secondary: 'purple-600', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Red', primary: 'red-500', secondary: 'red-600', accent: 'red-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Indigo', primary: 'indigo-500', secondary: 'indigo-600', accent: 'indigo-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			features: ['Browser Header', 'Compact Layout', 'Real-time Editing']
		},
		{
			id: 'modern',
			name: 'Modern',
			description: 'Contemporary design with gradient header and card-based layout',
			component: ModernTemplate,
			category: 'Modern',
			themes: [
				{ name: 'Blue', primary: 'blue-600', secondary: 'blue-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Emerald', primary: 'emerald-600', secondary: 'emerald-500', accent: 'emerald-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Violet', primary: 'violet-600', secondary: 'violet-500', accent: 'violet-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Rose', primary: 'rose-600', secondary: 'rose-500', accent: 'rose-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			features: ['Gradient Header', 'Timeline Design', 'Skills Section', 'Contact Info']
		},
		{
			id: 'minimalist',
			name: 'Minimalist',
			description: 'Clean typography-focused design with elegant spacing',
			component: MinimalistTemplate,
			category: 'Minimal',
			themes: [
				{ name: 'Classic', primary: 'gray-900', secondary: 'gray-700', accent: 'gray-200', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Navy', primary: 'slate-900', secondary: 'slate-700', accent: 'slate-200', text: 'slate-900', textSecondary: 'slate-600' },
				{ name: 'Warm', primary: 'stone-900', secondary: 'stone-700', accent: 'stone-200', text: 'stone-900', textSecondary: 'stone-600' }
			],
			features: ['Typography Focus', 'Serif Font', 'Two-Column Layout', 'Minimal Design']
		},
		{
			id: 'creative',
			name: 'Creative',
			description: 'Artistic design with gradients, animations, and modern aesthetics',
			component: CreativeTemplate,
			category: 'Creative',
			themes: [
				{ name: 'Purple', primary: 'purple-600', secondary: 'pink-500', accent: 'purple-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Ocean', primary: 'blue-600', secondary: 'cyan-500', accent: 'blue-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Sunset', primary: 'orange-600', secondary: 'red-500', accent: 'orange-100', text: 'gray-900', textSecondary: 'gray-600' },
				{ name: 'Forest', primary: 'green-600', secondary: 'emerald-500', accent: 'green-100', text: 'gray-900', textSecondary: 'gray-600' }
			],
			features: ['Gradient Backgrounds', 'Animated Elements', 'Artistic Layout', 'Modern Cards']
		}
	];

	// State management
	let selectedTemplate = templates[0];
	let selectedTheme = selectedTemplate.themes[0];
	let previewMode = 'desktop'; // desktop, tablet, mobile
	let showCustomization = false;
	let filterCategory = 'All';

	// Filter templates by category
	$: filteredTemplates = filterCategory === 'All' 
		? templates 
		: templates.filter(t => t.category === filterCategory);

	// Get unique categories
	$: categories = ['All', ...new Set(templates.map(t => t.category))];

	function selectTemplate(template: typeof templates[0]) {
		selectedTemplate = template;
		selectedTheme = template.themes[0];
	}

	function selectTheme(theme: typeof selectedTemplate.themes[0]) {
		selectedTheme = theme;
	}
</script>

<svelte:head>
	<title>Template Marketplace - SiteMe</title>
	<meta name="description" content="Choose from beautiful CV templates with customizable themes and layouts" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="container mx-auto px-4 py-8">
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
					Template Marketplace
				</h1>
				<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Choose from our collection of beautiful, professional CV templates. Each template is fully customizable with multiple themes and layouts.
				</p>
			</div>

			<!-- Category Filter -->
			<div class="flex justify-center mb-8">
				<div class="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
					{#each categories as category}
						<button
							on:click={() => filterCategory = category}
							class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 {
								filterCategory === category
									? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
									: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
							}"
						>
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
		<div class="grid lg:grid-cols-4 gap-8">
			<!-- Template Sidebar -->
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Templates
					</h3>
					<div class="space-y-3">
						{#each filteredTemplates as template}
							<button
								on:click={() => selectTemplate(template)}
								class="w-full text-left p-3 rounded-lg border-2 transition-all duration-200 {
									selectedTemplate.id === template.id
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
								}"
							>
								<div class="flex items-center justify-between mb-2">
									<h4 class="font-medium text-gray-900 dark:text-white">
										{template.name}
									</h4>
									<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">
										{template.category}
									</span>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
									{template.description}
								</p>
								<div class="flex flex-wrap gap-1">
									{#each template.features.slice(0, 2) as feature}
										<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded text-gray-700 dark:text-gray-300">
											{feature}
										</span>
									{/each}
									{#if template.features.length > 2}
										<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded text-gray-700 dark:text-gray-300">
											+{template.features.length - 2}
										</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>

					<!-- Theme Customization -->
					<div class="mt-8">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Themes
						</h3>
						<div class="space-y-2">
							{#each selectedTemplate.themes as theme}
								<button
									on:click={() => selectTheme(theme)}
									class="w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 {
										selectedTheme.name === theme.name
											? 'bg-blue-50 dark:bg-blue-900/20'
											: 'hover:bg-gray-50 dark:hover:bg-gray-700'
									}"
								>
									<div class="flex space-x-1">
										<div class="w-4 h-4 rounded-full bg-{theme.primary}"></div>
										<div class="w-4 h-4 rounded-full bg-{theme.secondary}"></div>
									</div>
									<span class="text-sm font-medium text-gray-900 dark:text-white">
										{theme.name}
									</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Preview Controls -->
					<div class="mt-8">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Preview
						</h3>
						<div class="flex space-x-2">
							<button
								on:click={() => previewMode = 'desktop'}
								class="p-2 rounded-lg transition-colors duration-200 {
									previewMode === 'desktop'
										? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}"
								title="Desktop View"
							>
								🖥️
							</button>
							<button
								on:click={() => previewMode = 'tablet'}
								class="p-2 rounded-lg transition-colors duration-200 {
									previewMode === 'tablet'
										? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}"
								title="Tablet View"
							>
								📱
							</button>
							<button
								on:click={() => previewMode = 'mobile'}
								class="p-2 rounded-lg transition-colors duration-200 {
									previewMode === 'mobile'
										? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}"
								title="Mobile View"
							>
								📱
							</button>
						</div>
					</div>

					<!-- Use Template Button -->
					<div class="mt-8">
						<button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
							Use This Template
						</button>
					</div>
				</div>
			</div>

			<!-- Preview Area -->
			<div class="lg:col-span-3">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							{selectedTemplate.name} Template Preview
						</h2>
						<div class="flex items-center space-x-2">
							<span class="text-sm text-gray-600 dark:text-gray-400">
								Theme: {selectedTheme.name}
							</span>
						</div>
					</div>

					<!-- Template Features -->
					<div class="mb-6">
						<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</h3>
						<div class="flex flex-wrap gap-2">
							{#each selectedTemplate.features as feature}
								<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full">
									{feature}
								</span>
							{/each}
						</div>
					</div>

					<!-- Preview Container -->
					<div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
						<div class="{
							previewMode === 'mobile' ? 'max-w-sm mx-auto' :
							previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
							'w-full'
						} transition-all duration-300">
							<div class="transform {
								previewMode === 'mobile' ? 'scale-75' :
								previewMode === 'tablet' ? 'scale-90' :
								'scale-100'
							} origin-top transition-transform duration-300">
								{#if selectedTemplate.id === 'classic'}
									<CVTemplate profileData={sampleData} customizable={false} />
								{:else if selectedTemplate.id === 'modern'}
									<ModernTemplate profileData={sampleData} theme={selectedTheme} customizable={false} />
								{:else if selectedTemplate.id === 'minimalist'}
									<MinimalistTemplate profileData={sampleData} theme={selectedTheme} customizable={false} />
								{:else if selectedTemplate.id === 'creative'}
									<CreativeTemplate profileData={sampleData} theme={selectedTheme} customizable={false} />
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for sidebar */
	.lg\:col-span-1 {
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
	}
</style>