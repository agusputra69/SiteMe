<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Trash2, Upload, Save, Eye, Edit3 } from 'lucide-svelte';
	import type { ResumeData } from '$lib/ai';

	const dispatch = createEventDispatcher();

	export let resumeData: ResumeData;
	export let showPreview = false;
	export let uploading = false;

	let profilePhotoFile: File | null = null;
	let profilePhotoUrl = '';

	function addExperience() {
		if (!resumeData.experience) resumeData.experience = [];
		resumeData.experience = [
			...resumeData.experience,
			{ title: '', company: '', duration: '', description: '' }
		];
	}

	function removeExperience(index: number) {
		resumeData.experience = resumeData.experience?.filter((_, i) => i !== index) || [];
	}

	function addEducation() {
		if (!resumeData.education) resumeData.education = [];
		resumeData.education = [
			...resumeData.education,
			{ degree: '', institution: '', year: '' }
		];
	}

	function removeEducation(index: number) {
		resumeData.education = resumeData.education?.filter((_, i) => i !== index) || [];
	}

	function addSkill() {
		if (!resumeData.skills) resumeData.skills = [];
		resumeData.skills = [...resumeData.skills, ''];
	}

	function removeSkill(index: number) {
		resumeData.skills = resumeData.skills?.filter((_, i) => i !== index) || [];
	}

	function addLink() {
		if (!resumeData.links) resumeData.links = [];
		resumeData.links = [
			...resumeData.links,
			{ type: '', url: '' }
		];
	}

	function removeLink(index: number) {
		resumeData.links = resumeData.links?.filter((_, i) => i !== index) || [];
	}

	function handleProfilePhotoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file && file.type.startsWith('image/')) {
			profilePhotoFile = file;
			// Create preview URL
			profilePhotoUrl = URL.createObjectURL(file);
			dispatch('photoUpload', { file });
		}
	}

	function saveProfile() {
		dispatch('save', { 
			resumeData, 
			profilePhoto: profilePhotoFile 
		});
	}

	function togglePreview() {
		showPreview = !showPreview;
		dispatch('togglePreview', { showPreview });
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
	<div class="flex items-center justify-between mb-6">
		<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
			Profile Editor
		</h3>
		<div class="flex items-center space-x-3">
			<button
				on:click={togglePreview}
				class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				{#if showPreview}
					<Edit3 class="w-4 h-4 mr-2" />
					Edit
				{:else}
					<Eye class="w-4 h-4 mr-2" />
					Preview
				{/if}
			</button>
			{#if !showPreview}
				<button
					on:click={saveProfile}
					disabled={uploading}
					class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
				>
					{#if uploading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						Saving...
					{:else}
						<Save class="w-4 h-4 mr-2" />
						Save Changes
					{/if}
				</button>
			{/if}
		</div>
	</div>

	{#if showPreview}
		<!-- Preview Mode -->
		<div class="space-y-6">
			<!-- Profile Header -->
			<div class="flex items-start space-x-4">
				{#if profilePhotoUrl || resumeData.photo_url}
					<img src={profilePhotoUrl || resumeData.photo_url} alt="Profile" class="w-20 h-20 rounded-full object-cover" />
				{:else}
					<div class="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-gray-600 dark:text-gray-300">
							{resumeData.name?.charAt(0) || 'U'}
						</span>
					</div>
				{/if}
				<div>
					<h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
						{resumeData.name || 'Your Name'}
					</h4>
					{#if resumeData.email}
						<p class="text-gray-600 dark:text-gray-300">{resumeData.email}</p>
					{/if}
					{#if resumeData.phone}
						<p class="text-gray-600 dark:text-gray-300">{resumeData.phone}</p>
					{/if}
					{#if resumeData.location}
						<p class="text-gray-600 dark:text-gray-300">{resumeData.location}</p>
					{/if}
				</div>
			</div>

			{#if resumeData.summary}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-2">Summary</h5>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed">{resumeData.summary}</p>
				</div>
			{/if}

			{#if resumeData.experience && resumeData.experience.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-3">Experience</h5>
					<div class="space-y-4">
						{#each resumeData.experience as exp}
							<div class="border-l-4 border-blue-600 pl-4">
								<h6 class="font-medium text-gray-900 dark:text-white">{exp.title}</h6>
								<p class="text-gray-600 dark:text-gray-300">{exp.company} • {exp.duration}</p>
								{#if exp.description}
									<p class="text-gray-600 dark:text-gray-300 text-sm mt-1">{exp.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.education && resumeData.education.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-3">Education</h5>
					<div class="space-y-2">
						{#each resumeData.education as edu}
							<div>
								<h6 class="font-medium text-gray-900 dark:text-white">{edu.degree}</h6>
								<p class="text-gray-600 dark:text-gray-300">{edu.institution} • {edu.year}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.skills && resumeData.skills.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-3">Skills</h5>
					<div class="flex flex-wrap gap-2">
						{#each resumeData.skills as skill}
							{#if skill.trim()}
								<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
									{skill}
								</span>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			{#if resumeData.links && resumeData.links.length > 0}
				<div>
					<h5 class="font-semibold text-gray-900 dark:text-white mb-3">Links</h5>
					<div class="space-y-2">
						{#each resumeData.links as link}
							{#if link.url.trim()}
								<a href={link.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
									{link.type || 'Link'}: {link.url}
								</a>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Edit Mode -->
		<div class="space-y-6">
			<!-- Profile Photo Upload -->
			<div>
				<label for="profilePhoto" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Profile Photo
				</label>
				<div class="flex items-center space-x-4">
					{#if profilePhotoUrl || resumeData.photo_url}
						<img src={profilePhotoUrl || resumeData.photo_url} alt="Profile" class="w-20 h-20 rounded-full object-cover" />
					{:else}
						<div class="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
							<span class="text-2xl font-bold text-gray-600 dark:text-gray-300">
								{resumeData.name?.charAt(0) || 'U'}
							</span>
						</div>
					{/if}
					<label class="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
						<Upload class="w-4 h-4 mr-2" />
						Upload Photo
						<input
							type="file"
							accept="image/*"
							on:change={handleProfilePhotoUpload}
							class="hidden"
						/>
					</label>
				</div>
			</div>

			<!-- Basic Information -->
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Full Name *
					</label>
					<input
						id="fullName"
						type="text"
						bind:value={resumeData.name}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Your full name"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={resumeData.email}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="your.email@example.com"
					/>
				</div>

				<div>
					<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Phone
					</label>
					<input
						id="phone"
						type="tel"
						bind:value={resumeData.phone}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="+1 (555) 123-4567"
					/>
				</div>

				<div>
					<label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Location
					</label>
					<input
						id="location"
						type="text"
						bind:value={resumeData.location}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="City, State/Country"
					/>
				</div>
			</div>

			<!-- Summary -->
			<div>
				<label for="summary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Professional Summary
				</label>
				<textarea
					id="summary"
					bind:value={resumeData.summary}
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Write a brief summary of your professional background and goals..."
				></textarea>
			</div>

			<!-- Experience Section -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Work Experience
					</label>
					<button
						on:click={addExperience}
						class="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						<Plus class="w-4 h-4 mr-1" />
						Add Experience
					</button>
				</div>
				{#if resumeData.experience && resumeData.experience.length > 0}
					<div class="space-y-4">
						{#each resumeData.experience as exp, index}
							<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
								<div class="flex items-center justify-between mb-3">
									<h6 class="font-medium text-gray-900 dark:text-white">Experience {index + 1}</h6>
									<button
										on:click={() => removeExperience(index)}
										class="text-red-600 hover:text-red-700 transition-colors"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
								<div class="grid md:grid-cols-2 gap-3 mb-3">
									<input
										type="text"
										bind:value={exp.title}
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Job Title"
									/>
									<input
										type="text"
										bind:value={exp.company}
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Company Name"
									/>
								</div>
								<input
									type="text"
									bind:value={exp.duration}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
									placeholder="Duration (e.g., Jan 2020 - Present)"
								/>
								<textarea
									bind:value={exp.description}
									rows="3"
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Describe your responsibilities and achievements..."
								></textarea>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Education Section -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Education
					</label>
					<button
						on:click={addEducation}
						class="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						<Plus class="w-4 h-4 mr-1" />
						Add Education
					</button>
				</div>
				{#if resumeData.education && resumeData.education.length > 0}
					<div class="space-y-4">
						{#each resumeData.education as edu, index}
							<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
								<div class="flex items-center justify-between mb-3">
									<h6 class="font-medium text-gray-900 dark:text-white">Education {index + 1}</h6>
									<button
										on:click={() => removeEducation(index)}
										class="text-red-600 hover:text-red-700 transition-colors"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
								<div class="grid md:grid-cols-2 gap-3">
									<input
										type="text"
										bind:value={edu.degree}
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Degree (e.g., Bachelor of Science)"
									/>
									<input
										type="text"
										bind:value={edu.institution}
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Institution Name"
									/>
								</div>
								<input
									type="text"
									bind:value={edu.year}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
									placeholder="Year (e.g., 2020 or 2018-2022)"
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Skills Section -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Skills
					</label>
					<button
						on:click={addSkill}
						class="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						<Plus class="w-4 h-4 mr-1" />
						Add Skill
					</button>
				</div>
				{#if resumeData.skills && resumeData.skills.length > 0}
					<div class="grid md:grid-cols-2 gap-3">
						{#each resumeData.skills as skill, index}
							<div class="flex items-center space-x-2">
								<input
									type="text"
									bind:value={resumeData.skills[index]}
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Skill name"
								/>
								<button
									on:click={() => removeSkill(index)}
									class="text-red-600 hover:text-red-700 transition-colors"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Links Section -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Professional Links
					</label>
					<button
						on:click={addLink}
						class="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						<Plus class="w-4 h-4 mr-1" />
						Add Link
					</button>
				</div>
				{#if resumeData.links && resumeData.links.length > 0}
					<div class="space-y-3">
						{#each resumeData.links as link, index}
							<div class="flex items-center space-x-2">
								<input
									type="text"
									bind:value={link.type}
									class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Type (e.g., LinkedIn)"
								/>
								<input
									type="url"
									bind:value={link.url}
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="https://..."
								/>
								<button
									on:click={() => removeLink(index)}
									class="text-red-600 hover:text-red-700 transition-colors"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>