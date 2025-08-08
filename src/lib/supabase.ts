import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		flowType: 'pkce'
	}
});

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					username: string | null;
					full_name: string | null;
					data: any | null;
					created_at: string;
				};
				Insert: {
					id: string;
					username?: string | null;
					full_name?: string | null;
					data?: any | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					username?: string | null;
					full_name?: string | null;
					data?: any | null;
					created_at?: string;
				};
			};
		};
		Views: { [_ in never]: never };
		Functions: { [_ in never]: never };
		Enums: { [_ in never]: never };
	};
}

export type Tables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper functions for profiles
export async function getProfile(userId: string) {
	try {
		// First check if any profiles exist for this user
		const { data: profiles, error: queryError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId);

		if (queryError) {
			return { data: null, error: queryError };
		}

		// Handle no profile found
		if (!profiles || profiles.length === 0) {
			return { data: null, error: null };
		}

		// Handle multiple profiles (data inconsistency)
		if (profiles.length > 1) {
			console.warn(`Multiple profiles found for user ${userId}, using the first one`);
			// Optionally, you could clean up duplicates here
			return { data: profiles[0], error: null };
		}

		// Return single profile
		return { data: profiles[0], error: null };
	} catch (error) {
		console.error('Error in getProfile:', error);
		return { data: null, error };
	}
}

export async function updateProfile(userId: string, updates: { [key: string]: any }) {
	try {
		console.log('Starting optimized profile update for user:', userId);

		const profileTableColumns = ['id', 'username', 'full_name', 'data', 'created_at'];
		const cleanUpdates: { [key: string]: any } = { id: userId };
		const dataObject: { [key: string]: any } = { ...(updates.data || {}) };

		for (const key in updates) {
			if (key === 'data') continue;

			if (profileTableColumns.includes(key)) {
				cleanUpdates[key] = updates[key];
			} else {
				dataObject[key] = updates[key];
			}
		}

		if (Object.keys(dataObject).length > 0) {
			cleanUpdates.data = dataObject;
		}

		// Optimize data before saving
		if (cleanUpdates.data && typeof cleanUpdates.data === 'object') {
			// Deep clone to avoid reference issues
			cleanUpdates.data = JSON.parse(JSON.stringify(cleanUpdates.data));

			// Log data size for debugging
			const dataSize = JSON.stringify(cleanUpdates.data).length;
			console.log('Data size to save:', dataSize, 'bytes');

			// Optimize large data
			if (dataSize > 500000) {
				// 500KB threshold
				console.log('Optimizing large data payload...');

				// Truncate long text fields
				if (cleanUpdates.data.summary && cleanUpdates.data.summary.length > 2000) {
					cleanUpdates.data.summary = cleanUpdates.data.summary.substring(0, 2000) + '...';
				}

				// Limit array sizes
				if (cleanUpdates.data.experience && cleanUpdates.data.experience.length > 15) {
					cleanUpdates.data.experience = cleanUpdates.data.experience.slice(0, 15);
				}

				if (cleanUpdates.data.education && cleanUpdates.data.education.length > 10) {
					cleanUpdates.data.education = cleanUpdates.data.education.slice(0, 10);
				}

				if (cleanUpdates.data.projects && cleanUpdates.data.projects.length > 10) {
					cleanUpdates.data.projects = cleanUpdates.data.projects.slice(0, 10);
				}

				if (cleanUpdates.data.skills && cleanUpdates.data.skills.length > 100) {
					cleanUpdates.data.skills = cleanUpdates.data.skills.slice(0, 100);
				}

				// Truncate long descriptions in arrays
				['experience', 'education', 'projects', 'certifications'].forEach((field) => {
					if (cleanUpdates.data[field] && Array.isArray(cleanUpdates.data[field])) {
						cleanUpdates.data[field] = cleanUpdates.data[field].map((item: any) => {
							if (item.description && item.description.length > 1000) {
								return { ...item, description: item.description.substring(0, 1000) + '...' };
							}
							return item;
						});
					}
				});

				const optimizedSize = JSON.stringify(cleanUpdates.data).length;
				console.log(
					'Optimized data size:',
					optimizedSize,
					'bytes (reduced by',
					dataSize - optimizedSize,
					'bytes)'
				);
			}
		}

		console.log('Executing optimized database upsert...');

		// Use more efficient upsert with specific conflict resolution
		const { data, error } = await supabase
			.from('profiles')
			.upsert(cleanUpdates, {
				onConflict: 'id',
				ignoreDuplicates: false
			})
			.select('id, username, full_name, created_at')
			.single();

		if (error) {
			console.error('Supabase upsert error:', error);

			// Handle specific error types
			if (error.message?.includes('timeout') || error.message?.includes('connection')) {
				throw new Error(
					'Database connection timeout. Please check your internet connection and try again.'
				);
			}

			if (error.message?.includes('too large') || error.message?.includes('payload')) {
				throw new Error(
					'Data payload too large. Please reduce the amount of information and try again.'
				);
			}

			return { data: null, error };
		}

		console.log('Profile update successful');
		return { data, error: null };
	} catch (err) {
		console.error('Profile update error:', err);

		// Enhanced error handling
		if (err instanceof Error) {
			if (err.message.includes('fetch')) {
				throw new Error('Network error. Please check your internet connection and try again.');
			}
			if (err.message.includes('timeout')) {
				throw new Error('Request timeout. Please try again with a stable internet connection.');
			}
		}

		return { data: null, error: err };
	}
}

