<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { HelpCircle, X, Lightbulb, CheckCircle, ArrowRight } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let isVisible = false;
	export let currentContext: 'dashboard' | 'upload' | 'edit' | 'preview' = 'dashboard';

	const tutorials = {
		dashboard: {
			title: 'Dashboard Overview',
			tips: [
				{
					id: 'upload-resume',
					title: 'Upload Your Resume',
					description:
						'Click the upload button to select your PDF resume. Our AI will automatically extract your information.',
					icon: '📄',
					completed: false
				},
				{
					id: 'review-data',
					title: 'Review Extracted Data',
					description:
						'Check the automatically extracted information and make any necessary corrections.',
					icon: '✏️',
					completed: false
				},
				{
					id: 'customize-profile',
					title: 'Customize Your Profile',
					description: 'Add personal touches, upload a profile photo, and organize your sections.',
					icon: '🎨',
					completed: false
				},
				{
					id: 'preview-website',
					title: 'Preview Your Website',
					description: 'Use the preview mode to see how your website will look to visitors.',
					icon: '👀',
					completed: false
				},
				{
					id: 'publish-share',
					title: 'Publish & Share',
					description:
						'Save your profile and get a shareable URL to showcase your professional brand.',
					icon: '🚀',
					completed: false
				}
			]
		},
		upload: {
			title: 'Resume Upload Tips',
			tips: [
				{
					id: 'file-format',
					title: 'Supported Formats',
					description:
						'Upload PDF files only. Make sure your resume is text-based, not a scanned image.',
					icon: '📋',
					completed: false
				},
				{
					id: 'file-size',
					title: 'File Size Limit',
					description: 'Keep your file under 10MB for optimal processing speed.',
					icon: '⚡',
					completed: false
				},
				{
					id: 'content-quality',
					title: 'Content Quality',
					description:
						'Well-structured resumes with clear sections work best with our AI extraction.',
					icon: '⭐',
					completed: false
				}
			]
		},
		edit: {
			title: 'Profile Editing Guide',
			tips: [
				{
					id: 'section-organization',
					title: 'Organize Sections',
					description:
						'Use the add/remove buttons to customize which sections appear on your profile.',
					icon: '📝',
					completed: false
				},
				{
					id: 'rich-descriptions',
					title: 'Rich Descriptions',
					description:
						'Use action verbs and quantifiable achievements in your experience descriptions.',
					icon: '💪',
					completed: false
				},
				{
					id: 'profile-photo',
					title: 'Profile Photo',
					description:
						'Upload a professional headshot to make your profile more personal and engaging.',
					icon: '📸',
					completed: false
				}
			]
		},
		preview: {
			title: 'Preview Mode Tips',
			tips: [
				{
					id: 'responsive-design',
					title: 'Responsive Design',
					description: 'Your website automatically adapts to different screen sizes and devices.',
					icon: '📱',
					completed: false
				},
				{
					id: 'template-switching',
					title: 'Template Options',
					description:
						'Try different templates to find the style that best represents your professional brand.',
					icon: '🎨',
					completed: false
				},
				{
					id: 'real-time-updates',
					title: 'Real-time Updates',
					description: 'Changes you make in edit mode are instantly reflected in the preview.',
					icon: '⚡',
					completed: false
				}
			]
		}
	};

	$: currentTutorial = tutorials[currentContext as keyof typeof tutorials];

	let completedTips = new Set();

	function markTipCompleted(tipId: string) {
		completedTips.add(tipId);
		completedTips = completedTips; // Trigger reactivity
		dispatch('tipCompleted', { tipId, context: currentContext });
	}

	function closeTutorial() {
		isVisible = false;
		dispatch('close');
	}

	function toggleTutorial() {
		isVisible = !isVisible;
	}

	// Load completed tips from localStorage
	onMount(() => {
		const saved = localStorage.getItem('siteme-tutorial-progress');
		if (saved) {
			try {
				const progress = JSON.parse(saved) as Record<string, string[]>;
				completedTips = new Set(progress[currentContext] || []);
			} catch (e) {
				console.warn('Failed to load tutorial progress:', e);
			}
		}
	});

	// Save progress to localStorage
	$: if (completedTips.size > 0) {
		const saved = localStorage.getItem('siteme-tutorial-progress');
		let progress: Record<string, string[]> = {};
		try {
			progress = saved ? JSON.parse(saved) : {};
		} catch (e) {
			progress = {};
		}
		progress[currentContext] = Array.from(completedTips) as string[];
		localStorage.setItem('siteme-tutorial-progress', JSON.stringify(progress));
	}
