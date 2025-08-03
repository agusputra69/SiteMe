<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Plus, Trash2, Upload, Save, Eye, Edit3, Download, FileText, User, ChevronRight, Globe, Palette, Settings, Award, Code, Trophy, Github, Twitter, Linkedin, Link2, Image, ExternalLink, CheckCircle, AlertCircle, Info, Zap, Star, Briefcase, GraduationCap, Languages, FolderOpen, Medal, Camera, Palette as PaletteIcon, Sparkles } from 'lucide-svelte';
	import type { ResumeData } from '$lib/ai';
	import RichTextEditor from './RichTextEditor.svelte';
	import DateRangePicker from './DateRangePicker.svelte';
	import SkillsInput from './SkillsInput.svelte';
	import PhoneInput from './PhoneInput.svelte';
	import WorkDetailsInput from './WorkDetailsInput.svelte';
	import AIDescriptionEnhancer from './AIDescriptionEnhancer.svelte';
	import AISummaryEnhancer from './AISummaryEnhancer.svelte';
	import InternationalPhoneInput from './InternationalPhoneInput.svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let resumeData: ResumeData;
	export let username: string = '';
	export let saveSuccess = false;

	// State management
	let profilePhotoFile: File | null = null;
	let profilePhotoUrl = '';
	let lastSaved = new Date();

	// UI State
	let activeTab = 'basic';
	let showQuickActions = false;
	let showTips = false;

	// Form validation and accessibility
	let formErrors: Record<string, string> = {};
	let isSubmitting = false;
	let focusableElements: HTMLElement[] = [];

	// Enhanced tab configuration with icons and descriptions
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
		}
	];

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
	];

	// Initialize component
	onMount(() => {
		// Initialize resumeData if empty
		if (!resumeData) {
			resumeData = getDefaultResumeData();
		}

		// Focus management
		focusFirstElement();
	});

	// Ensure skills array is always initialized
	$: if (resumeData && !resumeData.skills) {
		resumeData.skills = [];
	}

	// Listen for save success from parent
	$: if (saveSuccess) {
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	// Helper functions
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

	// Add click outside listener
	$: if (showQuickActions) {
		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}

	// Focus management
	function focusFirstElement() {
		const firstInput = document.querySelector('input, button, textarea') as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
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

	// Enhanced CRUD operations with better UX
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
			const linksLength = (resumeData.links?.length || 0);
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
			const linksLength = (resumeData.links?.length || 0);
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

	function saveData() {
		dispatch('save', { 
			resumeData: resumeData, 
			profilePhoto: profilePhotoFile,
			username: username
		});
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
</script> 