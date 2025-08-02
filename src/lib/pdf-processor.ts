import type { ResumeData } from './ai';

export interface BasicResumeData {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  certifications: string[];
  languages: string[];
  projects: string[];
  awards: string[];
  links?: Array<{
    type: string;
    url: string;
  }>;
}

export function extractBasicResumeData(text: string): BasicResumeData {
  console.log('Enhanced basic processing started...');
  
  // Preprocess text for better parsing
  const preprocessedText = preprocessText(text);
  const lines = preprocessedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const result: BasicResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    awards: [],
    links: []
  };

  // Extract contact information first (more reliable)
  extractContactInfo(lines, result);
  
  // Extract URLs and links
  extractLinks(lines, result);
  
  // Parse sections with improved logic
  const sections = identifySections(lines);
  parseSections(sections, result);
  
  // Post-process and clean data
  cleanAndValidateData(result);
  
  console.log('Enhanced basic processing completed:', result);
  return result;
}

// Preprocess text to normalize formatting
function preprocessText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Fix common PDF extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .replace(/([0-9])([A-Z])/g, '$1 $2') // Add space between number and letter
    // Normalize bullet points
    .replace(/[•▪▫◦‣⁃]/g, '•')
    // Normalize dashes
    .replace(/[–—]/g, '-')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n');
}

// Enhanced contact information extraction
function extractContactInfo(lines: string[], result: BasicResumeData): void {
  const firstFewLines = lines.slice(0, 10); // Focus on header area
  
  for (const line of firstFewLines) {
    // Enhanced email extraction
    if (!result.email) {
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        result.email = emailMatch[0];
      }
    }
    
    // Enhanced phone extraction with international support
    if (!result.phone) {
      const phonePatterns = [
        /(?:\+?1[-\s]?)?\(?([0-9]{3})\)?[-\s]?([0-9]{3})[-\s]?([0-9]{4})/, // US format
        /\+?[1-9]\d{1,14}/, // International format
        /\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/, // Standard format
        /\d{3}[-\.]\d{3}[-\.]\d{4}/ // Dot/dash format
      ];
      
      for (const pattern of phonePatterns) {
        const phoneMatch = line.match(pattern);
        if (phoneMatch) {
          result.phone = phoneMatch[0];
          break;
        }
      }
    }
    
    // Enhanced location extraction
    if (!result.location) {
      const locationPatterns = [
        /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/, // City, State
        /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/, // City, Country
        /\b[A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2}\b/, // City Name, State
        /\b\d{5}(?:-\d{4})?\b/ // ZIP code
      ];
      
      for (const pattern of locationPatterns) {
        const locationMatch = line.match(pattern);
        if (locationMatch) {
          result.location = locationMatch[0];
          break;
        }
      }
    }
  }
  
  // Enhanced name extraction
  if (!result.name) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines with contact info or common headers
      if (line.includes('@') || line.includes('http') || 
          line.toLowerCase().includes('resume') ||
          line.toLowerCase().includes('curriculum') ||
          line.toLowerCase().includes('cv') ||
          /\d{3}/.test(line) || // Skip lines with multiple digits (likely phone/address)
          line.length > 100) { // Skip very long lines
        continue;
      }
      
      // Look for name patterns - more flexible
      if (line.length > 2 && line.length < 80) {
        // Check for typical name patterns
        const namePatterns = [
          /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/, // First Last (Middle)
          /^[A-Z]\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+$/, // I Gede Agus Ananda Putra
          /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/ // Multiple names
        ];
        
        for (const pattern of namePatterns) {
          if (pattern.test(line.trim())) {
            result.name = line.trim();
            break;
          }
        }
        
        if (result.name) break;
      }
    }
    
    // More conservative fallback - only use if it looks like a name
    if (!result.name && lines.length > 0) {
      const firstLine = lines[0].trim();
      // Only use first line if it's reasonably short and doesn't contain obvious non-name content
      if (firstLine.length < 80 && 
          !firstLine.includes('@') && 
          !firstLine.includes('http') &&
          !firstLine.toLowerCase().includes('resume') &&
          !/\d{3}/.test(firstLine)) {
        result.name = firstLine;
      } else {
        result.name = 'Unknown Name'; // Safe fallback
      }
    }
  }
}