export async function getProfileByUsername(username: string) {
	try {
		// First check if any profiles exist for this username
		const { data: profiles, error: queryError } = await supabase
			.from('profiles')
			.select('*')
			.eq('username', username);

		if (queryError) {
			return { data: null, error: queryError };
		}

		// Handle no profile found
		if (!profiles || profiles.length === 0) {
			return { data: null, error: null };
		}

		// Handle multiple profiles (username should be unique but handle gracefully)
		if (profiles.length > 1) {
			console.warn(`Multiple profiles found for username ${username}, using the first one`);
			return { data: profiles[0], error: null };
		}

		// Return single profile
		return { data: profiles[0], error: null };
	} catch (error) {
		console.error('Error in getProfileByUsername:', error);
		return { data: null, error };
	}
}

// Upload resume PDF to Supabase storage
export async function uploadResume(file: File): Promise<{ url: string; path: string }> {
	try {
		// Get current user session
		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();
		if (userError || !user) {
			throw new Error('User not authenticated');
		}

		console.log('Starting resume upload for user:', user.id);
		console.log('File details:', {
			name: file.name,
			size: file.size,
			type: file.type
		});

		// Validate file
		if (!file.type.includes('pdf')) {
			throw new Error('Only PDF files are allowed');
		}

		// Check file size (5MB limit)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			throw new Error('File size must be less than 5MB');
		}

		// Generate unique filename with user ID as folder
		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}.${fileExt}`;
		const filePath = `${user.id}/${fileName}`;

		console.log('Uploading to path:', filePath);

		// Upload file to Supabase storage
		const { data, error } = await supabase.storage.from('resumes').upload(filePath, file, {
			cacheControl: '3600',
			upsert: false
		});

		if (error) {
			console.error('Upload error:', error);
			throw new Error(`Upload failed: ${error.message}`);
		}

		console.log('Upload successful:', data);

		// Get public URL
		const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);

		return {
			url: urlData.publicUrl,
			path: filePath
		};
	} catch (err) {
		console.error('Error uploading resume:', err);
		throw err;
	}
}

// Get uploaded resume URL
export async function getResumeUrl(filePath: string): Promise<string | null> {
	try {
		const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);

		return data.publicUrl;
	} catch (err) {
		console.error('Error getting resume URL:', err);
		return null;
	}
}

// List user's uploaded resumes
export async function listUserResumes(userId: string): Promise<{ data?: any[]; error?: any }> {
	try {
		const { data, error } = await supabase.storage.from('resumes').list(userId, {
			limit: 100
		});

		if (error) {
			return { data: null, error };
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

// Delete resume from storage
export async function deleteResume(filePath: string): Promise<{ error?: any }> {
	try {
		const { error } = await supabase.storage.from('resumes').remove([filePath]);

		return { error };
	} catch (err) {
		return { error: err };
	}
}

// Helper function to handle auth errors and clear corrupted sessions
export async function handleAuthError(error: any) {
	if (
		error?.message?.includes('refresh') ||
		error?.message?.includes('JWT') ||
		error?.message?.includes('Invalid Refresh Token')
	) {
		console.log('Clearing corrupted session due to auth error:', error.message);
		await supabase.auth.signOut();
		// Clear any stored session data
		if (typeof window !== 'undefined') {
			localStorage.removeItem('supabase.auth.token');
			sessionStorage.clear();
		}
		return true; // Indicates auth error was handled
	}
	return false; // Not an auth error
}

// Enhanced session check with error recovery
export async function getValidSession() {
	try {
		const {
			data: { session },
			error
		} = await supabase.auth.getSession();

		if (error) {
			const wasAuthError = await handleAuthError(error);
			if (wasAuthError) {
				return { session: null, error: null }; // Session cleared, no error to propagate
			}
			return { session: null, error };
		}

		return { session, error: null };
	} catch (error) {
		const wasAuthError = await handleAuthError(error);
		if (wasAuthError) {
			return { session: null, error: null };
		}
		return { session: null, error };
	}
}
