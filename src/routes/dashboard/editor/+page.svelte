<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase, getProfile, updateProfile, getValidSession, handleAuthError } from '$lib/supabase';
  import TemplateSelector from '../../../components/TemplateSelector.svelte';
  import ProfileEditor from '../../../components/ProfileEditor.svelte';
  import { toasts } from '$lib/stores/toast';
  import { ArrowLeft, Save, Eye, Settings, Palette, Layout } from 'lucide-svelte';

  let user: any = null;
  let profile: any = null;
  let resumeData: any = null;
  let loading = false;
  let saving = false;
  let activeTab: 'content' | 'design' | 'settings' = 'content';
  let showPreview = false;

  onMount(async () => {
    try {
      const { session, error } = await getValidSession();
      if (error || !session) {
        goto('/login');
        return;
      }
      user = session.user;
      await loadProfile();
    } catch (error) {
      console.error('Editor auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    }
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
        certifications: [],
        languages: [],
        projects: [],
        awards: [],
        skills: [],
        links: []
      };
    }
    loading = false;
  }

  async function handleSave(data: any) {
    if (!user) return;

    saving = true;
    try {
      const { error } = await updateProfile(user.id, data);
      if (error) {
        console.error('Error saving profile:', error);
        toasts.error('Failed to save profile');
        return;
      }

      resumeData = data;
      toasts.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toasts.error('Failed to save profile');
    } finally {
      saving = false;
    }
  }

  function handlePreview() {
    if (profile?.username) {
      window.open(`/u/${profile.username}`, '_blank');
    } else {
      showPreview = true;
    }
  }

  const tabs: Array<{id: 'content' | 'design' | 'settings', label: string, icon: any}> = [
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
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Site Editor
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Customize your professional website
        </p>
      </div>
    </div>
    
    <div class="flex items-center space-x-3">
      <button
        on:click={handlePreview}
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Eye class="w-4 h-4 mr-2" />
        Preview
      </button>
      <button
        on:click={() => handleSave(resumeData)}
        disabled={saving}
        class="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Save class="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 dark:border-gray-700 mb-8">
    <nav class="flex space-x-8">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors {
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }"
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
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">Loading editor...</span>
    </div>
  {:else if activeTab === 'content'}
    <!-- Content Editor -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {#if resumeData}
        <ProfileEditor
          bind:resumeData
          on:save={handleSave}
          on:preview={() => showPreview = true}
        />
      {/if}
    </div>
  {:else if activeTab === 'design'}
    <!-- Design Customizer -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {#if resumeData}
        <TemplateSelector
          profileData={resumeData}
          customizable={true}
        />
      {/if}
    </div>
  {:else if activeTab === 'settings'}
    <!-- Site Settings -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="max-w-2xl">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Site Settings
        </h3>
        
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
            ></textarea>
          </div>

          <!-- Visibility Settings -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Visibility
            </h4>
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
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Site Preview</h2>
        <button
          on:click={() => showPreview = false}
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
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