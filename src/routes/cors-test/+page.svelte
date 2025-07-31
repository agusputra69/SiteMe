<script lang="ts">
  import { onMount } from 'svelte';

  let apiKey = import.meta.env.VITE_TOGETHER_API_KEY || '';
  let loading = false;
  let error = '';
  let success = '';
  let testResults: any[] = [];

  onMount(() => {
    runAllTests();
  });

  async function runAllTests() {
    testResults = [];
    
    // Test 1: Basic network connectivity
    await testNetworkConnectivity();
    
    // Test 2: CORS test with different methods
    await testCORS();
    
    // Test 3: API endpoint accessibility
    await testAPIEndpoint();
    
    // Test 4: API key test (if available)
    if (apiKey) {
      await testAPIKey();
    }
  }

  async function testNetworkConnectivity() {
    try {
      const response = await fetch('https://httpbin.org/get');
      testResults.push({
        name: 'Network Connectivity',
        status: response.ok ? '✅ PASS' : '❌ FAIL',
        details: response.ok ? 'Internet connection working' : `HTTP ${response.status}`
      });
    } catch (err: any) {
      testResults.push({
        name: 'Network Connectivity',
        status: '❌ FAIL',
        details: err.message
      });
    }
  }

  async function testCORS() {
    try {
      // Test with different headers
      const response = await fetch('https://api.together.xyz/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      testResults.push({
        name: 'CORS Test',
        status: response.ok ? '✅ PASS' : '⚠️ PARTIAL',
        details: response.ok ? 'CORS working' : `HTTP ${response.status} - ${response.statusText}`
      });
    } catch (err: any) {
      testResults.push({
        name: 'CORS Test',
        status: '❌ FAIL',
        details: err.message
      });
    }
  }

  async function testAPIEndpoint() {
    try {
      // Test with OPTIONS first (preflight)
      const optionsResponse = await fetch('https://api.together.xyz/models', {
        method: 'OPTIONS'
      });
      
      testResults.push({
        name: 'API Endpoint (OPTIONS)',
        status: optionsResponse.ok ? '✅ PASS' : '⚠️ PARTIAL',
        details: `OPTIONS: ${optionsResponse.status}`
      });
    } catch (err: any) {
      testResults.push({
        name: 'API Endpoint (OPTIONS)',
        status: '❌ FAIL',
        details: err.message
      });
    }
  }

  async function testAPIKey() {
    try {
      const response = await fetch('https://api.together.xyz/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'API Key Test',
          status: '✅ PASS',
          details: `Found ${data.data?.length || 0} models`
        });
      } else {
        const errorText = await response.text();
        testResults.push({
          name: 'API Key Test',
          status: '❌ FAIL',
          details: `HTTP ${response.status}: ${errorText}`
        });
      }
    } catch (err: any) {
      testResults.push({
        name: 'API Key Test',
        status: '❌ FAIL',
        details: err.message
      });
    }
  }

  async function testWithProxy() {
    loading = true;
    error = '';
    success = '';

    try {
      // Try using our own backend proxy first
      const response = await fetch('/api/together', {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        success = `✅ Backend proxy successful! Found ${data.data?.length || 0} models`;
      } else {
        // Try alternative CORS proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=https://api.together.xyz/models';
        const proxyResponse = await fetch(proxyUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (proxyResponse.ok) {
          const data = await proxyResponse.json();
          success = `✅ External proxy successful! Found ${data.data?.length || 0} models`;
        } else {
          error = `❌ All proxy tests failed: Backend ${response.status}, External ${proxyResponse.status}`;
        }
      }
    } catch (err: any) {
      error = `❌ Proxy test error: ${err.message}`;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>CORS Test - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">CORS & Network Test</h1>
      
      <!-- Test Results -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Test Results</h2>
        
        <div class="space-y-3">
          {#each testResults as result}
            <div class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{result.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">{result.details}</p>
              </div>
              <span class="text-sm font-medium {result.status.includes('PASS') ? 'text-green-600' : result.status.includes('PARTIAL') ? 'text-yellow-600' : 'text-red-600'}">
                {result.status}
              </span>
            </div>
          {/each}
        </div>

        <button
          on:click={runAllTests}
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Run Tests Again
        </button>
      </div>

      <!-- Proxy Test -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Proxy Test (Alternative)</h2>
        
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          If CORS is blocking requests, try using a proxy:
        </p>

        <button
          on:click={testWithProxy}
          disabled={loading || !apiKey}
          class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Testing...
          {:else}
            Test with CORS Proxy
          {/if}
        </button>

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

      <!-- Solutions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Solutions for "Failed to fetch"</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">1. Browser Issues</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>• Try incognito/private browsing mode</li>
              <li>• Disable browser extensions (ad blockers, etc.)</li>
              <li>• Try different browser (Chrome, Firefox, Safari)</li>
              <li>• Clear browser cache and cookies</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">2. Network Issues</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>• Check your internet connection</li>
              <li>• Try different network (mobile hotspot)</li>
              <li>• Disable VPN if using one</li>
              <li>• Check firewall settings</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">3. API Key Issues</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>• Verify API key is correct</li>
              <li>• Check Together.ai account has credits</li>
              <li>• Try generating new API key</li>
              <li>• Check API key permissions</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">4. Development Server</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>• Restart development server</li>
              <li>• Check if server is running on correct port</li>
              <li>• Try different port if needed</li>
              <li>• Check for any error messages in terminal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 