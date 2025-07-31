<script lang="ts">
  import { onMount } from 'svelte';

  let models: any[] = [];
  let loading = true;
  let error = '';
  let currentModel = import.meta.env.VITE_TOGETHER_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

  onMount(async () => {
    await checkModels();
  });

  async function checkModels() {
    loading = true;
    error = '';

    try {
      const response = await fetch('https://api.together.xyz/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      models = data.data || [];
      
      // Filter to show Qwen models and other powerful models
      models = models.filter(model => 
        model.name && 
        (model.name.includes('Qwen') || 
         model.name.includes('qwen') ||
         model.name.includes('llama') ||
         model.name.includes('gpt'))
      );
      
    } catch (err) {
      console.error('Error fetching models:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch models';
    } finally {
      loading = false;
    }
  }

  async function testModel(modelName: string) {
    try {
      const response = await fetch("https://api.together.xyz/inference", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          prompt: "Hello, this is a test message. Please respond with 'OK'.",
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Model test failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, response: data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
</script>

<svelte:head>
  <title>Check Together.ai Models - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Together.ai Models Check</h1>
      
      <!-- Current Model -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Configuration</h2>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            <strong>API Key:</strong> {import.meta.env.VITE_TOGETHER_API_KEY ? '✅ Set' : '❌ Not Set'}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            <strong>Current Model:</strong> <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{currentModel}</code>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <em>Inspired by self.so - using Qwen 2.5 72B for powerful resume parsing</em>
          </p>
        </div>
      </div>

      <!-- Models List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Available Models</h2>
          <button
            on:click={checkModels}
            disabled={loading}
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if loading}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            {:else}
              Refresh Models
            {/if}
          </button>
        </div>

        {#if error}
          <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
          </div>
        {/if}

        {#if models.length > 0}
          <div class="space-y-4">
            {#each models as model}
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{model.name}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {model.display_name || 'No display name'}
                    </p>
                    {#if model.description}
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {model.description}
                      </p>
                    {/if}
                  </div>
                  <div class="flex items-center space-x-2">
                    {#if model.name === currentModel}
                      <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Current</span>
                    {/if}
                    <button
                      on:click={() => testModel(model.name)}
                      class="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if !loading}
          <p class="text-gray-600 dark:text-gray-300">No models found.</p>
        {/if}
      </div>

      <!-- Recommended Models (inspired by self.so) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recommended Models (self.so inspired)</h2>
        <div class="space-y-3">
          <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white">Qwen/Qwen2.5-72B-Instruct</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">Same model used by self.so - powerful for resume parsing</p>
          </div>
          <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white">Qwen/Qwen2.5-7B-Instruct</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">Smaller but still powerful Qwen model</p>
          </div>
          <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white">meta-llama/Llama-2-70b-chat-hf</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">Alternative powerful model for text processing</p>
          </div>
        </div>
      </div>

      <!-- self.so Inspiration -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-6">
        <h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">💡 Inspired by self.so</h2>
        <div class="space-y-3 text-blue-800 dark:text-blue-200">
          <p class="text-sm">
            <strong>self.so</strong> is an open-source personal site builder that:
          </p>
          <ul class="text-sm space-y-1 ml-4">
            <li>• Uses Together.ai with Qwen 2.5 72B for resume parsing</li>
            <li>• Extracts structured JSON data from PDF resumes</li>
            <li>• Generates beautiful personal websites automatically</li>
            <li>• Uses Clerk for authentication and S3 for storage</li>
          </ul>
          <p class="text-sm mt-3">
            <a href="https://github.com/Nutlope/self.so" class="underline hover:no-underline" target="_blank">
              View self.so on GitHub →
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div> 