</script>

<!-- Tutorial Toggle Button -->
<button
	on:click={toggleTutorial}
	class="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40 group"
	class:bg-green-600={completedTips.size === currentTutorial?.tips.length}
	class:hover:bg-green-700={completedTips.size === currentTutorial?.tips.length}
	aria-label="Toggle tutorial"
>
	{#if completedTips.size === currentTutorial?.tips.length}
		<CheckCircle class="w-6 h-6" />
	{:else}
		<HelpCircle class="w-6 h-6" />
	{/if}

	<!-- Tooltip -->
	<div
		class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
	>
		{completedTips.size === currentTutorial?.tips.length ? 'Tutorial Complete!' : 'Need Help?'}
	</div>
</button>

<!-- Tutorial Panel -->
{#if isVisible && currentTutorial}
	<div
		class="fixed bottom-20 right-6 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-40 max-h-96 overflow-hidden"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600"
		>
			<div class="flex items-center space-x-2">
				<Lightbulb class="w-5 h-5 text-yellow-500" />
				<h3 class="font-semibold text-gray-900 dark:text-white">{currentTutorial.title}</h3>
			</div>
			<button
				on:click={closeTutorial}
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				aria-label="Close tutorial"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Progress Bar -->
		<div class="px-4 py-2 bg-gray-50 dark:bg-gray-700">
			<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
				<span>Progress</span>
				<span>{completedTips.size}/{currentTutorial.tips.length}</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
				<div
					class="bg-blue-600 h-2 rounded-full transition-all duration-300"
					style="width: {(completedTips.size / currentTutorial.tips.length) * 100}%"
				/>
			</div>
		</div>

		<!-- Tips List -->
		<div class="max-h-64 overflow-y-auto">
			{#each currentTutorial.tips as tip}
				<div class="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0">
							{#if completedTips.has(tip.id)}
								<div
									class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
								>
									<CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
								</div>
							{:else}
								<div
									class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg"
								>
									{tip.icon}
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
								{tip.title}
							</h4>
							<p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
								{tip.description}
							</p>
							{#if !completedTips.has(tip.id)}
								<button
									on:click={() => markTipCompleted(tip.id)}
									class="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 transition-colors"
								>
									Mark as done
									<ArrowRight class="w-3 h-3 ml-1" />
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Footer -->
		{#if completedTips.size === currentTutorial.tips.length}
			<div
				class="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800"
			>
				<div class="flex items-center space-x-2 text-green-700 dark:text-green-400">
					<CheckCircle class="w-5 h-5" />
					<span class="text-sm font-medium"
						>Great job! You've completed all tips for this section.</span
					>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Custom scrollbar for the tips list */
	.max-h-64::-webkit-scrollbar {
		width: 4px;
	}

	.max-h-64::-webkit-scrollbar-track {
		background: theme('colors.gray.100');
	}

	.max-h-64::-webkit-scrollbar-thumb {
		background: theme('colors.gray.400');
		border-radius: 2px;
	}

	.max-h-64::-webkit-scrollbar-thumb:hover {
		background: theme('colors.gray.500');
	}

	:global(.dark) .max-h-64::-webkit-scrollbar-track {
		background: theme('colors.gray.700');
	}

	:global(.dark) .max-h-64::-webkit-scrollbar-thumb {
		background: theme('colors.gray.500');
	}

	:global(.dark) .max-h-64::-webkit-scrollbar-thumb:hover {
		background: theme('colors.gray.400');
	}
</style>
