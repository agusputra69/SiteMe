<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, AlertTriangle } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	export let title = 'Confirm Action';
	export let message = 'Are you sure you want to proceed?';
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';
	export let type: 'danger' | 'warning' | 'info' = 'info';
	export let loading = false;

	function handleConfirm() {
		dispatch('confirm');
	}

	function handleCancel() {
		dispatch('cancel');
		isOpen = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	$: typeStyles = {
		danger: {
			iconBg: 'bg-red-100 dark:bg-red-900/30',
			iconColor: 'text-red-600 dark:text-red-400',
			buttonBg: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
			borderColor: 'border-red-200 dark:border-red-800'
		},
		warning: {
			iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
			iconColor: 'text-yellow-600 dark:text-yellow-400',
			buttonBg: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400',
			borderColor: 'border-yellow-200 dark:border-yellow-800'
		},
		info: {
			iconBg: 'bg-blue-100 dark:bg-blue-900/30',
			iconColor: 'text-blue-600 dark:text-blue-400',
			buttonBg: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
			borderColor: 'border-blue-200 dark:border-blue-800'
		}
	}[type];
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Escape' && handleCancel()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		aria-describedby="dialog-description"
		tabindex="-1"
	>
		<!-- Dialog -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
			<!-- Header -->
			<div class="flex items-start p-6 pb-4">
				<div class="w-12 h-12 {typeStyles.iconBg} rounded-full flex items-center justify-center mr-4 flex-shrink-0">
					<AlertTriangle class="w-6 h-6 {typeStyles.iconColor}" />
				</div>
				<div class="flex-1">
					<h3 id="dialog-title" class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						{title}
					</h3>
					<p id="dialog-description" class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
						{message}
					</p>
				</div>
				<button 
					on:click={handleCancel}
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
					aria-label="Close dialog"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end space-x-3 p-6 pt-2 border-t border-gray-200 dark:border-gray-700">
				<button
					on:click={handleCancel}
					disabled={loading}
					class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
				>
					{cancelText}
				</button>
				<button
					on:click={handleConfirm}
					disabled={loading}
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-white {typeStyles.buttonBg} disabled:cursor-not-allowed rounded-lg transition-colors"
				>
					{#if loading}
						<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
					{/if}
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure dialog appears above everything */
	:global(body:has(.fixed.z-50)) {
		overflow: hidden;
	}
</style>