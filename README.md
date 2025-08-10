# SiteMe - AI-Powered Resume-to-Website Builder

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/gustra/siteme-cursor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Transform your resume into a beautiful personal website with AI. Upload your PDF resume and our AI will extract your information to create a professional online presence.

## 🚀 Features

- **🤖 AI-Powered Resume Processing**: Upload PDF resumes and extract structured data using Together.ai
- **✨ WYSIWYG Profile Editor**: Edit your profile with real-time preview
- **🌐 Public Profile Pages**: Share your professional profile with a custom URL
- **🌓 Dark/Light Mode**: Beautiful theme switching
- **📱 Responsive Design**: Works perfectly on all devices
- **🔐 Secure Authentication**: Secure login with Supabase Auth
- **📄 Advanced PDF Processing**: Extract text from PDFs with multiple processing engines
- **🎨 Multiple Templates**: Choose from various professional templates
- **🛠️ Customizable**: Full customization of colors, layouts, and content

## 🛠️ Tech Stack

- **Frontend**: SvelteKit + TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **AI Integration**: Together.ai API (Qwen 2.5 / Mixtral)
- **PDF Processing**: pdfjs-dist, pdf-parse, tesseract.js
- **Icons**: Lucide Svelte
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
siteme-cursor/
├── src/
│   ├── components/          # Reusable Svelte components
│   │   ├── ai/             # AI-related components
│   │   │   ├── AIDescriptionEnhancer.svelte
│   │   │   ├── AISummaryEnhancer.svelte
│   │   │   └── ProcessingModelSelector.svelte
│   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── InteractiveTutorial.svelte
│   │   │   ├── OnboardingTour.svelte
│   │   │   ├── ProfileEditor.svelte
│   │   │   └── SiteEditor.svelte
│   │   ├── forms/          # Form components
│   │   │   ├── DataEditor.svelte
│   │   │   ├── DatePicker.svelte
│   │   │   ├── DateRangePicker.svelte
│   │   │   ├── InternationalPhoneInput.svelte
│   │   │   ├── PhoneInput.svelte
│   │   │   ├── RichTextEditor.svelte
│   │   │   ├── SkillsInput.svelte
│   │   │   └── WorkDetailsInput.svelte
│   │   ├── modals/         # Modal components
│   │   │   ├── AddSiteModal.svelte
│   │   │   ├── ConfirmDialog.svelte
│   │   │   ├── PDFErrorHandler.svelte
│   │   │   ├── PDFProcessingModal.svelte
│   │   │   ├── PDFSuccessModal.svelte
│   │   │   └── RateLimitModal.svelte
│   │   ├── templates/      # Site templates
│   │   │   ├── CreativeTemplate.svelte
│   │   │   ├── CreativePortfolioTemplate.svelte
│   │   │   ├── MinimalistTemplate.svelte
│   │   │   ├── ModernTemplate.svelte
│   │   │   ├── PersonalTemplate.svelte
│   │   │   ├── PortfolioTemplate.svelte
│   │   │   ├── CVTemplate.svelte
│   │   │   ├── TemplateCustomizer.svelte
│   │   │   └── TemplateSelector.svelte
│   │   ├── ui/             # Basic UI components
│   │   │   └── Logo.svelte
│   │   └── index.ts        # Component exports
│   ├── lib/                # Utility functions and services
│   │   ├── components/     # Shared library components
│   │   │   ├── Toast.svelte
│   │   │   └── ToastContainer.svelte
│   │   ├── config/         # Configuration files
│   │   │   ├── customizerConfig.ts
│   │   │   └── templateConfig.ts
│   │   ├── services/       # Business logic and API calls
│   │   │   ├── ai.ts
│   │   │   ├── pdf.ts
│   │   │   ├── pdf-processor.ts
│   │   │   ├── pdf-simple.ts
│   │   │   ├── profile.ts
│   │   │   └── supabase.ts
│   │   ├── stores/         # Svelte stores
│   │   │   ├── datePicker.ts
│   │   │   └── toast.ts
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── types.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── customizerUtils.ts
│   │   │   └── error-handler.ts
│   │   └── index.ts        # Library exports
│   ├── routes/             # SvelteKit routes
│   │   ├── +layout.svelte  # Root layout
│   │   ├── +page.svelte    # Landing page
│   │   ├── about/          # About page
│   │   ├── api/            # API endpoints
│   │   │   └── together/   # Together.ai API integration
│   │   ├── dashboard/      # Protected dashboard area
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   ├── create/     # Create new site
│   │   │   ├── editor/     # Site editor
│   │   │   ├── profile/    # Profile management
│   │   │   └── settings/   # User settings
│   │   ├── docs/           # Documentation pages
│   │   ├── features/       # Features showcase
│   │   ├── login/          # Authentication
│   │   ├── pricing/        # Pricing page
│   │   ├── signup/         # Registration
│   │   ├── template/       # Template preview
│   │   ├── templates/      # Template gallery
│   │   └── u/              # Public user profiles
│   │       └── [username]/
│   ├── styles/             # Global styles
│   ├── app.css             # Main stylesheet
│   └── app.html            # HTML template
├── static/                 # Static assets
│   ├── favicon.ico
│   ├── favicon.png
│   ├── logo.svg
│   ├── logo-alt.svg
│   └── logo.html
├── docs/                   # Documentation
│   ├── README.md
│   ├── AI_PROCESSING_FIXES.md
│   ├── COST_SAVING.md
│   ├── DATABASE_SETUP_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── FIXES_SUMMARY.md
│   ├── SITE_NAME_COLUMN_FIX.md
│   └── SiteMe.md
├── database/               # Database scripts
│   ├── setup-database.sql
│   ├── complete-database-setup.sql
│   ├── database-migration-sites.sql
│   ├── database-reset.sql
│   ├── fix-missing-status-column.sql
│   ├── fix-site-name-column.sql
│   ├── complete-sites-table-fix.sql
│   ├── add-public-profile-policy.sql
│   └── setup-profile-photos-bucket.sql
├── scripts/                # Build and deployment scripts
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── svelte.config.js        # SvelteKit configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
├── vercel.json             # Vercel deployment config
└── env.example             # Environment variables template
```

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Together.ai account

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/siteme-cursor.git
   cd siteme-cursor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Fill in your environment variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TOGETHER_API_KEY=your_together_ai_api_key
   VITE_TOGETHER_MODEL=qwen:7b-chat
   ```

4. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the database setup scripts from the `database/` directory:

   ```sql
   -- Run these in order:
   1. setup-database.sql
   2. complete-database-setup.sql
   3. setup-profile-photos-bucket.sql
   ```

   - Enable Auth (email/password and GitHub OAuth)
   - Create a storage bucket named `resumes`

5. **Set up Together.ai**

   - Sign up at [together.ai](https://together.ai)
   - Get your API key
   - Add it to your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables

#### Profiles Table
```sql
create table profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  full_name text,
  data jsonb,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

#### Sites Table
```sql
create table sites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  template text not null,
  data jsonb,
  status text default 'draft',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Profile Data Structure

The `data` field in the profiles table contains extracted resume information:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "duration": "2020-2023",
      "description": "Led development of..."
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "University of Technology",
      "year": "2020"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"],
  "links": [
    {
      "type": "LinkedIn",
      "url": "https://linkedin.com/in/johndoe"
    }
  ]
}
```

## 🤖 AI Integration

SiteMe uses Together.ai for intelligent resume data extraction. The AI processes PDF text and returns structured JSON data including:

- **Personal Information**: Name, email, phone, location
- **Professional Summary**: AI-enhanced description
- **Work Experience**: Detailed job history with descriptions
- **Education**: Academic background
- **Skills**: Technical and soft skills
- **Professional Links**: LinkedIn, GitHub, portfolio URLs

### Supported AI Models

- **Qwen 2.5 7B** (default) - Fast and accurate
- **Mixtral 8x7B** - More detailed analysis
- **Llama 3 8B** - Alternative option

## 🎨 Templates

Choose from multiple professional templates:

- **Modern**: Clean, contemporary design
- **Minimalist**: Simple, focused layout
- **Creative**: Vibrant, artistic style
- **Portfolio**: Project-focused design
- **Personal**: Friendly, approachable feel
- **CV**: Traditional resume format

Each template is fully customizable with:
- Color schemes
- Typography options
- Layout variations
- Custom sections

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TOGETHER_API_KEY=your_together_ai_api_key
VITE_TOGETHER_MODEL=qwen:7b-chat
```

