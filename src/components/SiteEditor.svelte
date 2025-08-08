<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import {
		Plus,
		Trash2,
		Upload,
		Save,
		Eye,
		Edit3,
		Download,
		FileText,
		User,
		ChevronRight,
		Globe,
		Palette,
		Settings,
		Award,
		Code,
		Trophy,
		Github,
		Twitter,
		Linkedin,
		Link2,
		Image,
		ExternalLink,
		CheckCircle,
		AlertCircle,
		Info,
		Zap,
		Star,
		Briefcase,
		GraduationCap,
		Languages,
		FolderOpen,
		Medal,
		Camera,
		Palette as PaletteIcon,
		Sparkles,
		Layout,
		Monitor,
		Smartphone,
		Tablet,
		EyeOff,
		Copy,
		Share2,
		QrCode,
		Globe as GlobeIcon,
		Settings as SettingsIcon,
		Palette as PaletteIcon2,
		Type,
		Image as ImageIcon,
		Layers,
		Grid,
		Columns,
		Rows,
		Square,
		Circle,
		Triangle,
		Hexagon,
		Star as StarIcon,
		Heart,
		Zap as ZapIcon,
		Flame,
		Droplets,
		Cloud,
		Sun,
		Moon,
		Sparkles as SparklesIcon
	} from 'lucide-svelte';
	import type { ResumeData, TemplateCustomization, Customization } from '$lib/types';
	import TemplateSelector from './TemplateSelector.svelte';
	import TemplateCustomizer from './TemplateCustomizer.svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let resumeData: ResumeData;
	export let showPreview = false;
	export let uploading = false;
	export let profileStatus: 'draft' | 'published' = 'draft';
	export let username: string = '';
	export let saveSuccess = false;

	// State management
	let selectedTemplate = 'modern';
	let selectedTheme = 'blue';
	let templateCustomization: TemplateCustomization = {
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

	// UI State
	let showAdvancedCustomization = false;
	let activeTab = 'templates';
	let applyingTemplate = false;
	let applyingTheme = false;
	let applyingCustomization = false;
	let showQuickActions = false;
	let showTips = false;
	let lastSaved = new Date();

	// Form validation and accessibility
	let formErrors: Record<string, string> = {};
	let isSubmitting = false;
	let focusableElements: HTMLElement[] = [];

	// Enhanced tab configuration for site building
	const tabs = [
		{
			id: 'templates',
			label: 'Templates',
			icon: Layout,
			description: 'Choose from professional templates',
			color: 'blue',
			required: true
		},
		{
			id: 'customization',
			label: 'Customization',
			icon: PaletteIcon2,
			description: 'Customize colors, fonts, and layout',
			color: 'purple',
			required: false
		},
		{
			id: 'layout',
			label: 'Layout',
			icon: Grid,
			description: 'Configure page layout and sections',
			color: 'green',
			required: false
		},
		{
			id: 'preview',
			label: 'Preview',
			icon: Eye,
			description: 'Preview your website',
			color: 'orange',
			required: false
		},
		{
			id: 'publish',
			label: 'Publish',
			icon: GlobeIcon,
			description: 'Publish and share your website',
			color: 'indigo',
			required: false
		}
	];

	// Template categories
	const templateCategories = [
		{
			id: 'professional',
			name: 'Professional',
			description: 'Clean and business-focused templates',
			icon: Briefcase,
			templates: ['modern', 'minimalist', 'corporate']
		},
		{
			id: 'creative',
			name: 'Creative',
			description: 'Bold and artistic templates',
			icon: Palette,
			templates: ['creative', 'artistic', 'portfolio']
		},
		{
			id: 'personal',
			name: 'Personal',
			description: 'Warm and personal templates',
			icon: Heart,
			templates: ['personal', 'friendly', 'casual']
		}
	];

	// Color schemes
	const colorSchemes = [
		{
			id: 'blue',
			name: 'Professional Blue',
			primary: '#3B82F6',
			secondary: '#1E40AF',
			accent: '#DBEAFE'
		},
		{
			id: 'green',
			name: 'Nature Green',
			primary: '#10B981',
			secondary: '#059669',
			accent: '#D1FAE5'
		},
		{
			id: 'purple',
			name: 'Creative Purple',
			primary: '#8B5CF6',
			secondary: '#7C3AED',
			accent: '#EDE9FE'
		},
		{
			id: 'orange',
			name: 'Energetic Orange',
			primary: '#F59E0B',
			secondary: '#D97706',
			accent: '#FEF3C7'
		},
		{
			id: 'red',
			name: 'Bold Red',
			primary: '#EF4444',
			secondary: '#DC2626',
			accent: '#FEE2E2'
		}
	];

	// Font options
	const fontOptions = [
		{ id: 'inter', name: 'Inter', category: 'Sans-serif' },
		{ id: 'roboto', name: 'Roboto', category: 'Sans-serif' },
		{ id: 'opensans', name: 'Open Sans', category: 'Sans-serif' },
		{ id: 'playfair', name: 'Playfair Display', category: 'Serif' },
		{ id: 'merriweather', name: 'Merriweather', category: 'Serif' },
		{ id: 'poppins', name: 'Poppins', category: 'Sans-serif' }
	];

	// Layout options
	const layoutOptions = [
		{
			id: 'standard',
			name: 'Standard',
			icon: Columns,
			description: 'Traditional single-column layout'
		},
		{ id: 'modern', name: 'Modern', icon: Grid, description: 'Grid-based modern layout' },
		{ id: 'minimal', name: 'Minimal', icon: Square, description: 'Clean and minimal design' },
		{
			id: 'creative',
			name: 'Creative',
			icon: SparklesIcon,
			description: 'Artistic and creative layout'
		}
	];

	// Initialize component
	onMount(() => {
		// Initialize template settings from resumeData if available
		if (resumeData.template) {
			selectedTemplate = resumeData.template;
		}
		if (resumeData.theme) {
			selectedTheme = resumeData.theme;
		}
		if (resumeData.customization) {
			templateCustomization = {
				...templateCustomization,
				...convertFromCustomization(resumeData.customization)
			};
		}

		// Focus management
		focusFirstElement();
	});

	// Cleanup on component destroy
	onDestroy(() => {
		// Clear any pending timeouts
		if (saveSuccessTimeout) {
			clearTimeout(saveSuccessTimeout);
		}

		// Remove event listeners
		if (clickOutsideAdded) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	// Listen for save success from parent with cleanup
	let saveSuccessTimeout: ReturnType<typeof setTimeout> | null = null;
	$: if (saveSuccess) {
		if (saveSuccessTimeout) clearTimeout(saveSuccessTimeout);
		saveSuccessTimeout = setTimeout(() => {
			saveSuccess = false;
			saveSuccessTimeout = null;
		}, 3000);
	}

	// Keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (showQuickActions) {
				showQuickActions = false;
			}
		}
	}

	// Click outside handler for dropdowns
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.quick-actions-dropdown')) {
			showQuickActions = false;
		}
	}

	// Add click outside listener with proper cleanup
	let clickOutsideAdded = false;
	$: if (showQuickActions && !clickOutsideAdded) {
		requestAnimationFrame(() => {
			document.addEventListener('click', handleClickOutside);
			clickOutsideAdded = true;
		});
	} else if (!showQuickActions && clickOutsideAdded) {
		document.removeEventListener('click', handleClickOutside);
		clickOutsideAdded = false;
	}

	// Focus management
	function focusFirstElement() {
		const firstInput = document.querySelector('input, button, textarea') as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
	}

	// Convert TemplateCustomization to Customization
	function convertToCustomization(templateCustom: TemplateCustomization): Customization {
		return {
			fontFamily: templateCustom.fontFamily,
			fontSize: templateCustom.fontSize,
			lineHeight: typeof templateCustom.lineHeight === 'string' ? 1.5 : templateCustom.lineHeight,
			margins: {
				top: 16,
				bottom: 16,
				left: 16,
				right: 16
			},
			colors: {
				primary: templateCustom.accentColor,
				secondary: templateCustom.textColor,
				accent: templateCustom.backgroundColor,
				text: templateCustom.textColor
			},
			layout: {
				columns: templateCustom.layout === 'two-column' ? 2 : 1,
				spacing: 16
			}
		};
	}

	// Convert Customization to TemplateCustomization
	function convertFromCustomization(customization: Customization): TemplateCustomization {
		return {
			theme: 'blue',
			fontFamily: customization.fontFamily,
			fontSize: customization.fontSize,
			layout:
				typeof customization.layout === 'object'
					? customization.layout.columns === 2
						? 'two-column'
						: 'standard'
					: customization.layout,
			spacing: 'normal',
			borderRadius: 'medium',
			shadow: 'medium',
			accentColor: customization.colors?.primary || '#3B82F6',
			textColor: customization.colors?.text || '#1F2937',
			backgroundColor: customization.colors?.accent || '#FFFFFF',
			sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
			lineHeight: customization.lineHeight?.toString() || '1.5',
			letterSpacing: 'normal',
			headingFont: customization.fontFamily,
			containerWidth: 'standard',
			verticalSpacing: 'normal',
			horizontalPadding: 'normal'
		};
	}

	function saveSite() {
		dispatch('save', {
			resumeData: {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			}
		});
	}

	function publishSite() {
		profileStatus = 'published';
		dispatch('publish', {
			resumeData: {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			}
		});
	}

	function togglePreview() {
		showPreview = !showPreview;
		dispatch('togglePreview', { showPreview });
	}

	function previewLive() {
		if (username) {
			window.open(`/u/${username}`, '_blank');
		} else {
			alert('Please set a username first to preview your live site.');
		}
	}

	function applyTheme() {
		applyingTheme = true;
		// Use requestAnimationFrame for better performance
		requestAnimationFrame(() => {
			dispatch('themeApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			});
			applyingTheme = false;
		});
	}

	function applyTemplate() {
		applyingTemplate = true;
		// Use requestAnimationFrame for better performance
		requestAnimationFrame(() => {
			dispatch('templateApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			});
			applyingTemplate = false;
		});
	}

	function applyCustomization() {
		applyingCustomization = true;
		// Use requestAnimationFrame for better performance
		requestAnimationFrame(() => {
			dispatch('customizationApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			});
			applyingCustomization = false;
		});
	}

	function handleTemplateChange(event: CustomEvent) {
		selectedTemplate = event.detail.template;
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = { ...templateCustomization, ...event.detail.customization };
		}
		// Update resumeData with new template settings for immediate preview
		resumeData = {
			...resumeData,
			template: selectedTemplate,
			theme: selectedTheme,
			customization: convertToCustomization(templateCustomization)
		};
	}

	function handleThemeChange(event: CustomEvent) {
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = { ...templateCustomization, ...event.detail.customization };
		}
		// Update resumeData with new theme settings for immediate preview
		resumeData = {
			...resumeData,
			template: selectedTemplate,
			theme: selectedTheme,
			customization: convertToCustomization(templateCustomization)
		};
	}

	function handleCustomizationChange(event: CustomEvent) {
		templateCustomization = { ...templateCustomization, ...event.detail };
		// Update resumeData with new customization settings for immediate preview
		resumeData = {
			...resumeData,
			customization: convertToCustomization(templateCustomization)
		};
	}

	// Export site function
	function exportSite() {
		dispatch('export', {
			resumeData: {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: convertToCustomization(templateCustomization)
			}
		});
	}

	// Share site function
	function shareSite() {
		if (username) {
			const url = `${window.location.origin}/u/${username}`;
			if (navigator.share) {
				navigator.share({
					title: `${resumeData.name || 'My'} Portfolio`,
					url: url
				});
			} else {
				navigator.clipboard.writeText(url);
				// Show success message
				dispatch('toast', {
					type: 'success',
					message: 'Site URL copied to clipboard!'
				});
			}
		}
	}
</script>
