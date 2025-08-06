<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { FileText, Loader, CheckCircle, AlertCircle, X } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let show: boolean = false;
	export let fileName: string = '';
	export let currentStep: 'uploading' | 'extracting' | 'processing' | 'saving' = 'uploading';
	export let progress: number = 0;
	export let error: string = '';
	export let usedFallback: boolean = false;
	export let processingMode: 'ai' | 'basic' = 'ai';

	// Step configurations
	const steps = {
		uploading: {
			title: 'Uploading PDF',
			description: 'Preparing your resume for processing...',
			icon: FileText,
			color: 'blue'
		},
		extracting: {
			title: 'Extracting Text',
			description: 'Reading and extracting text content from your PDF...',
			icon: FileText,
			color: 'green'
		},
		processing: {
			title: processingMode === 'ai' ? 'AI Processing' : 'Basic Processing',
			description:
				processingMode === 'ai'
					? 'Analyzing your resume with AI to extract structured data...'
					: 'Extracting basic information from your resume...',
			icon: Loader,
			color: processingMode === 'ai' ? 'purple' : 'green'
		},
		saving: {
			title: 'Saving Profile',
			description: 'Saving your extracted data to your profile...',
			icon: CheckCircle,
			color: 'blue'
		}
	};

	function handleCancel() {
		dispatch('cancel');
	}

	$: currentStepConfig = steps[currentStep];
	$: progressPercentage = Math.min(progress, 100);
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
			<!-- Header -->
			<div class="p-6 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div
							class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
						>
							<svelte:component
								this={currentStepConfig.icon}
								class="w-6 h-6 text-blue-600 dark:text-blue-400"
							/>
						</div>
						<div>
							<h3 class="text-lg font-bold text-gray-900 dark:text-white">
								Processing Your Resume
							</h3>
							<p class="text-sm text-gray-600 dark:text-gray-300">
								Please wait while we process your PDF
							</p>
						</div>
					</div>
					<button
						on:click={handleCancel}
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- File Info -->
			<div class="p-6 bg-gray-50 dark:bg-gray-700/50">
				<div class="flex items-center space-x-3">
					<FileText class="w-5 h-5 text-gray-500" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
							{fileName}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">Processing in progress...</p>
					</div>
				</div>
			</div>

			<!-- Progress Section -->
			<div class="p-6">
				<!-- Current Step -->
				<div class="mb-6">
					<div class="flex items-center space-x-3 mb-2">
						<div
							class="w-8 h-8 bg-{currentStepConfig.color}-100 dark:bg-{currentStepConfig.color}-900/30 rounded-full flex items-center justify-center"
						>
							<svelte:component
								this={currentStepConfig.icon}
								class="w-4 h-4 text-{currentStepConfig.color}-600 dark:text-{currentStepConfig.color}-400"
							/>
						</div>
						<div class="flex-1">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-white">
								{currentStepConfig.title}
							</h4>
							<p class="text-xs text-gray-600 dark:text-gray-300">
								{currentStepConfig.description}
							</p>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div
							class="bg-{currentStepConfig.color}-600 h-2 rounded-full transition-all duration-300 ease-out"
							style="width: {progressPercentage}%"
						/>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
						{progressPercentage.toFixed(0)}% complete
					</p>
				</div>

				<!-- Processing Steps -->
				<div class="space-y-3">
					{#each Object.entries(steps) as [stepKey, stepConfig]}
						{@const isActive = stepKey === currentStep}
						{@const isCompleted =
							['uploading', 'extracting', 'processing', 'saving'].indexOf(stepKey) <
							['uploading', 'extracting', 'processing', 'saving'].indexOf(currentStep)}

						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
								{#if isCompleted}
									<CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
								{:else if isActive}
									<div
										class="w-5 h-5 border-2 border-{stepConfig.color}-600 dark:border-{stepConfig.color}-400 border-t-transparent rounded-full animate-spin"
									/>
								{:else}
									<div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
								{/if}
							</div>
							<div class="flex-1">
								<p
									class="text-sm font-medium {isActive
										? 'text-gray-900 dark:text-white'
										: isCompleted
										? 'text-green-600 dark:text-green-400'
										: 'text-gray-500 dark:text-gray-400'}"
								>
									{stepConfig.title}
								</p>
								{#if isActive}
									<p class="text-xs text-gray-600 dark:text-gray-300">
										{stepConfig.description}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Fallback Warning -->
				{#if usedFallback}
					<div
						class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
					>
						<div class="flex items-center space-x-2">
							<AlertCircle class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
							<span class="text-xs font-medium text-yellow-800 dark:text-yellow-200">
								Using fallback extraction method
							</span>
						</div>
						<p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
							The primary PDF processing method failed, but we're still extracting your data using
							an alternative method.
						</p>
					</div>
				{/if}

				<!-- Error Display -->
				{#if error}
					<div
						class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
					>
						<div class="flex items-center space-x-2">
							<AlertCircle class="w-4 h-4 text-red-600 dark:text-red-400" />
							<span class="text-xs font-medium text-red-800 dark:text-red-200">
								Processing Error
							</span>
						</div>
						<p class="text-xs text-red-700 dark:text-red-300 mt-1">
							{error}
						</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-6 border-t border-gray-200 dark:border-gray-700">
				<div class="text-center">
					<p class="text-xs text-gray-500 dark:text-gray-400">
						This may take a few moments depending on your file size
					</p>
					<button
						on:click={handleCancel}
						class="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
					>
						Cancel Processing
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
