<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Palette, Type, Layout, Download, Eye, RotateCcw } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let selectedTemplate = 'classic';
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
		backgroundColor: '#FFFFFF'
	};

	const themes = [
		{ name: 'blue', color: '#3B82F6', label: 'Professional Blue' },
		{ name: 'green', color: '#10B981', label: 'Fresh Green' },
		{ name: 'purple', color: '#8B5CF6', label: 'Creative Purple' },
		{ name: 'red', color: '#EF4444', label: 'Bold Red' },
		{ name: 'indigo', color: '#6366F1', label: 'Modern Indigo' },
		{ name: 'teal', color: '#14B8A6', label: 'Calm Teal' },
		{ name: 'orange', color: '#F97316', label: 'Energetic Orange' },
		{ name: 'pink', color: '#EC4899', label: 'Vibrant Pink' }
	];

	const fontFamilies = [
		{ value: 'inter', label: 'Inter (Modern)', class: 'font-sans' },
		{ value: 'serif', label: 'Times (Classic)', class: 'font-serif' },
		{ value: 'mono', label: 'Mono (Technical)', class: 'font-mono' },
		{ value: 'poppins', label: 'Poppins (Friendly)', class: 'font-sans' }
	];

	const fontSizes = [
		{ value: 'small', label: 'Compact', class: 'text-sm' },
		{ value: 'medium', label: 'Standard', class: 'text-base' },
		{ value: 'large', label: 'Readable', class: 'text-lg' }
	];

	const layouts = [
		{ value: 'standard', label: 'Standard', description: 'Traditional single column' },
		{ value: 'compact', label: 'Compact', description: 'Dense information layout' },
		{ value: 'spacious', label: 'Spacious', description: 'Generous whitespace' },
		{ value: 'sidebar', label: 'Sidebar', description: 'Two-column with sidebar' }
	];

	const spacingOptions = [
		{ value: 'tight', label: 'Tight', class: 'space-y-2' },
		{ value: 'normal', label: 'Normal', class: 'space-y-4' },
		{ value: 'relaxed', label: 'Relaxed', class: 'space-y-6' },
		{ value: 'loose', label: 'Loose', class: 'space-y-8' }
	];

	const borderRadiusOptions = [
		{ value: 'none', label: 'Sharp', class: 'rounded-none' },
		{ value: 'small', label: 'Subtle', class: 'rounded-sm' },
		{ value: 'medium', label: 'Standard', class: 'rounded-md' },
		{ value: 'large', label: 'Rounded', class: 'rounded-lg' },
		{ value: 'full', label: 'Pill', class: 'rounded-full' }
	];

	const shadowOptions = [
		{ value: 'none', label: 'Flat', class: 'shadow-none' },
		{ value: 'small', label: 'Subtle', class: 'shadow-sm' },
		{ value: 'medium', label: 'Standard', class: 'shadow-md' },
		{ value: 'large', label: 'Prominent', class: 'shadow-lg' },
		{ value: 'xl', label: 'Dramatic', class: 'shadow-xl' }
	];

	let activeTab = 'colors';

	function updateCustomization(key: string, value: any) {
		customization = { ...customization, [key]: value };
		dispatch('update', customization);
	}

	function resetToDefaults() {
		customization = {
			theme: 'blue',
			fontFamily: 'inter',
			fontSize: 'medium',
			layout: 'standard',
			spacing: 'normal',
			borderRadius: 'medium',
			shadow: 'medium',
			accentColor: '#3B82F6',
			textColor: '#1F2937',
			backgroundColor: '#FFFFFF'
		};
		dispatch('update', customization);
	}

	function exportCustomization() {
		const dataStr = JSON.stringify(customization, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${selectedTemplate}-customization.json`;
		link.click();
		URL.revokeObjectURL(url);
	}

	function previewTemplate() {
		dispatch('preview', { template: selectedTemplate, customization });
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
			Customize Template
		</h3>
		<div class="flex gap-2">
			<button
				on:click={resetToDefaults}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				title="Reset to defaults"
			>
				<RotateCcw class="w-4 h-4" />
			</button>
			<button
				on:click={exportCustomization}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				title="Export customization"
			>
				<Download class="w-4 h-4" />
			</button>
			<button
				on:click={previewTemplate}
				class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
			>
				<Eye class="w-4 h-4 mr-1" />
				Preview
			</button>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
		<button
			on:click={() => activeTab = 'colors'}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'colors'}
			class:text-blue-600={activeTab === 'colors'}
			class:border-transparent={activeTab !== 'colors'}
			class:text-gray-500={activeTab !== 'colors'}
		>
			<Palette class="w-4 h-4 mr-1 sm:mr-2" />
			<span class="hidden sm:inline">Colors & Themes</span>
			<span class="sm:hidden">Colors</span>
		</button>
		<button
			on:click={() => activeTab = 'typography'}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'typography'}
			class:text-blue-600={activeTab === 'typography'}
			class:border-transparent={activeTab !== 'typography'}
			class:text-gray-500={activeTab !== 'typography'}
		>
			<Type class="w-4 h-4 mr-1 sm:mr-2" />
			<span class="hidden sm:inline">Typography</span>
			<span class="sm:hidden">Type</span>
		</button>
		<button
			on:click={() => activeTab = 'layout'}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'layout'}
			class:text-blue-600={activeTab === 'layout'}
			class:border-transparent={activeTab !== 'layout'}
			class:text-gray-500={activeTab !== 'layout'}
		>
			<Layout class="w-4 h-4 mr-1 sm:mr-2" />
			Layout
		</button>
		<button
			on:click={() => activeTab = 'spacing'}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'spacing'}
			class:text-blue-600={activeTab === 'spacing'}
			class:border-transparent={activeTab !== 'spacing'}
			class:text-gray-500={activeTab !== 'spacing'}
		>
			<Layout class="w-4 h-4 mr-1 sm:mr-2" />
			<span class="hidden sm:inline">Spacing & Effects</span>
			<span class="sm:hidden">Effects</span>
		</button>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'colors'}
		<div class="space-y-6">
			<!-- Theme Selection -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Predefined Themes
				</label>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each themes as theme}
						<button
							on:click={() => updateCustomization('theme', theme.name)}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105"
							class:border-blue-500={customization.theme === theme.name}
							class:border-gray-200={customization.theme !== theme.name}
							class:dark:border-gray-600={customization.theme !== theme.name}
						>
							<div class="w-8 h-8 rounded-full mx-auto mb-2" style="background-color: {theme.color}"></div>
							<div class="text-xs font-medium text-gray-700 dark:text-gray-300">{theme.label}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Custom Colors -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Accent Color
					</label>
					<input
						type="color"
						bind:value={customization.accentColor}
						on:change={() => updateCustomization('accentColor', customization.accentColor)}
						class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Text Color
					</label>
					<input
						type="color"
						bind:value={customization.textColor}
						on:change={() => updateCustomization('textColor', customization.textColor)}
						class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Background Color
					</label>
					<input
						type="color"
						bind:value={customization.backgroundColor}
						on:change={() => updateCustomization('backgroundColor', customization.backgroundColor)}
						class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
					/>
				</div>
			</div>
		</div>
	{:else if activeTab === 'typography'}
		<div class="space-y-6">
			<!-- Font Family -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Font Family
				</label>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each fontFamilies as font}
						<button
							on:click={() => updateCustomization('fontFamily', font.value)}
							class="p-3 text-left rounded-lg border-2 transition-all {font.class}"
							class:border-blue-500={customization.fontFamily === font.value}
							class:border-gray-200={customization.fontFamily !== font.value}
							class:dark:border-gray-600={customization.fontFamily !== font.value}
						>
							<div class="font-medium text-gray-900 dark:text-white">{font.label}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">The quick brown fox</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Font Size -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Font Size
				</label>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{#each fontSizes as size}
						<button
							on:click={() => updateCustomization('fontSize', size.value)}
							class="p-3 text-center rounded-lg border-2 transition-all {size.class}"
							class:border-blue-500={customization.fontSize === size.value}
							class:border-gray-200={customization.fontSize !== size.value}
							class:dark:border-gray-600={customization.fontSize !== size.value}
						>
							<div class="font-medium text-gray-900 dark:text-white">{size.label}</div>
							<div class="text-gray-500 dark:text-gray-400">Sample text</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else if activeTab === 'layout'}
		<div class="space-y-6">
			<!-- Layout Options -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Layout Style
				</label>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each layouts as layout}
						<button
							on:click={() => updateCustomization('layout', layout.value)}
							class="p-4 text-left rounded-lg border-2 transition-all"
							class:border-blue-500={customization.layout === layout.value}
							class:border-gray-200={customization.layout !== layout.value}
							class:dark:border-gray-600={customization.layout !== layout.value}
						>
							<div class="font-medium text-gray-900 dark:text-white mb-1">{layout.label}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{layout.description}</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else if activeTab === 'spacing'}
		<div class="space-y-6">
			<!-- Spacing -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Spacing
				</label>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each spacingOptions as spacing}
						<button
							on:click={() => updateCustomization('spacing', spacing.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.spacing === spacing.value}
							class:border-gray-200={customization.spacing !== spacing.value}
							class:dark:border-gray-600={customization.spacing !== spacing.value}
						>
							<div class="font-medium text-gray-900 dark:text-white">{spacing.label}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Border Radius -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Border Radius
				</label>
				<div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
					{#each borderRadiusOptions as radius}
						<button
							on:click={() => updateCustomization('borderRadius', radius.value)}
							class="p-3 text-center border-2 transition-all {radius.class}"
							class:border-blue-500={customization.borderRadius === radius.value}
							class:border-gray-200={customization.borderRadius !== radius.value}
							class:dark:border-gray-600={customization.borderRadius !== radius.value}
						>
							<div class="font-medium text-gray-900 dark:text-white text-xs">{radius.label}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Shadow -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Shadow
				</label>
				<div class="grid grid-cols-5 gap-3">
					{#each shadowOptions as shadow}
						<button
							on:click={() => updateCustomization('shadow', shadow.value)}
							class="p-3 text-center rounded-lg border-2 transition-all {shadow.class}"
							class:border-blue-500={customization.shadow === shadow.value}
							class:border-gray-200={customization.shadow !== shadow.value}
							class:dark:border-gray-600={customization.shadow !== shadow.value}
						>
							<div class="font-medium text-gray-900 dark:text-white text-xs">{shadow.label}</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>