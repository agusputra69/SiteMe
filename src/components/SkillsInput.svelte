<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, X, Search } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let skills: string[] = [];
	export let placeholder = 'Add a skill...';
	export let label = 'Skills';

	let inputValue = '';
	let showSuggestions = false;
	let selectedIndex = -1;

	// Common skills suggestions
	const skillSuggestions = [
		'JavaScript',
		'TypeScript',
		'Python',
		'Java',
		'C++',
		'C#',
		'PHP',
		'Ruby',
		'Go',
		'Rust',
		'React',
		'Vue.js',
		'Angular',
		'Svelte',
		'Node.js',
		'Express',
		'Django',
		'Flask',
		'Laravel',
		'HTML',
		'CSS',
		'Sass',
		'Less',
		'Tailwind CSS',
		'Bootstrap',
		'Material-UI',
		'Git',
		'GitHub',
		'GitLab',
		'Docker',
		'Kubernetes',
		'AWS',
		'Azure',
		'Google Cloud',
		'MySQL',
		'PostgreSQL',
		'MongoDB',
		'Redis',
		'Elasticsearch',
		'GraphQL',
		'REST API',
		'Agile',
		'Scrum',
		'Kanban',
		'JIRA',
		'Confluence',
		'Figma',
		'Adobe Creative Suite',
		'Machine Learning',
		'Data Science',
		'Statistics',
		'R',
		'TensorFlow',
		'PyTorch',
		'Project Management',
		'Leadership',
		'Communication',
		'Problem Solving',
		'Team Collaboration'
	];

	$: filteredSuggestions = skillSuggestions
		.filter(
			(skill) => skill.toLowerCase().includes(inputValue.toLowerCase()) && !skills.includes(skill)
		)
		.slice(0, 5);

	function addSkill(skill: string) {
		const trimmedSkill = skill.trim();
		if (trimmedSkill && !skills.includes(trimmedSkill)) {
			skills = [...skills, trimmedSkill];
			dispatch('input', { skills });
		}
		inputValue = '';
		showSuggestions = false;
		selectedIndex = -1;
	}

	function removeSkill(index: number) {
		skills = skills.filter((_, i) => i !== index);
		dispatch('input', { skills });
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		inputValue = target.value;
		showSuggestions = inputValue.length > 0;
		selectedIndex = -1;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
				addSkill(filteredSuggestions[selectedIndex]);
			} else if (inputValue.trim()) {
				addSkill(inputValue);
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filteredSuggestions.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (event.key === 'Escape') {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function handleSuggestionClick(skill: string) {
		addSkill(skill);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.skills-input-container')) {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="space-y-3 skills-input-container">
	<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>

	<!-- Skills Tags -->
	{#if skills.length > 0}
		<div class="flex flex-wrap gap-2 mb-3">
			{#each skills as skill, index}
				<span
					class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
				>
					{skill}
					<button
						type="button"
						on:click={() => removeSkill(index)}
						class="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
						aria-label="Remove {skill}"
					>
						<X class="w-3 h-3" />
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<!-- Input Field -->
	<div class="relative">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
			<input
				type="text"
				bind:value={inputValue}
				on:input={handleInput}
				on:keydown={handleKeydown}
				class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				{placeholder}
			/>
		</div>

		<!-- Suggestions Dropdown -->
		{#if showSuggestions && filteredSuggestions.length > 0}
			<div
				class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
			>
				{#each filteredSuggestions as suggestion, index}
					<button
						type="button"
						on:click={() => handleSuggestionClick(suggestion)}
						class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors {index ===
						selectedIndex
							? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
							: 'text-gray-900 dark:text-white'}"
					>
						{suggestion}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Help Text -->
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Press Enter to add a skill • Use arrow keys to navigate suggestions • Click to remove skills
	</div>
</div>
