#!/usr/bin/env node
/**
 * Project Structure Checker
 * Validates that the project follows the expected structure
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const EXPECTED_STRUCTURE = {
  'src/components/ai': ['AIDescriptionEnhancer.svelte', 'AISummaryEnhancer.svelte', 'ProcessingModelSelector.svelte'],
  'src/components/dashboard': ['InteractiveTutorial.svelte', 'OnboardingTour.svelte', 'ProfileEditor.svelte', 'SiteEditor.svelte'],
  'src/components/forms': ['DataEditor.svelte', 'DatePicker.svelte', 'DateRangePicker.svelte', 'InternationalPhoneInput.svelte', 'PhoneInput.svelte', 'RichTextEditor.svelte', 'SkillsInput.svelte', 'WorkDetailsInput.svelte'],
  'src/components/modals': ['AddSiteModal.svelte', 'ConfirmDialog.svelte', 'PDFErrorHandler.svelte', 'PDFProcessingModal.svelte', 'PDFSuccessModal.svelte', 'RateLimitModal.svelte'],
  'src/components/ui': ['Logo.svelte'],
  'src/lib/services': ['ai.ts', 'pdf.ts', 'pdf-processor.ts', 'pdf-simple.ts', 'profile.ts', 'supabase.ts'],
  'src/lib/config': ['customizerConfig.ts', 'templateConfig.ts'],
  'src/lib/utils': ['customizerUtils.ts', 'error-handler.ts'],
  'src/lib/types': ['types.ts'],
  'docs': [],
  'database': [],
  'scripts': ['check-structure.js']
};

async function checkDirectory(dirPath, expectedFiles = []) {
  try {
    const files = await readdir(dirPath);
    const sveltesAndTs = files.filter(f => f.endsWith('.svelte') || f.endsWith('.ts') || f.endsWith('.js'));
    
    console.log(`✓ ${dirPath}: ${sveltesAndTs.length} files`);
    
    if (expectedFiles.length > 0) {
      const missing = expectedFiles.filter(f => !sveltesAndTs.includes(f));
      if (missing.length > 0) {
        console.log(`  ⚠️  Missing: ${missing.join(', ')}`);
      }
      
      const extra = sveltesAndTs.filter(f => !expectedFiles.includes(f));
      if (extra.length > 0) {
        console.log(`  ℹ️  Extra: ${extra.join(', ')}`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`✗ ${dirPath}: Directory not found`);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking Project Structure\n');
  
  let allGood = true;
  
  for (const [dirPath, expectedFiles] of Object.entries(EXPECTED_STRUCTURE)) {
    const success = await checkDirectory(dirPath, expectedFiles);
    if (!success) allGood = false;
  }
  
  // Check for index files
  console.log('\n📋 Checking Index Files:');
  const indexFiles = ['src/components/index.ts', 'src/lib/index.ts'];
  
  for (const indexFile of indexFiles) {
    try {
      await stat(indexFile);
      console.log(`✓ ${indexFile}`);
    } catch {
      console.log(`✗ ${indexFile}: Missing`);
      allGood = false;
    }
  }
  
  console.log(`\n${allGood ? '🎉 Project structure looks good!' : '⚠️  Some issues found in project structure'}`);
}

main().catch(console.error);
