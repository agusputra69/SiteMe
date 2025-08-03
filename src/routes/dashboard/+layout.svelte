<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { supabase, getValidSession, handleAuthError } from '$lib/supabase';
  import { Home, Edit3, Settings, LogOut, User, Moon, Sun } from 'lucide-svelte';
  import { toasts } from '$lib/stores/toast';

  let user: any = null;
  let loading = true;
  let theme: 'light' | 'dark' = 'light';

  onMount(async () => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      theme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
    applyTheme();

    try {
      const { session, error } = await getValidSession();
      if (error || !session) {
        goto('/login');
        return;
      }
      user = session.user;
    } catch (error) {
      console.error('Dashboard auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    } finally {
      loading = false;
    }
  });

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      toasts.success('Successfully logged out');
      goto('/');
    } catch (error) {
      toasts.error('Failed to log out');
    }
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  $: currentPath = $page.url.pathname;

  const navItems = [
    { path: '/dashboard', label: 'Main', icon: Home },
    { path: '/dashboard/editor', label: 'Site Editor', icon: Edit3 },
    { path: '/dashboard/settings', label: 'Account Settings', icon: Settings }
  ];
</script>

<svelte:head>
  <title>Dashboard - SiteMe</title>
  <meta name="description" content="Manage your SiteMe profile and website" />
</svelte:head>

{#if loading}
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <span class="text-xl font-bold text-gray-900 dark:text-white">SiteMe</span>
          </div>

          <!-- Navigation Tabs -->
          <nav class="hidden md:flex items-center space-x-1">
            {#each navItems as item}
              <a
                href={item.path}
                class="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 {
                  currentPath === item.path
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }"
              >
                <svelte:component this={item.icon} class="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            {/each}
          </nav>

          <!-- User Menu -->
          <div class="flex items-center space-x-3">
            <!-- Theme Toggle -->
            <button
              on:click={toggleTheme}
              class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle {theme === 'light' ? 'dark' : 'light'} theme"
            >
              {#if theme === 'light'}
                <Moon class="w-5 h-5" />
              {:else}
                <Sun class="w-5 h-5" />
              {/if}
            </button>
            
            <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <User class="w-4 h-4" />
              <span>{user?.email?.split('@')[0] || 'User'}</span>
            </div>
            <button
              on:click={handleSignOut}
              class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="md:hidden border-t border-gray-200/50 dark:border-gray-700/50">
          <nav class="flex items-center justify-around py-2">
            {#each navItems as item}
              <a
                href={item.path}
                class="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 {
                  currentPath === item.path
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                }"
              >
                <svelte:component this={item.icon} class="w-5 h-5" />
                <span class="text-xs font-medium">{item.label}</span>
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-4">
      <slot />
    </main>
  </div>
{/if}