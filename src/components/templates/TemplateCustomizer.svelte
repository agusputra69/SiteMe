<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import {
		Palette,
		Type,
		Layout,
		Download,
		Eye,
		RotateCcw,
		GripVertical,
		Move,
		Sliders,
		Check
	} from 'lucide-svelte';

	// Import configuration and utilities
	import {
		type CustomizationConfig,
		DEFAULT_CUSTOMIZATION,
		THEME_OPTIONS,
		FONT_FAMILIES,
		HEADING_FONTS,
		FONT_SIZES,
		LAYOUT_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		CONTAINER_WIDTH_OPTIONS,
		VERTICAL_SPACING_OPTIONS,
		HORIZONTAL_PADDING_OPTIONS,
		SPACING_OPTIONS,
		BORDER_RADIUS_OPTIONS,
		SHADOW_OPTIONS,
		SECTION_LABELS,
		createDefaultCustomization
	} from '$lib/customizerConfig';

	import {
		validateCustomization,
		announceChange,
		focusFirstElement,
		exportCustomizationToFile,
		SectionReorderManager,
		handleKeyboardNavigation
	} from '$lib/customizerUtils';

	const dispatch = createEventDispatcher();

	export let selectedTemplate = 'classic';
	export let customization: CustomizationConfig = createDefaultCustomization();

	// Component state
	let activeTab = 'colors';
	let draggedIndex = -1;
	let dragOverIndex = -1;

	// Initialize section reorder manager
	const sectionReorderManager = new SectionReorderManager(
		(newOrder: string[]) => updateCustomization('sectionOrder', newOrder),
		(message: string) => announceChange(message)
	);

	// Reactive statement to validate customization
	$: customization = validateCustomization(customization);

	// Section labels for display
	const sectionLabels: { [key: string]: string } = {
		header: 'Header & Contact',
		about: 'About/Summary',
		experience: 'Work Experience',
		education: 'Education',
		skills: 'Skills',
		contact: 'Contact Information'
	};

	function updateCustomization(key: string, value: any) {
		if (!customization) {
			customization = createDefaultCustomization();
		}
		customization = { ...customization, [key]: value };
		dispatch('update', customization);

		// Announce changes to screen readers
		announceChange(`${key} updated to ${value}`);
	}

	function resetToDefaults() {
		customization = createDefaultCustomization();
		dispatch('update', customization);
		announceChange('Customization reset to defaults');
	}

	// Drag and drop functions using SectionReorderManager
	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		sectionReorderManager.handleDragStart(event, index, customization.sectionOrder);
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = -1;
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
			sectionReorderManager.handleDrop(event, dropIndex, customization.sectionOrder);
			// Update the section order after the manager handles the drop
			const newOrder = [...customization.sectionOrder];
			const draggedItem = newOrder.splice(draggedIndex, 1)[0];
			newOrder.splice(dropIndex, 0, draggedItem);
			updateCustomization('sectionOrder', newOrder);
			announceChange(
				`${SECTION_LABELS[draggedItem] || draggedItem} section moved to position ${dropIndex + 1}`
			);
		}
		draggedIndex = -1;
		dragOverIndex = -1;
	}

	function handleDragEnd() {
		sectionReorderManager.handleDragEnd();
		draggedIndex = -1;
		dragOverIndex = -1;
	}

	function exportCustomization() {
		exportCustomizationToFile(customization, selectedTemplate);
		announceChange('Customization settings exported');
	}

	function previewTemplate() {
		dispatch('preview', { template: selectedTemplate, customization });
		announceChange('Template preview opened');
	}
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6"
	role="main"
	aria-label="Template Customizer"
