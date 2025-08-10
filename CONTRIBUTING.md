# Contributing to SiteMe

We love your input! We want to make contributing to SiteMe as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 📋 Table of Contents

- [Development Process](#development-process)
- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Community Guidelines](#community-guidelines)

## 🔄 Development Process

We use GitHub to host code, track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Supabase account (for testing)
- Together.ai account (for AI features)

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/siteme-cursor.git
   cd siteme-cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your development environment variables:
   ```env
   VITE_SUPABASE_URL=your_dev_supabase_url
   VITE_SUPABASE_ANON_KEY=your_dev_anon_key
   VITE_TOGETHER_API_KEY=your_together_api_key
   VITE_TOGETHER_MODEL=qwen:7b-chat
   ```

4. **Set up development database**
   ```bash
   # Run database scripts in order
   cat database/setup-database.sql | supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎨 Code Style

We use ESLint and Prettier to maintain code quality and consistency.

### TypeScript Guidelines

- Use TypeScript for all new files
- Define proper types for components and functions
- Use the existing type definitions in `src/lib/types/`
- Prefer interfaces over types when possible

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Avoid
type UserProfile = {
  id: string;
  name: string;
  email: string;
}
```

### Svelte Component Guidelines

- Use `<script lang="ts">` for TypeScript
- Follow the component structure: script, markup, style
- Use reactive statements for derived values
- Keep components focused and single-purpose

```svelte
<script lang="ts">
  import type { ComponentType } from '$lib/types';
  
  export let data: ComponentType;
  
  $: processedData = processData(data);
</script>

<div class="component-wrapper">
  <!-- Markup here -->
</div>

<style>
  .component-wrapper {
    /* Styles here */
  }
</style>
```

### CSS/Styling Guidelines

- Use TailwindCSS utilities first
- Create custom CSS only when necessary
- Follow mobile-first responsive design
- Use CSS custom properties for theming

```svelte
<!-- Good: TailwindCSS utilities -->
<div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">

<!-- Acceptable: Custom CSS when needed -->
<div class="custom-component">
  
<style>
  .custom-component {
    background: linear-gradient(45deg, theme(colors.blue.500), theme(colors.purple.500));
  }
</style>
```

### Naming Conventions

- **Files**: Use kebab-case for files (`user-profile.svelte`)
- **Components**: Use PascalCase (`UserProfile.svelte`)
- **Variables**: Use camelCase (`userProfile`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_ENDPOINT`)
- **Types**: Use PascalCase (`UserProfile`)

## 🏗️ Project Structure

Understanding our project structure helps you contribute effectively:

```
src/
├── components/          # Reusable components organized by type
│   ├── ui/             # Basic UI components
│   ├── forms/          # Form-related components
│   ├── modals/         # Modal dialogs
│   ├── ai/             # AI-related components
│   ├── dashboard/      # Dashboard components
│   └── templates/      # Site templates
├── lib/                # Shared utilities and services
│   ├── services/       # API calls and business logic
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript definitions
│   └── stores/         # Svelte stores
└── routes/             # SvelteKit pages and API routes
```

### Adding New Components

1. **Choose the right directory** based on component purpose
2. **Create the component file** with proper naming
3. **Add to index.ts** for easy importing
4. **Write tests** if applicable
5. **Update documentation** if it's a public API

### Adding New Services

1. **Create service file** in `src/lib/services/`
2. **Export functions** with proper types
3. **Add to lib index.ts** for easy importing
4. **Write unit tests** for business logic
5. **Document API** in JSDoc comments

## 🛠️ Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/user-profile-editor`
- `fix/pdf-processing-error`
- `docs/api-documentation`
- `refactor/component-structure`

### Commit Messages

Follow conventional commits:

```
feat: add user profile editor component
fix: resolve PDF processing timeout issue
docs: update API documentation
refactor: reorganize component structure
test: add unit tests for AI service
```

### Testing

- Write unit tests for utility functions
- Test components with user interactions
- Ensure AI features work with sample data
- Test responsive design on different screen sizes

```bash
# Run tests
npm run test

# Run type checking
npm run check

# Run linting
npm run lint

# Run formatting
npm run format
```

## 📤 Submitting Changes

### Pull Request Process

1. **Update documentation** for any API changes
2. **Add tests** for new features
3. **Update README.md** if needed
4. **Ensure all checks pass** (tests, linting, type checking)
5. **Request review** from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] Manual testing completed
- [ ] Screenshots attached (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

## 🐛 Bug Reports

Use GitHub issues to report bugs. Include:

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

We welcome feature ideas! Use GitHub issues with:

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### 🎨 Frontend
- New website templates
- UI/UX improvements
- Accessibility enhancements
- Mobile responsiveness
- Performance optimizations

### 🤖 AI Integration
- Support for new AI models
- Improved resume parsing
- Enhanced data extraction
- Error handling improvements

### 🗄️ Backend
- Database optimizations
- API improvements
- Security enhancements
- Caching strategies

### 📱 Templates
- New resume/portfolio templates
- Template customization options
- Template preview improvements
- Export functionality

### 📚 Documentation
- API documentation
- Tutorial content
- Video guides
- Code examples

### 🧪 Testing
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Focus on the issue, not the person
- Follow the golden rule

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code changes and discussions
- **Discussions**: General questions and ideas
- **Discord**: Real-time community chat

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributor graphs
- Special badges and mentions

## 📈 Development Workflow

### Issue Lifecycle

1. **Triage**: Issues are labeled and prioritized
2. **Assignment**: Issues assigned to contributors
3. **Development**: Work in progress
4. **Review**: Pull request review process
5. **Merge**: Code integrated into main branch
6. **Release**: Feature included in next release

### Release Process

We follow semantic versioning:

- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

## 🛡️ Security

### Reporting Security Vulnerabilities

Please do NOT report security vulnerabilities through public GitHub issues.

Instead, email us at: security@siteme.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)

## 📞 Getting Help

- **Documentation**: Check README and docs folder
- **GitHub Discussions**: Ask questions
- **Discord**: Real-time help
- **Email**: hello@siteme.com

## 🎉 Thank You

Thank you for contributing to SiteMe! Every contribution helps make the project better for everyone.

---

**Happy coding!** 🚀
