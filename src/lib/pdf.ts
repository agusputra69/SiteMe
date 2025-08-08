import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with fallback
if (typeof window !== 'undefined') {
	try {
		// Try CDN worker first
		pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
		(window as any).pdfjsLib = pdfjsLib;
	} catch (error) {
		console.warn('Failed to configure PDF.js worker with CDN, trying alternative:', error);
		try {
			// Fallback to unpkg
			pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
		} catch (fallbackError) {
			console.error('Failed to configure PDF.js worker:', fallbackError);
		}
	}
}

// Enhanced PDF validation with detailed error messages
export interface PDFValidationResult {
	isValid: boolean;
	error?: string;
	warnings?: string[];
}

export function validatePDFFile(file: File): PDFValidationResult {
	const warnings: string[] = [];

	// Check if file exists
	if (!file) {
		return {
			isValid: false,
			error: 'No file selected'
		};
	}

	// Check file type
	if (file.type !== 'application/pdf') {
		return {
			isValid: false,
			error: 'File must be a PDF document'
		};
	}

	// Check file size (max 10MB)
	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		return {
			isValid: false,
			error: `File size (${Math.round(
				file.size / 1024 / 1024
			)}MB) exceeds maximum allowed size of 10MB`
		};
	}

	// Check if file is empty
	if (file.size === 0) {
		return {
			isValid: false,
			error: 'File is empty'
		};
	}

	// Check if file is too small (likely corrupted)
	if (file.size < 100) {
		return {
			isValid: false,
			error: 'File appears to be corrupted or too small'
		};
	}

	// Warning for very large files
	if (file.size > 5 * 1024 * 1024) {
		// 5MB
		warnings.push('Large file detected. Processing may take longer than usual.');
	}

	// Check file name
	if (!file.name.toLowerCase().endsWith('.pdf')) {
		warnings.push('File extension does not match PDF format');
	}

	return {
		isValid: true,
		warnings: warnings.length > 0 ? warnings : undefined
	};
}

