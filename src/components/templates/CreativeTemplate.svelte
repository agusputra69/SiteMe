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

	// Check if avatar is an image URL or text
	$: isImageUrl = profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') || profileData.avatar.includes('.'));
	$: avatarInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
</script>

<div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 min-h-screen p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Artistic Header -->
		<div class="relative mb-16">
			<!-- Background Shapes -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-600/20 to-pink-500/20 rounded-full blur-3xl"></div>
				<div class="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/15 to-purple-600/15 rounded-full blur-3xl"></div>
			</div>
			
			<!-- Header Content -->
			<div class="relative z-10 text-center py-20">
				<div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
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
				
				<h1 class="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
					{#if customizable}
						<input 
							bind:value={profileData.name}
							class="bg-transparent border-none outline-none w-full text-center text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent focus:ring-2 focus:ring-purple-500/20"
							placeholder="Your Name"
							aria-label="Enter your name"
						/>
					{:else}
						{profileData.name}
					{/if}
				</h1>
				
				{#if profileData.contact}
					<div class="flex justify-center space-x-8 text-gray-600 dark:text-gray-300">
						{#if profileData.contact.email}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-purple-600 rounded-full" aria-hidden="true"></span>
								<span aria-label="Email address">{profileData.contact.email}</span>
							</div>
						{/if}
						{#if profileData.contact.phone}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-pink-500 rounded-full" aria-hidden="true"></span>
								<span aria-label="Phone number">{profileData.contact.phone}</span>
							</div>
						{/if}
						{#if profileData.contact.location}
							<div class="flex items-center space-x-2">
								<span class="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" aria-hidden="true"></span>
								<span aria-label="Location">{profileData.contact.location}</span>
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
						<div class="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full mr-4" aria-hidden="true"></div>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
							About Me
						</h2>
					</div>
					{#if customizable}
						<textarea 
							bind:value={profileData.about}
							class="w-full text-lg text-gray-900 dark:text-gray-100 leading-relaxed bg-transparent border border-gray-300 dark:border-gray-600 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 resize-none"
							rows="5"
							placeholder="Tell us about yourself..."
							aria-label="Professional summary"
						></textarea>
					{:else}
						<p class="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
							{profileData.about}
						</p>
					{/if}
				</div>

				<!-- Experience Section -->
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
					<div class="flex items-center mb-8">
						<div class="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full mr-4" aria-hidden="true"></div>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
							Experience
						</h2>
					</div>
					
					<div class="space-y-8">
						{#each profileData.workExperience as experience, index}
							<div class="relative">
								<!-- Timeline dot -->
								<div class="absolute -left-4 top-6 w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" aria-hidden="true"></div>
								
								<div class="bg-gradient-to-r from-purple-100/30 to-transparent dark:from-purple-600/10 dark:to-transparent rounded-2xl p-6 ml-4 border-l-4 border-purple-600/30">
									<div class="flex justify-between items-start mb-3">
										<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
											{#if customizable}
												<input 
													bind:value={experience.title}
													class="bg-transparent border-none outline-none w-full text-xl font-bold focus:ring-2 focus:ring-purple-500/20"
													placeholder="Job Title"
													aria-label="Job title"
												/>
											{:else}
												{experience.title}
											{/if}
										</h3>
										<span class="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
											{#if customizable}
												<input 
													bind:value={experience.period}
													class="bg-transparent border-none outline-none text-center w-24 text-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white/20"
													placeholder="Period"
													aria-label="Employment period"
												/>
											{:else}
												{experience.period}
											{/if}
										</span>
									</div>
									<p class="text-pink-600 dark:text-pink-400 font-semibold mb-2">
										{#if customizable}
											<input 
												bind:value={experience.company}
												class="bg-transparent border-none outline-none w-full font-semibold focus:ring-2 focus:ring-pink-500/20"
												placeholder="Company Name"
												aria-label="Company name"
											/>
										{:else}
											{experience.company}
										{/if}
									</p>
									{#if experience.description}
										<p class="text-gray-600 dark:text-gray-400">
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
							<div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full mr-3" aria-hidden="true"></div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
								Skills
							</h2>
						</div>
						<div class="flex flex-wrap gap-3">
							{#each profileData.skills as skill, index}
								<span class="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-500/20 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium border border-purple-600/30 hover:scale-105 transition-transform duration-200">
									{skill}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Education Section -->
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
					<div class="flex items-center mb-6">
						<div class="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full mr-3" aria-hidden="true"></div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							Education
						</h2>
					</div>
					<div class="space-y-4">
						{#each profileData.education as edu, index}
							<div class="bg-gradient-to-r from-purple-100/20 to-transparent dark:from-purple-600/5 dark:to-transparent rounded-xl p-4 border-l-4 border-pink-500">
								<h3 class="font-bold text-gray-900 dark:text-white mb-1">
									{#if customizable}
										<input 
											bind:value={edu.degree}
											class="bg-transparent border-none outline-none w-full font-bold focus:ring-2 focus:ring-purple-500/20"
											placeholder="Degree"
											aria-label="Degree or qualification"
										/>
									{:else}
										{edu.degree}
									{/if}
								</h3>
								<p class="text-gray-600 dark:text-gray-300 text-sm mb-1">
									{#if customizable}
										<input 
											bind:value={edu.institution}
											class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-purple-500/20"
											placeholder="Institution"
											aria-label="Educational institution"
										/>
									{:else}
										{edu.institution}
									{/if}
								</p>
								<p class="text-pink-600 text-sm font-medium">
									{#if customizable}
										<input 
											bind:value={edu.period}
											class="bg-transparent border-none outline-none w-full text-sm focus:ring-2 focus:ring-pink-500/20"
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