// Extract URLs and links
function extractLinks(lines: string[], result: BasicResumeData): void {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const linkedinPattern = /linkedin\.com\/in\/[^\s]+/i;
  const githubPattern = /github\.com\/[^\s]+/i;
  
  for (const line of lines) {
    const urls = line.match(urlPattern);
    if (urls) {
      for (const url of urls) {
        let type = 'website';
        if (linkedinPattern.test(url)) type = 'linkedin';
        else if (githubPattern.test(url)) type = 'github';
        
        result.links?.push({ type, url });
      }
    }
  }
}

// Identify sections with improved logic
function identifySections(lines: string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let currentSection = 'header';
  let currentContent: string[] = [];
  
  const sectionPatterns = {
    experience: /^(experience|work\s+experience|professional\s+experience|employment|career|work\s+history|pengalaman)$/i,
    education: /^(education|academic|qualifications|degrees?|pendidikan)$/i,
    skills: /^(skills|technical\s+skills|competencies|technologies|expertise|keahlian|kemampuan)$/i,
    summary: /^(summary|profile|objective|about|overview|ringkasan|profil)$/i,
    certifications: /^(certifications?|certificates?|licenses?|sertifikat)$/i,
    languages: /^(languages?|linguistic|bahasa)$/i,
    projects: /^(projects?|portfolio|personal\s+projects?|proyek)$/i,
    awards: /^(awards?|achievements?|honors?|recognition|penghargaan)$/i
  };
  
  // Smart section detection - look for patterns in content too
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip very short lines or obvious non-section content
    if (trimmedLine.length < 2) {
      if (currentSection !== 'header') {
        currentContent.push(line);
      }
      continue;
    }
    
    // Check if this line is a section header
    let foundSection = false;
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections.set(currentSection, [...currentContent]);
        }
        
        currentSection = sectionName;
        currentContent = [];
        foundSection = true;
        break;
      }
    }
    
    // Smart content-based section detection
    if (!foundSection && currentSection === 'header') {
      // After header, try to detect sections by content patterns
      if (isLikelyExperienceContent(trimmedLine)) {
        if (currentContent.length > 0) {
          sections.set('header', [...currentContent]);
        }
        currentSection = 'experience';
        currentContent = [line];
        foundSection = true;
      } else if (isLikelyEducationContent(trimmedLine)) {
        if (currentContent.length > 0) {
          sections.set('header', [...currentContent]);
        }
        currentSection = 'education';
        currentContent = [line];
        foundSection = true;
      } else if (isLikelySkillsContent(trimmedLine)) {
        if (currentContent.length > 0) {
          sections.set('header', [...currentContent]);
        }
        currentSection = 'skills';
        currentContent = [line];
        foundSection = true;
      }
    }
    
    if (!foundSection) {
      currentContent.push(line);
    }
  }
  
  // Save the last section
  if (currentContent.length > 0) {
    sections.set(currentSection, currentContent);
  }
  
  return sections;
}

// Helper functions for content-based section detection
function isLikelyExperienceContent(line: string): boolean {
  const experienceIndicators = [
    /\b(designer|developer|manager|analyst|engineer|coordinator|specialist|assistant)\b/i,
    /\b(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*present|present)\b/i,
    /\b(company|corporation|inc\.|ltd\.|llc)\b/i,
    /\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/i
  ];
  return experienceIndicators.some(pattern => pattern.test(line));
}

