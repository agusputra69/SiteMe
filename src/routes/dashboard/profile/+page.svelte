<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase, getProfile, updateProfile } from '$lib/supabase';
  import ProfileEditor from '../../../components/ProfileEditor.svelte';
  import { toasts } from '$lib/stores/toast';
  import { ArrowLeft, User, Eye, Edit3 } from 'lucide-svelte';

  let user: any = null;
  let profile: any = null;
  let resumeData: any = null;
  let loading = false;
  let saving = false;
  let saveSuccess = false;

  onMount(async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/login');
      return;
    }

    user = session.user;
    await loadProfile();
  });

  async function loadProfile() {
    if (!user) return;

    loading = true;
    const { data, error } = await getProfile(user.id);
    if (error) {
      console.error('Error loading profile:', error);
      toasts.error('Failed to load profile data');
      return;
    }

    profile = data;
    if (profile?.data) {
      resumeData = profile.data;
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
        skills: [],
        links: []
      };
    }
    loading = false;
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

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async function handleSaveProfile(eventData: any) {
    // Prevent multiple simultaneous saves
    if (saving) {
      console.log('Save already in progress, ignoring duplicate request');
      return;
    }
    
    saving = true;
    toasts.info('Saving profile changes...');

    try {
      console.log('Starting save process with data:', eventData);
      
      let photoUrl = eventData.resumeData.photo_url || profile?.photo_url;
      
      if (eventData.profilePhoto) {
        photoUrl = await handleProfilePhotoUpload(eventData.profilePhoto);
      }

      const updatedResumeData = {
        ...eventData.resumeData,
        photo_url: photoUrl
      };

      console.log('Updated resume data:', updatedResumeData);

      // Store resume data in the 'data' JSONB column
      const { error } = await updateProfile(user.id, {
        data: updatedResumeData,
        full_name: updatedResumeData.name,
        username: profile?.username
      });
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Update local state
      resumeData = updatedResumeData;
      profile = { ...profile, data: updatedResumeData, full_name: updatedResumeData.name };
      
      console.log('Save completed successfully');
      toasts.success('Profile updated successfully!');
      
      // Set success state
      saveSuccess = true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toasts.error('Failed to save profile. Please try again.');
    } finally {
      saving = false;
      console.log('Save process finished, saving state reset');
    }
  }

  function goBack() {
    goto('/dashboard');
  }

  async function handleTemplateApply(event: CustomEvent) {
    console.log('Template applied:', event.detail);
    const { template, theme, customization } = event.detail;
    
    try {
      // Update the profile data to include template settings
      const updatedData = {
        ...resumeData,
        template: template,
        theme: theme,
        customization: customization
      };

      const { error } = await updateProfile(user.id, {
        data: updatedData,
        full_name: resumeData.name,
        username: profile?.username
      });

      if (error) throw error;

      // Update local state
      resumeData = updatedData;
      profile = { ...profile, data: updatedData };
      
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
      // Update the profile data to include theme settings
      const updatedData = {
        ...resumeData,
        template: template,
        theme: theme,
        customization: customization
      };

      const { error } = await updateProfile(user.id, {
        data: updatedData,
        full_name: resumeData.name,
        username: profile?.username
      });

      if (error) throw error;

      // Update local state
      resumeData = updatedData;
      profile = { ...profile, data: updatedData };
      
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
      // Update the profile data to include customization settings
      const updatedData = {
        ...resumeData,
        customization: customization
      };

      const { error } = await updateProfile(user.id, {
        data: updatedData,
        full_name: resumeData.name,
        username: profile?.username
      });

      if (error) throw error;

      // Update local state
      resumeData = updatedData;
      profile = { ...profile, data: updatedData };
      
      toasts.success('Customization applied successfully!');
    } catch (error) {
      console.error('Error saving customization settings:', error);
      toasts.error('Failed to save customization settings');
    }
  }
</script>

<svelte:head>
  <title>Profile Editor - SiteMe</title>
  <meta name="description" content="Edit your professional profile" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
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
      
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <User class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Editor
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Manage your professional information
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl">
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-300">Loading profile...</span>
        </div>
      {:else if resumeData}
        <!-- Profile Editor with built-in preview functionality -->
        <ProfileEditor 
          {resumeData}
          uploading={saving}
          {saveSuccess}
          on:save={(event) => handleSaveProfile(event.detail)}
          on:templateApply={handleTemplateApply}
          on:themeApply={handleThemeApply}
          on:customizationApply={handleCustomizationApply}
        />
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-300">No profile data found. Please upload a resume first.</p>
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