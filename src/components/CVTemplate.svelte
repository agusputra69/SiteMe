<script lang="ts">
  export let profileData = {
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
    ]
  };
  
  export let customizable = false;
  
  // Theme options
   let selectedTheme: 'blue' | 'green' | 'purple' | 'red' | 'indigo' = 'blue';
   const themes = {
     blue: { primary: 'blue-500', secondary: 'blue-600', accent: 'blue-100' },
     green: { primary: 'green-500', secondary: 'green-600', accent: 'green-100' },
     purple: { primary: 'purple-500', secondary: 'purple-600', accent: 'purple-100' },
     red: { primary: 'red-500', secondary: 'red-600', accent: 'red-100' },
     indigo: { primary: 'indigo-500', secondary: 'indigo-600', accent: 'indigo-100' }
   } as const;
  
  // Layout options
  let compactMode = false;
  let showBorders = true;
  
  // Add new work experience entry
   function addWorkExperience() {
     profileData.workExperience = [...profileData.workExperience, {
       title: 'New Position',
       company: 'Company Name',
       type: 'Full-Time',
       period: 'Start - End',
       current: false
     }];
   }
   
   // Add new education entry
   function addEducation() {
     profileData.education = [...profileData.education, {
       institution: 'Institution Name',
       degree: 'Degree',
       period: 'Start - End'
     }];
   }
   
   // Remove work experience entry
   function removeWorkExperience(index: number) {
     profileData.workExperience = profileData.workExperience.filter((_, i) => i !== index);
   }
   
   // Remove education entry
   function removeEducation(index: number) {
     profileData.education = profileData.education.filter((_, i) => i !== index);
   }
  
  $: currentTheme = themes[selectedTheme];
</script>

<!-- Customization Controls -->
{#if customizable}
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-4">
    <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Customization Options</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Theme Selection -->
      <div>
        <label for="theme-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label>
        <select id="theme-select" bind:value={selectedTheme} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="red">Red</option>
          <option value="indigo">Indigo</option>
        </select>
      </div>
      
      <!-- Layout Options -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Layout</legend>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="checkbox" bind:checked={compactMode} class="mr-2">
              <span class="text-sm text-gray-600 dark:text-gray-300">Compact Mode</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" bind:checked={showBorders} class="mr-2">
              <span class="text-sm text-gray-600 dark:text-gray-300">Show Borders</span>
            </label>
          </div>
        </fieldset>
      </div>
      
      <!-- Action Buttons -->
      <div>
        <div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Sections</div>
        <div class="space-y-2">
          <button on:click={addWorkExperience} class="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">+ Work Experience</button>
          <button on:click={addEducation} class="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">+ Education</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden max-w-2xl mx-auto {showBorders ? 'border border-gray-200 dark:border-gray-700' : ''}">
  <!-- Browser Header -->
  <div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center space-x-2">
    <div class="flex space-x-1">
      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
      <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
    </div>
    <div class="flex-1 mx-4">
      <div class="bg-white dark:bg-gray-700 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
        siteme.com/u/{profileData.name.toLowerCase().replace(/\s+/g, '-')}
      </div>
    </div>
    <div class="text-xs text-gray-500 dark:text-gray-400">Draft</div>
    <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
      Publish
    </button>
  </div>
  
  <!-- CV Content -->
  <div class="p-6">
    <!-- Profile Header -->
    <div class="flex items-start space-x-4 mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-{currentTheme.primary} to-{currentTheme.secondary} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        {profileData.avatar}
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {#if customizable}
            <input 
              bind:value={profileData.name}
              class="bg-transparent border-none outline-none w-full focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1"
              placeholder="Your Name"
            />
          {:else}
            {profileData.name}
          {/if}
        </h1>
      </div>
    </div>
    
    <div class="space-y-6">
      <!-- About Section -->
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
        {#if customizable}
          <textarea 
            bind:value={profileData.about}
            class="w-full text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-transparent border border-gray-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
            rows="3"
            placeholder="Tell us about yourself..."
          ></textarea>
        {:else}
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {profileData.about}
          </p>
        {/if}
      </div>
      
      <!-- Work Experience Section -->
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Work Experience</h3>
        <div class="space-y-3">
          {#each profileData.workExperience as experience, index}
            <div class="border-l-2 {experience.current ? `border-${currentTheme.primary}` : 'border-gray-300 dark:border-gray-600'} pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode ? 'py-2' : 'py-3'} relative group">
              {#if customizable}
                <button on:click={() => removeWorkExperience(index)} class="absolute -right-2 -top-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">×</button>
              {/if}
              
              <div class="flex justify-between items-start mb-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {#if customizable}
                    <input 
                      bind:value={experience.title}
                      class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 font-medium"
                      placeholder="Job Title"
                    />
                  {:else}
                    {experience.title}
                  {/if}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 {experience.current ? `text-${currentTheme.primary}` : ''}">
                  {#if customizable}
                    <input 
                      bind:value={experience.period}
                      class="bg-transparent border-none outline-none text-right focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-24 text-xs"
                      placeholder="Period"
                    />
                  {:else}
                    {experience.period}
                  {/if}
                  {#if experience.current}
                    <span class="ml-1 px-2 py-1 bg-{currentTheme.primary} text-white text-xs rounded-full">Current</span>
                  {/if}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {#if customizable}
                  <input 
                    bind:value={experience.company}
                    class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1"
                    placeholder="Company Name"
                  /> • 
                  <input 
                    bind:value={experience.type}
                    class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-20"
                    placeholder="Type"
                  />
                  {#if customizable}
                    <label class="block mt-2">
                      <input type="checkbox" bind:checked={experience.current} class="mr-2">
                      <span class="text-xs">Current Position</span>
                    </label>
                  {/if}
                {:else}
                  {experience.company} • {experience.type}
                {/if}
              </p>
            </div>
          {/each}
          
          {#if customizable}
            <button 
              on:click={() => {
                profileData.workExperience = [...profileData.workExperience, {
                  title: 'New Position',
                  company: 'Company Name',
                  type: 'Full-Time',
                  period: 'Start - End',
                  current: false
                }];
              }}
              class="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              + Add Work Experience
            </button>
          {/if}
        </div>
      </div>
      
      <!-- Education Section -->
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Education</h3>
        <div class="space-y-3">
          {#each profileData.education as edu, index}
            <div class="border-l-2 border-{currentTheme.secondary} pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg transition-colors duration-200 {compactMode ? 'py-2' : 'py-3'} relative group">
              {#if customizable}
                <button on:click={() => removeEducation(index)} class="absolute -right-2 -top-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">×</button>
              {/if}
              
              <div class="flex justify-between items-start mb-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {#if customizable}
                    <input 
                      bind:value={edu.degree}
                      class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 font-medium"
                      placeholder="Degree"
                    />
                  {:else}
                    {edu.degree}
                  {/if}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {#if customizable}
                    <input 
                      bind:value={edu.period}
                      class="bg-transparent border-none outline-none text-right focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-24 text-xs"
                      placeholder="Period"
                    />
                  {:else}
                    {edu.period}
                  {/if}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {#if customizable}
                  <input 
                    bind:value={edu.institution}
                    class="bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-full"
                    placeholder="Institution"
                  />
                {:else}
                  {edu.institution}
                {/if}
              </p>
            </div>
          {/each}
          
          {#if customizable}
            <button 
              on:click={() => {
                profileData.education = [...profileData.education, {
                  institution: 'University Name',
                  degree: 'Your Degree',
                  period: 'Start - End'
                }];
              }}
              class="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              + Add Education
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  input:focus, textarea:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
</style>