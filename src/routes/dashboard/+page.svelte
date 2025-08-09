<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
import {
	supabase,
	getProfile,
	updateProfile,
	handleAuthError,
	getValidSession,
	uploadResume
} from '$lib/supabase';
import {
	extractTextFromPDF,
	validatePDFFile,
	isPDFLikelyResume,
	detectPDFIssues
} from '$lib/pdf';
import { extractTextFromPDFSimple, validatePDFFileSimple } from '$lib/pdf-simple';
import { extractResumeData, type ResumeData } from '$lib/ai';
import { type Site } from '$lib/types';
import { extractBasicResumeData, convertToResumeData } from '$lib/pdf-processor';
import { goto } from '$app/navigation';
import { handleError, handleAuthError as handleAuthErr, handleNetworkError, handleFileError, handleDbError } from '$lib/error-handler';

	import OnboardingTour from '../../components/OnboardingTour.svelte';
	import InteractiveTutorial from '../../components/InteractiveTutorial.svelte';
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
	import AddSiteModal from '../../components/AddSiteModal.svelte';

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
	let showDeleteSiteConfirm = false;
	let showDeleteProfileConfirm = false;
	// Removed showProfileEditor - now redirects to editor page
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
	let sites: Site[] = [];
	let siteToDelete: Site | null = null;
	let showProcessingModelSelector = false;
	let pendingFile: File | null = null;
	let showAddSiteModal = false;
	let openDropdownId: string | null = null;
	let uploadedResumeUrl: string | null = null;
	let uploadedResumePath: string | null = null;

	onMount(() => {
		// Close dropdown when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!target.closest('.relative')) {
				openDropdownId = null;
			}
		};

		document.addEventListener('click', handleClickOutside);

		// Check authentication
		(async () => {
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
				handleAuthErr(error, { component: 'Dashboard', action: 'authentication' });
				await handleAuthError(error);
				return;
			}
		})();

		// Return cleanup function
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};

		// Show onboarding for new users
		const hasSeenOnboarding = localStorage.getItem('siteme-onboarding-completed');
		if (!hasSeenOnboarding && (!profile?.data || Object.keys(profile.data).length === 0)) {
			showOnboarding = true;
		}
	});

	let processingMonitorTimeout: ReturnType<typeof setTimeout> | null = null;
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let processingTimeout: ReturnType<typeof setTimeout> | null = null;
	let abortTimeout: ReturnType<typeof setTimeout> | null = null;
	let retryTimeout: ReturnType<typeof setTimeout> | null = null;

	// Monitor processing state to prevent loops
	$: if (showPDFProcessing && !uploading && !processing) {
		// Processing modal cleanup - no active processing
		if (processingMonitorTimeout) {
			clearTimeout(processingMonitorTimeout);
		}
		processingMonitorTimeout = setTimeout(() => {
			if (showPDFProcessing && !uploading && !processing) {
				forceCloseProcessingModal();
			}
			processingMonitorTimeout = null;
		}, 5000); // Wait 5 seconds before forcing close
	}

	onDestroy(() => {
		if (processingMonitorTimeout) {
			clearTimeout(processingMonitorTimeout);
		}
		if (copyTimeout) {
			clearTimeout(copyTimeout);
		}
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
		}
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}
		if (abortTimeout) {
			clearTimeout(abortTimeout);
		}
		if (retryTimeout) {
			clearTimeout(retryTimeout);
		}
	});

	async function loadProfile() {
		if (!user) return;

		const { data, error } = await getProfile(user.id);
		if (error) {
			handleDbError(error, { 
				component: 'Dashboard', 
				action: 'loadProfile',
				userMessage: 'Failed to load profile data'
			});
			return;
		}

		// If no profile exists, create one
		if (!data) {
			try {
				const { data: newProfile, error: createError } = await supabase
					.from('profiles')
					.insert({
						id: user.id,
						username: user.email?.split('@')[0] || '',
						full_name: user.user_metadata?.full_name || '',
						data: {}
					})
					.select()
					.single();

				if (createError) {
					handleDbError(createError, { 
						component: 'Dashboard', 
						action: 'createProfile',
						userMessage: 'Failed to create profile'
					});
					return;
				}

				profile = newProfile;
			} catch (error) {
				handleDbError(error, { 
					component: 'Dashboard', 
					action: 'createProfile',
					userMessage: 'Failed to create profile'
				});
				return;
			}
		} else {
			profile = data;
		}

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
				handleDbError(error, { 
					component: 'Dashboard', 
					action: 'loadSites',
					userMessage: 'Failed to load sites'
				});
				return;
			}

			sites = data || [];
		} catch (error) {
			handleDbError(error, { 
				component: 'Dashboard', 
				action: 'loadSites',
				userMessage: 'Failed to load sites'
			});
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
				handleDbError(error, { 
					component: 'Dashboard', 
					action: 'publishSite',
					userMessage: 'Failed to publish site'
				});
				return;
			}

			toasts.success('Site published successfully!');
			await loadSites(); // Refresh the list
		} catch (error) {
			handleDbError(error, { 
				component: 'Dashboard', 
				action: 'publishSite',
				userMessage: 'Failed to publish site'
			});
		}
	}

	async function duplicateSite(siteId: string) {
		try {
			const originalSite = sites.find((site) => site.id === siteId);
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
					handleDbError(error, { 
						component: 'Dashboard', 
						action: 'duplicateSite',
						userMessage: 'Failed to duplicate site'
					});
					return;
				}

				await loadSites();
				toasts.success('Site duplicated successfully!');
			}
		} catch (error) {
			handleDbError(error, { 
				component: 'Dashboard', 
				action: 'duplicateSite',
				userMessage: 'Failed to duplicate site'
			});
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
				handleDbError(error, { 
					component: 'Dashboard', 
					action: 'deleteSite',
					userMessage: 'Failed to delete site'
				});
				return;
			}

			toasts.success('Site deleted successfully!');
			await loadSites(); // Refresh the list
			showDeleteSiteConfirm = false;
			siteToDelete = null;
		} catch (error) {
			handleDbError(error, { 
				component: 'Dashboard', 
				action: 'deleteSite',
				userMessage: 'Failed to delete site'
			});
		}
	}

	function handleDeleteClick(site: Site) {
		siteToDelete = site;
		showDeleteSiteConfirm = true;
	}

	function handleDeleteSite() {
		if (siteToDelete) {
			deleteSite(siteToDelete.id);
		}
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
			validation.warnings.forEach((warning) => {
				toasts.warning(warning);
			});
		}

		// Store file and show model selector
		pendingFile = file;
		showProcessingModelSelector = true;
	}

	function handleModelSelection(event: CustomEvent<{ useAI: boolean }>) {
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
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}
		processingTimeout = setTimeout(() => {
			if (showPDFProcessing) {
				handleError(new Error('Processing timeout'), {
					component: 'Dashboard',
					action: 'processFile',
					userMessage: 'Processing took too long. Please try again.'
				});
				showPDFProcessing = false;
			}
			processingTimeout = null;
		}, 120000); // 2 minutes timeout

		try {
				// Check if PDF.js is available
				if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
					handleError(new Error('PDF.js library not found'), {
						component: 'Dashboard',
						action: 'processFile',
						logLevel: 'warn',
						showToast: false
					});
				}

				// Upload PDF file to Supabase storage
				try {
					const uploadResult = await uploadResume(file);
					uploadedResumeUrl = uploadResult.url;
					uploadedResumePath = uploadResult.path;
					toasts.success('Resume PDF uploaded successfully');
				} catch (uploadError) {
					handleFileError(uploadError, {
						component: 'Dashboard',
						action: 'uploadResume',
						userMessage: 'Failed to upload PDF file, but processing will continue',
						logLevel: 'warn'
					});
					// Continue processing even if upload fails
				}

			// Update progress for extraction step
			processingStep = 'extracting';
			processingProgress = 30;

			// Extract text from PDF with enhanced error handling
			let text: string;
			let usedFallback = false;

			try {
				text = await extractTextFromPDF(file);
			} catch (pdfError) {
				handleFileError(pdfError, {
					component: 'Dashboard',
					action: 'extractTextFromPDF',
					logLevel: 'warn',
					showToast: false,
					metadata: {
						fileName: file.name,
						fileSize: file.size,
						fileType: file.type
					}
				});
				usedFallback = true;
				processingUsedFallback = true;

				// Validate file for simple extraction
				const simpleValidation = validatePDFFileSimple(file);
				if (!simpleValidation.isValid) {
					throw new Error(
						simpleValidation.error || 'File validation failed for fallback extraction'
					);
				}

				text = await extractTextFromPDFSimple(file);
			}

			// Validate extracted text
			if (!text || text.trim().length === 0) {
				throw new Error(
					'No text could be extracted from the PDF. Please ensure the document contains text and is not password-protected.'
				);
			}

			// Check if text is likely a resume
			if (!isPDFLikelyResume(text)) {
				toasts.warning(
					'The document may not be a resume. Processing will continue but results may be limited.'
				);
			}

			// Detect potential issues
			const issues = detectPDFIssues(text);
			if (issues.length > 0) {
				issues.forEach((issue) => {
					toasts.warning(issue);
				});
			}

			// Show fallback warning
			if (usedFallback) {
				toasts.warning(
					'Using fallback PDF extraction. Results may be limited. Please ensure your PDF is text-based and not password-protected.'
				);
			}

			// Update progress for AI processing step
			processingStep = 'processing';
			processingProgress = 60;

			// Process with AI or basic processing
			processing = true;
			// Processing text with AI enhancement

			let extractedData: ResumeData;

			if (useAIProcessing) {
				// AI Processing
			const abortController = new AbortController();
			if (abortTimeout) {
				clearTimeout(abortTimeout);
			}
			abortTimeout = setTimeout(() => {
				abortController.abort();
				abortTimeout = null;
			}, 60000); // 60 seconds timeout

			try {
				extractedData = await extractResumeData(text, abortController.signal);
				
				// Clear timeout if processing completed successfully
				if (abortTimeout) {
					clearTimeout(abortTimeout);
					abortTimeout = null;
				}
			} catch (aiError) {
				// Clear timeout on error
				if (abortTimeout) {
					clearTimeout(abortTimeout);
					abortTimeout = null;
				}
				
				handleError(aiError, {
					component: 'Dashboard',
					action: 'aiProcessing',
					logLevel: 'warn',
					showToast: false
				});

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
						handleError(aiError, {
							component: 'Dashboard',
							action: 'aiProcessing',
							userMessage: 'AI processing took too long. Please try again.'
						});
						throw new Error('AI processing timeout. Please try again.');
					}

					// Enhanced fallback mechanism for AI processing failures
					if (useAIProcessing) {
						// AI processing failed, trying fallback mechanisms

						// First try: Basic processing with PDF extraction
						try {
							// Attempting basic processing fallback
							const basicData = extractBasicResumeData(text);
							extractedData = convertToResumeData(basicData);
							processingUsedFallback = true;
							toasts.warning(
								'AI processing failed. Using basic processing instead. Results may be limited.'
							);
						} catch (basicError) {
							handleError(basicError, {
								component: 'Dashboard',
								action: 'basicFallbackProcessing',
								logLevel: 'warn',
								showToast: false
							});

							// Second try: Simple fallback with minimal extraction
							try {
								// Attempting simple fallback mechanism
								const { createFallbackResumeData } = await import('$lib/ai');
								extractedData = createFallbackResumeData(text);
								processingUsedFallback = true;
								toasts.warning(
									'Using minimal data extraction. Please review and edit the extracted information.'
								);
							} catch (fallbackError) {
								handleError(fallbackError, {
									component: 'Dashboard',
									action: 'simpleFallbackProcessing',
									logLevel: 'error',
									showToast: false
								});
								throw new Error(
									'Failed to process resume: ' +
										(aiError instanceof Error ? aiError.message : 'Unknown AI error')
								);
							}
						}
					} else {
						throw aiError;
					}
				}
			} else {
				// Basic Processing (no AI)
				// Using basic processing fallback
				try {
					const basicData = extractBasicResumeData(text);
					extractedData = convertToResumeData(basicData);
					processingUsedFallback = true;
					toasts.info('Using basic processing (no AI). Results may be limited.');
				} catch (basicError) {
					handleError(basicError, {
						component: 'Dashboard',
						action: 'basicProcessing',
						userMessage: 'Failed to process resume with basic extraction.'
					});
					throw new Error('Failed to process resume with basic extraction.');
				}
			}


			// Validate extracted data
			if (!extractedData || !extractedData.name) {
				const validationError = new Error(
					'Failed to extract meaningful data from the PDF. Please ensure the document is a valid resume.'
				);
				handleFileError(validationError, {
					component: 'Dashboard',
					action: 'validateExtractedData',
					userMessage: 'Could not extract meaningful data from the resume. Please check the file format.'
				});
				throw validationError;
			}

			// Update progress for saving step
			processingStep = 'saving';
			processingProgress = 80;

			// Show more detailed progress for save operation
			toasts.info('Saving extracted data to database...');



			// Check if user is available
				if (!user || !user.id) {
					handleAuthError(new Error('User session not found. Please log in again.'), {
						component: 'Dashboard',
						action: 'validateUserSession'
					});
					throw new Error('User session not found. Please log in again.');
				}




			try {
				// Clean and structure the extracted data to ensure it's valid for JSONB storage
				const cleanExtractedData = {
					name: extractedData.name,
					email: extractedData.email,
					phone: extractedData.phone,
					location: extractedData.location,
					summary: extractedData.summary,
					experience: extractedData.experience || [],
					education: extractedData.education || [],
					skills: extractedData.skills || [],
					projects: extractedData.projects || [],
					certifications: extractedData.certifications || [],
					languages: extractedData.languages || [],
					links: extractedData.links || [],
					awards: extractedData.awards || [],
					// Add default template/theme/customization to prevent ProfileEditor save errors
					template: extractedData.template || 'modern',
					theme: extractedData.theme || 'blue',
					customization: extractedData.customization || {
						theme: 'blue',
						fontFamily: 'inter',
						fontSize: 'medium',
						layout: 'standard',
						spacing: 'normal',
						borderRadius: 'medium',
						shadow: 'medium',
						accentColor: '#3b82f6',
						textColor: '#1f2937',
						backgroundColor: '#ffffff',
						sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
						lineHeight: 'normal',
						letterSpacing: 'normal',
						headingFont: 'sans',
						containerWidth: 'standard',
						verticalSpacing: 'normal',
						horizontalPadding: 'normal'
					}
				};



				// Optimize data size before saving
				const dataSize = JSON.stringify(cleanExtractedData).length;

				// If data is too large, implement chunking strategy
				if (dataSize > 500000) {
					// 500KB threshold
					handleError(new Error(`Large data detected: ${dataSize} bytes`), {
						component: 'Dashboard',
						action: 'optimizeDataSize',
						logLevel: 'warn',
						showToast: false
					});
					// Split large arrays into smaller chunks
					if (cleanExtractedData.experience?.length > 10) {
						cleanExtractedData.experience = cleanExtractedData.experience.slice(0, 10);
					}
					if (cleanExtractedData.education?.length > 5) {
						cleanExtractedData.education = cleanExtractedData.education.slice(0, 5);
					}
					if (cleanExtractedData.projects?.length > 8) {
						cleanExtractedData.projects = cleanExtractedData.projects.slice(0, 8);
					}
					if (cleanExtractedData.skills?.length > 50) {
						cleanExtractedData.skills = cleanExtractedData.skills.slice(0, 50);
					}
				}

				// Enhanced retry mechanism with exponential backoff
				const maxAttempts = 3;
				const baseTimeout = 30000; // 30 seconds base timeout
				let saveAttempts = 0;
				let lastError = null;
				let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

				while (saveAttempts < maxAttempts) {
					try {
						saveAttempts++;
						const currentTimeout = baseTimeout * saveAttempts; // Progressive timeout

						// Create fresh promise for each attempt
						const savePromise = updateProfile(user.id, {
							data: cleanExtractedData,
							full_name: cleanExtractedData.name
						});

						const timeoutPromise = new Promise<never>((_, reject) => {
							saveTimeoutId = setTimeout(
								() => reject(new Error(`Database save timeout after ${currentTimeout / 1000} seconds`)),
								currentTimeout
							);
						});

						const result = await Promise.race([savePromise, timeoutPromise]);
						
						// Clear timeout on success
						if (saveTimeoutId) {
							clearTimeout(saveTimeoutId);
							saveTimeoutId = null;
						}

						if (result?.error) {
							handleDbError(result.error, {
								component: 'Dashboard',
								action: 'saveProfileData',
								logLevel: saveAttempts === maxAttempts ? 'error' : 'warn',
								showToast: false,
								metadata: { attempt: saveAttempts, maxAttempts }
							});
							lastError = result.error;

							if (saveAttempts < maxAttempts) {
							const backoffDelay = Math.min(1000 * Math.pow(2, saveAttempts - 1), 8000); // Exponential backoff, max 8s
							toasts.warning(
								`Save attempt ${saveAttempts} failed. Retrying in ${backoffDelay / 1000}s...`
							);
							await new Promise((resolve) => {
								if (retryTimeout) {
									clearTimeout(retryTimeout);
								}
								retryTimeout = setTimeout(() => {
									resolve(undefined);
									retryTimeout = null;
								}, backoffDelay);
							});
							continue;
							} else {
								throw new Error(
									'Failed to save profile data after multiple attempts: ' + 
									(result.error instanceof Error ? result.error.message : String(result.error))
								);
							}
						}

						toasts.success('Data saved successfully!');
						break; // Success, exit retry loop
					} catch (retryError) {
						// Clear timeout on error
						if (saveTimeoutId) {
							clearTimeout(saveTimeoutId);
							saveTimeoutId = null;
						}
						
						handleDbError(retryError, {
							component: 'Dashboard',
							action: 'saveProfileData',
							logLevel: saveAttempts >= maxAttempts ? 'error' : 'warn',
							showToast: false,
							metadata: { attempt: saveAttempts, maxAttempts }
						});
						lastError = retryError;

						if (saveAttempts >= maxAttempts) {
							throw retryError;
						}

						// Exponential backoff for connection errors
					const backoffDelay = Math.min(1000 * Math.pow(2, saveAttempts - 1), 8000);
					await new Promise((resolve) => {
						if (retryTimeout) {
							clearTimeout(retryTimeout);
						}
						retryTimeout = setTimeout(() => {
							resolve(undefined);
							retryTimeout = null;
						}, backoffDelay);
					});
					}
				}

				// Update local state
			resumeData = cleanExtractedData;
			profile = { ...profile, data: cleanExtractedData, full_name: cleanExtractedData.name };

				// Complete processing
				processingProgress = 100;

				// Create new site with extracted data if called from modal
				if (pendingFile && extractedData && extractedData.name) {
					try {
						const siteName = `${extractedData.name}'s Site`;

						const { data: newSite, error: siteError } = await supabase
							.from('sites')
							.insert({
								user_id: user.id,
								name: siteName,
								data: extractedData,
								template: 'modern',
								status: 'draft'
							})
							.select()
							.single();

						if (siteError) {
							errorMessage = 'Failed to create site. Please try again.';
							toasts.error('Failed to create new website');
						} else {
						toasts.success('New website created successfully!');
						// Refresh sites data
						await loadSites();
					}
					} catch (siteError) {
						errorMessage = 'Error creating site. Please try again.';
						toasts.error('Terjadi kesalahan saat membuat website');
					}

					// Clear pending file
					pendingFile = null;
				}

				// Hide processing modal and show success modal
				showPDFProcessing = false;
				processedFileName = file.name;
				showPDFSuccess = true;

				tutorialContext = 'edit';
				showTutorial = false; // Hide tutorial after successful PDF processing



				// Clear the timeout since processing completed successfully
				if (processingTimeout) {
					clearTimeout(processingTimeout);
					processingTimeout = null;
				}
			} catch (saveError) {
				errorMessage = 'Save operation failed. Please try again.';
				if (processingTimeout) {
					clearTimeout(processingTimeout);
					processingTimeout = null;
				}
				throw saveError;
			}
		} catch (error) {
			errorMessage = 'Error processing resume. Please try again.';

			// Clear the timeout
			if (processingTimeout) {
				clearTimeout(processingTimeout);
				processingTimeout = null;
			}

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
			if (copyTimeout) {
				clearTimeout(copyTimeout);
			}
			copyTimeout = setTimeout(() => {
				copied = false;
				copyTimeout = null;
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
		// Redirect to the editor page instead of showing popup
		goto('/dashboard/editor');
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
			// Force closing processing modal
			showPDFProcessing = false;
			uploading = false;
			processing = false;
			toasts.warning('Processing was interrupted. Please try again.');
		}
	}

	// Debug function to test PDF processing
	function testPDFProcessing() {
		// Testing PDF processing capabilities
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

		const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

		return data.publicUrl;
	}

	// Profile editor functions moved to /dashboard/editor page

	// Handle manual resume creation
	async function handleManualCreate(event: CustomEvent) {
		if (event.detail && event.detail.resumeData) {
			const { resumeData: newResumeData } = event.detail;
			resumeData = newResumeData;
			toasts.success('Manual resume template created! Start filling in your information.');
		} else {
			// Handle modal manual create - create new site
			showAddSiteModal = false;

			try {
				const siteName = 'My New Site';

				const { data: newSite, error: siteError } = await supabase
					.from('sites')
					.insert({
						user_id: user.id,
						name: siteName,
						data: {
							name: '',
							email: '',
							phone: '',
							location: '',
							summary: '',
							experience: [],
							education: [],
							skills: [],
							projects: []
						},
						template: 'modern',
						status: 'draft'
					})
					.select()
					.single();

				if (siteError) {
					errorMessage = 'Failed to create site. Please try again.';
					toasts.error('Failed to create new website');
					return;
				}

				// Site created successfully
				toasts.success('New website created successfully!');

				// Refresh sites data
				await loadSites();

				// Navigate to editor with the new site ID
				goto(`/dashboard/editor/${newSite.id}?mode=manual`);
			} catch (error) {
				errorMessage = 'Error creating site. Please try again.';
				toasts.error('Terjadi kesalahan saat membuat website');
			}
		}
	}

	// Profile editor functions moved to /dashboard/editor page

	// Profile editor functions moved to /dashboard/editor page

	// Handle rate limit retry
	function handleRateLimitRetry() {
		showRateLimitModal = false;
		// Retry the last file upload
		if (currentFile) {
			handleFileUpload({ target: { files: [currentFile] } } as any);
		}
	}

	async function handleDeleteData() {
		// Delete button clicked - checking user authentication

		// Check if user is authenticated
		if (!user || !user.id) {
			toasts.error('❌ User not authenticated. Please log in again.');
			return;
		}

		// Check Supabase connection
		try {
			const {
				data: { session }
			} = await supabase.auth.getSession();
			// Checking current session
			if (!session) {
				toasts.error('❌ Session expired. Please log in again.');
				goto('/login');
				return;
			}
		} catch (sessionError) {
			errorMessage = 'Session check failed. Please try again.';
			toasts.error('❌ Connection error. Please check your internet connection.');
			return;
		}

		// Show confirmation dialog
		showDeleteProfileConfirm = true;
	}

	async function confirmDeleteData() {
		showDeleteProfileConfirm = false;

		loading = true;
		// Starting deletion process
		toasts.info('Deleting all profile data...');

		try {
			// Starting data deletion for user

			// Test Supabase connection first
			const { data: testData, error: testError } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (testError && testError.code !== 'PGRST116') {
				// PGRST116 is "not found" which is ok
				errorMessage = 'Database connection failed. Please try again.';
				throw new Error(`Database connection failed: ${testError.message}`);
			}

			// Supabase connection test passed

			// Clear profile data in database using direct Supabase call
			const { data: updateData, error: updateError } = await supabase
				.from('profiles')
				.upsert({
					id: user.id,
					data: null,
					full_name: null
				})
				.select()
				.single();

			// Direct Supabase update completed

			if (updateError) {
				errorMessage = 'Database deletion error. Please try again.';
				throw new Error(`Failed to update database: ${updateError.message}`);
			}

			// Database cleared successfully

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

			// Local state reset successfully

			toasts.success('✅ All profile data deleted successfully! You can now start fresh.');

			// Force a page refresh to ensure clean state
			if (retryTimeout) {
				clearTimeout(retryTimeout);
			}
			retryTimeout = setTimeout(() => {
				// Refreshing page
				window.location.reload();
				retryTimeout = null;
			}, 2000);
		} catch (error) {
			errorMessage = 'Error deleting profile data. Please try again.';
			const errorDetails = error instanceof Error ? error.message : 'Unknown error';
			toasts.error(`❌ Failed to delete profile data: ${errorDetails}`);
		} finally {
			loading = false;
			// Delete process completed
		}
	}

	// AddSiteModal handlers
	function handleAddSiteModal() {
		showAddSiteModal = true;
	}

	function handleAddSiteModalClose() {
		showAddSiteModal = false;
	}

	function handleModalPDFUpload(event: CustomEvent) {
		const file = event.detail.file;
		showAddSiteModal = false;
		pendingFile = file;
		showProcessingModelSelector = true;
	}
</script>

<div class="container mx-auto px-4 py-6">
	<!-- Welcome Section -->
	<div class="mb-8">
		<div class="text-left mb-8">
			<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
				Welcome back, {resumeData?.name || user?.email?.split('@')[0] || 'there'}! 👋
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
				{profile?.username
					? `Your site is live at siteme.app/u/${profile.username}`
					: 'Create your professional website in minutes'}
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

	<!-- My Sites Section (for users with existing sites) -->
	{#if sites.length > 0}
		<div class="mb-8">
			<div
				class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
			>
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center space-x-3">
						<div
							class="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center"
						>
							<Globe class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-xl font-bold text-gray-900 dark:text-white">My Sites</h3>
							<p class="text-sm text-gray-600 dark:text-gray-300">
								Manage your draft and published sites ({sites.length}/3)
							</p>
						</div>
					</div>
					<div class="flex items-center space-x-3">
						{#if sites.length < 3}
							<button
								on:click={handleAddSiteModal}
								class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								<Sparkles class="w-4 h-4 mr-2" />
								Add New Site
							</button>
						{/if}
					</div>
				</div>

				<!-- Sites List -->
				<div class="space-y-3">
					{#each sites.slice(0, 3) as site (site.id)}
						<div
							class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
						>
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<div class="flex items-center space-x-3">
										<h4 class="font-semibold text-gray-900 dark:text-white">
											{site.name}
										</h4>
										{#if site.status === 'published'}
											<span
												class="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full"
											>
												<Globe class="w-3 h-3 mr-1" />
												Live
											</span>
										{:else}
											<span
												class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full"
											>
												Draft
											</span>
										{/if}
									</div>
									<div
										class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400"
									>
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

									<!-- Dropdown Menu -->
									<div class="relative">
										<button
											on:click={() =>
												(openDropdownId = openDropdownId === site.id ? null : site.id)}
											class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
										>
											<MoreVertical class="w-4 h-4" />
										</button>

										{#if openDropdownId === site.id}
											<div
												class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
											>
												<div class="py-1">
													<button
														on:click={() => {
															duplicateSite(site.id);
															openDropdownId = null;
														}}
														class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
													>
														<Copy class="w-4 h-4 mr-2" />
														Duplicate Site
													</button>
													<button
														on:click={() => {
															siteToDelete = site;
															showDeleteSiteConfirm = true;
															openDropdownId = null;
														}}
														class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
													>
														<Trash2 class="w-4 h-4 mr-2" />
														Delete Site
													</button>
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
		<!-- Quick Actions -->
		<div class="xl:col-span-2 space-y-6">
			<!-- Getting Started Section (only for users without sites) -->
			{#if sites.length === 0}
				<div
					id="upload"
					class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
				>
					<div class="text-center mb-8">
						<div
							class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
						>
							<Sparkles class="w-8 h-8 text-white" />
						</div>
						<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Create Your First Website
						</h3>
						<p class="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
							Choose how to create your professional website
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Manual Creation -->
						<div
							class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
						>
							<div class="space-y-4">
								<div
									class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
								>
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
						<div
							class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors"
						>
							<div class="space-y-4">
								<div
									class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
								>
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
								<ul
									class="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside"
								>
									<li>You can create a maximum of 3 websites</li>
									<li>AI processing has daily limitations due to API constraints</li>
									<li>Use well-formatted PDFs for best results</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if errorMessage}
				<div
					class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
				>
					<p class="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
				</div>
			{/if}

			{#if successMessage}
				<div
					class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
				>
					<p class="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Modern Sidebar -->
	<div class="xl:col-span-1 space-y-6" />
</div>

<!-- Profile Editor Modal - Removed, now redirects to /dashboard/editor -->

<!-- Add Site Modal -->
<AddSiteModal
	bind:show={showAddSiteModal}
	on:close={handleAddSiteModalClose}
	on:manualCreate={handleManualCreate}
	on:pdfUpload={handleModalPDFUpload}
/>

<!-- Onboarding Tour -->
{#if showOnboarding}
	<OnboardingTour on:complete={handleOnboardingComplete} on:skip={handleOnboardingSkip} />
{/if}

<!-- Interactive Tutorial -->
{#if showTutorial}
	<InteractiveTutorial isVisible={true} currentContext={tutorialContext} />
{/if}

<!-- Delete Site Confirmation Dialog -->
<ConfirmDialog
	isOpen={showDeleteSiteConfirm}
	title="Delete Site"
	message="Are you sure you want to delete '{siteToDelete?.name}'? This action will permanently remove the site and all its data. This cannot be undone."
	confirmText="Delete Site"
	cancelText="Cancel"
	type="danger"
	on:confirm={handleDeleteSite}
	on:cancel={() => {
		showDeleteSiteConfirm = false;
		siteToDelete = null;
	}}
/>

<!-- Delete Profile Confirmation Dialog -->
<ConfirmDialog
	isOpen={showDeleteProfileConfirm}
	title="Delete All Profile Data"
	message="⚠️ WARNING: This will permanently delete ALL your profile data including personal information, work experience, education, skills, and all uploaded content. This action cannot be undone."
	confirmText="Delete Everything"
	cancelText="Cancel"
	type="danger"
	on:confirm={confirmDeleteData}
	on:cancel={() => (showDeleteProfileConfirm = false)}
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
	on:close={() => (showRateLimitModal = false)}
/>

<ProcessingModelSelector
	show={showProcessingModelSelector}
	fileName={pendingFile?.name || ''}
	on:select={handleModelSelection}
	on:close={handleModelSelectorClose}
/>
