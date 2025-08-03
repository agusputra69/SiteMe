<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase, getValidSession, handleAuthError } from '$lib/supabase';
  import { toasts } from '$lib/stores/toast';
  import { 
    Globe, 
    Edit3, 
    Plus, 
    Calendar, 
    ExternalLink, 
    Trash2, 
    Eye,
    ArrowLeft,
    FileText
  } from 'lucide-svelte';
  import ConfirmDialog from '../../../components/ConfirmDialog.svelte';

  let user: any = null;
  let profile: any = null;
  let sites: any[] = [];
  let loading = false;
  let deleting = false;
  let showDeleteConfirm = false;
  let siteToDelete: any = null;

  onMount(async () => {
    try {
      const { session, error } = await getValidSession();
      if (error || !session) {
        goto('/login');
        return;
      }
      user = session.user;
      await loadProfile();
      await loadSites();
    } catch (error) {
      console.error('Sites auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    }
  });

  async function loadProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    profile = data;
  }

  async function loadSites() {
    if (!user) return;

    loading = true;
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading sites:', error);
      toasts.error('Failed to load sites');
      return;
    }

    sites = data || [];
    loading = false;
  }

  async function deleteSite(siteId: string) {
    deleting = true;
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting site:', error);
      toasts.error('Failed to delete site');
      return;
    }

    toasts.success('Site deleted successfully');
    await loadSites();
    deleting = false;
    showDeleteConfirm = false;
    siteToDelete = null;
  }

  function handleDeleteClick(site: any) {
    siteToDelete = site;
    showDeleteConfirm = true;
  }

  function editSite(siteId: string) {
    goto(`/dashboard/editor/${siteId}`);
  }

  function createNewSite() {
    goto('/dashboard/create');
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>My Sites - SiteMe</title>
  <meta name="description" content="Manage your SiteMe websites" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Sites
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Kelola website Anda (maksimal 3 site)
          </p>
        </div>
      </div>
      
      <button
        on:click={createNewSite}
        disabled={sites.length >= 3}
        class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Plus class="w-4 h-4 mr-2" />
        Buat Site Baru
      </button>
    </div>

    {#if loading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Memuat sites...</p>
      </div>
    {:else if sites.length === 0}
      <!-- Empty State -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Belum Ada Site
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Anda belum membuat website apapun. Mulai dengan membuat site pertama Anda!
        </p>
        <button
          on:click={createNewSite}
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus class="w-5 h-5 mr-2" />
          Buat Site Pertama
        </button>
      </div>
    {:else}
      <!-- Sites Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each sites as site (site.id)}
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-200">
            <!-- Site Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <h3 class="font-bold text-gray-900 dark:text-white text-lg">
                    {site.name}
                  </h3>
                  {#if site.status === 'published'}
                    <span class="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      <Globe class="w-3 h-3 mr-1" />
                      Live
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                      Draft
                    </span>
                  {/if}
                  {#if site.is_primary}
                    <span class="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                      Primary
                    </span>
                  {/if}
                </div>
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <Calendar class="w-3 h-3 mr-1" />
                    {formatDate(site.updated_at)}
                  </span>
                  <span class="capitalize">{site.template} template</span>
                </div>
              </div>
            </div>

            <!-- Site Preview -->
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 mb-4 flex items-center justify-center">
              <FileText class="w-8 h-8 text-gray-400" />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button
                on:click={() => editSite(site.id)}
                class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 class="w-3 h-3 mr-1" />
                Edit
              </button>
              
              {#if site.status === 'published' && profile?.username}
                <button
                  on:click={() => window.open(`/u/${profile.username}`, '_blank')}
                  class="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLink class="w-3 h-3 mr-1" />
                  View
                </button>
              {:else}
                <button
                  on:click={() => editSite(site.id)}
                  class="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye class="w-3 h-3 mr-1" />
                  Preview
                </button>
              {/if}
              
              <button
                on:click={() => handleDeleteClick(site)}
                class="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Site Limit Info -->
      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Info:</strong> Anda dapat membuat maksimal 3 website. Saat ini Anda memiliki {sites.length}/3 website.
          {#if sites.length >= 3}
            Hapus website yang tidak diperlukan untuk membuat yang baru.
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Hapus Website"
  message="Apakah Anda yakin ingin menghapus website '{siteToDelete?.name}'? Tindakan ini tidak dapat dibatalkan."
  confirmText="Hapus"
  cancelText="Batal"
  type="danger"
  on:confirm={() => deleteSite(siteToDelete.id)}
  on:cancel={() => {
    showDeleteConfirm = false;
    siteToDelete = null;
  }}
/>