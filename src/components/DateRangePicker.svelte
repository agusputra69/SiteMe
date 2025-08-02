<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Calendar, X } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let startDate = '';
	export let endDate = '';
	export let isCurrent = false;
	export let label = 'Duration';
	export let id = '';

	let showStartPicker = false;
	let showEndPicker = false;
	let currentDate = new Date();
	let selectedYear = currentDate.getFullYear();
	let selectedMonth = currentDate.getMonth();

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	function formatDate(date: string): string {
		if (!date) return '';
		const d = new Date(date);
		return `${months[d.getMonth()]} ${d.getFullYear()}`;
	}

	function setDate(date: Date) {
		const formattedDate = date.toISOString().split('T')[0];
		if (showStartPicker) {
			startDate = formattedDate;
			showStartPicker = false;
		} else if (showEndPicker) {
			endDate = formattedDate;
			showEndPicker = false;
		}
		updateValue();
	}

	function updateValue() {
		let duration = '';
		if (startDate) {
			duration += formatDate(startDate);
		}
		if (endDate && !isCurrent) {
			duration += ` - ${formatDate(endDate)}`;
		} else if (isCurrent) {
			duration += ' - Present';
		}
		dispatch('input', { startDate, endDate, isCurrent, duration });
	}

	function clearDates() {
		startDate = '';
		endDate = '';
		isCurrent = false;
		updateValue();
	}

	function toggleCurrent() {
		isCurrent = !isCurrent;
		if (isCurrent) {
			endDate = '';
		}
		updateValue();
	}

	function generateCalendarDays(year: number, month: number) {
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const days = [];
		
		// Add empty cells for days before the first day of the month
		for (let i = 0; i < firstDay.getDay(); i++) {
			days.push(null);
		}
		
		// Add days of the month
		for (let i = 1; i <= lastDay.getDate(); i++) {
			days.push(new Date(year, month, i));
		}
		
		return days;
	}

	$: calendarDays = generateCalendarDays(selectedYear, selectedMonth);
</script>

<div class="space-y-3">
	<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	
	<div class="flex items-center space-x-3">
		<!-- Start Date -->
		<div class="relative flex-1">
			<button
				type="button"
				on:click={() => showStartPicker = !showStartPicker}
				class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
			>
				<span class="{startDate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}">
					{startDate ? formatDate(startDate) : 'Start Date'}
				</span>
				<Calendar class="w-4 h-4 text-gray-400" />
			</button>
			
			{#if showStartPicker}
				<div class="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
					<div class="flex items-center justify-between mb-3">
						<button
							type="button"
							on:click={() => selectedMonth = selectedMonth === 0 ? 11 : selectedMonth - 1}
							class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
						>
							‹
						</button>
						<span class="font-medium text-gray-900 dark:text-white">
							{months[selectedMonth]} {selectedYear}
						</span>
						<button
							type="button"
							on:click={() => selectedMonth = selectedMonth === 11 ? 0 : selectedMonth + 1}
							class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
						>
							›
						</button>
					</div>
					
					<div class="grid grid-cols-7 gap-1 text-xs">
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">S</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">M</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">T</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">W</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">T</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">F</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">S</div>
						
						{#each calendarDays as day}
							{#if day}
								<button
									type="button"
									on:click={() => setDate(day)}
									class="p-1 text-center hover:bg-blue-100 dark:hover:bg-blue-900 rounded {day.toDateString() === new Date(startDate).toDateString() ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-white'}"
								>
									{day.getDate()}
								</button>
							{:else}
								<div class="p-1"></div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
		
		<!-- End Date -->
		<div class="relative flex-1">
			<button
				type="button"
				on:click={() => showEndPicker = !showEndPicker}
				disabled={isCurrent}
				class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span class="{endDate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}">
					{isCurrent ? 'Present' : (endDate ? formatDate(endDate) : 'End Date')}
				</span>
				<Calendar class="w-4 h-4 text-gray-400" />
			</button>
			
			{#if showEndPicker && !isCurrent}
				<div class="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
					<div class="flex items-center justify-between mb-3">
						<button
							type="button"
							on:click={() => selectedMonth = selectedMonth === 0 ? 11 : selectedMonth - 1}
							class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
						>
							‹
						</button>
						<span class="font-medium text-gray-900 dark:text-white">
							{months[selectedMonth]} {selectedYear}
						</span>
						<button
							type="button"
							on:click={() => selectedMonth = selectedMonth === 11 ? 0 : selectedMonth + 1}
							class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
						>
							›
						</button>
					</div>
					
					<div class="grid grid-cols-7 gap-1 text-xs">
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">S</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">M</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">T</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">W</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">T</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">F</div>
						<div class="text-center text-gray-500 dark:text-gray-400 p-1">S</div>
						
						{#each calendarDays as day}
							{#if day}
								<button
									type="button"
									on:click={() => setDate(day)}
									class="p-1 text-center hover:bg-blue-100 dark:hover:bg-blue-900 rounded {day.toDateString() === new Date(endDate).toDateString() ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-white'}"
								>
									{day.getDate()}
								</button>
							{:else}
								<div class="p-1"></div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Current Position Toggle -->
		<label class="flex items-center space-x-2">
			<input
				type="checkbox"
				bind:checked={isCurrent}
				class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
			/>
			<span class="text-sm text-gray-700 dark:text-gray-300">Current</span>
		</label>
		
		<!-- Clear Button -->
		<button
			type="button"
			on:click={clearDates}
			class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
			title="Clear dates"
		>
			<X class="w-4 h-4" />
		</button>
	</div>
	
	<!-- Display Duration -->
	{#if startDate || endDate || isCurrent}
		<div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
			Duration: {startDate ? formatDate(startDate) : 'Start Date'} - {isCurrent ? 'Present' : (endDate ? formatDate(endDate) : 'End Date')}
		</div>
	{/if}
</div> 