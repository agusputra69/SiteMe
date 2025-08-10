<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Moon, Sun, Menu, X, User as UserIcon, Copy, Check, LogOut } from 'lucide-svelte';
	import { supabase, handleAuthError, getValidSession } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { toasts } from '$lib/stores/toast';
	import type { User } from '@supabase/supabase-js';
	import type { Profile } from '$lib/types';
	import { handleError, handleAuthError as handleAuthErr } from '$lib/error-handler';
	import Logo from '../components/Logo.svelte';
	import '../app.css';

	let theme: 'light' | 'dark' = 'light';
	let mobileMenuOpen = false;
	let user: User | null = null;
	let profile: Profile | null = null;
	let scrollProgress = 0;
	let copied = false;
	let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

	$: isOnDashboard = $page.url.pathname.startsWith('/dashboard');

	onMount(() => {
		// Get theme from localStorage or default to light
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
		if (savedTheme) {
			theme = savedTheme;
		} else {
			// Check system preference
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
		}
		applyTheme();

		// Handle scroll progress
		function handleScroll() {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			scrollProgress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });

		// Initialize auth with proper state management
		let authInitialized = false;
		let profileLoading = false;
		
		(async () => {
			try {
				const { session, error } = await getValidSession();

				if (error) {
					handleAuthErr(error, {
						component: 'MainLayout',
						action: 'sessionValidation',
						userMessage: 'Session validation failed'
					});
					user = null;
					profile = null;
				} else {
					user = session?.user || null;

					if (user && !profileLoading) {
						profileLoading = true;
						try {
							await loadProfile();
						} finally {
							profileLoading = false;
						}
					}
				}
				authInitialized = true;
			} catch (error) {
				handleAuthErr(error, {
					component: 'MainLayout',
					action: 'authInitialization',
					userMessage: 'Authentication initialization failed'
				});
				user = null;
				profile = null;
				authInitialized = true;
			}

			// Listen for auth changes with race condition protection
			supabase.auth.onAuthStateChange(async (event, session) => {
				if (!authInitialized) return; // Wait for initial auth to complete
				
				if (event === 'SIGNED_OUT' || !session?.user) {
					user = null;
					profile = null;
					profileLoading = false;
					// Redirect to login if on protected route
					if ($page.url.pathname.startsWith('/dashboard')) {
						goto('/login');
					}
				} else if (session.user.id !== user?.id) {
					// Only update if user actually changed
					user = session.user;
					if (user && !profileLoading) {
						profileLoading = true;
						try {
							await loadProfile();
						} finally {
							profileLoading = false;
						}
					}
				}
			});
		})();

		// Return cleanup function
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		applyTheme();
	}

	function applyTheme() {
		document.documentElement.setAttribute('data-theme', theme);
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	async function loadProfile() {
		if (!user?.id) return;
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					// Profile not found, this is okay for new users
					profile = null;
				} else {
					const wasAuthError = await handleAuthError(error);
					if (wasAuthError) {
						// Authentication error, redirect if needed
						user = null;
						profile = null;
						if ($page.url.pathname.startsWith('/dashboard')) {
							goto('/login');
						}
					} else {
						handleError(error, {
							component: 'MainLayout',
							action: 'loadProfile',
							userMessage: 'Failed to load profile'
						});
					}
				}
				return;
			}

			profile = data;
		} catch (error) {
			// Check if it's an auth-related error
			const wasAuthError = await handleAuthError(error);
			if (wasAuthError) {
				user = null;
				profile = null;
				if ($page.url.pathname.startsWith('/dashboard')) {
					goto('/login');
				}
			} else {
				handleError(error, {
					component: 'MainLayout',
					action: 'loadProfile',
					userMessage: 'Failed to load profile'
				});
			}
		}
	}

	async function copyProfileUrl() {
		if (!profile?.username) return;

		const url = `${window.location.origin}/u/${profile.username}`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			toasts.success('Profile URL copied to clipboard!');
			
			// Clear any existing timeout
			if (copiedTimeout) {
				clearTimeout(copiedTimeout);
			}
			
			copiedTimeout = setTimeout(() => {
				copied = false;
				copiedTimeout = null;
			}, 2000);
		} catch (error) {
			toasts.error('Failed to copy URL');
		}
	}

	async function handleLogout() {
		try {
			await supabase.auth.signOut();
			toasts.success('Successfully logged out');
			goto('/');
		} catch (error) {
			handleError(error, {
				component: 'MainLayout',
				action: 'logout',
				userMessage: 'Failed to log out'
			});
		}
	}

	// Cleanup on component destroy
	onDestroy(() => {
		if (copiedTimeout) {
			clearTimeout(copiedTimeout);
		}
	});
