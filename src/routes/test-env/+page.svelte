<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let envStatus = {
    supabaseUrl: false,
    supabaseKey: false,
    togetherApiKey: false,
    togetherModel: false
  };

  let connectionStatus = 'Checking...';

  onMount(() => {
    // Check environment variables
    envStatus.supabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    envStatus.supabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    envStatus.togetherApiKey = !!import.meta.env.VITE_TOGETHER_API_KEY;
    envStatus.togetherModel = !!import.meta.env.VITE_TOGETHER_MODEL;

    // Test Supabase connection
    testSupabaseConnection();
  });

  async function testSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        connectionStatus = `Error: ${error.message}`;
      } else {
        connectionStatus = 'Connected successfully!';
      }
    } catch (err) {
      connectionStatus = `Connection failed: ${err}`;
    }
  }
</script>

<svelte:head>
  <title>Environment Test - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Environment Variables Test
      </h1>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Environment Variables Status
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Supabase URL:</span>
            <span class="text-sm font-medium {envStatus.supabaseUrl ? 'text-green-600' : 'text-red-600'}">
              {envStatus.supabaseUrl ? '✅ Set' : '❌ Missing'}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Supabase Key:</span>
            <span class="text-sm font-medium {envStatus.supabaseKey ? 'text-green-600' : 'text-red-600'}">
              {envStatus.supabaseKey ? '✅ Set' : '❌ Missing'}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Together.ai API Key:</span>
            <span class="text-sm font-medium {envStatus.togetherApiKey ? 'text-green-600' : 'text-red-600'}">
              {envStatus.togetherApiKey ? '✅ Set' : '❌ Missing'}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Together.ai Model:</span>
            <span class="text-sm font-medium {envStatus.togetherModel ? 'text-green-600' : 'text-red-600'}">
              {envStatus.togetherModel ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Database Connection
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Status: <span class="font-medium">{connectionStatus}</span>
          </p>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Next Steps
          </h3>
          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Run SQL script in Supabase SQL Editor</li>
            <li>• Setup Authentication providers</li>
            <li>• Test login functionality</li>
            <li>• Test PDF upload and AI processing</li>
          </ul>
        </div>

        <div class="flex space-x-4">
          <a href="/" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Go to Home
          </a>
          <a href="/login" class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">
            Test Login
          </a>
        </div>
      </div>
    </div>
  </div>
</div> 