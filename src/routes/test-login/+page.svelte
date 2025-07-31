<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let user: any = null;
  let session: any = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      session = data.session;
      user = data.session?.user;
      
      if (sessionError) {
        error = sessionError.message;
      }
    } catch (err) {
      error = 'Failed to get session';
    } finally {
      loading = false;
    }
  });

  async function signOut() {
    await supabase.auth.signOut();
    goto('/');
  }
</script>

<svelte:head>
  <title>Test Login - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Login Test</h1>
      
      {#if loading}
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      {:else if error}
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
        </div>
      {:else if user}
        <div class="space-y-4">
          <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-green-600 dark:text-green-400 text-sm">✅ Logged in successfully!</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">User Info:</h3>
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <strong>Email:</strong> {user.email}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <strong>ID:</strong> {user.id}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <a href="/dashboard" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors">
              Go to Dashboard
            </a>
            <button on:click={signOut} class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p class="text-yellow-600 dark:text-yellow-400 text-sm">❌ Not logged in</p>
          </div>
          
          <div class="flex space-x-3">
            <a href="/login" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors">
              Go to Login
            </a>
            <a href="/signup" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors">
              Sign Up
            </a>
          </div>
        </div>
      {/if}
      
      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="font-medium text-gray-900 dark:text-white mb-2">Environment Check:</h3>
        <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</p>
          <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}</p>
          <p>Together API: {import.meta.env.VITE_TOGETHER_API_KEY ? '✅ Set' : '❌ Not Set'}</p>
        </div>
      </div>
    </div>
  </div>
</div> 