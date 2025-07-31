<script>
	import { onMount } from 'svelte';

	let features = [
		{
			title: 'AI-Powered Resume Analysis',
			description: 'Upload your resume and get intelligent insights powered by advanced AI technology.',
			icon: '🤖'
		},
		{
			title: 'Professional Templates',
			description: 'Choose from a variety of modern, professional website templates.',
			icon: '🎨'
		},
		{
			title: 'Easy Customization',
			description: 'Customize your personal website with our intuitive drag-and-drop interface.',
			icon: '⚡'
		},
		{
			title: 'Instant Deployment',
			description: 'Deploy your website instantly with our one-click deployment system.',
			icon: '🚀'
		},
		{
			title: 'SEO Optimized',
			description: 'All websites are built with SEO best practices to help you get discovered.',
			icon: '📈'
		},
		{
			title: 'Mobile Responsive',
			description: 'Your website will look perfect on all devices, from desktop to mobile.',
			icon: '📱'
		}
	];
</script>

<svelte:head>
	<title>Features - SiteMe</title>
	<meta name="description" content="Discover all the powerful features that make SiteMe the best platform for creating your personal website from your resume." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-4 py-16">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">
				Powerful Features
			</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Discover everything SiteMe has to offer to help you create the perfect personal website
			</p>
		</div>

		<!-- Features Grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
			{#each features as feature}
				<div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
					<div class="text-4xl mb-4">{feature.icon}</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
					<p class="text-gray-600 leading-relaxed">{feature.description}</p>
				</div>
			{/each}
		</div>

		<!-- CTA Section -->
		<div class="text-center bg-white rounded-2xl shadow-lg p-12">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">
				Ready to Get Started?
			</h2>
			<p class="text-lg text-gray-600 mb-8">
				Join thousands of professionals who have already created their perfect website with SiteMe.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/signup" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
					Start Free Trial
				</a>
				<a href="/dashboard" class="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
					View Dashboard
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	/* Additional custom styles if needed */
</style>