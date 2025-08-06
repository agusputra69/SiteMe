<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase, getValidSession, handleAuthError } from '$lib/supabase';
	import {
		extractTextFromPDF,
		validatePDFFile,
		isPDFLikelyResume,
		detectPDFIssues
	} from '$lib/pdf';
	import { extractTextFromPDFSimple, validatePDFFileSimple } from '$lib/pdf-simple';
	import { extractResumeData, type ResumeData } from '$lib/ai';
	import { extractBasicResumeData, convertToResumeData } from '$lib/pdf-processor';
	import { toasts } from '$lib/stores/toast';
	import {
		Upload,
		FileText,
		Edit3,
		ArrowLeft,
		Sparkles,
		Zap,
		Clock,
		AlertTriangle
	} from 'lucide-svelte';
	import PDFProcessingModal from '../../../components/PDFProcessingModal.svelte';
	import PDFErrorHandler from '../../../components/PDFErrorHandler.svelte';
	import PDFSuccessModal from '../../../components/PDFSuccessModal.svelte';
	import RateLimitModal from '../../../components/RateLimitModal.svelte';

	let user: any = null;
	let uploading = false;
	let processing = false;
	let errorMessage = '';
	let currentFile: File | null = null;
	let showPDFProcessing = false;
	let processingStep: 'uploading' | 'extracting' | 'processing' | 'saving' = 'uploading';
	let processingProgress = 0;
	let processingError = '';
	let processingUsedFallback = false;
	let showPDFError = false;
	let pdfError = '';
	let showPDFSuccess = false;
	let extractedData: any = null;
	let processedFileName = '';
	let showRateLimitModal = false;
	let rateLimitRetryAfter = 60;
	let rateLimitMessage = '';
	let useAIProcessing = true;
	let showProcessingModeSelection = false;

	onMount(async () => {
		try {
			const { session, error } = await getValidSession();
			if (error || !session) {
				goto('/login');
				return;
			}
			user = session.user;

			// Check site limit
			await checkSiteLimit();
		} catch (error) {
			errorMessage = 'Authentication error. Please try again.';
			await handleAuthError(error);
			goto('/login');
			return;
		}
	});

	async function checkSiteLimit() {
		if (!user) return;

		const { data, error } = await supabase.from('sites').select('id').eq('user_id', user.id);

		if (error) {
			console.error('Error checking site limit:', error);
			return;
		}

		if (data && data.length >= 3) {
			toasts.error(
				'You have reached the maximum limit of 3 websites. Please delete unnecessary websites first.'
			);
			goto('/dashboard/sites');
			return;
		}
	}

	function handleManualCreate() {
		goto('/dashboard/editor/new?mode=manual');
	}

	function handlePDFUpload() {
		showProcessingModeSelection = true;
	}

	function selectProcessingMode(mode: 'ai' | 'basic') {
		useAIProcessing = mode === 'ai';
		showProcessingModeSelection = false;

		// Trigger file input
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.pdf';
		fileInput.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				handleFileUpload({ target: { files: [file] } } as any);
			}
		};
		fileInput.click();
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		currentFile = file;

		// Validate file
		const validation = useAIProcessing ? validatePDFFile(file) : validatePDFFileSimple(file);
		if (!validation.isValid) {
			pdfError = validation.error || 'Invalid PDF file';
			showPDFError = true;
			return;
		}

		// Start processing
		uploading = true;
		showPDFProcessing = true;
		processingStep = 'uploading';
		processingProgress = 10;
		processingError = '';
		processingUsedFallback = false;

		try {
			await processFile(file);
		} catch (error) {
			console.error('File processing error:', error);
			processingError = error instanceof Error ? error.message : 'Unknown error occurred';
			showPDFProcessing = false;
			uploading = false;
			processing = false;
		}
	}

	async function processFile(file: File) {
		try {
			processingStep = 'extracting';
			processingProgress = 30;

			let extractedText: string;

			if (useAIProcessing) {
				extractedText = await extractTextFromPDF(file);

				// Check if PDF is likely a resume
				if (!isPDFLikelyResume(extractedText)) {
					const issues = detectPDFIssues(extractedText);
					throw new Error(`PDF doesn't appear to be a resume. Issues: ${issues.join(', ')}`);
				}
			} else {
				extractedText = await extractTextFromPDFSimple(file);
			}

			processingStep = 'processing';
			processingProgress = 60;
			processing = true;
			uploading = false;

			let resumeData: ResumeData;

			if (useAIProcessing) {
				try {
					resumeData = await extractResumeData(extractedText);
				} catch (error: any) {
					if (error.message?.includes('rate limit') || error.message?.includes('429')) {
						// Handle rate limit
						const retryAfter = error.retryAfter || 60;
						rateLimitRetryAfter = retryAfter;
						rateLimitMessage = error.message || 'Rate limit exceeded. Please try again later.';
						showRateLimitModal = true;
						showPDFProcessing = false;
						processing = false;
						return;
					}

					// Enhanced fallback mechanism for AI processing failures
					console.warn('AI processing failed, trying enhanced fallback mechanisms:', error);

					// First try: Basic processing with PDF extraction
					try {
						console.log('Attempting basic processing fallback...');
						processingUsedFallback = true;
						const basicData = extractBasicResumeData(extractedText);
						resumeData = convertToResumeData(basicData);
					} catch (basicError) {
						console.error('Basic processing fallback failed:', basicError);

						// Second try: Simple fallback with minimal extraction
						try {
							console.log('Attempting simple fallback mechanism...');
							const { createFallbackResumeData } = await import('$lib/ai');
							resumeData = createFallbackResumeData(extractedText);
							processingUsedFallback = true;
						} catch (fallbackError) {
							console.error('All fallback mechanisms failed:', fallbackError);
							throw new Error('Failed to process resume: ' + (error.message || 'Unknown AI error'));
						}
					}
				}
			} else {
				const basicData = extractBasicResumeData(extractedText);
				resumeData = convertToResumeData(basicData);
			}

			processingStep = 'saving';
			processingProgress = 90;

			// Create new site with extracted data
			const siteName = resumeData.name ? `${resumeData.name}'s Site` : 'My New Site';

			const { data: newSite, error: siteError } = await supabase
				.from('sites')
				.insert({
					user_id: user.id,
					name: siteName,
					data: resumeData,
					template: 'modern',
					status: 'draft'
				})
				.select()
				.single();

			if (siteError) {
				throw new Error(`Failed to create site: ${siteError.message}`);
			}

			processingProgress = 100;
			extractedData = resumeData;
			processedFileName = file.name;

			// Use requestAnimationFrame for better performance
			requestAnimationFrame(() => {
				showPDFProcessing = false;
				showPDFSuccess = true;
				processing = false;
			});
		} catch (error) {
			console.error('Processing error:', error);
			processingError = error instanceof Error ? error.message : 'Unknown error occurred';
			showPDFProcessing = false;
			processing = false;
			uploading = false;
		}
	}

	function handlePDFSuccessEdit() {
		showPDFSuccess = false;
		// Navigate to editor with the newly created site
		// We'll need to get the site ID from the creation process
		goto('/dashboard/sites');
	}

	function handlePDFSuccessConfirm() {
		showPDFSuccess = false;
		goto('/dashboard');
	}

	function handlePDFSuccessClose() {
		showPDFSuccess = false;
		goto('/dashboard');
	}

	function handlePDFErrorRetry() {
		showPDFError = false;
		if (currentFile) {
			handleFileUpload({ target: { files: [currentFile] } } as any);
		}
	}

	function handlePDFErrorUploadNew() {
		showPDFError = false;
		currentFile = null;
	}

	function handlePDFProcessingCancel() {
		showPDFProcessing = false;
		uploading = false;
		processing = false;
		currentFile = null;
	}

	function handleRateLimitRetry() {
		showRateLimitModal = false;
		if (currentFile) {
			handleFileUpload({ target: { files: [currentFile] } } as any);
		}
	}
