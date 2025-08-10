<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Clock, AlertTriangle, RefreshCw } from 'lucide-svelte';

	export let show = false;
	export let retryAfter = 60; // seconds
	export let message = '';

	const dispatch = createEventDispatcher();

	function handleRetry() {
		dispatch('retry');
	}

	function handleClose() {
		dispatch('close');
	}

	function formatTime(seconds: number): string {
		if (seconds < 60) {
			return `${seconds} seconds`;
		}
		const minutes = Math.ceil(seconds / 60);
		return `${minutes} minute${minutes > 1 ? 's' : ''}`;
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
			<!-- Header -->
			<div class="flex items-start p-6 pb-4">
				<div
					class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
				>
					<Clock class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Service Busy</h3>
					<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
						{message ||
							`The AI service is currently processing other requests. Please wait ${formatTime(
								retryAfter
							)} before trying again.`}
					</p>
				</div>
				<button
					on:click={handleClose}
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
					aria-label="Close dialog"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="px-6 pb-4">
				<div
					class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
				>
					<div class="flex items-start space-x-3">
						<AlertTriangle
							class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
						/>
						<div class="flex-1">
							<h4 class="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
								What's happening?
							</h4>
							<p class="text-xs text-yellow-800 dark:text-yellow-200">
								Our AI service has a rate limit to ensure fair usage for all users. This is a
								temporary restriction that will reset automatically.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div
				class="flex items-center justify-end space-x-3 p-6 pt-2 border-t border-gray-200 dark:border-gray-700"
			>
				<button
					on:click={handleClose}
					class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
				>
					Close
				</button>
				<button
					on:click={handleRetry}
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
					disabled={retryAfter > 0}
				>
					<RefreshCw class="w-4 h-4 mr-2" />
					Try Again
				</button>
			</div>
		</div>
	</div>
{/if}
