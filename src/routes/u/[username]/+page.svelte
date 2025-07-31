<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getProfileByUsername } from '$lib/supabase';
  import { Globe, Mail, MapPin, Calendar, Briefcase, GraduationCap, Award } from 'lucide-svelte';

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
    <!-- Profile Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-3xl">
                {profile.data?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.data?.name || 'Unknown User'}
              </h1>
              {#if profile.data?.email}
                <p class="text-gray-600 dark:text-gray-300 flex items-center">
                  <Mail class="w-4 h-4 mr-2" />
                  {profile.data.email}
                </p>
              {/if}
              {#if profile.data?.location}
                <p class="text-gray-600 dark:text-gray-300 flex items-center">
                  <MapPin class="w-4 h-4 mr-2" />
                  {profile.data.location}
                </p>
              {/if}
            </div>
          </div>

          {#if profile.data?.summary}
            <div class="prose dark:prose-invert max-w-none">
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {profile.data.summary}
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Experience -->
            {#if profile.data?.experience && profile.data.experience.length > 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Briefcase class="w-6 h-6 mr-3 text-blue-600" />
                  Experience
                </h2>
                <div class="space-y-6">
                  {#each profile.data.experience as exp}
                    <div class="border-l-4 border-blue-600 pl-6">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {exp.title}
                          </h3>
                          <p class="text-blue-600 dark:text-blue-400 font-medium">
                            {exp.company}
                          </p>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar class="w-4 h-4 mr-1" />
                          {exp.duration}
                        </span>
                      </div>
                      <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Education -->
            {#if profile.data?.education && profile.data.education.length > 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <GraduationCap class="w-6 h-6 mr-3 text-blue-600" />
                  Education
                </h2>
                <div class="space-y-4">
                  {#each profile.data.education as edu}
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                          {edu.degree}
                        </h3>
                        <p class="text-blue-600 dark:text-blue-400 font-medium">
                          {edu.institution}
                        </p>
                      </div>
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        {edu.year}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Skills -->
            {#if profile.data?.skills && profile.data.skills.length > 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award class="w-5 h-5 mr-2 text-blue-600" />
                  Skills
                </h3>
                <div class="flex flex-wrap gap-2">
                  {#each profile.data.skills as skill}
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Links -->
            {#if profile.data?.links && profile.data.links.length > 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe class="w-5 h-5 mr-2 text-blue-600" />
                  Links
                </h3>
                <div class="space-y-2">
                  {#each profile.data.links as link}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {link.type}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Powered by SiteMe -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 font-bold text-lg">S</span>
                </div>
                <span class="text-xl font-bold">SiteMe</span>
              </div>
              <p class="text-blue-100 text-sm mb-4">
                This profile was created with SiteMe - AI-powered resume-to-website builder.
              </p>
              <a
                href="/"
                class="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 font-medium rounded-lg transition-colors text-sm"
              >
                Create Your Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div> 