<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, ArrowRight, ArrowLeft, Upload, Edit3, Eye, Save } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let isVisible = false;
	export let currentStep = 0;

	const steps = [
		{
			id: 'welcome',
			title: 'Welcome to SiteMe! 🎉',
			description: 'Transform your resume into a beautiful personal website in just a few minutes.',
			icon: Upload,
			position: 'center'
		},
		{
			id: 'upload',
			title: 'Upload Your Resume',
			description: 'Start by uploading your PDF resume. Our AI will extract all the important information automatically.',
			icon: Upload,
			target: '[data-tour="upload-button"]',
			position: 'bottom'
		},
		{
			id: 'edit',
			title: 'Edit Your Profile',
			description: 'Review and customize the extracted information. Add your personal touch to make it uniquely yours.',
			icon: Edit3,
			target: '[data-tour="profile-editor"]',
			position: 'right'
		},
		{
			id: 'preview',
			title: 'Preview Your Website',
			description: 'See how your website will look in real-time. Switch between edit and preview modes anytime.',
			icon: Eye,
			target: '[data-tour="preview-button"]',
			position: 'bottom'
		},
		{
			id: 'save',
			title: 'Save & Publish',
			description: 'When you\'re happy with your website, save it and get your shareable URL!',
			icon: Save,
			target: '[data-tour="save-button"]',
			position: 'bottom'
		},
		{
			id: 'complete',
			title: 'You\'re All Set! ✨',
			description: 'Your professional website is ready to share with the world. Let\'s get started!',
			icon: Save,
			position: 'center'
		}
	];

	$: currentStepData = steps[currentStep];
	$: isLastStep = currentStep === steps.length - 1;
	$: isFirstStep = currentStep === 0;

	let tooltipElement: HTMLElement;
	let targetElement: HTMLElement | null = null;

	function nextStep() {
		if (currentStep < steps.length - 1) {
			currentStep++;
			updateTooltipPosition();
		} else {
			completeTour();
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
			updateTooltipPosition();
		}
	}

	function skipTour() {
		dispatch('skip');
		isVisible = false;
	}

	function completeTour() {
		dispatch('complete');
		isVisible = false;
	}

	function updateTooltipPosition() {
		if (!currentStepData.target || currentStepData.position === 'center') {
			targetElement = null;
			return;
		}

		targetElement = document.querySelector(currentStepData.target);
		if (targetElement && tooltipElement) {
			// Add highlight to target element
			document.querySelectorAll('[data-tour-highlight]').forEach(el => {
				el.removeAttribute('data-tour-highlight');
			});
			targetElement.setAttribute('data-tour-highlight', 'true');
		}
	}

	onMount(() => {
		if (isVisible) {
			updateTooltipPosition();
		}
	});

	$: if (isVisible && currentStepData) {
			setTimeout(() => updateTooltipPosition(), 100);
	}
</script>

{#if isVisible}
	<!-- Overlay -->
	<div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300">
		<!-- Tooltip -->
		<div 
			bind:this={tooltipElement}
			class="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-80 border border-gray-200 dark:border-gray-600 transition-all duration-300"
			class:center-tooltip={currentStepData.position === 'center'}
			style={currentStepData.position === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' : ''}
		>
			<!-- Close button -->
			<button 
				on:click={skipTour}
				class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				aria-label="Close tour"
			>
				<X class="w-5 h-5" />
			</button>

			<!-- Icon -->
			<div class="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
				<svelte:component this={currentStepData.icon} class="w-6 h-6 text-blue-600 dark:text-blue-400" />
			</div>

			<!-- Content -->
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
				{currentStepData.title}
			</h3>
			<p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
				{currentStepData.description}
			</p>

			<!-- Progress indicator -->
			<div class="flex items-center justify-center mb-6">
				{#each steps as _, index}
					<div 
						class="w-2 h-2 rounded-full mx-1 transition-colors duration-200"
						class:bg-blue-600={index === currentStep}
						class:bg-gray-300={index !== currentStep}
						class:dark:bg-blue-400={index === currentStep}
						class:dark:bg-gray-600={index !== currentStep}
					></div>
				{/each}
			</div>

			<!-- Navigation buttons -->
			<div class="flex items-center justify-between">
				<button 
					on:click={prevStep}
					class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
					class:invisible={isFirstStep}
					disabled={isFirstStep}
				>
					<ArrowLeft class="w-4 h-4 mr-1" />
					Back
				</button>

				<div class="flex items-center space-x-3">
					<button 
						on:click={skipTour}
						class="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
					>
						Skip
					</button>
					<button 
						on:click={nextStep}
						class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
					>
						{isLastStep ? 'Get Started' : 'Next'}
						{#if !isLastStep}
							<ArrowRight class="w-4 h-4 ml-1" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global([data-tour-highlight]) {
		@apply ring-4 ring-blue-500 ring-opacity-50 relative z-40;
		transition: all 0.3s ease;
	}

	:global([data-tour-highlight]::before) {
		content: '';
		position: absolute;
		inset: -8px;
		border: 2px solid theme('colors.blue.500');
		border-radius: 8px;
		pointer-events: none;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>