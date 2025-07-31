<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, getProfile, updateProfile } from '$lib/supabase';
  import { extractTextFromPDF, validatePDFFile } from '$lib/pdf';
  import { extractTextFromPDFSimple } from '$lib/pdf-simple';
  import { extractResumeData, type ResumeData } from '$lib/ai';
  import { goto } from '$app/navigation';
  import ProfileEditor from '../../components/ProfileEditor.svelte';
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
      errorMessage = 'Please upload a valid PDF file (max 10MB)';
      return;
    }

    uploading = true;
    errorMessage = '';
    successMessage = '';

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
        errorMessage = 'Failed to save profile data: ' + error.message;
      } else {
        console.log('Database save successful, updating local state');
        console.log('Before assignment - resumeData:', resumeData);
        resumeData = extractedData;
        profile = { ...profile, data: extractedData, full_name: extractedData.name };
        console.log('After assignment - resumeData:', resumeData);
        console.log('Updated profile:', profile);
        successMessage = 'Resume processed successfully!';
        // Don't reload profile to avoid overwriting the extracted data
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Failed to process resume. Please try again.';
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
      setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }

  function togglePreview() {
    showPreview = !showPreview;
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
      
      successMessage = 'Profile updated successfully!';
      setTimeout(() => successMessage = '', 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      errorMessage = 'Failed to save profile. Please try again.';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Dashboard - SiteMe</title>
  <meta name="description" content="Manage your SiteMe profile" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <!-- Logo removed to avoid redundancy with main layout -->
        </div>

        <div class="flex items-center space-x-4">
          {#if profile?.username}
            <button
              on:click={copyProfileUrl}
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {#if copied}
                <Check class="w-4 h-4 mr-2" />
                Copied!
              {:else}
                <Copy class="w-4 h-4 mr-2" />
                Copy URL
              {/if}
            </button>
          {/if}

          <button
            on:click={handleLogout}
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut class="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="container mx-auto px-4 py-8">
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.email || 'User'}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {profile?.username ? `@${profile.username}` : 'No username set'}
              </p>
            </div>
          </div>

          <nav class="space-y-2">
            <a href="#upload" class="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Upload class="w-5 h-5" />
              <span>Upload Resume</span>
            </a>
            <a href="#profile" class="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Edit3 class="w-5 h-5" />
              <span>Edit Profile</span>
            </a>
            <a href="#preview" class="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Eye class="w-5 h-5" />
              <span>Preview</span>
            </a>
            <a href="#settings" class="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings class="w-5 h-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Upload Section -->
        <div id="upload" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Resume
          </h3>

          {#if errorMessage}
            <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
            </div>
          {/if}

          {#if successMessage}
            <div class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
            </div>
          {/if}

          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload your resume
            </h4>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Upload a PDF resume and our AI will extract your information
            </p>
            
            {#if uploading || processing}
              <div class="flex items-center justify-center space-x-2">
                {#if uploading}
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <Upload class="w-5 h-5 text-blue-600 opacity-50" />
                  <span class="text-gray-600 dark:text-gray-300">Uploading...</span>
                {:else if processing}
                  <div class="animate-pulse">
                    <Sparkles class="w-5 h-5 text-yellow-500" />
                  </div>
                  <span class="text-gray-600 dark:text-gray-300">Processing with AI...</span>
                {/if}
              </div>
            {:else}
              <label class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
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
        </div>

        <!-- Profile Data -->
        {#if resumeData}
          <div id="profile" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Data
              </h3>
              <button
                on:click={togglePreview}
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {#if showPreview}
                  <Edit3 class="w-4 h-4 mr-2" />
                  Edit
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
    </div>
  </div>
</div>