function isLikelyEducationContent(line: string): boolean {
  const educationIndicators = [
    /\b(university|college|school|institute|akademi|universitas)\b/i,
    /\b(bachelor|master|phd|degree|diploma|sarjana)\b/i,
    /\b(graduated|graduation|lulus)\b/i
  ];
  return educationIndicators.some(pattern => pattern.test(line));
}

function isLikelySkillsContent(line: string): boolean {
  const skillsIndicators = [
    /\b(javascript|python|java|html|css|react|vue|angular)\b/i,
    /\b(photoshop|illustrator|figma|sketch|canva)\b/i,
    /\b(microsoft|excel|word|powerpoint)\b/i,
    /\b(programming|coding|development)\b/i
  ];
  return skillsIndicators.some(pattern => pattern.test(line));
}

// Parse sections with enhanced logic
function parseSections(sections: Map<string, string[]>, result: BasicResumeData): void {
  for (const [sectionName, content] of sections.entries()) {
    switch (sectionName) {
      case 'experience':
        parseExperienceSection(content, result);
        break;
      case 'education':
        parseEducationSection(content, result);
        break;
      case 'skills':
        parseSkillsSection(content, result);
        break;
      case 'summary':
        parseSummarySection(content, result);
        break;
      case 'certifications':
        parseCertificationsSection(content, result);
        break;
      case 'languages':
        parseLanguagesSection(content, result);
        break;
      case 'projects':
        parseProjectsSection(content, result);
        break;
      case 'awards':
        parseAwardsSection(content, result);
        break;
    }
  }
}

// Enhanced experience parsing
function parseExperienceSection(content: string[], result: BasicResumeData): void {
  let currentExperience: any = null;
  let isCollectingDescription = false;
  
  for (let i = 0; i < content.length; i++) {
    const line = content[i].trim();
    if (!line) continue;
    
    // Enhanced job title patterns
    const jobPatterns = [
      /^(.+?)\s+[-–—]\s+(.+?)\s+[-–—]\s+(.+)$/, // Title - Company - Duration
      /^(.+?)\s+at\s+(.+?)\s+\((.+?)\)$/, // Title at Company (Duration)
      /^(.+?)\s+\|\s+(.+?)\s+\|\s+(.+)$/, // Title | Company | Duration
      /^(.+?)\s+@\s+(.+?)\s+[-–—]\s+(.+)$/, // Title @ Company - Duration
      /^(.+?)\s+\((.+?)\)$/ // Title (Duration) - company might be on next line
    ];
    
    // Check for date patterns that might indicate a new job
    const datePatterns = [
      /\b(\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*present|present)\b/i,
      /\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i
    ];
    
    // Check for job title indicators
    const titleIndicators = [
      /\b(designer|developer|manager|analyst|engineer|coordinator|specialist|assistant|director|lead|senior|junior)\b/i
    ];
    
    let matched = false;
    
    // Try structured patterns first
    for (const pattern of jobPatterns) {
      const match = line.match(pattern);
      if (match) {
        if (currentExperience) {
          result.experience.push(currentExperience);
        }
        
        currentExperience = {
          title: match[1].trim(),
          company: match[2] ? match[2].trim() : '',
          duration: match[3] ? match[3].trim() : '',
          description: ''
        };
        isCollectingDescription = true;
        matched = true;
        break;
      }
    }
    
    // If no structured pattern, try to detect job entries by content
    if (!matched) {
      const hasDate = datePatterns.some(pattern => pattern.test(line));
      const hasTitle = titleIndicators.some(pattern => pattern.test(line));
      
      if ((hasDate || hasTitle) && line.length > 5 && line.length < 100) {
        // This might be a new job entry
        if (currentExperience) {
          result.experience.push(currentExperience);
        }
        
        // Try to extract components from the line
        let title = '', company = '', duration = '';
        
        // Extract duration first
        for (const datePattern of datePatterns) {
          const dateMatch = line.match(datePattern);
          if (dateMatch) {
            duration = dateMatch[0];
            break;
          }
        }
        
        // Remove duration from line to get title/company
        let remainingLine = line.replace(duration, '').trim();
        remainingLine = remainingLine.replace(/[-–—]+$/, '').trim(); // Remove trailing dashes
        
        // Try to split title and company
        const splitPatterns = [
          /^(.+?)\s+[-–—]\s+(.+)$/, // Title - Company
          /^(.+?)\s+at\s+(.+)$/, // Title at Company
          /^(.+?)\s+@\s+(.+)$/, // Title @ Company
          /^(.+?)\s+\|\s+(.+)$/ // Title | Company
        ];
        
        let titleCompanyMatched = false;
        for (const splitPattern of splitPatterns) {
          const splitMatch = remainingLine.match(splitPattern);
          if (splitMatch) {
            title = splitMatch[1].trim();
            company = splitMatch[2].trim();
            titleCompanyMatched = true;
            break;
          }
        }
        
        if (!titleCompanyMatched) {
          // Use the whole remaining line as title
          title = remainingLine;
          // Try to get company from next line
          if (i + 1 < content.length) {
            const nextLine = content[i + 1].trim();
            if (nextLine.length > 2 && nextLine.length < 80 && !datePatterns.some(p => p.test(nextLine))) {
              company = nextLine;
              i++; // Skip the next line since we used it
            }
          }
        }
        
        currentExperience = {
          title: title || 'Unknown Position',
          company: company || 'Unknown Company',
          duration: duration || 'Unknown Duration',
          description: ''
        };
        isCollectingDescription = true;
        matched = true;
      }
    }
    
    // Collect description lines
    if (!matched && currentExperience && isCollectingDescription) {
      // Skip very short lines or lines that look like section headers
      if (line.length > 5 && !line.match(/^[A-Z\s]+$/)) {
        currentExperience.description += (currentExperience.description ? ' ' : '') + line;
      }
    }
  }
  
  if (currentExperience) {
    result.experience.push(currentExperience);
  }
}

