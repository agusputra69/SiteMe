<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle, Edit3, Eye, Download, User, FileText, Briefcase, GraduationCap, Star } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let show: boolean = false;
	export let extractedData: any = null;
	export let fileName: string = '';

	function handleEditData() {
		dispatch('edit');
	}

	function handleProceed() {
		dispatch('proceed');
	}

	function handleDownload() {
		dispatch('download');
	}

	function handleClose() {
		dispatch('close');
	}

	// Calculate extraction statistics
	$: stats = extractedData ? {
		name: extractedData.name || 'Not found',
		email: extractedData.email || 'Not found',
		phone: extractedData.phone || 'Not found',
		experience: extractedData.experience?.length || 0,
		education: extractedData.education?.length || 0,
		skills: extractedData.skills?.length || 0,
		certifications: extractedData.certifications?.length || 0,
		languages: extractedData.languages?.length || 0,
		projects: extractedData.projects?.length || 0,
		awards: extractedData.awards?.length || 0,
		summary: extractedData.summary ? 'Found' : 'Not found'
	} : null;
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="p-6 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center space-x-3">
					<div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
						<CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-bold text-gray-900 dark:text-white">
							PDF Successfully Processed!
						</h3>
						<p class="text-gray-600 dark:text-gray-300 mt-1">
							Your resume has been extracted and converted to a profile
						</p>
					</div>
				</div>
			</div>

			<!-- File Info -->
			<div class="p-6 bg-gray-50 dark:bg-gray-700/50">
				<div class="flex items-center space-x-3">
					<FileText class="w-5 h-5 text-gray-500" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
							{fileName}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Successfully processed and converted to profile data
						</p>
					</div>
				</div>
			</div>

			<!-- Extraction Summary -->
			{#if stats}
				<div class="p-6">
					<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Extracted Information
					</h4>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Personal Info -->
						<div class="space-y-3">
							<h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
								<User class="w-4 h-4 mr-2" />
								Personal Information
							</h5>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Name:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.name}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Email:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.email}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Phone:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.phone}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Summary:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.summary}</span>
								</div>
							</div>
						</div>

						<!-- Professional Info -->
						<div class="space-y-3">
							<h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
								<Briefcase class="w-4 h-4 mr-2" />
								Professional Information
							</h5>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Experience:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.experience} entries</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Education:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.education} entries</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Skills:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.skills} skills</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Certifications:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.certifications} entries</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Languages:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.languages} entries</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Projects:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.projects} entries</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Awards:</span>
									<span class="font-medium text-gray-900 dark:text-white">{stats.awards} entries</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Quality Indicator -->
					<div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<div class="flex items-center space-x-2">
							<Star class="w-4 h-4 text-blue-600 dark:text-blue-400" />
							<span class="text-sm font-medium text-blue-900 dark:text-blue-100">
								Extraction Quality: {
									stats.experience > 0 && stats.education > 0 && stats.skills > 0 && (stats.certifications > 0 || stats.languages > 0 || stats.projects > 0 || stats.awards > 0) ? 'Excellent' : 
									stats.experience > 0 && stats.education > 0 ? 'Good' : 
									stats.experience > 0 || stats.education > 0 ? 'Fair' : 'Basic'
								}
							</span>
						</div>
						<p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
							{stats.experience > 0 && stats.education > 0 && stats.skills > 0 && (stats.certifications > 0 || stats.languages > 0 || stats.projects > 0 || stats.awards > 0)
								? 'All major sections were successfully extracted, including additional details. Your profile is comprehensive!'
								: stats.experience > 0 && stats.education > 0 
									? 'Core sections were extracted. Consider adding certifications, languages, projects, or awards for a complete profile.'
									: stats.experience > 0 || stats.education > 0 
										? 'Basic sections were extracted. Please review and add missing details.'
										: 'Limited information was extracted. Please review and add missing details.'
							}
						</p>
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="p-6 border-t border-gray-200 dark:border-gray-700">
				<div class="flex flex-col sm:flex-row gap-3">
					<button
						on:click={handleEditData}
						class="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
					>
						<Edit3 class="w-4 h-4 mr-2" />
						Edit Profile Data
					</button>
					
					<button
						on:click={handleProceed}
						class="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
					>
						<Eye class="w-4 h-4 mr-2" />
						View Profile
					</button>
					
					<button
						on:click={handleDownload}
						class="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<Download class="w-4 h-4 mr-2" />
						Download Data
					</button>
				</div>
				
				<div class="mt-4 text-center">
					<button
						on:click={handleClose}
						class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if} 