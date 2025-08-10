/**
 * Configuration constants for the Template Customizer component
 * Contains all theme options, font settings, layout configurations, and styling options
 */

export interface CustomizationConfig {
	theme: string;
	fontFamily: string;
	fontSize: string;
	layout: string;
	spacing: string;
	borderRadius: string;
	shadow: string;
	accentColor: string;
	textColor: string;
	backgroundColor: string;
	sectionOrder: string[];
	lineHeight: string;
	letterSpacing: string;
	headingFont: string;
	containerWidth: string;
	verticalSpacing: string;
	horizontalPadding: string;
}

export interface ThemeOption {
	name: string;
	color: string;
	label: string;
}

export interface FontOption {
	value: string;
	label: string;
	class: string;
	preview: string;
}

export interface SelectOption {
	value: string;
	label: string;
	class?: string;
	description?: string;
}

/**
 * Default customization configuration
 */
export const DEFAULT_CUSTOMIZATION: CustomizationConfig = {
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

/**
 * Available color themes
 */
export const THEME_OPTIONS: ThemeOption[] = [
	{ name: 'blue', color: '#3B82F6', label: 'Professional Blue' },
	{ name: 'green', color: '#10B981', label: 'Fresh Green' },
	{ name: 'purple', color: '#8B5CF6', label: 'Creative Purple' },
	{ name: 'red', color: '#EF4444', label: 'Bold Red' },
	{ name: 'indigo', color: '#6366F1', label: 'Modern Indigo' },
	{ name: 'teal', color: '#14B8A6', label: 'Calm Teal' },
	{ name: 'orange', color: '#F97316', label: 'Energetic Orange' },
	{ name: 'pink', color: '#EC4899', label: 'Vibrant Pink' }
];

/**
 * Available font families
 */
export const FONT_FAMILIES: FontOption[] = [
	{ value: 'inter', label: 'Inter (Modern)', class: 'font-sans', preview: 'Modern & Clean' },
	{ value: 'serif', label: 'Times (Classic)', class: 'font-serif', preview: 'Traditional & Elegant' },
	{ value: 'mono', label: 'Mono (Technical)', class: 'font-mono', preview: 'Code & Technical' },
	{ value: 'poppins', label: 'Poppins (Friendly)', class: 'font-sans', preview: 'Rounded & Approachable' },
	{ value: 'playfair', label: 'Playfair (Luxury)', class: 'font-serif', preview: 'Sophisticated & Bold' },
	{ value: 'roboto', label: 'Roboto (Google)', class: 'font-sans', preview: 'Neutral & Readable' }
];

/**
 * Heading font options
 */
export const HEADING_FONTS: SelectOption[] = [
	{ value: 'same', label: 'Same as Body' },
	{ value: 'serif', label: 'Serif Headings' },
	{ value: 'sans', label: 'Sans-serif Headings' },
	{ value: 'display', label: 'Display Font' }
];

/**
 * Font size options
 */
export const FONT_SIZES: SelectOption[] = [
	{ value: 'small', label: 'Compact', class: 'text-sm' },
	{ value: 'medium', label: 'Standard', class: 'text-base' },
	{ value: 'large', label: 'Readable', class: 'text-lg' }
];

/**
 * Layout options
 */
export const LAYOUT_OPTIONS: SelectOption[] = [
	{ value: 'standard', label: 'Standard', description: 'Traditional single column' },
	{ value: 'compact', label: 'Compact', description: 'Dense information layout' },
	{ value: 'spacious', label: 'Spacious', description: 'Generous whitespace' },
	{ value: 'sidebar', label: 'Sidebar', description: 'Two-column with sidebar' }
];

/**
 * Line height options
 */
export const LINE_HEIGHT_OPTIONS: SelectOption[] = [
	{ value: 'tight', label: 'Tight', class: 'leading-tight' },
	{ value: 'normal', label: 'Normal', class: 'leading-normal' },
	{ value: 'relaxed', label: 'Relaxed', class: 'leading-relaxed' },
	{ value: 'loose', label: 'Loose', class: 'leading-loose' }
];

/**
 * Letter spacing options
 */
export const LETTER_SPACING_OPTIONS: SelectOption[] = [
	{ value: 'tight', label: 'Tight', class: 'tracking-tight' },
	{ value: 'normal', label: 'Normal', class: 'tracking-normal' },
	{ value: 'wide', label: 'Wide', class: 'tracking-wide' },
	{ value: 'wider', label: 'Wider', class: 'tracking-wider' }
];

/**
 * Container width options
 */
export const CONTAINER_WIDTH_OPTIONS: SelectOption[] = [
	{ value: 'narrow', label: 'Narrow (600px)', class: 'max-w-2xl' },
	{ value: 'standard', label: 'Standard (800px)', class: 'max-w-4xl' },
	{ value: 'wide', label: 'Wide (1000px)', class: 'max-w-5xl' },
	{ value: 'full', label: 'Full Width', class: 'max-w-full' }
];

/**
 * Vertical spacing options
 */
export const VERTICAL_SPACING_OPTIONS: SelectOption[] = [
	{ value: 'compact', label: 'Compact', class: 'space-y-4' },
	{ value: 'normal', label: 'Normal', class: 'space-y-6' },
	{ value: 'relaxed', label: 'Relaxed', class: 'space-y-8' },
	{ value: 'spacious', label: 'Spacious', class: 'space-y-12' }
];

/**
 * Horizontal padding options
 */
export const HORIZONTAL_PADDING_OPTIONS: SelectOption[] = [
	{ value: 'minimal', label: 'Minimal', class: 'px-4' },
	{ value: 'normal', label: 'Normal', class: 'px-6' },
	{ value: 'generous', label: 'Generous', class: 'px-8' },
	{ value: 'maximum', label: 'Maximum', class: 'px-12' }
];

/**
 * General spacing options
 */
export const SPACING_OPTIONS: SelectOption[] = [
	{ value: 'tight', label: 'Tight', class: 'space-y-2' },
	{ value: 'normal', label: 'Normal', class: 'space-y-4' },
	{ value: 'relaxed', label: 'Relaxed', class: 'space-y-6' },
	{ value: 'loose', label: 'Loose', class: 'space-y-8' }
];

/**
 * Border radius options
 */
export const BORDER_RADIUS_OPTIONS: SelectOption[] = [
	{ value: 'none', label: 'Sharp', class: 'rounded-none' },
	{ value: 'small', label: 'Subtle', class: 'rounded-sm' },
	{ value: 'medium', label: 'Standard', class: 'rounded-md' },
	{ value: 'large', label: 'Rounded', class: 'rounded-lg' },
	{ value: 'full', label: 'Pill', class: 'rounded-full' }
];

/**
 * Shadow options
 */
export const SHADOW_OPTIONS: SelectOption[] = [
	{ value: 'none', label: 'Flat', class: 'shadow-none' },
	{ value: 'small', label: 'Subtle', class: 'shadow-sm' },
	{ value: 'medium', label: 'Standard', class: 'shadow-md' },
	{ value: 'large', label: 'Prominent', class: 'shadow-lg' },
	{ value: 'xl', label: 'Dramatic', class: 'shadow-xl' }
];

/**
 * Section labels for display
 */
export const SECTION_LABELS: { [key: string]: string } = {
	header: 'Header & Contact',
	about: 'About/Summary',
	experience: 'Work Experience',
	education: 'Education',
	skills: 'Skills',
	contact: 'Contact Information'
};

/**
 * Helper function to create default customization object
 */
export function createDefaultCustomization(): CustomizationConfig {
	return { ...DEFAULT_CUSTOMIZATION };
}

/**
 * Helper function to get theme by name
 */
export function getThemeByName(name: string): ThemeOption | undefined {
	return THEME_OPTIONS.find(theme => theme.name === name);
}

/**
 * Helper function to get font by value
 */
export function getFontByValue(value: string): FontOption | undefined {
	return FONT_FAMILIES.find(font => font.value === value);
}