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
		primary: 'purple-600',
		secondary: 'pink-500',
		accent: 'purple-100',
		text: 'gray-900',
		textSecondary: 'gray-600'
	};

	export let customizable = false;

	$: isImageUrl = profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') || profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
	<!-- Navigation -->
	<nav class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg">
		<div class="flex items-center space-x-6">
			<a href="#home" class="text-gray-700 dark:text-gray-300 hover:text-{theme.primary} transition-colors font-medium">Home</a>
			<a href="#about" class="text-gray-700 dark:text-gray-300 hover:text-{theme.primary} transition-colors font-medium">About</a>
			<a href="#work" class="text-gray-700 dark:text-gray-300 hover:text-{theme.primary} transition-colors font-medium">Work</a>
			<a href="#contact" class="bg-{theme.primary} text-white px-4 py-2 rounded-full hover:bg-{theme.secondary} transition-colors font-medium">Contact</a>
		</div>
	</nav>

	<!-- Hero Section -->
	<section id="home" class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
		<div class="text-center max-w-4xl mx-auto">
			<!-- Profile Image -->
			<div class="mb-8">
				{#if isImageUrl}
					<img 
						src={profileData.avatar} 
						alt="Profile photo of {profileData.name}"
						class="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
					/>
				{:else}
					<div class="w-40 h-40 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white mx-auto">
						{avatarInitial}
					</div>
				{/if}
			</div>

			<!-- Name -->
			{#if customizable}
				<input 
					bind:value={profileData.name}
					class="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent mb-6 bg-transparent border-none text-center w-full focus:outline-none"
					placeholder="Your Name"
				/>
			{:else}
				<h1 class="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent mb-6">
					{profileData.name}
				</h1>
			{/if}

			<!-- Title -->
			{#if profileData.workExperience && profileData.workExperience.length > 0}
				<p class="text-2xl sm:text-3xl text-gray-700 dark:text-gray-300 mb-8 font-light">
					{profileData.workExperience[0].title}
					{#if profileData.workExperience[0].company}
						<br><span class="text-{theme.primary} font-semibold">@ {profileData.workExperience[0].company}</span>
					{/if}
				</p>
			{/if}

			<!-- About Preview -->
			{#if customizable}
				<textarea 
					bind:value={profileData.about}
					class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12 bg-transparent border border-gray-300 rounded-xl px-6 py-4 focus:outline-none resize-none w-full"
					rows="4"
					placeholder="Tell the world about yourself..."
				></textarea>
			{:else}
				<p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12">
					{profileData.about}
				</p>
			{/if}

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-6 justify-center mb-12">
				{#if profileData.contact?.email}
					<a href="mailto:{profileData.contact.email}" class="px-8 py-4 bg-gradient-to-r from-{theme.primary} to-{theme.secondary} text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300">
						Let's Work Together
					</a>
				{/if}
				<button class="px-8 py-4 border-2 border-{theme.primary} text-{theme.primary} font-semibold rounded-full hover:bg-{theme.primary} hover:text-white transition-all duration-300">
					Download Resume
				</button>
			</div>

			<!-- Social Links -->
			{#if profileData.links && profileData.links.length > 0}
				<div class="flex justify-center space-x-6">
					{#each profileData.links as link}
						<a href={link.url} target="_blank" rel="noopener noreferrer" class="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-{theme.primary} hover:bg-{theme.primary} hover:text-white transition-all duration-300 shadow-lg">
							<span class="text-sm font-bold">{link.type?.charAt(0).toUpperCase()}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- About Section -->
	<section id="about" class="py-20 px-4 sm:px-6 lg:px-8">
		<div class="max-w-6xl mx-auto">
			<h2 class="text-4xl sm:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
				About <span class="bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent">Me</span>
			</h2>
			
			<div class="grid lg:grid-cols-2 gap-16 items-center">
				<div class="space-y-8">
					{#if customizable}
						<textarea 
							bind:value={profileData.about}
							class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-300 rounded-xl px-6 py-4 focus:outline-none resize-none w-full"
							rows="8"
						></textarea>
					{:else}
						<p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
							{profileData.about}
						</p>
					{/if}

					<!-- Skills -->
					{#if profileData.skills && profileData.skills.length > 0}
						<div>
							<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skills</h3>
							<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{#each profileData.skills as skill}
									<div class="bg-white/60 rounded-xl p-4 text-center shadow-lg border border-white/20">
										<p class="font-semibold text-gray-900 dark:text-white">{skill}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="bg-gradient-to-br from-{theme.primary}/20 to-{theme.secondary}/20 rounded-3xl p-8">
					<div class="text-center">
						<div class="grid grid-cols-2 gap-8">
							<div>
								<div class="text-3xl font-bold text-{theme.primary} mb-2">
									{profileData.workExperience ? profileData.workExperience.length : 0}+
								</div>
								<div class="text-gray-700 dark:text-gray-300 font-medium">Experience</div>
							</div>
							<div>
								<div class="text-3xl font-bold text-{theme.primary} mb-2">
									{profileData.projects ? profileData.projects.length : 0}+
								</div>
								<div class="text-gray-700 dark:text-gray-300 font-medium">Projects</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Experience -->
	{#if profileData.workExperience && profileData.workExperience.length > 0}
		<section id="work" class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-4xl sm:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Work <span class="bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent">Experience</span>
				</h2>
				
				<div class="space-y-8">
					{#each profileData.workExperience as experience}
						<div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
							<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
								<div>
									<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{experience.title}</h3>
									<p class="text-{theme.primary} font-semibold mb-1">{experience.company}</p>
									<p class="text-gray-600 dark:text-gray-300">{experience.period}</p>
								</div>
								<span class="px-3 py-1 bg-{theme.accent} text-{theme.primary} rounded-full text-sm font-medium mt-4 sm:mt-0">
									{experience.type}
								</span>
							</div>
							{#if experience.description}
								<p class="text-gray-700 dark:text-gray-300 leading-relaxed">{experience.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Projects -->
	{#if profileData.projects && profileData.projects.length > 0}
		<section class="py-20 px-4 sm:px-6 lg:px-8">
			<div class="max-w-7xl mx-auto">
				<h2 class="text-4xl sm:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
					Featured <span class="bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent">Projects</span>
				</h2>
				
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each profileData.projects as project}
						<div class="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
							{#if project.image}
								<img src={project.image} alt={project.title} class="w-full h-56 object-cover" />
							{:else}
								<div class="w-full h-56 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} flex items-center justify-center">
									<div class="text-white text-6xl font-bold">{project.title?.charAt(0) || 'P'}</div>
								</div>
							{/if}
							
							<div class="p-8">
								<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
								<p class="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
								
								{#if project.technologies}
									<div class="flex flex-wrap gap-2 mb-6">
										{#each project.technologies as tech}
											<span class="px-3 py-1 bg-{theme.accent} text-{theme.primary} rounded-full text-sm font-medium">{tech}</span>
										{/each}
									</div>
								{/if}
								
								<div class="flex space-x-3">
									{#if project.liveUrl}
										<a href={project.liveUrl} target="_blank" class="flex-1 bg-gradient-to-r from-{theme.primary} to-{theme.secondary} text-white text-center py-3 rounded-xl font-medium">Live Demo</a>
									{/if}
									{#if project.githubUrl}
										<a href={project.githubUrl} target="_blank" class="flex-1 border-2 border-{theme.primary} text-{theme.primary} text-center py-3 rounded-xl font-medium">View Code</a>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Contact -->
	<section id="contact" class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-{theme.primary}/10 to-{theme.secondary}/10">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8">
				Let's Create Something <span class="bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent">Amazing</span>
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
				I'm always excited to work on new projects and collaborate with amazing people.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-6 justify-center">
				{#if profileData.contact?.email}
					<a href="mailto:{profileData.contact.email}" class="px-8 py-4 bg-gradient-to-r from-{theme.primary} to-{theme.secondary} text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300">
						{profileData.contact.email}
					</a>
				{/if}
				{#if profileData.contact?.phone}
					<a href="tel:{profileData.contact.phone}" class="px-8 py-4 border-2 border-{theme.primary} text-{theme.primary} font-semibold rounded-full hover:bg-{theme.primary} hover:text-white transition-all duration-300">
						{profileData.contact.phone}
					</a>
				{/if}
			</div>
		</div>
	</section>
</div>