<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase, getProfile, getValidSession, handleAuthError } from '$lib/supabase';
	import TemplateSelector from '../../../../components/TemplateSelector.svelte';
	import ProfileEditor from '../../../../components/ProfileEditor.svelte';
	import { toasts } from '$lib/stores/toast';
	import { ArrowLeft, Save, Eye, Settings, Palette, Layout, Globe, Trash2 } from 'lucide-svelte';
	import ConfirmDialog from '../../../../components/ConfirmDialog.svelte';

	let user: any = null;
	let profile: any = null;
	let site: any = null;
	let resumeData: any = null;
	let errorMessage = '';
	let loading = false;
	let saving = false;
	let deleting = false;
	let activeTab: 'content' | 'design' | 'settings' = 'content';
	let showPreview = false;
	let showDeleteConfirm = false;
	let isNewSite = false;
	let siteId: string;

	$: siteId = $page.params.siteId || '';
	$: isNewSite = siteId === 'new';

	onMount(async () => {
		try {
			const { session, error } = await getValidSession();
			if (error || !session) {
				goto('/login');
				return;
			}
			user = session.user;
			await loadProfile();

			if (isNewSite) {
				await createNewSite();
			} else {
				await loadSite();
			}
		} catch (error) {
			errorMessage = 'Authentication error. Please try again.';
			await handleAuthError(error);
			goto('/login');
			return;
		}
	});

	async function loadProfile() {
		if (!user) return;

		const { data, error } = await getProfile(user.id);
		if (error) {
			errorMessage = 'Error loading profile. Please try again.';
			toasts.error('Failed to load profile data');
			return;
		}

		profile = data;
	}

	async function loadSite() {
		if (!user || isNewSite) return;

		loading = true;
		const { data, error } = await supabase
			.from('sites')
			.select('*')
			.eq('id', siteId)
			.eq('user_id', user.id)
			.single();

		if (error) {
			errorMessage = 'Error loading site. Please try again.';
			toasts.error('Site not found');
			goto('/dashboard');
			return;
		}

		site = data;
		resumeData = site.data || getDefaultResumeData();
		loading = false;
	}

	async function createNewSite() {
		if (!user) return;

		// Check if this is manual mode
		const urlParams = new URLSearchParams(window.location.search);
		const mode = urlParams.get('mode');

		if (mode === 'manual') {
			// Create empty site for manual editing
			const { data, error } = await supabase
				.from('sites')
				.insert({
					user_id: user.id,
					name: 'New Website',
					data: getDefaultResumeData(),
					template: 'modern',
					status: 'draft'
				})
				.select()
				.single();

			if (error) {
				errorMessage = 'Error creating site. Please try again.';
				toasts.error('Failed to create new website');
				goto('/dashboard');
				return;
			}

			site = data;
			resumeData = site.data;

			// Update URL to reflect the new site ID
			window.history.replaceState({}, '', `/dashboard/editor/${site.id}`);
			toasts.success('New website created successfully!');
		} else {
			// Redirect to create page for other modes
			goto('/dashboard/create');
		}
	}

	function getDefaultResumeData() {
		return {
			name: '',
			email: '',
			phone: '',
			location: '',
			summary: '',
			experience: [],
			education: [],
			certifications: [],
			languages: [],
			projects: [],
			awards: [],
			skills: [],
			links: []
		};
	}

	async function handleSave(event: CustomEvent) {
		if (!user || !site) return;

		const data = event.detail.resumeData;

		saving = true;
		try {
			const { error } = await supabase
				.from('sites')
				.update({
					data: data,
					updated_at: new Date().toISOString()
				})
				.eq('id', site.id)
				.eq('user_id', user.id);

			if (error) {
				errorMessage = 'Error saving site. Please try again.';
				toasts.error('Failed to save website');
				return;
			}

			resumeData = data;
			site.data = data;
			toasts.success('Website saved successfully!');
		} catch (error) {
			console.error('Error saving site:', error);
			toasts.error('Failed to save website');
		} finally {
			saving = false;
		}
	}

	async function handlePublish() {
		if (!user || !site) return;

		saving = true;
		try {
			// First, unpublish any other published sites
			await supabase
				.from('sites')
				.update({ status: 'draft', is_primary: false })
				.eq('user_id', user.id)
				.eq('status', 'published');

			// Then publish this site
			const { error } = await supabase
				.from('sites')
				.update({
					status: 'published',
					is_primary: true,
					updated_at: new Date().toISOString()
				})
				.eq('id', site.id)
				.eq('user_id', user.id);

			if (error) {
				console.error('Error publishing site:', error);
				toasts.error('Failed to publish website');
				return;
			}

			site.status = 'published';
			site.is_primary = true;
			toasts.success('Website published successfully!');
		} catch (error) {
			console.error('Error publishing site:', error);
			toasts.error('Failed to publish website');
		} finally {
			saving = false;
		}
	}

	async function handleUnpublish() {
		if (!user || !site) return;

		saving = true;
		try {
			const { error } = await supabase
				.from('sites')
				.update({
					status: 'draft',
					is_primary: false,
					updated_at: new Date().toISOString()
				})
				.eq('id', site.id)
				.eq('user_id', user.id);

			if (error) {
				console.error('Error unpublishing site:', error);
				toasts.error('Failed to unpublish website');
				return;
			}

			site.status = 'draft';
			site.is_primary = false;
			toasts.success('Website unpublished successfully!');
		} catch (error) {
			console.error('Error unpublishing site:', error);
			toasts.error('Failed to unpublish website');
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!user || !site) return;

		deleting = true;
		try {
			const { error } = await supabase
				.from('sites')
				.delete()
				.eq('id', site.id)
				.eq('user_id', user.id);

			if (error) {
				console.error('Error deleting site:', error);
				toasts.error('Failed to delete website');
				return;
			}

			toasts.success('Website deleted successfully!');
			goto('/dashboard');
		} catch (error) {
			console.error('Error deleting site:', error);
			toasts.error('Failed to delete website');
		} finally {
			deleting = false;
			showDeleteConfirm = false;
		}
	}

	function handlePreview() {
		if (profile?.username && site?.status === 'published') {
			window.open(`/u/${profile.username}`, '_blank');
		} else {
			showPreview = true;
		}
	}

	async function updateSiteName(newName: string) {
		if (!user || !site || !newName.trim()) return;

		const { error } = await supabase
			.from('sites')
			.update({
				name: newName.trim(),
				updated_at: new Date().toISOString()
			})
			.eq('id', site.id)
			.eq('user_id', user.id);

		if (error) {
			console.error('Error updating site name:', error);
			toasts.error('Failed to change website name');
			return;
		}

		site.name = newName.trim();
		toasts.success('Website name changed successfully!');
	}

	function handleSiteNameBlur(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			updateSiteName(target.value);
		}
	}

	function handleSiteNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const target = e.target as HTMLInputElement;
			if (target) {
				target.blur();
			}
		}
	}

	const tabs: Array<{ id: 'content' | 'design' | 'settings'; label: string; icon: any }> = [
		{ id: 'content', label: 'Content', icon: Layout },
		{ id: 'design', label: 'Design', icon: Palette },
		{ id: 'settings', label: 'Settings', icon: Settings }
	];
