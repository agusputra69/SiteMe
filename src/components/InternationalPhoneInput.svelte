<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Phone, Globe, ChevronDown } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let placeholder = '+1 (555) 123-4567';
	export let label = 'Phone Number';
	export let id = '';

	// Common country codes and their formats
	const countries = [
		{ code: '+1', name: 'US/Canada', format: '(###) ###-####', flag: '🇺🇸' },
		{ code: '+44', name: 'UK', format: '#### ######', flag: '🇬🇧' },
		{ code: '+61', name: 'Australia', format: '### ### ###', flag: '🇦🇺' },
		{ code: '+86', name: 'China', format: '### #### ####', flag: '🇨🇳' },
		{ code: '+91', name: 'India', format: '##### #####', flag: '🇮🇳' },
		{ code: '+81', name: 'Japan', format: '## #### ####', flag: '🇯🇵' },
		{ code: '+49', name: 'Germany', format: '### #### ####', flag: '🇩🇪' },
		{ code: '+33', name: 'France', format: '# ## ## ## ##', flag: '🇫🇷' },
		{ code: '+39', name: 'Italy', format: '### ### ####', flag: '🇮🇹' },
		{ code: '+34', name: 'Spain', format: '### ### ###', flag: '🇪🇸' },
		{ code: '+31', name: 'Netherlands', format: '## ### ####', flag: '🇳🇱' },
		{ code: '+46', name: 'Sweden', format: '## ### ####', flag: '🇸🇪' },
		{ code: '+47', name: 'Norway', format: '### ## ###', flag: '🇳🇴' },
		{ code: '+45', name: 'Denmark', format: '## ## ## ##', flag: '🇩🇰' },
		{ code: '+358', name: 'Finland', format: '## ### ####', flag: '🇫🇮' },
		{ code: '+7', name: 'Russia', format: '### ### ####', flag: '🇷🇺' },
		{ code: '+82', name: 'South Korea', format: '## #### ####', flag: '🇰🇷' },
		{ code: '+65', name: 'Singapore', format: '#### ####', flag: '🇸🇬' },
		{ code: '+60', name: 'Malaysia', format: '## ### ####', flag: '🇲🇾' },
		{ code: '+66', name: 'Thailand', format: '## ### ####', flag: '🇹🇭' },
		{ code: '+84', name: 'Vietnam', format: '## #### ####', flag: '🇻🇳' },
		{ code: '+62', name: 'Indonesia', format: '## ### ####', flag: '🇮🇩' },
		{ code: '+63', name: 'Philippines', format: '## ### ####', flag: '🇵🇭' },
		{ code: '+971', name: 'UAE', format: '## ### ####', flag: '🇦🇪' },
		{ code: '+966', name: 'Saudi Arabia', format: '## ### ####', flag: '🇸🇦' },
		{ code: '+90', name: 'Turkey', format: '### ### ####', flag: '🇹🇷' },
		{ code: '+20', name: 'Egypt', format: '## ### ####', flag: '🇪🇬' },
		{ code: '+27', name: 'South Africa', format: '## ### ####', flag: '🇿🇦' },
		{ code: '+55', name: 'Brazil', format: '## ##### ####', flag: '🇧🇷' },
		{ code: '+52', name: 'Mexico', format: '### ### ####', flag: '🇲🇽' },
		{ code: '+54', name: 'Argentina', format: '## #### ####', flag: '🇦🇷' },
		{ code: '+56', name: 'Chile', format: '## #### ####', flag: '🇨🇱' },
		{ code: '+57', name: 'Colombia', format: '### ### ####', flag: '🇨🇴' },
		{ code: '+58', name: 'Venezuela', format: '### ### ####', flag: '🇻🇪' },
		{ code: '+51', name: 'Peru', format: '### ### ###', flag: '🇵🇪' },
		{ code: '+593', name: 'Ecuador', format: '## ### ####', flag: '🇪🇨' },
		{ code: '+595', name: 'Paraguay', format: '## ### ####', flag: '🇵🇾' },
		{ code: '+598', name: 'Uruguay', format: '## ### ####', flag: '🇺🇾' },
		{ code: '+593', name: 'Ecuador', format: '## ### ####', flag: '🇪🇨' },
		{ code: '+595', name: 'Paraguay', format: '## ### ####', flag: '🇵🇾' },
		{ code: '+598', name: 'Uruguay', format: '## ### ####', flag: '🇺🇾' }
	];

	let selectedCountry = countries[0]; // Default to US
	let showCountryDropdown = false;
	let inputValue = '';
	let cursorPosition = 0;

	// Auto-detect country from input
	function detectCountry(phone: string): void {
		const digits = phone.replace(/\D/g, '');
		
		// Try to match country code
		for (const country of countries) {
			const countryCode = country.code.replace('+', '');
			if (digits.startsWith(countryCode)) {
				selectedCountry = country;
				break;
			}
		}
	}

	function formatPhoneNumber(input: string): string {
		const digits = input.replace(/\D/g, '');
		const countryCode = selectedCountry.code.replace('+', '');
		
		// Remove country code from digits for formatting
		let localDigits = digits;
		if (digits.startsWith(countryCode)) {
			localDigits = digits.substring(countryCode.length);
		}
		
		// Format based on selected country
		let formatted = selectedCountry.code + ' ';
		
		if (selectedCountry.code === '+1') {
			// US/Canada format
			if (localDigits.length <= 3) {
				formatted += `(${localDigits}`;
			} else if (localDigits.length <= 6) {
				formatted += `(${localDigits.slice(0, 3)}) ${localDigits.slice(3)}`;
			} else {
				formatted += `(${localDigits.slice(0, 3)}) ${localDigits.slice(3, 6)}-${localDigits.slice(6, 10)}`;
			}
		} else {
			// Generic international format
			formatted += localDigits;
		}
		
		return formatted;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const input = target.value;
		inputValue = input;
		
		// Auto-detect country if user types a different country code
		detectCountry(input);
		
		const formatted = formatPhoneNumber(input);
		value = formatted;
		dispatch('input', { value: formatted });
	}

	function selectCountry(country: any) {
		selectedCountry = country;
		showCountryDropdown = false;
		
		// Reformat current input with new country
		if (inputValue) {
			const formatted = formatPhoneNumber(inputValue);
			value = formatted;
			dispatch('input', { value: formatted });
		}
	}

	function validatePhone(phone: string): boolean {
		const digits = phone.replace(/\D/g, '');
		const countryCode = selectedCountry.code.replace('+', '');
		
		// Remove country code for validation
		let localDigits = digits;
		if (digits.startsWith(countryCode)) {
			localDigits = digits.substring(countryCode.length);
		}
		
		// Basic validation - at least 7 digits for local number
		return localDigits.length >= 7;
	}

	$: isValid = !value || validatePhone(value);
