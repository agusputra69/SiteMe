<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-svelte';

  export let type = 'info'; // 'success', 'error', 'warning', 'info'
  export let message = '';
  export let duration = 4000; // Auto-dismiss after 4 seconds
  export let dismissible = true;

  const dispatch = createEventDispatcher();

  let visible = true;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        dismiss();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  function dismiss() {
    visible = false;
    dispatch('dismiss');
  }

  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  }

  function getStyles(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  }

  function getIconColor(type: string) {
    switch (type) {
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  }
</script>

{#if visible}
  <div
    class="max-w-sm w-full"
    transition:fly={{ x: 300, duration: 300 }}
  >
    <div class="border rounded-lg p-4 shadow-lg backdrop-blur-sm {getStyles(type)}">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svelte:component this={getIcon(type)} class="w-5 h-5 {getIconColor(type)}" />
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">{message}</p>
        </div>
        {#if dismissible}
          <div class="ml-4 flex-shrink-0">
            <button
              type="button"
              class="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors"
              on:click={dismiss}
            >
              <span class="sr-only">Dismiss</span>
              <X class="w-4 h-4" />
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}