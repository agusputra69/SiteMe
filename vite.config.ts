import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true, // Makes the server accessible over the network
		port: 5173  // Optional: specify a port
	}
}); 