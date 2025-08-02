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
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
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

  let currentSection = '';
  let experienceIndex = -1;
  let educationIndex = -1;
  let summaryLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Extract name (usually the first line or a prominent line)
    if (!result.name && line.length > 0 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
      if (i === 0 || (line.length > 3 && line.length < 30)) {
        result.name = line;
        continue;
      }
    }

    // Extract email
    const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = line.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && !result.phone) {
      result.phone = phoneMatch[0];
    }

    // Detect sections
    if (lowerLine.includes('experience') || lowerLine.includes('work') || lowerLine.includes('employment') || lowerLine.includes('professional experience')) {
      currentSection = 'experience';
      continue;
    }

    if (lowerLine.includes('education') || lowerLine.includes('academic') || lowerLine.includes('degree') || lowerLine.includes('qualification')) {
      currentSection = 'education';
      continue;
    }

    if (lowerLine.includes('skill') || lowerLine.includes('competency') || lowerLine.includes('technology') || lowerLine.includes('technical skills')) {
      currentSection = 'skills';
      continue;
    }

    if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile') || lowerLine.includes('about')) {
      currentSection = 'summary';
      continue;
    }

    if (lowerLine.includes('certification') || lowerLine.includes('certificate') || lowerLine.includes('certified')) {
      currentSection = 'certifications';
      continue;
    }

    if (lowerLine.includes('language') || lowerLine.includes('lingual') || lowerLine.includes('bilingual')) {
      currentSection = 'languages';
      continue;
    }

    if (lowerLine.includes('project') || lowerLine.includes('portfolio')) {
      currentSection = 'projects';
      continue;
    }

    if (lowerLine.includes('award') || lowerLine.includes('achievement') || lowerLine.includes('recognition')) {
      currentSection = 'awards';
      continue;
    }

    // Process summary section
    if (currentSection === 'summary' && line.length > 20) {
      summaryLines.push(line);
    }

    // Process experience section
    if (currentSection === 'experience') {
      // Look for job patterns with various separators
      if (line.includes(' - ') || line.includes('|') || line.includes('•') || line.includes(' at ') || line.includes(' @ ')) {
        let parts: string[] = [];
        
        if (line.includes(' - ')) {
          parts = line.split(' - ').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes('|')) {
          parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes('•')) {
          parts = line.split('•').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes(' at ')) {
          parts = line.split(' at ').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes(' @ ')) {
          parts = line.split(' @ ').map(p => p.trim()).filter(p => p.length > 0);
        }
        
        if (parts.length >= 2) {
          const title = parts[0];
          const company = parts[1];
          const duration = parts[2] || '';
          
          result.experience.push({
            title,
            company,
            duration,
            description: ''
          });
          experienceIndex++;
        }
      } else if (experienceIndex >= 0 && line.length > 10) {
        // Add description to current experience
        if (result.experience[experienceIndex]) {
          result.experience[experienceIndex].description += (result.experience[experienceIndex].description ? ' ' : '') + line;
        }
      }
    }

    // Process education section
    if (currentSection === 'education') {
      if (line.includes(' - ') || line.includes('|') || line.includes('•') || line.includes(' at ') || line.includes(' @ ')) {
        let parts: string[] = [];
        
        if (line.includes(' - ')) {
          parts = line.split(' - ').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes('|')) {
          parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes('•')) {
          parts = line.split('•').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes(' at ')) {
          parts = line.split(' at ').map(p => p.trim()).filter(p => p.length > 0);
        } else if (line.includes(' @ ')) {
          parts = line.split(' @ ').map(p => p.trim()).filter(p => p.length > 0);
        }
        
        if (parts.length >= 2) {
          const degree = parts[0];
          const institution = parts[1];
          const year = parts[2] || '';
          
          result.education.push({
            degree,
            institution,
            year
          });
          educationIndex++;
        }
      }
    }

    // Process skills section
    if (currentSection === 'skills') {
      // Look for comma-separated skills or bullet points
      if (line.includes(',') || line.includes('•') || line.includes('-')) {
        const skills = line.split(/[,•-]/).map(s => s.trim()).filter(s => s.length > 0);
        result.skills.push(...skills);
      } else if (line.length > 0 && line.length < 50) {
        // Single skill per line
        result.skills.push(line);
      }
    }

    // Process certifications section
    if (currentSection === 'certifications') {
      if (line.length > 0 && line.length < 100) {
        result.certifications.push(line);
      }
    }

    // Process languages section
    if (currentSection === 'languages') {
      if (line.includes(',') || line.includes('•') || line.includes('-')) {
        const languages = line.split(/[,•-]/).map(s => s.trim()).filter(s => s.length > 0);
        result.languages.push(...languages);
      } else if (line.length > 0 && line.length < 50) {
        result.languages.push(line);
      }
    }

    // Process projects section
    if (currentSection === 'projects') {
      if (line.length > 0 && line.length < 200) {
        result.projects.push(line);
      }
    }

    // Process awards section
    if (currentSection === 'awards') {
      if (line.length > 0 && line.length < 200) {
        result.awards.push(line);
      }
    }

    // Extract location (usually near the top)
    if (!result.location && (lowerLine.includes('city') || lowerLine.includes('state') || lowerLine.includes('country'))) {
      result.location = line;
    }
  }

  // Set summary from collected lines
  if (summaryLines.length > 0) {
    result.summary = summaryLines.join(' ');
  }

  // Clean up and validate
  if (!result.name && lines.length > 0) {
    result.name = lines[0];
  }

  // Remove duplicates from skills
  result.skills = [...new Set(result.skills)];
  result.languages = [...new Set(result.languages)];

  // Limit summary length
  if (result.summary && result.summary.length > 500) {
    result.summary = result.summary.substring(0, 500) + '...';
  }

  return result;
}

export function convertToResumeData(basicData: BasicResumeData): ResumeData {
  return {
    name: basicData.name,
    email: basicData.email,
    phone: basicData.phone,
    location: basicData.location,
    summary: basicData.summary,
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