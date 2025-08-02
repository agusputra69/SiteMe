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
		primary: 'blue-600',
		secondary: 'blue-500',
		accent: 'blue-100',
		text: 'gray-900',
		textSecondary: 'gray-600'
	};

	export let customizable = false;
</script>

<div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
	<!-- Header Section -->
	<div class="bg-gradient-to-r from-{theme.primary} to-{theme.secondary} text-white p-4 sm:p-8">
		<div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
			<div class="w-16 sm:w-24 h-16 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-3xl font-bold backdrop-blur-sm">
				{profileData.avatar}
			</div>
			<div class="flex-1 text-center sm:text-left">
				<h1 class="text-2xl sm:text-4xl font-bold mb-2">
					{#if customizable}
						<input 
							bind:value={profileData.name}
							class="bg-transparent border-none outline-none w-full text-white placeholder-white/70"
							placeholder="Your Name"
						/>
					{:else}
						{profileData.name}
					{/if}
				</h1>
				{#if profileData.contact}
					<div class="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
						{#if profileData.contact.email}
							<span>📧 {profileData.contact.email}</span>
						{/if}
						{#if profileData.contact.phone}
							<span>📱 {profileData.contact.phone}</span>
						{/if}
						{#if profileData.contact.location}
							<span>📍 {profileData.contact.location}</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content Section -->
	<div class="p-4 sm:p-8">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
			<!-- Left Column -->
			<div class="md:col-span-2 space-y-4 sm:space-y-8">
				<!-- About Section -->
				<section>
					<h2 class="text-xl sm:text-2xl font-bold text-{theme.text} dark:text-white mb-3 sm:mb-4 border-b-2 border-{theme.primary} pb-2">
						About
					</h2>
					{#if customizable}
						<textarea 
							bind:value={profileData.about}
							class="w-full text-{theme.textSecondary} dark:text-gray-300 leading-relaxed bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-{theme.primary} resize-none"
							rows="4"
							placeholder="Tell us about yourself..."
						></textarea>
					{:else}
						<p class="text-{theme.textSecondary} dark:text-gray-300 leading-relaxed">
							{profileData.about}
						</p>
					{/if}
				</section>

				<!-- Work Experience Section -->
				<section>
					<h2 class="text-2xl font-bold text-{theme.text} dark:text-white mb-4 border-b-2 border-{theme.primary} pb-2">
						Work Experience
					</h2>
					<div class="space-y-6">
						{#each profileData.workExperience as experience, index}
							<div class="relative pl-8 border-l-4 border-{theme.accent} dark:border-{theme.secondary}">
								<div class="absolute -left-2 top-0 w-4 h-4 bg-{theme.primary} rounded-full"></div>
								<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
									<div class="flex justify-between items-start mb-2">
										<h3 class="text-lg font-semibold text-{theme.text} dark:text-white">
											{#if customizable}
												<input 
													bind:value={experience.title}
													class="bg-transparent border-none outline-none w-full font-semibold"
													placeholder="Job Title"
												/>
											{:else}
												{experience.title}
											{/if}
										</h3>
										<span class="text-sm text-{theme.primary} font-medium">
											{#if customizable}
												<input 
													bind:value={experience.period}
													class="bg-transparent border-none outline-none text-right w-32 text-sm"
													placeholder="Period"
												/>
											{:else}
												{experience.period}
											{/if}
										</span>
									</div>
									<p class="text-{theme.textSecondary} dark:text-gray-300 font-medium mb-2">
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
										<p class="text-sm text-{theme.textSecondary} dark:text-gray-400">
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
			<div class="space-y-8">
				<!-- Skills Section -->
				{#if profileData.skills && profileData.skills.length > 0}
					<section>
						<h2 class="text-xl font-bold text-{theme.text} dark:text-white mb-4">
							Skills
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each profileData.skills as skill}
								<span class="px-3 py-1 bg-{theme.accent} dark:bg-{theme.secondary}/20 text-{theme.primary} dark:text-{theme.secondary} rounded-full text-sm font-medium">
									{skill}
								</span>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Education Section -->
				<section>
					<h2 class="text-xl font-bold text-{theme.text} dark:text-white mb-4">
						Education
					</h2>
					<div class="space-y-4">
						{#each profileData.education as edu, index}
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<h3 class="font-semibold text-{theme.text} dark:text-white mb-1">
									{#if customizable}
										<input 
											bind:value={edu.degree}
											class="bg-transparent border-none outline-none w-full font-semibold"
											placeholder="Degree"
										/>
									{:else}
										{edu.degree}
									{/if}
								</h3>
								<p class="text-{theme.textSecondary} dark:text-gray-300 text-sm">
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
								<p class="text-{theme.primary} text-sm font-medium">
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
				</section>
			</div>
		</div>
	</div>
</div>

<style>
	input:focus, textarea:focus {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
</style>