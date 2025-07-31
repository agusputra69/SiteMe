import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use CDN worker for better compatibility
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  (window as any).pdfjsLib = pdfjsLib;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded, size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n';
      console.log(`Page ${i} text length:`, pageText.length);
    }
    
    const result = text.trim();
    console.log('Total extracted text length:', result.length);
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error('Failed to extract text from PDF');
  }
}

export function validatePDFFile(file: File): boolean {
  // Check file type
  if (file.type !== 'application/pdf') {
    return false;
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}