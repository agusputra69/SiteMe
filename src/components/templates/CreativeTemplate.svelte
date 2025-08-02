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
		primary: 'purple-600',
		secondary: 'pink-500',
		accent: 'purple-100',
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
	
	$: appliedStyles = `background-color: ${customization.backgroundColor}; color: ${customization.textColor}; accent-color: ${customization.accentColor};`;
</script>

<div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 min-h-screen p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Artistic Header -->
		<div class="relative mb-16">
			<!-- Background Shapes -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-{theme.primary}/20 to-{theme.secondary}/20 rounded-full blur-3xl"></div>
				<div class="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-{theme.secondary}/15 to-{theme.primary}/15 rounded-full blur-3xl"></div>
			</div>
			
			<!-- Header Content -->
			<div class="relative z-10 text-center py-20">
				<div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
					{profileData.avatar}
				</div>
				
				<h1 class="text-6xl font-extrabold bg-gradient-to-r from-{theme.primary} to-{theme.secondary} bg-clip-text text-transparent mb-4">
					{#if customizable}
						<input 
							bind:value={profileData.name}
							class="bg-transparent border-none outline-none w-full text-center text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
							placeholder="Your Name"
						/>
					{:else}
						{profileData.name}
					{/if}
				</h1>
				
				{#if profileData.contact}
					<div class="flex justify-center space-x-8 text-{theme.textSecondary} dark:text-gray-300">
						{#if profileData.contact.email}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-{theme.primary} rounded-full"></span>
								<span>{profileData.contact.email}</span>
							</div>
						{/if}
						{#if profileData.contact.phone}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-{theme.secondary} rounded-full"></span>
								<span>{profileData.contact.phone}</span>
							</div>
						{/if}
						{#if profileData.contact.location}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-gradient-to-r from-{theme.primary} to-{theme.secondary} rounded-full"></span>
								<span>{profileData.contact.location}</span>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Content Grid -->
		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Left Column -->
			<div class="lg:col-span-2 space-y-8">
				<!-- About Section -->
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
					<div class="flex items-center mb-6">
						<div class="w-1 h-8 bg-gradient-to-b from-{theme.primary} to-{theme.secondary} rounded-full mr-4"></div>
						<h2 class="text-3xl font-bold text-{theme.text} dark:text-white">
							About Me
						</h2>
					</div>
					{#if customizable}
						<textarea 
							bind:value={profileData.about}
							class="w-full text-lg text-{theme.text} dark:text-gray-300 leading-relaxed bg-transparent border border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 focus:outline-none focus:border-{theme.primary} resize-none"
							rows="5"
							placeholder="Tell us about yourself..."
						></textarea>
					{:else}
						<p class="text-lg text-{theme.text} dark:text-gray-300 leading-relaxed">
							{profileData.about}
						</p>
					{/if}
				</div>

				<!-- Experience Section -->
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
					<div class="flex items-center mb-8">
						<div class="w-1 h-8 bg-gradient-to-b from-{theme.secondary} to-{theme.primary} rounded-full mr-4"></div>
						<h2 class="text-3xl font-bold text-{theme.text} dark:text-white">
							Experience
						</h2>
					</div>
					
					<div class="space-y-8">
						{#each profileData.workExperience as experience, index}
							<div class="relative">
								<!-- Timeline dot -->
								<div class="absolute -left-4 top-6 w-4 h-4 bg-gradient-to-br from-{theme.primary} to-{theme.secondary} rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
								
								<div class="bg-gradient-to-r from-{theme.accent}/30 to-transparent dark:from-{theme.primary}/10 dark:to-transparent rounded-2xl p-6 ml-4 border-l-4 border-{theme.primary}/30">
									<div class="flex justify-between items-start mb-3">
										<h3 class="text-xl font-bold text-{theme.text} dark:text-white">
											{#if customizable}
												<input 
													bind:value={experience.title}
													class="bg-transparent border-none outline-none w-full text-xl font-bold"
													placeholder="Job Title"
												/>
											{:else}
												{experience.title}
											{/if}
										</h3>
										<span class="px-3 py-1 bg-{theme.primary} text-white rounded-full text-sm font-medium">
											{#if customizable}
												<input 
													bind:value={experience.period}
													class="bg-transparent border-none outline-none text-center w-24 text-sm text-white placeholder-white/70"
													placeholder="Period"
												/>
											{:else}
												{experience.period}
											{/if}
										</span>
									</div>
									<p class="text-{theme.secondary} dark:text-{theme.secondary} font-semibold mb-2">
										{#if customizable}
											<input 
												bind:value={experience.company}
												class="bg-transparent border-none outline-none w-full font-semibold"
												placeholder="Company Name"
											/>
										{:else}
											{experience.company}
										{/if}
									</p>
									{#if experience.description}
										<p class="text-{theme.textSecondary} dark:text-gray-400">
											{experience.description}
										</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="space-y-8">
				<!-- Skills Section -->
				{#if profileData.skills && profileData.skills.length > 0}
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
						<div class="flex items-center mb-6">
							<div class="w-1 h-6 bg-gradient-to-b from-{theme.primary} to-{theme.secondary} rounded-full mr-3"></div>
							<h2 class="text-2xl font-bold text-{theme.text} dark:text-white">
								Skills
							</h2>
						</div>
						<div class="flex flex-wrap gap-3">
							{#each profileData.skills as skill, index}
								<span class="px-4 py-2 bg-gradient-to-r from-{theme.primary}/20 to-{theme.secondary}/20 text-{theme.primary} dark:text-{theme.secondary} rounded-full text-sm font-medium border border-{theme.primary}/30 hover:scale-105 transition-transform duration-200">
									{skill}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Education Section -->
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
					<div class="flex items-center mb-6">
						<div class="w-1 h-6 bg-gradient-to-b from-{theme.secondary} to-{theme.primary} rounded-full mr-3"></div>
						<h2 class="text-2xl font-bold text-{theme.text} dark:text-white">
							Education
						</h2>
					</div>
					<div class="space-y-4">
						{#each profileData.education as edu, index}
							<div class="bg-gradient-to-r from-{theme.accent}/20 to-transparent dark:from-{theme.primary}/5 dark:to-transparent rounded-xl p-4 border-l-4 border-{theme.secondary}">
								<h3 class="font-bold text-{theme.text} dark:text-white mb-1">
									{#if customizable}
										<input 
											bind:value={edu.degree}
											class="bg-transparent border-none outline-none w-full font-bold"
											placeholder="Degree"
										/>
									{:else}
										{edu.degree}
									{/if}
								</h3>
								<p class="text-{theme.textSecondary} dark:text-gray-300 text-sm mb-1">
									{#if customizable}
										<input 
											bind:value={edu.institution}
											class="bg-transparent border-none outline-none w-full text-sm"
											placeholder="Institution"
										/>
									{:else}
										{edu.institution}
									{/if}
								</p>
								<p class="text-{theme.secondary} text-sm font-medium">
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
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	input:focus, textarea:focus {
		box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
	}
</style>