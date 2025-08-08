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
		primary: 'gray-900',
		secondary: 'gray-700',
		accent: 'gray-200',
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
	$: dynamicBackgroundColor = isDarkMode ? '#111827' : customization.backgroundColor;
	$: dynamicTextColor = isDarkMode ? '#F9FAFB' : customization.textColor;
	$: dynamicAccentColor = customization.accentColor;
	$: dynamicBorderColor = isDarkMode ? '#374151' : '#E5E7EB';

	$: appliedStyles = `background-color: ${dynamicBackgroundColor}; color: ${dynamicTextColor};`;

	// Responsive spacing and layout classes
	$: spacingClass =
		{
			tight: 'space-y-8 sm:space-y-10',
			normal: 'space-y-10 sm:space-y-12',
			relaxed: 'space-y-12 sm:space-y-16'
		}[customization.spacing] || 'space-y-10 sm:space-y-12';

	$: containerClass =
		{
			compact: 'max-w-3xl',
			standard: 'max-w-4xl',
			wide: 'max-w-5xl'
		}[customization.containerWidth] || 'max-w-4xl';

	$: paddingClass =
		{
			tight: 'p-6 sm:p-8',
			normal: 'p-8 sm:p-12',
			relaxed: 'p-10 sm:p-16'
		}[customization.horizontalPadding] || 'p-8 sm:p-12';

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
		class="{containerClass} mx-auto {paddingClass} {fontClass} transition-all duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
	>
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
					<div
						class="w-24 h-24 rounded-full mx-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600"
					>
						<span
							class="text-2xl font-bold text-gray-700 dark:text-gray-300"
							aria-label="Profile initial">{avatarInitial}</span
						>
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

		<!-- Main Content -->
		<div class={spacingClass}>
			<!-- About Section -->
			<section>
				<h2
					class="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4 font-sans"
				>
					About
				</h2>
				{#if customizable}
					<textarea
						bind:value={profileData.about}
						class="w-full text-lg text-gray-900 dark:text-gray-100 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-500/20 resize-none font-serif"
						rows="4"
						placeholder="Tell us about yourself..."
						aria-label="Professional summary"
					/>
				{:else}
					<p class="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
						{profileData.about}
					</p>
				{/if}
			</section>

			<!-- Experience Section -->
			<section>
				<h2
					class="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-6 font-sans"
				>
					Experience
				</h2>
				<div class="space-y-8">
					{#each profileData.workExperience || [] as experience, index}
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
			<section>
				<h2
					class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
				>
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
					<h2
						class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
					>
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

			<!-- Certifications Section -->
			{#if profileData.certifications && profileData.certifications.length > 0}
				<section>
					<h2
						class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
					>
						Certifications
					</h2>
					<div class="space-y-4">
						{#each profileData.certifications as cert}
							<div class="flex">
								<div class="w-32 flex-shrink-0">
									<p class="text-sm text-gray-600 dark:text-gray-400 font-sans">
										{cert.date}
									</p>
								</div>
								<div class="flex-1">
									<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
										{cert.name}
									</h3>
									<p class="text-gray-600 dark:text-gray-300 font-sans">
										{cert.issuer}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Languages Section -->
			{#if profileData.languages && profileData.languages.length > 0}
				<section>
					<h2
						class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
					>
						Languages
					</h2>
					<div class="space-y-3">
						{#each profileData.languages as language}
							<div class="flex justify-between items-center">
								<span class="text-gray-900 dark:text-gray-300 font-sans">
									{language.language}
								</span>
								<span class="text-sm text-gray-600 dark:text-gray-400 font-sans">
									{language.proficiency}
								</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Projects Section -->
			{#if profileData.projects && profileData.projects.length > 0}
				<section>
					<h2
						class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
					>
						Projects
					</h2>
					<div class="space-y-6">
						{#each profileData.projects as project}
							<div>
								<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
									{project.name}
								</h3>
								{#if project.description}
									<p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
										{project.description}
									</p>
								{/if}
								{#if project.technologies && project.technologies.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each project.technologies as tech}
											<span
												class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-sans"
											>
												{tech}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Awards Section -->
			{#if profileData.awards && profileData.awards.length > 0}
				<section>
					<h2
						class="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6 font-sans"
					>
						Awards
					</h2>
					<div class="space-y-4">
						{#each profileData.awards as award}
							<div class="flex">
								<div class="w-32 flex-shrink-0">
									<p class="text-sm text-gray-600 dark:text-gray-400 font-sans">
										{award.date}
									</p>
								</div>
								<div class="flex-1">
									<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
										{award.title}
									</h3>
									<p class="text-gray-600 dark:text-gray-300 font-sans">
										{award.organization}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Links Section -->
			{#if profileData.links && profileData.links.length > 0}
				<section class="mb-12">
					<h2
						class="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4 font-sans"
					>
						Links
					</h2>
					<div class="space-y-3">
						{#each profileData.links as link}
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-300 transition-colors group"
							>
								<div>
									<div
										class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors"
									>
										{link.type}
									</div>
									<div class="text-sm text-gray-600 dark:text-gray-400">
										{link.url}
									</div>
								</div>
								<svg
									class="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
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
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
	}
</style>
