<script lang="ts">
	import { Upload } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Self.so</title>
	<meta name="description" content="100% free & open source. LinkedIn ➜ Website in one click ✨" />
</svelte:head>

<!-- Main Section -->
<section class="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
	<div class="container mx-auto px-4 py-16">
		<div class="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
			<!-- Left Side - Content -->
			<div class="text-left">
				<div class="mb-8">
					<span
						class="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full mb-6"
					>
						100% free & open source
					</span>

					<h1
						class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
					>
						LinkedIn ➜ Website<br />
						in one click ✨
					</h1>

					<p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
						Turn your resume/LinkedIn<br />
						into a professional website.
					</p>

					<a
						href="/signup"
						class="inline-flex items-center px-6 py-3 bg-black dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors duration-200"
					>
						<Upload class="w-5 h-5 mr-2" />
						Upload Resume
					</a>

					<p class="text-sm text-gray-500 dark:text-gray-400 mt-4">Takes 1 minute!</p>
				</div>
			</div>

			<!-- Right Side - Preview -->
			<div class="relative">
				<div
					class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden hover:scale-105 group"
				>
					<!-- Browser Header -->
					<div
						class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
					>
						<div class="flex items-center space-x-2">
							<div class="w-3 h-3 bg-red-400 rounded-full" />
							<div class="w-3 h-3 bg-yellow-400 rounded-full" />
							<div class="w-3 h-3 bg-green-400 rounded-full" />
							<div
								class="ml-4 bg-white dark:bg-gray-600 px-3 py-1 rounded text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-500"
							>
								🌐 siteme.com/u/i-gede-agus-ananda-putra
							</div>
							<div class="ml-auto flex items-center space-x-2">
								<span class="text-xs text-gray-500 dark:text-gray-400">🔒 DRAFT</span>
								<button class="px-3 py-1 bg-black dark:bg-blue-600 text-white text-xs rounded">
									Publish
								</button>
							</div>
						</div>
					</div>

					<!-- Website Preview -->
					<div class="p-6 bg-white dark:bg-gray-800">
						<div class="flex items-start justify-between mb-6">
							<div>
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									I Gede Agus Ananda Putra
								</h2>
								<p class="text-gray-600 dark:text-gray-300 mb-1">
									Software engineer specializing in building full-stack AI applications
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">📍 San Francisco, CA</p>
							</div>
							<div
								class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:rotate-3"
							>
								<img
									src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23e5e7eb'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-family='Arial' font-size='24' fill='%23374151'%3EG%3C/text%3E%3C/svg%3E"
									alt="Profile"
									class="w-full h-full rounded-full group-hover:scale-110 transition-transform duration-300"
								/>
							</div>
						</div>

						<div class="space-y-6">
							<div>
								<h3 class="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
								<p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
									I'm a software engineer specializing in building full-stack AI applications using
									TypeScript, React and Next.js. In AI also have a combined 4 million users and 2.5k
									stars. I currently lead developer relations at Together AI where I help developers
									build with AI.
								</p>
							</div>

							<div>
								<h3 class="font-semibold text-gray-900 dark:text-white mb-3">Work Experience</h3>
								<div class="space-y-3">
									<div
										class="border-l-2 border-blue-500 pl-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-r transition-colors duration-200"
									>
										<div class="flex justify-between items-start mb-1">
											<h4 class="font-medium text-gray-900 dark:text-white">
												Senior Manager, Developer Relations
											</h4>
											<span class="text-xs text-gray-500 dark:text-gray-400">May-24 - Present</span>
										</div>
										<p class="text-sm text-gray-600 dark:text-gray-300">Together AI • Full-Time</p>
									</div>

									<div
										class="border-l-2 border-gray-300 dark:border-gray-600 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r transition-colors duration-200"
									>
										<div class="flex justify-between items-start mb-1">
											<h4 class="font-medium text-gray-900 dark:text-white">
												Senior Developer Advocate
											</h4>
											<span class="text-xs text-gray-500 dark:text-gray-400">2022 - 2023</span>
										</div>
										<p class="text-sm text-gray-600 dark:text-gray-300">Vercel • Full-Time</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Education</h3>
								<div
									class="border-l-2 border-gray-300 dark:border-gray-600 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r transition-colors duration-200"
								>
									<h4 class="font-medium text-gray-900 dark:text-white">Drexel University</h4>
									<p class="text-sm text-gray-600 dark:text-gray-300">
										Bachelor of Science - BS, Computer Engineering
									</p>
									<span class="text-xs text-gray-500 dark:text-gray-400">2018 - 2021</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="py-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
	<div class="container mx-auto px-4 text-center">
		<p class="text-sm text-gray-600 dark:text-gray-300">
			Powered by <a
				href="https://together.ai"
				class="text-blue-600 dark:text-blue-400 hover:underline">Together.ai</a
			>
			&
			<a href="https://llama.meta.com" class="text-blue-600 dark:text-blue-400 hover:underline"
				>Llama 3.3</a
			>
		</p>
	</div>
</footer>