</script>

<svelte:head>
	<title>SiteMe - AI-Powered Resume-to-Website Builder</title>
	<meta
		name="description"
		content="Transform your resume into a beautiful personal website with AI"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<!-- Header (hidden on dashboard pages) -->
	{#if !isOnDashboard}
		<header
			class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40"
			role="banner"
		>
			<div class="container mx-auto px-4">
				<div class="flex items-center justify-between h-16">
					<!-- Logo / Dashboard Title -->
					{#if isOnDashboard}
						<div class="flex items-center space-x-4">
							<a
								href="/dashboard"
								class="flex items-center space-x-2"
								aria-label="Go to dashboard home"
							>
								<div
									class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center p-1.5"
									role="img"
									aria-label="SiteMe logo"
								>
									<Logo className="w-full h-full" textColor="text-white" />
								</div>
								<span class="text-xl font-bold text-gray-900 dark:text-white">SiteMe</span>
							</a>
						</div>
					{:else}
						<a
							href="/"
							class="flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
							aria-label="Go to SiteMe homepage"
						>
							<div
								class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:rotate-3 p-1.5"
								role="img"
								aria-label="SiteMe logo"
							>
								<Logo className="w-full h-full group-hover:scale-110 transition-transform duration-300" textColor="text-white" />
							</div>
							<span
								class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
								>SiteMe</span
							>
						</a>
					{/if}

					<!-- Desktop Navigation -->
					<nav
						class="hidden md:flex items-center space-x-8"
						role="navigation"
						aria-label="Main navigation"
					>
						{#if isOnDashboard}
							<!-- Dashboard Navigation - Simplified and more relevant -->
							<a
								href="/dashboard"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}
							>
								My Resume
							</a>
							<a
								href="/dashboard/profile"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/dashboard/profile' ? 'page' : undefined}
							>
								Edit Profile
							</a>
							<a
								href="/templates"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/templates' ? 'page' : undefined}
							>
								Choose Template
							</a>
						{:else}
							<!-- Marketing Navigation - Streamlined -->
							<a
								href="/features"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/features' ? 'page' : undefined}
							>
								Features
							</a>
							<a
								href="/templates"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/templates' ? 'page' : undefined}
							>
								Templates
							</a>
							<a
								href="/pricing"
								class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								aria-current={$page.url.pathname === '/pricing' ? 'page' : undefined}
							>
								Pricing
							</a>
						{/if}
					</nav>

					<!-- Right side actions -->
					<div class="flex items-center space-x-2 lg:space-x-4">
						<!-- Theme toggle -->
						<button
							on:click={toggleTheme}
							class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
							aria-label="Toggle {theme === 'light' ? 'dark' : 'light'} theme"
							aria-pressed={theme === 'dark'}
						>
							{#if theme === 'light'}
								<Moon class="w-5 h-5" aria-hidden="true" />
							{:else}
								<Sun class="w-5 h-5" aria-hidden="true" />
							{/if}
						</button>

						<!-- Auth buttons -->
						<div class="hidden md:flex items-center space-x-2 lg:space-x-3">
							{#if user}
								{#if isOnDashboard}
									<!-- Dashboard-specific actions - Improved UX -->
									{#if profile?.username}
										<div
											class="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full"
										>
											<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
											<span class="text-xs font-medium text-green-700 dark:text-green-300"
												>Published</span
											>
										</div>
										<button
											on:click={copyProfileUrl}
											class="inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
											aria-label={copied
												? 'Profile URL copied to clipboard'
												: 'Copy profile URL to clipboard'}
											aria-pressed={copied}
										>
											{#if copied}
												<Check class="w-4 h-4 lg:mr-2" aria-hidden="true" />
												<span class="hidden lg:inline">Copied!</span>
											{:else}
												<Copy class="w-4 h-4 lg:mr-2" aria-hidden="true" />
												<span class="hidden lg:inline">Share URL</span>
											{/if}
										</button>
									{:else}
										<div
											class="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full"
										>
											<div class="w-2 h-2 bg-orange-500 rounded-full" />
											<span class="text-xs font-medium text-orange-700 dark:text-orange-300"
												>Draft</span
											>
										</div>
									{/if}
									<button
										on:click={handleLogout}
										class="inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
										aria-label="Sign out of your account"
									>
										<LogOut class="w-4 h-4 lg:mr-2" aria-hidden="true" />
										<span class="hidden lg:inline">Sign Out</span>
									</button>
								{:else}
									<a
										href="/dashboard"
										class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
									>
										Dashboard
									</a>
									<button
										on:click={handleLogout}
										class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
									>
										Sign Out
									</button>
								{/if}
							{:else}
								<a
									href="/login"
									class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
								>
									Sign In
								</a>
							{/if}
						</div>

						<!-- Mobile menu button -->
						<button
							on:click={toggleMobileMenu}
							class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
							aria-label="Toggle mobile menu"
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							<div class="relative w-5 h-5">
								<X
									class="w-5 h-5 absolute inset-0 transition-all duration-300 {mobileMenuOpen
										? 'opacity-100 rotate-0'
										: 'opacity-0 rotate-90'}"
									aria-hidden="true"
								/>
								<Menu
									class="w-5 h-5 absolute inset-0 transition-all duration-300 {mobileMenuOpen
										? 'opacity-0 -rotate-90'
										: 'opacity-100 rotate-0'}"
									aria-hidden="true"
								/>
							</div>
						</button>
					</div>
				</div>

				<!-- Mobile Navigation -->
				<div
					id="mobile-menu"
					class="md:hidden overflow-hidden transition-all duration-300 {mobileMenuOpen
						? 'max-h-96 opacity-100'
						: 'max-h-0 opacity-0'}"
					role="navigation"
					aria-label="Mobile navigation"
				>
					<div class="py-4 border-t border-gray-200 dark:border-gray-700">
						<nav
							class="flex flex-col space-y-4 transform transition-transform duration-300 {mobileMenuOpen
								? 'translate-y-0'
								: '-translate-y-4'}"
						>
							{#if isOnDashboard}
								<!-- Dashboard Mobile Navigation - Simplified -->
								<a
									href="/dashboard"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									My Resume
								</a>
								<a
									href="/dashboard/profile"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									Edit Profile
								</a>
								<a
									href="/templates"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									Choose Template
								</a>
							{:else}
								<!-- Marketing Mobile Navigation - Streamlined -->
								<a
									href="/features"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									Features
								</a>
								<a
									href="/templates"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									Templates
								</a>
								<a
									href="/pricing"
									class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
								>
									Pricing
								</a>
							{/if}
							<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
								{#if user}
									{#if !isOnDashboard}
										<a
											href="/dashboard"
											class="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-3"
										>
											Dashboard
										</a>
									{/if}
									<button
										on:click={handleLogout}
										class="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
									>
										Sign Out
									</button>
								{:else}
									<a
										href="/login"
										class="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
									>
										Sign In
									</a>
								{/if}
							</div>
						</nav>
					</div>
				</div>
			</div>

			<!-- Progress Line at bottom of navbar -->
			<div class="w-full h-1 bg-gray-100 dark:bg-gray-800/50 relative">
				<div
					class="h-full bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-blue-500 dark:via-purple-500 dark:to-blue-600 transition-all duration-150 ease-out shadow-lg border-t border-gray-300 dark:border-none relative"
					style="width: {scrollProgress}%; {theme === 'dark'
						? 'box-shadow: 0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(147, 51, 234, 0.4);'
						: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);'}"
				>
					<!-- Light circular ray at the tip for light mode -->
					{#if scrollProgress > 0 && theme !== 'dark'}
						<div
							class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800 opacity-90"
							style="box-shadow: 0 0 6px rgba(0, 0, 0, 0.3), 0 0 12px rgba(0, 0, 0, 0.2), 0 0 18px rgba(0, 0, 0, 0.1);"
						/>
					{/if}
				</div>
			</div>
		</header>
	{/if}

	<!-- Main content -->
	<main class={isOnDashboard ? '' : 'pt-[68px]'}>
		<slot />
	</main>

	<!-- Footer - Hidden as requested, can be restored later if needed
  <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="md:col-span-2">
          <div class="flex items-center space-x-2 mb-4 group">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 p-1.5">
              <Logo className="w-full h-full" textColor="text-white" />
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">SiteMe</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
            Transform your resume into a beautiful personal website with AI. 
            Build your online brand in minutes.
          </p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
          <ul class="space-y-2">
            <li><a href="/features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="/pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a></li>
            <li><a href="/docs" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
          <ul class="space-y-2">
            <li><a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a></li>
            <li><a href="/blog" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="/contact" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          © 2024 SiteMe. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="/privacy" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
  -->

	<!-- Toast Container -->
	<ToastContainer />
</div>
