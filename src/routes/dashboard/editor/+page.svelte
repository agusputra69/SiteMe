<script lang="ts">
	// Svelte imports
	import { onMount } from 'svelte';
	
	// App imports
	import { goto } from '$app/navigation';
	
	// Library imports
	import { supabase, getProfile, updateProfile, getValidSession } from '$lib/supabase';
	import { toasts } from '$lib/stores/toast';
	import { handleError, handleAuthError } from '$lib/error-handler';
	
	// Component imports
	import TemplateSelector from '../../../components/TemplateSelector.svelte';
	import ProfileEditor from '../../../components/ProfileEditor.svelte';
	
	// Icon imports
	import { ArrowLeft, Eye, Settings, Layout, Palette } from 'lucide-svelte';
	
	// Type imports
	import type { User } from '@supabase/supabase-js';
	import type { Profile, ResumeData } from '$lib/types';

	// User and profile state
	let user: User | null = null;
	let profile: Profile | null = null;
	let resumeData: ResumeData | null = null;
	
	// UI state
	let loading = false;
	let saving = false;
	let uploading = false;
	let saveSuccess = false;
	let activeTab: 'content' | 'settings' = 'content';
	let showPreview = false;
	let profileStatus: 'draft' | 'published' = 'draft';
	
	// Design state
	let selectedTemplate = 'modern';
	let selectedTheme = 'blue';
	let showAdvancedCustomization = false;
	let applyingTemplate = false;
	let applyingTheme = false;
	let applyingCustomization = false;
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
		sectionOrder: [
			'header',
			'about',
			'experience',
			'education',
			'skills',
			'contact',
			'projects',
			'certifications',
			'languages',
			'awards',
			'links'
		],
		lineHeight: 'normal',
		letterSpacing: 'normal',
		headingFont: 'inter',
		containerWidth: 'standard',
		verticalSpacing: 'normal',
		horizontalPadding: 'normal'
	};
	
	// Reactive statements
	$: if (saveSuccess) {
		setTimeout(() => (saveSuccess = false), 3000);
	}

	// Enhanced error handling utility
	function handleError(error: any, context: { component: string; action: string; userMessage: string }) {
		const errorMessage = error?.message || 'An unexpected error occurred';
		const errorCode = error?.code || 'UNKNOWN_ERROR';
		
		// Log error for debugging (only in development)
		if (import.meta.env.DEV) {
			console.error(`[${context.component}] ${context.action}:`, {
				error: errorMessage,
				code: errorCode,
				stack: error?.stack,
				context
			});
		}
		
		// Show user-friendly error message
		toasts.error(context.userMessage);
		
		// Return structured error for further handling if needed
		return {
			message: errorMessage,
			code: errorCode,
			original: error
		};
	}

	// Initialization
	onMount(async () => {
		try {
			const { session, error } = await getValidSession();
			if (error || !session?.user) {
				await goto('/login');
				return;
			}
			user = session.user;
			await loadProfile();
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'onMount',
				userMessage: 'Failed to initialize editor. Please refresh the page.'
			});
			// Redirect to login on auth errors
			if (error?.message?.includes('auth') || error?.code === 'UNAUTHORIZED') {
				await goto('/login');
			}
		}
	});

	// Profile management
	async function loadProfile(): Promise<void> {
		if (!user?.id) return;

		loading = true;
		try {
                                        const { data, error } = await getProfile(user.id);
			if (error) {
				handleError(error, {
					component: 'EditorPage',
					action: 'loadProfile',
					userMessage: 'Failed to load profile data'
				});
				return;
			}

			if (data) {
			profile = data;
			loadResumeData(data);
		}
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'loadProfile',
				userMessage: 'Failed to load profile data. Please refresh the page and try again.'
			});
			// Set default data on error to prevent app crash
			resumeData = createDefaultResumeData();
		} finally {
			loading = false;
		}
	}

	function loadResumeData(profileData: Profile): void {
		if (profileData?.data && typeof profileData.data === 'object') {
			resumeData = profileData.data;
			// Load design settings
			if (resumeData.template) selectedTemplate = resumeData.template;
			if (resumeData.theme) selectedTheme = resumeData.theme;
			if (resumeData.customization) {
				templateCustomization = { ...templateCustomization, ...resumeData.customization };
			}
		} else {
			// Initialize with default structure
			resumeData = createDefaultResumeData();
		}
	}

	function createDefaultResumeData(): ResumeData {
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

	// Type guards
	function isValidFile(file: any): file is File {
		return file instanceof File && file.size > 0;
	}

	function isValidUser(user: any): user is { id: string } {
		return user && typeof user.id === 'string' && user.id.length > 0;
	}

	function isValidResumeData(data: any): data is ResumeData {
		return data && typeof data === 'object';
	}

	// Photo upload utility with enhanced type safety
	async function uploadProfilePhoto(file: File): Promise<string> {
		if (!isValidUser(user)) {
			throw new Error('User not authenticated');
		}

		// Validate file type and size
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		const maxSize = 5 * 1024 * 1024; // 5MB

		if (!allowedTypes.includes(file.type)) {
			throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image');
		}

		if (file.size > maxSize) {
			throw new Error('File too large. Image must be smaller than 5MB');
		}

		try {
			const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
			const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
			const filePath = `${user.id}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('profile-photos')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
			return data.publicUrl;
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'uploadPhoto',
				userMessage: 'Failed to upload photo'
			});
			throw error;
		}
	}

	// Save and update handlers with enhanced validation
	async function handleSaveProfile(event: CustomEvent): Promise<void> {
		if (saving || !isValidUser(user)) return;

		const eventData = event.detail;
		if (!eventData || !isValidResumeData(eventData.resumeData)) {
			handleError(new Error('Invalid resume data'), {
				component: 'EditorPage',
				action: 'saveProfile',
				userMessage: 'Invalid data provided. Please check your inputs.'
			});
			return;
		}

		saving = true;
		uploading = true;
		toasts.info('Saving profile changes...');

		try {
                       let photoUrl = eventData.resumeData.photo_url || profile?.data?.photo_url;

			// Handle photo upload if provided
			if (eventData.profilePhoto && isValidFile(eventData.profilePhoto)) {
				try {
					photoUrl = await uploadProfilePhoto(eventData.profilePhoto);
				} catch (uploadError) {
					// Don't fail the entire save if photo upload fails
					handleError(uploadError, {
						component: 'EditorPage',
						action: 'uploadPhoto',
						userMessage: 'Photo upload failed, but profile data will still be saved'
					});
				}
			}

			const updatedData = await updateProfileData({
				...eventData.resumeData,
				photo_url: photoUrl
			});

			// Update local state
			resumeData = updatedData;
			if (profile) {
				profile = { ...profile, data: updatedData, full_name: updatedData.name };
			}

			toasts.success('Profile updated successfully!');
			saveSuccess = true;
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'saveProfile',
				userMessage: 'Failed to save profile. Please try again.'
			});
		} finally {
			saving = false;
			uploading = false;
		}
	}

	async function updateProfileData(newData: Partial<ResumeData>): Promise<ResumeData> {
		if (!user?.id || !resumeData) {
			throw new Error('User not authenticated or no resume data');
		}

		const cleanData = {
			...resumeData,
			...newData,
			template: selectedTemplate,
			theme: selectedTheme,
			customization: templateCustomization
		};

		const updateData = {
			data: cleanData,
			full_name: cleanData.name || '',
			username: profile?.username
		};

		const { error } = await updateProfile(user.id, updateData);
		if (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'updateProfile',
				userMessage: 'Failed to save profile'
			});
			throw error;
		}

		return cleanData;
	}

	// Design handlers
	async function handleDesignChange(type: 'template' | 'theme' | 'customization', data: any): Promise<void> {
		if (!data) {
			handleError(new Error(`Invalid ${type} data`), {
				component: 'EditorPage',
				action: `apply${type.charAt(0).toUpperCase() + type.slice(1)}`,
				userMessage: `Invalid ${type} data received`
			});
			return;
		}

		try {
			// Update design state
			if (type === 'template') {
				selectedTemplate = data.template || data;
				if (data.theme) selectedTheme = data.theme;
				if (data.customization) templateCustomization = data.customization;
			} else if (type === 'theme') {
				selectedTheme = data.theme || data;
				if (data.template) selectedTemplate = data.template;
				if (data.customization) templateCustomization = data.customization;
			} else if (type === 'customization') {
				templateCustomization = data;
			}

			const updatedData = await updateProfileData({});
			resumeData = updatedData;
			if (profile) {
				profile = { ...profile, data: updatedData };
			}

			toasts.success(`${type.charAt(0).toUpperCase() + type.slice(1)} applied successfully!`);
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: `apply${type.charAt(0).toUpperCase() + type.slice(1)}`,
				userMessage: `Failed to save ${type} settings`
			});
		}
	}

	// Event handlers
	async function handleTemplateApply(event: CustomEvent): Promise<void> {
		applyingTemplate = true;
		try {
			await handleDesignChange('template', event.detail);
			setTimeout(() => {
				applyingTemplate = false;
			}, 500);
		} catch (error) {
			applyingTemplate = false;
			throw error;
		}
	}

	async function handleThemeApply(event: CustomEvent): Promise<void> {
		applyingTheme = true;
		try {
			await handleDesignChange('theme', event.detail);
			setTimeout(() => {
				applyingTheme = false;
			}, 500);
		} catch (error) {
			applyingTheme = false;
			throw error;
		}
	}

	async function handleCustomizationApply(event: CustomEvent): Promise<void> {
		applyingCustomization = true;
		try {
			await handleDesignChange('customization', event.detail);
			setTimeout(() => {
				applyingCustomization = false;
			}, 500);
		} catch (error) {
			applyingCustomization = false;
			throw error;
		}
	}

	// Legacy handler for backward compatibility
	async function handleSave(data: ResumeData): Promise<void> {
		await handleSaveProfile({ detail: { resumeData: data } } as CustomEvent);
	}

	async function handleStatusChange(event: CustomEvent) {
		const { status } = event.detail;
		if (!status || typeof status !== 'string') {
			console.error('Invalid status data received');
			return;
		}
                profileStatus = status as 'draft' | 'published';
		toasts.success(`Profile status changed to ${status}`);
	}

	async function handlePhotoUpload(event: CustomEvent) {
		const { file } = event.detail;
		if (!file || !(file instanceof File)) {
			console.error('Invalid file data received');
			return;
		}
		try {
			const photoUrl = await uploadProfilePhoto(file);
			if (resumeData) {
				resumeData = { ...resumeData, photo_url: photoUrl };
			}
			toasts.success('Photo uploaded successfully!');
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'uploadPhoto',
				userMessage: 'Failed to upload photo'
			});
		}
	}

	async function handleManualCreate(event: CustomEvent) {
		const { resumeData: newResumeData } = event.detail;
		resumeData = newResumeData;
		toasts.success('Manual resume template created! Start filling in your information.');
	}

	function handlePreview() {
		if (profile?.username) {
			window.open(`/u/${profile.username}`, '_blank');
		} else {
			showPreview = true;
		}
	}

	type TabIcon = typeof Layout | typeof Settings;
	const tabs: Array<{ id: 'content' | 'settings'; label: string; icon: TabIcon }> = [
		{ id: 'content', label: 'Content', icon: Layout },
		{ id: 'settings', label: 'Settings', icon: Settings }
	];
</script>

<div class="container mx-auto px-4 py-6">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div class="flex items-center space-x-4">
			<button
				on:click={() => goto('/dashboard')}
				class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Site Editor</h1>
				<p class="text-gray-600 dark:text-gray-300">Customize your professional website</p>
			</div>
		</div>

		<div class="flex items-center space-x-3">
			<button
				on:click={handlePreview}
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
				data-tour="preview-button"
			>
				<Eye class="w-4 h-4 mr-2" />
				Preview
			</button>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="border-b border-gray-200 dark:border-gray-700 mb-8">
		<nav class="flex space-x-8">
			{#each tabs as tab}
				<button
					on:click={() => (activeTab = tab.id)}
					class="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
					tab.id
						? 'border-blue-500 text-blue-600 dark:text-blue-400'
						: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}"
				>
					<svelte:component this={tab.icon} class="w-4 h-4" />
					<span>{tab.label}</span>
				</button>
			{/each}
		</nav>
	</div>

	<!-- Tab Content -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
			<span class="ml-3 text-gray-600 dark:text-gray-300">Loading editor...</span>
		</div>
	{:else if activeTab === 'content'}
		<!-- Content Tab -->
		<div class="space-y-6" role="tabpanel" aria-labelledby="content-tab">
			<div
				class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
			>
				{#if resumeData}
					<div data-tour="profile-editor">
						<ProfileEditor
							{resumeData}
							username={profile?.username || ''}
							{profileStatus}
							{saveSuccess}
							{uploading}
							on:save={handleSaveProfile}
							on:templateApply={handleTemplateApply}
							on:themeApply={handleThemeApply}
							on:customizationApply={handleCustomizationApply}
							on:statusChange={handleStatusChange}
							on:photoUpload={handlePhotoUpload}
							on:manualCreate={handleManualCreate}
						/>
					</div>
				{/if}
			</div>
		</div>


		<!-- Design Control Section -->
		<div class="mt-8 space-y-6">
			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div class="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
						<Palette class="w-5 h-5 mr-2 text-blue-600" />
						Template & Design
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Apply templates, themes, and customizations to your profile
					</p>
				</div>

				{#if resumeData}
					<div class="p-6">
						<div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
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
								profileData={resumeData}
								customizable={true}
								bind:selectedTemplate
								bind:selectedTheme
								bind:customization={templateCustomization}
								on:templateChange={(e) => {
									selectedTemplate = e.detail.template;
									selectedTheme = e.detail.theme;
									if (e.detail.customization) {
										templateCustomization = { ...templateCustomization, ...e.detail.customization };
									}
								}}
								on:themeChange={(e) => {
									selectedTheme = e.detail.theme;
									if (e.detail.customization) {
										templateCustomization = { ...templateCustomization, ...e.detail.customization };
									}
								}}
								on:customizationChange={(e) => {
									templateCustomization = { ...templateCustomization, ...e.detail };
								}}
							/>

							<!-- Apply Buttons -->
							<div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div class="flex flex-wrap gap-3">
									<button
										on:click={() => handleTemplateApply({ detail: { template: selectedTemplate, theme: selectedTheme, customization: templateCustomization } })}
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
										on:click={() => handleThemeApply({ detail: { template: selectedTemplate, theme: selectedTheme, customization: templateCustomization } })}
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
											on:click={() => handleCustomizationApply({ detail: { template: selectedTemplate, theme: selectedTheme, customization: templateCustomization } })}
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

	{:else if activeTab === 'settings'}
		<!-- Settings Tab -->
		<div class="space-y-6" role="tabpanel" aria-labelledby="settings-tab">
			<div
				class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
			>
				<div class="max-w-2xl">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Site Settings</h3>

					<!-- Username Setting -->
					<div class="space-y-6">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Site URL
							</label>
							<div class="flex items-center space-x-2">
								<span class="text-sm text-gray-500 dark:text-gray-400">siteme.app/u/</span>
								<input
									type="text"
									value={profile?.username || ''}
									placeholder="your-username"
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									readonly
								/>
							</div>
							<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Your site will be available at this URL once published
							</p>
						</div>

						<!-- SEO Settings -->
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Site Title
							</label>
							<input
								type="text"
								value={resumeData?.name || ''}
								placeholder="Your Professional Name"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								readonly
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Meta Description
							</label>
							<textarea
								value={resumeData?.summary || ''}
								placeholder="Brief description of your professional background"
								rows="3"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								readonly
							/>
						</div>

						<!-- Visibility Settings -->
						<div>
							<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Visibility</h4>
							<div class="space-y-2">
								<label class="flex items-center">
									<input
										type="radio"
										name="visibility"
										value="public"
										checked
										class="text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
										Public - Anyone can view your site
									</span>
								</label>
								<label class="flex items-center">
									<input
										type="radio"
										name="visibility"
										value="unlisted"
										disabled
										class="text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
										Unlisted - Only people with the link can view (Coming soon)
									</span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Preview Modal -->
{#if showPreview}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div
			class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
		>
			<div
				class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
			>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">Site Preview</h2>
				<button
					on:click={() => (showPreview = false)}
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<div class="p-6 overflow-auto max-h-[calc(90vh-120px)]">
				{#if resumeData}
                                    <TemplateSelector
                                            profileData={resumeData}
                                            customizable={false}
                                    />
				{/if}
			</div>
		</div>
	</div>
{/if}
