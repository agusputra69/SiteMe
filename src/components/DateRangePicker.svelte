<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { Calendar, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';

	const dispatch = createEventDispatcher();
	export let startDate: string | null | undefined = '';
	export let endDate: string | null | undefined = '';
	export let isCurrent = false;
	export let label = 'Duration';
	export let id = '';

	let showStartPicker = false;
	let showEndPicker = false;
	let currentDate = new Date();
	let selectedYear = new Date(startDate || currentDate).getFullYear();
	let selectedMonth = new Date(startDate || currentDate).getMonth();

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
		if (showStartPicker) {
			startDate = formattedDate;
			showStartPicker = false;
			// Automatically open end date picker if start date is selected and end date is empty
			if (!endDate) {
				setTimeout(() => {
					showEndPicker = true;
				}, 100);
			}
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

	function toggleCurrent() {
		if (isCurrent) {
			endDate = '';
			showEndPicker = false;
		}
		updateValue();
	}

	function generateCalendarDays(year: number, month: number): (Date | null)[] {
		const days: (Date | null)[] = [];
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		for (let i = 0; i < firstDay.getDay(); i++) {
			days.push(null);
		}
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
		if (!target.closest('.date-range-container')) {
			showStartPicker = false;
			showEndPicker = false;
		}
	}

	$: calendarDays = generateCalendarDays(selectedYear, selectedMonth);

	$: if (showStartPicker || showEndPicker) {
		const activeDate = showStartPicker ? startDate : endDate;
		selectedYear = new Date(activeDate || currentDate).getFullYear();
		selectedMonth = new Date(activeDate || currentDate).getMonth();
		document.addEventListener('click', handleClickOutside);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="space-y-3 date-range-container">
	<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>

	<div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
		<!-- Start Date -->
		<div class="relative">
			<button
				type="button"
				on:click={() => {
					showStartPicker = !showStartPicker;
					showEndPicker = false;
				}}
				class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
			>
				<span
					class={startDate ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}
				>
					{startDate ? formatDate(startDate) : 'Start Date'}
				</span>
				<Calendar class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
			</button>

			{#if showStartPicker}
				<div
					class="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4"
				>
					<!-- Common Calendar Component -->
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center space-x-1">
							<button type="button" on:click|stopPropagation={previousYear} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Previous year"><ChevronsLeft class="w-5 h-5" /></button>
							<button type="button" on:click|stopPropagation={previousMonth} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Previous month"><ChevronLeft class="w-5 h-5" /></button>
						</div>
						<div class="text-center">
							<span class="font-semibold text-gray-900 dark:text-white text-md">{months[selectedMonth]}</span>
							<span class="ml-2 text-md text-gray-500 dark:text-gray-400">{selectedYear}</span>
						</div>
						<div class="flex items-center space-x-1">
							<button type="button" on:click|stopPropagation={nextMonth} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Next month"><ChevronRight class="w-5 h-5" /></button>
							<button type="button" on:click|stopPropagation={nextYear} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Next year"><ChevronsRight class="w-5 h-5" /></button>
						</div>
					</div>
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
								<button type="button" on:click={() => setDate(day)} class="w-10 h-10 text-center rounded-full transition-all duration-200 ease-in-out {startDate && day.toDateString() === new Date(startDate).toDateString() ? 'bg-blue-500 text-white font-bold shadow-lg' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'} {day.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-400' : ''}">
									{day.getDate()}
								</button>
							{:else}<div class="w-10 h-10" />{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="text-center text-gray-400 dark:text-gray-500 font-medium md:col-start-2">to</div>

		<!-- End Date -->
		<div class="relative md:col-start-3">
			<button
				type="button"
				on:click={() => {
					if (!isCurrent) {
						showEndPicker = !showEndPicker;
						showStartPicker = false;
					}
				}}
				disabled={isCurrent}
				class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span
					class={endDate || isCurrent ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}
				>
					{isCurrent ? 'Present' : endDate ? formatDate(endDate) : 'End Date'}
				</span>
				<Calendar class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
			</button>

			{#if showEndPicker && !isCurrent}
				<div
					class="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4"
				>
					<!-- Common Calendar Component -->
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center space-x-1">
							<button type="button" on:click|stopPropagation={previousYear} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Previous year"><ChevronsLeft class="w-5 h-5" /></button>
							<button type="button" on:click|stopPropagation={previousMonth} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Previous month"><ChevronLeft class="w-5 h-5" /></button>
						</div>
						<div class="text-center">
							<span class="font-semibold text-gray-900 dark:text-white text-md">{months[selectedMonth]}</span>
							<span class="ml-2 text-md text-gray-500 dark:text-gray-400">{selectedYear}</span>
						</div>
						<div class="flex items-center space-x-1">
							<button type="button" on:click|stopPropagation={nextMonth} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Next month"><ChevronRight class="w-5 h-5" /></button>
							<button type="button" on:click|stopPropagation={nextYear} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Next year"><ChevronsRight class="w-5 h-5" /></button>
						</div>
					</div>
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
								<button type="button" on:click={() => setDate(day)} class="w-10 h-10 text-center rounded-full transition-all duration-200 ease-in-out {endDate && day.toDateString() === new Date(endDate).toDateString() ? 'bg-blue-500 text-white font-bold shadow-lg' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'} {day.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-400' : ''}">
									{day.getDate()}
								</button>
							{:else}<div class="w-10 h-10" />{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Current Position Toggle -->
		<label class="flex items-center space-x-2 cursor-pointer md:col-start-4">
			<input
				type="checkbox"
				bind:checked={isCurrent}
				on:change={toggleCurrent}
				class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
			/>
			<span class="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Present</span>
		</label>
	</div>

	{#if startDate}
		<div
			class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
		>
			<div>
				<span class="font-medium text-gray-700 dark:text-gray-300">Selected:</span>
				{formatDate(startDate)}
				-
				{isCurrent ? 'Present' : endDate ? formatDate(endDate) : '...'}
			</div>
			<button
				type="button"
				on:click={() => {
					startDate = '';
					endDate = '';
					isCurrent = false;
					updateValue();
				}}
				class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/if}
</div>
