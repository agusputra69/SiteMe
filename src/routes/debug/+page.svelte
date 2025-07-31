<script lang="ts">
  import { onMount } from 'svelte';
  import { extractTextFromPDF, validatePDFFile } from '$lib/pdf';
  import { extractTextFromPDFSimple } from '$lib/pdf-simple';
  import { extractResumeData } from '$lib/ai';

  let debugInfo = {
    envVars: {
      togetherApiKey: import.meta.env.VITE_TOGETHER_API_KEY ? 'Set' : 'Not Set',
      togetherModel: import.meta.env.VITE_TOGETHER_MODEL || 'qwen:7b-chat',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
    },
    pdfTest: {
      file: null as File | null,
      extractedText: '',
      validationResult: false,
      error: ''
    },
    aiTest: {
      result: null as any,
      error: ''
    }
  };

  let testing = false;

  async function testPDFExtraction() {
    if (!debugInfo.pdfTest.file) return;

    testing = true;
    debugInfo.pdfTest.error = '';
    debugInfo.pdfTest.extractedText = '';

    try {
      // Test validation
      debugInfo.pdfTest.validationResult = validatePDFFile(debugInfo.pdfTest.file);
      
      if (!debugInfo.pdfTest.validationResult) {
        debugInfo.pdfTest.error = 'File validation failed';
        return;
      }

      // Test extraction with fallback
      let text: string;
      try {
        text = await extractTextFromPDF(debugInfo.pdfTest.file);
        console.log('PDF.js extraction successful');
      } catch (pdfError) {
        console.warn('PDF.js failed, using simple extraction:', pdfError);
        text = await extractTextFromPDFSimple(debugInfo.pdfTest.file);
      }
      debugInfo.pdfTest.extractedText = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      
      // Test AI processing
      debugInfo.aiTest.error = '';
      const result = await extractResumeData(text);
      debugInfo.aiTest.result = result;
      
    } catch (error) {
      console.error('Debug test error:', error);
      debugInfo.pdfTest.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      testing = false;
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      debugInfo.pdfTest.file = file;
    }
  }
</script>

<svelte:head>
  <title>Debug - SiteMe</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Debug Information</h1>
      
      <!-- Environment Variables -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Environment Variables</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Together API Key:</span>
            <span class="ml-2 px-2 py-1 text-xs rounded {debugInfo.envVars.togetherApiKey === 'Set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {debugInfo.envVars.togetherApiKey}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Together Model:</span>
            <span class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {debugInfo.envVars.togetherModel}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Supabase URL:</span>
            <span class="ml-2 px-2 py-1 text-xs rounded {debugInfo.envVars.supabaseUrl === 'Set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {debugInfo.envVars.supabaseUrl}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Supabase Key:</span>
            <span class="ml-2 px-2 py-1 text-xs rounded {debugInfo.envVars.supabaseKey === 'Set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {debugInfo.envVars.supabaseKey}
            </span>
          </div>
        </div>
      </div>

      <!-- PDF Test -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">PDF Processing Test</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            on:change={handleFileSelect}
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {#if debugInfo.pdfTest.file}
          <div class="mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              File: {debugInfo.pdfTest.file.name} ({Math.round(debugInfo.pdfTest.file.size / 1024)}KB)
            </p>
          </div>

          <button
            on:click={testPDFExtraction}
            disabled={testing}
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if testing}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing...
            {:else}
              Test PDF Processing
            {/if}
          </button>

          {#if debugInfo.pdfTest.error}
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-red-600 dark:text-red-400 text-sm">Error: {debugInfo.pdfTest.error}</p>
            </div>
          {/if}

          {#if debugInfo.pdfTest.extractedText}
            <div class="mt-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Extracted Text (first 500 chars):</h3>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{debugInfo.pdfTest.extractedText}</pre>
              </div>
            </div>
          {/if}

          {#if debugInfo.aiTest.result}
            <div class="mt-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Processing Result:</h3>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{JSON.stringify(debugInfo.aiTest.result, null, 2)}</pre>
              </div>
            </div>
          {/if}

          {#if debugInfo.aiTest.error}
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-red-600 dark:text-red-400 text-sm">AI Error: {debugInfo.aiTest.error}</p>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Common Issues -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Common Issues & Solutions</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">1. Environment Variables Not Set</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Make sure your <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file exists and contains all required variables.
            </p>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">2. Together.ai API Issues</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              - Check if your API key is valid<br>
              - Verify the model name is correct<br>
              - Check your Together.ai account balance
            </p>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">3. PDF Processing Issues</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              - Ensure the PDF contains extractable text (not just images)<br>
              - Check file size (max 10MB)<br>
              - Try with a different PDF file
            </p>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">4. Network Issues</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              - Check your internet connection<br>
              - Verify CORS settings if testing locally
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 