</script>

<div class="space-y-2">
	<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	
	<div class="relative">
		<!-- Country Selector -->
		<div class="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
			<button
				type="button"
				on:click={() => showCountryDropdown = !showCountryDropdown}
				class="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
			>
				<span class="text-sm">{selectedCountry.flag}</span>
				<span class="text-xs">{selectedCountry.code}</span>
				<ChevronDown class="w-3 h-3" />
			</button>
			
			{#if showCountryDropdown}
				<div class="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
					{#each countries as country}
						<button
							type="button"
							on:click={() => selectCountry(country)}
							class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
						>
							<span>{country.flag}</span>
							<span class="text-sm text-gray-900 dark:text-white">{country.name}</span>
							<span class="text-xs text-gray-500 dark:text-gray-400 ml-auto">{country.code}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Phone Input -->
		<input
			{id}
			type="tel"
			bind:value={inputValue}
			on:input={handleInput}
			class="w-full pl-20 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {isValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500 focus:ring-red-500'}"
			placeholder={placeholder}
		/>
	</div>
	
	{#if value && !isValid}
		<p class="text-red-600 text-sm">Please enter a valid phone number for {selectedCountry.name}</p>
	{/if}
	
	<div class="text-xs text-gray-500 dark:text-gray-400">
		Format: {selectedCountry.code} {selectedCountry.format}
	</div>
</div>

<svelte:window on:click={() => showCountryDropdown = false} /> 