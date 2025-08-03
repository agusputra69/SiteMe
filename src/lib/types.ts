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

export interface ProfileData {
	name: string;
	avatar: string;
	about: string;
	workExperience: WorkExperience[];
	education: Education[];
	skills?: string[];
	contact?: Contact;
	links?: Link[];
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