<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getProfileByUsername } from '$lib/supabase';
  import { Globe, Mail, MapPin, Calendar, Briefcase, GraduationCap, Award } from 'lucide-svelte';
  import TemplateSelector from '../../../components/TemplateSelector.svelte';

  // Type definitions for profile data
  type ExperienceItem = { title?: string; company?: string; duration?: string; description?: string };
  type EducationItem = { institution?: string; degree?: string; year?: string };

  let profile: any = null;
  let loading = true;
  let error = false;

  $: username = $page.params.username;

  onMount(async () => {
    if (username && username !== '[username]') {
      await loadProfile();
    }
  });

  async function loadProfile() {
    if (!username || username === '[username]') {
      error = true;
      loading = false;
      return;
    }

    try {
      const { data, error: profileError } = await getProfileByUsername(username);
      
      if (profileError) {
        error = true;
        return;
      }

      profile = data;
    } catch (err) {
      error = true;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{profile?.data?.name || username} - SiteMe</title>
  <meta name="description" content={profile?.data?.summary || `View ${profile?.data?.name || username}'s professional profile`} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  {#if loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error || !profile}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Profile Not Found
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          The profile you're looking for doesn't exist or is not public.
        </p>
        <a href="/" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Go Home
        </a>
      </div>
    </div>
  {:else}
    <!-- Profile Display with Template -->
    <div class="min-h-screen">
      <TemplateSelector
        profileData={{
          name: profile.data?.name || 'Your Name',
          avatar: profile.data?.photo_url || '',
          about: profile.data?.summary || 'Your professional summary goes here...',
          // @ts-ignore
          workExperience: profile.data?.experience?.map((exp) => ({
            title: exp.title || 'Job Title',
            company: exp.company || 'Company Name',
            type: 'Full-Time',
            period: exp.duration || 'Start - End',
            current: false,
            description: exp.description || ''
          })) || [{
            title: 'Your Job Title',
            company: 'Company Name',
            type: 'Full-Time',
            period: 'Start - End',
            current: false,
            description: ''
          }],
          // @ts-ignore
          education: profile.data?.education?.map((edu) => ({
            institution: edu.institution || 'University Name',
            degree: edu.degree || 'Your Degree',
            period: edu.year || 'Start - End'
          })) || [{
            institution: 'University Name',
            degree: 'Your Degree',
            period: 'Start - End'
          }],
          skills: profile.data?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
          contact: {
            email: profile.data?.email || '',
            phone: profile.data?.phone || '',
            location: profile.data?.location || ''
          }
        }}
        customizable={false}
        selectedTemplate={profile.data?.template || 'classic'}
        selectedTheme={profile.data?.theme || 'blue'}
        customization={profile.data?.customization || {
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
        }}
      />
    </div>
  {/if}
</div> 