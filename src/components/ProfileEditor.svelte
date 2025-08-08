<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import {
		Plus,
		Trash2,
		Upload,
		Save,
		Eye,
		Edit3,
		Download,
		FileText,
		User as UserIcon,
		ChevronRight,
		Globe,
		Palette,
		Settings,
		Award,
		Code,
		Trophy
	} from 'lucide-svelte';
	import type { ResumeData, TemplateCustomization, Customization } from '$lib/types';
	import TemplateSelector from './TemplateSelector.svelte';
	import TemplateCustomizer from './TemplateCustomizer.svelte';
	import RichTextEditor from './RichTextEditor.svelte';
	import DateRangePicker from './DateRangePicker.svelte';
	import SkillsInput from './SkillsInput.svelte';
	import PhoneInput from './PhoneInput.svelte';
	import WorkDetailsInput from './WorkDetailsInput.svelte';
	import AIDescriptionEnhancer from './AIDescriptionEnhancer.svelte';
	import AISummaryEnhancer from './AISummaryEnhancer.svelte';
	import InternationalPhoneInput from './InternationalPhoneInput.svelte';

	const dispatch = createEventDispatcher();

	export let resumeData: ResumeData;
	export let showPreview = false;
	export let uploading = false;
	export let profileStatus: 'draft' | 'published' = 'draft';
	export let username: string = '';
	export let saveSuccess = false;

	// Listen for save success from parent
	$: if (!uploading && saveSuccess) {
		if (saveSuccessTimeout) clearTimeout(saveSuccessTimeout);
		saveSuccessTimeout = setTimeout(() => {
			saveSuccess = false;
			saveSuccessTimeout = null;
		}, 3000);
	}

	let profilePhotoFile: File | null = null;
	let profilePhotoUrl = '';
	let selectedTemplate = 'classic';
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
	let showAdvancedCustomization = false;
	let activeTab = 'basic'; // basic, experience, education, skills, links, design
	let applyingTemplate = false;
	let applyingTheme = false;
	let applyingCustomization = false;

	// Accessibility and validation state
	let formErrors: Record<string, string> = {};
	let isSubmitting = false;
	let focusableElements: HTMLElement[] = [];

	// Timeout management
	let saveSuccessTimeout: ReturnType<typeof setTimeout> | null = null;
	let saveDelayTimeout: ReturnType<typeof setTimeout> | null = null;
	let themeApplyTimeout: ReturnType<typeof setTimeout> | null = null;
	let templateApplyTimeout: ReturnType<typeof setTimeout> | null = null;
	let customizationApplyTimeout: ReturnType<typeof setTimeout> | null = null;

	// Initialize template settings from resumeData if available
	$: if (resumeData) {
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
	}

	// Tab configuration
	const tabs = [
		{ id: 'basic', label: 'Basic Info', icon: UserIcon },
		{ id: 'experience', label: 'Experience', icon: FileText },
		{ id: 'education', label: 'Education', icon: FileText },
		{ id: 'certifications', label: 'Certifications', icon: Award },
		{ id: 'languages', label: 'Languages', icon: Globe },
		{ id: 'projects', label: 'Projects', icon: Code },
		{ id: 'awards', label: 'Awards', icon: Trophy },
		{ id: 'skills', label: 'Skills & Links', icon: Plus },
		{ id: 'design', label: 'Design', icon: Edit3 }
	];

	// Form validation functions
	function validateField(fieldName: string, value: string): string {
		switch (fieldName) {
			case 'name':
				return value.trim() ? '' : 'Full name is required';
			case 'email':
				if (!value.trim()) return '';
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(value) ? '' : 'Please enter a valid email address';
			case 'phone':
				if (!value.trim()) return '';
				const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
				return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
					? ''
					: 'Please enter a valid phone number';
			case 'username':
				if (!value.trim()) return 'Username is required';
				const usernameRegex = /^[a-zA-Z0-9-_]+$/;
				return usernameRegex.test(value)
					? ''
					: 'Username can only contain letters, numbers, hyphens, and underscores';
			default:
				return '';
		}
	}

	function validateForm(): boolean {
		const errors: Record<string, string> = {};

		errors.name = validateField('name', resumeData.name || '');
		errors.email = validateField('email', resumeData.email || '');
		errors.phone = validateField('phone', resumeData.phone || '');
		errors.username = validateField('username', username);

		formErrors = errors;
		return !Object.values(errors).some((error) => error !== '');
	}

	// Keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			// Close any open modals or return to edit mode
			if (showPreview) {
				showPreview = false;
			}
		}
	}

	// Focus management
	function focusFirstElement() {
		const firstInput = document.querySelector('input, button, textarea') as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
	}

	function addExperience() {
		if (!resumeData.experience) resumeData.experience = [];
		resumeData.experience = [
			...resumeData.experience,
			{
				title: '',
				company: '',
				type: '',
				period: '',
				current: false,
				description: ''
			}
		];
		// Focus the first input of the new experience entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#job-title-${resumeData.experience.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeExperience(index: number) {
		resumeData.experience = resumeData.experience?.filter((_, i) => i !== index) || [];
	}

	function addEducation() {
		if (!resumeData.education) resumeData.education = [];
		resumeData.education = [
			...resumeData.education,
			{
				degree: '',
				institution: '',
				period: ''
			}
		];
		// Focus the first input of the new education entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#degree-${resumeData.education.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeEducation(index: number) {
		resumeData.education = resumeData.education?.filter((_, i) => i !== index) || [];
	}

	function addSkill() {
		if (!resumeData.skills) resumeData.skills = [];
		resumeData.skills = [...resumeData.skills, ''];
		// Focus the new skill input
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#skill-${resumeData.skills.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeSkill(index: number) {
		resumeData.skills = resumeData.skills?.filter((_, i) => i !== index) || [];
	}

	function addLink() {
		if (!resumeData.links) resumeData.links = [];
		resumeData.links = [...resumeData.links, { type: 'LinkedIn', url: '' }];
		// Focus the new link input
		requestAnimationFrame(() => {
			const linksLength = resumeData.links?.length || 0;
			const newInput = document.querySelector(`#link-url-${linksLength - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeLink(index: number) {
		resumeData.links = resumeData.links?.filter((_, i) => i !== index) || [];
	}

	function addCertification() {
		if (!resumeData.certifications) resumeData.certifications = [];
		resumeData.certifications = [
			...resumeData.certifications,
			{
				name: '',
				issuer: '',
				date: '',
				description: '',
				credentialId: ''
			}
		];
		// Focus the first input of the new certification entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#cert-name-${resumeData.certifications.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeCertification(index: number) {
		resumeData.certifications = resumeData.certifications?.filter((_, i) => i !== index) || [];
	}

	function addLanguage() {
		if (!resumeData.languages) resumeData.languages = [];
		resumeData.languages = [
			...resumeData.languages,
			{
				language: '',
				proficiency: ''
			}
		];
		// Focus the first input of the new language entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#language-${resumeData.languages.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeLanguage(index: number) {
		resumeData.languages = resumeData.languages?.filter((_, i) => i !== index) || [];
	}

	function addProject() {
		if (!resumeData.projects) resumeData.projects = [];
		resumeData.projects = [
			...resumeData.projects,
			{
				title: '',
				description: '',
				technologies: ['']
			}
		];
		// Focus the first input of the new project entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#project-name-${resumeData.projects.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeProject(index: number) {
		resumeData.projects = resumeData.projects?.filter((_, i) => i !== index) || [];
	}

	function addAward() {
		if (!resumeData.awards) resumeData.awards = [];
		resumeData.awards = [
			...resumeData.awards,
			{
				title: '',
				organization: '',
				date: '',
				description: ''
			}
		];
		// Focus the first input of the new award entry
		requestAnimationFrame(() => {
			const newInput = document.querySelector(
				`#award-title-${resumeData.awards.length - 1}`
			) as HTMLInputElement;
			if (newInput) newInput.focus();
		});
	}

	function removeAward(index: number) {
		resumeData.awards = resumeData.awards?.filter((_, i) => i !== index) || [];
	}

	function handleProfilePhotoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type.startsWith('image/')) {
			profilePhotoFile = file;
			// Create preview URL
			profilePhotoUrl = URL.createObjectURL(file);
			dispatch('photoUpload', { file });
		}
	}

	function saveProfile() {
		dispatch('save', {
			resumeData,
			profilePhoto: profilePhotoFile,
			status: profileStatus,
			username: username
		});
	}

	function togglePreview() {
		showPreview = !showPreview;
		dispatch('togglePreview', { showPreview });
	}

	function publishProfile() {
		profileStatus = 'published';
		dispatch('publish', {
			resumeData,
			profilePhoto: profilePhotoFile,
			status: 'published'
		});
	}

	function saveDraft() {
		// Save draft called
		if (uploading) {
			// Upload in progress, ignoring save request
			return;
		}

		// Create a fresh copy of resumeData to ensure reactivity
		const dataToSave = {
			...resumeData,
			template: selectedTemplate,
			theme: selectedTheme,
			customization: templateCustomization
		};

		// Preparing data to save

		// Reset success state
		saveSuccess = false;

		// Add a small delay to prevent rapid successive clicks
		if (saveDelayTimeout) clearTimeout(saveDelayTimeout);
		saveDelayTimeout = setTimeout(() => {
			profileStatus = 'draft';
			// Dispatching save event
			dispatch('save', {
				resumeData: dataToSave,
				profilePhoto: profilePhotoFile,
				status: profileStatus,
				username
			});
			saveDelayTimeout = null;
		}, 100);
	}

	function togglePublishStatus() {
		const newStatus = profileStatus === 'published' ? 'draft' : 'published';
		profileStatus = newStatus;
		dispatch('statusChange', {
			resumeData,
			profilePhoto: profilePhotoFile,
			status: newStatus
		});
	}

	function applyTheme() {
		applyingTheme = true;
		if (themeApplyTimeout) clearTimeout(themeApplyTimeout);
		themeApplyTimeout = setTimeout(() => {
			dispatch('themeApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingTheme = false;
			themeApplyTimeout = null;
		}, 500);
	}

	function applyTemplate() {
		applyingTemplate = true;
		if (templateApplyTimeout) clearTimeout(templateApplyTimeout);
		templateApplyTimeout = setTimeout(() => {
			dispatch('templateApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingTemplate = false;
			templateApplyTimeout = null;
		}, 500);
	}

	function applyCustomization() {
		applyingCustomization = true;
		if (customizationApplyTimeout) clearTimeout(customizationApplyTimeout);
		customizationApplyTimeout = setTimeout(() => {
			dispatch('customizationApply', {
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingCustomization = false;
			customizationApplyTimeout = null;
		}, 500);
	}

	function previewLive() {
		if (username) {
			window.open(`/u/${username}`, '_blank');
		} else {
			alert('Please set a username first to preview your live profile.');
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

	function handleTemplateChange(event: CustomEvent) {
		// Template change received
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
		// Updated template and theme
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
		resumeData = { ...resumeData, customization: convertToCustomization(templateCustomization) };
	}

	// Manual resume creation function
	function createManualResume() {
		resumeData = {
			name: '',
			email: '',
			phone: '',
			location: '',
			summary: '',
			experience: [
				{ title: '', company: '', type: '', period: '', current: false, description: '' }
			],
			education: [{ degree: '', institution: '', period: '' }],
			certifications: [{ name: '', issuer: '', date: '', description: '', credentialId: '' }],
			languages: [{ language: '', proficiency: '' }],
			projects: [{ title: '', description: '', technologies: [''] }],
			awards: [{ title: '', organization: '', date: '', description: '' }],
			skills: [''],
			links: [{ type: 'LinkedIn', url: '' }]
		};
		dispatch('manualCreate', { resumeData });
	}

	// ATS-friendly resume export function
	function exportATSResume() {
		const atsContent = generateATSContent(resumeData);
		downloadTextFile(atsContent, `${resumeData.name || 'resume'}_ATS.txt`);
	}

	// Generate ATS-friendly content
	function generateATSContent(data: ResumeData): string {
		let content = '';

		// Header
		if (data.name) content += `${data.name.toUpperCase()}\n`;
		content += '='.repeat(50) + '\n\n';

		// Contact Information
		content += 'CONTACT INFORMATION\n';
		content += '-'.repeat(20) + '\n';
		if (data.email) content += `Email: ${data.email}\n`;
		if (data.phone) content += `Phone: ${data.phone}\n`;
		if (data.location) content += `Location: ${data.location}\n`;

		// Links
		if (data.links && data.links.length > 0) {
			data.links.forEach((link) => {
				if (link.url) content += `${link.type}: ${link.url}\n`;
			});
		}
		content += '\n';

		// Professional Summary
		if (data.summary) {
			content += 'PROFESSIONAL SUMMARY\n';
			content += '-'.repeat(20) + '\n';
			content += `${data.summary}\n\n`;
		}

		// Work Experience
		if (data.experience && data.experience.length > 0) {
			content += 'WORK EXPERIENCE\n';
			content += '-'.repeat(15) + '\n';
			data.experience.forEach((exp, index) => {
				if (exp.title || exp.company) {
					content += `${exp.title || 'Position'} | ${exp.company || 'Company'}\n`;
					if (exp.period) content += `Period: ${exp.period}\n`;
					if (exp.description) {
						content += `${exp.description}\n`;
					}
					if (index < data.experience.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Education
		if (data.education && data.education.length > 0) {
			content += 'EDUCATION\n';
			content += '-'.repeat(9) + '\n';
			data.education.forEach((edu, index) => {
				if (edu.degree || edu.institution) {
					content += `${edu.degree || 'Degree'} | ${edu.institution || 'Institution'}\n`;
					if (edu.period) content += `Period: ${edu.period}\n`;
					if (index < data.education.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Skills
		if (data.skills && data.skills.length > 0) {
			content += 'SKILLS\n';
			content += '-'.repeat(6) + '\n';
			const skillsList = data.skills.filter((skill) => skill.trim()).join(', ');
			content += `${skillsList}\n\n`;
		}

		// Certifications
		if (data.certifications && data.certifications.length > 0) {
			content += 'CERTIFICATIONS\n';
			content += '-'.repeat(14) + '\n';
			data.certifications.forEach((cert, index) => {
				if (cert.name || cert.issuer) {
					content += `${cert.name || 'Certification'} | ${cert.issuer || 'Issuer'}\n`;
					if (cert.date) content += `Date: ${cert.date}\n`;
					if (cert.description) content += `${cert.description}\n`;
					if (cert.credentialId) content += `Credential ID: ${cert.credentialId}\n`;
					if (index < data.certifications.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Languages
		if (data.languages && data.languages.length > 0) {
			content += 'LANGUAGES\n';
			content += '-'.repeat(10) + '\n';
			data.languages.forEach((lang, index) => {
				if (lang.language) {
					content += `${lang.language}: ${lang.proficiency || 'Proficient'}\n`;
					if (index < data.languages.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Projects
		if (data.projects && data.projects.length > 0) {
			content += 'PROJECTS\n';
			content += '-'.repeat(8) + '\n';
			data.projects.forEach((project, index) => {
				if (project.name) {
					content += `${project.name}\n`;
					if (project.description) content += `${project.description}\n`;
					if (project.technologies && project.technologies.length > 0) {
						const techList = project.technologies.filter((tech) => tech.trim()).join(', ');
						content += `Technologies: ${techList}\n`;
					}
					if (project.url) content += `URL: ${project.url}\n`;
					if (project.title) content += `Title: ${project.title}\n`;
					if (index < data.projects.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Awards
		if (data.awards && data.awards.length > 0) {
			content += 'AWARDS & RECOGNITIONS\n';
			content += '-'.repeat(20) + '\n';
			data.awards.forEach((award, index) => {
				if (award.title || award.organization) {
					content += `${award.title || 'Award'} | ${award.organization || 'Organization'}\n`;
					if (award.date) content += `Date: ${award.date}\n`;
					if (award.description) content += `${award.description}\n`;
					if (index < data.awards.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		return content;
	}

	// Download text file helper
	function downloadTextFile(content: string, filename: string) {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Get completion percentage for progress indicator
	function getCompletionPercentage(): number {
		let completed = 0;
		let total = 8; // Total fields to check

		if (resumeData.name?.trim()) completed++;
		if (resumeData.email?.trim()) completed++;
		if (resumeData.phone?.trim()) completed++;
		if (resumeData.location?.trim()) completed++;
		if (resumeData.summary?.trim()) completed++;
		if (resumeData.experience?.length > 0) completed++;
		if (resumeData.education?.length > 0) completed++;
		if (resumeData.skills?.length > 0) completed++;

		return Math.round((completed / total) * 100);
	}

	// Cleanup timeouts on component destroy
	onDestroy(() => {
		if (saveSuccessTimeout) clearTimeout(saveSuccessTimeout);
		if (saveDelayTimeout) clearTimeout(saveDelayTimeout);
		if (themeApplyTimeout) clearTimeout(themeApplyTimeout);
		if (templateApplyTimeout) clearTimeout(templateApplyTimeout);
		if (customizationApplyTimeout) clearTimeout(customizationApplyTimeout);
	});
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
	role="main"
	aria-label="Profile Editor"
>
	<!-- Header with Progress and Actions -->
	<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<div class="text-white">
					<h3 class="text-lg font-semibold" id="profile-editor-title">Profile Editor</h3>
					<p
						class="text-blue-100 text-sm"
						aria-live="polite"
						aria-label="Profile completion status"
					>
						{getCompletionPercentage()}% Complete
					</p>
				</div>
				<!-- Progress Bar -->
				<div
					class="w-32 bg-blue-500/30 rounded-full h-2"
					role="progressbar"
					aria-valuenow={getCompletionPercentage()}
					aria-valuemin="0"
					aria-valuemax="100"
					aria-labelledby="profile-editor-title"
				>
					<div
						class="bg-white rounded-full h-2 transition-all duration-300"
						style="width: {getCompletionPercentage()}%"
						aria-label="Profile completion progress"
					/>
				</div>
			</div>

			<!-- Status Indicator -->
			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-2" role="status" aria-live="polite">
					<div
						class="w-2 h-2 rounded-full {profileStatus === 'published'
							? 'bg-green-400'
							: 'bg-yellow-400'}"
						aria-label="Profile status indicator"
					/>
					<span class="text-white text-sm font-medium">
						{profileStatus === 'published' ? 'Published' : 'Draft'}
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="bg-white/10 backdrop-blur px-6 py-3 border-t border-white/20">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<!-- ATS Export Button -->
					{#if resumeData.name || resumeData.experience?.length > 0}
						<button
							on:click={exportATSResume}
							class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
							aria-label="Export ATS-friendly resume"
							title="Export ATS-friendly resume"
						>
							<Download class="w-4 h-4 mr-2" aria-hidden="true" />
							ATS Export
						</button>
					{/if}

					<button
						on:click={togglePreview}
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
						aria-label={showPreview ? 'Switch to edit mode' : 'Switch to preview mode'}
						aria-pressed={showPreview}
					>
						{#if showPreview}
							<Edit3 class="w-4 h-4 mr-2" aria-hidden="true" />
							Edit Mode
						{:else}
							<Eye class="w-4 h-4 mr-2" aria-hidden="true" />
							Preview Mode
						{/if}
					</button>

					<!-- Live Preview Button -->
					{#if username}
						<button
							on:click={previewLive}
							class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
							aria-label="Preview live profile in new tab"
							title="Preview live profile"
						>
							<Globe class="w-4 h-4 mr-2" aria-hidden="true" />
							Live Preview
						</button>
					{/if}
				</div>

				<!-- Publishing Controls -->
				<div class="flex items-center space-x-2">
					<button
						on:click={saveDraft}
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white {saveSuccess
							? 'bg-green-600 hover:bg-green-700'
							: 'bg-gray-600 hover:bg-gray-700'} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={uploading}
						aria-label="Save profile as draft"
						aria-busy={uploading}
					>
						{#if uploading}
							<div
								class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
							/>
							Saving...
						{:else if saveSuccess}
							<Save class="w-4 h-4 mr-2" aria-hidden="true" />
							Saved!
						{:else}
							<Save class="w-4 h-4 mr-2" aria-hidden="true" />
							Save Draft
						{/if}
					</button>

					<button
						on:click={togglePublishStatus}
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white {profileStatus ===
						'published'
							? 'bg-yellow-600 hover:bg-yellow-700'
							: 'bg-green-600 hover:bg-green-700'} rounded-lg transition-colors"
						disabled={uploading}
						aria-label={profileStatus === 'published' ? 'Unpublish profile' : 'Publish profile'}
						aria-busy={uploading}
					>
						{#if profileStatus === 'published'}
							<Eye class="w-4 h-4 mr-2" aria-hidden="true" />
							Unpublish
						{:else}
							<Upload class="w-4 h-4 mr-2" aria-hidden="true" />
							Publish
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>

	{#if showPreview}
		<!-- Preview Mode with Template -->
		<div class="p-6">
			<TemplateSelector
				profileData={{
					name: resumeData?.name || 'Your Name',
					avatar: profilePhotoUrl || resumeData?.photo_url || '',
					about: resumeData?.summary || 'Your professional summary goes here...',
					workExperience: resumeData?.experience?.map((exp) => ({
						title: exp.title || 'Job Title',
						company: exp.company || 'Company Name',
						type: 'Full-Time',
						period: exp.period || 'Start - End',
						current: false,
						description: exp.description || ''
					})) || [
						{
							title: 'Your Job Title',
							company: 'Company Name',
							type: 'Full-Time',
							period: 'Start - End',
							current: false,
							description: ''
						}
					],
					education: resumeData?.education?.map((edu) => ({
						institution: edu.institution || 'University Name',
						degree: edu.degree || 'Your Degree',
						period: edu.period || 'Start - End'
					})) || [
						{
							institution: 'University Name',
							degree: 'Your Degree',
							period: 'Start - End'
						}
					],
					skills: resumeData?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
					links: resumeData?.links || [],
					projects: resumeData?.projects || [],
					certifications: resumeData?.certifications || [],
					languages: resumeData?.languages || [],
					awards: resumeData?.awards || [],
					contact: {
						email: resumeData?.email || '',
						phone: resumeData?.phone || '',
						location: resumeData?.location || ''
					}
				}}
				customizable={false}
				{selectedTemplate}
				{selectedTheme}
				customization={templateCustomization}
			/>
		</div>
	{:else}
		<!-- Edit Mode with Tabs -->
		<div class="flex">
			<!-- Sidebar Navigation -->
			<div class="w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
				<div class="p-4 space-y-2" role="tablist" aria-label="Profile editor sections">
					{#each tabs as tab}
						<button
							on:click={() => (activeTab = tab.id)}
							class="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors {activeTab ===
							tab.id
								? 'bg-blue-600 text-white'
								: 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls="tabpanel-{tab.id}"
							id="tab-{tab.id}"
						>
							<svelte:component this={tab.icon} class="w-4 h-4 mr-3" aria-hidden="true" />
							{tab.label}
							{#if activeTab === tab.id}
								<ChevronRight class="w-4 h-4 ml-auto" aria-hidden="true" />
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 p-6">
				{#if activeTab === 'basic'}
					<!-- Basic Information Tab -->
					<div class="space-y-6" role="tabpanel" id="tabpanel-basic" aria-labelledby="tab-basic">
						<div class="flex items-center mb-6">
							<UserIcon class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h4>
						</div>

						<!-- Profile Photo Upload -->
						<div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
							<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
								Profile Photo
							</div>
							<div class="flex items-center space-x-4">
								{#if profilePhotoUrl || resumeData.photo_url}
									<img
										src={profilePhotoUrl || resumeData.photo_url}
										alt="Profile"
										class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
									/>
								{:else}
									<div
										class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
									>
										<span class="text-2xl font-bold text-white">
											{resumeData.name?.charAt(0) || 'U'}
										</span>
									</div>
								{/if}
								<label
									for="profile-photo-upload"
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
								>
									<Upload class="w-4 h-4 mr-2" aria-hidden="true" />
									Upload Photo
								</label>
								<input
									id="profile-photo-upload"
									type="file"
									accept="image/*"
									on:change={handleProfilePhotoUpload}
									class="sr-only"
									aria-label="Upload profile photo"
								/>
							</div>
						</div>

						<!-- Contact Information -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label
									for="fullName"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Full Name *
								</label>
								<input
									id="fullName"
									type="text"
									bind:value={resumeData.name}
									on:blur={() => (formErrors.name = validateField('name', resumeData.name || ''))}
									class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.name
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600'}"
									placeholder="Your full name"
									aria-describedby="fullName-error"
									aria-invalid={!!formErrors.name}
									required
								/>
								{#if formErrors.name}
									<p id="fullName-error" class="text-red-600 text-sm mt-1" role="alert">
										{formErrors.name}
									</p>
								{/if}
							</div>

							<div>
								<label
									for="email"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Email Address
								</label>
								<input
									id="email"
									type="email"
									bind:value={resumeData.email}
									on:blur={() =>
										(formErrors.email = validateField('email', resumeData.email || ''))}
									class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.email
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600'}"
									placeholder="your.email@example.com"
									aria-describedby="email-error"
									aria-invalid={!!formErrors.email}
								/>
								{#if formErrors.email}
									<p id="email-error" class="text-red-600 text-sm mt-1" role="alert">
										{formErrors.email}
									</p>
								{/if}
							</div>

							<div>
								<InternationalPhoneInput
									bind:value={resumeData.phone}
									on:input={(e) => {
										resumeData.phone = e.detail.value;
										formErrors.phone = validateField('phone', resumeData.phone || '');
									}}
									on:blur={() =>
										(formErrors.phone = validateField('phone', resumeData.phone || ''))}
									id="phone"
									label="Phone Number"
									placeholder="+1 (555) 123-4567"
								/>
								{#if formErrors.phone}
									<p id="phone-error" class="text-red-600 text-sm mt-1" role="alert">
										{formErrors.phone}
									</p>
								{/if}
							</div>

							<div>
								<label
									for="location"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Location
								</label>
								<input
									id="location"
									type="text"
									bind:value={resumeData.location}
									class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="City, State/Country"
								/>
							</div>

							<div>
								<label
									for="username"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Username *
								</label>
								<input
									id="username"
									type="text"
									bind:value={username}
									on:blur={() => (formErrors.username = validateField('username', username))}
									class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.username
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600'}"
									placeholder="your-username"
									pattern="[a-zA-Z0-9-_]+"
									title="Username can only contain letters, numbers, hyphens, and underscores"
									aria-describedby="username-error username-help"
									aria-invalid={!!formErrors.username}
									required
								/>
								{#if formErrors.username}
									<p id="username-error" class="text-red-600 text-sm mt-1" role="alert">
										{formErrors.username}
									</p>
								{/if}
								<p id="username-help" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Your public profile will be available at: siteme.com/u/{username ||
										'your-username'}
								</p>
							</div>
						</div>

						<!-- Professional Summary -->
						<div>
							<AISummaryEnhancer
								bind:value={resumeData.summary}
								id="summary"
								label="Professional Summary"
								placeholder="Write a brief summary of your professional background and goals..."
							/>
						</div>
					</div>
				{:else if activeTab === 'experience'}
					<!-- Experience Tab -->
					<div
						class="space-y-6"
						role="tabpanel"
						id="tabpanel-experience"
						aria-labelledby="tab-experience"
					>
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<FileText class="w-6 h-6 text-green-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Work Experience</h4>
							</div>
							<button
								on:click={addExperience}
								class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
								aria-label="Add new work experience entry"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
								Add Experience
							</button>
						</div>

						{#if resumeData.experience && resumeData.experience.length > 0}
							<div class="space-y-6">
								{#each resumeData.experience as exp, index}
									<div
										class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm"
									>
										<div class="flex items-center justify-between mb-4">
											<h6
												class="font-medium text-gray-900 dark:text-white flex items-center"
												id="experience-{index}-title"
											>
												<span
													class="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mr-2"
													aria-hidden="true"
												>
													{index + 1}
												</span>
												Experience {index + 1}
											</h6>
											<button
												on:click={() => removeExperience(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
												aria-label="Remove experience entry {index + 1}"
											>
												<Trash2 class="w-4 h-4" aria-hidden="true" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label
													for="job-title-{index}"
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													Job Title
												</label>
												<input
													id="job-title-{index}"
													type="text"
													bind:value={exp.title}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
													placeholder="Software Engineer"
													aria-describedby="experience-{index}-title"
												/>
											</div>
											<div>
												<label
													for="company-{index}"
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													Company
												</label>
												<input
													id="company-{index}"
													type="text"
													bind:value={exp.company}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
													placeholder="Tech Company Inc."
													aria-describedby="experience-{index}-title"
												/>
											</div>
										</div>

										<!-- Work Details -->
										<WorkDetailsInput
											location={''}
											contractType={exp.type || ''}
											on:input={(e) => {
												exp.type = e.detail.contractType;
											}}
											label="Work Details"
										/>
										<div class="mb-4">
											<DateRangePicker
												startDate={''}
												endDate={''}
												isCurrent={exp.current || false}
												on:input={(e) => {
													exp.period = e.detail.duration;
													exp.current = e.detail.isCurrent;
												}}
												id="duration-{index}"
												label="Duration"
											/>
										</div>
										<div>
											<AIDescriptionEnhancer
												bind:value={exp.description}
												id="description-{index}"
												label="Description"
												placeholder="Describe your responsibilities and achievements..."
											/>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<FileText class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No work experience added yet</p>
								<button
									on:click={addExperience}
									class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Experience
								</button>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'education'}
					<!-- Education Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<FileText class="w-6 h-6 text-purple-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Education</h4>
							</div>
							<button
								on:click={addEducation}
								class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Education
							</button>
						</div>

						{#if resumeData.education && resumeData.education.length > 0}
							<div class="space-y-6">
								{#each resumeData.education as edu, index}
									<div
										class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm"
									>
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span
													class="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold mr-2"
												>
													{index + 1}
												</span>
												Education {index + 1}
											</h6>
											<button
												on:click={() => removeEducation(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label
													for="degree-{index}"
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													Degree
												</label>
												<input
													id="degree-{index}"
													type="text"
													bind:value={edu.degree}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
													placeholder="Bachelor of Science"
												/>
											</div>
											<div>
												<label
													for="institution-{index}"
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													Institution
												</label>
												<input
													id="institution-{index}"
													type="text"
													bind:value={edu.institution}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
													placeholder="University Name"
												/>
											</div>
										</div>
										<div>
											<DateRangePicker
												startDate={''}
												endDate={''}
												isCurrent={false}
												on:input={(e) => {
													edu.period = e.detail.duration;
												}}
												id="year-{index}"
												label="Duration"
											/>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<FileText class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No education added yet</p>
								<button
									on:click={addEducation}
									class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Education
								</button>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'skills'}
					<!-- Skills & Links Tab -->
					<div class="space-y-6">
						<!-- Skills Section -->
						<div>
							<div class="flex items-center mb-6">
								<Plus class="w-6 h-6 text-blue-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Skills</h4>
							</div>

							<SkillsInput
								bind:skills={resumeData.skills}
								on:input={(e) => {
									resumeData.skills = e.detail.skills;
								}}
								label="Professional Skills"
								placeholder="Add a skill (e.g., JavaScript, React, Project Management)"
							/>
						</div>

						<!-- Links Section -->
						<div>
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center">
									<ChevronRight class="w-6 h-6 text-indigo-600 mr-3" />
									<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Links</h4>
								</div>
								<button
									on:click={addLink}
									class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Link
								</button>
							</div>

							{#if resumeData.links && resumeData.links.length > 0}
								<div class="space-y-4">
									{#each resumeData.links as link, index}
										<div
											class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm"
										>
											<div class="flex items-center justify-between mb-4">
												<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
													<span
														class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold mr-2"
													>
														{index + 1}
													</span>
													Link {index + 1}
												</h6>
												<button
													on:click={() => removeLink(index)}
													class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
											<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label
														for="link-label-{index}"
														class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														Label
													</label>
													<input
														id="link-label-{index}"
														type="text"
														bind:value={link.type}
														class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
														placeholder="LinkedIn, GitHub, Portfolio"
													/>
												</div>
												<div>
													<label
														for="link-url-{index}"
														class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														URL
													</label>
													<input
														id="link-url-{index}"
														type="url"
														bind:value={link.url}
														class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
														placeholder="https://..."
													/>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<ChevronRight class="w-8 h-8 text-gray-400 mx-auto mb-2" />
									<p class="text-gray-500 dark:text-gray-400 mb-4">No links added yet</p>
									<button
										on:click={addLink}
										class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
									>
										<Plus class="w-4 h-4 mr-2" />
										Add Your First Link
									</button>
								</div>
							{/if}
						</div>
					</div>
				{:else if activeTab === 'skills'}
					<!-- Skills & Links Tab -->
					<div class="space-y-8">
						<!-- Skills Section -->
						<div>
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center">
									<Plus class="w-6 h-6 text-orange-600 mr-3" />
									<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Skills</h4>
								</div>
								<button
									on:click={addSkill}
									class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Skill
								</button>
							</div>

							{#if resumeData.skills && resumeData.skills.length > 0}
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									{#each resumeData.skills as skill, index}
										<div
											class="flex items-center space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
										>
											<span
												class="w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
											>
												{index + 1}
											</span>
											<input
												type="text"
												bind:value={resumeData.skills[index]}
												class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
												placeholder="Enter skill name"
											/>
											<button
												on:click={() => removeSkill(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<Plus class="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p class="text-gray-500 dark:text-gray-400 mb-4">No skills added yet</p>
									<button
										on:click={addSkill}
										class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
									>
										<Plus class="w-4 h-4 mr-2" />
										Add Your First Skill
									</button>
								</div>
							{/if}
						</div>

						<!-- Links Section -->
						<div>
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center">
									<ChevronRight class="w-6 h-6 text-blue-600 mr-3" />
									<h4 class="text-xl font-semibold text-gray-900 dark:text-white">
										Professional Links
									</h4>
								</div>
								<button
									on:click={addLink}
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Link
								</button>
							</div>

							{#if resumeData.links && resumeData.links.length > 0}
								<div class="space-y-4">
									{#each resumeData.links as link, index}
										<div
											class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm"
										>
											<div class="flex items-center justify-between mb-4">
												<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
													<span
														class="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-2"
													>
														{index + 1}
													</span>
													Link {index + 1}
												</h6>
												<button
													on:click={() => removeLink(index)}
													class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
											<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div>
													<label
														for="link-type-{index}"
														class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														Type
													</label>
													<input
														id="link-type-{index}"
														type="text"
														bind:value={link.type}
														class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
														placeholder="LinkedIn"
													/>
												</div>
												<div class="md:col-span-2">
													<label
														for="link-url-{index}"
														class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														URL
													</label>
													<input
														id="link-url-{index}"
														type="url"
														bind:value={link.url}
														class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
														placeholder="https://linkedin.com/in/yourprofile"
													/>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<ChevronRight class="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p class="text-gray-500 dark:text-gray-400 mb-4">
										No professional links added yet
									</p>
									<button
										on:click={addLink}
										class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
									>
										<Plus class="w-4 h-4 mr-2" />
										Add Your First Link
									</button>
								</div>
							{/if}
						</div>
					</div>
				{:else if activeTab === 'design'}
					<!-- Design Tab -->
					<div class="space-y-6">
						<div class="flex items-center mb-6">
							<Edit3 class="w-6 h-6 text-indigo-600 mr-3" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Template & Design</h4>
						</div>

						<div
							class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700"
						>
							<div class="flex items-center justify-between mb-4">
								<h5 class="text-lg font-semibold text-gray-900 dark:text-white">
									Template Customization
								</h5>
								<button
									on:click={() => (showAdvancedCustomization = !showAdvancedCustomization)}
									class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium px-3 py-1 bg-white dark:bg-gray-700 rounded-lg border border-indigo-200 dark:border-indigo-600 transition-colors"
								>
									{showAdvancedCustomization ? 'Hide' : 'Show'} Advanced Options
								</button>
							</div>

							<TemplateSelector
								profileData={{
									name: resumeData?.name || 'Your Name',
									avatar: profilePhotoUrl || resumeData?.photo_url || '',
									about: resumeData?.summary || 'Your professional summary goes here...',
									workExperience: resumeData?.experience?.map((exp) => ({
										title: exp.title || 'Job Title',
										company: exp.company || 'Company Name',
										type: 'Full-Time',
										period: exp.duration || 'Start - End',
										current: false,
										description: exp.description || ''
									})) || [
										{
											title: 'Your Job Title',
											company: 'Company Name',
											type: 'Full-Time',
											period: 'Start - End',
											current: false,
											description: ''
										}
									],
									education: resumeData?.education?.map((edu) => ({
										institution: edu.institution || 'University Name',
										degree: edu.degree || 'Your Degree',
										period: edu.year || 'Start - End'
									})) || [
										{
											institution: 'University Name',
											degree: 'Your Degree',
											period: 'Start - End'
										}
									],
									skills: resumeData?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
									contact: {
										email: resumeData?.email || '',
										phone: resumeData?.phone || '',
										location: resumeData?.location || ''
									}
								}}
								customizable={true}
								{selectedTemplate}
								{selectedTheme}
								customization={templateCustomization}
								on:templateChange={handleTemplateChange}
								on:themeChange={handleThemeChange}
								on:customizationChange={handleCustomizationChange}
							/>

							{#if showAdvancedCustomization}
								<div class="mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
									<TemplateCustomizer
										{selectedTemplate}
										customization={templateCustomization}
										on:update={handleCustomizationChange}
									/>
								</div>
							{/if}

							<!-- Apply Buttons -->
							<div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div class="flex flex-wrap gap-3">
									<button
										on:click={applyTemplate}
										disabled={applyingTemplate}
										class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
									>
										{#if applyingTemplate}
											<div
												class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
											/>
											Applying...
										{:else}
											<Eye class="w-4 h-4 mr-2" />
											Apply Template
										{/if}
									</button>
									<button
										on:click={applyTheme}
										disabled={applyingTheme}
										class="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
									>
										{#if applyingTheme}
											<div
												class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
											/>
											Applying...
										{:else}
											<Palette class="w-4 h-4 mr-2" />
											Apply Theme
										{/if}
									</button>
									{#if showAdvancedCustomization}
										<button
											on:click={applyCustomization}
											disabled={applyingCustomization}
											class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
										>
											{#if applyingCustomization}
												<div
													class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
												/>
												Applying...
											{:else}
												<Settings class="w-4 h-4 mr-2" />
												Apply Customization
											{/if}
										</button>
									{/if}
								</div>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
									Click apply buttons to see changes reflected in your profile preview
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
