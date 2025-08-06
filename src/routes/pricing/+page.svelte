<script lang="ts">
	import { Check } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Pricing - SiteMe</title>
	<meta name="description" content="Choose the perfect plan for your SiteMe profile" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
	<div class="container mx-auto px-4">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
				Simple, Transparent Pricing
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
				Choose the plan that works best for you. All plans include our core features.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
			<!-- Free Plan -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
					<div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">$0</div>
					<p class="text-gray-600 dark:text-gray-300">Perfect for getting started</p>
				</div>

				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">1 resume upload</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Basic profile editing</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Public profile URL</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Dark/Light mode</span>
					</li>
				</ul>

				<a
					href="/signup"
					class="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
				>
					Get Started Free
				</a>
			</div>

			<!-- Pro Plan -->
			<div
				class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-blue-600 relative"
			>
				<div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium"
						>Most Popular</span
					>
				</div>

				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
					<div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">$9</div>
					<p class="text-gray-600 dark:text-gray-300">per month</p>
				</div>

				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Everything in Free</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Unlimited resume uploads</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Advanced profile customization</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Custom domain support</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Analytics & insights</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Priority support</span>
					</li>
				</ul>

				<a
					href="/signup"
					class="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
				>
					Start Pro Trial
				</a>
			</div>

			<!-- Enterprise Plan -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
					<div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Custom</div>
					<p class="text-gray-600 dark:text-gray-300">For teams and organizations</p>
				</div>

				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Everything in Pro</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Team management</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">White-label options</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">API access</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">Dedicated support</span>
					</li>
					<li class="flex items-center">
						<Check class="w-5 h-5 text-green-500 mr-3" />
						<span class="text-gray-700 dark:text-gray-300">SLA guarantee</span>
					</li>
				</ul>

				<a
					href="/contact"
					class="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
				>
					Contact Sales
				</a>
			</div>
		</div>
	</div>
</div>
