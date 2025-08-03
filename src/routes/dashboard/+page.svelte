<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, getProfile, updateProfile, handleAuthError, getValidSession } from '$lib/supabase';
  import { extractTextFromPDF, validatePDFFile, isPDFLikelyResume, detectPDFIssues } from '$lib/pdf';
  import { extractTextFromPDFSimple, validatePDFFileSimple } from '$lib/pdf-simple';
  import { extractResumeData, type ResumeData } from '$lib/ai';
  import { extractBasicResumeData, convertToResumeData } from '$lib/pdf-processor';
  import { goto } from '$app/navigation';

  import OnboardingTour from '../../components/OnboardingTour.svelte';
  import InteractiveTutorial from '../../components/InteractiveTutorial.svelte';
  import ProfileEditor from '../../components/ProfileEditor.svelte';
  import ProcessingModelSelector from '../../components/ProcessingModelSelector.svelte';
  import { toasts } from '$lib/stores/toast';
  import { 
    Upload, 
    FileText, 
    User, 
    Settings, 
    LogOut, 
    Sparkles, 
    Edit3, 
    Eye,
    Copy,
    Check,
    Globe,
    Calendar,
    MoreVertical,
    Trash2,
    ExternalLink
  } from 'lucide-svelte';
  import ConfirmDialog from '../../components/ConfirmDialog.svelte';
  import PDFErrorHandler from '../../components/PDFErrorHandler.svelte';
  import PDFSuccessModal from '../../components/PDFSuccessModal.svelte';
  import PDFProcessingModal from '../../components/PDFProcessingModal.svelte';
  import RateLimitModal from '../../components/RateLimitModal.svelte';

  let user: any = null;
  let profile: any = null;
  let loading = false;
  let uploading = false;
  let processing = false;
  let errorMessage = '';
  let successMessage = '';
  let resumeData: ResumeData | null = null;
  let copied = false;
  let showOnboarding = false;
  let showTutorial = true;
  let tutorialContext: 'dashboard' | 'upload' | 'edit' | 'preview' = 'dashboard';
  let showDeleteConfirm = false;
  let showProfileEditor = false;
  let showPDFError = false;
  let pdfError = '';
  let currentFile: File | null = null;
  let showPDFSuccess = false;
  let extractedData: any = null;
  let processedFileName = '';
  let showPDFProcessing = false;
  let processingStep: 'uploading' | 'extracting' | 'processing' | 'saving' = 'uploading';
  let processingProgress = 0;
  let processingError = '';
  let processingUsedFallback = false;
  let profileStatus: 'draft' | 'published' = 'draft';
  let showRateLimitModal = false;
  let rateLimitRetryAfter = 60;
  let rateLimitMessage = '';
  let useAIProcessing = true; // Toggle for AI vs basic processing
  let sites: Array<{id: string, name: string, status: 'draft' | 'published', updated_at: string, template: string, is_primary: boolean, data: any}> = [];
  let siteToDelete: any = null;
  let showProcessingModelSelector = false;
  let pendingFile: File | null = null;

  onMount(async () => {
    // Check authentication
    try {
      const { session, error } = await getValidSession();
      if (error || !session) {
        goto('/login');
        return;
      }

      user = session.user;
      await loadProfile();
      await loadSites();
    } catch (error) {
      console.error('Dashboard auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    }
    
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('siteme-onboarding-completed');
    if (!hasSeenOnboarding && (!profile?.data || Object.keys(profile.data).length === 0)) {
      showOnboarding = true;
    }
  });

  // Monitor processing state to prevent loops
  $: if (showPDFProcessing && !uploading && !processing) {
    console.warn('Processing modal is showing but no processing is active - forcing close');
    setTimeout(() => {
      if (showPDFProcessing && !uploading && !processing) {
        forceCloseProcessingModal();
      }
    }, 5000); // Wait 5 seconds before forcing close
  }

  async function loadProfile() {
    if (!user) return;

    const { data, error } = await getProfile(user.id);
    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    profile = data;
    if (profile?.data) {
      resumeData = profile.data;
    } else {
      // Initialize with default structure if no profile data exists
      resumeData = {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: [],
        education: [],
        certifications: [],
        languages: [],
        projects: [],
        awards: [],
        skills: [],
        links: []
      };
    }
  }

  async function loadSites() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading sites:', error);
        toasts.error('Failed to load sites');
        return;
      }

      sites = data || [];
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  }

  async function publishSite(siteId: string) {
    try {
      // First, unpublish any other published sites
      await supabase
        .from('sites')
        .update({ status: 'draft', is_primary: false })
        .eq('user_id', user.id)
        .eq('status', 'published');

      // Then publish this site
      const { error } = await supabase
        .from('sites')
        .update({ 
          status: 'published',
          is_primary: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error publishing site:', error);
        toasts.error('Failed to publish site');
        return;
      }

      toasts.success('Site published successfully!');
      await loadSites(); // Refresh the list
    } catch (error) {
      console.error('Error publishing site:', error);
      toasts.error('Failed to publish site');
    }
  }

  async function duplicateSite(siteId: string) {
    try {
      const originalSite = sites.find((site: any) => site.id === siteId);
      if (originalSite) {
        const { data: newSite, error } = await supabase
          .from('sites')
          .insert({
            user_id: user.id,
            name: `${originalSite.name} (Copy)`,
            data: originalSite.data,
            template: originalSite.template,
            status: 'draft'
          })
          .select()
          .single();

        if (error) {
          console.error('Error duplicating site:', error);
          toasts.error('Failed to duplicate site');
          return;
        }
        
        await loadSites();
        toasts.success('Site duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating site:', error);
      toasts.error('Failed to duplicate site');
    }
  }

  async function deleteSite(siteId: string) {
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting site:', error);
        toasts.error('Failed to delete site');
        return;
      }

      toasts.success('Site deleted successfully!');
      await loadSites(); // Refresh the list
      showDeleteConfirm = false;
      siteToDelete = null;
    } catch (error) {
      console.error('Error deleting site:', error);
      toasts.error('Failed to delete site');
    }
  }

  function handleDeleteClick(site: any) {
    siteToDelete = site;
    showDeleteConfirm = true;
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    // Check if user is authenticated before processing
    if (!user || !user.id) {
      toasts.error('Please log in to upload a resume.');
      goto('/login');
      return;
    }

    // Enhanced validation with detailed error messages
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      toasts.error(validation.error || 'Invalid PDF file');
      return;
    }

    // Show warnings if any
    if (validation.warnings) {
      validation.warnings.forEach(warning => {
        toasts.warning(warning);
      });
    }

    // Store file and show model selector
    pendingFile = file;
    showProcessingModelSelector = true;
  }

  function handleModelSelection(event: CustomEvent<{useAI: boolean}>) {
    const { useAI } = event.detail;
    useAIProcessing = useAI;
    showProcessingModelSelector = false;
    
    if (pendingFile) {
      processFile(pendingFile);
    }
  }

  function handleModelSelectorClose() {
    showProcessingModelSelector = false;
    pendingFile = null;
  }

  async function processFile(file: File) {
    // Show processing modal
    showPDFProcessing = true;
    processingStep = 'uploading';
    processingProgress = 10;
    processingError = '';
    processingUsedFallback = false;
    tutorialContext = 'upload';

    // Set a maximum processing time to prevent infinite loops
    const processingTimeout = setTimeout(() => {
      if (showPDFProcessing) {
        console.error('Processing timeout - forcing modal close');
        showPDFProcessing = false;
        toasts.error('Processing took too long. Please try again.');
      }
    }, 120000); // 2 minutes timeout

    try {
      console.log('Starting PDF processing...');
      
      // Check if PDF.js is available
      if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
        console.warn('PDF.js library not found in window object');
      }
      
      // Update progress for extraction step
      processingStep = 'extracting';
      processingProgress = 30;
      
      // Extract text from PDF with enhanced error handling
      let text: string;
      let usedFallback = false;
      
      console.log('Starting PDF extraction process...');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      try {
        console.log('Attempting PDF.js extraction...');
        text = await extractTextFromPDF(file);
        console.log('PDF text extracted with PDF.js, length:', text.length);
        console.log('Text preview:', text.substring(0, 200) + '...');
      } catch (pdfError) {
        console.warn('PDF.js failed, using simple extraction:', pdfError);
        console.error('PDF.js error details:', {
          message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
          stack: pdfError instanceof Error ? pdfError.stack : undefined
        });
        usedFallback = true;
        processingUsedFallback = true;
        
        // Validate file for simple extraction
        const simpleValidation = validatePDFFileSimple(file);
        if (!simpleValidation.isValid) {
          throw new Error(simpleValidation.error || 'File validation failed for fallback extraction');
        }
        
        console.log('Attempting simple extraction...');
        text = await extractTextFromPDFSimple(file);
        console.log('PDF text extracted with simple method, length:', text.length);
        console.log('Fallback text preview:', text.substring(0, 200) + '...');
      }
      
      // Validate extracted text
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF. Please ensure the document contains text and is not password-protected.');
      }
      
      // Check if text is likely a resume
      if (!isPDFLikelyResume(text)) {
        toasts.warning('The document may not be a resume. Processing will continue but results may be limited.');
      }
      
      // Detect potential issues
      const issues = detectPDFIssues(text);
      if (issues.length > 0) {
        issues.forEach(issue => {
          toasts.warning(issue);
        });
      }
      
      // Show fallback warning
      if (usedFallback) {
        toasts.warning('Using fallback PDF extraction. Results may be limited. Please ensure your PDF is text-based and not password-protected.');
      }
      
      // Update progress for AI processing step
      processingStep = 'processing';
      processingProgress = 60;
      
      // Process with AI or basic processing
      processing = true;
      console.log('Processing text, length:', text.length);
      console.log('Text preview:', text.substring(0, 200) + '...');
      console.log('Using AI processing:', useAIProcessing);
      
      let extractedData: ResumeData;
      
      if (useAIProcessing) {
        // AI Processing
        console.log('Using AI processing...');
        const aiProcessingPromise = extractResumeData(text);
        const aiTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI processing timeout')), 60000) // 60 seconds timeout
        );
        
        try {
          extractedData = await Promise.race([aiProcessingPromise, aiTimeoutPromise]) as ResumeData;
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          
          // Handle rate limiting specifically
          if (aiError instanceof Error && aiError.message.includes('Rate limit exceeded')) {
            // Extract retry time from error message if available
            const retryMatch = aiError.message.match(/(\d+) seconds/);
            rateLimitRetryAfter = retryMatch ? parseInt(retryMatch[1]) : 60;
            rateLimitMessage = aiError.message;
            showRateLimitModal = true;
            showPDFProcessing = false;
            throw new Error('AI service rate limit exceeded. Please wait before trying again.');
          }
          
          if (aiError instanceof Error && aiError.message.includes('timeout')) {
            toasts.error('AI processing took too long. Please try again.');
            throw new Error('AI processing timeout. Please try again.');
          }
          
          // If AI fails and we're using AI processing, try basic processing as fallback
          if (useAIProcessing) {
            console.log('AI processing failed, trying basic processing as fallback...');
            try {
              const basicData = extractBasicResumeData(text);
              extractedData = convertToResumeData(basicData);
              processingUsedFallback = true;
              toasts.warning('AI processing failed. Using basic processing instead. Results may be limited.');
            } catch (basicError) {
              console.error('Basic processing fallback also failed:', basicError);
              throw aiError; // Throw the original AI error
            }
          } else {
            throw aiError;
          }
        }
      } else {
        // Basic Processing (no AI)
        console.log('Using basic processing...');
        try {
          const basicData = extractBasicResumeData(text);
          extractedData = convertToResumeData(basicData);
          processingUsedFallback = true;
          toasts.info('Using basic processing (no AI). Results may be limited.');
        } catch (basicError) {
          console.error('Basic processing error:', basicError);
          throw new Error('Failed to process resume with basic extraction.');
        }
      }
      console.log('AI processing completed:', extractedData);
      console.log('Extracted data type:', typeof extractedData);
      console.log('Extracted data keys:', Object.keys(extractedData || {}));
      
      // Validate extracted data
      if (!extractedData || !extractedData.name) {
        throw new Error('Failed to extract meaningful data from the PDF. Please ensure the document is a valid resume.');
      }
      
      // Update progress for saving step
      processingStep = 'saving';
      processingProgress = 80;
      
      console.log('Starting database save...');
      
      // Check if user is available
      if (!user || !user.id) {
        throw new Error('User session not found. Please log in again.');
      }
      
      console.log('User ID:', user.id);
      console.log('Data to save:', extractedData);
      
      try {
        // Save to database with timeout
        const savePromise = updateProfile(user.id, {
          data: extractedData,
          full_name: extractedData.name
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database save timeout')), 30000)
        );
        
        const { error } = await Promise.race([savePromise, timeoutPromise]) as any;

        if (error) {
          console.error('Database error:', error);
          throw new Error('Failed to save profile data: ' + error.message);
        }
        
        console.log('Database save successful, updating local state');
        console.log('Before assignment - resumeData:', resumeData);
        
        // Update local state
        resumeData = extractedData;
        profile = { ...profile, data: extractedData, full_name: extractedData.name };
        
        console.log('After assignment - resumeData:', resumeData);
        console.log('Updated profile:', profile);
        
        // Complete processing
        processingProgress = 100;
        
        // Hide processing modal and show success modal
        showPDFProcessing = false;
        processedFileName = file.name;
        showPDFSuccess = true;
        
        tutorialContext = 'edit';
        showTutorial = false; // Hide tutorial after successful PDF processing
        
        console.log('Processing completed successfully');
        
        // Clear the timeout since processing completed successfully
        clearTimeout(processingTimeout);
        
      } catch (saveError) {
        console.error('Save operation failed:', saveError);
        clearTimeout(processingTimeout);
        throw saveError;
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      
      // Clear the timeout
      clearTimeout(processingTimeout);
      
      // Hide processing modal
      showPDFProcessing = false;
      
      if (error instanceof Error) {
        pdfError = error.message;
        currentFile = file;
        showPDFError = true;
      } else {
        toasts.error('Failed to process resume. Please try again.');
      }
    } finally {
      uploading = false;
      processing = false;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/');
  }

  function copyProfileUrl() {
    if (profile?.username) {
      const url = `${window.location.origin}/u/${profile.username}`;
      navigator.clipboard.writeText(url);
      copied = true;
      toasts.success('Profile URL copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2000);
    } else {
      toasts.warning('Please set a username first to get your profile URL');
    }
  }

  function handlePDFErrorRetry() {
    showPDFError = false;
    if (currentFile) {
      handleFileUpload({ target: { files: [currentFile] } } as any);
    }
  }

  function handlePDFErrorUploadNew() {
    showPDFError = false;
    // Trigger file input click
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  function handlePDFSuccessEdit() {
    showPDFSuccess = false;
    showProfileEditor = true;
  }

  function handlePDFSuccessProceed() {
    showPDFSuccess = false;
    // User can view their profile normally
  }

  function handlePDFSuccessDownload() {
    showPDFSuccess = false;
    // Download the extracted data as JSON
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-resume-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toasts.success('Resume data downloaded successfully!');
  }

  function handlePDFSuccessClose() {
    showPDFSuccess = false;
  }

  function handlePDFProcessingCancel() {
    showPDFProcessing = false;
    uploading = false;
    processing = false;
    toasts.info('PDF processing cancelled');
  }

  // Function to force close processing modal if stuck
  function forceCloseProcessingModal() {
    if (showPDFProcessing) {
      console.warn('Force closing processing modal');
      showPDFProcessing = false;
      uploading = false;
      processing = false;
      toasts.warning('Processing was interrupted. Please try again.');
    }
  }

  // Debug function to test PDF processing
  function testPDFProcessing() {
    console.log('Testing PDF processing...');
    console.log('PDF.js available:', typeof window !== 'undefined' && !!(window as any).pdfjsLib);
    console.log('PDF.js version:', typeof window !== 'undefined' ? (window as any).pdfjsLib?.version : 'Not available');
    console.log('File input available:', !!document.getElementById('resume-upload'));
  }

  function handleOnboardingComplete() {
    showOnboarding = false;
    localStorage.setItem('siteme-onboarding-completed', 'true');
  }

  function handleOnboardingSkip() {
    showOnboarding = false;
    localStorage.setItem('siteme-onboarding-completed', 'true');
  }

  async function uploadProfilePhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Failed to upload profile photo');
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleProfileSave(event: CustomEvent) {
    const { resumeData: newResumeData, profilePhoto, username: newUsername } = event.detail;
    
    try {
      uploading = true;
      
      // Handle profile photo upload if provided
      if (profilePhoto) {
        const photoUrl = await uploadProfilePhoto(profilePhoto);
        newResumeData.photo_url = photoUrl;
      }
      
      // Update profile in database
      const { error } = await updateProfile(user.id, {
        data: newResumeData,
        full_name: newResumeData.name || '',
        username: newUsername
      });
      
      if (error) {
        toasts.error('Failed to save profile: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      
      // Update local state
      resumeData = newResumeData;
      profile = { ...profile, data: newResumeData, full_name: newResumeData.name, username: newUsername };
      profileStatus = 'draft'; // Default to draft when saving
      
      // Close the profile editor modal
      showProfileEditor = false;
      
      toasts.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toasts.error('Failed to save profile');
    } finally {
      uploading = false;
    }
  }

  // Handle manual resume creation
  function handleManualCreate(event: CustomEvent) {
    const { resumeData: newResumeData } = event.detail;
    resumeData = newResumeData;
    toasts.success('Manual resume template created! Start filling in your information.');
  }

  // Handle profile publishing
  async function handleProfilePublish(event: CustomEvent) {
    const { resumeData: newResumeData, profilePhoto } = event.detail;
    
    try {
      uploading = true;
      
      // Handle profile photo upload if provided
      if (profilePhoto) {
        const photoUrl = await uploadProfilePhoto(profilePhoto);
        newResumeData.photo_url = photoUrl;
      }
      
      // Update profile in database
      const { error } = await updateProfile(user.id, {
        data: newResumeData,
        full_name: newResumeData.name || ''
      });
      
      if (error) {
        toasts.error('Failed to publish profile: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      
      // Update local state
      resumeData = newResumeData;
      profile = { ...profile, data: newResumeData, full_name: newResumeData.name || '' };
      profileStatus = 'published';
      
      toasts.success('Profile published successfully!');
    } catch (error) {
      console.error('Error publishing profile:', error);
      toasts.error('Failed to publish profile');
    } finally {
      uploading = false;
    }
  }

  // Handle profile status changes
  async function handleProfileStatusChange(event: CustomEvent) {
    const { resumeData: newResumeData, profilePhoto } = event.detail;
    
    try {
      uploading = true;
      
      // Handle profile photo upload if provided
      if (profilePhoto) {
        const photoUrl = await uploadProfilePhoto(profilePhoto);
        newResumeData.photo_url = photoUrl;
      }
      
      // Update profile in database
      const { error } = await updateProfile(user.id, {
        data: newResumeData,
        full_name: newResumeData.name || ''
      });
      
      if (error) {
        toasts.error('Failed to update profile status: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      
      // Update local state
      resumeData = newResumeData;
      profile = { ...profile, data: newResumeData, full_name: newResumeData.name || '' };
      profileStatus = 'published'; // Default to published for this action
      
      toasts.success('Profile published successfully!');
    } catch (error) {
      console.error('Error updating profile status:', error);
      toasts.error('Failed to update profile status');
    } finally {
      uploading = false;
    }
  }

  // Handle template application
  function handleTemplateApply(event: CustomEvent) {
    const { template, theme, customization } = event.detail;
    if (resumeData) {
      resumeData = { ...resumeData, template, theme, customization };
      toasts.success('Template applied successfully!');
    }
  }

  // Handle theme application
  function handleThemeApply(event: CustomEvent) {
    const { template, theme, customization } = event.detail;
    if (resumeData) {
      resumeData = { ...resumeData, template, theme, customization };
      toasts.success('Theme applied successfully!');
    }
  }

  // Handle customization application
  function handleCustomizationApply(event: CustomEvent) {
    const { template, theme, customization } = event.detail;
    if (resumeData) {
      resumeData = { ...resumeData, template, theme, customization };
      toasts.success('Customization applied successfully!');
    }
  }

  // Handle preview toggle
  function handleTogglePreview(event: CustomEvent) {
    const { showPreview } = event.detail;
    // This is handled internally by the ProfileEditor component
    console.log('Preview toggled:', showPreview);
  }

  // Handle photo upload
  async function handlePhotoUpload(event: CustomEvent) {
    const { file } = event.detail;
    try {
      const photoUrl = await uploadProfilePhoto(file);
      if (resumeData) {
        resumeData = { ...resumeData, photo_url: photoUrl };
      }
      toasts.success('Profile photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toasts.error('Failed to upload profile photo');
    }
  }

  // Handle rate limit retry
  function handleRateLimitRetry() {
    showRateLimitModal = false;
    // Retry the last file upload
    if (currentFile) {
      handleFileUpload({ target: { files: [currentFile] } } as any);
    }
  }

  async function handleDeleteData() {
    console.log('Delete button clicked');
    console.log('Current user:', user);
    console.log('Current profile:', profile);
    console.log('Current resumeData:', resumeData);
    
    // Check if user is authenticated
    if (!user || !user.id) {
      toasts.error('❌ User not authenticated. Please log in again.');
      return;
    }
    
    // Check Supabase connection
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (!session) {
        toasts.error('❌ Session expired. Please log in again.');
        goto('/login');
        return;
      }
    } catch (sessionError) {
      console.error('Session check failed:', sessionError);
      toasts.error('❌ Connection error. Please check your internet connection.');
      return;
    }
    
    // Show confirmation dialog
    showDeleteConfirm = true;
  }

  async function confirmDeleteData() {
    showDeleteConfirm = false;

    loading = true;
    console.log('Starting deletion process...');
    toasts.info('Deleting all profile data...');

    try {
      console.log('Starting data deletion for user:', user.id);
      console.log('Profile before deletion:', profile);
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (testError && testError.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Supabase connection test passed');
      
      // Clear profile data in database using direct Supabase call
      console.log('Updating profile with null data...');
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          data: null, 
          full_name: null 
        })
        .select()
        .single();
      
      console.log('Direct Supabase update result:', { data: updateData, error: updateError });
      
      if (updateError) {
        console.error('Database deletion error:', updateError);
        throw new Error(`Failed to update database: ${updateError.message}`);
      }

      console.log('Database cleared successfully, updated profile:', updateData);

      // Reset local state
      const emptyResumeData = {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: [],
        education: [],
        certifications: [],
        languages: [],
        projects: [],
        awards: [],
        skills: [],
        links: []
      };
      
      resumeData = emptyResumeData;
      profile = { ...profile, data: null, full_name: null };
      
      console.log('Local state reset successfully');
      console.log('New resumeData:', resumeData);
      console.log('New profile:', profile);
      
      toasts.success('✅ All profile data deleted successfully! You can now start fresh.');
      
      // Force a page refresh to ensure clean state
      setTimeout(() => {
        console.log('Refreshing page...');
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting profile data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toasts.error(`❌ Failed to delete profile data: ${errorMessage}`);
    } finally {
      loading = false;
      console.log('Delete process completed, loading set to false');
    }
  }
</script>

<div class="container mx-auto px-4 py-6">
  <!-- Welcome Section -->
  <div class="mb-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome back, {resumeData?.name || user?.email?.split('@')[0] || 'there'}! 👋
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {profile?.username ? `Your site is live at siteme.app/u/${profile.username}` : 'Create your professional website in minutes'}
      </p>
      {#if profile?.username}
        <div class="mt-4">
          <a 
            href="/u/{profile.username}" 
            target="_blank"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Eye class="w-5 h-5 mr-2" />
            View Live Site
          </a>
        </div>
      {/if}
    </div>
  </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Quick Actions -->
      <div class="xl:col-span-2 space-y-6">
        <!-- Getting Started Section -->
        <div id="upload" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Website
            </h3>
            <p class="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Choose how to create your professional website
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Manual Creation -->
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <div class="space-y-4">
                <div class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Edit3 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Build from Scratch
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Start with an empty template and fill in data manually
                  </p>
                  <button
                    on:click={() => goto('/dashboard/editor/new?mode=manual')}
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 class="w-4 h-4 mr-2" />
                    Start Manual
                  </button>
                </div>
              </div>
            </div>
            
            <!-- PDF Upload -->
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors">
              <div class="space-y-4">
                <div class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Upload class="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Resume PDF
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Upload your PDF resume and choose processing mode
                  </p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    on:change={handleFileUpload}
                    class="hidden"
                  />
                  <button
                    on:click={() => document.getElementById('resume-upload')?.click()}
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
          <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
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

          {#if errorMessage}
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p class="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
            </div>
          {/if}

          {#if successMessage}
            <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p class="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
            </div>
          {/if}


        </div>

        <!-- Profile Summary Card - Only show when user has data -->
        {#if !showTutorial && resumeData && (resumeData.name || resumeData.email || resumeData.experience?.length > 0 || resumeData.education?.length > 0 || resumeData.skills?.length > 0)}
          <div id="profile" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6" data-tour="profile-editor">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <User class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    Profile Overview
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Manage your professional information
                  </p>
                </div>
              </div>
            </div>

            <!-- Profile Summary -->
            <div class="space-y-4 mb-6">
              <div class="flex items-center space-x-3">
                {#if resumeData.photo_url}
                  <img src="{resumeData.photo_url}" alt="Profile" class="w-12 h-12 rounded-full object-cover" />
                {:else}
                  <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User class="w-6 h-6 text-gray-400" />
                  </div>
                {/if}
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {resumeData.name || 'Your Name'}
                  </h4>
                  {#if resumeData.email}
                    <p class="text-sm text-gray-600 dark:text-gray-300">{resumeData.email}</p>
                  {/if}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Experience:</span>
                  <span class="ml-1 font-medium text-gray-900 dark:text-white">
                    {resumeData.experience?.length || 0} entries
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Education:</span>
                  <span class="ml-1 font-medium text-gray-900 dark:text-white">
                    {resumeData.education?.length || 0} entries
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Skills:</span>
                  <span class="ml-1 font-medium text-gray-900 dark:text-white">
                    {resumeData.skills?.length || 0} skills
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <button
                on:click={() => showProfileEditor = true}
                class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Edit3 class="w-4 h-4 mr-2" />
                Edit Profile
              </button>
              
              {#if profile?.username}
                <button
                  on:click={() => window.open(`/u/${profile.username}`, '_blank')}
                  class="inline-flex items-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <Eye class="w-4 h-4 mr-2" />
                  Preview
                </button>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Draft Sites Section -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  My Sites
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Manage your draft and published sites
                </p>
              </div>
            </div>
            <button
              on:click={() => goto('/dashboard/sites')}
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Globe class="w-4 h-4 mr-2" />
              Manage Sites
            </button>
          </div>

          <!-- Sites List -->
          <div class="space-y-3">
            {#if sites.length === 0}
              <div class="text-center py-8">
                <Globe class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-500 dark:text-gray-400 mb-4">No websites created yet</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mb-4">Maximum 3 websites per account</p>
                <button
                  on:click={() => goto('/dashboard/create')}
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit3 class="w-4 h-4 mr-2" />
                  Create First Website
                </button>
              </div>
            {:else}
              {#each sites as site (site.id)}
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        <h4 class="font-semibold text-gray-900 dark:text-white">
                          {site.name}
                        </h4>
                        {#if site.status === 'published'}
                          <span class="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                            <Globe class="w-3 h-3 mr-1" />
                            Live
                          </span>
                        {:else}
                          <span class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                            Draft
                          </span>
                        {/if}
                      </div>
                      <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span class="flex items-center">
                          <Calendar class="w-3 h-3 mr-1" />
                          {new Date(site.updated_at).toLocaleDateString()}
                        </span>
                        <span class="capitalize">{site.template} template</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      {#if site.status === 'published'}
                        <a
                          href="/u/{profile?.username}"
                          target="_blank"
                          class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink class="w-3 h-3 mr-1" />
                          View
                        </a>
                      {:else}
                        <button
                          on:click={() => publishSite(site.id)}
                          class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Globe class="w-3 h-3 mr-1" />
                          Publish
                        </button>
                      {/if}
                      
                      <button
                        on:click={() => goto(`/dashboard/editor/${site.id}`)}
                        class="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Edit3 class="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      
                      <button
                        on:click={() => handleDeleteClick(site)}
                        class="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 class="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>

          <!-- Info Note -->
          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Only one site can be published at a time. Publishing a new site will unpublish the current one.
            </p>
          </div>
        </div>
      </div>

      <!-- Modern Sidebar -->
      <div class="xl:col-span-1 space-y-6">



      </div>
    </div>

<!-- Profile Editor Modal -->
{#if showProfileEditor && resumeData}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
        <button
          on:click={() => showProfileEditor = false}
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <ProfileEditor 
          {resumeData}
          username={profile?.username || ''}
          uploading={uploading}
          profileStatus={profileStatus}
          saveSuccess={false}
          on:save={handleProfileSave}
          on:manualCreate={handleManualCreate}
          on:publish={handleProfilePublish}
          on:statusChange={handleProfileStatusChange}
          on:templateApply={handleTemplateApply}
          on:themeApply={handleThemeApply}
          on:customizationApply={handleCustomizationApply}
          on:togglePreview={handleTogglePreview}
          on:photoUpload={handlePhotoUpload}
        />
      </div>
    </div>
  </div>
{/if}

<!-- Onboarding Tour -->
{#if showOnboarding}
  <OnboardingTour
    on:complete={handleOnboardingComplete}
    on:skip={handleOnboardingSkip}
  />
{/if}

<!-- Interactive Tutorial -->
{#if showTutorial}
  <InteractiveTutorial
    isVisible={true}
    currentContext={tutorialContext}
  />
{/if}

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete All Profile Data"
  message="⚠️ WARNING: This will permanently delete ALL your profile data including personal information, work experience, education, skills, and all uploaded content. This action cannot be undone."
  confirmText="Delete Everything"
  cancelText="Cancel"
  type="danger"
  on:confirm={confirmDeleteData}
  on:cancel={() => showDeleteConfirm = false}
/>

<!-- PDF Error Handler -->
    <PDFErrorHandler
      show={showPDFError}
      error={pdfError}
      file={currentFile}
      on:retry={handlePDFErrorRetry}
      on:uploadNew={handlePDFErrorUploadNew}
    />

    <PDFSuccessModal
      show={showPDFSuccess}
      extractedData={resumeData}
      fileName={processedFileName}
      on:edit={handlePDFSuccessEdit}
      on:proceed={handlePDFSuccessProceed}
      on:download={handlePDFSuccessDownload}
      on:close={handlePDFSuccessClose}
    />

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

    <RateLimitModal
      show={showRateLimitModal}
      retryAfter={rateLimitRetryAfter}
      message={rateLimitMessage}
      on:retry={handleRateLimitRetry}
      on:close={() => showRateLimitModal = false}
    />

    <ProcessingModelSelector
      show={showProcessingModelSelector}
      fileName={pendingFile?.name || ''}
      on:select={handleModelSelection}
      on:close={handleModelSelectorClose}
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="Delete Site"
      message="Are you sure you want to delete '{siteToDelete?.name}'? This action cannot be undone."
      confirmText="Delete"
      type="danger"
      on:confirm={() => deleteSite(siteToDelete?.id)}
      on:cancel={() => {
        showDeleteConfirm = false;
        siteToDelete = null;
      }}
    />