// Enhanced PDF text extraction with comprehensive error handling
export async function extractTextFromPDF(file: File): Promise<string> {
	try {
		console.log('Starting PDF extraction...');

		// Validate file first
		const validation = validatePDFFile(file);
		if (!validation.isValid) {
			throw new Error(validation.error || 'Invalid PDF file');
		}

		// Show warnings if any
		if (validation.warnings) {
			console.warn('PDF validation warnings:', validation.warnings);
		}

		const arrayBuffer = await file.arrayBuffer();
		console.log('File loaded, size:', arrayBuffer.byteLength);

		// Check if array buffer is valid
		if (arrayBuffer.byteLength === 0) {
			throw new Error('PDF file appears to be empty or corrupted');
		}

		// Check if PDF.js is available
		if (typeof pdfjsLib === 'undefined') {
			throw new Error('PDF.js library is not available. Please refresh the page and try again.');
		}

		// Load PDF with timeout and better error handling
		let pdf;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		try {
			pdf = (await Promise.race([
				pdfjsLib.getDocument({
					data: arrayBuffer,
					verbosity: 0 // Reduce console output
				}).promise,
				new Promise((_, reject) => {
					timeoutId = setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
				})
			])) as any;

			// Clear timeout if PDF loaded successfully
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		} catch (loadError) {
			// Clear timeout on error
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
			console.error('PDF loading error:', loadError);
			if (loadError instanceof Error && loadError.message.includes('Invalid PDF')) {
				throw new Error(
					'The file appears to be corrupted or not a valid PDF. Please try a different file.'
				);
			}
			throw new Error(
				`Failed to load PDF: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`
			);
		}

		console.log('PDF loaded, pages:', pdf.numPages);

		// Check if PDF has pages
		if (pdf.numPages === 0) {
			throw new Error('PDF contains no pages');
		}

		// Check for reasonable page count
		if (pdf.numPages > 50) {
			throw new Error('PDF has too many pages (maximum 50 allowed)');
		}

		let text = '';
		let totalTextLength = 0;
		let pagesWithText = 0;

		for (let i = 1; i <= pdf.numPages; i++) {
			console.log(`Processing page ${i}...`);

			try {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();

				if (!content || !content.items || content.items.length === 0) {
					console.warn(`Page ${i} appears to be empty or contains no text`);
					continue;
				}

				const pageText = content.items.map((item: any) => item.str).join(' ');

				if (pageText.trim().length > 0) {
					text += pageText + '\n';
					totalTextLength += pageText.length;
					pagesWithText++;
					console.log(`Page ${i} text length:`, pageText.length);

					// Check for excessive text (likely OCR or scanned document)
					if (pageText.length > 10000) {
						console.warn(`Page ${i} has very long text, may be OCR content`);
					}
				}
			} catch (pageError) {
				console.error(`Error processing page ${i}:`, pageError);
				// Continue with other pages instead of failing completely
				continue;
			}
		}

		const result = text.trim();
		console.log('Total extracted text length:', result.length);
		console.log('Pages with text:', pagesWithText, 'of', pdf.numPages);

		// Validate extracted text
		if (result.length === 0) {
			throw new Error(
				'No text could be extracted from the PDF. The document may be scanned, password-protected, or corrupted.'
			);
		}

		if (result.length < 50) {
			throw new Error(
				'Very little text extracted. The PDF may be scanned, password-protected, or not a resume document.'
			);
		}

		if (pagesWithText === 0) {
			throw new Error(
				'No pages contained readable text. The PDF may be image-based or password-protected.'
			);
		}

		// Check for common issues
		if (result.includes('password') || result.includes('Password')) {
			throw new Error(
				'PDF appears to be password-protected. Please remove the password and try again.'
			);
		}

		if (result.includes('scanned') || result.includes('image')) {
			console.warn('PDF may be scanned document - text extraction quality may be limited');
		}

		return result;
	} catch (error) {
		console.error('PDF extraction error:', error);

		// Provide specific error messages based on error type
		if (error instanceof Error) {
			const message = error.message;

			if (message.includes('timeout')) {
				throw new Error('PDF processing timed out. The file may be too large or corrupted.');
			}

			if (message.includes('password')) {
				throw new Error('PDF is password-protected. Please remove the password and upload again.');
			}

			if (message.includes('corrupted')) {
				throw new Error('PDF file appears to be corrupted. Please try a different file.');
			}

			if (message.includes('No text could be extracted')) {
				throw new Error(
					'No text could be extracted from the PDF. This usually means the document is scanned or image-based. Please use a text-based PDF.'
				);
			}

			if (message.includes('PDF.js library is not available')) {
				throw new Error(
					'PDF processing library is not loaded. Please refresh the page and try again.'
				);
			}

			throw new Error(`PDF processing failed: ${message}`);
		}

		throw new Error('Failed to extract text from PDF - unknown error');
	}
}

// Additional validation functions
export function isPDFLikelyResume(text: string): boolean {
	const resumeKeywords = [
		'experience',
		'education',
		'skills',
		'summary',
		'objective',
		'work',
		'job',
		'position',
		'company',
		'university',
		'degree',
		'resume',
		'cv',
		'curriculum vitae',
		'professional',
		'career'
	];

	const lowerText = text.toLowerCase();
	const keywordMatches = resumeKeywords.filter((keyword) => lowerText.includes(keyword)).length;

	return keywordMatches >= 3; // At least 3 resume-related keywords
}

export function detectPDFIssues(text: string): string[] {
	const issues: string[] = [];

	if (text.length < 100) {
		issues.push('Very little text extracted - document may not be a resume');
	}

	if (text.length > 50000) {
		issues.push('Very large text content - may be a document with excessive formatting');
	}

	if (!isPDFLikelyResume(text)) {
		issues.push('Document may not be a resume - low keyword match');
	}

	if (text.includes('password') || text.includes('Password')) {
		issues.push('Document may be password-protected');
	}

	return issues;
}
