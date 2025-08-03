<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Zap, Settings } from 'lucide-svelte';

  export let show = false;
  export let fileName = '';

  const dispatch = createEventDispatcher();

  function selectAI() {
    dispatch('select', { useAI: true });
  }

  function selectBasic() {
    dispatch('select', { useAI: false });
  }

  function close() {
    dispatch('close');
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Pilih Model Processing</h3>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-6">
          File: <span class="font-medium">{fileName}</span>
        </p>
        
        <div class="space-y-4">
          <!-- AI Processing Option -->
          <button
            on:click={selectAI}
            class="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Zap class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1 text-left">
                <h4 class="font-medium text-gray-900 mb-1">AI Processing (Recommended)</h4>
                <p class="text-sm text-gray-600">
                  Using AI for more accurate and complete data extraction from your PDF resume.
                </p>
                <div class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    High Accuracy
                  </span>
                </div>
              </div>
            </div>
          </button>
          
          <!-- Basic Processing Option -->
          <button
            on:click={selectBasic}
            class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <Settings class="w-5 h-5 text-gray-600" />
              </div>
              <div class="flex-1 text-left">
                <h4 class="font-medium text-gray-900 mb-1">Basic Processing</h4>
                <p class="text-sm text-gray-600">
                  Basic extraction without AI. Results may be limited and require manual editing.
                </p>
                <div class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Fast & Simple
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Ensure modal appears above other content */
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>