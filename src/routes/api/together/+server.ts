import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TOGETHER_API_KEY } from '$env/static/private';

// Fallback to VITE_ prefixed version if the private one is not available
const API_KEY = TOGETHER_API_KEY || process.env.VITE_TOGETHER_API_KEY;
const TOGETHER_BASE_URL = 'https://api.together.xyz';

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!API_KEY) {
      return json(
        { error: 'Together.ai API key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Forward the request to Together.ai API
    const response = await fetch(`${TOGETHER_BASE_URL}/inference`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async () => {
  try {
    if (!API_KEY) {
      return json(
        { error: 'Together.ai API key is not configured' },
        { status: 500 }
      );
    }

    // Get available models
    const response = await fetch(`${TOGETHER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
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
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};