// Enhanced education parsing
function parseEducationSection(content: string[], result: BasicResumeData): void {
  let currentEducation: any = null;
  
  for (let i = 0; i < content.length; i++) {
    const line = content[i].trim();
    if (!line) continue;
    
    // Enhanced degree patterns
    const degreePatterns = [
      /^(.+?)\s+[-–—]\s+(.+?)\s+[-–—]\s+(.+)$/, // Degree - Institution - Year
      /^(.+?)\s+at\s+(.+?)\s+\((.+?)\)$/, // Degree at Institution (Year)
      /^(.+?)\s+\|\s+(.+?)\s+\|\s+(.+)$/, // Degree | Institution | Year
      /^(.+?)\s+from\s+(.+?)\s+[-–—]\s+(.+)$/, // Degree from Institution - Year
      /^(.+?)\s+\((.+?)\)$/ // Degree (Year) - institution might be on next line
    ];
    
    // Check for year patterns
    const yearPatterns = [
      /\b(19|20)\d{2}\b/, // 4-digit year
      /\b\d{4}\s*[-–—]\s*\d{4}\b/, // Year range
      /\b(19|20)\d{2}\s*[-–—]\s*present\b/i // Year to present
    ];
    
    // Check for degree indicators
    const degreeIndicators = [
      /\b(bachelor|master|phd|doctorate|diploma|certificate|sarjana|magister|doktor)\b/i,
      /\b(s1|s2|s3|d3|d4)\b/i, // Indonesian degree levels
      /\b(bsc|msc|ba|ma|beng|meng|bcom|mcom)\b/i
    ];
    
    // Check for institution indicators
    const institutionIndicators = [
      /\b(university|college|institute|school|universitas|institut|sekolah)\b/i
    ];
    
    let matched = false;
    
    // Try structured patterns first
    for (const pattern of degreePatterns) {
      const match = line.match(pattern);
      if (match) {
        result.education.push({
          degree: match[1].trim(),
          institution: match[2] ? match[2].trim() : '',
          year: match[3] ? match[3].trim() : ''
        });
        matched = true;
        break;
      }
    }
    
    // If no structured pattern, try to detect education entries by content
    if (!matched) {
      const hasYear = yearPatterns.some(pattern => pattern.test(line));
      const hasDegree = degreeIndicators.some(pattern => pattern.test(line));
      const hasInstitution = institutionIndicators.some(pattern => pattern.test(line));
      
      if ((hasYear || hasDegree || hasInstitution) && line.length > 5 && line.length < 150) {
        // This might be an education entry
        let degree = '', institution = '', year = '';
        
        // Extract year first
        for (const yearPattern of yearPatterns) {
          const yearMatch = line.match(yearPattern);
          if (yearMatch) {
            year = yearMatch[0];
            break;
          }
        }
        
        // Remove year from line to get degree/institution
        let remainingLine = line.replace(year, '').trim();
        remainingLine = remainingLine.replace(/[-–—,]+$/, '').trim(); // Remove trailing punctuation
        
        // Try to split degree and institution
        const splitPatterns = [
          /^(.+?)\s+[-–—]\s+(.+)$/, // Degree - Institution
          /^(.+?)\s+at\s+(.+)$/, // Degree at Institution
          /^(.+?)\s+from\s+(.+)$/, // Degree from Institution
          /^(.+?)\s+\|\s+(.+)$/, // Degree | Institution
          /^(.+?)\s*,\s*(.+)$/ // Degree, Institution
        ];
        
        let degreeInstitutionMatched = false;
        for (const splitPattern of splitPatterns) {
          const splitMatch = remainingLine.match(splitPattern);
          if (splitMatch) {
            // Determine which part is degree and which is institution
            const part1 = splitMatch[1].trim();
            const part2 = splitMatch[2].trim();
            
            const part1HasDegree = degreeIndicators.some(p => p.test(part1));
            const part2HasInstitution = institutionIndicators.some(p => p.test(part2));
            
            if (part1HasDegree || !part2HasInstitution) {
              degree = part1;
              institution = part2;
            } else {
              degree = part2;
              institution = part1;
            }
            degreeInstitutionMatched = true;
            break;
          }
        }
        
        if (!degreeInstitutionMatched) {
          // Try to determine if the line is more likely a degree or institution
          if (hasDegree) {
            degree = remainingLine;
            // Try to get institution from next line
            if (i + 1 < content.length) {
              const nextLine = content[i + 1].trim();
              if (nextLine.length > 2 && nextLine.length < 100 && 
                  (institutionIndicators.some(p => p.test(nextLine)) || 
                   !yearPatterns.some(p => p.test(nextLine)))) {
                institution = nextLine;
                i++; // Skip the next line since we used it
              }
            }
          } else if (hasInstitution) {
            institution = remainingLine;
            // Try to get degree from previous context or mark as unknown
            degree = 'Unknown Degree';
          } else {
            // Use the whole line as degree
            degree = remainingLine;
          }
        }
        
        result.education.push({
          degree: degree || 'Unknown Degree',
          institution: institution || 'Unknown Institution',
          year: year || 'Unknown Year'
        });
        matched = true;
      }
    }
  }
}

