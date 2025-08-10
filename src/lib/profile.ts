import { supabase } from './supabase';
import type { ResumeData, ProfileData, WorkExperience, Education, Link, Project, Certification, Language, Award, Customization, TemplateCustomization } from './types';

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image');
  }
  if (file.size > maxSize) {
    throw new Error('File too large. Image must be smaller than 5MB');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, { contentType: file.type, upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
  return data.publicUrl;
}

export function convertToCustomization(templateCustom: TemplateCustomization): Customization {
  return {
    fontFamily: templateCustom.fontFamily || 'inter',
    fontSize: templateCustom.fontSize || 'medium',
    lineHeight: templateCustom.lineHeight || '1.5',
    margins: { top: 16, bottom: 16, left: 16, right: 16 },
    colors: {
      primary: templateCustom.accentColor || '#3B82F6',
      secondary: templateCustom.textColor || '#1F2937',
      accent: templateCustom.backgroundColor || '#FFFFFF',
      text: templateCustom.textColor || '#1F2937'
    },
    layout: {
      columns: templateCustom.layout === 'two-column' ? 2 : 1,
      spacing: 16
    },
    sectionOrder: templateCustom.sectionOrder
  };
}

export function convertFromCustomization(customization: Customization): TemplateCustomization {
  return {
    theme: 'blue',
    fontFamily: customization.fontFamily || 'inter',
    fontSize: customization.fontSize || 'medium',
    layout:
      typeof customization.layout === 'object'
        ? customization.layout.columns === 2
          ? 'two-column'
          : 'standard'
        : ((customization.layout as unknown as string) || 'standard'),
    spacing: 'normal',
    borderRadius: 'medium',
    shadow: 'medium',
    accentColor: customization.colors?.primary || '#3B82F6',
    textColor: customization.colors?.text || '#1F2937',
    backgroundColor: customization.colors?.accent || '#FFFFFF',
    sectionOrder: customization.sectionOrder || ['header', 'about', 'experience', 'education', 'skills', 'contact'],
    lineHeight: (customization.lineHeight as unknown as string) || '1.5',
    letterSpacing: 'normal',
    headingFont: customization.fontFamily || 'inter',
    containerWidth: 'standard',
    verticalSpacing: 'normal',
    horizontalPadding: 'normal'
  };
}

export function toProfileData(resumeData: ResumeData | null | undefined): ProfileData {
  const data = (resumeData || {}) as ResumeData;
  const workExperience: WorkExperience[] = (data.experience || []).map((exp) => ({
    title: exp.title || '',
    company: exp.company || '',
    type: exp.type || '',
    period: exp.period || '',
    current: !!exp.current,
    description: exp.description || ''
  }));
  const education: Education[] = (data.education || []).map((edu) => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    period: edu.period || '',
    description: edu.description || ''
  }));
  return {
    name: data.name || '',
    avatar: data.photo_url || (data.name ? data.name.charAt(0).toUpperCase() : ''),
    about: data.summary || '',
    workExperience,
    education,
    skills: data.skills || [],
    contact: {
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || ''
    },
    links: (data.links || []) as Link[],
    projects: (data.projects || []) as Project[],
    certifications: (data.certifications || []) as Certification[],
    languages: (data.languages || []) as Language[],
    awards: (data.awards || []) as Award[]
  };
}