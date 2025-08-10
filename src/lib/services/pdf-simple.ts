// Simple PDF text extraction without PDF.js
// This is a fallback when PDF.js fails

import type { PDFValidationResult } from './pdf';

export async function extractTextFromPDFSimple(file: File): Promise<string> {
	try {
		console.log('Using simple PDF extraction...');

		// Basic validation
		if (!file || file.size === 0) {
			throw new Error('File is empty or invalid');
		}

		if (file.size < 100) {
			throw new Error('File appears to be corrupted or too small');
		}

		// Try to extract basic file information
		const fileInfo = {
			name: file.name,
			size: Math.round(file.size / 1024),
			type: file.type,
			lastModified: new Date(file.lastModified).toLocaleDateString()
		};

		// Create a more informative fallback message
		const fallbackText = `PDF Text Extraction (Fallback Mode)

File Information:
- Name: ${fileInfo.name}
- Size: ${fileInfo.size}KB
- Type: ${fileInfo.type}
- Modified: ${fileInfo.lastModified}

IMPORTANT: This is a fallback extraction because the primary PDF processing failed.

Possible reasons for the failure:
1. PDF.js library is not properly loaded
2. PDF is password-protected
3. PDF contains only images (scanned document)
4. PDF is corrupted or in an unsupported format
5. Browser compatibility issues

To resolve this issue:
1. Try refreshing the page and uploading again
2. Ensure the PDF is not password-protected
3. Use a text-based PDF instead of scanned images
4. Try a different PDF file
5. Check if your browser supports PDF processing

For best results, please use a text-based PDF resume that contains selectable text.`;

		console.warn('Using simple PDF extraction - this may not provide accurate results');
		return fallbackText;
	} catch (error) {
		console.error('Simple PDF extraction error:', error);
		if (error instanceof Error) {
			throw new Error(`Simple PDF extraction failed: ${error.message}`);
		}
		throw new Error('Failed to extract text from PDF (simple mode)');
	}
}

// Enhanced validation for simple mode
export function validatePDFFileSimple(file: File): PDFValidationResult {
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
