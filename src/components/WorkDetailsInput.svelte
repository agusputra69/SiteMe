<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { MapPin, Briefcase, Building } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let location = '';
	export let contractType = '';
	export let company = '';
	export let label = 'Work Details';

	const contractTypes = [
		'Full-time',
		'Part-time',
		'Contract',
		'Freelance',
		'Internship',
		'Remote',
		'Hybrid',
		'On-site'
	];

	const commonLocations = [
		'New York, NY',
		'San Francisco, CA',
		'Los Angeles, CA',
		'Chicago, IL',
		'Seattle, WA',
		'Austin, TX',
		'Boston, MA',
		'Denver, CO',
		'Atlanta, GA',
		'Remote',
		'Hybrid'
	];

	let showLocationSuggestions = false;
	let showContractSuggestions = false;
	let locationInput = '';
	let contractInput = '';

	$: filteredLocations = commonLocations.filter(loc => 
		loc.toLowerCase().includes(locationInput.toLowerCase())
	).slice(0, 5);

	$: filteredContractTypes = contractTypes.filter(type => 
		type.toLowerCase().includes(contractInput.toLowerCase())
	).slice(0, 5);

	function handleLocationInput(event: Event) {
		const target = event.target as HTMLInputElement;
		locationInput = target.value;
		location = target.value;
		showLocationSuggestions = locationInput.length > 0;
		dispatch('input', { location });
	}

	function handleContractInput(event: Event) {
		const target = event.target as HTMLInputElement;
		contractInput = target.value;
		contractType = target.value;
		showContractSuggestions = contractInput.length > 0;
		dispatch('input', { contractType });
	}

	function selectLocation(loc: string) {
		location = loc;
		locationInput = loc;
		showLocationSuggestions = false;
		dispatch('input', { location });
	}

	function selectContractType(type: string) {
		contractType = type;
		contractInput = type;
		showContractSuggestions = false;
		dispatch('input', { contractType });
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.work-details-container')) {
			showLocationSuggestions = false;
			showContractSuggestions = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="space-y-4 work-details-container">
	<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Work Location -->
		<div class="relative">
			<div class="relative">
				<MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={locationInput}
					on:input={handleLocationInput}
					class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Work location (e.g., Remote, New York, NY)"
				/>
			</div>
			
			{#if showLocationSuggestions && filteredLocations.length > 0}
				<div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{#each filteredLocations as suggestion}
						<button
							type="button"
							on:click={() => selectLocation(suggestion)}
							class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
						>
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Contract Type -->
		<div class="relative">
			<div class="relative">
				<Briefcase class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={contractInput}
					on:input={handleContractInput}
					class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Contract type (e.g., Full-time, Remote)"
				/>
			</div>
			
			{#if showContractSuggestions && filteredContractTypes.length > 0}
				<div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{#each filteredContractTypes as suggestion}
						<button
							type="button"
							on:click={() => selectContractType(suggestion)}
							class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
						>
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Help Text -->
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Common locations and contract types are suggested as you type
	</div>
</div> 