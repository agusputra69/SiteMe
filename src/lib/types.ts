export interface WorkExperience {
	title: string;
	company: string;
	type: string;
	period: string;
	current: boolean;
	description?: string;
}

export interface Education {
	institution: string;
	degree: string;
	period: string;
}

export interface Link {
	type: string;
	url: string;
}

export interface Contact {
	email?: string;
	phone?: string;
	location?: string;
}

export interface Project {
	title: string;
	description: string;
	image?: string;
	technologies?: string[];
	liveUrl?: string;
	githubUrl?: string;
	name?: string;
	url?: string;
	duration?: string;
}

export interface Certification {
	name: string;
	issuer: string;
	date: string;
	description?: string;
	credentialId?: string;
}

export interface Language {
	language: string;
	proficiency: string;
}

export interface Award {
	title: string;
	organization: string;
	date: string;
	description?: string;
}

export interface ProfileData {
	name: string;
	avatar: string;
	about: string;
	workExperience: WorkExperience[];
	education: Education[];
	skills: string[];
	contact: Contact;
	links: Link[];
	projects: Project[];
	certifications: Certification[];
	languages: Language[];
	awards: Award[];
}

export interface Theme {
	name: string;
	primary: string;
	secondary: string;
	accent: string;
	text: string;
	textSecondary: string;
}
export interface Template {
		id: string;
		name: string;
		description: string;
		category: string;
		themes: Theme[];
		features: string[];
	}

	export interface ResumeData {
		name: string;
		email: string;
		phone: string;
		location: string;
		summary: string;
		experience: WorkExperience[];
		education: Education[];
		certifications: Certification[];
		languages: Language[];
		projects: Project[];
		awards: Award[];
		skills: string[];
		links: Link[];
		template?: string;
		theme?: string;
		customization?: any;
	}

	export interface Site {
		id: string;
		name: string;
		status: 'draft' | 'published';
		user_id: string;
		data: ResumeData;
		template: string;
		updated_at: string;
		is_primary: boolean;
	}
