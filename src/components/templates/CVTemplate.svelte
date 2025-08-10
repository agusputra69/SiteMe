<script lang="ts">
	export let profileData = {
		name: 'Your Name',
		avatar: 'Y',
		about: 'Your professional summary goes here...',
		workExperience: [
			{
				title: 'Your Job Title',
				company: 'Company Name',
				type: 'Full-Time',
				period: 'Start - End',
				current: false
			}
		],
		education: [
			{
				institution: 'University Name',
				degree: 'Your Degree',
				period: 'Start - End'
			}
		],
		skills: [] as string[],
		certifications: [] as Array<{
			name: string;
			issuer: string;
			date?: string;
			description?: string;
		}>,
		languages: [] as Array<{ language: string; proficiency: string }>,
		projects: [] as Array<{
			title?: string;
			name?: string;
			description: string;
			technologies?: string[];
			liveUrl?: string;
			url?: string;
		}>,
		awards: [] as Array<{
			title: string;
			organization: string;
			date?: string;
			description?: string;
		}>
	};

	// Ensure all arrays are properly initialized
	$: safeProfileData = {
		...profileData,
		workExperience: Array.isArray(profileData.workExperience) ? profileData.workExperience : [],
		education: Array.isArray(profileData.education) ? profileData.education : [],
		skills: Array.isArray(profileData.skills) ? profileData.skills : [],
		certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
		languages: Array.isArray(profileData.languages) ? profileData.languages : [],
		projects: Array.isArray(profileData.projects)
			? profileData.projects.map((p) => ({
					...p,
					technologies: Array.isArray(p.technologies) ? p.technologies : []
			  }))
			: [],
		awards: Array.isArray(profileData.awards) ? profileData.awards : []
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

	// Theme options
	let selectedTheme: 'blue' | 'green' | 'purple' | 'red' | 'indigo' = 'blue';
	const themes = {
		blue: { primary: 'blue-500', secondary: 'blue-600', accent: 'blue-100' },
		green: { primary: 'green-500', secondary: 'green-600', accent: 'green-100' },
		purple: { primary: 'purple-500', secondary: 'purple-600', accent: 'purple-100' },
		red: { primary: 'red-500', secondary: 'red-600', accent: 'red-100' },
		indigo: { primary: 'indigo-500', secondary: 'indigo-600', accent: 'indigo-100' }
	} as const;

	// Layout options
	let compactMode = false;
	let showBorders = true;

	// Add new work experience entry
	function addWorkExperience() {
		profileData.workExperience = [
			...(profileData.workExperience || []),
			{
				title: 'New Position',
				company: 'Company Name',
				type: 'Full-Time',
				period: 'Start - End',
				current: false
			}
		];
	}

	// Add new education entry
	function addEducation() {
		profileData.education = [
			...(profileData.education || []),
			{
				institution: 'Institution Name',
				degree: 'Degree',
				period: 'Start - End'
			}
		];
	}

	// Remove work experience entry
	function removeWorkExperience(index: number) {
		profileData.workExperience = (profileData.workExperience || []).filter((_, i) => i !== index);
	}

	// Remove education entry
	function removeEducation(index: number) {
		profileData.education = profileData.education.filter((_, i) => i !== index);
	}

	$: currentTheme = themes[selectedTheme];

	// Apply customization settings
	$: appliedTheme = {
		primary:
			customization.accentColor ||
			themes[customization.theme as keyof typeof themes]?.primary ||
			themes.blue.primary,
		secondary:
			customization.accentColor ||
			themes[customization.theme as keyof typeof themes]?.secondary ||
			themes.blue.secondary,
		accent: customization.backgroundColor || '#FFFFFF'
	};

	$: fontClass =
		{
			inter: 'font-sans',
			mono: 'font-mono',
			poppins: 'font-sans',
			playfair: 'font-serif',
			roboto: 'font-sans'
		}[customization.fontFamily] || 'font-sans';

	$: sizeClass =
		{
			small: 'text-sm',
			medium: 'text-base',
			large: 'text-lg'
		}[customization.fontSize] || 'text-base';

	$: spacingClass =
		{
			tight: 'space-y-2',
			normal: 'space-y-4',
			relaxed: 'space-y-6'
		}[customization.spacing] || 'space-y-4';
</script>

<!-- Customization Controls -->
{#if customizable}
	<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-4">
		<h3 class="font-semibold text-gray-900 dark:text-white mb-3">Customization Options</h3>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Theme Selection -->
			<div>
				<label
					for="theme-select"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label
				>
				<select
					id="theme-select"
					bind:value={selectedTheme}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="purple">Purple</option>
					<option value="red">Red</option>
					<option value="indigo">Indigo</option>
				</select>
			</div>

			<!-- Layout Options -->
			<div>
				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>Layout</legend
					>
					<div class="space-y-2">
						<label class="flex items-center">
							<input type="checkbox" bind:checked={compactMode} class="mr-2" />
							<span class="text-sm text-gray-600 dark:text-gray-300">Compact Mode</span>
						</label>
						<label class="flex items-center">
							<input type="checkbox" bind:checked={showBorders} class="mr-2" />
							<span class="text-sm text-gray-600 dark:text-gray-300">Show Borders</span>
						</label>
					</div>
				</fieldset>
			</div>

			<!-- Action Buttons -->
			<div>
				<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Add Sections
				</div>
				<div class="space-y-2">
					<button
						on:click={addWorkExperience}
						class="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
						>+ Work Experience</button
					>
					<button
						on:click={addEducation}
						class="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
						>+ Education</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}

<div
	class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<div
		class="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden max-w-4xl mx-auto {fontClass} {sizeClass} {showBorders
			? 'border border-gray-200 dark:border-gray-700'
			: ''} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
	>
		<!-- CV Content -->
		<div class="p-6 {spacingClass}">
			<!-- Profile Header -->
			<div class="flex items-start space-x-4 mb-6">
				<div
					class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
					style="background: linear-gradient(135deg, {customization.accentColor}, {customization.accentColor}dd);"
				>
					{#if safeProfileData.avatar && (safeProfileData.avatar.startsWith('http') || safeProfileData.avatar.startsWith('data:') || safeProfileData.avatar.includes('.'))}
						<img
							src={safeProfileData.avatar}
							alt="Profile photo of {safeProfileData.name}"
							class="w-full h-full object-cover"
							on:error={() => {
								// Fallback to initial if image fails to load
								safeProfileData.avatar = safeProfileData.name
									? safeProfileData.name.charAt(0).toUpperCase()
									: 'U';
							}}
						/>
					{:else}
						<span class="text-white font-bold" aria-label="Profile initial">
							{safeProfileData.name ? safeProfileData.name.charAt(0).toUpperCase() : 'U'}
						</span>
					{/if}
				</div>
				<div class="flex-1">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
						{#if customizable}
							<input
								bind:value={safeProfileData.name}
								class="bg-transparent border-none outline-none w-full focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1"
								placeholder="Your Name"
							/>
						{:else}
							{safeProfileData.name}
						{/if}
					</h1>
				</div>
			</div>

			<div class="space-y-6">
				<!-- About Section -->
				<div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
					{#if customizable}
						<textarea
							bind:value={safeProfileData.about}
							class="w-full text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
							rows="3"
							placeholder="Tell us about yourself..."
						/>
					{:else}
						<p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
							{safeProfileData.about}
						</p>
					{/if}
				</div>

				<!-- Work Experience Section -->
				<div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-3">Work Experience</h3>
					<div class="space-y-3">
						{#each safeProfileData.workExperience as experience, index}
							<div
								class="border-l-2 {experience.current
									? `border-${currentTheme.primary}`
									: 'border-gray-300 dark:border-gray-600'} pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode
									? 'py-2'
									: 'py-3'} relative group"
							>
								{#if customizable}
									<button
										on:click={() => removeWorkExperience(index)}
										class="absolute -right-2 -top-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
										>×</button
									>
								{/if}

								<div class="flex justify-between items-start mb-1">
									<h4 class="font-medium text-gray-900 dark:text-white">
										{#if customizable}
											<input
												bind:value={experience.title}
												class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 font-medium"
												placeholder="Job Title"
											/>
										{:else}
											{experience.title}
										{/if}
									</h4>
									<span
										class="text-xs text-gray-500 dark:text-gray-400 {experience.current
											? `text-${currentTheme.primary}`
											: ''}"
									>
										{#if customizable}
											<input
												bind:value={experience.period}
												class="bg-transparent border-none outline-none text-right focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-24 text-xs"
												placeholder="Period"
											/>
										{:else}
											{experience.period}
										{/if}
										{#if experience.current}
											<span
												class="ml-1 px-2 py-1 bg-{currentTheme.primary} text-white text-xs rounded-full"
												>Current</span
											>
										{/if}
									</span>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-300">
									{#if customizable}
										<input
											bind:value={experience.company}
											class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1"
											placeholder="Company Name"
										/>
										•
										<input
											bind:value={experience.type}
											class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-20"
											placeholder="Type"
										/>
										{#if customizable}
											<label class="block mt-2">
												<input type="checkbox" bind:checked={experience.current} class="mr-2" />
												<span class="text-xs">Current Position</span>
											</label>
										{/if}
									{:else}
										{experience.company} • {experience.type}
									{/if}
								</p>
							</div>
						{/each}

						{#if customizable}
							<button
								on:click={() => {
									profileData.workExperience = [
										...profileData.workExperience,
										{
											title: 'New Position',
											company: 'Company Name',
											type: 'Full-Time',
											period: 'Start - End',
											current: false
										}
									];
								}}
								class="text-blue-600 dark:text-blue-400 text-sm hover:underline"
							>
								+ Add Work Experience
							</button>
						{/if}
					</div>
				</div>

				<!-- Education Section -->
				<div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Education</h3>
					<div class="space-y-3">
						{#each safeProfileData.education as edu, index}
							<div
								class="border-l-2 border-{currentTheme.secondary} pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode
									? 'py-2'
									: 'py-3'} relative group"
							>
								{#if customizable}
									<button
										on:click={() => removeEducation(index)}
										class="absolute -right-2 -top-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
										>×</button
									>
								{/if}

								<div class="flex justify-between items-start mb-1">
									<h4 class="font-medium text-gray-900 dark:text-white">
										{#if customizable}
											<input
												bind:value={edu.degree}
												class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 font-medium"
												placeholder="Degree"
											/>
										{:else}
											{edu.degree}
										{/if}
									</h4>
									<span class="text-xs text-gray-500 dark:text-gray-400">
										{#if customizable}
											<input
												bind:value={edu.period}
												class="bg-transparent border-none outline-none text-right focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-24 text-xs"
												placeholder="Period"
											/>
										{:else}
											{edu.period}
										{/if}
									</span>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-300">
									{#if customizable}
										<input
											bind:value={edu.institution}
											class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-full"
											placeholder="Institution"
										/>
									{:else}
										{edu.institution}
									{/if}
								</p>
							</div>
						{/each}

						{#if customizable}
							<button
								on:click={() => {
									profileData.education = [
										...(profileData.education || []),
										{
											institution: 'University Name',
											degree: 'Your Degree',
											period: 'Start - End'
										}
									];
								}}
								class="text-blue-600 dark:text-blue-400 text-sm hover:underline"
							>
								+ Add Education
							</button>
						{/if}
					</div>
				</div>

				<!-- Skills Section -->
				{#if safeProfileData.skills && safeProfileData.skills.length > 0}
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
						<div class="flex flex-wrap gap-2">
							{#each safeProfileData.skills as skill}
								<span
									class="px-3 py-1 bg-{currentTheme.accent} text-{currentTheme.primary} text-sm rounded-full"
								>
									{skill}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Certifications Section -->
				{#if safeProfileData.certifications && safeProfileData.certifications.length > 0}
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Certifications</h3>
						<div class="space-y-3">
							{#each safeProfileData.certifications as cert}
								<div
									class="border-l-2 border-yellow-500 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode
										? 'py-2'
										: 'py-3'}"
								>
									<div class="flex justify-between items-start mb-1">
										<h4 class="font-medium text-gray-900 dark:text-white">{cert.name}</h4>
										{#if cert.date}
											<span class="text-xs text-gray-500 dark:text-gray-400">{cert.date}</span>
										{/if}
									</div>
									<p class="text-sm text-gray-600 dark:text-gray-300">{cert.issuer}</p>
									{#if cert.description}
										<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{cert.description}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Languages Section -->
				{#if safeProfileData.languages && safeProfileData.languages.length > 0}
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Languages</h3>
						<div class="grid grid-cols-2 gap-3">
							{#each safeProfileData.languages as lang}
								<div
									class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
								>
									<span class="text-sm font-medium text-gray-900 dark:text-white"
										>{lang.language}</span
									>
									<span class="text-xs text-gray-500 dark:text-gray-400">{lang.proficiency}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Projects Section -->
				{#if safeProfileData.projects && safeProfileData.projects.length > 0}
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Projects</h3>
						<div class="space-y-3">
							{#each safeProfileData.projects as project}
								<div
									class="border-l-2 border-green-500 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode
										? 'py-2'
										: 'py-3'}"
								>
									<h4 class="font-medium text-gray-900 dark:text-white">
										{project.title || project.name}
									</h4>
									<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
									{#if project.technologies && project.technologies.length > 0}
										<div class="flex flex-wrap gap-1 mt-2">
											{#each project.technologies as tech}
												<span
													class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded"
													>{tech}</span
												>
											{/each}
										</div>
									{/if}
									{#if project.liveUrl || project.url}
										<a
											href={project.liveUrl || project.url}
											target="_blank"
											class="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
											>View Project</a
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Awards Section -->
				{#if safeProfileData.awards && safeProfileData.awards.length > 0}
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Awards</h3>
						<div class="space-y-3">
							{#each safeProfileData.awards as award}
								<div
									class="border-l-2 border-purple-500 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode
										? 'py-2'
										: 'py-3'}"
								>
									<div class="flex justify-between items-start mb-1">
										<h4 class="font-medium text-gray-900 dark:text-white">{award.title}</h4>
										{#if award.date}
											<span class="text-xs text-gray-500 dark:text-gray-400">{award.date}</span>
										{/if}
									</div>
									<p class="text-sm text-gray-600 dark:text-gray-300">{award.organization}</p>
									{#if award.description}
										<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{award.description}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
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
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
</style>
