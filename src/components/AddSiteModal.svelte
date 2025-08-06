<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Edit3, Upload, X } from 'lucide-svelte';

	export let show = false;

	const dispatch = createEventDispatcher();

	function handleManualCreate() {
		dispatch('manualCreate');
	}

	function handlePDFUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			dispatch('pdfUpload', { file });
		}
	}

	function handleClose(event: Event) {
		dispatch('close');
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
			>
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Add New Site</h2>
					<p class="text-gray-600 dark:text-gray-300 mt-1">Choose how to create your new website</p>
				</div>
				<button
					on:click={handleClose}
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Manual Creation -->
					<div
						class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
						on:click={handleManualCreate}
					>
						<div class="space-y-4">
							<div
								class="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
							>
								<Edit3 class="w-8 h-8 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									Build from Scratch
								</h3>
								<p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
									Start with an empty template and fill in data manually
								</p>
								<button
									on:click={handleManualCreate}
									class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
								>
									<Edit3 class="w-4 h-4 mr-2" />
									Start Manual
								</button>
							</div>
						</div>
					</div>

					<!-- PDF Upload -->
					<div
						class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors"
					>
						<div class="space-y-4">
							<div
								class="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
							>
								<Upload class="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									Upload Resume PDF
								</h3>
								<p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
									Upload your PDF resume and choose processing mode
								</p>
								<input
									id="modal-resume-upload"
									type="file"
									accept=".pdf"
									on:change={handlePDFUpload}
									class="hidden"
								/>
								<button
									on:click={() => document.getElementById('modal-resume-upload')?.click()}
									class="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
								>
									<Upload class="w-4 h-4 mr-2" />
									Upload PDF
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Info about limitations -->
				<div
					class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
				>
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0">
							<div
								class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
							>
								<span class="text-blue-600 dark:text-blue-400 text-sm font-bold">ℹ</span>
							</div>
						</div>
						<div>
							<h5 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
								Important Information:
							</h5>
							<ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
								<li>You can create a maximum of 3 websites</li>
								<li>AI processing has daily limitations due to API constraints</li>
								<li>Use well-formatted PDFs for best results</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
