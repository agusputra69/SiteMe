<script lang="ts">
	import { Book, FileText, Upload, Edit3, Globe, Settings } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Documentation - SiteMe</title>
	<meta name="description" content="Learn how to use SiteMe to create your professional profile" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="text-center mb-12">
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Documentation</h1>
				<p class="text-xl text-gray-600 dark:text-gray-300">
					Learn how to use SiteMe to create your professional online presence
				</p>
			</div>

			<!-- Quick Start -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
					<Book class="w-6 h-6 mr-3 text-blue-600" />
					Quick Start Guide
				</h2>

				<div class="space-y-6">
					<div class="flex items-start space-x-4">
						<div
							class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
						>
							1
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Create an Account
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Sign up for a free SiteMe account using your email or GitHub. This will give you
								access to your dashboard.
							</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div
							class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
						>
							2
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Upload Your Resume
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Upload your PDF resume. Our AI will automatically extract your information including
								experience, education, and skills.
							</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div
							class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
						>
							3
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Customize Your Profile
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Edit your profile information, add additional details, and customize the appearance
								to match your brand.
							</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div
							class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
						>
							4
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Share Your Profile
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Get your public profile URL and share it with potential employers, clients, or your
								professional network.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Features -->
			<div class="grid md:grid-cols-2 gap-8">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<div class="flex items-center mb-4">
						<Upload class="w-8 h-8 text-blue-600 mr-3" />
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Resume Upload</h3>
					</div>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						Upload your PDF resume and let our AI extract all the important information
						automatically.
					</p>
					<ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
						<li>• Supports all standard PDF formats</li>
						<li>• Maximum file size: 10MB</li>
						<li>• AI-powered text extraction</li>
						<li>• Structured data parsing</li>
					</ul>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<div class="flex items-center mb-4">
						<Edit3 class="w-8 h-8 text-blue-600 mr-3" />
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Profile Editing</h3>
					</div>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						Edit your profile with our intuitive interface. Add, remove, or modify any information.
					</p>
					<ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
						<li>• Real-time preview</li>
						<li>• Drag-and-drop editing</li>
						<li>• Rich text formatting</li>
						<li>• Auto-save functionality</li>
					</ul>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<div class="flex items-center mb-4">
						<Globe class="w-8 h-8 text-blue-600 mr-3" />
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Public Profiles</h3>
					</div>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						Share your professional profile with a custom URL that you can include in your
						applications.
					</p>
					<ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
						<li>• Custom username</li>
						<li>• Professional design</li>
						<li>• Mobile responsive</li>
						<li>• SEO optimized</li>
					</ul>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<div class="flex items-center mb-4">
						<Settings class="w-8 h-8 text-blue-600 mr-3" />
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Customization</h3>
					</div>
					<p class="text-gray-600 dark:text-gray-300 mb-4">
						Customize your profile appearance and settings to match your personal brand.
					</p>
					<ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
						<li>• Dark/Light themes</li>
						<li>• Color customization</li>
						<li>• Layout options</li>
						<li>• Privacy settings</li>
					</ul>
				</div>
			</div>

			<!-- FAQ -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
					Frequently Asked Questions
				</h2>

				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							What file formats are supported?
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Currently, we support PDF files. Make sure your resume is in PDF format for the best
							results.
						</p>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							How accurate is the AI extraction?
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Our AI is trained on thousands of resumes and achieves high accuracy. However, you can
							always edit the extracted information manually.
						</p>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							Can I use my own domain?
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Yes! Pro and Enterprise users can connect their own custom domain to their profile.
						</p>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							Is my data secure?
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Absolutely. We use industry-standard encryption and security practices to protect your
							data. Your resume files are processed securely and not stored permanently.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
