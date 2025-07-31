# 📄 Documentation: AI-Powered Resume-to-Website Builder ("SiteMe")

## 🧱 Tech Stack

- **Frontend**: SvelteKit + TailwindCSS
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (for uploaded resumes)
- **Database**: Supabase Postgres
- **AI Integration**: Together.ai API (Qwen 2.5 / Mixtral)
- **Hosting**: Vercel

---

## 💡 About This App

"**SiteMe**" is an AI-powered web application that transforms a user's resume PDF into a polished personal website. The system extracts structured data from uploaded resumes using a large language model and generates an editable web profile. Users can customize and publish their pages under a shareable public URL.

**Core features:**

- Upload a resume PDF or import from LinkedIn
- Extract structured data (name, experience, education, skills)
- WYSIWYG profile editor
- Live preview and publish as a personal webpage
- Authenticated dashboard with revision capability

---

## 🌐 Suggested Name for the Web App

**SiteMe** – Publish your resume to site

Additional names that were considered:

- AutoSite – Instantly build your site from your resume
- ResumeWeb – Transform your resume into a web presence
- PersonaPage – AI-generated personal profiles
- Curriculink – Turn your CV into a link
- Reflexio – Reflect your professional self online
- PaperToPage – Resume-to-website transformation

---

## 🧭 Functional Flow Overview

1. User signs up/logs in using email or OAuth via Supabase Auth.
2. After login, the user uploads their resume (PDF) → the file is saved to Supabase Storage.
3. The PDF is parsed into plain text.
4. Text is sent to Together.ai API → structured JSON is returned (name, experience, skills, etc.).
5. The JSON is saved into Supabase DB → rendered as a profile page.
6. User can edit their profile → saved back to DB.
7. Profile page can be published publicly under `yourdomain.com/u/username`.

---

## 📦 Project Structure

```
project-root/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # Landing Page
│   │   ├── dashboard/+page.svelte# Dashboard editor
│   │   ├── login/+page.svelte    # Login page
│   │   ├── u/[username]/+page.svelte  # Public profile
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client init
│   │   ├── ai.ts                 # Together.ai integration
│   │   ├── pdf.ts                # PDF text extraction
│   ├── components/
│   └── styles/
├── static/
├── .env
└── svelte.config.js
```

---

## 🔐 Supabase Setup

1. Create a project on [https://app.supabase.com](https://app.supabase.com)
2. Enable **Auth** (email/password or Google OAuth)
3. Create a **storage bucket** named `resumes`
4. Create a **table** `profiles` in Supabase DB:

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  username text,
  full_name text,
  data jsonb,
  created_at timestamp default now()
);
```

5. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## 🧠 AI Integration with Together.ai

1. Sign up at [https://together.ai](https://together.ai)
2. Get your API key
3. Add to `.env`:

```
TOGETHER_API_KEY=sk-xxx
TOGETHER_MODEL=qwen:7b-chat  # or llama-3-8b-chat
```

4. Example resume extraction function:

```ts
// src/lib/ai.ts
export async function extractResumeData(text: string) {
  const prompt = `Extract structured data from the following resume:\n...`;
  const res = await fetch("https://api.together.xyz/inference", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      prompt: prompt + text,
      max_tokens: 1000,
      temperature: 0.2
    })
  });
  const json = await res.json();
  return JSON.parse(json.output);
}
```

---

## 📄 PDF to Text Extraction

Use `pdfjs-dist` via npm:

```bash
npm install pdfjs-dist
```

Example:

```ts
import * as pdfjsLib from 'pdfjs-dist';

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}
```

---

## 🔪 Deployment

1. Push to GitHub
2. Deploy to Vercel (connect the repo)
3. Add environment variables in Vercel dashboard:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
TOGETHER_API_KEY=
TOGETHER_MODEL=
```

4. Done 🎉

---

## 🧭 Roadmap (Optional)

-

---

## 🖼️ UI Reference – Competitor Example (self.so)

**Website**: [https://self.so](https://self.so)

**Key UI Features:**

- Minimalist dashboard with onboarding flow
- PDF upload card component
- Realtime preview of profile
- Simple card-style resume section (Experience, Education, etc.)
- Public profile with clean typography & social link buttons

Inspiration for UI can also be taken from:

- [https://read.cv](https://read.cv)
- [https://super.site](https://super.site)
- [https://framer.com](https://framer.com) (for animations & layout)

You can adapt clean layouts using Tailwind utility classes + component slots in Svelte for dynamic content rendering.

