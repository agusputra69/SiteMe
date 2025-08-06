import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Get API key from environment variables
const API_KEY = env.TOGETHER_API_KEY || env.VITE_TOGETHER_API_KEY;
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1';

// Rate limiting state
const rateLimitState = {
	requests: 0,
	resetTime: Date.now() + 60000, // 1 minute
	lastRequest: 0
};

// Rate limit configuration
const RATE_LIMIT = {
	MAX_REQUESTS: 5, // Conservative limit to stay under 6
	WINDOW_MS: 60000, // 1 minute
	COOLDOWN_MS: 10000 // 10 seconds cooldown between requests
};

function checkRateLimit(): { allowed: boolean; waitTime?: number } {
	const now = Date.now();

	// Reset counter if window has passed
	if (now > rateLimitState.resetTime) {
		rateLimitState.requests = 0;
		rateLimitState.resetTime = now + RATE_LIMIT.WINDOW_MS;
	}

	// Check if we're at the limit
	if (rateLimitState.requests >= RATE_LIMIT.MAX_REQUESTS) {
		const waitTime = rateLimitState.resetTime - now;
		return { allowed: false, waitTime };
	}

	// Check cooldown between requests
	if (now - rateLimitState.lastRequest < RATE_LIMIT.COOLDOWN_MS) {
		const waitTime = RATE_LIMIT.COOLDOWN_MS - (now - rateLimitState.lastRequest);
		return { allowed: false, waitTime };
	}

	return { allowed: true };
}

function updateRateLimit() {
	rateLimitState.requests++;
	rateLimitState.lastRequest = Date.now();
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!API_KEY) {
			return json({ error: 'Together.ai API key is not configured' }, { status: 500 });
		}

		// Check rate limit
		const rateLimitCheck = checkRateLimit();
		if (!rateLimitCheck.allowed) {
			return json(
				{
					error: 'Rate limit exceeded',
					message: `Please wait ${Math.ceil(
						(rateLimitCheck.waitTime || 0) / 1000
					)} seconds before trying again`,
					retryAfter: rateLimitCheck.waitTime
				},
				{ status: 429 }
			);
		}

		const body = await request.json();

		// Update rate limit counter
		updateRateLimit();

		// Forward the request to Together.ai API
		const response = await fetch(`${TOGETHER_BASE_URL}/chat/completions`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Together.ai API error:', errorText);

			// Handle specific rate limit errors
			if (response.status === 429 || errorText.includes('rate limit')) {
				return json(
					{
						error: 'API rate limit exceeded',
						message: 'The AI service is currently busy. Please try again in a few minutes.',
						retryAfter: 60000 // 1 minute
					},
					{ status: 429 }
				);
			}

			return json(
				{ error: `Together.ai API error: ${response.status} - ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('API route error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		if (!API_KEY) {
			return json({ error: 'Together.ai API key is not configured' }, { status: 500 });
		}

		// Get available models
		const response = await fetch(`${TOGETHER_BASE_URL}/models`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Together.ai API error:', errorText);
			return json(
				{ error: `Together.ai API error: ${response.status} - ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('API route error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
