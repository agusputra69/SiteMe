<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Phone } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let placeholder = '+1 (555) 123-4567';
	export let label = 'Phone Number';
	export let id = '';

	function formatPhoneNumber(input: string): string {
		// Remove all non-digits
		const digits = input.replace(/\D/g, '');
		
		// Format based on length
		if (digits.length === 0) return '';
		if (digits.length <= 3) return `(${digits}`;
		if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const input = target.value;
		const formatted = formatPhoneNumber(input);
		value = formatted;
		dispatch('input', { value: formatted });
	}

	function validatePhone(phone: string): boolean {
		const digits = phone.replace(/\D/g, '');
		return digits.length === 10;
	}

	$: isValid = !value || validatePhone(value);
</script>

<div class="space-y-2">
	<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	
	<div class="relative">
		<Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
		<input
			{id}
			type="tel"
			bind:value
			on:input={handleInput}
			class="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {isValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500 focus:ring-red-500'}"
			placeholder={placeholder}
			maxlength="14"
		/>
	</div>
	
	{#if value && !isValid}
		<p class="text-red-600 text-sm">Please enter a valid 10-digit phone number</p>
	{/if}
	
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Format: (555) 123-4567
	</div>
</div> 