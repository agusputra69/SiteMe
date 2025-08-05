<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Plus, Trash2, Upload, Save, Eye, Edit3, Download, FileText, User, ChevronRight, Globe, Palette, Settings, Award, Code, Trophy, Github, Twitter, Linkedin, Link2, Image, ExternalLink, CheckCircle, AlertCircle, Info, Zap, Star, Briefcase, GraduationCap, Languages, FolderOpen, Medal, Camera, Palette as PaletteIcon, Sparkles } from 'lucide-svelte';
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

	// Props with better type safety
	export let resumeData: ResumeData;
	export let showPreview = false;
	export let uploading = false;
	export let profileStatus: 'draft' | 'published' = 'draft';
	export let username: string = '';
	export let saveSuccess = false;

	// Enhanced state management with better typing
	let profilePhotoFile: File | null = null;
	let profilePhotoUrl = '';
	let selectedTemplate = 'modern';
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

	// UI State with better organization
	let showAdvancedCustomization = false;
	let activeTab = 'basic';
	let applyingTemplate = false;
	let applyingTheme = false;
	let applyingCustomization = false;
	let showQuickActions = false;
	let showTips = false;
	let lastSaved = new Date();

	// Enhanced form validation and accessibility
	let formErrors: Record<string, string> = {};
	let isSubmitting = false;
	let focusableElements: HTMLElement[] = [];
	// Removed auto-save functionality to prevent data loss issues

	// Enhanced tab configuration with better typing
	const tabs = [
		{ 
			id: 'basic', 
			label: 'Basic Info', 
			icon: User,
			description: 'Personal information and contact details',
			color: 'blue',
			required: true,
			completion: () => !!(resumeData.name?.trim() && resumeData.email?.trim())
		},
		{ 
			id: 'experience', 
			label: 'Experience', 
			icon: Briefcase,
			description: 'Work history and professional experience',
			color: 'green',
			required: true,
			completion: () => resumeData.experience?.length > 0
		},
		{ 
			id: 'education', 
			label: 'Education', 
			icon: GraduationCap,
			description: 'Academic background and qualifications',
			color: 'purple',
			required: true,
			completion: () => resumeData.education?.length > 0
		},
		{ 
			id: 'skills', 
			label: 'Skills', 
			icon: Zap,
			description: 'Technical and professional skills',
			color: 'orange',
			required: true,
			completion: () => resumeData.skills?.length > 0
		},
		{ 
			id: 'certifications', 
			label: 'Certifications', 
			icon: Award,
			description: 'Professional certifications and credentials',
			color: 'yellow',
			required: false,
			completion: () => resumeData.certifications?.length > 0
		},
		{ 
			id: 'languages', 
			label: 'Languages', 
			icon: Languages,
			description: 'Language proficiencies',
			color: 'blue',
			required: false,
			completion: () => resumeData.languages?.length > 0
		},
		{ 
			id: 'projects', 
			label: 'Projects', 
			icon: FolderOpen,
			description: 'Portfolio projects and achievements',
			color: 'indigo',
			required: false,
			completion: () => resumeData.projects?.length > 0
		},
		{ 
			id: 'awards', 
			label: 'Awards', 
			icon: Medal,
			description: 'Awards and recognitions',
			color: 'orange',
			required: false,
			completion: () => resumeData.awards?.length > 0
		},
		{ 
			id: 'links', 
			label: 'Portfolio', 
			icon: ExternalLink,
			description: 'Social media and portfolio links',
			color: 'green',
			required: false,
			completion: () => (resumeData.links?.length || 0) > 0
		},

	] as const;

	// Social media options with enhanced metadata
	const socialMediaOptions = [
		{ 
			name: 'LinkedIn', 
			icon: Linkedin, 
			placeholder: 'https://linkedin.com/in/yourprofile', 
			color: 'bg-blue-600',
			description: 'Professional networking'
		},
		{ 
			name: 'GitHub', 
			icon: Github, 
			placeholder: 'https://github.com/yourusername', 
			color: 'bg-gray-800',
			description: 'Code repositories'
		},
		{ 
			name: 'Twitter', 
			icon: Twitter, 
			placeholder: 'https://twitter.com/yourusername', 
			color: 'bg-blue-400',
			description: 'Social media presence'
		},
		{ 
			name: 'Portfolio', 
			icon: Globe, 
			placeholder: 'https://yourportfolio.com', 
			color: 'bg-purple-600',
			description: 'Personal website'
		},
		{ 
			name: 'Website', 
			icon: Link2, 
			placeholder: 'https://yourwebsite.com', 
			color: 'bg-green-600',
			description: 'Business website'
		},
		{ 
			name: 'Other', 
			icon: ExternalLink, 
			placeholder: 'https://...', 
			color: 'bg-gray-600',
			description: 'Other professional links'
		}
	] as const;

	// Initialize component with enhanced error handling
	onMount(() => {
		try {
			console.log('ProfileEditor onMount - initializing component');
			// Initialize resumeData if empty
			if (!resumeData) {
				resumeData = getDefaultResumeData();
			}

			// Initialize template settings from resumeData if available
			if (resumeData.template) {
				selectedTemplate = resumeData.template;
				console.log('Setting selectedTemplate from resumeData:', selectedTemplate);
			}
			if (resumeData.theme) {
				selectedTheme = resumeData.theme;
				console.log('Setting selectedTheme from resumeData:', selectedTheme);
			}
			if (resumeData.customization) {
				templateCustomization = { ...templateCustomization, ...resumeData.customization };
			}

			console.log('ProfileEditor initialized with template:', selectedTemplate, 'theme:', selectedTheme);
					// Focus management
		focusFirstElement();
		} catch (error) {
			console.error('Error initializing ProfileEditor:', error);
			dispatch('error', { message: 'Failed to initialize profile editor' });
		}
	});

	// Cleanup on component destruction
	onMount(() => {
		return () => {
			// Component cleanup
		};
	});

	// Ensure skills array is always initialized
	$: if (resumeData && !resumeData.skills) {
		resumeData.skills = [];
	}

	// Listen for save success from parent with better error handling
	$: if (!uploading && saveSuccess) {
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	// Ensure data synchronization with parent component
	$: if (resumeData) {
		console.log('ProfileEditor received updated resumeData:', resumeData);
		
		// Ensure all required arrays are initialized
		if (!resumeData.experience) resumeData.experience = [];
		if (!resumeData.education) resumeData.education = [];
		if (!resumeData.skills) resumeData.skills = [];
		if (!resumeData.certifications) resumeData.certifications = [];
		if (!resumeData.languages) resumeData.languages = [];
		if (!resumeData.projects) resumeData.projects = [];
		if (!resumeData.awards) resumeData.awards = [];
		if (!resumeData.links) resumeData.links = [];
	}

	// Debug: Track when design tab is active
	$: if (activeTab === 'design') {
		console.log('Design tab is now active, selectedTemplate:', selectedTemplate, 'selectedTheme:', selectedTheme);
	}

	// Enhanced helper functions with better error handling
	function getDefaultResumeData(): ResumeData {
		return {
			name: '',
			email: '',
			phone: '',
			location: '',
			summary: '',
			experience: [],
			education: [],
			certifications: [],
			languages: [],
			projects: [],
			awards: [],
			skills: [],
			links: []
		};
	}

	// Enhanced form validation functions with better error messages
	function validateField(fieldName: string, value: string): string {
		try {
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
		} catch (error) {
			console.error('Validation error:', error);
			return 'Validation error occurred';
		}
	}

	// Enhanced error handling with user feedback
	function handleError(error: any, context: string) {
		console.error(`${context} error:`, error);
		dispatch('error', { 
			message: `Failed to ${context.toLowerCase()}`,
			details: error.message || 'An unexpected error occurred'
		});
	}

	// Removed debounced save to prevent data loss issues

	function validateForm(): boolean {
		try {
			const errors: Record<string, string> = {};
			
			errors.name = validateField('name', resumeData.name || '');
			errors.email = validateField('email', resumeData.email || '');
			errors.phone = validateField('phone', resumeData.phone || '');
			errors.username = validateField('username', username);

			formErrors = errors;
			return !Object.values(errors).some(error => error !== '');
		} catch (error) {
			console.error('Form validation error:', error);
			return false;
		}
	}

	// Enhanced keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		try {
			if (event.key === 'Escape') {
				if (showPreview) {
					showPreview = false;
				}
				if (showQuickActions) {
					showQuickActions = false;
				}
			} else if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				// Dispatch save event to parent component
				dispatch('save', { 
					resumeData: resumeData, 
					profilePhoto: profilePhotoFile
				});
			} else if (event.key === 'p' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				togglePreview();
			}
		} catch (error) {
			console.error('Keyboard navigation error:', error);
		}
	}

	// Enhanced accessibility: Screen reader announcements
	function announceToScreenReader(message: string) {
		const announcement = document.createElement('div');
		announcement.setAttribute('aria-live', 'polite');
		announcement.setAttribute('aria-atomic', 'true');
		announcement.className = 'sr-only';
		announcement.textContent = message;
		document.body.appendChild(announcement);
		
		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}

	// Enhanced click outside handler for dropdowns
	function handleClickOutside(event: MouseEvent) {
		try {
			const target = event.target as HTMLElement;
			if (!target.closest('.quick-actions-dropdown')) {
				showQuickActions = false;
			}
		} catch (error) {
			console.error('Click outside handler error:', error);
		}
	}

	// Add click outside listener with cleanup
	$: if (showQuickActions) {
		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}

	// Enhanced focus management
	function focusFirstElement() {
		try {
			const firstInput = document.querySelector('input, button, textarea') as HTMLElement;
			if (firstInput) {
				firstInput.focus();
			}
		} catch (error) {
			console.error('Focus management error:', error);
		}
	}

	// Enhanced completion percentage calculation
	function getCompletionPercentage(): number {
		try {
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
		} catch (error) {
			console.error('Completion calculation error:', error);
			return 0;
		}
	}

	// Enhanced tab completion status
	function getTabCompletion(tabId: string): boolean {
		try {
			switch (tabId) {
				case 'basic':
					return !!(resumeData.name?.trim() && resumeData.email?.trim());
				case 'experience':
					return resumeData.experience?.length > 0;
				case 'education':
					return resumeData.education?.length > 0;
				case 'skills':
					return resumeData.skills?.length > 0;
				case 'certifications':
					return resumeData.certifications?.length > 0;
				case 'languages':
					return resumeData.languages?.length > 0;
				case 'projects':
					return resumeData.projects?.length > 0;
				case 'awards':
					return resumeData.awards?.length > 0;
				case 'links':
					return (resumeData.links?.length || 0) > 0;
				default:
					return false;
			}
		} catch (error) {
			console.error('Tab completion error:', error);
			return false;
		}
	}

	// Enhanced CRUD operations with better error handling and UX
	function addExperience() {
		try {
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
		} catch (error) {
			console.error('Add experience error:', error);
			dispatch('error', { message: 'Failed to add experience entry' });
		}
	}

	function removeExperience(index: number) {
		try {
			resumeData.experience = resumeData.experience?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove experience error:', error);
			dispatch('error', { message: 'Failed to remove experience entry' });
		}
	}

	function addEducation() {
		try {
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
		} catch (error) {
			console.error('Add education error:', error);
			dispatch('error', { message: 'Failed to add education entry' });
		}
	}

	function removeEducation(index: number) {
		try {
			resumeData.education = resumeData.education?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove education error:', error);
			dispatch('error', { message: 'Failed to remove education entry' });
		}
	}

	function addSkill() {
		try {
			if (!resumeData.skills) resumeData.skills = [];
			resumeData.skills = [...resumeData.skills, ''];
			// Focus the new skill input
			setTimeout(() => {
				const newInput = document.querySelector(`#skill-${resumeData.skills.length - 1}`) as HTMLInputElement;
				if (newInput) newInput.focus();
			}, 100);
		} catch (error) {
			console.error('Add skill error:', error);
			dispatch('error', { message: 'Failed to add skill' });
		}
	}

	function removeSkill(index: number) {
		try {
			resumeData.skills = resumeData.skills?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove skill error:', error);
			dispatch('error', { message: 'Failed to remove skill' });
		}
	}

	// Enhanced helper functions for social media
	function addSocialMediaLink(platform: string) {
		try {
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
		} catch (error) {
			console.error('Add social media link error:', error);
			dispatch('error', { message: 'Failed to add social media link' });
		}
	}

	function getSocialMediaIcon(type: string) {
		try {
			const option = socialMediaOptions.find(opt => opt.name.toLowerCase() === type.toLowerCase());
			return option?.icon || ExternalLink;
		} catch (error) {
			console.error('Get social media icon error:', error);
			return ExternalLink;
		}
	}

	function getSocialMediaColor(type: string) {
		try {
			const option = socialMediaOptions.find(opt => opt.name.toLowerCase() === type.toLowerCase());
			return option?.color || 'bg-gray-600';
		} catch (error) {
			console.error('Get social media color error:', error);
			return 'bg-gray-600';
		}
	}

	function addLink() {
		try {
			if (!resumeData.links) resumeData.links = [];
			resumeData.links = [...resumeData.links, { type: 'LinkedIn', url: '' }];
			// Focus the new link input
			setTimeout(() => {
				const linksLength = resumeData.links?.length || 0;
				const newInput = document.querySelector(`#link-url-${linksLength - 1}`) as HTMLInputElement;
				if (newInput) newInput.focus();
			}, 100);
		} catch (error) {
			console.error('Add link error:', error);
			dispatch('error', { message: 'Failed to add link' });
		}
	}

	function removeLink(index: number) {
		try {
			resumeData.links = resumeData.links?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove link error:', error);
			dispatch('error', { message: 'Failed to remove link' });
		}
	}

	function addCertification() {
		try {
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
		} catch (error) {
			console.error('Add certification error:', error);
			dispatch('error', { message: 'Failed to add certification' });
		}
	}

	function removeCertification(index: number) {
		try {
			resumeData.certifications = resumeData.certifications?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove certification error:', error);
			dispatch('error', { message: 'Failed to remove certification' });
		}
	}

	function addLanguage() {
		try {
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
		} catch (error) {
			console.error('Add language error:', error);
			dispatch('error', { message: 'Failed to add language' });
		}
	}

	function removeLanguage(index: number) {
		try {
			resumeData.languages = resumeData.languages?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove language error:', error);
			dispatch('error', { message: 'Failed to remove language' });
		}
	}

	function addProject() {
		try {
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
		} catch (error) {
			console.error('Add project error:', error);
			dispatch('error', { message: 'Failed to add project' });
		}
	}

	function removeProject(index: number) {
		try {
			resumeData.projects = resumeData.projects?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove project error:', error);
			dispatch('error', { message: 'Failed to remove project' });
		}
	}

	function addAward() {
		try {
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
		} catch (error) {
			console.error('Add award error:', error);
			dispatch('error', { message: 'Failed to add award' });
		}
	}

	function removeAward(index: number) {
		try {
			resumeData.awards = resumeData.awards?.filter((_, i) => i !== index) || [];
		} catch (error) {
			console.error('Remove award error:', error);
			dispatch('error', { message: 'Failed to remove award' });
		}
	}

	function handleProfilePhotoUpload(event: Event) {
		try {
			const target = event.target as HTMLInputElement;
			const file = target.files?.[0];
			
			if (file && file.type.startsWith('image/')) {
				profilePhotoFile = file;
				// Create preview URL
				profilePhotoUrl = URL.createObjectURL(file);
				dispatch('photoUpload', { file });
			}
		} catch (error) {
			console.error('Profile photo upload error:', error);
			dispatch('error', { message: 'Failed to upload profile photo' });
		}
	}

	function saveProfile() {
		try {
			dispatch('save', { 
				resumeData: resumeData, 
				profilePhoto: profilePhotoFile,
				username: username
			});
		} catch (error) {
			console.error('Save profile error:', error);
			dispatch('error', { message: 'Failed to save profile' });
		}
	}

	function togglePreview() {
		try {
			showPreview = !showPreview;
			dispatch('togglePreview', { showPreview });
		} catch (error) {
			console.error('Toggle preview error:', error);
		}
	}

	function publishProfile() {
		try {
			profileStatus = 'published';
			dispatch('publish', { 
				resumeData: resumeData, 
				profilePhoto: profilePhotoFile
			});
		} catch (error) {
			console.error('Publish profile error:', error);
			dispatch('error', { message: 'Failed to publish profile' });
		}
	}

	// Enhanced manual save function with better error handling
	function saveDraft() {
		try {
			if (uploading) {
				return;
			}
			
			// Create a fresh copy of resumeData to ensure reactivity
			const dataToSave = {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			};
			
			// Reset success state
			saveSuccess = false;
			
			// Add a small delay to prevent rapid successive clicks
			setTimeout(() => {
				profileStatus = 'draft';
				dispatch('save', { 
					resumeData: dataToSave, 
					profilePhoto: profilePhotoFile
				});
				announceToScreenReader('Profile saved successfully');
			}, 100);
		} catch (error) {
			handleError(error, 'save draft');
		}
	}

	// Reset save success state after a delay
	$: if (saveSuccess) {
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	// Removed force save to prevent data loss issues

	function togglePublishStatus() {
		try {
			const newStatus = profileStatus === 'published' ? 'draft' : 'published';
			profileStatus = newStatus;
			dispatch('statusChange', { 
				resumeData: resumeData, 
				profilePhoto: profilePhotoFile
			});
		} catch (error) {
			console.error('Toggle publish status error:', error);
			dispatch('error', { message: 'Failed to change publish status' });
		}
	}

	function applyTheme() {
		try {
			applyingTheme = true;
			setTimeout(() => {
				dispatch('themeApply', { 
					template: selectedTemplate,
					theme: selectedTheme,
					customization: templateCustomization
				});
				applyingTheme = false;
			}, 500);
		} catch (error) {
			console.error('Apply theme error:', error);
			applyingTheme = false;
			dispatch('error', { message: 'Failed to apply theme' });
		}
	}

	function applyTemplate() {
		try {
			applyingTemplate = true;
			setTimeout(() => {
				dispatch('templateApply', { 
					template: selectedTemplate,
					theme: selectedTheme,
					customization: templateCustomization
				});
				applyingTemplate = false;
			}, 500);
		} catch (error) {
			console.error('Apply template error:', error);
			applyingTemplate = false;
			dispatch('error', { message: 'Failed to apply template' });
		}
	}

	function applyCustomization() {
		try {
			applyingCustomization = true;
			setTimeout(() => {
				dispatch('customizationApply', { 
					template: selectedTemplate,
					theme: selectedTheme,
					customization: templateCustomization
				});
				applyingCustomization = false;
			}, 500);
		} catch (error) {
			console.error('Apply customization error:', error);
			applyingCustomization = false;
			dispatch('error', { message: 'Failed to apply customization' });
		}
	}

	function previewLive() {
		try {
			if (username) {
				window.open(`/u/${username}`, '_blank');
			} else {
				alert('Please set a username first to preview your live profile.');
			}
		} catch (error) {
			console.error('Preview live error:', error);
			dispatch('error', { message: 'Failed to open live preview' });
		}
	}

	function handleTemplateChange(event: CustomEvent) {
		try {
			console.log('Template change received:', event.detail);
			selectedTemplate = event.detail.template;
			selectedTheme = event.detail.theme;
			if (event.detail.customization) {
				templateCustomization = { ...templateCustomization, ...event.detail.customization };
			}
			// Update resumeData with new template settings for immediate preview
			resumeData = { ...resumeData, template: selectedTemplate, theme: selectedTheme, customization: templateCustomization };
			console.log('Updated selectedTemplate:', selectedTemplate, 'selectedTheme:', selectedTheme);
		} catch (error) {
			console.error('Template change error:', error);
		}
	}

	function handleThemeChange(event: CustomEvent) {
		try {
			selectedTheme = event.detail.theme;
			if (event.detail.customization) {
				templateCustomization = { ...templateCustomization, ...event.detail.customization };
			}
			// Update resumeData with new theme settings for immediate preview
			resumeData = { ...resumeData, template: selectedTemplate, theme: selectedTheme, customization: templateCustomization };
		} catch (error) {
			console.error('Theme change error:', error);
		}
	}

	function handleCustomizationChange(event: CustomEvent) {
		try {
			templateCustomization = { ...templateCustomization, ...event.detail };
			// Update resumeData with new customization settings for immediate preview
			resumeData = { ...resumeData, customization: templateCustomization };
		} catch (error) {
			console.error('Customization change error:', error);
		}
	}

	// Enhanced manual resume creation function
	function createManualResume() {
		try {
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
		} catch (error) {
			console.error('Create manual resume error:', error);
			dispatch('error', { message: 'Failed to create manual resume' });
		}
	}

	// Enhanced ATS-friendly resume export function
	function exportATSResume() {
		try {
			const atsContent = generateATSContent(resumeData);
			downloadTextFile(atsContent, `${resumeData.name || 'resume'}_ATS.txt`);
		} catch (error) {
			console.error('Export ATS resume error:', error);
			dispatch('error', { message: 'Failed to export ATS resume' });
		}
	}

	// Enhanced Generate ATS-friendly content
	function generateATSContent(data: ResumeData): string {
		try {
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
		} catch (error) {
			console.error('Generate ATS content error:', error);
			return 'Error generating ATS content';
		}
	}

	// Enhanced Download text file helper
	function downloadTextFile(content: string, filename: string) {
		try {
			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download text file error:', error);
			dispatch('error', { message: 'Failed to download file' });
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" role="main" aria-label="Profile Editor">
	<!-- Header with Progress and Actions -->
	<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<div class="text-white">
					<h3 class="text-lg font-semibold" id="profile-editor-title">Profile Editor</h3>
					<div class="flex items-center space-x-4">
						<p class="text-blue-100 text-sm" aria-live="polite" aria-label="Profile completion status">
							{getCompletionPercentage()}% Complete
						</p>
						{#if getCompletionPercentage() === 100}
							<div class="flex items-center text-green-300 text-sm">
								<CheckCircle class="w-4 h-4 mr-1" />
								Profile Complete!
							</div>
						{:else if getCompletionPercentage() >= 80}
							<div class="flex items-center text-yellow-300 text-sm">
								<Star class="w-4 h-4 mr-1" />
								Almost Complete
							</div>
						{/if}
					</div>
				</div>
				<!-- Enhanced Progress Bar -->
				<div class="w-32 bg-blue-500/30 rounded-full h-2" role="progressbar" aria-valuenow={getCompletionPercentage()} aria-valuemin="0" aria-valuemax="100" aria-labelledby="profile-editor-title">
					<div 
						class="bg-white rounded-full h-2 transition-all duration-300 {getCompletionPercentage() === 100 ? 'bg-green-400' : getCompletionPercentage() >= 80 ? 'bg-yellow-400' : ''}" 
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
				

			</div>
		</div>

		<!-- Enhanced Action Buttons -->
		<div class="bg-white/10 backdrop-blur px-6 py-3 border-t border-white/20">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<!-- Quick Actions Dropdown -->
					<div class="relative quick-actions-dropdown">
						<button
							on:click={() => showQuickActions = !showQuickActions}
							class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
							aria-label="Quick actions"
							title="Quick actions"
							aria-expanded={showQuickActions}
						>
							<Sparkles class="w-4 h-4 mr-2" aria-hidden="true" />
							Quick Actions
						</button>
						
						{#if showQuickActions}
							<div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
								<div class="p-2">
									<button
										on:click={() => { showQuickActions = false; createManualResume(); }}
										class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
									>
										<Plus class="w-4 h-4 mr-2" />
										Create New Resume
									</button>
									<button
										on:click={() => { showQuickActions = false; exportATSResume(); }}
										class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-colors"
									>
										<Download class="w-4 h-4 mr-2" />
										Export ATS Resume
									</button>
									<button
										on:click={() => { showQuickActions = false; showTips = !showTips; }}
										class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
									>
										<Info class="w-4 h-4 mr-2" />
										Show Tips
									</button>
								</div>
							</div>
						{/if}
					</div>

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

					<!-- Save Button -->
					<button
						on:click={saveDraft}
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
						disabled={uploading}
						aria-label="Save profile as draft"
						aria-busy={uploading}
					>
						{#if uploading}
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
							Saving...
						{:else if saveSuccess}
							<Save class="w-4 h-4 mr-2" aria-hidden="true" />
							Saved!
						{:else}
							<Save class="w-4 h-4 mr-2" aria-hidden="true" />
							Save Draft
						{/if}
					</button>
				</div>

				<!-- Info Message Only -->
				<div class="flex items-center space-x-2">
					<div class="text-white/80 text-sm">
						<span class="flex items-center">
							<Info class="w-4 h-4 mr-2" aria-hidden="true" />
							Use Ctrl+S to save manually
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
			<!-- Enhanced Sidebar Navigation -->
			<div class="w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
				<div class="p-4 space-y-2" role="tablist" aria-label="Profile editor sections">
					{#each tabs as tab}
						<button
							on:click={() => activeTab = tab.id}
							class="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors group {activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls="tabpanel-{tab.id}"
							id="tab-{tab.id}"
						>
							<div class="flex items-center flex-1">
								<svelte:component this={tab.icon} class="w-4 h-4 mr-3" aria-hidden="true" />
								<div class="flex-1">
									<div class="font-medium">{tab.label}</div>
									<div class="text-xs opacity-70 {activeTab === tab.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}">
										{tab.description}
									</div>
								</div>
							</div>
							
							<div class="flex items-center space-x-2">
								{#if tab.completion()}
									<CheckCircle class="w-4 h-4 text-green-500" aria-hidden="true" />
								{:else if tab.required}
									<AlertCircle class="w-4 h-4 text-orange-500" aria-hidden="true" />
								{/if}
								{#if activeTab === tab.id}
									<ChevronRight class="w-4 h-4" aria-hidden="true" />
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Enhanced Main Content Area -->
			<div class="flex-1 p-6">
				{#if showTips}
					<!-- Tips Panel -->
					<div class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center">
								<Info class="w-4 h-4 mr-2" />
								Tips for Better Profile
							</h3>
							<button
								on:click={() => showTips = false}
								class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								aria-label="Close tips"
							>
								×
							</button>
						</div>
						<div class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
							<p>• <strong>Complete all required sections</strong> for better profile completion</p>
							<p>• <strong>Use specific, measurable achievements</strong> in your experience descriptions</p>
							<p>• <strong>Include relevant skills</strong> that match your target industry</p>
							<p>• <strong>Add a professional photo</strong> to make your profile more personal</p>
							<p>• <strong>Keep descriptions concise</strong> but informative</p>
							<p>• <strong>Keyboard shortcuts:</strong> Ctrl+S to save, Ctrl+P to toggle preview</p>
						</div>
					</div>
				{/if}
				{#if activeTab === 'basic'}
					<!-- Basic Information Tab -->
					<div class="space-y-6" role="tabpanel" id="tabpanel-basic" aria-labelledby="tab-basic">
						<div class="flex items-center mb-6">
							<User class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
							<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h4>
						</div>

						<!-- Enhanced Profile Photo Upload -->
						<div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
							<div class="flex items-center justify-between mb-4">
								<span class="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Profile Photo
								</span>
								{#if profilePhotoUrl || resumeData.photo_url}
									<button
										on:click={() => { profilePhotoUrl = ''; profilePhotoFile = null; }}
										class="text-red-600 hover:text-red-700 text-sm"
									>
										Remove
									</button>
								{/if}
							</div>
							<div class="flex items-center space-x-4">
								{#if profilePhotoUrl || resumeData.photo_url}
									<div class="relative">
										<img src={profilePhotoUrl || resumeData.photo_url} alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
										<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
											<CheckCircle class="w-4 h-4 text-white" />
										</div>
									</div>
								{:else}
									<div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
										<span class="text-2xl font-bold text-white">
											{resumeData.name?.charAt(0) || 'U'}
										</span>
									</div>
								{/if}
								<div class="flex flex-col space-y-2">
									<label class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
										{#if uploading}
											<div class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
											Uploading...
										{:else}
											<Camera class="w-4 h-4 mr-2" />
											Upload Photo
										{/if}
										<input
											type="file"
											accept="image/*"
											on:change={handleProfilePhotoUpload}
											class="hidden"
											disabled={uploading}
										/>
									</label>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Recommended: Square image, 400x400px or larger
									</p>
								</div>
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
								
								on:blur={() => formErrors.name = validateField('name', resumeData.name || '')}
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
								on:blur={() => formErrors.email = validateField('email', resumeData.email || '')}
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
					on:blur={() => formErrors.username = validateField('username', username)}
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
								<Briefcase class="w-6 h-6 text-green-600 mr-3" aria-hidden="true" />
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
								<Briefcase class="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
								<GraduationCap class="w-6 h-6 text-purple-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Education</h4>
							</div>
							<button
								on:click={addEducation}
								class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
								<GraduationCap class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No education added yet</p>
								<button
									on:click={addEducation}
									class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
								<Award class="w-6 h-6 text-yellow-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Certifications</h4>
							</div>
							<button
								on:click={addCertification}
								class="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
								<Languages class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Languages</h4>
							</div>
							<button
								on:click={addLanguage}
								class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
								<Languages class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No languages added yet</p>
								<button
									on:click={addLanguage}
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
								<Code class="w-6 h-6 text-indigo-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Projects</h4>
							</div>
							<button
								on:click={addProject}
								class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
					class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="Describe your project, its features, and your role..."
								rows="4"
							></textarea>
										</div>
										<div>
											<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Technologies Used
											</span>
											<div class="space-y-2">
												{#each project.technologies as tech, techIndex}
													<div class="flex items-center gap-2">
														<input
													type="text"
													bind:value={tech}
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
													placeholder="React, Node.js, MongoDB..."
												/>
														<button
															on:click={() => {
																project.technologies = project.technologies.filter((_, i) => i !== techIndex);
															}}
															class="text-red-600 hover:text-red-700 p-1"
														>
															<Trash2 class="w-4 h-4" aria-hidden="true" />
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
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
								<Medal class="w-6 h-6 text-orange-600 mr-3" aria-hidden="true" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Awards & Recognitions</h4>
							</div>
							<button
								on:click={addAward}
								class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
								<Medal class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No awards added yet</p>
								<button
									on:click={addAward}
									class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
									Add Your First Award
								</button>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'skills'}
					<!-- Skills Tab -->
					<div>
						<div class="flex items-center mb-6">
							<Plus class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
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

				{:else if activeTab === 'links'}
					<!-- Social Links Tab -->
					<div>
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<Link2 class="w-6 h-6 text-blue-600 mr-3" aria-hidden="true" />
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
												<Trash2 class="w-4 h-4" aria-hidden="true" />
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
									<Plus class="w-4 h-4 mr-2" aria-hidden="true" />
									Add Your First Link
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>