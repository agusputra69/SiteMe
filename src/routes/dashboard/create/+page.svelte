<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase, getValidSession, handleAuthError } from '$lib/supabase';
  import { extractTextFromPDF, validatePDFFile, isPDFLikelyResume, detectPDFIssues } from '$lib/pdf';
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
      console.error('Create auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    }
  });

  async function checkSiteLimit() {
    if (!user) return;

    const { data, error } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking site limit:', error);
      return;
    }

    if (data && data.length >= 3) {
      toasts.error('Anda sudah mencapai batas maksimal 3 website. Hapus website yang tidak diperlukan terlebih dahulu.');
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
          
          // Fallback to basic processing
          console.warn('AI processing failed, falling back to basic extraction:', error);
          processingUsedFallback = true;
          const basicData = extractBasicResumeData(extractedText);
          resumeData = convertToResumeData(basicData);
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
      
      setTimeout(() => {
        showPDFProcessing = false;
        showPDFSuccess = true;
        processing = false;
      }, 500);
      
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

  function handlePDFSuccessProceed() {
    showPDFSuccess = false;
    goto('/dashboard/sites');
  }

  function handlePDFSuccessClose() {
    showPDFSuccess = false;
    goto('/dashboard/sites');
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
  <title>Buat Website Baru - SiteMe</title>
  <meta name="description" content="Buat website profesional baru dengan SiteMe" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          Buat Website Baru
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Pilih cara untuk membuat website profesional Anda
        </p>
      </div>
    </div>

    <!-- Creation Options -->
    <div class="max-w-4xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Upload PDF Option -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-xl transition-all duration-300">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Resume PDF
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Upload resume PDF Anda dan biarkan AI mengekstrak informasi secara otomatis untuk membuat website yang sempurna.
            </p>
            
            <button
              on:click={handlePDFUpload}
              disabled={uploading || processing}
              class="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {#if uploading || processing}
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                {uploading ? 'Mengupload...' : 'Memproses...'}
              {:else}
                <FileText class="w-5 h-5 mr-3" />
                Pilih File PDF
              {/if}
            </button>
          </div>
        </div>

        <!-- Manual Creation Option -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-xl transition-all duration-300">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Edit3 class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Buat Manual
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Mulai dari template kosong dan isi informasi Anda secara manual untuk kontrol penuh atas konten website.
            </p>
            
            <button
              on:click={handleManualCreate}
              class="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit3 class="w-5 h-5 mr-3" />
              Mulai dari Kosong
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <h4 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          💡 Tips untuk hasil terbaik:
        </h4>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <ul class="space-y-2">
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Gunakan PDF resume yang terformat dengan baik
            </li>
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Pastikan teks dapat dibaca dengan jelas
            </li>
          </ul>
          <ul class="space-y-2">
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Sertakan semua bagian penting (pengalaman, pendidikan, skills)
            </li>
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Anda dapat mengedit hasil ekstraksi nanti
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
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Pilih Mode Pemrosesan
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Pilih bagaimana Anda ingin memproses resume PDF Anda:
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
                <div class="text-sm opacity-90">Ekstraksi otomatis dengan AI - hasil lebih akurat</div>
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
                <div class="text-sm opacity-90">Ekstraksi sederhana tanpa AI - lebih cepat</div>
              </div>
            </div>
          </button>
        </div>
        
        <div class="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div class="flex items-start">
            <AlertTriangle class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Catatan:</strong> AI processing memiliki limitasi harian karena keterbatasan resource. Jika gagal, sistem akan otomatis menggunakan basic processing.
            </p>
          </div>
        </div>
        
        <button
          on:click={() => showProcessingModeSelection = false}
          class="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          Batal
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
  extractedData={extractedData}
  fileName={processedFileName}
  on:edit={handlePDFSuccessEdit}
  on:proceed={handlePDFSuccessProceed}
  on:close={handlePDFSuccessClose}
/>

<RateLimitModal
  show={showRateLimitModal}
  retryAfter={rateLimitRetryAfter}
  message={rateLimitMessage}
  on:retry={handleRateLimitRetry}
  on:close={() => showRateLimitModal = false}
/>