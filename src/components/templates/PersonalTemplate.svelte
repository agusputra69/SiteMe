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
		projects: []
	};

	export let theme = {
		primary: 'indigo-600',
		secondary: 'indigo-500',
		accent: 'indigo-100',
		text: 'gray-900',
		textSecondary: 'gray-600'
	};

	export let customizable = false;

	// Check if avatar is an image URL or text
	$: isImageUrl = profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') || profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<!-- Navigation -->
	<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center space-x-3">
					{#if isImageUrl}
						<img 
							src={profileData.avatar} 
							alt="Profile photo of {profileData.name}"
							class="w-8 h-8 rounded-full object-cover"
						/>
					{:else}
						<div class="w-8 h-8 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full flex items-center justify-center text-sm font-bold text-white">
							{avatarInitial}
						</div>
					{/if}
					<span class="font-semibold text-gray-900 dark:text-white">
						{profileData.name}
					</span>
				</div>
				<div class="hidden md:flex space-x-8">
					<a href="#about" class="text-gray-600 dark:text-gray-300 hover:text-{theme.primary} transition-colors">About</a>
					<a href="#experience" class="text-gray-600 dark:text-gray-300 hover:text-{theme.primary} transition-colors">Experience</a>
					{#if profileData.projects && profileData.projects.length > 0}
						<a href="#projects" class="text-gray-600 dark:text-gray-300 hover:text-{theme.primary} transition-colors">Projects</a>
					{/if}
					<a href="#contact" class="text-gray-600 dark:text-gray-300 hover:text-{theme.primary} transition-colors">Contact</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto text-center">
			<!-- Profile Image -->
			<div class="mb-8">
				{#if isImageUrl}
					<img 
						src={profileData.avatar} 
						alt="Profile photo of {profileData.name}"
						class="w-32 h-32 rounded-full mx-auto object-cover shadow-xl"
					/>
				{:else}
					<div class="w-32 h-32 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-white shadow-xl">
						{avatarInitial}
					</div>
				{/if}
			</div>

			<!-- Name and Title -->
			{#if customizable}
				<input 
					bind:value={profileData.name}
					class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-transparent border-none text-center w-full focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded-lg px-4 py-2"
					placeholder="Your Name"
				/>
			{:else}
				<h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
					{profileData.name}
				</h1>
			{/if}
			
			{#if profileData.workExperience && profileData.workExperience.length > 0}
				<p class="text-xl text-{theme.textSecondary} dark:text-gray-300 mb-8">
					{profileData.workExperience[0].title}
					{#if profileData.workExperience[0].company}
						at <span class="text-{theme.primary} font-semibold">{profileData.workExperience[0].company}</span>
					{/if}
				</p>
			{/if}

			<!-- Social Links -->
			{#if profileData.links && profileData.links.length > 0}
				<div class="flex justify-center space-x-4 mb-8">
					{#each profileData.links as link}
						<a href={link.url} target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-{theme.textSecondary} hover:bg-{theme.primary} hover:text-white transition-all duration-300">
							{#if link.type === 'linkedin'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							{:else if link.type === 'github'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
							{:else if link.type === 'twitter'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
								</svg>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
								</svg>
							{/if}
						</a>
					{/each}
				</div>
			{/if}

			<!-- CTA Button -->
			{#if profileData.contact?.email}
				<a href="mailto:{profileData.contact.email}" class="inline-flex items-center px-6 py-3 bg-{theme.primary} text-white font-semibold rounded-lg hover:bg-{theme.secondary} transition-colors shadow-lg">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
					</svg>
					Get In Touch
				</a>
			{/if}
		</div>
	</section>

	<!-- About Section -->
	<section id="about" class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
				About Me
			</h2>
			<div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
				{#if customizable}
					<textarea 
						bind:value={profileData.about}
						class="w-full text-lg text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-{theme.primary} resize-none"
						rows="6"
						placeholder="Tell the world about yourself..."
					></textarea>
				{:else}
					<p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
						{profileData.about}
					</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- Skills Section -->
	{#if profileData.skills && profileData.skills.length > 0}
		<section class="py-16 px-4 sm:px-6 lg:px-8">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Skills & Technologies
				</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{#each profileData.skills as skill, index}
						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
							{#if customizable}
								<input 
									bind:value={profileData.skills[index]}
									class="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full text-center"
								/>
							{:else}
								<p class="text-sm font-medium text-gray-900 dark:text-white">
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
		<section class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Certifications
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each profileData.certifications as cert, index}
						<div class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
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
		<section class="py-16 px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Languages
				</h2>
				<div class="grid md:grid-cols-2 gap-6">
					{#each profileData.languages as language, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
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
		<section class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Awards & Recognition
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each profileData.awards as award, index}
						<div class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
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

	<!-- Education Section -->
	{#if profileData.education && profileData.education.length > 0}
		<section class="py-16 px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Education
				</h2>
				<div class="space-y-8">
					{#each profileData.education as edu, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
							<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
								<div class="flex-1">
									{#if customizable}
										<input 
											bind:value={edu.degree}
											class="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full mb-2"
										/>
										<input 
											bind:value={edu.institution}
											class="text-{theme.primary} font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full mb-2"
										/>
										<input 
											bind:value={edu.period}
											class="text-gray-600 dark:text-gray-300 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full"
										/>
									{:else}
										<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
											{edu.degree}
										</h3>
										<p class="text-{theme.primary} font-semibold mb-1">
											{edu.institution}
										</p>
										<p class="text-gray-600 dark:text-gray-300">
											{edu.period}
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Experience Section -->
	{#if profileData.workExperience && profileData.workExperience.length > 0}
		<section id="experience" class="py-16 px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Experience
				</h2>
				<div class="space-y-8">
					{#each profileData.workExperience as experience, index}
						<div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
							<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
								<div class="flex-1">
									{#if customizable}
										<input 
											bind:value={experience.title}
											class="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full mb-2"
										/>
										<input 
											bind:value={experience.company}
											class="text-{theme.primary} font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full mb-2"
										/>
										<input 
											bind:value={experience.period}
											class="text-gray-600 dark:text-gray-300 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-{theme.primary} rounded px-2 py-1 w-full"
										/>
									{:else}
										<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
											{experience.title}
										</h3>
										<p class="text-{theme.primary} font-semibold mb-1">
											{experience.company}
										</p>
										<p class="text-gray-600 dark:text-gray-300">
											{experience.period}
										</p>
									{/if}
								</div>
								<div class="flex items-center space-x-2 mt-4 sm:mt-0">
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
							{#if experience.description}
								{#if customizable}
									<textarea 
										bind:value={experience.description}
										class="text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-{theme.primary} resize-none w-full mt-4"
										rows="3"
									></textarea>
								{:else}
									<p class="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
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
		<section id="projects" class="py-16 px-4 sm:px-6 lg:px-8">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
					Featured Projects
				</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each profileData.projects as project, index}
						<div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
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
	<section id="contact" class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
				Let's Connect
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
				I'm always open to discussing new opportunities and interesting projects.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if profileData.contact?.email}
					<a href="mailto:{profileData.contact.email}" class="inline-flex items-center px-6 py-3 bg-{theme.primary} text-white font-semibold rounded-lg hover:bg-{theme.secondary} transition-colors shadow-lg">
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
						</svg>
						Send Email
					</a>
				{/if}
				{#if profileData.contact?.phone}
					<a href="tel:{profileData.contact.phone}" class="inline-flex items-center px-6 py-3 border-2 border-{theme.primary} text-{theme.primary} font-semibold rounded-lg hover:bg-{theme.primary} hover:text-white transition-colors">
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
						</svg>
						Call Me
					</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
		<div class="max-w-6xl mx-auto text-center">
			<p class="text-gray-600 dark:text-gray-300">
				© 2024 {profileData.name}. Built with SiteMe.
			</p>
		</div>
	</footer>
</div>

<style>
	html {
		scroll-behavior: smooth;
	}
</style>