// Enhanced skills parsing
function parseSkillsSection(content: string[], result: BasicResumeData): void {
  const skillCategories = {
    technical: [] as string[],
    soft: [] as string[],
    languages: [] as string[],
    tools: [] as string[],
    other: [] as string[]
  };
  
  // Enhanced skill categorization patterns
  const technicalSkills = /\b(javascript|python|java|react|angular|vue|node|html|css|sql|mongodb|postgresql|mysql|php|ruby|c\+\+|c#|swift|kotlin|flutter|dart|typescript|go|rust|scala|r|matlab|tensorflow|pytorch|docker|kubernetes|aws|azure|gcp|git|linux|windows|macos|android|ios|web|mobile|frontend|backend|fullstack|devops|machine learning|ai|data science|blockchain|cybersecurity)\b/i;
  
  const softSkills = /\b(leadership|communication|teamwork|problem solving|analytical|creative|adaptable|organized|time management|project management|critical thinking|collaboration|presentation|negotiation|customer service|mentoring|training)\b/i;
  
  const languages = /\b(english|indonesian|mandarin|spanish|french|german|japanese|korean|arabic|portuguese|russian|italian|dutch|hindi|thai|vietnamese|bahasa)\b/i;
  
  const tools = /\b(photoshop|illustrator|figma|sketch|canva|office|excel|word|powerpoint|outlook|slack|trello|jira|confluence|notion|zoom|teams|salesforce|hubspot|mailchimp|google analytics|tableau|power bi)\b/i;
  
  for (const line of content) {
    if (!line.trim()) continue;
    
    // Handle different skill formats
    let skills = [];
    
    // Check for bullet points or numbered lists
    if (line.match(/^[•·\-\*\d+\.)]/)) {
      const cleanLine = line.replace(/^[•·\-\*\d+\.\)\s]+/, '').trim();
      skills = cleanLine.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 1);
    }
    // Check for comma/semicolon separated skills
    else if (line.includes(',') || line.includes(';')) {
      skills = line.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 1);
    }
    // Check for pipe separated skills
    else if (line.includes('|')) {
      skills = line.split('|').map(s => s.trim()).filter(s => s.length > 1);
    }
    // Single skill per line
    else if (line.length > 1 && line.length < 50) {
      skills = [line.trim()];
    }
    // Extract skills from longer text
    else {
      // Try to extract known skills from the text
      const words = line.split(/\s+/);
      for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z0-9\+#]/g, '').toLowerCase();
        if (cleanWord.length > 2) {
          if (technicalSkills.test(cleanWord) || 
              softSkills.test(cleanWord) || 
              languages.test(cleanWord) || 
              tools.test(cleanWord)) {
            skills.push(cleanWord);
          }
        }
      }
    }
    
    // Categorize and clean skills
    for (let skill of skills) {
      skill = skill.trim();
      if (skill.length < 2 || skill.length > 50) continue;
      
      // Remove common prefixes/suffixes
      skill = skill.replace(/^(skill[s]?[:\s]*|proficient in[:\s]*|experience with[:\s]*)/i, '');
      skill = skill.replace(/[\(\)\[\]"']/g, '').trim();
      
      if (skill.length < 2) continue;
      
      // Categorize the skill
      const lowerSkill = skill.toLowerCase();
      
      if (technicalSkills.test(lowerSkill)) {
        if (!skillCategories.technical.some(s => s.toLowerCase() === lowerSkill)) {
          skillCategories.technical.push(skill);
        }
      } else if (softSkills.test(lowerSkill)) {
        if (!skillCategories.soft.some(s => s.toLowerCase() === lowerSkill)) {
          skillCategories.soft.push(skill);
        }
      } else if (languages.test(lowerSkill)) {
        if (!skillCategories.languages.some(s => s.toLowerCase() === lowerSkill)) {
          skillCategories.languages.push(skill);
        }
      } else if (tools.test(lowerSkill)) {
        if (!skillCategories.tools.some(s => s.toLowerCase() === lowerSkill)) {
          skillCategories.tools.push(skill);
        }
      } else {
        // Check if it looks like a valid skill (not too generic)
        if (!lowerSkill.match(/^(and|or|the|a|an|in|on|at|to|for|with|by|from|of|as|is|are|was|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must)$/)) {
          if (!skillCategories.other.some(s => s.toLowerCase() === lowerSkill)) {
            skillCategories.other.push(skill);
          }
        }
      }
    }
  }
  
  // Add categorized skills to result
  result.skills.push(...skillCategories.technical);
  result.skills.push(...skillCategories.soft);
  result.skills.push(...skillCategories.languages);
  result.skills.push(...skillCategories.tools);
  result.skills.push(...skillCategories.other);
}