</script>

<svelte:head>
	<title>Create New Website - SiteMe</title>
	<meta name="description" content="Create a new professional website with SiteMe" />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="flex items-center space-x-4 mb-8">
			<button
				on:click={() => goto('/dashboard')}
				class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
					Create New Website
				</h1>
				<p class="text-gray-600 dark:text-gray-300">
					Choose how to create your professional website
				</p>
			</div>
		</div>

		<!-- Creation Options -->
		<div class="max-w-4xl mx-auto">
			<div class="grid md:grid-cols-2 gap-8">
				<!-- Upload PDF Option -->
				<div
					class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-xl transition-all duration-300"
				>
					<div class="text-center">
						<div
							class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
						>
							<Upload class="w-8 h-8 text-white" />
						</div>
						<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Resume PDF</h3>
						<p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
							Upload your resume PDF and let AI automatically extract information to create the
							perfect website.
						</p>

						<button
							on:click={handlePDFUpload}
							disabled={uploading || processing}
							class="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
						>
							{#if uploading || processing}
								<div
									class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"
								/>
								{uploading ? 'Mengupload...' : 'Memproses...'}
							{:else}
								<FileText class="w-5 h-5 mr-3" />
								Choose PDF File
							{/if}
						</button>
					</div>
				</div>

				<!-- Manual Creation Option -->
				<div
					class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-xl transition-all duration-300"
				>
					<div class="text-center">
						<div
							class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
						>
							<Edit3 class="w-8 h-8 text-white" />
						</div>
						<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Manually</h3>
						<p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
							Start from an empty template and fill in your information manually for full control
							over website content.
						</p>

						<button
							on:click={handleManualCreate}
							class="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
						>
							<Edit3 class="w-5 h-5 mr-3" />
							Start from Scratch
						</button>
					</div>
				</div>
			</div>

			<!-- Tips Section -->
			<div
				class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6"
			>
				<h4 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
					💡 Tips for best results:
				</h4>
				<div class="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
					<ul class="space-y-2">
						<li class="flex items-start">
							<span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
							Use a well-formatted PDF resume
						</li>
						<li class="flex items-start">
							<span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
							Ensure text is clearly readable
						</li>
					</ul>
					<ul class="space-y-2">
						<li class="flex items-start">
							<span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
							Include all important sections (experience, education, skills)
						</li>
						<li class="flex items-start">
							<span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
							You can edit the extraction results later
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Processing Mode Selection Modal -->
{#if showProcessingModeSelection}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
			<div class="p-6">
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Choose Processing Mode</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-6">
					Choose how you want to process your PDF resume:
				</p>

				<div class="space-y-3">
					<button
						on:click={() => selectProcessingMode('ai')}
						class="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-left"
					>
						<div class="flex items-center">
							<Sparkles class="w-5 h-5 mr-3" />
							<div>
								<div class="font-semibold">AI Processing (Direkomendasikan)</div>
								<div class="text-sm opacity-90">
									Automatic extraction with AI - more accurate results
								</div>
							</div>
						</div>
					</button>

					<button
						on:click={() => selectProcessingMode('basic')}
						class="w-full p-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 text-left"
					>
						<div class="flex items-center">
							<Zap class="w-5 h-5 mr-3" />
							<div>
								<div class="font-semibold">Basic Processing</div>
								<div class="text-sm opacity-90">Simple extraction without AI - faster</div>
							</div>
						</div>
					</button>
				</div>

				<div
					class="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg"
				>
					<div class="flex items-start">
						<AlertTriangle
							class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
						/>
						<p class="text-sm text-yellow-800 dark:text-yellow-200">
							<strong>Note:</strong> AI processing has daily limitations due to resource constraints.
							If it fails, the system will automatically use basic processing.
						</p>
					</div>
				</div>

				<button
					on:click={() => (showProcessingModeSelection = false)}
					class="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modals -->
<PDFProcessingModal
	show={showPDFProcessing}
	fileName={currentFile?.name || ''}
	currentStep={processingStep}
	progress={processingProgress}
	error={processingError}
	usedFallback={processingUsedFallback}
	processingMode={useAIProcessing ? 'ai' : 'basic'}
	on:cancel={handlePDFProcessingCancel}
/>

<PDFErrorHandler
	show={showPDFError}
	error={pdfError}
	file={currentFile}
	on:retry={handlePDFErrorRetry}
	on:uploadNew={handlePDFErrorUploadNew}
/>

<PDFSuccessModal
	show={showPDFSuccess}
	{extractedData}
	fileName={processedFileName}
	on:edit={handlePDFSuccessEdit}
	on:proceed={handlePDFSuccessConfirm}
	on:close={handlePDFSuccessClose}
/>

<RateLimitModal
	show={showRateLimitModal}
	retryAfter={rateLimitRetryAfter}
	message={rateLimitMessage}
	on:retry={handleRateLimitRetry}
	on:close={() => (showRateLimitModal = false)}
/>
