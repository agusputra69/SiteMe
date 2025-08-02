<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, getProfile, updateProfile } from '$lib/supabase';
  import { extractTextFromPDF, validatePDFFile } from '$lib/pdf';
  import { extractTextFromPDFSimple } from '$lib/pdf-simple';
  import { extractResumeData, type ResumeData } from '$lib/ai';
  import { goto } from '$app/navigation';
  import ProfileEditor from '../../components/ProfileEditor.svelte';
  import OnboardingTour from '../../components/OnboardingTour.svelte';
  import InteractiveTutorial from '../../components/InteractiveTutorial.svelte';
  import { toasts } from '$lib/stores/toast';
  import { 
    Upload, 
    FileText, 
    User, 
    Settings, 
    LogOut, 
    Sparkles, 
    Edit3, 
    Eye,
    Globe,
    Copy,
    Check
  } from 'lucide-svelte';
  import ConfirmDialog from '../../components/ConfirmDialog.svelte';

  let user: any = null;
  let profile: any = null;
  let loading = false;
  let uploading = false;
  let processing = false;
  let saving = false;
  let errorMessage = '';
  let successMessage = '';
  let resumeData: ResumeData | null = null;
  let showPreview = false;
  let copied = false;
  let showOnboarding = false;
  let showTutorial = true;
  let tutorialContext: 'dashboard' | 'upload' | 'edit' | 'preview' = 'dashboard';
  let showDeleteConfirm = false;

  onMount(async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/login');
      return;
    }

    user = session.user;
    await loadProfile();
    
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('siteme-onboarding-completed');
    if (!hasSeenOnboarding && (!profile?.data || Object.keys(profile.data).length === 0)) {
      showOnboarding = true;
    }
  });

  async function loadProfile() {
    if (!user) return;

    const { data, error } = await getProfile(user.id);
    if (error) {
      console.error('Error loading profile:', error);
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
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    if (!validatePDFFile(file)) {
      toasts.error('Please upload a valid PDF file (max 10MB)');
      return;
    }

    uploading = true;
    errorMessage = '';
    successMessage = '';
    toasts.info('Starting PDF upload and processing...');
      tutorialContext = 'upload';

    try {
      console.log('Starting PDF processing...');
      
      // Extract text from PDF with fallback
      let text: string;
      try {
        text = await extractTextFromPDF(file);
        console.log('PDF text extracted with PDF.js, length:', text.length);
      } catch (pdfError) {
        console.warn('PDF.js failed, using simple extraction:', pdfError);
        text = await extractTextFromPDFSimple(file);
        console.log('PDF text extracted with simple method, length:', text.length);
      }
      
      // Process with AI
      processing = true;
      console.log('Sending text to AI for processing, length:', text.length);
      console.log('Text preview:', text.substring(0, 200) + '...');
      const extractedData = await extractResumeData(text);
      console.log('AI processing completed:', extractedData);
      console.log('Extracted data type:', typeof extractedData);
      console.log('Extracted data keys:', Object.keys(extractedData || {}));
      
      // Save to database
      const { error } = await updateProfile(user.id, {
        data: extractedData,
        full_name: extractedData.name
      });

      if (error) {
        console.error('Database error:', error);
        toasts.error('Failed to save profile data: ' + error.message);
      } else {
        console.log('Database save successful, updating local state');
        console.log('Before assignment - resumeData:', resumeData);
        resumeData = extractedData;
        profile = { ...profile, data: extractedData, full_name: extractedData.name };
        console.log('After assignment - resumeData:', resumeData);
        console.log('Updated profile:', profile);
        toasts.success('Resume processed successfully! Your profile has been updated.');
        tutorialContext = 'edit';
        showTutorial = false; // Hide tutorial after successful PDF processing
        // Don't reload profile to avoid overwriting the extracted data
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      if (error instanceof Error) {
        toasts.error(error.message);
      } else {
        toasts.error('Failed to process resume. Please try again.');
      }
    } finally {
      uploading = false;
      processing = false;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/');
  }

  function copyProfileUrl() {
    if (profile?.username) {
      const url = `${window.location.origin}/u/${profile.username}`;
      navigator.clipboard.writeText(url);
      copied = true;
      toasts.success('Profile URL copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2000);
    } else {
      toasts.warning('Please set a username first to get your profile URL');
    }
  }

  function togglePreview() {
    showPreview = !showPreview;
    tutorialContext = showPreview ? 'preview' : 'edit';
  }

  function handleOnboardingComplete() {
    showOnboarding = false;
    localStorage.setItem('siteme-onboarding-completed', 'true');
  }

  function handleOnboardingSkip() {
    showOnboarding = false;
    localStorage.setItem('siteme-onboarding-completed', 'true');
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
    errorMessage = '';
    successMessage = '';
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
      profile = { ...profile, data: updatedResumeData, full_name: updatedResumeData.full_name };
      resumeData = { ...resumeData, ...updatedResumeData };
      
      toasts.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toasts.error('Failed to save profile. Please try again.');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteData() {
    console.log('Delete button clicked');
    console.log('Current user:', user);
    console.log('Current profile:', profile);
    console.log('Current resumeData:', resumeData);
    
    // Check if user is authenticated
    if (!user || !user.id) {
      toasts.error('❌ User not authenticated. Please log in again.');
      return;
    }
    
    // Check Supabase connection
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (!session) {
        toasts.error('❌ Session expired. Please log in again.');
        goto('/login');
        return;
      }
    } catch (sessionError) {
      console.error('Session check failed:', sessionError);
      toasts.error('❌ Connection error. Please check your internet connection.');
      return;
    }
    
    // Show confirmation dialog
    showDeleteConfirm = true;
  }

  async function confirmDeleteData() {
    showDeleteConfirm = false;

    loading = true;
    console.log('Starting deletion process...');
    toasts.info('Deleting all profile data...');

    try {
      console.log('Starting data deletion for user:', user.id);
      console.log('Profile before deletion:', profile);
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (testError && testError.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Supabase connection test passed');
      
      // Clear profile data in database using direct Supabase call
      console.log('Updating profile with null data...');
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          data: null, 
          full_name: null 
        })
        .select()
        .single();
      
      console.log('Direct Supabase update result:', { data: updateData, error: updateError });
      
      if (updateError) {
        console.error('Database deletion error:', updateError);
        throw new Error(`Failed to update database: ${updateError.message}`);
      }

      console.log('Database cleared successfully, updated profile:', updateData);

      // Reset local state
      const emptyResumeData = {
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
      
      resumeData = emptyResumeData;
      profile = { ...profile, data: null, full_name: null };
      
      console.log('Local state reset successfully');
      console.log('New resumeData:', resumeData);
      console.log('New profile:', profile);
      
      toasts.success('✅ All profile data deleted successfully! You can now start fresh.');
      
      // Force a page refresh to ensure clean state
      setTimeout(() => {
        console.log('Refreshing page...');
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting profile data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toasts.error(`❌ Failed to delete profile data: ${errorMessage}`);
    } finally {
      loading = false;
      console.log('Delete process completed, loading set to false');
    }
  }
</script>

<svelte:head>
  <title>Dashboard - SiteMe</title>
  <meta name="description" content="Manage your SiteMe profile" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
  <div class="container mx-auto px-4 py-6">
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {resumeData?.name || user?.email?.split('@')[0] || 'there'}! 👋
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {profile?.username ? `Your site is live at siteme.app/u/${profile.username}` : 'Let\'s get your professional website set up'}
          </p>
        </div>
        {#if profile?.username}
          <div class="mt-4 sm:mt-0">
            <a 
              href="/u/{profile.username}" 
              target="_blank"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye class="w-4 h-4 mr-2" />
              View Live Site
            </a>
          </div>
        {/if}
      </div>


    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Quick Actions -->
      <div class="xl:col-span-2 space-y-6">
        <!-- Getting Started Section -->
        <div id="upload" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Get Started
            </h3>
            <p class="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Choose how you'd like to create your professional website
            </p>
          </div>

          {#if errorMessage}
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p class="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
            </div>
          {/if}

          {#if successMessage}
            <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p class="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
            </div>
          {/if}

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Upload PDF Option -->
            <div class="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload class="w-6 h-6 text-white" />
              </div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Upload Resume
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                AI will extract your information automatically
              </p>
              
              {#if uploading || processing}
                <div class="flex flex-col items-center space-y-3">
                  {#if uploading}
                    <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                  {:else if processing}
                    <div class="animate-pulse">
                      <Sparkles class="w-6 h-6 text-yellow-500" />
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-300">Processing...</span>
                  {/if}
                </div>
              {:else}
                <label class="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg" data-tour="upload-button">
                  <FileText class="w-4 h-4 mr-2" />
                  Choose PDF
                  <input
                    type="file"
                    accept=".pdf"
                    on:change={handleFileUpload}
                    class="hidden"
                  />
                </label>
              {/if}
            </div>

            <!-- LinkedIn Import Option -->
            <div class="group relative bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 text-center opacity-75">
              <div class="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe class="w-6 h-6 text-white" />
              </div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Import LinkedIn
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Export your LinkedIn profile data
              </p>
              <button class="inline-flex items-center px-4 py-2.5 bg-gray-400 text-white font-medium rounded-xl cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>

            <!-- Manual Creation Option -->
            <div class="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Edit3 class="w-6 h-6 text-white" />
              </div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Build Manually
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Create your profile step by step
              </p>
              <button 
                on:click={() => {
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
                }}
                class="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                <User class="w-4 h-4 mr-2" />
                Start Fresh
              </button>
            </div>
          </div>

          <!-- LinkedIn Export Instructions -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 dark:text-blue-400 text-sm font-bold">💡</span>
              </div>
              <div>
                <h5 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to export from LinkedIn:
                </h5>
                <ol class="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Go to your LinkedIn profile</li>
                  <li>Click "More" → "Save to PDF"</li>
                  <li>Upload the downloaded PDF here</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Editor - Only show when user has data or wants to build their site -->
        {#if !showTutorial && resumeData && (resumeData.name || resumeData.email || resumeData.experience?.length > 0 || resumeData.education?.length > 0 || resumeData.skills?.length > 0)}
          <div id="profile" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6" data-tour="profile-editor">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <User class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    Profile Editor
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Manage your information
                  </p>
                </div>
              </div>
              <button
                on:click={togglePreview}
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 backdrop-blur border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
                data-tour="preview-button"
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

            {#if showPreview}
              <!-- Preview Mode -->
              <div class="space-y-6">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {resumeData.name}
                  </h4>
                  {#if resumeData.email}
                    <p class="text-gray-600 dark:text-gray-300">{resumeData.email}</p>
                  {/if}
                  {#if resumeData.location}
                    <p class="text-gray-600 dark:text-gray-300">{resumeData.location}</p>
                  {/if}
                </div>

                {#if resumeData.summary}
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white mb-2">Summary</h5>
                    <p class="text-gray-600 dark:text-gray-300">{resumeData.summary}</p>
                  </div>
                {/if}

                {#if resumeData.experience && resumeData.experience.length > 0}
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white mb-2">Experience</h5>
                    <div class="space-y-3">
                      {#each resumeData.experience as exp}
                        <div class="border-l-4 border-blue-600 pl-4">
                          <h6 class="font-medium text-gray-900 dark:text-white">{exp.title}</h6>
                          <p class="text-gray-600 dark:text-gray-300">{exp.company} • {exp.duration}</p>
                          <p class="text-gray-600 dark:text-gray-300 text-sm">{exp.description}</p>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if resumeData.education && resumeData.education.length > 0}
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white mb-2">Education</h5>
                    <div class="space-y-2">
                      {#each resumeData.education as edu}
                        <div>
                          <h6 class="font-medium text-gray-900 dark:text-white">{edu.degree}</h6>
                          <p class="text-gray-600 dark:text-gray-300">{edu.institution} • {edu.year}</p>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if resumeData.skills && resumeData.skills.length > 0}
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white mb-2">Skills</h5>
                    <div class="flex flex-wrap gap-2">
                      {#each resumeData.skills as skill}
                        <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
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
          </div>
        {/if}
      </div>

      <!-- Modern Sidebar -->
      <div class="xl:col-span-1 space-y-6">


        <!-- Data Management Card -->
        {#if resumeData && (resumeData.name || resumeData.email || resumeData.experience?.length > 0 || resumeData.education?.length > 0 || resumeData.skills?.length > 0)}
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-red-200/50 dark:border-red-700/50 p-6">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                <Settings class="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Data Management
              </h3>
            </div>
            
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-red-600 dark:text-red-400 text-sm font-bold">⚠️</span>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                    Danger Zone
                  </h4>
                  <p class="text-xs text-red-800 dark:text-red-200 mb-3">
                    This will permanently delete ALL your profile data including personal info, experience, education, skills, and uploaded content. This action cannot be undone.
                  </p>
                  
                  <button
                    on:click={handleDeleteData}
                    disabled={loading}
                    class="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {#if loading}
                      <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting All Data...
                    {:else}
                      <Settings class="w-5 h-5 mr-2" />
                      🗑️ Delete All Data
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Onboarding Tour -->
{#if showOnboarding}
  <OnboardingTour
    on:complete={handleOnboardingComplete}
    on:skip={handleOnboardingSkip}
  />
{/if}

<!-- Interactive Tutorial -->
{#if showTutorial}
  <InteractiveTutorial
    isVisible={true}
    currentContext={tutorialContext}
  />
{/if}

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete All Profile Data"
  message="⚠️ WARNING: This will permanently delete ALL your profile data including personal information, work experience, education, skills, and all uploaded content. This action cannot be undone."
  confirmText="Delete Everything"
  cancelText="Cancel"
  type="danger"
  on:confirm={confirmDeleteData}
  on:cancel={() => showDeleteConfirm = false}
/>