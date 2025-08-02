<script lang="ts">
	import type { ProfileData } from '$lib/types';

	export let profileData: ProfileData = {
		name: 'Your Name',
		avatar: 'Y',
		about: 'Your professional summary goes here...',
		workExperience: [],
		education: [],
		skills: [],
		contact: { email: '', phone: '', location: '' }
	};

	export let theme = {
		primary: 'gray-900',
		secondary: 'gray-700',
		accent: 'gray-200',
		text: 'gray-900',
		textSecondary: 'gray-600'
	};

	export let customizable = false;
	export let customization = {
		theme: 'blue',
		fontFamily: 'inter',
		fontSize: 'medium',
		layout: 'standard',
		spacing: 'normal',
		borderRadius: 'medium',
		shadow: 'medium',
		accentColor: '#3B82F6',
		textColor: '#1F2937',
		backgroundColor: '#FFFFFF',
		sectionOrder: ['header', 'about', 'experience', 'education', 'skills', 'contact'],
		lineHeight: 'normal',
		letterSpacing: 'normal',
		headingFont: 'same',
		containerWidth: 'standard',
		verticalSpacing: 'normal',
		horizontalPadding: 'normal'
	};
	
	// Apply customization settings
	$: fontClass = {
		inter: 'font-sans',
		mono: 'font-mono',
		poppins: 'font-sans',
		playfair: 'font-serif',
		roboto: 'font-sans'
	}[customization.fontFamily] || 'font-sans';
	
	$: appliedStyles = `background-color: ${customization.backgroundColor}; color: ${customization.textColor};`;
</script>

<div class="bg-white dark:bg-gray-900 max-w-4xl mx-auto p-8 font-serif">
	<!-- Header -->
	<header class="text-center mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
		<h1 class="text-5xl font-light text-{theme.text} dark:text-white mb-4 tracking-wide">
			{#if customizable}
				<input 
					bind:value={profileData.name}
					class="bg-transparent border-none outline-none w-full text-center text-5xl font-light tracking-wide"
					placeholder="Your Name"
				/>
			{:else}
				{profileData.name}
			{/if}
		</h1>
		
		{#if profileData.contact}
			<div class="flex justify-center space-x-8 text-sm text-{theme.textSecondary} dark:text-gray-400">
				{#if profileData.contact.email}
					<span>{profileData.contact.email}</span>
				{/if}
				{#if profileData.contact.phone}
					<span>{profileData.contact.phone}</span>
				{/if}
				{#if profileData.contact.location}
					<span>{profileData.contact.location}</span>
				{/if}
			</div>
		{/if}
	</header>

	<!-- About Section -->
	<section class="mb-12">
		<h2 class="text-xs uppercase tracking-widest text-{theme.textSecondary} dark:text-gray-400 mb-4 font-sans">
			About
		</h2>
		{#if customizable}
			<textarea 
				bind:value={profileData.about}
				class="w-full text-lg text-{theme.text} dark:text-gray-300 leading-relaxed bg-transparent border border-gray-200 dark:border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-{theme.primary} resize-none font-serif"
				rows="4"
				placeholder="Tell us about yourself..."
			></textarea>
		{:else}
			<p class="text-lg text-{theme.text} dark:text-gray-300 leading-relaxed">
				{profileData.about}
			</p>
		{/if}
	</section>

	<!-- Experience Section -->
	<section class="mb-12">
		<h2 class="text-xs uppercase tracking-widest text-{theme.textSecondary} dark:text-gray-400 mb-6 font-sans">
			Experience
		</h2>
		<div class="space-y-8">
			{#each profileData.workExperience as experience, index}
				<div class="flex">
					<div class="w-32 flex-shrink-0">
						<p class="text-sm text-{theme.textSecondary} dark:text-gray-400 font-sans">
							{#if customizable}
								<input 
									bind:value={experience.period}
									class="bg-transparent border-none outline-none w-full text-sm"
									placeholder="Period"
								/>
							{:else}
								{experience.period}
							{/if}
						</p>
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-medium text-{theme.text} dark:text-white mb-1">
							{#if customizable}
								<input 
									bind:value={experience.title}
									class="bg-transparent border-none outline-none w-full text-xl font-medium"
									placeholder="Job Title"
								/>
							{:else}
								{experience.title}
							{/if}
						</h3>
						<p class="text-{theme.textSecondary} dark:text-gray-300 mb-2 font-sans">
							{#if customizable}
								<input 
									bind:value={experience.company}
									class="bg-transparent border-none outline-none w-full"
									placeholder="Company Name"
								/>
							{:else}
								{experience.company}
							{/if}
						</p>
						{#if experience.description}
							<p class="text-{theme.textSecondary} dark:text-gray-400 leading-relaxed">
								{experience.description}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Education Section -->
	<section class="mb-12">
		<h2 class="text-xs uppercase tracking-widest text-{theme.textSecondary} dark:text-gray-400 mb-6 font-sans">
			Education
		</h2>
		<div class="space-y-6">
			{#each profileData.education as edu, index}
				<div class="flex">
					<div class="w-32 flex-shrink-0">
						<p class="text-sm text-{theme.textSecondary} dark:text-gray-400 font-sans">
							{#if customizable}
								<input 
									bind:value={edu.period}
									class="bg-transparent border-none outline-none w-full text-sm"
									placeholder="Period"
								/>
							{:else}
								{edu.period}
							{/if}
						</p>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-medium text-{theme.text} dark:text-white mb-1">
							{#if customizable}
								<input 
									bind:value={edu.degree}
									class="bg-transparent border-none outline-none w-full text-lg font-medium"
									placeholder="Degree"
								/>
							{:else}
								{edu.degree}
							{/if}
						</h3>
						<p class="text-{theme.textSecondary} dark:text-gray-300 font-sans">
							{#if customizable}
								<input 
									bind:value={edu.institution}
									class="bg-transparent border-none outline-none w-full"
									placeholder="Institution"
								/>
							{:else}
								{edu.institution}
							{/if}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Skills Section -->
	{#if profileData.skills && profileData.skills.length > 0}
		<section>
			<h2 class="text-xs uppercase tracking-widest text-{theme.textSecondary} dark:text-gray-400 mb-6 font-sans">
				Skills
			</h2>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				{#each profileData.skills as skill}
					<span class="text-{theme.text} dark:text-gray-300 font-sans">
						{skill}
					</span>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	input:focus, textarea:focus {
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
	}
</style>