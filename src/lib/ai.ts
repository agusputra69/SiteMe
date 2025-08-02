// AI integration with Together.ai API (inspired by self.so)
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const TOGETHER_MODEL = import.meta.env.VITE_TOGETHER_MODEL || 'meta-llama/Llama-2-70b-chat-hf';

export interface ResumeData {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  photo_url?: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    contractType?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
    credentialId?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    duration?: string;
  }>;
  awards: Array<{
    title: string;
    organization: string;
    date: string;
    description?: string;
  }>;
  links?: Array<{
    type: string;
    url: string;
  }>;
  // Template and theme settings
  template?: string;
  theme?: string;
  customization?: {
    theme: string;
    fontFamily: string;
    fontSize: string;
    layout: string;
    spacing: string;
    borderRadius: string;
    shadow: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    sectionOrder: string[];
    lineHeight: string;
    letterSpacing: string;
    headingFont: string;
    containerWidth: string;
    verticalSpacing: string;
    horizontalPadding: string;
  };
}

export async function extractResumeData(text: string): Promise<ResumeData> {
  if (!TOGETHER_API_KEY) {
    throw new Error('Together.ai API key is not configured');
  }

  // Enhanced prompt to extract additional sections
  const prompt = `You are a professional resume parser. Extract structured data from the following resume and return it as valid JSON.

Please extract the following information and format it as a JSON object:
{
  "name": "Full name",
  "email": "Email address (if found)",
  "phone": "Phone number (if found)",
  "location": "Location/City (if found)",
  "summary": "Professional summary or objective",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Duration (e.g., '2020-2023' or 'Jan 2020 - Present')",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/Institution name",
      "year": "Year or duration"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained",
      "description": "Description (optional)",
      "credentialId": "Credential ID (optional)"
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Proficiency level (e.g., 'Native', 'Fluent', 'Intermediate', 'Basic')"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["Tech 1", "Tech 2"],
      "url": "Project URL (optional)",
      "duration": "Duration (optional)"
    }
  ],
  "awards": [
    {
      "title": "Award name",
      "organization": "Awarding organization",
      "date": "Date received",
      "description": "Description (optional)"
    }
  ],
  "links": [
    {
      "type": "Link type (e.g., 'LinkedIn', 'GitHub', 'Portfolio')",
      "url": "URL"
    }
  ]
}

Extract all available information from the resume text. If a section is not present, include an empty array. For the following sections, extract as much detail as possible:
- Work experience with job titles, companies, durations, and descriptions
- Education with degrees, institutions, and years
- Skills (technical and soft skills)
- Certifications with issuing organizations and dates
- Languages with proficiency levels
- Projects, personal projects, or portfolio items
- Awards, honors, recognitions, or achievements

Resume text:
${text}

Return only the JSON object, no additional text or explanations.`;

      try {
      console.log('Sending request to Together.ai via proxy...');
      const response = await fetch("/api/together", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: TOGETHER_MODEL,
          prompt: prompt,
          max_tokens: 3000,
          temperature: 0.1,
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.1
        })
      });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error Response:', errorData);
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = errorData.retryAfter || 60000;
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`);
      }
      
      throw new Error(`API request failed: ${response.status} - ${errorData.error || errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Handle different response formats
    let extractedText = '';
    if (data.output?.choices?.[0]?.text) {
      extractedText = data.output.choices[0].text;
    } else if (data.output) {
      extractedText = data.output;
    } else if (data.choices?.[0]?.text) {
      extractedText = data.choices[0].text;
    } else {
      throw new Error('Unexpected API response format');
    }
    
    console.log('Extracted text:', extractedText);
    
    // Clean the response to extract only the JSON part
    let cleanedText = extractedText.trim();
    
    // Remove thinking tags if present
    cleanedText = cleanedText.replace(/<\/think><think>[\s\S]*?<\/think>/g, '');
    cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/g, '');
    cleanedText = cleanedText.replace(/<\/think>/g, '');
    cleanedText = cleanedText.replace(/<think>/g, '');
    
    // Remove markdown code blocks if present
    if (cleanedText.includes('```')) {
      // Find the first { and last }
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
    } else {
      // If no code blocks, try to extract JSON directly
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
    }
    
    // Final cleanup - remove any remaining non-JSON text
    cleanedText = cleanedText.trim();
    
    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(cleanedText);
      return parsed as ResumeData;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', extractedText);
      console.error('Cleaned response:', cleanedText);
      throw new Error('Failed to parse resume data - invalid JSON response');
    }
  } catch (error) {
    console.error('AI extraction error:', error);
    if (error instanceof Error) {
      // Check if it's a rate limit error
      if (error.message.includes('Rate limit exceeded')) {
        throw new Error(`AI service is currently busy. ${error.message}`);
      }
      throw new Error(`Failed to extract resume data: ${error.message}`);
    }
    throw new Error('Failed to extract resume data');
  }
}