</script>

<svelte:head>
	<title>{site?.name || 'Editor'} - SiteMe</title>
	<meta name="description" content="Edit your website with SiteMe" />
</svelte:head>

{#if loading}
	<div
		class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
	>
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
			<p class="text-gray-600 dark:text-gray-300">Loading editor...</p>
		</div>
	</div>
{:else if site && resumeData}
	<div
		class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
	>
		<div class="container mx-auto px-4 py-8">
			<!-- Header -->
			<div class="flex items-center justify-between mb-8">
				<div class="flex items-center space-x-4">
					<button
						on:click={() => goto('/dashboard')}
						class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<ArrowLeft class="w-5 h-5" />
					</button>
					<div>
						<div class="flex items-center space-x-3">
							<input
								type="text"
								bind:value={site.name}
								on:blur={handleSiteNameBlur}
								on:keydown={handleSiteNameKeydown}
								class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:bg-white dark:focus:bg-gray-800 rounded px-2 py-1 transition-colors"
							/>
							{#if site.status === 'published'}
								<span
									class="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full"
								>
									<Globe class="w-3 h-3 mr-1" />
									Live
								</span>
							{:else}
								<span
									class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-sm font-medium rounded-full"
								>
									Draft
								</span>
							{/if}
						</div>
						<p class="text-gray-600 dark:text-gray-300">Customize your professional website</p>
					</div>
				</div>

				<div class="flex items-center space-x-3">
					<button
						on:click={handlePreview}
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Eye class="w-4 h-4 mr-2" />
						Preview
					</button>

					{#if site.status === 'published'}
						<button
							on:click={handleUnpublish}
							disabled={saving}
							class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Globe class="w-4 h-4 mr-2" />
							Unpublish
						</button>
					{:else}
						<button
							on:click={handlePublish}
							disabled={saving}
							class="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Globe class="w-4 h-4 mr-2" />
							Publish
						</button>
					{/if}

					<button
						on:click={() => (showDeleteConfirm = true)}
						class="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
					>
						<Trash2 class="w-4 h-4 mr-2" />
						Delete
					</button>
				</div>
			</div>

			<!-- Tab Navigation -->
			<div class="border-b border-gray-200 dark:border-gray-700 mb-8">
				<nav class="flex space-x-8">
					{#each tabs as tab}
						<button
							on:click={() => (activeTab = tab.id)}
							class="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors"
							class:border-blue-500={activeTab === tab.id}
							class:text-blue-600={activeTab === tab.id}
							class:dark:text-blue-400={activeTab === tab.id}
							class:border-transparent={activeTab !== tab.id}
							class:text-gray-500={activeTab !== tab.id}
							class:dark:text-gray-400={activeTab !== tab.id}
							class:hover:text-gray-700={activeTab !== tab.id}
							class:dark:hover:text-gray-300={activeTab !== tab.id}
						>
							<svelte:component this={tab.icon} class="w-4 h-4" />
							<span>{tab.label}</span>
						</button>
					{/each}
				</nav>
			</div>

			<!-- Tab Content -->
			<div
				class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50"
			>
				{#if activeTab === 'content'}
					<div class="p-6">
						<ProfileEditor
							{resumeData}
							username={profile?.username || ''}
							uploading={false}
							profileStatus={site.status}
							saveSuccess={false}
							on:save={handleSave}
							on:manualCreate={() => {}}
							on:publish={handlePublish}
							on:statusChange={() => {}}
							on:templateApply={() => {}}
							on:themeApply={() => {}}
							on:customizationApply={() => {}}
							on:togglePreview={handlePreview}
							on:photoUpload={() => {}}
						/>
					</div>
				{:else if activeTab === 'design'}
					<div class="p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Template & Tema
						</h3>
						<TemplateSelector
							profileData={resumeData}
							selectedTemplate={site.template}
							on:templateSelect={(e) => {
								site.template = e.detail;
								// Save template change
								supabase
									.from('sites')
									.update({ template: e.detail })
									.eq('id', site.id)
									.eq('user_id', user.id);
							}}
						/>
					</div>
				{:else if activeTab === 'settings'}
					<div class="p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Website Settings
						</h3>
						<div class="space-y-6">
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Website Name
								</label>
								<input
									type="text"
									bind:value={site.name}
									on:blur={handleSiteNameBlur}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Status Website
								</label>
								<div class="flex items-center space-x-4">
									<span class="text-sm text-gray-600 dark:text-gray-300">
										{site.status === 'published' ? 'Published' : 'Draft'}
									</span>
									<span class="text-xs text-gray-500 dark:text-gray-400">
										Use the buttons in the header to change status or delete website
									</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div
		class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
	>
		<div class="text-center">
			<p class="text-gray-600 dark:text-gray-300 mb-4">Website not found</p>
			<button
				on:click={() => goto('/dashboard')}
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to Sites
			</button>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
	isOpen={showDeleteConfirm}
	title="Delete Website"
	message="Are you sure you want to delete website '{site?.name}'? All data will be permanently lost and cannot be recovered."
	confirmText="Delete"
	cancelText="Cancel"
	type="danger"
	on:confirm={handleDelete}
	on:cancel={() => (showDeleteConfirm = false)}
/>
