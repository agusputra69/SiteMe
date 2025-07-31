// AI integration with Together.ai API (inspired by self.so)
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const TOGETHER_MODEL = import.meta.env.VITE_TOGETHER_MODEL || 'gpt2';

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
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  links?: Array<{
    type: string;
    url: string;
  }>;
}

export async function extractResumeData(text: string): Promise<ResumeData> {
  if (!TOGETHER_API_KEY) {
    throw new Error('Together.ai API key is not configured');
  }

  // Inspired by self.so - using structured JSON output
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
      "duration": "Duration (e.g., 2020-2023)",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "year": "Graduation year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "links": [
    {
      "type": "LinkedIn/GitHub/Portfolio",
      "url": "URL"
    }
  ]
}

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
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
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
      throw new Error(`Failed to extract resume data: ${error.message}`);
    }
    throw new Error('Failed to extract resume data');
  }
}