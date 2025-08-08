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
		Sliders
	} from 'lucide-svelte';

	import type { TemplateCustomization } from '$lib/types';

	const dispatch = createEventDispatcher();

	export let selectedTemplate = 'classic';
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
		headingFont: 'same',
		containerWidth: 'standard',
		verticalSpacing: 'normal',
		horizontalPadding: 'normal'
	};

	// Accessibility state
	let focusableElements: HTMLElement[] = [];
	let currentFocusIndex = 0;

	// Keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				// Close any open modals or return to previous state
				break;
			case 'Tab':
				// Handle tab navigation
				break;
		}
	}

	// Focus management
	function focusFirstElement() {
		const firstButton = document.querySelector('button') as HTMLElement;
		if (firstButton) {
			firstButton.focus();
		}
	}

	// Announce changes to screen readers
	let announcementTimeout: ReturnType<typeof setTimeout> | null = null;

	function announceChange(message: string) {
		const announcement = document.createElement('div');
		announcement.setAttribute('aria-live', 'polite');
		announcement.setAttribute('aria-atomic', 'true');
		announcement.className = 'sr-only';
		announcement.textContent = message;
		document.body.appendChild(announcement);
		announcementTimeout = setTimeout(() => {
			if (document.body.contains(announcement)) {
				document.body.removeChild(announcement);
			}
			announcementTimeout = null;
		}, 1000);
	}

	onDestroy(() => {
		if (announcementTimeout) {
			clearTimeout(announcementTimeout);
		}
	});

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
		{
			value: 'serif',
			label: 'Times (Classic)',
			class: 'font-serif',
			preview: 'Traditional & Elegant'
		},
		{ value: 'mono', label: 'Mono (Technical)', class: 'font-mono', preview: 'Code & Technical' },
		{
			value: 'poppins',
			label: 'Poppins (Friendly)',
			class: 'font-sans',
			preview: 'Rounded & Approachable'
		},
		{
			value: 'playfair',
			label: 'Playfair (Luxury)',
			class: 'font-serif',
			preview: 'Sophisticated & Bold'
		},
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
		if (!customization) {
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
		}
		customization = { ...customization, [key]: value };
		dispatch('update', customization);

		// Announce changes to screen readers
		announceChange(`${key} updated to ${value}`);
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
		announceChange('Customization reset to defaults');
	}

	// Drag and drop functions for section reordering
	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
		announceChange(
			`Started dragging ${
				sectionLabels[customization.sectionOrder[index]] || customization.sectionOrder[index]
			} section`
		);
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
			announceChange(
				`${sectionLabels[draggedItem] || draggedItem} section moved to position ${dropIndex + 1}`
			);
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
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0"
	>
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white" id="customizer-title">
			Customize Template
		</h3>
		<div class="flex gap-2">
			<button
				on:click={resetToDefaults}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				aria-label="Reset all customization settings to defaults"
				title="Reset to defaults"
			>
				<RotateCcw class="w-4 h-4" aria-hidden="true" />
			</button>
			<button
				on:click={exportCustomization}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				aria-label="Export customization settings as JSON file"
				title="Export customization"
			>
				<Download class="w-4 h-4" aria-hidden="true" />
			</button>
			<button
				on:click={previewTemplate}
				class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
				aria-label="Preview template with current customization settings"
			>
				<Eye class="w-4 h-4 mr-1" aria-hidden="true" />
				Preview
			</button>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div
		class="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6"
		role="tablist"
		aria-labelledby="customizer-title"
	>
		<button
			on:click={() => (activeTab = 'colors')}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'colors'}
			class:text-blue-600={activeTab === 'colors'}
			class:border-transparent={activeTab !== 'colors'}
			class:text-gray-500={activeTab !== 'colors'}
			role="tab"
			aria-selected={activeTab === 'colors'}
			aria-controls="tabpanel-colors"
			id="tab-colors"
		>
			<Palette class="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
			<span class="hidden sm:inline">Colors & Themes</span>
			<span class="sm:hidden">Colors</span>
		</button>
		<button
			on:click={() => (activeTab = 'typography')}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'typography'}
			class:text-blue-600={activeTab === 'typography'}
			class:border-transparent={activeTab !== 'typography'}
			class:text-gray-500={activeTab !== 'typography'}
			role="tab"
			aria-selected={activeTab === 'typography'}
			aria-controls="tabpanel-typography"
			id="tab-typography"
		>
			<Type class="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
			<span class="hidden sm:inline">Typography</span>
			<span class="sm:hidden">Type</span>
		</button>
		<button
			on:click={() => (activeTab = 'layout')}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'layout'}
			class:text-blue-600={activeTab === 'layout'}
			class:border-transparent={activeTab !== 'layout'}
			class:text-gray-500={activeTab !== 'layout'}
			role="tab"
			aria-selected={activeTab === 'layout'}
			aria-controls="tabpanel-layout"
			id="tab-layout"
		>
			<Layout class="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
			<span class="hidden sm:inline">Layout & Spacing</span>
			<span class="sm:hidden">Layout</span>
		</button>
		<button
			on:click={() => (activeTab = 'sections')}
			class="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors"
			class:border-blue-500={activeTab === 'sections'}
			class:text-blue-600={activeTab === 'sections'}
			class:border-transparent={activeTab !== 'sections'}
			class:text-gray-500={activeTab !== 'sections'}
			role="tab"
			aria-selected={activeTab === 'sections'}
			aria-controls="tabpanel-sections"
			id="tab-sections"
		>
			<Sliders class="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
			<span class="hidden sm:inline">Section Order</span>
			<span class="sm:hidden">Sections</span>
		</button>
	</div>

	<!-- Tab Panels -->
	<div class="space-y-6">
		{#if activeTab === 'colors'}
			<div role="tabpanel" id="tabpanel-colors" aria-labelledby="tab-colors" class="space-y-6">
				<!-- Theme Selection -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</h4>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each themes as theme}
							<button
								on:click={() => updateCustomization('theme', theme.name)}
								class="relative p-3 rounded-lg border-2 transition-all {customization.theme ===
								theme.name
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Select {theme.label} theme"
								aria-pressed={customization.theme === theme.name}
							>
								<div class="w-full h-8 rounded-md mb-2" style="background: {theme.color}" />
								<span class="text-xs font-medium text-gray-900 dark:text-white">{theme.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Color Customization -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label
							for="accent-color"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Accent Color
						</label>
						<input
							id="accent-color"
							type="color"
							bind:value={customization.accentColor}
							on:change={() => updateCustomization('accentColor', customization.accentColor)}
							class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
							aria-label="Choose accent color"
						/>
					</div>
					<div>
						<label
							for="text-color"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Text Color
						</label>
						<input
							id="text-color"
							type="color"
							bind:value={customization.textColor}
							on:change={() => updateCustomization('textColor', customization.textColor)}
							class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
							aria-label="Choose text color"
						/>
					</div>
					<div>
						<label
							for="bg-color"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Background Color
						</label>
						<input
							id="bg-color"
							type="color"
							bind:value={customization.backgroundColor}
							on:change={() =>
								updateCustomization('backgroundColor', customization.backgroundColor)}
							class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
							aria-label="Choose background color"
						/>
					</div>
				</div>
			</div>
		{:else if activeTab === 'typography'}
			<div
				role="tabpanel"
				id="tabpanel-typography"
				aria-labelledby="tab-typography"
				class="space-y-6"
			>
				<!-- Font Family -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Font Family</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each fontFamilies as font}
							<button
								on:click={() => updateCustomization('fontFamily', font.value)}
								class="text-left p-3 rounded-lg border-2 transition-all {customization.fontFamily ===
								font.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set font family to {font.label}"
								aria-pressed={customization.fontFamily === font.value}
							>
								<div class="font-medium text-gray-900 dark:text-white mb-1 {font.class}">
									{font.label}
								</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">{font.preview}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Heading Font -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Heading Font</h4>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each headingFonts as font}
							<button
								on:click={() => updateCustomization('headingFont', font.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.headingFont ===
								font.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set heading font to {font.label}"
								aria-pressed={customization.headingFont === font.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{font.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Font Size -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Font Size</h4>
					<div class="grid grid-cols-3 gap-3">
						{#each fontSizes as size}
							<button
								on:click={() => updateCustomization('fontSize', size.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.fontSize === size.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set font size to {size.label}"
								aria-pressed={customization.fontSize === size.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{size.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Line Height -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Line Height</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each lineHeightOptions as option}
							<button
								on:click={() => updateCustomization('lineHeight', option.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.lineHeight ===
								option.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set line height to {option.label}"
								aria-pressed={customization.lineHeight === option.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Letter Spacing -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Letter Spacing</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each letterSpacingOptions as option}
							<button
								on:click={() => updateCustomization('letterSpacing', option.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.letterSpacing ===
								option.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set letter spacing to {option.label}"
								aria-pressed={customization.letterSpacing === option.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else if activeTab === 'layout'}
			<div role="tabpanel" id="tabpanel-layout" aria-labelledby="tab-layout" class="space-y-6">
				<!-- Layout Type -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Layout</h4>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each layouts as layout}
							<button
								on:click={() => updateCustomization('layout', layout.value)}
								class="text-left p-3 rounded-lg border-2 transition-all {customization.layout ===
								layout.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set layout to {layout.label}"
								aria-pressed={customization.layout === layout.value}
							>
								<div class="font-medium text-gray-900 dark:text-white mb-1">{layout.label}</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">{layout.description}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Container Width -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Container Width</h4>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each containerWidthOptions as option}
							<button
								on:click={() => updateCustomization('containerWidth', option.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.containerWidth ===
								option.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set container width to {option.label}"
								aria-pressed={customization.containerWidth === option.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Vertical Spacing -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Vertical Spacing</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each verticalSpacingOptions as spacing}
							<button
								on:click={() => updateCustomization('verticalSpacing', spacing.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.verticalSpacing ===
								spacing.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set vertical spacing to {spacing.label}"
								aria-pressed={customization.verticalSpacing === spacing.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white"
									>{spacing.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Horizontal Padding -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Horizontal Padding</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each horizontalPaddingOptions as padding}
							<button
								on:click={() => updateCustomization('horizontalPadding', padding.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.horizontalPadding ===
								padding.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set horizontal padding to {padding.label}"
								aria-pressed={customization.horizontalPadding === padding.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white"
									>{padding.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Spacing -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Spacing</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each spacingOptions as spacing}
							<button
								on:click={() => updateCustomization('spacing', spacing.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.spacing ===
								spacing.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set spacing to {spacing.label}"
								aria-pressed={customization.spacing === spacing.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white"
									>{spacing.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Border Radius -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Border Radius</h4>
					<div class="grid grid-cols-5 gap-3">
						{#each borderRadiusOptions as radius}
							<button
								on:click={() => updateCustomization('borderRadius', radius.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.borderRadius ===
								radius.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set border radius to {radius.label}"
								aria-pressed={customization.borderRadius === radius.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{radius.label}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Shadow -->
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Shadow</h4>
					<div class="grid grid-cols-5 gap-3">
						{#each shadowOptions as shadow}
							<button
								on:click={() => updateCustomization('shadow', shadow.value)}
								class="p-3 rounded-lg border-2 transition-all {customization.shadow === shadow.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
								aria-label="Set shadow to {shadow.label}"
								aria-pressed={customization.shadow === shadow.value}
							>
								<span class="text-sm font-medium text-gray-900 dark:text-white">{shadow.label}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else if activeTab === 'sections'}
			<div role="tabpanel" id="tabpanel-sections" aria-labelledby="tab-sections" class="space-y-6">
				<div>
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Section Order</h4>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
						Drag and drop sections to reorder them in your profile
					</p>
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
								aria-label="Drag to reorder {sectionLabels[section] || section} section"
								tabindex="0"
							>
								<GripVertical class="w-4 h-4 text-gray-400 mr-3" aria-hidden="true" />
								<span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">
									{sectionLabels[section] || section}
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
