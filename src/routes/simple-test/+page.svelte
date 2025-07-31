<script lang="ts">
  import { onMount } from 'svelte';

  let apiKey = import.meta.env.VITE_TOGETHER_API_KEY || '';
  let loading = false;
  let error = '';
  let success = '';
  let networkStatus = '';

  onMount(() => {
    checkNetworkStatus();
  });

  async function checkNetworkStatus() {
    try {
      // Test basic network connectivity
      const response = await fetch('https://httpbin.org/get');
      if (response.ok) {
        networkStatus = '✅ Network connectivity OK';
      } else {
        networkStatus = '❌ Network connectivity issues';
      }
    } catch (err) {
      networkStatus = '❌ Network connectivity failed';
    }
  }

  async function testSimpleRequest() {
    loading = true;
    error = '';
    success = '';

    try {
      // Test with a simple request first
      const response = await fetch('https://api.together.xyz/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        success = '✅ API endpoint is accessible';
      } else {
        error = `❌ API endpoint returned ${response.status}`;
      }
    } catch (err: any) {
      error = `❌ Network error: ${err.message}`;
    } finally {
      loading = false;
    }
  }

  async function testWithApiKey() {
    if (!apiKey) {
      error = '❌ No API key provided';
      return;
    }

    loading = true;
    error = '';
    success = '';

    try {
      // Try using our backend proxy first
      const response = await fetch('/api/together', {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        success = `✅ API key is valid! Found ${data.data?.length || 0} models (via proxy)`;
      } else {
        // Fallback to direct API call
        const directResponse = await fetch('https://api.together.xyz/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (directResponse.ok) {
          const data = await directResponse.json();
          success = `✅ API key is valid! Found ${data.data?.length || 0} models (direct)`;
        } else {
          const errorText = await directResponse.text();
          error = `❌ API key error: ${directResponse.status} - ${errorText}`;
        }
      }
    } catch (err: any) {
      error = `❌ Request failed: ${err.message}`;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Simple API Test - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Simple API Test</h1>
      
      <!-- Network Status -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Network Status</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{networkStatus}</p>
        
        <div class="space-y-3">
          <button
            on:click={testSimpleRequest}
            disabled={loading}
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if loading}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing...
            {:else}
              Test API Endpoint (No Auth)
            {/if}
          </button>

          <button
            on:click={testWithApiKey}
            disabled={loading || !apiKey}
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Test API Key
          </button>
        </div>

        {#if error}
          <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        {/if}

        {#if success}
          <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        {/if}
      </div>

      <!-- API Key Info -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Key Info</h2>
        
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>Current API Key:</strong> {apiKey ? apiKey.substring(0, 10) + '...' : 'Not set'}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Base URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? 'Supabase OK' : 'Supabase Not Set'}</p>
        </div>

        <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Troubleshooting Tips:</h3>
          <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Verify your Together.ai API key is correct</li>
            <li>• Make sure you have credits in your Together.ai account</li>
            <li>• Try refreshing the page and testing again</li>
          </ul>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        
        <div class="space-y-3">
          <a href="/debug" class="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors">
            Go to Debug Page
          </a>
          
          <a href="/check-models" class="block w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-center transition-colors">
            Check Available Models
          </a>
          
          <a href="/dashboard" class="block w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg text-center transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  </div>
</div> 