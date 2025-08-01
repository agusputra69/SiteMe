<script lang="ts">
  import TemplateSelector from '$lib/../components/TemplateSelector.svelte';
  import type { ProfileData } from '$lib/types';
  
  let sampleData: ProfileData = {
    name: 'I Gede Agus Ananda Putra',
    avatar: 'G',
    about: "I'm a software engineer specializing in building full-stack AI applications using TypeScript, React and Next.js. In AI also have a combined 4 million users and 2.5k stars. I currently lead developer relations at Together AI where I help developers build with AI.",
    workExperience: [
      {
        title: 'Senior Manager, Developer Relations',
        company: 'Together AI',
        type: 'Full-Time',
        period: 'May-24 - Present',
        current: true
      },
      {
        title: 'Senior Developer Advocate',
        company: 'Vercel',
        type: 'Full-Time',
        period: '2022 - 2023',
        current: false
      }
    ],
    education: [
      {
        institution: 'Drexel University',
        degree: 'Bachelor of Science - BS, Computer Engineering',
        period: '2018 - 2021'
      }
    ],
    skills: ['TypeScript', 'React', 'Next.js', 'AI/ML', 'Developer Relations'],
    contact: {
      email: 'agus@example.com',
      location: 'San Francisco, CA'
    }
  };
  
  let customData: ProfileData = {
    name: 'Your Name',
    avatar: 'Y',
    about: 'Your professional summary goes here...',
    workExperience: [
      {
        title: 'Your Job Title',
        company: 'Company Name',
        type: 'Full-Time',
        period: 'Start - End',
        current: false
      }
    ],
    education: [
      {
        institution: 'University Name',
        degree: 'Your Degree',
        period: 'Start - End'
      }
    ],
    skills: ['Skill 1', 'Skill 2', 'Skill 3'],
    contact: {
      email: 'your@email.com',
      location: 'Your Location'
    }
  };
</script>

<svelte:head>
  <title>CV Template - SiteMe</title>
  <meta name="description" content="Beautiful CV template based on SiteMe design" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        CV Template
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Beautiful, responsive CV template based on the SiteMe homepage design. Perfect for creating professional resumes.
      </p>
    </div>
    
    <!-- Template Showcase -->
    <div class="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
      <!-- Static Version -->
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Static Preview
        </h2>
        <TemplateSelector profileData={sampleData} customizable={false} />
      </div>
      
      <!-- Customizable Version -->
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Customizable Template
        </h2>
        <TemplateSelector bind:profileData={customData} customizable={true} />
        
        <!-- Instructions -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to use:
          </h3>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click on any text field to edit</li>
            <li>• Use "+ Add" buttons to add more experiences or education</li>
            <li>• Changes are reflected in real-time</li>
            <li>• Perfect for integration into your application</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Features -->
    <div class="mt-16 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Template Features
      </h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Dark Mode Support</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Automatically adapts to light and dark themes</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Responsive Design</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Looks great on all devices and screen sizes</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Customizable</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Easy to modify and extend for your needs</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Modern Design</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Clean, professional look that stands out</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Fast Loading</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Optimized for performance and speed</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Developer Friendly</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Built with Svelte, easy to integrate and modify</p>
        </div>
      </div>
    </div>
    
    <!-- Usage Instructions -->
    <div class="mt-16 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
        How to Use This Template
      </h2>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="prose dark:prose-invert max-w-none">
          <h3>1. Import the Component</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto"><code>import TemplateSelector from '$lib/components/TemplateSelector.svelte';</code></pre>
          
          <h3>2. Prepare Your Data</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto"><code>let profileData = &#123;
  name: 'Your Name',
  avatar: 'Y',
  about: 'Your professional summary...',
  workExperience: [...],
  education: [...]
&#125;;</code></pre>
          
          <h3>3. Use the Component</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto"><code>&lt;TemplateSelector &#123;profileData&#125; customizable=&#123;true&#125; /&gt;</code></pre>
          
          <h3>4. Customize as Needed</h3>
          <p>The template selector provides multiple template styles and color themes. You can modify the styling, add new sections, or integrate it with your existing design system.</p>
        </div>
      </div>
    </div>
  </div>
</div>