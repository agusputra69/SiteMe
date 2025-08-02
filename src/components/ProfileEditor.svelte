<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Trash2, Upload, Save, Eye, Edit3, Download, FileText, User, ChevronRight } from 'lucide-svelte';
	import type { ResumeData } from '$lib/ai';
	import TemplateSelector from './TemplateSelector.svelte';
	import TemplateCustomizer from './TemplateCustomizer.svelte';

	const dispatch = createEventDispatcher();

	export let resumeData: ResumeData;
	export let showPreview = false;
	export let uploading = false;

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

	// Tab configuration
	const tabs = [
		{ id: 'basic', label: 'Basic Info', icon: User },
		{ id: 'experience', label: 'Experience', icon: FileText },
		{ id: 'education', label: 'Education', icon: FileText },
		{ id: 'skills', label: 'Skills & Links', icon: Plus },
		{ id: 'design', label: 'Design', icon: Edit3 }
	];

	function addExperience() {
		if (!resumeData.experience) resumeData.experience = [];
		resumeData.experience = [
			...resumeData.experience,
			{ title: '', company: '', duration: '', description: '' }
		];
	}

	function removeExperience(index: number) {
		resumeData.experience = resumeData.experience?.filter((_, i) => i !== index) || [];
	}

	function addEducation() {
		if (!resumeData.education) resumeData.education = [];
		resumeData.education = [
			...resumeData.education,
			{ degree: '', institution: '', year: '' }
		];
	}

	function removeEducation(index: number) {
		resumeData.education = resumeData.education?.filter((_, i) => i !== index) || [];
	}

	function addSkill() {
		if (!resumeData.skills) resumeData.skills = [];
		resumeData.skills = [...resumeData.skills, ''];
	}

	function removeSkill(index: number) {
		resumeData.skills = resumeData.skills?.filter((_, i) => i !== index) || [];
	}

	function addLink() {
		if (!resumeData.links) resumeData.links = [];
		resumeData.links = [
			...resumeData.links,
			{ type: '', url: '' }
		];
	}

	function removeLink(index: number) {
		resumeData.links = resumeData.links?.filter((_, i) => i !== index) || [];
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
			profilePhoto: profilePhotoFile 
		});
	}

	function togglePreview() {
		showPreview = !showPreview;
		dispatch('togglePreview', { showPreview });
	}

	function handleTemplateChange(event: CustomEvent) {
		selectedTemplate = event.detail.template;
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = event.detail.customization;
		}
	}

	function handleThemeChange(event: CustomEvent) {
		selectedTheme = event.detail.theme;
		if (event.detail.customization) {
			templateCustomization = event.detail.customization;
		}
	}

	function handleCustomizationChange(event: CustomEvent) {
		templateCustomization = event.detail.customization;
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

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
	<!-- Header with Progress and Actions -->
	<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<div class="text-white">
					<h3 class="text-lg font-semibold">Profile Editor</h3>
					<p class="text-blue-100 text-sm">{getCompletionPercentage()}% Complete</p>
				</div>
				<!-- Progress Bar -->
				<div class="w-32 bg-blue-500/30 rounded-full h-2">
					<div 
						class="bg-white rounded-full h-2 transition-all duration-300" 
						style="width: {getCompletionPercentage()}%"
					></div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center space-x-2">
				<!-- ATS Export Button -->
				{#if resumeData.name || resumeData.experience?.length > 0}
					<button
						on:click={exportATSResume}
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
						title="Export ATS-friendly resume"
					>
						<Download class="w-4 h-4 mr-2" />
						ATS Export
					</button>
				{/if}

				<button
					on:click={togglePreview}
					class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
				>
					{#if showPreview}
						<Edit3 class="w-4 h-4 mr-2" />
						Edit
					{:else}
						<Eye class="w-4 h-4 mr-2" />
						Preview
					{/if}
				</button>

				{#if !showPreview}
					<button
						on:click={saveProfile}
						disabled={uploading}
						class="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-blue-600 font-medium rounded-lg transition-colors"
					>
						{#if uploading}
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
							Saving...
						{:else}
							<Save class="w-4 h-4 mr-2" />
							Save Changes
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>

	{#if showPreview}
		<!-- Preview Mode -->
		<div class="p-6 space-y-6">
			<!-- Profile Header -->
			<div class="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
				{#if profilePhotoUrl || resumeData.photo_url}
					<img src={profilePhotoUrl || resumeData.photo_url} alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
				{:else}
					<div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
						<span class="text-2xl font-bold text-white">
							{resumeData.name?.charAt(0) || 'U'}
						</span>
					</div>
				{/if}
				<div>
					<h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						{resumeData.name || 'Your Name'}
					</h4>
					<div class="space-y-1 text-gray-600 dark:text-gray-300">
						{#if resumeData.email}
							<p class="flex items-center">
								<span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
								{resumeData.email}
							</p>
						{/if}
						{#if resumeData.phone}
							<p class="flex items-center">
								<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								{resumeData.phone}
							</p>
						{/if}
						{#if resumeData.location}
							<p class="flex items-center">
								<span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
								{resumeData.location}
							</p>
						{/if}
					</div>
				</div>
			</div>

			{#if resumeData.summary}
				<div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
					<h5 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
						<span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
							<User class="w-3 h-3 text-white" />
						</span>
						Professional Summary
					</h5>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed">{resumeData.summary}</p>
				</div>
			{/if}

			{#if resumeData.experience && resumeData.experience.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
						<span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
							<FileText class="w-3 h-3 text-white" />
						</span>
						Work Experience
					</h5>
					<div class="space-y-4">
						{#each resumeData.experience as exp}
							<div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
								<h6 class="font-medium text-gray-900 dark:text-white">{exp.title}</h6>
								<p class="text-green-600 dark:text-green-400 font-medium">{exp.company}</p>
								<p class="text-gray-500 dark:text-gray-400 text-sm">{exp.duration}</p>
								{#if exp.description}
									<p class="text-gray-600 dark:text-gray-300 text-sm mt-2">{exp.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.education && resumeData.education.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
						<span class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
							<FileText class="w-3 h-3 text-white" />
						</span>
						Education
					</h5>
					<div class="space-y-3">
						{#each resumeData.education as edu}
							<div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
								<h6 class="font-medium text-gray-900 dark:text-white">{edu.degree}</h6>
								<p class="text-purple-600 dark:text-purple-400 font-medium">{edu.institution}</p>
								<p class="text-gray-500 dark:text-gray-400 text-sm">{edu.year}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.skills && resumeData.skills.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
						<span class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
							<Plus class="w-3 h-3 text-white" />
						</span>
						Skills
					</h5>
					<div class="flex flex-wrap gap-2">
						{#each resumeData.skills as skill}
							{#if skill.trim()}
								<span class="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-700">
									{skill}
								</span>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.links && resumeData.links.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
						<span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
							<ChevronRight class="w-3 h-3 text-white" />
						</span>
						Professional Links
					</h5>
					<div class="space-y-2">
						{#each resumeData.links as link}
							{#if link.url.trim()}
								<a href={link.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
									<ChevronRight class="w-4 h-4 mr-2" />
									{link.type || 'Link'}: {link.url}
								</a>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Edit Mode with Tabs -->
		<div class="flex">
			<!-- Sidebar Navigation -->
			<div class="w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
				<nav class="p-4 space-y-2">
					{#each tabs as tab}
						<button
							on:click={() => activeTab = tab.id}
							class="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors {activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
						>
							<svelte:component this={tab.icon} class="w-4 h-4 mr-3" />
							{tab.label}
							{#if activeTab === tab.id}
								<ChevronRight class="w-4 h-4 ml-auto" />
							{/if}
						</button>
					{/each}
				</nav>
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 p-6">
				{#if activeTab === 'basic'}
					<!-- Basic Information Tab -->
					<div class="space-y-6">
						<div class="flex items-center mb-6">
							<User class="w-6 h-6 text-blue-600 mr-3" />
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
									class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Your full name"
								/>
							</div>

							<div>
								<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email Address
								</label>
								<input
									id="email"
									type="email"
									bind:value={resumeData.email}
									class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="your.email@example.com"
								/>
							</div>

							<div>
								<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Phone Number
								</label>
								<input
									id="phone"
									type="tel"
									bind:value={resumeData.phone}
									class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="+1 (555) 123-4567"
								/>
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
						</div>

						<!-- Professional Summary -->
						<div>
							<label for="summary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Professional Summary
							</label>
							<textarea
								id="summary"
								bind:value={resumeData.summary}
								rows="4"
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Write a brief summary of your professional background and goals..."
							></textarea>
						</div>
					</div>

				{:else if activeTab === 'experience'}
					<!-- Experience Tab -->
					<div class="space-y-6">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<FileText class="w-6 h-6 text-green-600 mr-3" />
								<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Work Experience</h4>
							</div>
							<button
								on:click={addExperience}
								class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
							>
								<Plus class="w-4 h-4 mr-2" />
								Add Experience
							</button>
						</div>

						{#if resumeData.experience && resumeData.experience.length > 0}
							<div class="space-y-6">
								{#each resumeData.experience as exp, index}
									<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
										<div class="flex items-center justify-between mb-4">
											<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
												<span class="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
													{index + 1}
												</span>
												Experience {index + 1}
											</h6>
											<button
												on:click={() => removeExperience(index)}
												class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Job Title
												</label>
												<input
													type="text"
													bind:value={exp.title}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
													placeholder="Software Engineer"
												/>
											</div>
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Company
												</label>
												<input
													type="text"
													bind:value={exp.company}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
													placeholder="Tech Company Inc."
												/>
											</div>
										</div>
										<div class="mb-4">
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Duration
											</label>
											<input
												type="text"
												bind:value={exp.duration}
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Jan 2020 - Present"
											/>
										</div>
										<div>
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Description
											</label>
											<textarea
												bind:value={exp.description}
												rows="3"
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Describe your responsibilities and achievements..."
											></textarea>
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
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Degree
												</label>
												<input
													type="text"
													bind:value={edu.degree}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
													placeholder="Bachelor of Science"
												/>
											</div>
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Institution
												</label>
												<input
													type="text"
													bind:value={edu.institution}
													class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
													placeholder="University Name"
												/>
											</div>
										</div>
										<div>
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Year
											</label>
											<input
												type="text"
												bind:value={edu.year}
												class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
												placeholder="2020 or 2018-2022"
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
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center">
									<Plus class="w-6 h-6 text-blue-600 mr-3" />
									<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Skills</h4>
								</div>
								<button
									on:click={addSkill}
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
								>
									<Plus class="w-4 h-4 mr-2" />
									Add Skill
								</button>
							</div>

							{#if resumeData.skills && resumeData.skills.length > 0}
								<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{#each resumeData.skills as skill, index}
										<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
											<div class="flex items-center justify-between">
												<input
													type="text"
													bind:value={resumeData.skills[index]}
													class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder="Enter skill"
												/>
												<button
													on:click={() => removeSkill(index)}
													class="ml-2 text-red-600 hover:text-red-700 p-1 rounded transition-colors"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<Plus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
									<p class="text-gray-500 dark:text-gray-400 mb-4">No skills added yet</p>
									<button
										on:click={addSkill}
										class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
										<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
											<div class="flex items-center justify-between mb-4">
												<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
													<span class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
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
													<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Label
													</label>
													<input
																						type="text"
																						bind:value={link.type}
																						class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
																						placeholder="LinkedIn, GitHub, Portfolio"
																					/>
												</div>
												<div>
													<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														URL
													</label>
													<input
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

						<!-- Links Section -->
						<div>
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center">
									<ChevronRight class="w-6 h-6 text-blue-600 mr-3" />
									<h4 class="text-xl font-semibold text-gray-900 dark:text-white">Professional Links</h4>
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
										<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
											<div class="flex items-center justify-between mb-4">
												<h6 class="font-medium text-gray-900 dark:text-white flex items-center">
													<span class="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-2">
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
													<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Type
													</label>
													<input
														type="text"
														bind:value={link.type}
														class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
														placeholder="LinkedIn"
													/>
												</div>
												<div class="md:col-span-2">
													<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														URL
													</label>
													<input
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
						</div>
					</div>

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
									name: resumeData?.name || '',
									avatar: profilePhotoUrl || resumeData?.photo_url || '',
									about: resumeData?.summary || '',
									workExperience: resumeData?.experience?.map(exp => ({
										title: exp.title || '',
										company: exp.company || '',
										type: 'full-time',
										period: exp.duration || '',
										current: false,
										description: exp.description || ''
									})) || [],
									education: resumeData?.education?.map(edu => ({
										degree: edu.degree || '',
										institution: edu.institution || '',
										period: edu.year || ''
									})) || [],
									skills: resumeData?.skills || [],
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
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>