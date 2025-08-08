<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		supabase,
		getProfile,
		updateProfile,
		getValidSession,
		handleAuthError
	} from '$lib/supabase';
	import TemplateSelector from '../../../components/TemplateSelector.svelte';
	import ProfileEditor from '../../../components/ProfileEditor.svelte';
	import { toasts } from '$lib/stores/toast';
	import { ArrowLeft, Save, Eye, Settings, Palette, Layout } from 'lucide-svelte';
	import type { User } from '@supabase/supabase-js';
	import type { Profile, ResumeData } from '$lib/types';
	import { handleError, handleAuthError as handleAuthErr } from '$lib/error-handler';

	let user: User | null = null;
	let profile: Profile | null = null;
	let resumeData: ResumeData | null = null;
	let loading = false;
	let saving = false;
	let uploading = false;
	let saveSuccess = false;
	let activeTab: 'content' | 'design' | 'settings' = 'content';
	let showPreview = false;
	let profileStatus: 'draft' | 'published' = 'draft';

	// Reactive statements for state management
	$: if (saveSuccess) {
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	// Template and design state
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

	onMount(async () => {
		try {
			const { session, error } = await getValidSession();
			if (error || !session?.user) {
				goto('/login');
				return;
			}
			user = session.user;
			await loadProfile();
		} catch (error) {
			handleAuthErr(error, {
				component: 'EditorPage',
				action: 'authentication',
				userMessage: 'Authentication failed. Please log in again.'
			});
			goto('/login');
			return;
		}
	});

	async function loadProfile() {
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

			if (data && typeof data === 'object') {
				profile = data;
				if (profile?.data && typeof profile.data === 'object') {
					resumeData = profile.data;
					// Load template settings from profile data
					if (resumeData.template) selectedTemplate = resumeData.template;
					if (resumeData.theme) selectedTheme = resumeData.theme;
					if (resumeData.customization) {
						templateCustomization = { ...templateCustomization, ...resumeData.customization };
					}
				} else {
					// Initialize with default structure if no profile data exists
					resumeData = {
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
			}
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'loadProfile',
				userMessage: 'Failed to load profile data'
			});
		} finally {
			loading = false;
		}
	}

	async function handleProfilePhotoUpload(file: File) {
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${Math.random()}.${fileExt}`;
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

	async function handleSaveProfile(event: CustomEvent) {
		const eventData = event.detail;
		// Prevent multiple simultaneous saves
		if (saving) {
			return;
		}

		saving = true;
		uploading = true;
		toasts.info('Saving profile changes...');

		try {
			let photoUrl = eventData.resumeData.photo_url || profile?.photo_url;

			// Handle image upload if a new photo is provided
			if (eventData.profilePhoto) {
				try {
					photoUrl = await handleProfilePhotoUpload(eventData.profilePhoto);
				} catch (uploadError) {
					handleError(uploadError, {
						component: 'EditorPage',
						action: 'uploadPhoto',
						userMessage: 'Failed to upload photo. Profile saved without photo.'
					});
				}
			}

			// Clean and structure the resume data
			const cleanResumeData = {
				...resumeData,
				...eventData.resumeData,
				photo_url: photoUrl,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: templateCustomization
			};

			const updateData = {
				data: cleanResumeData,
				full_name: cleanResumeData.name,
				username: profile?.username
			};

			if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
				throw new Error('Invalid update data provided');
			}

			const { error } = await updateProfile(user.id, updateData);

			if (error) {
				handleError(error, {
					component: 'EditorPage',
					action: 'updateProfile',
					userMessage: 'Failed to save profile'
				});
				throw error;
			}

			// Update local state
			resumeData = cleanResumeData;
			profile = { ...profile, data: cleanResumeData, full_name: cleanResumeData.name };

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

	// Legacy handleSave for backward compatibility
	async function handleSave(data: ResumeData) {
		await handleSaveProfile({ detail: { resumeData: data } });
	}

	async function handleTemplateApply(event: CustomEvent) {
		const { template, theme, customization } = event.detail;

		if (!template || typeof template !== 'string') {
			console.error('Invalid template data received');
			return;
		}

		try {
			const cleanData = {
				...resumeData,
				template: template,
				theme: theme,
				customization: customization
			};

			const { error } = await updateProfile(user.id, {
				data: cleanData,
				full_name: resumeData.name,
				username: profile?.username
			});

			if (error) throw error;

			// Update local state
			resumeData = cleanData;
			profile = { ...profile, data: cleanData };
			selectedTemplate = template;
			selectedTheme = theme;
			templateCustomization = customization;

			toasts.success('Template applied successfully!');
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'applyTemplate',
				userMessage: 'Failed to save template settings'
			});
		}
	}

	async function handleThemeApply(event: CustomEvent) {
		const { template, theme, customization } = event.detail;

		if (!theme || typeof theme !== 'string') {
			console.error('Invalid theme data received');
			return;
		}

		try {
			const cleanData = {
				...resumeData,
				template: template,
				theme: theme,
				customization: customization
			};

			const { error } = await updateProfile(user.id, {
				data: cleanData,
				full_name: resumeData.name,
				username: profile?.username
			});

			if (error) throw error;

			// Update local state
			resumeData = cleanData;
			profile = { ...profile, data: cleanData };
			selectedTemplate = template;
			selectedTheme = theme;
			templateCustomization = customization;

			toasts.success('Theme applied successfully!');
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'applyTheme',
				userMessage: 'Failed to save theme settings'
			});
		}
	}

	async function handleCustomizationApply(event: CustomEvent) {
		const customization = event.detail;

		if (!customization || typeof customization !== 'object') {
			console.error('Invalid customization data received');
			return;
		}

		try {
			const cleanData = {
				...resumeData,
				template: selectedTemplate,
				theme: selectedTheme,
				customization: customization
			};

			const { error } = await updateProfile(user.id, {
				data: cleanData,
				full_name: resumeData.name,
				username: profile?.username
			});

			if (error) throw error;

			// Update local state
			resumeData = cleanData;
			profile = { ...profile, data: cleanData };
			templateCustomization = customization;

			toasts.success('Customization applied successfully!');
		} catch (error) {
			handleError(error, {
				component: 'EditorPage',
				action: 'applyCustomization',
				userMessage: 'Failed to save customization settings'
			});
		}
	}

	async function handleStatusChange(event: CustomEvent) {
		const { status } = event.detail;
		if (!status || typeof status !== 'string') {
			console.error('Invalid status data received');
			return;
		}
		profileStatus = status;
		toasts.success(`Profile status changed to ${status}`);
	}

	async function handlePhotoUpload(event: CustomEvent) {
		const { file } = event.detail;
		if (!file || !(file instanceof File)) {
			console.error('Invalid file data received');
			return;
		}
		try {
			const photoUrl = await handleProfilePhotoUpload(file);
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

	type TabIcon = typeof Layout | typeof Palette | typeof Settings;
	const tabs: Array<{ id: 'content' | 'design' | 'settings'; label: string; icon: TabIcon }> = [
		{ id: 'content', label: 'Content', icon: Layout },
		{ id: 'design', label: 'Design', icon: Palette },
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
		<!-- Content Editor -->
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
	{:else if activeTab === 'design'}
		<!-- Design Customizer -->
		<div
			class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
		>
			{#if resumeData}
				<TemplateSelector
					bind:selectedTemplate
					bind:selectedTheme
					bind:customization={templateCustomization}
					on:templateChange={(e) => {
						selectedTemplate = e.detail;
					}}
					on:themeChange={(e) => {
						selectedTheme = e.detail;
					}}
					on:customizationChange={(e) => {
						templateCustomization = e.detail;
					}}
				/>
			{/if}
		</div>
	{:else if activeTab === 'settings'}
		<!-- Site Settings -->
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
					<TemplateSelector profileData={resumeData} customizable={false} />
				{/if}
			</div>
		</div>
	</div>
{/if}
