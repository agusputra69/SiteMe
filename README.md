# SiteMe - AI-Powered Resume-to-Website Builder

Transform your resume into a beautiful personal website with AI. Upload your PDF resume and our AI will extract your information to create a professional online presence.

## 🚀 Features

- **AI-Powered Resume Processing**: Upload PDF resumes and extract structured data using Together.ai
- **WYSIWYG Profile Editor**: Edit your profile with real-time preview
- **Public Profile Pages**: Share your professional profile with a custom URL
- **Dark/Light Mode**: Beautiful theme switching
- **Responsive Design**: Works perfectly on all devices
- **Authentication**: Secure login with Supabase Auth
- **PDF Text Extraction**: Advanced PDF processing with pdfjs-dist

## 🛠️ Tech Stack

- **Frontend**: SvelteKit + TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: Together.ai API (Qwen 2.5 / Mixtral)
- **PDF Processing**: pdfjs-dist
- **Icons**: Lucide Svelte
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siteme
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
   - Enable Auth (email/password and GitHub OAuth)
   - Create a storage bucket named `resumes`
   - Run the following SQL to create the profiles table:

   ```sql
   create table profiles (
     id uuid primary key references auth.users(id),
     username text,
     full_name text,
     data jsonb,
     created_at timestamp default now()
   );
   ```

5. **Set up Together.ai**
   - Sign up at [together.ai](https://together.ai)
   - Get your API key
   - Add it to your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Profiles Table
```sql
create table profiles (
  id uuid primary key references auth.users(id),
  username text,
  full_name text,
  data jsonb,
  created_at timestamp default now()
);
```

The `data` field contains the extracted resume information:
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

SiteMe uses Together.ai for resume data extraction. The AI processes PDF text and returns structured JSON data including:

- Personal information (name, email, phone, location)
- Professional summary
- Work experience with details
- Education history
- Skills list
- Professional links

## 📁 Project Structure

```
src/
├── routes/
│   ├── +page.svelte              # Landing page
│   ├── +layout.svelte            # Root layout
│   ├── login/+page.svelte        # Login page
│   ├── dashboard/+page.svelte    # Dashboard (protected)
│   └── u/[username]/+page.svelte # Public profile pages
├── lib/
│   ├── supabase.ts               # Supabase client & helpers
│   ├── ai.ts                     # Together.ai integration
│   └── pdf.ts                    # PDF text extraction
└── app.css                       # Global styles
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TOGETHER_API_KEY=your_together_ai_api_key
VITE_TOGETHER_MODEL=qwen:7b-chat
```

## 🎨 Customization

### Styling
The app uses TailwindCSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Dark mode in `src/app.css`
- Component styles in individual Svelte files

### AI Model
You can change the AI model in your environment variables:
- `qwen:7b-chat` (default)
- `llama-3-8b-chat`
- Other Together.ai models

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Linting
npm run lint

# Formatting
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [Supabase](https://supabase.com/) for backend services
- [Together.ai](https://together.ai/) for AI capabilities
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**SiteMe** - Let your resume build your online brand ✨ 