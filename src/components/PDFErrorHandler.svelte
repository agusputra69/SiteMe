<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AlertTriangle, FileText, Lock, Image, Download, RefreshCw } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let error: string = '';
	export let show: boolean = false;
	export let file: File | null = null;

	// Error categories and solutions
	type ErrorCategory = 'password' | 'scanned' | 'corrupted' | 'empty' | 'large' | 'timeout';
	
	const errorCategories: Record<ErrorCategory, {
		icon: any;
		title: string;
		description: string;
		solutions: string[];
	}> = {
		'password': {
			icon: Lock,
			title: 'Password Protected PDF',
			description: 'The PDF is password-protected and cannot be processed.',
			solutions: [
				'Remove the password from the PDF using a PDF editor',
				'Use "Save As" to create an unprotected copy',
				'Try a different PDF file without password protection'
			]
		},
		'scanned': {
			icon: Image,
			title: 'Scanned or Image-based PDF',
			description: 'The PDF appears to be scanned or contains only images.',
			solutions: [
				'Use a text-based PDF instead of a scanned document',
				'Convert the scanned PDF to text using OCR software',
				'Create a new PDF from a text document'
			]
		},
		'corrupted': {
			icon: AlertTriangle,
			title: 'Corrupted PDF File',
			description: 'The PDF file appears to be corrupted or damaged.',
			solutions: [
				'Try opening the PDF in a different PDF reader',
				'Download the file again from the original source',
				'Use a different PDF file'
			]
		},
		'empty': {
			icon: FileText,
			title: 'Empty or Invalid PDF',
			description: 'The PDF file is empty or contains no readable text.',
			solutions: [
				'Ensure the PDF contains actual text content',
				'Check that the file is not corrupted',
				'Try a different PDF file'
			]
		},
		'large': {
			icon: Download,
			title: 'File Too Large',
			description: 'The PDF file exceeds the maximum allowed size.',
			solutions: [
				'Compress the PDF to reduce file size',
				'Use a PDF with fewer pages',
				'Convert to a smaller format'
			]
		},
		'timeout': {
			icon: RefreshCw,
			title: 'Processing Timeout',
			description: 'The PDF took too long to process.',
			solutions: [
				'Try a smaller PDF file',
				'Reduce the number of pages in the PDF',
				'Check your internet connection and try again'
			]
		}
	};

	function getErrorCategory(errorMessage: string): ErrorCategory {
		const lowerError = errorMessage.toLowerCase();
		
		if (lowerError.includes('password')) return 'password';
		if (lowerError.includes('scanned') || lowerError.includes('image')) return 'scanned';
		if (lowerError.includes('corrupted') || lowerError.includes('damaged')) return 'corrupted';
		if (lowerError.includes('empty') || lowerError.includes('no text')) return 'empty';
		if (lowerError.includes('large') || lowerError.includes('size')) return 'large';
		if (lowerError.includes('timeout')) return 'timeout';
		
		return 'empty'; // Default category
	}

	function handleRetry() {
		dispatch('retry');
	}

	function handleUploadNew() {
		dispatch('uploadNew');
	}

	$: errorCategory = getErrorCategory(error);
	$: categoryInfo = errorCategories[errorCategory];
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="p-6 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center space-x-3">
					<svelte:component this={categoryInfo.icon} class="w-6 h-6 text-red-500" />
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
						{categoryInfo.title}
					</h3>
				</div>
				<p class="mt-2 text-gray-600 dark:text-gray-300">
					{categoryInfo.description}
				</p>
			</div>

			<!-- File Info -->
			{#if file}
				<div class="p-4 bg-gray-50 dark:bg-gray-700">
					<div class="flex items-center space-x-3">
						<FileText class="w-5 h-5 text-gray-500" />
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{file.name}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{Math.round(file.size / 1024)}KB • {file.type}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Solutions -->
			<div class="p-6">
				<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
					Suggested Solutions:
				</h4>
				<ul class="space-y-2">
					{#each categoryInfo.solutions as solution, index}
						<li class="flex items-start space-x-2">
							<span class="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
								{index + 1}
							</span>
							<p class="text-sm text-gray-600 dark:text-gray-300">
								{solution}
							</p>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Actions -->
			<div class="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
				<button
					on:click={handleRetry}
					class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
				>
					<RefreshCw class="w-4 h-4 mr-2" />
					Try Again
				</button>
				<button
					on:click={handleUploadNew}
					class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
				>
					<Download class="w-4 h-4 mr-2" />
					Upload New File
				</button>
			</div>
		</div>
	</div>
{/if} 