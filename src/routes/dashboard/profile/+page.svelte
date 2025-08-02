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
  let showPreview = false;

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
    saving = true;
    toasts.info('Saving profile changes...');

    try {
      let photoUrl = eventData.resumeData.photo_url || profile?.photo_url;
      
      if (eventData.profilePhoto) {
        photoUrl = await handleProfilePhotoUpload(eventData.profilePhoto);
      }

      const updatedResumeData = {
        ...eventData.resumeData,
        photo_url: photoUrl
      };

      // Store resume data in the 'data' JSONB column
      const { error } = await updateProfile(user.id, {
        data: updatedResumeData,
        full_name: updatedResumeData.name,
        username: profile?.username
      });
      
      if (error) throw error;

      // Update local state
      resumeData = updatedResumeData;
      profile = { ...profile, data: updatedResumeData, full_name: updatedResumeData.name };
      
      toasts.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toasts.error('Failed to save profile. Please try again.');
    } finally {
      saving = false;
    }
  }

  function togglePreview() {
    showPreview = !showPreview;
  }

  function goBack() {
    goto('/dashboard');
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
      
      <div class="flex items-center justify-between">
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
        
        <button
          on:click={togglePreview}
          class="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
        >
          {#if showPreview}
            <Edit3 class="w-4 h-4 mr-2" />
            Edit Mode
          {:else}
            <Eye class="w-4 h-4 mr-2" />
            Preview
          {/if}
        </button>
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
        {#if showPreview}
          <!-- Preview Mode -->
          <div class="space-y-8">
            <div class="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
              {#if resumeData.photo_url}
                <img src="{resumeData.photo_url}" alt="Profile" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
              {/if}
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {resumeData.name || 'Your Name'}
              </h2>
              {#if resumeData.email}
                <p class="text-gray-600 dark:text-gray-300">{resumeData.email}</p>
              {/if}
              {#if resumeData.phone}
                <p class="text-gray-600 dark:text-gray-300">{resumeData.phone}</p>
              {/if}
              {#if resumeData.location}
                <p class="text-gray-600 dark:text-gray-300">{resumeData.location}</p>
              {/if}
            </div>

            {#if resumeData.summary}
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{resumeData.summary}</p>
              </div>
            {/if}

            {#if resumeData.experience && resumeData.experience.length > 0}
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experience</h3>
                <div class="space-y-4">
                  {#each resumeData.experience as exp}
                    <div class="border-l-4 border-blue-600 pl-6 py-2">
                      <h4 class="font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                      <p class="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{exp.duration}</p>
                      <p class="text-gray-600 dark:text-gray-300">{exp.description}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if resumeData.education && resumeData.education.length > 0}
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h3>
                <div class="space-y-3">
                  {#each resumeData.education as edu}
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                      <p class="text-blue-600 dark:text-blue-400">{edu.institution}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if resumeData.skills && resumeData.skills.length > 0}
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div class="flex flex-wrap gap-2">
                  {#each resumeData.skills as skill}
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Edit Mode -->
          <ProfileEditor 
            {resumeData}
            uploading={saving}
            on:save={(event) => handleSaveProfile(event.detail)}
          />
        {/if}
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