### Other Deployment Options

- **Netlify**: Use `@sveltejs/adapter-netlify`
- **Node.js**: Use `@sveltejs/adapter-node`
- **Static**: Use `@sveltejs/adapter-static`

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:network      # Start with network access

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run check           # Type checking
npm run check:watch     # Type checking in watch mode
npm run lint            # ESLint
npm run format          # Prettier formatting
```

### Component Organization

Components are organized by functionality:

- **`/ui`**: Basic reusable UI components
- **`/forms`**: Form-related components
- **`/modals`**: Modal dialogs and overlays
- **`/ai`**: AI-related functionality
- **`/dashboard`**: Dashboard-specific components
- **`/templates`**: Site template components

### Library Organization

The `lib` directory is structured for maintainability:

- **`/services`**: API calls and business logic
- **`/config`**: Configuration files
- **`/utils`**: Utility functions
- **`/types`**: TypeScript type definitions
- **`/stores`**: Svelte stores for state management

### Import Patterns

Use the index files for clean imports:

```typescript
// Components
import { Logo, DataEditor, AddSiteModal } from '$lib/components';

// Services
import { supabase, extractResumeData } from '$lib';

// Types
import type { ProfileData, SiteData } from '$lib';
```

## 🎨 Customization

### Styling

The app uses TailwindCSS for styling. Customize:

- **Colors**: Update `tailwind.config.js`
- **Dark mode**: Modify CSS variables in `src/app.css`
- **Component styles**: Edit individual Svelte files

### AI Models

Change the AI model in your environment variables:

```env
# Options:
VITE_TOGETHER_MODEL=qwen:7b-chat      # Fast, good quality
VITE_TOGETHER_MODEL=mixtral:8x7b      # Higher quality
VITE_TOGETHER_MODEL=llama-3-8b-chat   # Alternative
```

### Templates

Create custom templates by:

1. Adding a new Svelte component in `src/components/templates/`
2. Registering it in `src/lib/config/templateConfig.ts`
3. Adding customization options in `src/lib/config/customizerConfig.ts`

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- **[Database Setup Guide](docs/DATABASE_SETUP_GUIDE.md)**: Complete database configuration
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[AI Processing Fixes](docs/AI_PROCESSING_FIXES.md)**: AI integration troubleshooting
- **[Cost Saving Guide](docs/COST_SAVING.md)**: Optimize API costs
- **[Fixes Summary](docs/FIXES_SUMMARY.md)**: Recent bug fixes and improvements

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Write TypeScript when possible
- Document new features

## 🔐 Security

- All user data is encrypted in transit and at rest
- PDF files are processed client-side when possible
- API keys are properly secured
- Regular security audits and updates

## 📈 Performance

- Lazy loading of components
- Image optimization
- Bundle splitting
- CDN delivery for static assets
- Efficient PDF processing

## 🐛 Troubleshooting

### Common Issues

1. **PDF Processing Fails**
   - Check file size (max 10MB)
   - Ensure PDF is not password-protected
   - Try different processing engines

2. **AI Extraction Issues**
   - Verify Together.ai API key
   - Check rate limits
   - Try different models

3. **Database Connection**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure tables are created

### Getting Help

- Check existing issues on GitHub
- Read the documentation in `docs/`
- Contact support team

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Amazing framework
- [Supabase](https://supabase.com/) - Backend services
- [Together.ai](https://together.ai/) - AI capabilities
- [TailwindCSS](https://tailwindcss.com/) - Styling system
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Support

- 📧 Email: support@siteme.com
- 💬 Discord: [Join our community](https://discord.gg/siteme)
- 📖 Documentation: [docs.siteme.com](https://docs.siteme.com)
- 🐛 Issues: [GitHub Issues](https://github.com/gustra/siteme-cursor/issues)

---

**SiteMe** - Transform your resume into your digital presence ✨

[🌐 Live Demo](https://siteme.vercel.app) | [📖 Documentation](https://docs.siteme.com) | [🤝 Contributing](CONTRIBUTING.md)
