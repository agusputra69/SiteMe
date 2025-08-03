<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Trash2, Upload, Save, Eye, Edit3, Download, FileText, User, ChevronRight, Globe, Palette, Settings, Award, Code, Trophy, Github, Twitter, Linkedin, Link2, Image, ExternalLink } from 'lucide-svelte';
	import type { ResumeData } from '$lib/ai';
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

	// Ensure skills array is always initialized
	$: if (resumeData && !resumeData.skills) {
		resumeData.skills = [];
	}

	// Autosave functionality
	let autosaveTimeout: NodeJS.Timeout | null = null;
	let lastSavedData: string = '';
	let isAutoSaving = false;
	let autoSaveEnabled = true;
	let hasUnsavedChanges = false;

	// Listen for save success from parent
	$: if (!uploading && saveSuccess) {
		hasUnsavedChanges = false;
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	// Improved autosave with better conflict handling
	$: {
		if (resumeData && autoSaveEnabled) {
			const currentData = JSON.stringify(resumeData);
			if (currentData !== lastSavedData && lastSavedData !== '') {
				hasUnsavedChanges = true;
				// Clear existing timeout
				if (autosaveTimeout) {
					clearTimeout(autosaveTimeout);
				}
				// Set new timeout for autosave with longer delay
				autosaveTimeout = setTimeout(() => {
					if (!uploading && !isAutoSaving && hasUnsavedChanges) {
						performAutoSave();
					}
				}, 5000); // Increased to 5 seconds to reduce conflicts
			} else if (lastSavedData === '') {
				// Initialize lastSavedData on first load
				lastSavedData = currentData;
			}
		}
	}

	let profilePhotoFile: File | null = null;
	let profilePhotoUrl = '';
	let selectedTemplate = 'classic';
	let selectedTheme = 'blue';
	let templateCustomization = {
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

	// Initialize template settings from resumeData if available
	$: if (resumeData) {
		if (resumeData.template) {
			selectedTemplate = resumeData.template;
		}
		if (resumeData.theme) {
			selectedTheme = resumeData.theme;
		}
		if (resumeData.customization) {
			templateCustomization = { ...templateCustomization, ...resumeData.customization };
		}
	}



	// Tab configuration
	const tabs = [
		{ id: 'basic', label: 'Basic Info', icon: User },
		{ id: 'experience', label: 'Experience', icon: FileText },
		{ id: 'education', label: 'Education', icon: FileText },
		{ id: 'certifications', label: 'Certifications', icon: Award },
		{ id: 'languages', label: 'Languages', icon: Globe },
		{ id: 'projects', label: 'Projects', icon: Code },
		{ id: 'awards', label: 'Awards', icon: Trophy },
		{ id: 'skills', label: 'Skills', icon: Plus },
		{ id: 'links', label: 'Portfolio Showcase', icon: ExternalLink },
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
				return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? '' : 'Please enter a valid phone number';
			case 'username':
				if (!value.trim()) return 'Username is required';
				const usernameRegex = /^[a-zA-Z0-9-_]+$/;
				return usernameRegex.test(value) ? '' : 'Username can only contain letters, numbers, hyphens, and underscores';
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
		return !Object.values(errors).some(error => error !== '');
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
				duration: '', 
				description: '',
				startDate: '',
				endDate: '',
				isCurrent: false,
				location: '',
				contractType: ''
			}
		];
		// Focus the first input of the new experience entry
		setTimeout(() => {
			const newInput = document.querySelector(`#job-title-${resumeData.experience.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
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
				year: '',
				startDate: '',
				endDate: '',
				isCurrent: false
			}
		];
		// Focus the first input of the new education entry
		setTimeout(() => {
			const newInput = document.querySelector(`#degree-${resumeData.education.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
	}

	function removeEducation(index: number) {
		resumeData.education = resumeData.education?.filter((_, i) => i !== index) || [];
	}

	function addSkill() {
		if (!resumeData.skills) resumeData.skills = [];
		resumeData.skills = [...resumeData.skills, ''];
		// Focus the new skill input
		setTimeout(() => {
			const newInput = document.querySelector(`#skill-${resumeData.skills.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
	}

	function removeSkill(index: number) {
		resumeData.skills = resumeData.skills?.filter((_, i) => i !== index) || [];
	}

	// Predefined social media options
	const socialMediaOptions = [
		{ name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile', color: 'bg-blue-600' },
		{ name: 'GitHub', icon: Github, placeholder: 'https://github.com/yourusername', color: 'bg-gray-800' },
		{ name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/yourusername', color: 'bg-blue-400' },
		{ name: 'Portfolio', icon: Globe, placeholder: 'https://yourportfolio.com', color: 'bg-purple-600' },
		{ name: 'Website', icon: Link2, placeholder: 'https://yourwebsite.com', color: 'bg-green-600' },
		{ name: 'Other', icon: ExternalLink, placeholder: 'https://...', color: 'bg-gray-600' }
	];

	// Helper functions for social media
	function addSocialMediaLink(platform: string) {
		if (!resumeData.links) resumeData.links = [];
		const option = socialMediaOptions.find(opt => opt.name === platform);
		resumeData.links = [...resumeData.links, {
			type: platform,
			url: option?.placeholder || ''
		}];
		// Focus the new link input
		setTimeout(() => {
			const linksLength = resumeData.links?.length || 0;
			const newInput = document.querySelector(`#link-url-${linksLength - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
	}

	function getSocialMediaIcon(type: string) {
		const option = socialMediaOptions.find(opt => opt.name.toLowerCase() === type.toLowerCase());
		return option?.icon || ExternalLink;
	}

	function getSocialMediaColor(type: string) {
		const option = socialMediaOptions.find(opt => opt.name.toLowerCase() === type.toLowerCase());
		return option?.color || 'bg-gray-600';
	}

	function addLink() {
		if (!resumeData.links) resumeData.links = [];
		resumeData.links = [...resumeData.links, { type: 'LinkedIn', url: '' }];
		// Focus the new link input
		setTimeout(() => {
			const linksLength = resumeData.links?.length || 0;
			const newInput = document.querySelector(`#link-url-${linksLength - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
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
		setTimeout(() => {
			const newInput = document.querySelector(`#cert-name-${resumeData.certifications.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
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
		setTimeout(() => {
			const newInput = document.querySelector(`#language-${resumeData.languages.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
	}

	function removeLanguage(index: number) {
		resumeData.languages = resumeData.languages?.filter((_, i) => i !== index) || [];
	}

	function addProject() {
		if (!resumeData.projects) resumeData.projects = [];
		resumeData.projects = [
			...resumeData.projects,
			{ 
				name: '', 
				description: '', 
				technologies: [''],
				url: '',
				duration: '',
				image: ''
			}
		];
		// Focus the first input of the new project entry
		setTimeout(() => {
			const newInput = document.querySelector(`#project-name-${resumeData.projects.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
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
		setTimeout(() => {
			const newInput = document.querySelector(`#award-title-${resumeData.awards.length - 1}`) as HTMLInputElement;
			if (newInput) newInput.focus();
		}, 100);
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
			resumeData: resumeData, 
			profilePhoto: profilePhotoFile,
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
			resumeData: resumeData, 
			profilePhoto: profilePhotoFile
		});
	}

	// Manual save function
	function saveDraft() {
		if (uploading || isAutoSaving) {
			return;
		}
		
		// Disable autosave temporarily during manual save
		autoSaveEnabled = false;
		
		// Create a fresh copy of resumeData to ensure reactivity
		const dataToSave = {
			...resumeData,
			template: selectedTemplate,
			theme: selectedTheme,
			customization: templateCustomization
		};
		
		// Reset success state
		saveSuccess = false;
		hasUnsavedChanges = false;
		
		// Update lastSavedData to prevent auto save conflicts
		lastSavedData = JSON.stringify(resumeData);
		
		// Add a small delay to prevent rapid successive clicks
		setTimeout(() => {
			profileStatus = 'draft';
			dispatch('save', { 
				resumeData: dataToSave, 
				profilePhoto: profilePhotoFile
			});
			
			// Re-enable autosave after manual save completes
			setTimeout(() => {
				autoSaveEnabled = true;
			}, 1000);
		}, 100);
	}

	// Auto save function
	async function performAutoSave() {
		if (uploading || !hasUnsavedChanges) {
			return;
		}
		
		isAutoSaving = true;
		
		try {
			const dataToSave = {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			};
			
			// Update lastSavedData before dispatching
			lastSavedData = JSON.stringify(resumeData);
			hasUnsavedChanges = false;
			
			dispatch('save', { 
				resumeData: dataToSave, 
				profilePhoto: profilePhotoFile,
				isAutoSave: true
			});
		} catch (error) {
			console.error('Auto save failed:', error);
			hasUnsavedChanges = true;
		} finally {
			isAutoSaving = false;
		}
	}

	// Function to disable autosave when user is actively typing
	function handleInputFocus() {
		autoSaveEnabled = false;
	}

	// Function to re-enable autosave when user stops typing
	function handleInputBlur() {
		setTimeout(() => {
			autoSaveEnabled = true;
		}, 500);
	}

	function togglePublishStatus() {
		const newStatus = profileStatus === 'published' ? 'draft' : 'published';
		profileStatus = newStatus;
		dispatch('statusChange', { 
			resumeData: resumeData, 
			profilePhoto: profilePhotoFile
		});
	}

	function applyTheme() {
		applyingTheme = true;
		setTimeout(() => {
			dispatch('themeApply', { 
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingTheme = false;
		}, 500);
	}

	function applyTemplate() {
		applyingTemplate = true;
		setTimeout(() => {
			dispatch('templateApply', { 
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingTemplate = false;
		}, 500);
	}

	function applyCustomization() {
		applyingCustomization = true;
		setTimeout(() => {
			dispatch('customizationApply', { 
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			});
			applyingCustomization = false;
		}, 500);
	}

	function previewLive() {
		if (username) {
			window.open(`/u/${username}`, '_blank');
		} else {
			alert('Please set a username first to preview your live profile.');
		}
	}

	function handleTemplateChange(event: CustomEvent) {
		console.log('Template change received:', event.detail);
		selectedTemplate = event.detail.template;
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = { ...templateCustomization, ...event.detail.customization };
		}
		// Update resumeData with new template settings for immediate preview
		resumeData = { ...resumeData, template: selectedTemplate, theme: selectedTheme, customization: templateCustomization };
		console.log('Updated selectedTemplate:', selectedTemplate, 'selectedTheme:', selectedTheme);
	}

	function handleThemeChange(event: CustomEvent) {
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = { ...templateCustomization, ...event.detail.customization };
		}
		// Update resumeData with new theme settings for immediate preview
		resumeData = { ...resumeData, template: selectedTemplate, theme: selectedTheme, customization: templateCustomization };
	}

	function handleCustomizationChange(event: CustomEvent) {
		templateCustomization = { ...templateCustomization, ...event.detail };
		// Update resumeData with new customization settings for immediate preview
		resumeData = { ...resumeData, customization: templateCustomization };
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
				{ title: '', company: '', duration: '', description: '' }
			],
			education: [
				{ degree: '', institution: '', year: '' }
			],
			certifications: [
				{ name: '', issuer: '', date: '', description: '', credentialId: '' }
			],
			languages: [
				{ language: '', proficiency: '' }
			],
			projects: [
				{ name: '', description: '', technologies: [''], url: '', duration: '' }
			],
			awards: [
				{ title: '', organization: '', date: '', description: '' }
			],
			skills: [''],
			links: [
				{ type: 'LinkedIn', url: '' }
			]
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
			data.links.forEach(link => {
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
					if (exp.duration) content += `Duration: ${exp.duration}\n`;
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
					if (edu.year) content += `Year: ${edu.year}\n`;
					if (index < data.education.length - 1) content += '\n';
				}
			});
			content += '\n';
		}

		// Skills
		if (data.skills && data.skills.length > 0) {
			content += 'SKILLS\n';
			content += '-'.repeat(6) + '\n';
			const skillsList = data.skills.filter(skill => skill.trim()).join(', ');
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
						const techList = project.technologies.filter(tech => tech.trim()).join(', ');
						content += `Technologies: ${techList}\n`;
					}
					if (project.url) content += `URL: ${project.url}\n`;
					if (project.duration) content += `Duration: ${project.duration}\n`;
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
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" role="main" aria-label="Profile Editor">
	<!-- Header with Progress and Actions -->
	<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<div class="text-white">
					<h3 class="text-lg font-semibold" id="profile-editor-title">Profile Editor</h3>
					<p class="text-blue-100 text-sm" aria-live="polite" aria-label="Profile completion status">
						{getCompletionPercentage()}% Complete
					</p>
				</div>
				<!-- Progress Bar -->
				<div class="w-32 bg-blue-500/30 rounded-full h-2" role="progressbar" aria-valuenow={getCompletionPercentage()} aria-valuemin="0" aria-valuemax="100" aria-labelledby="profile-editor-title">
					<div 
						class="bg-white rounded-full h-2 transition-all duration-300" 
						style="width: {getCompletionPercentage()}%"
						aria-label="Profile completion progress"
					></div>
				</div>
			</div>

			<!-- Status Indicator -->
			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-2" role="status" aria-live="polite">
					<div class="w-2 h-2 rounded-full {profileStatus === 'published' ? 'bg-green-400' : 'bg-yellow-400'}" aria-label="Profile status indicator"></div>
					<span class="text-white text-sm font-medium">
						{profileStatus === 'published' ? 'Published' : 'Draft'}
					</span>
				</div>
				
				<!-- Auto Save Indicator -->
				{#if isAutoSaving}
					<div class="flex items-center space-x-2 text-white/80">
						<div class="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
						<span class="text-xs">Auto saving...</span>
					</div>
				{:else if hasUnsavedChanges}
					<div class="flex items-center space-x-2 text-yellow-300">
						<div class="w-2 h-2 rounded-full bg-yellow-300"></div>
						<span class="text-xs">Unsaved changes</span>
					</div>
				{:else if !hasUnsavedChanges && lastSavedData}
					<div class="flex items-center space-x-2 text-green-300">
						<div class="w-2 h-2 rounded-full bg-green-300"></div>
						<span class="text-xs">All changes saved</span>
					</div>
				{/if}
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
						aria-label="{showPreview ? 'Switch to edit mode' : 'Switch to preview mode'}"
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

				<!-- Info Message -->
				<div class="flex items-center space-x-2">
					<div class="text-white/80 text-sm">
						<span class="flex items-center">
							<Save class="w-4 h-4 mr-2" aria-hidden="true" />
							Use the Save and Publish buttons in the header to save changes
						</span>
					</div>
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
					workExperience: resumeData?.experience?.map(exp => ({
						title: exp.title || 'Job Title',
						company: exp.company || 'Company Name',
						type: 'Full-Time',
						period: exp.duration || 'Start - End',
						current: false,
						description: exp.description || ''
					})) || [{
						title: 'Your Job Title',
						company: 'Company Name',
						type: 'Full-Time',
						period: 'Start - End',
						current: false,
						description: ''
					}],
					education: resumeData?.education?.map(edu => ({
						institution: edu.institution || 'University Name',
						degree: edu.degree || 'Your Degree',
						period: edu.year || 'Start - End'
					})) || [{
						institution: 'University Name',
						degree: 'Your Degree',
						period: 'Start - End'
					}],
					skills: resumeData?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
				projects: [],
				certifications: resumeData?.certifications || [],
				languages: resumeData?.languages || [],
				awards: resumeData?.awards || [],
				links: resumeData?.links || [],
				contact: {
					email: resumeData?.email || '',
					phone: resumeData?.phone || '',
					location: resumeData?.location || ''
				}
				}}
				customizable={false}
				selectedTemplate={selectedTemplate}
				selectedTheme={selectedTheme}
				customization={templateCustomization}
			/>
		</div>
	{:else}
		<!-- Edit Mode with Tabs -->
		<div class="flex">
			<!-- Sidebar Navigation -->
			<div class="w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
				<nav class="p-4 space-y-2" role="tablist" aria-label="Profile editor sections">
					{#each tabs as tab}
						<button
							on:click={() => activeTab = tab.id}
							class="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors {activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
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
				</nav>
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 p-6">
				{#if activeTab === 'basic'}
					<!-- Basic Information Tab -->
					<div class="space-y-6" role="tabpanel" id="tabpanel-basic" aria-labelledby="tab-basic">
						<div class="flex items-center mb-6">
							<User class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h4>
						</div>

						<!-- Profile Photo Upload -->
						<div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
								Profile Photo
							</label>
							<div class="flex items-center space-x-4">
								{#if profilePhotoUrl || resumeData.photo_url}
									<img src={profilePhotoUrl || resumeData.photo_url} alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
								{:else}
									<div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
										<span class="text-2xl font-bold text-white">
											{resumeData.name?.charAt(0) || 'U'}
										</span>
									</div>
								{/if}
								<label class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
									<Upload class="w-4 h-4 mr-2" />
									Upload Photo
									<input
										type="file"
										accept="image/*"
										on:change={handleProfilePhotoUpload}
										class="hidden"
									/>
								</label>
							</div>
						</div>

						<!-- Contact Information -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Full Name *
								</label>
								<input
								id="fullName"
								type="text"
								bind:value={resumeData.name}
								on:focus={handleInputFocus}
								on:blur={() => {
									formErrors.name = validateField('name', resumeData.name || '');
									handleInputBlur();
								}}
								class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}"
								placeholder="Your full name"
								aria-describedby="fullName-error"
								aria-invalid={!!formErrors.name}
								required
							/>
								{#if formErrors.name}
									<p id="fullName-error" class="text-red-600 text-sm mt-1" role="alert">{formErrors.name}</p>
								{/if}
							</div>

							<div>
								<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email Address
								</label>
								<input
								id="email"
								type="email"
								bind:value={resumeData.email}
								on:focus={handleInputFocus}
								on:blur={() => {
									formErrors.email = validateField('email', resumeData.email || '');
									handleInputBlur();
								}}
								class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}"
								placeholder="your.email@example.com"
								aria-describedby="email-error"
								aria-invalid={!!formErrors.email}
							/>
								{#if formErrors.email}
									<p id="email-error" class="text-red-600 text-sm mt-1" role="alert">{formErrors.email}</p>
								{/if}
							</div>

							<div>
								<InternationalPhoneInput
									bind:value={resumeData.phone}
									on:input={(e) => {
										resumeData.phone = e.detail.value;
										formErrors.phone = validateField('phone', resumeData.phone || '');
									}}
									on:blur={() => formErrors.phone = validateField('phone', resumeData.phone || '')}
									id="phone"
									label="Phone Number"
									placeholder="+1 (555) 123-4567"
								/>
								{#if formErrors.phone}
									<p id="phone-error" class="text-red-600 text-sm mt-1" role="alert">{formErrors.phone}</p>
								{/if}
							</div>

							<div>
								<label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Location
								</label>
								<input
								id="location"
								type="text"
								bind:value={resumeData.location}
								on:focus={handleInputFocus}
								on:blur={handleInputBlur}
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="City, State/Country"
							/>
							</div>

							<div>
								<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Username *
								</label>
								<input
								id="username"
								type="text"
								bind:value={username}
								on:focus={handleInputFocus}
								on:blur={() => {
									formErrors.username = validateField('username', username);
									handleInputBlur();
								}}
								class="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {formErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}"
								placeholder="your-username"
								pattern="[a-zA-Z0-9-_]+"
								title="Username can only contain letters, numbers, hyphens, and underscores"
								aria-describedby="username-error username-help"
								aria-invalid={!!formErrors.username}
								required
							/>
								{#if formErrors.username}
									<p id="username-error" class="text-red-600 text-sm mt-1" role="alert">{formErrors.username}</p>
								{/if}
								<p id="username-help" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Your public profile will be available at: siteme.com/u/{username || 'your-username'}
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
					<div class="space-y-6" role="tabpanel" id="tabpanel-experience" aria-labelledby="tab-experience">
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
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center" id="experience-{index}-title">
												<span class="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mr-2" aria-hidden="true">
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
												<label for="job-title-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Job Title
												</label>
												<input
											id="job-title-{index}"
											type="text"
											bind:value={exp.title}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="Software Engineer"
											aria-describedby="experience-{index}-title"
										/>
											</div>
											<div>
												<label for="company-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Company
												</label>
												<input
											id="company-{index}"
											type="text"
											bind:value={exp.company}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="Tech Company Inc."
											aria-describedby="experience-{index}-title"
										/>
											</div>
										</div>
										
										<!-- Work Details -->
										<WorkDetailsInput
											location={exp.location || ''}
											contractType={exp.contractType || ''}
											on:input={(e) => {
												exp.location = e.detail.location;
												exp.contractType = e.detail.contractType;
											}}
											label="Work Details"
										/>
										<div class="mb-4">
											<DateRangePicker
												startDate={exp.startDate || ''}
												endDate={exp.endDate || ''}
												isCurrent={exp.isCurrent || false}
												on:input={(e) => {
													exp.duration = e.detail.duration;
													exp.startDate = e.detail.startDate;
													exp.endDate = e.detail.endDate;
													exp.isCurrent = e.detail.isCurrent;
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
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
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
												<label for="degree-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Degree
												</label>
												<input
											id="degree-{index}"
											type="text"
											bind:value={edu.degree}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											placeholder="Bachelor of Science"
										/>
											</div>
											<div>
												<label for="institution-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Institution
												</label>
												<input
											id="institution-{index}"
											type="text"
											bind:value={edu.institution}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											placeholder="University Name"
										/>
											</div>
										</div>
										<div>
											<DateRangePicker
												startDate={edu.startDate || ''}
												endDate={edu.endDate || ''}
												isCurrent={edu.isCurrent || false}
												on:input={(e) => {
													edu.year = e.detail.duration;
													edu.startDate = e.detail.startDate;
													edu.endDate = e.detail.endDate;
													edu.isCurrent = e.detail.isCurrent;
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

				{:else if activeTab === 'certifications'}
					<!-- Certifications Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Award class="w-6 h-6 text-yellow-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Certifications</h4>
							</div>
							<button
								on:click={addCertification}
								class="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Certification
							</button>
						</div>

						{#if resumeData.certifications && resumeData.certifications.length > 0}
							<div class="space-y-6">
								{#each resumeData.certifications as cert, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
													{index + 1}
												</span>
												Certification {index + 1}
											</h6>
											<button
												on:click={() => removeCertification(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label for="cert-name-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Certification Name
												</label>
												<input
											id="cert-name-{index}"
											type="text"
											bind:value={cert.name}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
											placeholder="AWS Certified Solutions Architect"
										/>
											</div>
											<div>
												<label for="cert-issuer-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Issuing Organization
												</label>
												<input
											id="cert-issuer-{index}"
											type="text"
											bind:value={cert.issuer}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
											placeholder="Amazon Web Services"
										/>
											</div>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label for="cert-date-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Date Obtained
												</label>
												<input
											id="cert-date-{index}"
											type="text"
											bind:value={cert.date}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
											placeholder="January 2024"
										/>
											</div>
											<div>
												<label for="cert-credential-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Credential ID
												</label>
												<input
											id="cert-credential-{index}"
											type="text"
											bind:value={cert.credentialId}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
											placeholder="ABC123XYZ"
										/>
											</div>
										</div>
										<div>
											<label for="cert-description-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Description (Optional)
											</label>
											<textarea
								id="cert-description-{index}"
								bind:value={cert.description}
								on:focus={handleInputFocus}
								on:blur={handleInputBlur}
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
								placeholder="Brief description of the certification..."
								rows="3"
							></textarea>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Award class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No certifications added yet</p>
								<button
									on:click={addCertification}
									class="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Certification
								</button>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'languages'}
					<!-- Languages Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Globe class="w-6 h-6 text-blue-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Languages</h4>
							</div>
							<button
								on:click={addLanguage}
								class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Language
							</button>
						</div>

						{#if resumeData.languages && resumeData.languages.length > 0}
							<div class="space-y-6">
								{#each resumeData.languages as lang, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
													{index + 1}
												</span>
												Language {index + 1}
											</h6>
											<button
												on:click={() => removeLanguage(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label for="language-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Language
												</label>
												<input
											id="language-{index}"
											type="text"
											bind:value={lang.language}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="English"
										/>
											</div>
											<div>
												<label for="proficiency-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Proficiency Level
												</label>
												<select
											id="proficiency-{index}"
											bind:value={lang.proficiency}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
													<option value="">Select proficiency</option>
													<option value="Native">Native</option>
													<option value="Fluent">Fluent</option>
													<option value="Advanced">Advanced</option>
													<option value="Intermediate">Intermediate</option>
													<option value="Basic">Basic</option>
												</select>
											</div>
									</div>
							</div>
						{/each}
					</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Globe class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No languages added yet</p>
								<button
									on:click={addLanguage}
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Language
								</button>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'projects'}
					<!-- Projects Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Code class="w-6 h-6 text-indigo-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Projects</h4>
							</div>
							<button
								on:click={addProject}
								class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Project
							</button>
						</div>

						{#if resumeData.projects && resumeData.projects.length > 0}
							<div class="space-y-6">
								{#each resumeData.projects as project, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
													{index + 1}
												</span>
												Project {index + 1}
											</h6>
											<button
												on:click={() => removeProject(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label for="project-name-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Project Name
												</label>
												<input
											id="project-name-{index}"
											type="text"
											bind:value={project.name}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											placeholder="E-commerce Website"
										/>
											</div>
											<div>
												<label for="project-url-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Project URL (Optional)
												</label>
												<input
											id="project-url-{index}"
											type="url"
											bind:value={project.url}
											on:focus={handleInputFocus}
											on:blur={handleInputBlur}
											class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											placeholder="https://github.com/username/project"
										/>
											</div>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
												<div>
													<label for="project-duration-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Duration
													</label>
													<input
												id="project-duration-{index}"
												type="text"
												bind:value={project.duration}
												on:focus={handleInputFocus}
												on:blur={handleInputBlur}
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
												placeholder="3 months"
											/>
												</div>
												<div>
													<label for="project-image-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Project Image URL (Optional)
													</label>
													<div class="flex items-center gap-2">
														<Image class="w-5 h-5 text-gray-400" />
														<input
												id="project-image-{index}"
												type="url"
												bind:value={project.image}
												on:focus={handleInputFocus}
												on:blur={handleInputBlur}
												class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
												placeholder="https://example.com/project-screenshot.jpg"
											/>
													</div>
													{#if project.image}
														<div class="mt-2">
															<img src={project.image} alt="Project preview" class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600" on:error={() => project.image = ''} />
														</div>
								{/if}
							</div>
						</div>
											<div class="mb-4">
											<label for="project-description-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Description
											</label>
											<textarea
								id="project-description-{index}"
								bind:value={project.description}
								on:focus={handleInputFocus}
								on:blur={handleInputBlur}
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="Describe your project, its features, and your role..."
								rows="4"
							></textarea>
										</div>
										<div>
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Technologies Used
											</label>
											<div class="space-y-2">
												{#each project.technologies as tech, techIndex}
													<div class="flex items-center gap-2">
														<input
													type="text"
													bind:value={tech}
													on:focus={handleInputFocus}
													on:blur={handleInputBlur}
													class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
													placeholder="React, Node.js, MongoDB..."
												/>
														<button
															on:click={() => {
																project.technologies = project.technologies.filter((_, i) => i !== techIndex);
															}}
															class="text-red-600 hover:text-red-700 p-1"
														>
															<Trash2 class="w-4 h-4" />
														</button>
													</div>
												{/each}
												<button
													on:click={() => {
														project.technologies = [...project.technologies, ''];
													}}
													class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
												>
													+ Add Technology
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Code class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No projects added yet</p>
								<button
									on:click={addProject}
									class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Project
								</button>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'awards'}
					<!-- Awards Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Trophy class="w-6 h-6 text-orange-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Awards & Recognitions</h4>
							</div>
							<button
								on:click={addAward}
								class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Award
							</button>
						</div>

						{#if resumeData.awards && resumeData.awards.length > 0}
							<div class="space-y-6">
								{#each resumeData.awards as award, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
													{index + 1}
												</span>
												Award {index + 1}
											</h6>
											<button
												on:click={() => removeAward(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label for="award-title-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Award Title
												</label>
												<input
													id="award-title-{index}"
													type="text"
													bind:value={award.title}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
													placeholder="Employee of the Year"
												/>
											</div>
											<div>
												<label for="award-organization-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Organization
												</label>
												<input
													id="award-organization-{index}"
													type="text"
													bind:value={award.organization}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
													placeholder="Company Name"
												/>
											</div>
										</div>
										<div class="mb-4">
											<label for="award-date-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Date Received
											</label>
											<input
												id="award-date-{index}"
												type="text"
												bind:value={award.date}
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
												placeholder="December 2023"
											/>
										</div>
										<div>
											<label for="award-description-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Description (Optional)
											</label>
											<textarea
												id="award-description-{index}"
												bind:value={award.description}
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
												placeholder="Brief description of the award and achievement..."
												rows="3"
											></textarea>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Trophy class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No awards added yet</p>
								<button
									on:click={addAward}
									class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Your First Award
								</button>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'skills'}
					<!-- Skills Tab -->
					<div>
						<div class="flex items-center mb-6">
							<Plus class="w-6 h-6 text-blue-600 mr-3" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Skills</h4>
						</div>
						
						{#if resumeData.skills}
							<SkillsInput
								bind:skills={resumeData.skills}
								on:input={(e) => {
									resumeData.skills = e.detail.skills;
								}}
								label="Professional Skills"
								placeholder="Add a skill (e.g., JavaScript, React, Project Management)"
							/>
						{/if}
					</div>

				{:else if activeTab === 'skills'}
					<!-- Skills Tab -->
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
									<div class="flex items-center space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
										<span class="w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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

		{:else if activeTab === 'links'}
					<!-- Social Links Tab -->
					<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Link2 class="w-6 h-6 text-blue-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Showcase Project</h4>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each socialMediaOptions as option}
						<button
							on:click={() => addSocialMediaLink(option.name)}
							class="inline-flex items-center px-3 py-2 text-white rounded-lg transition-colors text-sm"
							style="background-color: {option.color};"
						>
							<svelte:component this={option.icon} class="w-4 h-4 mr-2" />
							{option.name}
						</button>
					{/each}
							</div>
						</div>

						{#if resumeData.links && resumeData.links.length > 0}
							<div class="space-y-4">
								{#each resumeData.links as link, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2" style="background-color: {getSocialMediaColor(link.type)}20; color: {getSocialMediaColor(link.type)};">
													<svelte:component this={getSocialMediaIcon(link.type)} class="w-4 h-4" />
												</span>
												{link.type || 'Link'}
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
													<label for="link-type-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
													<label for="link-url-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
									<p class="text-gray-500 dark:text-gray-400 mb-4">No professional links added yet</p>
									<button
										on:click={addLink}
										class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
									>
										<Plus class="w-4 h-4 mr-2" />
										Add Your First Link
									</button>
								</div>
							{/if}

		{:else if activeTab === 'design'}
					<!-- Design Tab -->
					<div class="space-y-6">
						<div class="flex items-center mb-6">
							<Edit3 class="w-6 h-6 text-indigo-600 mr-3" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Template & Design</h4>
						</div>

						<div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
							<div class="flex items-center justify-between mb-4">
								<h5 class="text-lg font-semibold text-gray-900 dark:text-white">Template Customization</h5>
								<button
									on:click={() => showAdvancedCustomization = !showAdvancedCustomization}
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
									workExperience: resumeData?.experience?.map(exp => ({
										title: exp.title || 'Job Title',
										company: exp.company || 'Company Name',
										type: 'Full-Time',
										period: exp.duration || 'Start - End',
										current: false,
										description: exp.description || ''
									})) || [{
										title: 'Your Job Title',
										company: 'Company Name',
										type: 'Full-Time',
										period: 'Start - End',
										current: false,
										description: ''
									}],
									education: resumeData?.education?.map(edu => ({
										institution: edu.institution || 'University Name',
										degree: edu.degree || 'Your Degree',
										period: edu.year || 'Start - End'
									})) || [{
										institution: 'University Name',
										degree: 'Your Degree',
										period: 'Start - End'
									}],
									skills: resumeData?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
							projects: [],
							certifications: resumeData?.certifications || [],
							languages: resumeData?.languages || [],
							awards: resumeData?.awards || [],
							links: resumeData?.links || [],
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
									<div class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
									<div class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
										<div class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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