import CVTemplate from '$lib/../components/CVTemplate.svelte';
import ModernTemplate from '$lib/../components/templates/ModernTemplate.svelte';
import MinimalistTemplate from '$lib/../components/templates/MinimalistTemplate.svelte';
import CreativeTemplate from '$lib/../components/templates/CreativeTemplate.svelte';
import PortfolioTemplate from '$lib/../components/templates/PortfolioTemplate.svelte';
import PersonalTemplate from '$lib/../components/templates/PersonalTemplate.svelte';
import CreativePortfolioTemplate from '$lib/../components/templates/CreativePortfolioTemplate.svelte';

export interface Theme {
	name: string;
	primary: string;
	secondary: string;
	accent: string;
	text: string;
	textSecondary: string;
}

export interface TemplateConfig {
	id: string;
	name: string;
	description: string;
	component: any;
	themes: Theme[];
	category: string;
}

/**
 * Default theme colors mapping
 */
export const THEME_COLORS: Record<string, string> = {
	blue: '#3B82F6',
	green: '#10B981',
	purple: '#8B5CF6',
	red: '#EF4444',
	indigo: '#6366F1',
	teal: '#14B8A6',
	orange: '#F97316',
	pink: '#EC4899'
};

/**
 * Theme descriptions for better UX
 */
export const THEME_DESCRIPTIONS: Record<string, string> = {
	Blue: 'Professional & Trustworthy',
	Green: 'Fresh & Growth-oriented',
	Purple: 'Creative & Innovative',
	Red: 'Bold & Energetic',
	Indigo: 'Modern & Sophisticated',
	Teal: 'Calm & Balanced',
	Orange: 'Vibrant & Enthusiastic',
	Pink: 'Creative & Approachable',
	Classic: 'Professional',
	Navy: 'Professional',
	Emerald: 'Fresh & Growth-oriented',
	Violet: 'Creative & Innovative',
	Ocean: 'Calm & Professional',
	Sunset: 'Warm & Energetic',
	Forest: 'Natural & Balanced',
	Galaxy: 'Modern & Mysterious',
	Rose: 'Elegant & Approachable',
	Mint: 'Fresh & Modern',
	Amber: 'Warm & Professional'
};

/**
 * Professional theme set for classic templates
 */
const PROFESSIONAL_THEMES: Theme[] = [
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
];

/**
 * Modern theme set with enhanced colors
 */
const MODERN_THEMES: Theme[] = [
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
];

/**
 * Minimalist theme set with subtle colors
 */
const MINIMALIST_THEMES: Theme[] = [
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
];

/**
 * Creative theme set with gradient-friendly colors
 */
const CREATIVE_THEMES: Theme[] = [
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
];

/**
 * Template configurations
 */
export const TEMPLATES: TemplateConfig[] = [
	{
		id: 'classic',
		name: 'Classic',
		description: 'Clean and professional design with browser-style header',
		component: CVTemplate,
		themes: PROFESSIONAL_THEMES,
		category: 'Professional'
	},
	{
		id: 'modern',
		name: 'Modern',
		description: 'Contemporary design with gradient header and card-based layout',
		component: ModernTemplate,
		themes: MODERN_THEMES,
		category: 'Contemporary'
	},
	{
		id: 'minimalist',
		name: 'Minimalist',
		description: 'Clean typography-focused design with elegant spacing',
		component: MinimalistTemplate,
		themes: MINIMALIST_THEMES,
		category: 'Simple'
	},
	{
		id: 'creative',
		name: 'Creative',
		description: 'Artistic design with gradients, animations, and modern aesthetics',
		component: CreativeTemplate,
		themes: CREATIVE_THEMES,
		category: 'Artistic'
	},
	{
		id: 'portfolio',
		name: 'Portfolio',
		description: 'Dynamic portfolio website with project showcase and modern layout',
		component: PortfolioTemplate,
		themes: MODERN_THEMES,
		category: 'Portfolio'
	},
	{
		id: 'personal',
		name: 'Personal',
		description: 'Personal branding focused template with clean modern design',
		component: PersonalTemplate,
		themes: MODERN_THEMES,
		category: 'Portfolio'
	},
	{
		id: 'creative-portfolio',
		name: 'Creative Portfolio',
		description: 'Creative portfolio with gradients, animations and modern aesthetics',
		component: CreativePortfolioTemplate,
		themes: CREATIVE_THEMES,
		category: 'Portfolio'
	}
];

/**
 * Helper function to get template by ID
 */
export function getTemplateById(id: string): TemplateConfig | undefined {
	return TEMPLATES.find(template => template.id === id);
}

/**
 * Helper function to get theme by name from a template
 */
export function getThemeByName(template: TemplateConfig, themeName: string): Theme | undefined {
	return template.themes.find(theme => theme.name.toLowerCase() === themeName.toLowerCase());
}

/**
 * Helper function to get theme description
 */
export function getThemeDescription(themeName: string): string {
	return THEME_DESCRIPTIONS[themeName] || 'Professional';
}