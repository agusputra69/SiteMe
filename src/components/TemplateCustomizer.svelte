<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Palette, Type, Layout, Download, Eye, RotateCcw, GripVertical, Move, Sliders } from 'lucide-svelte';

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
		backgroundColor: '#FFFFFF',
		sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
		lineHeight: 'normal',
		letterSpacing: 'normal',
		headingFont: 'same',
		containerWidth: 'standard',
		verticalSpacing: 'normal',
		horizontalPadding: 'normal'
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
		{ value: 'inter', label: 'Inter (Modern)', class: 'font-sans', preview: 'Modern & Clean' },
		{ value: 'serif', label: 'Times (Classic)', class: 'font-serif', preview: 'Traditional & Elegant' },
		{ value: 'mono', label: 'Mono (Technical)', class: 'font-mono', preview: 'Code & Technical' },
		{ value: 'poppins', label: 'Poppins (Friendly)', class: 'font-sans', preview: 'Rounded & Approachable' },
		{ value: 'playfair', label: 'Playfair (Luxury)', class: 'font-serif', preview: 'Sophisticated & Bold' },
		{ value: 'roboto', label: 'Roboto (Google)', class: 'font-sans', preview: 'Neutral & Readable' }
	];

	const headingFonts = [
		{ value: 'same', label: 'Same as Body' },
		{ value: 'serif', label: 'Serif Headings' },
		{ value: 'sans', label: 'Sans-serif Headings' },
		{ value: 'display', label: 'Display Font' }
	];

	const lineHeightOptions = [
		{ value: 'tight', label: 'Tight', class: 'leading-tight' },
		{ value: 'normal', label: 'Normal', class: 'leading-normal' },
		{ value: 'relaxed', label: 'Relaxed', class: 'leading-relaxed' },
		{ value: 'loose', label: 'Loose', class: 'leading-loose' }
	];

	const letterSpacingOptions = [
		{ value: 'tight', label: 'Tight', class: 'tracking-tight' },
		{ value: 'normal', label: 'Normal', class: 'tracking-normal' },
		{ value: 'wide', label: 'Wide', class: 'tracking-wide' },
		{ value: 'wider', label: 'Wider', class: 'tracking-wider' }
	];

	const containerWidthOptions = [
		{ value: 'narrow', label: 'Narrow (600px)', class: 'max-w-2xl' },
		{ value: 'standard', label: 'Standard (800px)', class: 'max-w-4xl' },
		{ value: 'wide', label: 'Wide (1000px)', class: 'max-w-5xl' },
		{ value: 'full', label: 'Full Width', class: 'max-w-full' }
	];

	const verticalSpacingOptions = [
		{ value: 'compact', label: 'Compact', class: 'space-y-4' },
		{ value: 'normal', label: 'Normal', class: 'space-y-6' },
		{ value: 'relaxed', label: 'Relaxed', class: 'space-y-8' },
		{ value: 'spacious', label: 'Spacious', class: 'space-y-12' }
	];

	const horizontalPaddingOptions = [
		{ value: 'minimal', label: 'Minimal', class: 'px-4' },
		{ value: 'normal', label: 'Normal', class: 'px-6' },
		{ value: 'generous', label: 'Generous', class: 'px-8' },
		{ value: 'maximum', label: 'Maximum', class: 'px-12' }
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
	let draggedIndex = -1;
	let dragOverIndex = -1;

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
			backgroundColor: '#FFFFFF',
			sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
			lineHeight: 'normal',
			letterSpacing: 'normal',
			headingFont: 'same',
			containerWidth: 'standard',
			verticalSpacing: 'normal',
			horizontalPadding: 'normal'
		};
		dispatch('update', customization);
	}

	// Drag and drop functions for section reordering
	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
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
			const newOrder = [...customization.sectionOrder];
			const draggedItem = newOrder.splice(draggedIndex, 1)[0];
			newOrder.splice(dropIndex, 0, draggedItem);
			updateCustomization('sectionOrder', newOrder);
		}
		draggedIndex = -1;
		dragOverIndex = -1;
	}

	function handleDragEnd() {
		draggedIndex = -1;
		dragOverIndex = -1;
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
			<Sliders class="w-4 h-4 mr-1 sm:mr-2" />
			<span class="hidden sm:inline">Spacing & Effects</span>
			<span class="sm:hidden">Effects</span>
		</button>
		<button
			on:click={() => activeTab = 'sections'}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'sections'}
			class:text-blue-600={activeTab === 'sections'}
			class:border-transparent={activeTab !== 'sections'}
			class:text-gray-500={activeTab !== 'sections'}
		>
			<Move class="w-4 h-4 mr-1 sm:mr-2" />
			<span class="hidden sm:inline">Section Order</span>
			<span class="sm:hidden">Sections</span>
		</button>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'colors'}
		<div class="space-y-6">
			<!-- Theme Selection -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Predefined Themes
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each themes as theme}
						<button
							on:click={() => updateCustomization('theme', theme.name)}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105"
							class:border-blue-500={customization.theme === theme.name}
							class:border-gray-200={customization.theme !== theme.name}
							class:dark:border-gray-600={customization.theme !== theme.name}
							aria-label="Select {theme.label} theme"
						>
							<div class="w-8 h-8 rounded-full mx-auto mb-2" style="background-color: {theme.color}"></div>
							<div class="text-xs font-medium text-gray-700 dark:text-gray-300">{theme.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Custom Colors -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label for="accent-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Accent Color
					</label>
					<input
						id="accent-color"
						type="color"
						bind:value={customization.accentColor}
						on:change={() => updateCustomization('accentColor', customization.accentColor)}
						class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
					/>
				</div>
				<div>
					<label for="text-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Text Color
					</label>
					<input
						id="text-color"
						type="color"
						bind:value={customization.textColor}
						on:change={() => updateCustomization('textColor', customization.textColor)}
						class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
					/>
				</div>
				<div>
					<label for="background-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Background Color
					</label>
					<input
						id="background-color"
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
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Body Font Family
				</legend>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each fontFamilies as font}
						<button
							on:click={() => updateCustomization('fontFamily', font.value)}
							class="p-3 text-left rounded-lg border-2 transition-all {font.class}"
							class:border-blue-500={customization.fontFamily === font.value}
							class:border-gray-200={customization.fontFamily !== font.value}
							class:dark:border-gray-600={customization.fontFamily !== font.value}
							aria-label="Set font family to {font.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{font.label}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{font.preview}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Heading Font -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Heading Font
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each headingFonts as font}
						<button
							on:click={() => updateCustomization('headingFont', font.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.headingFont === font.value}
							class:border-gray-200={customization.headingFont !== font.value}
							class:dark:border-gray-600={customization.headingFont !== font.value}
							aria-label="Set heading font to {font.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white text-sm">{font.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Font Size -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Font Size
				</legend>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{#each fontSizes as size}
						<button
							on:click={() => updateCustomization('fontSize', size.value)}
							class="p-3 text-center rounded-lg border-2 transition-all {size.class}"
							class:border-blue-500={customization.fontSize === size.value}
							class:border-gray-200={customization.fontSize !== size.value}
							class:dark:border-gray-600={customization.fontSize !== size.value}
							aria-label="Set font size to {size.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{size.label}</div>
							<div class="text-gray-500 dark:text-gray-400">Sample text</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Line Height -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Line Height
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each lineHeightOptions as option}
						<button
							on:click={() => updateCustomization('lineHeight', option.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.lineHeight === option.value}
							class:border-gray-200={customization.lineHeight !== option.value}
							class:dark:border-gray-600={customization.lineHeight !== option.value}
							aria-label="Set line height to {option.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white text-sm">{option.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Letter Spacing -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Letter Spacing
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each letterSpacingOptions as option}
						<button
							on:click={() => updateCustomization('letterSpacing', option.value)}
							class="p-3 text-center rounded-lg border-2 transition-all {option.class}"
							class:border-blue-500={customization.letterSpacing === option.value}
							class:border-gray-200={customization.letterSpacing !== option.value}
							class:dark:border-gray-600={customization.letterSpacing !== option.value}
							aria-label="Set letter spacing to {option.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white text-sm">{option.label}</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">Sample</div>
						</button>
					{/each}
				</div>
			</fieldset>
		</div>
	{:else if activeTab === 'layout'}
		<div class="space-y-6">
			<!-- Layout Options -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Layout Style
				</legend>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each layouts as layout}
						<button
							on:click={() => updateCustomization('layout', layout.value)}
							class="p-4 text-left rounded-lg border-2 transition-all"
							class:border-blue-500={customization.layout === layout.value}
							class:border-gray-200={customization.layout !== layout.value}
							class:dark:border-gray-600={customization.layout !== layout.value}
							aria-label="Set layout to {layout.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white mb-1">{layout.label}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{layout.description}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Container Width -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Container Width
				</legend>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each containerWidthOptions as option}
						<button
							on:click={() => updateCustomization('containerWidth', option.value)}
							class="p-3 text-left rounded-lg border-2 transition-all"
							class:border-blue-500={customization.containerWidth === option.value}
							class:border-gray-200={customization.containerWidth !== option.value}
							class:dark:border-gray-600={customization.containerWidth !== option.value}
							aria-label="Set container width to {option.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{option.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>
		</div>
	{:else if activeTab === 'spacing'}
		<div class="space-y-6">
			<!-- Vertical Spacing -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Vertical Spacing
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each verticalSpacingOptions as spacing}
						<button
							on:click={() => updateCustomization('verticalSpacing', spacing.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.verticalSpacing === spacing.value}
							class:border-gray-200={customization.verticalSpacing !== spacing.value}
							class:dark:border-gray-600={customization.verticalSpacing !== spacing.value}
							aria-label="Set vertical spacing to {spacing.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{spacing.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Horizontal Padding -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Horizontal Padding
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each horizontalPaddingOptions as padding}
						<button
							on:click={() => updateCustomization('horizontalPadding', padding.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.horizontalPadding === padding.value}
							class:border-gray-200={customization.horizontalPadding !== padding.value}
							class:dark:border-gray-600={customization.horizontalPadding !== padding.value}
							aria-label="Set horizontal padding to {padding.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{padding.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Legacy Spacing -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					General Spacing
				</legend>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each spacingOptions as spacing}
						<button
							on:click={() => updateCustomization('spacing', spacing.value)}
							class="p-3 text-center rounded-lg border-2 transition-all"
							class:border-blue-500={customization.spacing === spacing.value}
							class:border-gray-200={customization.spacing !== spacing.value}
							class:dark:border-gray-600={customization.spacing !== spacing.value}
							aria-label="Set spacing to {spacing.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white">{spacing.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Border Radius -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Border Radius
				</legend>
				<div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
					{#each borderRadiusOptions as radius}
						<button
							on:click={() => updateCustomization('borderRadius', radius.value)}
							class="p-3 text-center border-2 transition-all {radius.class}"
							class:border-blue-500={customization.borderRadius === radius.value}
							class:border-gray-200={customization.borderRadius !== radius.value}
							class:dark:border-gray-600={customization.borderRadius !== radius.value}
							aria-label="Set border radius to {radius.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white text-xs">{radius.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Shadow -->
			<fieldset>
				<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Shadow
				</legend>
				<div class="grid grid-cols-5 gap-3">
					{#each shadowOptions as shadow}
						<button
							on:click={() => updateCustomization('shadow', shadow.value)}
							class="p-3 text-center rounded-lg border-2 transition-all {shadow.class}"
							class:border-blue-500={customization.shadow === shadow.value}
							class:border-gray-200={customization.shadow !== shadow.value}
							class:dark:border-gray-600={customization.shadow !== shadow.value}
							aria-label="Set shadow to {shadow.label}"
						>
							<div class="font-medium text-gray-900 dark:text-white text-xs">{shadow.label}</div>
						</button>
					{/each}
				</div>
			</fieldset>
		</div>
	{:else if activeTab === 'sections'}
		<div class="space-y-6">
			<!-- Section Reordering -->
			<div>
				<h4 class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Drag to Reorder Sections
				</h4>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
					Customize the order of sections in your profile by dragging them up or down.
				</p>
				<div class="space-y-2">
					{#each customization.sectionOrder as section, index}
						<div
							draggable="true"
							on:dragstart={(e) => handleDragStart(e, index)}
							on:dragover={(e) => handleDragOver(e, index)}
							on:dragleave={handleDragLeave}
							on:drop={(e) => handleDrop(e, index)}
							on:dragend={handleDragEnd}
							class="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border-2 transition-all cursor-move hover:shadow-md"
							class:border-blue-500={dragOverIndex === index}
							class:border-gray-200={dragOverIndex !== index}
							class:dark:border-gray-600={dragOverIndex !== index}
							class:opacity-50={draggedIndex === index}
							class:scale-105={dragOverIndex === index && draggedIndex !== index}
						>
							<GripVertical class="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
							<div class="flex-1">
								<div class="font-medium text-gray-900 dark:text-white">
									{sectionLabels[section] || section}
								</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">
									Position {index + 1}
								</div>
							</div>
							<div class="text-sm text-gray-400 dark:text-gray-500">
								{#if draggedIndex === index}
									Dragging...
								{:else}
									Drag to move
								{/if}
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
					<div class="flex items-start space-x-2">
						<div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<span class="text-white text-xs font-bold">i</span>
						</div>
						<div class="text-sm text-blue-700 dark:text-blue-300">
							<strong>Tip:</strong> The order you set here will be reflected in your published profile. The header section typically works best at the top, followed by your summary and experience.
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>