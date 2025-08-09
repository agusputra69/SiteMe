<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase, getProfile, updateProfile } from '$lib/supabase';
	import ProfileEditor from '../../../components/ProfileEditor.svelte';
	import TemplateSelector from '../../../components/TemplateSelector.svelte';
	import { toasts } from '$lib/stores/toast';
	import { ArrowLeft, User as UserIcon, Eye, Edit3, Palette, Settings } from 'lucide-svelte';
	import type { User } from '@supabase/supabase-js';
	import type { Profile, ResumeData, TemplateCustomization, Customization } from '$lib/types';
	import { handleError, handleAuthError as handleAuthErr } from '$lib/error-handler';

        let user: User | null = null;
        let profile: Profile | null = null;
        let resumeData: ResumeData = {
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
	let loading = false;
	let saving = false;
	let saveSuccess = false;

	// Template and design state
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
        let showDesignPanel = false;

        function convertToCustomization(templateCustom: TemplateCustomization): Customization {
                return {
                        fontFamily: templateCustom.fontFamily,
                        fontSize: templateCustom.fontSize,
                        lineHeight:
                                typeof templateCustom.lineHeight === 'string'
                                        ? 1.5
                                        : templateCustom.lineHeight,
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

        function convertFromCustomization(customization: Customization): TemplateCustomization {
                return {
                        theme: 'blue',
                        fontFamily: customization.fontFamily || 'inter',
                        fontSize: customization.fontSize || 'medium',
                        layout:
                                typeof customization.layout === 'object'
                                        ? customization.layout.columns === 2
                                                ? 'two-column'
                                                : 'standard'
                                        : customization.layout || 'standard',
                        spacing: 'normal',
                        borderRadius: 'medium',
                        shadow: 'medium',
                        accentColor: customization.colors?.primary || '#3B82F6',
                        textColor: customization.colors?.text || '#1F2937',
                        backgroundColor: customization.colors?.accent || '#FFFFFF',
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
                        lineHeight: customization.lineHeight?.toString() ?? '1.5',
                        letterSpacing: 'normal',
                        headingFont: customization.fontFamily || 'inter',
                        containerWidth: 'standard',
                        verticalSpacing: 'normal',
                        horizontalPadding: 'normal'
                };
        }

        // Computed variables for type safety
        $: workExperienceData =
                resumeData.experience && Array.isArray(resumeData.experience)
                        ? resumeData.experience.map((exp: WorkExperience) => ({
                                        title: exp.title || 'Job Title',
                                        company: exp.company || 'Company Name',
                                        type: 'Full-Time',
                                        period: exp.period || 'Start - End',
                                        current: false,
                                        description: exp.description || ''
                          }))
                        : [
                                        {
                                                title: 'Your Job Title',
                                                company: 'Company Name',
                                                type: 'Full-Time',
                                                period: 'Start - End',
                                                current: false,
                                                description: ''
                                        }
                          ];

        $: educationData =
                resumeData.education && Array.isArray(resumeData.education)
                        ? resumeData.education.map((edu: EducationType) => ({
                                        institution: edu.institution || 'University Name',
                                        degree: edu.degree || 'Your Degree',
                                        period: edu.period || 'Start - End'
                          }))
                        : [
                                        {
                                                institution: 'University Name',
                                                degree: 'Your Degree',
                                                period: 'Start - End'
                                        }
                          ];

	onMount(async () => {
		try {
			// Check authentication
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (!session?.user) {
				goto('/login');
				return;
			}

			user = session.user;
			await loadProfile();
		} catch (error) {
			handleAuthErr(error, {
				component: 'ProfilePage',
				action: 'authentication',
				userMessage: 'Authentication failed. Please log in again.'
			});
			goto('/login');
		}
	});

	async function loadProfile() {
                if (!user?.id) return;

		loading = true;
		try {
                        const { data, error } = await getProfile(user!.id);
			if (error) {
				handleError(error, {
					component: 'ProfilePage',
					action: 'loadProfile',
					userMessage: 'Failed to load profile data'
				});
				return;
			}

			profile = data;
			if (profile?.data) {
                                resumeData = profile.data;
                                // Load template settings from profile data
                                if (resumeData.template) selectedTemplate = resumeData.template;
                                if (resumeData.theme) selectedTheme = resumeData.theme;
                                if (resumeData.customization) {
                                        templateCustomization = {
                                                ...templateCustomization,
                                                ...convertFromCustomization(resumeData.customization)
                                        };
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
		} catch (error) {
			handleError(error, {
				component: 'ProfilePage',
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
                        const filePath = `${user!.id}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('profile-photos')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

			return data.publicUrl;
		} catch (error) {
				handleError(error, {
					component: 'ProfilePage',
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
			// Save already in progress, ignoring duplicate request
			return;
		}

		saving = true;
		toasts.info('Saving profile changes...');

		try {
			// Starting save process

                       let photoUrl = eventData.resumeData.photo_url || profile?.data?.photo_url;

			// Handle image upload if a new photo is provided
			if (eventData.profilePhoto) {
				try {
					photoUrl = await handleProfilePhotoUpload(eventData.profilePhoto);
				} catch (uploadError) {
					handleError(uploadError, {
						component: 'ProfilePage',
						action: 'uploadPhoto',
						userMessage: 'Failed to upload photo. Profile saved without photo.'
					});
					// Continue with save even if photo upload fails
				}
			}

                        // Clean and structure the resume data to ensure it's valid for JSONB storage
                        const cleanResumeData: ResumeData = {
                                ...resumeData, // Start with existing data
                                ...eventData.resumeData, // Overwrite with new data
                                photo_url: photoUrl, // Ensure the photo URL is updated
                                template: selectedTemplate,
                                theme: selectedTheme,
                                customization: convertToCustomization(templateCustomization)
                        };

			// Resume data cleaned

			// Store resume data in the 'data' JSONB column
			const updateData = {
				data: cleanResumeData,
				full_name: cleanResumeData.name,
				username: profile?.username
			};

			// Sending data to updateProfile

                        const { error } = await updateProfile(user!.id, updateData);

			if (error) {
				handleError(error, {
					component: 'ProfilePage',
					action: 'updateProfile',
					userMessage: 'Failed to save profile'
				});
				throw error;
			}

                        // Update local state
                        resumeData = cleanResumeData;
                        profile = { ...(profile as Profile), data: cleanResumeData, full_name: cleanResumeData.name };

			// Save completed successfully
			toasts.success('Profile updated successfully!');

			// Set success state
			saveSuccess = true;
		} catch (error) {
			handleError(error, {
				component: 'ProfilePage',
				action: 'saveProfile',
				userMessage: 'Failed to save profile. Please try again.'
			});
		} finally {
			saving = false;
		}
	}

	async function handleStatusChange(event: CustomEvent) {
		const { status } = event.detail;
		if (!status || typeof status !== 'string') {
			handleError(new Error('Invalid status data'), {
				component: 'ProfilePage',
				action: 'statusChange',
				userMessage: 'Invalid status data received'
			});
			return;
		}
		
		// Update profile status and save to database
		try {
			const updateData = {
				data: {
					...resumeData,
					status: status
				},
				full_name: resumeData?.name,
				username: profile?.username
			};

			const { error } = await updateProfile(user.id, updateData);
			if (error) throw error;

			// Update local state
			if (resumeData) {
				resumeData = { ...resumeData, status };
			}
			toasts.success(`Profile status changed to ${status}`);
		} catch (error) {
			handleError(error, {
				component: 'ProfilePage',
				action: 'statusChange',
				userMessage: 'Failed to update profile status'
			});
		}
	}

	async function handlePhotoUpload(event: CustomEvent) {
		const { file } = event.detail;
		if (!file || !(file instanceof File)) {
			handleError(new Error('Invalid file data'), {
				component: 'ProfilePage',
				action: 'photoUpload',
				userMessage: 'Invalid file data received'
			});
			return;
		}
		
		try {
			const photoUrl = await handleProfilePhotoUpload(file);
			if (resumeData) {
				resumeData = { ...resumeData, photo_url: photoUrl };
				
				// Save the updated photo URL to database
				const updateData = {
					data: resumeData,
					full_name: resumeData.name,
					username: profile?.username
				};

				const { error } = await updateProfile(user.id, updateData);
				if (error) throw error;

				// Update local profile state
				profile = { ...profile, data: resumeData, photo_url: photoUrl };
			}
			toasts.success('Photo uploaded successfully!');
		} catch (error) {
			handleError(error, {
				component: 'ProfilePage',
				action: 'photoUpload',
				userMessage: 'Failed to upload photo'
			});
		}
	}

	function goBack() {
		goto('/dashboard');
	}

	async function handleTemplateApply(event: CustomEvent) {
		console.log('Template applied:', event.detail);
		const { template, theme, customization } = event.detail;

		try {
			// Clean and structure the data to ensure it's valid for JSONB storage
                        const cleanData: ResumeData = {
                                name: resumeData.name,
                                email: resumeData.email,
                                phone: resumeData.phone,
                                location: resumeData.location,
                                summary: resumeData.summary,
                                experience: resumeData.experience || [],
                                education: resumeData.education || [],
                                skills: resumeData.skills || [],
                                projects: resumeData.projects || [],
                                certifications: resumeData.certifications || [],
                                languages: resumeData.languages || [],
                                links: resumeData.links || [],
                                awards: resumeData.awards || [],
                                photo_url: resumeData.photo_url,
                                template: template,
                                theme: theme,
                                customization: convertToCustomization(customization)
                        };

                        const { error } = await updateProfile(user!.id, {
                                data: cleanData,
                                full_name: resumeData.name,
                                username: profile?.username
                        });

			if (error) throw error;

			// Update local state
                        resumeData = cleanData;
                        profile = { ...(profile as Profile), data: cleanData };

			toasts.success('Template applied successfully!');
		} catch (error) {
			console.error('Error saving template settings:', error);
			toasts.error('Failed to save template settings');
		}
	}

	async function handleThemeApply(event: CustomEvent) {
		console.log('Theme applied:', event.detail);
		const { template, theme, customization } = event.detail;

		try {
			// Clean and structure the data to ensure it's valid for JSONB storage
                        const cleanData: ResumeData = {
                                name: resumeData.name,
                                email: resumeData.email,
                                phone: resumeData.phone,
                                location: resumeData.location,
                                summary: resumeData.summary,
                                experience: resumeData.experience || [],
                                education: resumeData.education || [],
                                skills: resumeData.skills || [],
                                projects: resumeData.projects || [],
                                certifications: resumeData.certifications || [],
                                languages: resumeData.languages || [],
                                links: resumeData.links || [],
                                awards: resumeData.awards || [],
                                photo_url: resumeData.photo_url,
                                template: template,
                                theme: theme,
                                customization: convertToCustomization(customization)
                        };

                        const { error } = await updateProfile(user!.id, {
                                data: cleanData,
                                full_name: resumeData.name,
                                username: profile?.username
                        });

			if (error) throw error;

			// Update local state
                        resumeData = cleanData;
                        profile = { ...(profile as Profile), data: cleanData };

			toasts.success('Theme applied successfully!');
		} catch (error) {
			console.error('Error saving theme settings:', error);
			toasts.error('Failed to save theme settings');
		}
	}

	async function handleCustomizationApply(event: CustomEvent) {
		console.log('Customization applied:', event.detail);
		const customization = event.detail;

		try {
			// Clean and structure the data to ensure it's valid for JSONB storage
                        const cleanData: ResumeData = {
                                name: resumeData.name,
                                email: resumeData.email,
                                phone: resumeData.phone,
                                location: resumeData.location,
                                summary: resumeData.summary,
                                experience: resumeData.experience || [],
                                education: resumeData.education || [],
                                skills: resumeData.skills || [],
                                projects: resumeData.projects || [],
                                certifications: resumeData.certifications || [],
                                languages: resumeData.languages || [],
                                links: resumeData.links || [],
                                awards: resumeData.awards || [],
                                photo_url: resumeData.photo_url,
                                template: resumeData.template,
                                theme: resumeData.theme,
                                customization: convertToCustomization(customization)
                        };

                        const { error } = await updateProfile(user!.id, {
                                data: cleanData,
                                full_name: resumeData.name,
                                username: profile?.username
                        });

			if (error) throw error;

			// Update local state
                        resumeData = cleanData;
                        profile = { ...(profile as Profile), data: cleanData };

			toasts.success('Customization applied successfully!');
		} catch (error) {
			console.error('Error saving customization settings:', error);
			toasts.error('Failed to save customization settings');
		}
	}

	function handleTemplateChange(event: CustomEvent) {
		try {
			console.log('Template change received:', event.detail);
			selectedTemplate = event.detail.template;
			selectedTheme = event.detail.theme;
                        if (event.detail.customization) {
                                templateCustomization = {
                                        ...templateCustomization,
                                        ...event.detail.customization
                                };
                        }
                        // Update resumeData with new template settings for immediate preview
                        resumeData = {
                                ...resumeData,
                                template: selectedTemplate,
                                theme: selectedTheme,
                                customization: convertToCustomization(templateCustomization)
                        };
			console.log('Updated selectedTemplate:', selectedTemplate, 'selectedTheme:', selectedTheme);
		} catch (error) {
			console.error('Template change error:', error);
		}
	}

	function handleThemeChange(event: CustomEvent) {
		try {
			selectedTheme = event.detail.theme;
                        if (event.detail.customization) {
                                templateCustomization = {
                                        ...templateCustomization,
                                        ...event.detail.customization
                                };
                        }
                        // Update resumeData with new theme settings for immediate preview
                        resumeData = {
                                ...resumeData,
                                template: selectedTemplate,
                                theme: selectedTheme,
                                customization: convertToCustomization(templateCustomization)
                        };
		} catch (error) {
			console.error('Theme change error:', error);
		}
	}

	function handleCustomizationChange(event: CustomEvent) {
		try {
                        templateCustomization = { ...templateCustomization, ...event.detail };
                        // Update resumeData with new customization settings for immediate preview
                        resumeData = {
                                ...resumeData,
                                customization: convertToCustomization(templateCustomization)
                        };
		} catch (error) {
			console.error('Customization change error:', error);
		}
	}

	// Helper functions for direct customization updates
	function updateTheme(theme: string) {
		selectedTheme = theme;
		resumeData = { ...resumeData, theme: selectedTheme };
	}

	function updateFontFamily(fontFamily: string) {
		templateCustomization.fontFamily = fontFamily;
		resumeData = { ...resumeData, customization: convertToCustomization(templateCustomization) };
	}

	function updateFontSize(fontSize: string) {
		templateCustomization.fontSize = fontSize;
		resumeData = { ...resumeData, customization: convertToCustomization(templateCustomization) };
	}

	function updateLayout(layout: string) {
		templateCustomization.layout = layout;
		resumeData = { ...resumeData, customization: convertToCustomization(templateCustomization) };
	}

	function updateContainerWidth(containerWidth: string) {
		templateCustomization.containerWidth = containerWidth;
		resumeData = { ...resumeData, customization: convertToCustomization(templateCustomization) };
	}

	// Convert TemplateCustomization to Customization
	function convertToCustomization(templateCustom: TemplateCustomization): Customization {
		return {
			fontFamily: templateCustom.fontFamily || 'inter',
			fontSize: templateCustom.fontSize || 'medium',
			lineHeight: typeof templateCustom.lineHeight === 'string' ? 1.5 : templateCustom.lineHeight || 1.5,
			margins: {
				top: 16,
				bottom: 16,
				left: 16,
				right: 16
			},
			colors: {
				primary: templateCustom.accentColor || '#3B82F6',
				secondary: templateCustom.textColor || '#1F2937',
				accent: templateCustom.backgroundColor || '#FFFFFF',
				text: templateCustom.textColor || '#1F2937'
			},
			layout: {
				columns: templateCustom.layout === 'two-column' ? 2 : 1,
				spacing: 16
			}
		};
	}
</script>

<svelte:head>
	<title>Profile Editor - SiteMe</title>
	<meta name="description" content="Edit your professional profile" />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20"
>
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<button
				on:click={goBack}
				class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md mb-4"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to Dashboard
			</button>

			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<div
						class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
					>
						<UserIcon class="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile Editor</h1>
						<p class="text-gray-600 dark:text-gray-300">Manage your professional information</p>
					</div>
				</div>

				<!-- Design Controls -->
				<div class="flex items-center space-x-3">
					<button
						on:click={() => (showDesignPanel = !showDesignPanel)}
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
					>
						<Palette class="w-4 h-4 mr-2" />
						{showDesignPanel ? 'Hide Design' : 'Show Design'}
					</button>
				</div>
			</div>
		</div>

		<!-- Design Panel -->
		{#if showDesignPanel}
			<div
				class="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
			>
				<!-- Design Panel Header -->
				<div
					class="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50"
				>
					<div class="flex items-center space-x-3">
						<div
							class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
						>
							<Palette class="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
								Design Customization
							</h2>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Customize your profile appearance and layout
							</p>
						</div>
					</div>
					<button
						on:click={() => (showDesignPanel = false)}
						class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Design Panel Content -->
				<div class="p-6">
					{#if resumeData}
						<!-- Template Selection -->
						<div class="mb-8">
							<h3
								class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
							>
								<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
									/>
								</svg>
								Template Selection
							</h3>
							<TemplateSelector
								profileData={{
									name: resumeData?.name || 'Your Name',
									avatar: resumeData?.photo_url || '',
									about: resumeData?.summary || 'Your professional summary goes here...',
									workExperience: workExperienceData,
									education: educationData,
									skills:
										resumeData?.skills && Array.isArray(resumeData.skills)
											? resumeData.skills
											: ['Skill 1', 'Skill 2', 'Skill 3'],
									projects: [],
									certifications:
										resumeData?.certifications && Array.isArray(resumeData.certifications)
											? resumeData.certifications
											: [],
									languages:
										resumeData?.languages && Array.isArray(resumeData.languages)
											? resumeData.languages
											: [],
									awards:
										resumeData?.awards && Array.isArray(resumeData.awards) ? resumeData.awards : [],
									links:
										resumeData?.links && Array.isArray(resumeData.links) ? resumeData.links : [],
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
						</div>

						<!-- Quick Customization Options -->
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<!-- Color Scheme -->
							<div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
								<h4
									class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center"
								>
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
										/>
									</svg>
									Color Scheme
								</h4>
								<div class="grid grid-cols-3 gap-2">
									{#each ['blue', 'green', 'purple', 'red', 'orange', 'pink'] as color}
										<button
											on:click={() => updateTheme(color)}
											class="w-full h-8 rounded-lg border-2 transition-all {selectedTheme === color
												? 'border-gray-900 dark:border-white'
												: 'border-gray-300 dark:border-gray-600'}"
											style="background-color: {color === 'blue'
												? '#3B82F6'
												: color === 'green'
												? '#10B981'
												: color === 'purple'
												? '#8B5CF6'
												: color === 'red'
												? '#EF4444'
												: color === 'orange'
												? '#F59E0B'
												: '#EC4899'}"
										/>
									{/each}
								</div>
							</div>

							<!-- Font Settings -->
							<div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
								<h4
									class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center"
								>
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 6h16M4 12h16M4 18h7"
										/>
									</svg>
									Typography
								</h4>
								<div class="space-y-2">
									<select
										bind:value={templateCustomization.fontFamily}
                                                                                on:change={() => updateFontFamily(templateCustomization.fontFamily || '')}
										class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
									>
										<option value="inter">Inter</option>
										<option value="roboto">Roboto</option>
										<option value="opensans">Open Sans</option>
										<option value="poppins">Poppins</option>
									</select>
									<select
										bind:value={templateCustomization.fontSize}
                                                                                on:change={() => updateFontSize(templateCustomization.fontSize || '')}
										class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
									>
										<option value="small">Small</option>
										<option value="medium">Medium</option>
										<option value="large">Large</option>
									</select>
								</div>
							</div>

							<!-- Layout Options -->
							<div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
								<h4
									class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center"
								>
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
										/>
									</svg>
									Layout
								</h4>
								<div class="space-y-2">
									<select
										bind:value={templateCustomization.layout}
										on:change={() => updateLayout(templateCustomization.layout)}
										class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
									>
										<option value="standard">Standard</option>
										<option value="compact">Compact</option>
										<option value="spacious">Spacious</option>
									</select>
									<select
										bind:value={templateCustomization.containerWidth}
										on:change={() => updateContainerWidth(templateCustomization.containerWidth)}
										class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
									>
										<option value="narrow">Narrow</option>
										<option value="standard">Standard</option>
										<option value="wide">Wide</option>
									</select>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Content -->
		<div
			class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl"
		>
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div
						class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"
					/>
					<span class="ml-3 text-gray-600 dark:text-gray-300">Loading profile...</span>
				</div>
			{:else if resumeData}
				<!-- Profile Editor without design tab -->
				<ProfileEditor
					{resumeData}
					uploading={saving}
					{saveSuccess}
					username={profile?.username}
					on:save={handleSaveProfile}
					on:photoUpload={handlePhotoUpload}
					on:statusChange={handleStatusChange}
					on:templateApply={handleTemplateApply}
					on:themeApply={handleThemeApply}
					on:customizationApply={handleCustomizationApply}
				/>
			{:else}
				<div class="text-center py-12">
					<p class="text-gray-600 dark:text-gray-300">
						No profile data found. Please upload a resume first.
					</p>
					<button
						on:click={goBack}
						class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Go to Dashboard
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
