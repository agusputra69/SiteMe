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

	// Check if avatar is an image URL or text
	$: isImageUrl = profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') || profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
</script>

<div class="bg-white dark:bg-gray-900 max-w-4xl mx-auto p-8 font-serif">
	<!-- Header -->
	<header class="text-center mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
		<!-- Profile Image/Initial -->
		{#if isImageUrl}
			<div class="mb-6">
				<img 
					src={profileData.avatar} 
					alt="Profile photo of {profileData.name}"
					class="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200 dark:border-gray-700"
					on:error={() => {
						// Fallback to initial if image fails to load
						isImageUrl = false;
					}}
				/>
			</div>
		{:else if profileData.avatar && !isImageUrl}
			<div class="mb-6">
				<div class="w-24 h-24 rounded-full mx-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
					<span class="text-2xl font-bold text-gray-700 dark:text-gray-300" aria-label="Profile initial">{avatarInitial}</span>
				</div>
			</div>
		{/if}

		<h1 class="text-5xl font-light text-gray-900 dark:text-gray-100 mb-4 tracking-wide">
			{#if customizable}
				<input 
					bind:value={profileData.name}
					class="bg-transparent border-none outline-none w-full text-center text-5xl font-light tracking-wide focus:ring-2 focus:ring-gray-500/20"
					placeholder="Your Name"
					aria-label="Enter your name"
				/>
			{:else}
				{profileData.name}
			{/if}
		</h1>
		
		{#if profileData.contact}
			<div class="flex justify-center space-x-8 text-sm text-gray-700 dark:text-gray-300">
				{#if profileData.contact.email}
					<span aria-label="Email address">{profileData.contact.email}</span>
				{/if}
				{#if profileData.contact.phone}
					<span aria-label="Phone number">{profileData.contact.phone}</span>
				{/if}
				{#if profileData.contact.location}
					<span aria-label="Location">{profileData.contact.location}</span>
				{/if}
			</div>
		{/if}
	</header>

	<!-- About Section -->
	<section class="mb-12">
		<h2 class="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4 font-sans">
			About
		</h2>
		{#if customizable}
			<textarea 
				bind:value={profileData.about}
				class="w-full text-lg text-gray-900 dark:text-gray-100 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-500/20 resize-none font-serif"
				rows="4"
				placeholder="Tell us about yourself..."
				aria-label="Professional summary"
			></textarea>
		{:else}
			<p class="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
				{profileData.about}
			</p>
		{/if}
	</section>

	<!-- Experience Section -->
	<section class="mb-12">
		<h2 class="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-6 font-sans">
			Experience
		</h2>
		<div class="space-y-8">
			{#each profileData.workExperience as experience, index}
				<div class="flex">
					<div class="w-32 flex-shrink-0">
						<p class="text-sm text-gray-700 dark:text-gray-300 font-sans">
							{#if customizable}
								<input 
									bind:value={experience.period}
									class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-gray-500/20"
									placeholder="Period"
									aria-label="Employment period"
								/>
							{:else}
								{experience.period}
							{/if}
						</p>
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
							{#if customizable}
								<input 
									bind:value={experience.title}
									class="bg-transparent border-none outline-none w-full text-xl font-medium focus:ring-2 focus:ring-gray-500/20"
									placeholder="Job Title"
									aria-label="Job title"
								/>
							{:else}
								{experience.title}
							{/if}
						</h3>
						<p class="text-gray-700 dark:text-gray-200 mb-2 font-sans">
							{#if customizable}
								<input 
									bind:value={experience.company}
									class="bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-gray-500/20"
									placeholder="Company Name"
									aria-label="Company name"
								/>
							{:else}
								{experience.company}
							{/if}
						</p>
						{#if experience.description}
							<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
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
		<h2 class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans">
			Education
		</h2>
		<div class="space-y-6">
			{#each profileData.education as edu, index}
				<div class="flex">
					<div class="w-32 flex-shrink-0">
						<p class="text-sm text-gray-600 dark:text-gray-400 font-sans">
							{#if customizable}
								<input 
									bind:value={edu.period}
									class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-gray-500/20"
									placeholder="Period"
									aria-label="Education period"
								/>
							{:else}
								{edu.period}
							{/if}
						</p>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
							{#if customizable}
								<input 
									bind:value={edu.degree}
									class="bg-transparent border-none outline-none w-full text-lg font-medium focus:ring-2 focus:ring-gray-500/20"
									placeholder="Degree"
									aria-label="Degree or qualification"
								/>
							{:else}
								{edu.degree}
							{/if}
						</h3>
						<p class="text-gray-600 dark:text-gray-300 font-sans">
							{#if customizable}
								<input 
									bind:value={edu.institution}
									class="bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-gray-500/20"
									placeholder="Institution"
									aria-label="Educational institution"
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
			<h2 class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans">
				Skills
			</h2>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				{#each profileData.skills as skill}
					<span class="text-gray-900 dark:text-gray-300 font-sans">
						{skill}
					</span>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	input:focus, textarea:focus {
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
	}
</style>