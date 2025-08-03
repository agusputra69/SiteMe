<script lang="ts">
	import type { ProfileData } from '$lib/types';

	export let profileData: ProfileData = {
		name: 'Your Name',
		avatar: 'Y',
		about: 'Your professional summary goes here...',
		workExperience: [],
		education: [],
		skills: [],
		contact: { email: '', phone: '', location: '' },
		links: [],
		projects: [],
		certifications: [],
		languages: [],
		awards: []
	};

	export let theme = {
		primary: 'blue-600',
		secondary: 'blue-500',
		accent: 'blue-100',
		text: 'gray-900',
		textSecondary: 'gray-600'
	};

	export let customizable = false;

	// Check if avatar is an image URL or text
	$: isImageUrl = profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') || profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';

	// Animation states
	let heroVisible = false;
	let sectionsVisible = false;

	// Lifecycle
	import { onMount } from 'svelte';
	onMount(() => {
		setTimeout(() => heroVisible = true, 100);
		setTimeout(() => sectionsVisible = true, 300);
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
	<!-- Hero Section -->
	<section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
		<!-- Background Elements -->
		<div class="absolute inset-0 overflow-hidden">
			<div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
			<div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
		</div>

		<div class="relative z-10 text-center max-w-4xl mx-auto">
			<!-- Profile Image -->
			<div class="mb-8 {heroVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}" style="animation-delay: 0.1s">
				{#if isImageUrl}
					<img 
						src={profileData.avatar} 
						alt="Profile photo of {profileData.name}"
						class="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto object-cover border-4 border-white shadow-2xl"
					/>
				{:else}
					<div class="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full mx-auto flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-2xl border-4 border-white">
						{avatarInitial}
					</div>
				{/if}
			</div>

			<!-- Name and Title -->
			<div class="{heroVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}" style="animation-delay: 0.2s">
				{#if customizable}
					<input 
						bind:value={profileData.name}
						class="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-transparent border-none text-center w-full focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded-lg px-4 py-2"
						placeholder="Your Name"
					/>
				{:else}
					<h1 class="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
						{profileData.name}
					</h1>
				{/if}
				
				{#if profileData.workExperience && profileData.workExperience.length > 0}
					<p class="text-xl sm:text-2xl text-{theme.textSecondary} dark:text-gray-300 mb-6">
						{profileData.workExperience[0].title} at {profileData.workExperience[0].company}
					</p>
				{/if}
			</div>

			<!-- About Section -->
			<div class="{heroVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}" style="animation-delay: 0.3s">
				{#if customizable}
					<textarea 
						bind:value={profileData.about}
						class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-{theme.primary} resize-none w-full"
						rows="4"
						placeholder="Tell the world about yourself..."
					></textarea>
				{:else}
					<p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
						{profileData.about}
					</p>
				{/if}
			</div>

			<!-- CTA Buttons -->
			<div class="{heroVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'} flex flex-col sm:flex-row gap-4 justify-center mt-8" style="animation-delay: 0.4s">
				{#if profileData.contact?.email}
					<a href="mailto:{profileData.contact.email}" class="inline-flex items-center px-8 py-3 bg-{theme.primary} text-white font-semibold rounded-full hover:bg-{theme.secondary} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
						</svg>
						Get In Touch
					</a>
				{/if}
				<button class="inline-flex items-center px-8 py-3 border-2 border-{theme.primary} text-{theme.primary} font-semibold rounded-full hover:bg-{theme.primary} hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
					Download Resume
				</button>
			</div>

			<!-- Social Links -->
			{#if profileData.links && profileData.links.length > 0}
				<div class="{heroVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'} flex justify-center space-x-6 mt-8" style="animation-delay: 0.5s">
					{#each profileData.links as link}
						<a href={link.url} target="_blank" rel="noopener noreferrer" class="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-{theme.primary} hover:bg-{theme.primary} hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
							{#if link.type === 'linkedin'}
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							{:else if link.type === 'github'}
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
							{:else if link.type === 'twitter'}
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
								</svg>
							{:else}
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
								</svg>
							{/if}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Scroll Indicator -->
		<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 {heroVisible ? 'animate-bounce' : 'opacity-0'}">
			<svg class="w-6 h-6 text-{theme.primary}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
			</svg>
		</div>
	</section>

	<!-- Skills Section -->
	{#if profileData.skills && profileData.skills.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Skills & Expertise
				</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{#each profileData.skills as skill, index}
						<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.1}s">
							{#if customizable}
								<input 
									bind:value={profileData.skills[index]}
									class="text-center font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full"
								/>
							{:else}
								<p class="text-center font-semibold text-gray-900 dark:text-white">
									{skill}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Certifications Section -->
	{#if profileData.certifications && profileData.certifications.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Certifications
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each profileData.certifications as cert, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.1}s">
							<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
								{cert.name}
							</h3>
							<p class="text-{theme.primary} font-semibold mb-2">
								{cert.issuer}
							</p>
							<p class="text-gray-600 dark:text-gray-300">
								{cert.date}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Languages Section -->
	{#if profileData.languages && profileData.languages.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Languages
				</h2>
				<div class="grid md:grid-cols-2 gap-6">
					{#each profileData.languages as language, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.1}s">
							<div class="flex justify-between items-center">
								<h3 class="text-xl font-bold text-gray-900 dark:text-white">
									{language.language}
								</h3>
								<span class="px-3 py-1 bg-{theme.accent} text-{theme.primary} rounded-full text-sm font-medium">
									{language.proficiency}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Awards Section -->
	{#if profileData.awards && profileData.awards.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Awards & Recognition
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each profileData.awards as award, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.1}s">
							<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
								{award.title}
							</h3>
							<p class="text-{theme.primary} font-semibold mb-2">
								{award.organization}
							</p>
							<p class="text-gray-600 dark:text-gray-300">
								{award.date}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Experience Section -->
	{#if profileData.workExperience && profileData.workExperience.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Experience
				</h2>
				<div class="space-y-8">
					{#each profileData.workExperience as experience, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.2}s">
							<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
								<div>
									{#if customizable}
										<input 
											bind:value={experience.title}
											class="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full mb-2"
										/>
										<input 
											bind:value={experience.company}
											class="text-{theme.primary} font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full"
										/>
									{:else}
										<h3 class="text-xl font-bold text-gray-900 dark:text-white">
											{experience.title}
										</h3>
										<p class="text-{theme.primary} font-semibold">
											{experience.company}
										</p>
									{/if}
								</div>
								<div class="flex items-center space-x-2">
									<span class="px-3 py-1 bg-{theme.accent} text-{theme.primary} rounded-full text-sm font-medium">
										{experience.type}
									</span>
									{#if experience.current}
										<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
											Current
										</span>
									{/if}
								</div>
							</div>
							<p class="text-gray-600 dark:text-gray-300 mb-4">
								{experience.period}
							</p>
							{#if experience.description}
								{#if customizable}
									<textarea 
										bind:value={experience.description}
										class="text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-{theme.primary} resize-none w-full"
										rows="3"
									></textarea>
								{:else}
									<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
										{experience.description}
									</p>
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Projects Section -->
	{#if profileData.projects && profileData.projects.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Featured Projects
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each profileData.projects as project, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700" style="animation-delay: {index * 0.1}s">
							{#if project.image}
								<img src={project.image} alt={project.title} class="w-full h-48 object-cover" />
							{:else}
								<div class="w-full h-48 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} flex items-center justify-center">
									<svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
									</svg>
								</div>
							{/if}
							<div class="p-6">
								{#if customizable}
									<input 
										bind:value={project.title}
										class="text-xl font-bold text-gray-900 dark:text-white mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full"
									/>
									<textarea 
										bind:value={project.description}
										class="text-gray-600 dark:text-gray-300 mb-4 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-{theme.primary} resize-none w-full"
										rows="3"
									></textarea>
								{:else}
									<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
										{project.title}
									</h3>
									<p class="text-gray-600 dark:text-gray-300 mb-4">
										{project.description}
									</p>
								{/if}
								{#if project.technologies}
									<div class="flex flex-wrap gap-2 mb-4">
										{#each project.technologies as tech}
											<span class="px-2 py-1 bg-{theme.accent} text-{theme.primary} rounded-full text-xs font-medium">
												{tech}
											</span>
										{/each}
									</div>
								{/if}
								<div class="flex space-x-3">
									{#if project.liveUrl}
										<a href={project.liveUrl} target="_blank" rel="noopener noreferrer" class="flex-1 bg-{theme.primary} text-white text-center py-2 rounded-lg hover:bg-{theme.secondary} transition-colors font-medium">
											Live Demo
										</a>
									{/if}
									{#if project.githubUrl}
										<a href={project.githubUrl} target="_blank" rel="noopener noreferrer" class="flex-1 border border-{theme.primary} text-{theme.primary} text-center py-2 rounded-lg hover:bg-{theme.primary} hover:text-white transition-colors font-medium">
											Code
										</a>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Contact Section -->
	<section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 {sectionsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
				Let's Work Together
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-12">
				I'm always interested in new opportunities and exciting projects.
			</p>
			<div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
				{#if profileData.contact?.email}
					<a href="mailto:{profileData.contact.email}" class="inline-flex items-center px-8 py-4 bg-{theme.primary} text-white font-semibold rounded-full hover:bg-{theme.secondary} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
						<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
						</svg>
						{profileData.contact.email}
					</a>
				{/if}
				{#if profileData.contact?.phone}
					<a href="tel:{profileData.contact.phone}" class="inline-flex items-center px-8 py-4 border-2 border-{theme.primary} text-{theme.primary} font-semibold rounded-full hover:bg-{theme.primary} hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
						<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
						</svg>
						{profileData.contact.phone}
					</a>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.6s ease-out forwards;
	}
</style>