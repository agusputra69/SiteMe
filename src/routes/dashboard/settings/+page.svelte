<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase, getProfile, updateProfile, getValidSession, handleAuthError } from '$lib/supabase';
  import { toasts } from '$lib/stores/toast';
  import { 
    ArrowLeft, 
    User, 
    Mail, 
    Shield, 
    Bell, 
    Globe, 
    Trash2, 
    Save,
    Eye,
    EyeOff,
    Key,
    Download,
    Upload
  } from 'lucide-svelte';
  import ConfirmDialog from '../../../components/ConfirmDialog.svelte';

  let user: any = null;
  let profile: any = null;
  let loading = false;
  let saving = false;
  let showDeleteConfirm = false;
  let showPasswordChange = false;
  let passwordData = {
    current: '',
    new: '',
    confirm: ''
  };
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;

  // Profile settings
  let profileSettings = {
    full_name: '',
    email: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: ''
  };

  // Notification settings
  let notificationSettings = {
    email_notifications: true,
    marketing_emails: false,
    security_alerts: true,
    weekly_digest: true
  };

  // Privacy settings
  let privacySettings = {
    profile_visibility: 'public',
    show_email: false,
    show_location: true,
    analytics_enabled: true
  };

  onMount(async () => {
    try {
      const { session, error } = await getValidSession();
      if (error || !session) {
        goto('/login');
        return;
      }
      user = session.user;
      await loadProfile();
    } catch (error) {
      console.error('Settings auth error:', error);
      await handleAuthError(error);
      goto('/login');
      return;
    }
  });

  async function loadProfile() {
    if (!user) return;

    loading = true;
    try {
      const { data, error } = await getProfile(user.id);
      if (error) {
        console.error('Error loading profile:', error);
        toasts.error('Failed to load profile data');
        return;
      }

      profile = data;
      
      // Populate profile settings
      profileSettings = {
        full_name: profile?.full_name || '',
        email: user?.email || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        location: profile?.location || '',
        website: profile?.website || '',
        twitter: profile?.twitter || '',
        linkedin: profile?.linkedin || '',
        github: profile?.github || ''
      };
    } catch (error) {
      console.error('Error loading profile:', error);
      toasts.error('Failed to load profile data');
    } finally {
      loading = false;
    }
  }

  async function saveProfileSettings() {
    if (!user) return;

    saving = true;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileSettings.full_name,
          username: profileSettings.username,
          bio: profileSettings.bio,
          location: profileSettings.location,
          website: profileSettings.website,
          twitter: profileSettings.twitter,
          linkedin: profileSettings.linkedin,
          github: profileSettings.github,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toasts.error('Failed to update profile');
        return;
      }

      toasts.success('Profile updated successfully!');
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toasts.error('Failed to update profile');
    } finally {
      saving = false;
    }
  }

  async function changePassword() {
    if (passwordData.new !== passwordData.confirm) {
      toasts.error('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 6) {
      toasts.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) {
        console.error('Error changing password:', error);
        toasts.error('Failed to change password');
        return;
      }

      toasts.success('Password changed successfully!');
      passwordData = { current: '', new: '', confirm: '' };
      showPasswordChange = false;
    } catch (error) {
      console.error('Error changing password:', error);
      toasts.error('Failed to change password');
    }
  }

  async function deleteAccount() {
    try {
      // First delete profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toasts.error('Failed to delete profile data');
        return;
      }

      // Sign out user
      await supabase.auth.signOut();
      
      toasts.success('Account deleted successfully');
      goto('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toasts.error('Failed to delete account');
    }
  }

  async function exportData() {
    try {
      const { data, error } = await getProfile(user.id);
      if (error) {
        toasts.error('Failed to export data');
        return;
      }

      const exportData = {
        profile: data,
        exported_at: new Date().toISOString(),
        user_id: user.id
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `siteme-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toasts.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toasts.error('Failed to export data');
    }
  }
</script>

<div class="container mx-auto px-4 py-6">
  <!-- Header -->
  <div class="flex items-center space-x-4 mb-8">
    <button
      on:click={() => goto('/dashboard')}
      class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
    </button>
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        Account Settings
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Manage your account preferences and security
      </p>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">Loading settings...</span>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Settings -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Profile Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <User class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Update your personal information
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                bind:value={profileSettings.full_name}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileSettings.email}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readonly
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">siteme.app/u/</span>
                <input
                  type="text"
                  bind:value={profileSettings.username}
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="your-username"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                bind:value={profileSettings.location}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="City, Country"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                bind:value={profileSettings.bio}
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              on:click={saveProfileSettings}
              disabled={saving}
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save class="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Globe class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Social Links
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Connect your social profiles
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                bind:value={profileSettings.website}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                bind:value={profileSettings.linkedin}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="linkedin.com/in/username"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="text"
                bind:value={profileSettings.github}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="github.com/username"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="text"
                bind:value={profileSettings.twitter}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="@username"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              on:click={saveProfileSettings}
              disabled={saving}
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save class="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Security
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Manage your account security
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">Password</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Change your account password</p>
              </div>
              <button
                on:click={() => showPasswordChange = !showPasswordChange}
                class="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Key class="w-4 h-4 mr-2 inline" />
                Change Password
              </button>
            </div>

            {#if showPasswordChange}
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div class="relative">
                      <input
                        type="password"
                        bind:value={passwordData.new}
                        class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        on:click={() => showNewPassword = !showNewPassword}
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {#if showNewPassword}
                          <EyeOff class="w-4 h-4" />
                        {:else}
                          <Eye class="w-4 h-4" />
                        {/if}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div class="relative">
                      <input
                        type="password"
                        bind:value={passwordData.confirm}
                        class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        on:click={() => showConfirmPassword = !showConfirmPassword}
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {#if showConfirmPassword}
                          <EyeOff class="w-4 h-4" />
                        {:else}
                          <Eye class="w-4 h-4" />
                        {/if}
                      </button>
                    </div>
                  </div>

                  <div class="flex space-x-3">
                    <button
                      on:click={changePassword}
                      class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </button>
                    <button
                      on:click={() => {
                        showPasswordChange = false;
                        passwordData = { current: '', new: '', confirm: '' };
                      }}
                      class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div class="space-y-3">
            <button
              on:click={exportData}
              class="w-full flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Download class="w-4 h-4 mr-3" />
              Export Data
            </button>
            
            <button
              class="w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              disabled
            >
              <Upload class="w-4 h-4 mr-3" />
              Import Data (Coming Soon)
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            Danger Zone
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            on:click={() => showDeleteConfirm = true}
            class="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Account"
  message="⚠️ WARNING: This will permanently delete your account and all associated data. This action cannot be undone."
  confirmText="Delete Account"
  cancelText="Cancel"
  type="danger"
  on:confirm={deleteAccount}
  on:cancel={() => showDeleteConfirm = false}
/>