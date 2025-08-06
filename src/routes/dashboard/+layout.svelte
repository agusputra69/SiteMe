<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase, getValidSession, handleAuthError } from '$lib/supabase';
	import { Home, Edit3, Settings, LogOut, User as UserIcon, Moon, Sun } from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';
	import type { User } from '@supabase/supabase-js';
	import { handleError, handleAuthError as handleAuthErr } from '$lib/error-handler';

	let user: User | null = null;
	let loading = true;
	let theme: 'light' | 'dark' = 'light';

	onMount(async () => {
		// Initialize theme
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
		if (savedTheme) {
			theme = savedTheme;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		applyTheme();

		try {
			const { session, error } = await getValidSession();
			if (error || !session?.user) {
				goto('/login');
				return;
			}
			user = session.user;
		} catch (error) {
			handleAuthErr(error, {
				component: 'DashboardLayout',
				action: 'authentication',
				userMessage: 'Authentication failed. Please log in again.'
			});
			goto('/login');
			return;
		} finally {
			loading = false;
		}
	});

	async function handleSignOut() {
		try {
			await supabase.auth.signOut();
			toasts.success('Successfully logged out');
			goto('/');
		} catch (error) {
			handleError(error, {
				component: 'DashboardLayout',
				action: 'signOut',
				userMessage: 'Failed to log out'
			});
		}
	}

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

	$: currentPath = $page.url.pathname;

	// Simplified navigation - removed Main and Site Editor
	type NavIcon = typeof Home | typeof Edit3 | typeof Settings;
	const navItems: Array<{ path: string; label: string; icon: NavIcon }> = [];
</script>

<svelte:head>
	<title>Dashboard - SiteMe</title>
	<meta name="description" content="Manage your SiteMe profile and website" />
</svelte:head>

{#if loading}
	<div
		class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
	>
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
			<p class="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
		</div>
	</div>
{:else}
	<div
		class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
	>
		<!-- Header -->
		<header
			class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40"
		>
			<div class="container mx-auto px-4">
				<div class="flex items-center justify-between h-16">
					<!-- Logo -->
					<div class="flex items-center space-x-3">
						<span class="text-xl font-bold text-gray-900 dark:text-white">SiteMe</span>
					</div>

					<!-- Simplified Navigation - No main navigation items -->
					<nav class="hidden md:flex items-center space-x-1">
						<!-- Navigation removed as requested -->
					</nav>

					<!-- Simplified User Menu -->
					<div class="flex items-center space-x-3">
						<!-- Theme Toggle -->
						<button
							on:click={toggleTheme}
							class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							aria-label="Toggle {theme === 'light' ? 'dark' : 'light'} theme"
						>
							{#if theme === 'light'}
								<Moon class="w-5 h-5" />
							{:else}
								<Sun class="w-5 h-5" />
							{/if}
						</button>

						<!-- User Dropdown -->
						<div class="relative group">
							<button
								class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<span>{user?.email?.split('@')[0] || 'User'}</span>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>

							<!-- Dropdown Menu -->
							<div
								class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
							>
								<div class="py-1">
									<a
										href="/dashboard/settings"
										class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									>
										<Settings class="w-4 h-4" />
										<span>Account Settings</span>
									</a>
									<button
										on:click={handleSignOut}
										class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
									>
										<LogOut class="w-4 h-4" />
										<span>Sign Out</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Mobile Navigation - Simplified -->
				<div class="md:hidden border-t border-gray-200/50 dark:border-gray-700/50">
					<nav class="flex items-center justify-center py-2">
						<div class="flex items-center space-x-4">
							<a
								href="/dashboard/settings"
								class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
							>
								<Settings class="w-4 h-4" />
								<span>Settings</span>
							</a>
							<button
								on:click={handleSignOut}
								class="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
							>
								<LogOut class="w-4 h-4" />
								<span>Sign Out</span>
							</button>
						</div>
					</nav>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="pt-4">
			<slot />
		</main>
	</div>
{/if}
