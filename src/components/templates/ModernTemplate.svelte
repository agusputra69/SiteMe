<script lang="ts">
	import type { ProfileData, TemplateCustomization } from '$lib/types';

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
	export let customization: TemplateCustomization = {
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

	// Apply customization settings with dark mode support
	$: fontClass =
		{
			inter: 'font-sans',
			mono: 'font-mono',
			poppins: 'font-sans',
			playfair: 'font-serif',
			roboto: 'font-sans'
		}[customization.fontFamily] || 'font-sans';

	// Dynamic theme colors with dark mode support
	$: isDarkMode =
		typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
	$: dynamicBackgroundColor = isDarkMode ? '#1F2937' : customization.backgroundColor;
	$: dynamicTextColor = isDarkMode ? '#F9FAFB' : customization.textColor;
	$: dynamicAccentColor = customization.accentColor;

	$: sizeClass =
		{
			small: 'text-sm',
			medium: 'text-base',
			large: 'text-lg'
		}[customization.fontSize] || 'text-base';

	$: spacingClass =
		{
			tight: 'space-y-2 sm:space-y-3',
			normal: 'space-y-4 sm:space-y-6',
			relaxed: 'space-y-6 sm:space-y-8'
		}[customization.spacing] || 'space-y-4 sm:space-y-6';

	$: containerClass =
		{
			compact: 'max-w-3xl',
			standard: 'max-w-4xl',
			wide: 'max-w-5xl'
		}[customization.containerWidth] || 'max-w-4xl';

	$: paddingClass =
		{
			tight: 'p-3 sm:p-6',
			normal: 'p-4 sm:p-8',
			relaxed: 'p-6 sm:p-10'
		}[customization.horizontalPadding] || 'p-4 sm:p-8';

	// Check if avatar is an image URL or text
	$: isImageUrl =
		profileData.avatar &&
		(profileData.avatar.startsWith('http') ||
			profileData.avatar.startsWith('data:') ||
			profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
</script>

<div
	class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<div
		class="rounded-xl shadow-2xl overflow-hidden {containerClass} mx-auto {fontClass} {sizeClass} transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
	>
		<!-- Header Section -->
		<div
			class="text-white p-4 sm:p-8 transition-all duration-300"
			style="background: linear-gradient(135deg, {dynamicAccentColor}, {dynamicAccentColor}dd);"
		>
			<div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
				<div
					class="w-16 sm:w-24 h-16 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-3xl font-bold backdrop-blur-sm overflow-hidden"
				>
					{#if isImageUrl}
						<img
							src={profileData.avatar}
							alt="Profile photo of {profileData.name}"
							class="w-full h-full object-cover"
							on:error={() => {
								// Fallback to initial if image fails to load
								isImageUrl = false;
							}}
						/>
					{:else}
						<span class="text-white font-bold" aria-label="Profile initial">{avatarInitial}</span>
					{/if}
				</div>
				<div class="flex-1 text-center sm:text-left">
					<h1 class="text-2xl sm:text-4xl font-bold mb-2">
						{#if customizable}
							<input
								bind:value={profileData.name}
								class="bg-transparent border-none outline-none w-full text-white placeholder-white/70"
								placeholder="Your Name"
								aria-label="Enter your name"
							/>
						{:else}
							{profileData.name}
						{/if}
					</h1>
					{#if profileData.contact}
						<div
							class="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-white/95"
						>
							{#if profileData.contact.email}
								<span aria-label="Email address" class="flex items-center gap-1"
									>📧 {profileData.contact.email}</span
								>
							{/if}
							{#if profileData.contact.phone}
								<span aria-label="Phone number" class="flex items-center gap-1"
									>📱 {profileData.contact.phone}</span
								>
							{/if}
							{#if profileData.contact.location}
								<span aria-label="Location" class="flex items-center gap-1"
									>📍 {profileData.contact.location}</span
								>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Content Section -->
		<div class={paddingClass}>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
				<!-- Left Column -->
				<div class="md:col-span-2 {spacingClass}">
					<!-- About Section -->
					<section>
						<h2
							class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 border-b-2 border-blue-600 pb-2"
						>
							About
						</h2>
						{#if customizable}
							<textarea
								bind:value={profileData.about}
								class="w-full text-gray-700 dark:text-gray-200 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 resize-none"
								rows="4"
								placeholder="Tell us about yourself..."
								aria-label="Professional summary"
							/>
						{:else}
							<p class="text-gray-700 dark:text-gray-200 leading-relaxed">
								{profileData.about}
							</p>
						{/if}
					</section>

					<!-- Work Experience Section -->
					<section>
						<h2
							class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-blue-600 pb-2"
						>
							Work Experience
						</h2>
						<div class="space-y-6">
							{#each profileData.workExperience || [] as experience, index}
								<div class="relative pl-8 border-l-4 border-blue-100 dark:border-blue-500">
									<div
										class="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"
										aria-hidden="true"
									/>
									<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
										<div class="flex justify-between items-start mb-2">
											<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
												{#if customizable}
													<input
														bind:value={experience.title}
														class="bg-transparent border-none outline-none w-full font-semibold focus:ring-2 focus:ring-blue-500/20"
														placeholder="Job Title"
														aria-label="Job title"
													/>
												{:else}
													{experience.title}
												{/if}
											</h3>
											<span class="text-sm text-blue-600 font-medium">
												{#if customizable}
													<input
														bind:value={experience.period}
														class="bg-transparent border-none outline-none text-right w-32 text-sm focus:ring-2 focus:ring-blue-500/20"
														placeholder="Period"
														aria-label="Employment period"
													/>
												{:else}
													{experience.period}
												{/if}
											</span>
										</div>
										<p class="text-gray-700 dark:text-gray-200 font-medium mb-2">
											{#if customizable}
												<input
													bind:value={experience.company}
													class="bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-blue-500/20"
													placeholder="Company Name"
													aria-label="Company name"
												/>
											{:else}
												{experience.company}
											{/if}
										</p>
										{#if experience.description}
											<p class="text-sm text-gray-600 dark:text-gray-300">
												{experience.description}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</section>
				</div>

				<!-- Right Column -->
				<div class={spacingClass}>
					<!-- Skills Section -->
					{#if profileData.skills && profileData.skills.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Skills</h2>
							<div class="flex flex-wrap gap-2">
								{#each profileData.skills || [] as skill}
									<span
										class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
									>
										{skill}
									</span>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Education Section -->
					<section>
						<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Education</h2>
						<div class="space-y-4">
							{#each profileData.education || [] as edu, index}
								<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
									<h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
										{#if customizable}
											<input
												bind:value={edu.degree}
												class="bg-transparent border-none outline-none w-full font-semibold focus:ring-2 focus:ring-blue-500/20"
												placeholder="Degree"
												aria-label="Degree or qualification"
											/>
										{:else}
											{edu.degree}
										{/if}
									</h3>
									<p class="text-gray-700 dark:text-gray-200 text-sm">
										{#if customizable}
											<input
												bind:value={edu.institution}
												class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-blue-500/20"
												placeholder="Institution"
												aria-label="Educational institution"
											/>
										{:else}
											{edu.institution}
										{/if}
									</p>
									<p class="text-blue-600 dark:text-blue-400 text-sm font-medium">
										{#if customizable}
											<input
												bind:value={edu.period}
												class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-blue-500/20"
												placeholder="Period"
												aria-label="Education period"
											/>
										{:else}
											{edu.period}
										{/if}
									</p>
								</div>
							{/each}
						</div>
					</section>

					<!-- Certifications Section -->
					{#if profileData.certifications && profileData.certifications.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
								Certifications
							</h2>
							<div class="space-y-4">
								{#each profileData.certifications || [] as cert}
									<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
										<h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
											{cert.name}
										</h3>
										<p class="text-gray-700 dark:text-gray-200 text-sm">
											{cert.issuer}
										</p>
										{#if cert.date}
											<p class="text-blue-600 dark:text-blue-400 text-sm font-medium">
												{cert.date}
											</p>
										{/if}
										{#if cert.description}
											<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
												{cert.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Languages Section -->
					{#if profileData.languages && profileData.languages.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Languages</h2>
							<div class="space-y-3">
								{#each profileData.languages || [] as lang}
									<div
										class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
									>
										<span class="font-medium text-gray-900 dark:text-gray-100">{lang.language}</span
										>
										<span class="text-sm text-blue-600 dark:text-blue-400 font-medium"
											>{lang.proficiency}</span
										>
									</div>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Projects Section -->
					{#if profileData.projects && profileData.projects.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Projects</h2>
							<div class="space-y-4">
								{#each profileData.projects || [] as project}
									<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
										<h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
											{project.title || project.name}
										</h3>
										<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
											{project.description}
										</p>
										{#if project.technologies && project.technologies.length > 0}
											<div class="flex flex-wrap gap-1 mb-2">
												{#each project.technologies as tech}
													<span
														class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded"
														>{tech}</span
													>
												{/each}
											</div>
										{/if}
										{#if project.liveUrl || project.url}
											<a
												href={project.liveUrl || project.url}
												target="_blank"
												class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
												>View Project</a
											>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Awards Section -->
					{#if profileData.awards && profileData.awards.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Awards</h2>
							<div class="space-y-4">
								{#each profileData.awards || [] as award}
									<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
										<h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
											{award.title}
										</h3>
										<p class="text-gray-700 dark:text-gray-200 text-sm">
											{award.organization}
										</p>
										{#if award.date}
											<p class="text-blue-600 dark:text-blue-400 text-sm font-medium">
												{award.date}
											</p>
										{/if}
										{#if award.description}
											<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
												{award.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Links Section -->
					{#if profileData.links && profileData.links.length > 0}
						<section>
							<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Links</h2>
							<div class="space-y-3">
								{#each profileData.links || [] as link}
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
									>
										<span
											class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mr-3 text-sm font-medium"
										>
											{link.type.charAt(0).toUpperCase()}
										</span>
										<div class="flex-1">
											<div
												class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
											>
												{link.type}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 truncate">
												{link.url}
											</div>
										</div>
										<svg
											class="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
								{/each}
							</div>
						</section>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- SiteMe Footer -->
	<footer
		class="mt-12 py-8 px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
	>
		<div class="max-w-4xl mx-auto text-center">
			<div class="flex items-center justify-center space-x-2 mb-4">
				<svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
				<span class="text-lg font-bold text-gray-900 dark:text-white">SiteMe</span>
			</div>
			<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
				Create your professional portfolio in minutes
			</p>
			<div
				class="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400"
			>
				<a href="/features" class="hover:text-blue-600 transition-colors">Features</a>
				<a href="/templates" class="hover:text-blue-600 transition-colors">Templates</a>
				<a href="/pricing" class="hover:text-blue-600 transition-colors">Pricing</a>
				<a href="/about" class="hover:text-blue-600 transition-colors">About</a>
			</div>
			<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<p class="text-xs text-gray-400 dark:text-gray-500">© 2024 SiteMe. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	input:focus,
	textarea:focus {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}
</style>
