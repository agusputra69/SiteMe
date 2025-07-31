<script lang="ts">
  import { onMount } from 'svelte';

  let apiKey = import.meta.env.VITE_TOGETHER_API_KEY || '';
  let models: any[] = [];
  let loading = false;
  let error = '';
  let success = '';
  let testResult = '';

  async function testApiKey() {
    loading = true;
    error = '';
    success = '';
    testResult = '';

    try {
      console.log('Testing API key:', apiKey.substring(0, 10) + '...');
      
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://api.together.xyz/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      models = data.data || [];
      success = `✅ API key is valid! Found ${models.length} models.`;
      
      // Filter serverless models
      const serverlessModels = models.filter(model => 
        model.name && 
        (model.name.includes('gpt2') ||
         model.name.includes('DialoGPT') ||
         model.name.includes('text'))
      );
      
      testResult = `Found ${serverlessModels.length} serverless models:\n` + 
        serverlessModels.map(m => `- ${m.name}`).join('\n');
      
    } catch (err: any) {
      console.error('Test error:', err);
      if (err.name === 'AbortError') {
        error = 'Request timeout - check your internet connection';
      } else if (err.message?.includes('Failed to fetch')) {
        error = 'Network error - check your internet connection or try again';
      } else {
        error = err instanceof Error ? err.message : 'Unknown error';
      }
    } finally {
      loading = false;
    }
  }

  async function testSimpleModel() {
    loading = true;
    error = '';
    success = '';

    try {
      const response = await fetch("https://api.together.xyz/inference", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt2",
          prompt: "Hello, this is a test.",
          max_tokens: 10,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Model test failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      success = `✅ Model test successful! Response: ${JSON.stringify(data, null, 2)}`;
      
    } catch (err) {
      console.error('Model test error:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Test Together.ai API - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Together.ai API Test</h1>
      
      <!-- API Key Test -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Key Test</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key (first 10 chars): {apiKey ? apiKey.substring(0, 10) + '...' : 'Not set'}
            </label>
            <input
              type="password"
              bind:value={apiKey}
              placeholder="Enter your Together.ai API key"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex space-x-3">
            <button
              on:click={testApiKey}
              disabled={loading || !apiKey}
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if loading}
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              {:else}
                Test API Key
              {/if}
            </button>

            <button
              on:click={testSimpleModel}
              disabled={loading || !apiKey}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test Simple Model
            </button>
          </div>

          {#if error}
            <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
            </div>
          {/if}

          {#if success}
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          {/if}

          {#if testResult}
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 class="font-medium text-gray-900 dark:text-white mb-2">Test Results:</h3>
              <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{testResult}</pre>
            </div>
          {/if}
        </div>
      </div>

      <!-- Troubleshooting -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Troubleshooting</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">1. Check API Key</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              - Go to <a href="https://api.together.xyz/" class="text-blue-600 hover:underline" target="_blank">Together.ai</a>
              - Sign up/login and get your API key
              - Make sure the key is correct and has credits
            </p>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">2. Serverless Models</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              These models work without dedicated endpoints:
              - <code>gpt2</code> (most cost-effective)
              - <code>microsoft/DialoGPT-medium</code>
              - <code>microsoft/DialoGPT-small</code>
            </p>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">3. Update Environment</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              If API key is correct, update your <code>.env</code> file:
            </p>
            <pre class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2">
VITE_TOGETHER_API_KEY=your_api_key_here
VITE_TOGETHER_MODEL=gpt2</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 