<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github } from 'lucide-svelte';

  let email = '';
  let password = '';
  let loading = false;
  let showPassword = false;
  let errorMessage = '';
  let successMessage = '';

  onMount(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        goto('/dashboard');
      }
    });
  });

  async function handleEmailLogin() {
    if (!email || !password) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    loading = true;
    errorMessage = '';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        errorMessage = error.message;
      } else {
        successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          goto('/dashboard');
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleGithubLogin() {
    loading = true;
    errorMessage = '';

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        errorMessage = error.message;
        loading = false;
      }
    } catch (error) {
      errorMessage = 'An unexpected error occurred';
      loading = false;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Sign In - SiteMe</title>
  <meta name="description" content="Sign in to your SiteMe account" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <a href="/" class="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Home
      </a>
      
      <div class="flex items-center justify-center mb-6">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:rotate-3">
          <span class="text-white font-bold text-2xl hover:scale-110 transition-transform duration-300">S</span>
        </div>
      </div>
      
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Sign in to your SiteMe account
      </p>
    </div>

    <!-- Login Form -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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

      <!-- Email/Password Form -->
      <form on:submit|preventDefault={handleEmailLogin} class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-gray-400" />
            </div>
            {#if showPassword}
              <input
                id="password"
                type="text"
                bind:value={password}
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            {:else}
              <input
                id="password"
                type="password"
                bind:value={password}
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            {/if}
            <button
              type="button"
              on:click={togglePasswordVisibility}
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {#if showPassword}
                <EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              {:else}
                <Eye class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              {/if}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Forgot your password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
        >
          {#if loading}
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          {:else}
            Sign in
          {/if}
        </button>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div class="mt-6">
          <button
            on:click={handleGithubLogin}
            disabled={loading}
            class="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
          >
            {#if loading}
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-white mr-2"></div>
                Connecting...
              </div>
            {:else}
              <Github class="w-5 h-5 mr-2" />
              GitHub
            {/if}
          </button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?
          <a href="/signup" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign up
          </a>
        </p>
      </div>
    </div>
  </div>
</div>