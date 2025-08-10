<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';

	const dispatch = createEventDispatcher();
	export let value: string | null | undefined = '';
	export let id = '';
	export let placeholder = 'Select date';

	let showPicker = false;
	let currentDate = new Date();
	let selectedYear = value ? new Date(value).getFullYear() : currentDate.getFullYear();
	let selectedMonth = value ? new Date(value).getMonth() : currentDate.getMonth();

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
    const monthsShort = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	function formatDate(date: string): string {
		if (!date) return '';
		const d = new Date(date);
		return `${monthsShort[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
	}

	function setDate(date: Date) {
		const formattedDate = date.toISOString().split('T')[0];
		value = formattedDate;
		showPicker = false;
		dispatch('input', { value: formattedDate });
	}

	function generateCalendarDays(year: number, month: number): (Date | null)[] {
		const days: (Date | null)[] = [];
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

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

	function previousMonth() {
		if (selectedMonth === 0) {
			selectedMonth = 11;
			selectedYear--;
		} else {
			selectedMonth--;
		}
	}

	function nextMonth() {
		if (selectedMonth === 11) {
			selectedMonth = 0;
			selectedYear++;
		} else {
			selectedMonth++;
		}
	}

	function previousYear() {
		selectedYear--;
	}

	function nextYear() {
		selectedYear++;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.date-picker-container')) {
			showPicker = false;
		}
	}

	function clearDate() {
		value = '';
		showPicker = false;
		dispatch('input', { value: '' });
	}

	function setToday() {
		setDate(new Date());
	}

	$: calendarDays = generateCalendarDays(selectedYear, selectedMonth);

	$: if (showPicker) {
		document.addEventListener('click', handleClickOutside);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="relative date-picker-container">
	<button
		{id}
		on:click={() => (showPicker = !showPicker)}
		class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
	>
		<span class={value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}>
			{value ? formatDate(value) : placeholder}
		</span>
		<Calendar class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
	</button>

	{#if showPicker}
		<div
			class="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 transition-all duration-300 ease-in-out transform origin-top"
		>
			<!-- Header with navigation -->
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center space-x-1">
					<button
						type="button"
						on:click|stopPropagation={previousYear}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
						title="Previous year"
					>
						<ChevronsLeft class="w-5 h-5" />
					</button>
					<button
						type="button"
						on:click|stopPropagation={previousMonth}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
						title="Previous month"
					>
						<ChevronLeft class="w-5 h-5" />
					</button>
				</div>

				<div class="text-center">
					<span class="font-semibold text-gray-900 dark:text-white text-md">
						{months[selectedMonth]}
					</span>
					<span class="ml-2 text-md text-gray-500 dark:text-gray-400">{selectedYear}</span>
				</div>

				<div class="flex items-center space-x-1">
					<button
						type="button"
						on:click|stopPropagation={nextMonth}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
						title="Next month"
					>
						<ChevronRight class="w-5 h-5" />
					</button>
					<button
						type="button"
						on:click|stopPropagation={nextYear}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
						title="Next year"
					>
						<ChevronsRight class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Calendar grid -->
			<div class="grid grid-cols-7 gap-1 text-sm mb-3">
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Su</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Mo</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Tu</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">We</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Th</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Fr</div>
				<div class="text-center text-gray-400 dark:text-gray-500 p-2 font-medium text-xs">Sa</div>
			</div>

			<div class="grid grid-cols-7 gap-1">
				{#each calendarDays as day}
					{#if day}
						<button
							type="button"
							on:click={() => setDate(day)}
							class="w-10 h-10 text-center rounded-full transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed
                            {value && day.toDateString() === new Date(value).toDateString()
								? 'bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600'
								: 'text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'}
                            {day.toDateString() === new Date().toDateString() && !(value && day.toDateString() === new Date(value).toDateString())
								? 'ring-2 ring-blue-400'
								: ''}"
						>
							{day.getDate()}
						</button>
					{:else}
						<div class="w-10 h-10" />
					{/if}
				{/each}
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between pt-4 mt-2 border-t border-gray-200 dark:border-gray-700"
			>
				<button
					type="button"
					on:click={setToday}
					class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
				>
					Today
				</button>
				{#if value}
					<button
						type="button"
						on:click={clearDate}
						class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
					>
						Clear
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>