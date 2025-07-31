<script lang="ts">
  import { onMount } from 'svelte';
  import { Moon, Sun, Menu, X, User } from 'lucide-svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import '../app.css';

  let theme: 'light' | 'dark' = 'light';
  let mobileMenuOpen = false;
  let user: any = null;
  let scrollProgress = 0;
  
  $: isOnDashboard = $page.url.pathname.startsWith('/dashboard');

  onMount(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      theme = savedTheme;
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
      }
    }
    applyTheme();

    // Handle scroll progress
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize auth separately
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user || null;

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        user = session?.user || null;
      });
    })();
    
    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

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

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/');
  }
</script>

<svelte:head>
  <title>SiteMe - AI-Powered Resume-to-Website Builder</title>
  <meta name="description" content="Transform your resume into a beautiful personal website with AI" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:rotate-3">
            <span class="text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">S</span>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">SiteMe</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="/features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            Features
          </a>
          <a href="/template" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            Template
          </a>
          <a href="/pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            Pricing
          </a>
          <a href="/docs" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            Docs
          </a>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center space-x-4">
          <!-- Theme toggle -->
          <button
            on:click={toggleTheme}
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle theme"
          >
            {#if theme === 'light'}
              <Moon class="w-5 h-5" />
            {:else}
              <Sun class="w-5 h-5" />
            {/if}
          </button>

          <!-- Auth buttons -->
          <div class="hidden md:flex items-center space-x-3">
            {#if user}
              {#if !isOnDashboard}
                <a href="/dashboard" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Dashboard
                </a>
              {/if}
              <button
                on:click={handleLogout}
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            {:else}
               <a href="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                 Sign In
               </a>
             {/if}
          </div>

          <!-- Mobile menu button -->
          <button
            on:click={toggleMobileMenu}
            class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            <div class="relative w-5 h-5">
              <X class="w-5 h-5 absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}" />
              <Menu class="w-5 h-5 absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}" />
            </div>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="md:hidden overflow-hidden transition-all duration-300 {mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="py-4 border-t border-gray-200 dark:border-gray-700">
          <nav class="flex flex-col space-y-4 transform transition-transform duration-300 {mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'}">
            <a href="/features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Features
            </a>
            <a href="/template" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Template
            </a>
            <a href="/pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Pricing
            </a>
            <a href="/docs" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Docs
            </a>
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              {#if user}
                {#if !isOnDashboard}
                  <a href="/dashboard" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-3">
                    Dashboard
                  </a>
                {/if}
                <button
                  on:click={handleLogout}
                  class="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                >
                  Sign Out
                </button>
              {:else}
                 <a href="/login" class="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center">
                   Sign In
                 </a>
               {/if}
            </div>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Progress Line at bottom of navbar -->
    <div class="w-full h-1 bg-gray-100 dark:bg-gray-800/50 relative">
      <div 
        class="h-full bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-blue-500 dark:via-purple-500 dark:to-blue-600 transition-all duration-150 ease-out shadow-lg border-t border-gray-300 dark:border-none relative"
        style="width: {scrollProgress}%; {theme === 'dark' ? 'box-shadow: 0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(147, 51, 234, 0.4);' : 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);'}"
      >
        <!-- Light circular ray at the tip for light mode -->
        {#if scrollProgress > 0 && theme !== 'dark'}
          <div 
            class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800 opacity-90"
            style="box-shadow: 0 0 6px rgba(0, 0, 0, 0.3), 0 0 12px rgba(0, 0, 0, 0.2), 0 0 18px rgba(0, 0, 0, 0.1);"
          ></div>
        {/if}
      </div>
    </div>
  </header>

  <!-- Main content -->
  <main style="padding-top: 68px;">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center space-x-2 mb-4 group">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300">
              <span class="text-white font-bold text-lg">S</span>
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">SiteMe</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
            Transform your resume into a beautiful personal website with AI. 
            Build your online brand in minutes.
          </p>
        </div>

        <!-- Product -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
          <ul class="space-y-2">
            <li><a href="/features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="/pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a></li>
            <li><a href="/docs" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
          <ul class="space-y-2">
            <li><a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a></li>
            <li><a href="/blog" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="/contact" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          © 2024 SiteMe. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="/privacy" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>