>
	<div class="text-center mb-6">
		<h3
			id="customizer-title"
			class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
		>
			Advanced Customization
		</h3>
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
			Fine-tune typography, colors, layout, and section ordering
		</p>
		<div class="flex items-center justify-center space-x-3">
			<button
				on:click={resetToDefaults}
				class="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
				aria-label="Reset all customization settings to defaults"
				title="Reset to defaults"
			>
				<RotateCcw class="w-4 h-4 mr-2" aria-hidden="true" />
				Reset
			</button>
			<button
				on:click={exportCustomization}
				class="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
				aria-label="Export customization settings as JSON file"
				title="Export customization"
			>
				<Download class="w-4 h-4 mr-2" aria-hidden="true" />
				Export
			</button>
			<button
				on:click={previewTemplate}
				class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
				aria-label="Preview template with current customization settings"
			>
				<Eye class="w-4 h-4 mr-2" aria-hidden="true" />
				Preview Changes
			</button>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-1 mb-4 sm:mb-6">
		<div class="grid grid-cols-4 gap-1" role="tablist" aria-labelledby="customizer-title">
			<button
				on:click={() => (activeTab = 'colors')}
				class="{activeTab === 'colors'
					? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
					: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'} flex flex-col items-center justify-center py-3 px-2 rounded-md font-medium text-xs transition-all duration-200"
				role="tab"
				aria-selected={activeTab === 'colors'}
				aria-controls="tabpanel-colors"
				id="tab-colors"
			>
				<Palette class="w-5 h-5 mb-1" aria-hidden="true" />
				<span class="text-center leading-tight">Colors & Themes</span>
			</button>
			<button
				on:click={() => (activeTab = 'typography')}
				class="{activeTab === 'typography'
					? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
					: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'} flex flex-col items-center justify-center py-3 px-2 rounded-md font-medium text-xs transition-all duration-200"
				role="tab"
				aria-selected={activeTab === 'typography'}
				aria-controls="tabpanel-typography"
				id="tab-typography"
			>
				<Type class="w-5 h-5 mb-1" aria-hidden="true" />
				<span class="text-center leading-tight">Typography</span>
			</button>
			<button
				on:click={() => (activeTab = 'layout')}
				class="{activeTab === 'layout'
					? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
					: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'} flex flex-col items-center justify-center py-3 px-2 rounded-md font-medium text-xs transition-all duration-200"
				role="tab"
				aria-selected={activeTab === 'layout'}
				aria-controls="tabpanel-layout"
				id="tab-layout"
			>
				<Layout class="w-5 h-5 mb-1" aria-hidden="true" />
				<span class="text-center leading-tight">Layout & Spacing</span>
			</button>
			<button
				on:click={() => (activeTab = 'sections')}
				class="{activeTab === 'sections'
					? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
					: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'} flex flex-col items-center justify-center py-3 px-2 rounded-md font-medium text-xs transition-all duration-200"
				role="tab"
				aria-selected={activeTab === 'sections'}
				aria-controls="tabpanel-sections"
				id="tab-sections"
			>
				<Sliders class="w-5 h-5 mb-1" aria-hidden="true" />
				<span class="text-center leading-tight">Section Order</span>
			</button>
		</div>
	</div>

	<!-- Tab Panels -->
	<div class="space-y-6">
		{#if activeTab === 'colors'}
			<div role="tabpanel" id="tabpanel-colors" aria-labelledby="tab-colors" class="space-y-8">
				<!-- Theme Selection -->
				<div>
					<div class="mb-4">
						<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Color Themes</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">Choose a pre-designed color scheme for your resume</p>
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each THEME_OPTIONS as theme}
							<button
								on:click={() => updateCustomization('theme', theme.name)}
								class="relative p-3 rounded-lg border-2 transition-all group {customization.theme ===
								theme.name
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Select {theme.label} theme"
								aria-pressed={customization.theme === theme.name}
							>
								{#if customization.theme === theme.name}
									<div class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
										<Check class="w-4 h-4 text-white" />
									</div>
								{/if}
								<div class="w-full h-8 rounded-md mb-2" style="background: {theme.color}" />
								<span class="text-xs font-medium text-gray-900 dark:text-white">{theme.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Custom Colors -->
				<div>
					<div class="mb-4">
						<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Custom Colors</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">Fine-tune individual colors to match your brand</p>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div class="space-y-2">
							<label
								for="accent-color"
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Accent Color
							</label>
							<div class="relative">
								<input
									id="accent-color"
									type="color"
									bind:value={customization.accentColor}
									on:change={() => updateCustomization('accentColor', customization.accentColor)}
									class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
									aria-label="Choose accent color"
								/>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Used for headings and highlights</p>
						</div>
						<div class="space-y-2">
							<label
								for="text-color"
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Text Color
							</label>
							<div class="relative">
								<input
									id="text-color"
									type="color"
									bind:value={customization.textColor}
									on:change={() => updateCustomization('textColor', customization.textColor)}
									class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
									aria-label="Choose text color"
								/>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Main body text color</p>
						</div>
						<div class="space-y-2">
							<label
								for="bg-color"
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Background Color
							</label>
							<div class="relative">
								<input
									id="bg-color"
									type="color"
									bind:value={customization.backgroundColor}
									on:change={() =>
										updateCustomization('backgroundColor', customization.backgroundColor)}
									class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
									aria-label="Choose background color"
								/>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Resume background color</p>
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'typography'}
			<div
				role="tabpanel"
				id="tabpanel-typography"
				aria-labelledby="tab-typography"
				class="space-y-8"
			>
				<!-- Font Family -->
				<div>
					<div class="mb-4">
						<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Font Family</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">Choose the main typeface for your resume content</p>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each FONT_FAMILIES as font}
						<button
							on:click={() => updateCustomization('fontFamily', font.value)}
							class="text-left p-4 rounded-lg border-2 transition-all relative {customization.fontFamily ===
							font.value
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
							aria-label="Set font family to {font.label}"
							aria-pressed={customization.fontFamily === font.value}
						>
							{#if customization.fontFamily === font.value}
								<div class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
									<Check class="w-4 h-4 text-white" />
								</div>
							{/if}
							<div class="font-medium text-gray-900 dark:text-white mb-2 {font.class}">
								{font.label}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">{font.preview}</div>
						</button>
					{/each}
					</div>
				</div>

				<!-- Font Size -->
				<div>
					<div class="mb-4">
						<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Font Size</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400">Adjust the overall text size for better readability</p>
					</div>
					<div class="grid grid-cols-3 gap-3">
						{#each FONT_SIZES as size}
						<button
							on:click={() => updateCustomization('fontSize', size.value)}
							class="p-4 rounded-lg border-2 transition-all relative {customization.fontSize === size.value
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
							aria-label="Set font size to {size.label}"
							aria-pressed={customization.fontSize === size.value}
						>
							{#if customization.fontSize === size.value}
								<div class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
									<Check class="w-4 h-4 text-white" />
								</div>
							{/if}
							<span class="text-sm font-medium text-gray-900 dark:text-white">{size.label}</span>
						</button>
					{/each}
					</div>
				</div>

				<!-- Spacing Controls -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<!-- Line Height -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Line Height</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Space between lines of text</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each LINE_HEIGHT_OPTIONS as option}
							<button
								on:click={() => updateCustomization('lineHeight', option.value)}
								class="p-3 rounded-lg border-2 transition-all relative {customization.lineHeight ===
								option.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set line height to {option.label}"
								aria-pressed={customization.lineHeight === option.value}
							>
								{#if customization.lineHeight === option.value}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
										<Check class="w-3 h-3 text-white" />
									</div>
								{/if}
								<span class="text-xs font-medium text-gray-900 dark:text-white">{option.label}</span>
							</button>
						{/each}
						</div>
					</div>

					<!-- Letter Spacing -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Letter Spacing</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Space between individual letters</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each LETTER_SPACING_OPTIONS as option}
							<button
								on:click={() => updateCustomization('letterSpacing', option.value)}
								class="p-3 rounded-lg border-2 transition-all relative {customization.letterSpacing ===
								option.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set letter spacing to {option.label}"
								aria-pressed={customization.letterSpacing === option.value}
							>
								{#if customization.letterSpacing === option.value}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
										<Check class="w-3 h-3 text-white" />
									</div>
								{/if}
								<span class="text-xs font-medium text-gray-900 dark:text-white">{option.label}</span>
							</button>
						{/each}
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'layout'}
			<div role="tabpanel" id="tabpanel-layout" aria-labelledby="tab-layout" class="space-y-8">
				<!-- Layout Type -->
				<div>
					<div class="mb-4">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Layout & Spacing</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">Control the overall layout structure and spacing of your resume</p>
					</div>
					
					<div class="mb-4">
						<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Layout Type</h4>
						<p class="text-xs text-gray-600 dark:text-gray-400 mb-3">Choose how content is arranged on your resume</p>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each LAYOUT_OPTIONS as layout}
							<button
								on:click={() => updateCustomization('layout', layout.value)}
								class="text-left p-4 rounded-lg border-2 transition-all relative {customization.layout ===
								layout.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set layout to {layout.label}"
								aria-pressed={customization.layout === layout.value}
							>
								{#if customization.layout === layout.value}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
										<Check class="w-3 h-3 text-white" />
									</div>
								{/if}
								<div class="font-medium text-gray-900 dark:text-white mb-1">{layout.label}</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">{layout.description}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Dimensions & Spacing Controls -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Container Width -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Container Width</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Overall width of your resume</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each CONTAINER_WIDTH_OPTIONS as option}
								<button
									on:click={() => updateCustomization('containerWidth', option.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.containerWidth ===
									option.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set container width to {option.label}"
									aria-pressed={customization.containerWidth === option.value}
								>
									{#if customization.containerWidth === option.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{option.label}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Vertical Spacing -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Vertical Spacing</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Space between sections vertically</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each VERTICAL_SPACING_OPTIONS as spacing}
								<button
									on:click={() => updateCustomization('verticalSpacing', spacing.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.verticalSpacing ===
									spacing.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set vertical spacing to {spacing.label}"
									aria-pressed={customization.verticalSpacing === spacing.value}
								>
									{#if customization.verticalSpacing === spacing.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{spacing.label}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Horizontal Padding -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Horizontal Padding</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Left and right padding inside sections</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each HORIZONTAL_PADDING_OPTIONS as padding}
								<button
									on:click={() => updateCustomization('horizontalPadding', padding.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.horizontalPadding ===
									padding.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set horizontal padding to {padding.label}"
									aria-pressed={customization.horizontalPadding === padding.value}
								>
									{#if customization.horizontalPadding === padding.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{padding.label}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- General Spacing -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">General Spacing</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Overall spacing between elements</p>
						</div>
						<div class="grid grid-cols-2 gap-2">
							{#each SPACING_OPTIONS as spacing}
								<button
									on:click={() => updateCustomization('spacing', spacing.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.spacing ===
									spacing.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set spacing to {spacing.label}"
									aria-pressed={customization.spacing === spacing.value}
								>
									{#if customization.spacing === spacing.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{spacing.label}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Visual Effects -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Border Radius -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Border Radius</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Rounded corners for sections and elements</p>
						</div>
						<div class="grid grid-cols-3 gap-2">
							{#each BORDER_RADIUS_OPTIONS as radius}
								<button
									on:click={() => updateCustomization('borderRadius', radius.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.borderRadius ===
									radius.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set border radius to {radius.label}"
									aria-pressed={customization.borderRadius === radius.value}
								>
									{#if customization.borderRadius === radius.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{radius.label}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Shadow -->
					<div>
						<div class="mb-3">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Shadow Effects</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400">Drop shadow depth and intensity</p>
						</div>
						<div class="grid grid-cols-3 gap-2">
							{#each SHADOW_OPTIONS as shadow}
								<button
									on:click={() => updateCustomization('shadow', shadow.value)}
									class="p-3 rounded-lg border-2 transition-all relative {customization.shadow === shadow.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
									aria-label="Set shadow to {shadow.label}"
									aria-pressed={customization.shadow === shadow.value}
								>
									{#if customization.shadow === shadow.value}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<Check class="w-3 h-3 text-white" />
										</div>
									{/if}
									<span class="text-xs font-medium text-gray-900 dark:text-white">{shadow.label}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'sections'}
			<div role="tabpanel" id="tabpanel-sections" aria-labelledby="tab-sections" class="space-y-6">
				<!-- Section Order Header -->
				<div class="text-center mb-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Section Organization</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Customize the order and visibility of sections in your CV
					</p>
				</div>

				<div>
					<div class="mb-4">
						<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Section Order</h4>
						<p class="text-xs text-gray-600 dark:text-gray-400">
							Drag and drop sections to reorder them in your profile
						</p>
					</div>
					<div class="space-y-2">
						{#each customization.sectionOrder as section, index}
							<div
								class="flex items-center p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move {draggedIndex ===
								index
									? 'opacity-50'
									: ''} {dragOverIndex === index
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: ''}"
								draggable="true"
								on:dragstart={(e) => handleDragStart(e, index)}
								on:dragover={(e) => handleDragOver(e, index)}
								on:dragleave={handleDragLeave}
								on:drop={(e) => handleDrop(e, index)}
								on:dragend={handleDragEnd}
								role="button"
								aria-label="Drag to reorder {SECTION_LABELS[section] || section} section"
								tabindex="0"
							>
								<GripVertical class="w-4 h-4 text-gray-400 mr-3" aria-hidden="true" />
								<span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">
									{SECTION_LABELS[section] || section}
								</span>
								<span class="text-xs text-gray-500 dark:text-gray-400">
									{index + 1}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Screen reader only class */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
