<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, getValidSession } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github } from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';

	let email = '';
	let password = '';
	let loading = false;
	let showPassword = false;
	let errorMessage = '';
	let successMessage = '';

	onMount(async () => {
		// Check if user is already logged in
		try {
			const { session } = await getValidSession();
			if (session) {
				goto('/dashboard');
			}
		} catch (error) {
			// Ignore errors on login page, user can try to login again
			console.log('Session check failed on login page:', error);
		}
	});

	async function handleEmailLogin() {
		if (!email || !password) {
			toasts.error('Please fill in all fields');
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				toasts.error(error.message);
			} else {
				toasts.success('Login successful! Redirecting...');
				// Use requestAnimationFrame for better performance
				requestAnimationFrame(() => {
					goto('/dashboard');
				});
			}
		} catch (error) {
			errorMessage = 'Login error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleGithubLogin() {
		loading = true;
		errorMessage = '';

		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'github',
				options: {
					redirectTo: `${window.location.origin}/dashboard`
				}
			});

			if (error) {
				toasts.error(error.message);
				loading = false;
			} else {
				toasts.info('Redirecting to GitHub for authentication...');
			}
		} catch (error) {
			errorMessage = 'GitHub login error. Please try again.';
			loading = false;
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Sign In - SiteMe</title>
	<meta name="description" content="Sign in to your SiteMe account" />
</svelte:head>

<div
	class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<a
				href="/"
				class="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
				aria-label="Return to home page"
			>
				<ArrowLeft class="w-4 h-4 mr-2" aria-hidden="true" />
				Back to Home
			</a>

			<div class="flex items-center justify-center mb-6">
				<div
					class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:rotate-3"
					role="img"
					aria-label="SiteMe logo"
				>
					<span
						class="text-white font-bold text-2xl hover:scale-110 transition-transform duration-300"
						>S</span
					>
				</div>
			</div>

			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-300">Sign in to your SiteMe account</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
			{#if errorMessage}
				<div
					class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
					role="alert"
					aria-live="polite"
				>
					<p class="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
				</div>
			{/if}

			{#if successMessage}
				<div
					class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
					role="alert"
					aria-live="polite"
				>
					<p class="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
				</div>
			{/if}

			<!-- Email/Password Form -->
			<form on:submit|preventDefault={handleEmailLogin} class="space-y-6" aria-label="Sign in form">
				<div>
					<label
						for="email"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Email address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="h-5 w-5 text-gray-400" aria-hidden="true" />
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your email"
							aria-describedby="email-help"
							autocomplete="email"
						/>
					</div>
				</div>

				<div>
					<label
						for="password"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" aria-hidden="true" />
						</div>
						{#if showPassword}
							<input
								id="password"
								type="text"
								bind:value={password}
								required
								class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your password"
								aria-describedby="password-help"
								autocomplete="current-password"
							/>
						{:else}
							<input
								id="password"
								type="password"
								bind:value={password}
								required
								class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your password"
								aria-describedby="password-help"
								autocomplete="current-password"
							/>
						{/if}
						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							aria-pressed={showPassword}
						>
							{#if showPassword}
								<EyeOff
									class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									aria-hidden="true"
								/>
							{:else}
								<Eye
									class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									aria-hidden="true"
								/>
							{/if}
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							type="checkbox"
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							aria-describedby="remember-me-help"
						/>
						<label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
							Remember me
						</label>
					</div>

					<div class="text-sm">
						<a
							href="/forgot-password"
							class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
							aria-label="Reset your password"
						>
							Forgot your password?
						</a>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
					aria-label="Sign in to your account"
					aria-busy={loading}
				>
					{#if loading}
						<div class="flex items-center justify-center">
							<div
								class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
								aria-hidden="true"
							/>
							Signing in...
						</div>
					{:else}
						Sign in
					{/if}
				</button>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300 dark:border-gray-600" />
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
							>Or continue with</span
						>
					</div>
				</div>

				<div class="mt-6">
					<button
						on:click={handleGithubLogin}
						disabled={loading}
						class="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
						aria-label="Sign in with GitHub"
						aria-busy={loading}
					>
						{#if loading}
							<div class="flex items-center justify-center">
								<div
									class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-white mr-2"
									aria-hidden="true"
								/>
								Connecting...
							</div>
						{:else}
							<Github class="w-5 h-5 mr-2" aria-hidden="true" />
							GitHub
						{/if}
					</button>
				</div>
			</div>

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Don't have an account?
					<a
						href="/signup"
						class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
						aria-label="Create a new account"
					>
						Sign up
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