// Parse other sections with similar enhanced logic
function parseSummarySection(content: string[], result: BasicResumeData): void {
  const summaryText = content.join(' ').trim();
  if (summaryText.length > 20) {
    result.summary = summaryText.length > 500 ? summaryText.substring(0, 500) + '...' : summaryText;
  }
}

function parseCertificationsSection(content: string[], result: BasicResumeData): void {
  for (const line of content) {
    if (line.trim().length > 2 && line.trim().length < 100) {
      result.certifications.push(line.trim());
    }
  }
}

function parseLanguagesSection(content: string[], result: BasicResumeData): void {
  const allText = content.join(' ');
  const languages = allText.split(/[,;•\n\|]/)
    .map(lang => lang.trim())
    .filter(lang => lang.length > 1 && lang.length < 30);
  
  result.languages.push(...languages);
}

function parseProjectsSection(content: string[], result: BasicResumeData): void {
  for (const line of content) {
    if (line.trim().length > 5 && line.trim().length < 200) {
      result.projects.push(line.trim());
    }
  }
}

function parseAwardsSection(content: string[], result: BasicResumeData): void {
  for (const line of content) {
    if (line.trim().length > 5 && line.trim().length < 200) {
      result.awards.push(line.trim());
    }
  }
}

// Enhanced data cleaning and validation
function cleanAndValidateData(data: BasicResumeData): void {
  // Clean and validate name
  if (data.name) {
    // Remove common prefixes that shouldn't be in names
    data.name = data.name.replace(/^(resume|cv|curriculum vitae|profile|about|summary)[:\s]*/i, '').trim();
    
    // Remove HTML tags if any
    data.name = data.name.replace(/<[^>]*>/g, '').trim();
    
    // Limit length and ensure it looks like a name
    if (data.name.length > 100 || data.name.length < 2) {
      data.name = 'Unknown Name';
    }
    
    // Check if it contains too many numbers or special characters
    const specialCharCount = (data.name.match(/[^a-zA-Z\s\-\.]/g) || []).length;
    if (specialCharCount > data.name.length * 0.3) {
      data.name = 'Unknown Name';
    }
  }
  
  // Clean and deduplicate skills
  const cleanedSkills = new Set<string>();
  for (const skill of data.skills) {
    if (skill && skill.trim().length > 1) {
      let cleanSkill = skill.trim();
      
      // Remove HTML tags
      cleanSkill = cleanSkill.replace(/<[^>]*>/g, '');
      
      // Remove common noise words
      cleanSkill = cleanSkill.replace(/^(and|or|also|including|such as|like)[:\s]*/i, '');
      
      // Capitalize properly
      cleanSkill = cleanSkill.charAt(0).toUpperCase() + cleanSkill.slice(1).toLowerCase();
      
      // Only add if it's not too short or too long
      if (cleanSkill.length >= 2 && cleanSkill.length <= 50) {
        cleanedSkills.add(cleanSkill);
      }
    }
  }
  data.skills = Array.from(cleanedSkills);
  
  // Validate and clean email
  if (data.email) {
    data.email = data.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      data.email = '';
    }
  }
  
  // Clean and validate phone
  if (data.phone) {
    // Remove all non-digit characters except +, -, (, ), and spaces
    data.phone = data.phone.replace(/[^\d\+\-\(\)\s]/g, '');
    
    // Remove if too short or too long
    const digitCount = (data.phone.match(/\d/g) || []).length;
    if (digitCount < 7 || digitCount > 15) {
      data.phone = '';
    }
  }
  
  // Clean location
  if (data.location) {
    data.location = data.location.replace(/<[^>]*>/g, '').trim();
    if (data.location.length > 100) {
      data.location = data.location.substring(0, 100);
    }
  }
  
  // Clean experience entries
  data.experience = data.experience.filter(exp => {
    if (!exp.title || !exp.company) return false;
    
    // Clean HTML tags
    exp.title = exp.title.replace(/<[^>]*>/g, '').trim();
    exp.company = exp.company.replace(/<[^>]*>/g, '').trim();
    exp.duration = exp.duration ? exp.duration.replace(/<[^>]*>/g, '').trim() : '';
    exp.description = exp.description ? exp.description.replace(/<[^>]*>/g, '').trim() : '';
    
    // Remove if title or company is too short or looks invalid
    if (exp.title.length < 2 || exp.company.length < 2) return false;
    if (exp.title.length > 100) exp.title = exp.title.substring(0, 100);
    if (exp.company.length > 100) exp.company = exp.company.substring(0, 100);
    
    return true;
  });
  
  // Clean education entries
  data.education = data.education.filter(edu => {
    if (!edu.degree || !edu.institution) return false;
    
    // Clean HTML tags
    edu.degree = edu.degree.replace(/<[^>]*>/g, '').trim();
    edu.institution = edu.institution.replace(/<[^>]*>/g, '').trim();
    edu.year = edu.year ? edu.year.replace(/<[^>]*>/g, '').trim() : '';
    
    // Remove if degree or institution is too short
    if (edu.degree.length < 2 || edu.institution.length < 2) return false;
    if (edu.degree.length > 100) edu.degree = edu.degree.substring(0, 100);
    if (edu.institution.length > 100) edu.institution = edu.institution.substring(0, 100);
    
    return true;
  });
  
  // Clean other arrays
  data.languages = [...new Set(data.languages.filter(lang => lang && lang.trim().length > 1))];
  data.certifications = [...new Set(data.certifications.filter(cert => cert && cert.trim().length > 2))];
  data.projects = [...new Set(data.projects.filter(proj => proj && proj.trim().length > 5))];
  data.awards = [...new Set(data.awards.filter(award => award && award.trim().length > 5))];
  
  // Clean up text fields
  if (data.summary) {
    data.summary = data.summary.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (data.summary.length > 1000) {
      data.summary = data.summary.substring(0, 1000) + '...';
    }
  }
  
  // Clean links
  if (data.links) {
    data.links = data.links.filter(link => {
      if (!link.url || link.url.length < 5) return false;
      
      // Basic URL validation
      try {
        new URL(link.url);
        return true;
      } catch {
        // If not a valid URL, check if it looks like a social media handle
        return /^(linkedin\.com|github\.com|twitter\.com|instagram\.com)/i.test(link.url);
      }
    });
  }
  
  // Sort skills by relevance/length for better display
  data.skills.sort((a, b) => b.length - a.length);
  
  console.log('Enhanced data cleaning completed');
}

export function convertToResumeData(basicData: BasicResumeData): ResumeData {
  return {
    name: basicData.name || 'Unknown',
    email: basicData.email || '',
    phone: basicData.phone || '',
    location: basicData.location || '',
    summary: basicData.summary || '',
    experience: basicData.experience.map(exp => ({
      title: exp.title,
      company: exp.company,
      duration: exp.duration,
      description: exp.description,
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      contractType: ''
    })),
    education: basicData.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      startDate: '',
      endDate: '',
      isCurrent: false
    })),
    skills: basicData.skills,
    certifications: basicData.certifications.map(cert => ({
      name: cert,
      issuer: '',
      date: '',
      description: ''
    })),
    languages: basicData.languages.map(lang => ({
      language: lang,
      proficiency: ''
    })),
    projects: basicData.projects.map(project => ({
      name: project,
      description: '',
      technologies: []
    })),
    awards: basicData.awards.map(award => ({
      title: award,
      organization: '',
      date: '',
      description: ''
    })),
    links: basicData.links || []
  };
}