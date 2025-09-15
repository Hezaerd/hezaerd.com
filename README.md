# 🚀 Modern Portfolio Template

A sleek, responsive portfolio website template built with Next.js, perfect for developers, designers, and creatives. This template is beginner-friendly and requires no prior experience with web development!

## ✨ Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Fully Responsive**: Looks great on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching with manual toggle
- **Contact Form**: Built-in contact form with validation
- **SEO Optimized**: Built-in SEO best practices
- **Fast Loading**: Optimized for performance
- **Easy to Customize**: Simple configuration for personal use

## 🛠️ Built With

- **Next.js 15** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Motion** - Smooth animations and transitions
- **Bun** - Fast JavaScript runtime and package manager (recommended)

## 🎯 Perfect For

- Software developers
- Game developers
- Web designers
- Freelancers
- Students
- Anyone wanting a professional online presence

## 📋 Prerequisites

Before you start, make sure you have:

- A computer with internet access
- Basic text editing skills
- 30 minutes of your time

**Don't worry if you've never coded before!** This guide will walk you through everything step by step.

## 🚀 Quick Start Guide

### Step 1: Get the Code

1. **Download the template** (or clone if you know Git):

   ```bash
   git clone [your-repo-url]
   cd portfolio-template
   ```

2. **Install Bun** (recommended - faster and better!) or Node.js:

   **Option A: Install Bun (Recommended)**
   - Go to [bun.sh](https://bun.sh/)
   - Follow the installation instructions for your operating system
   - Bun is faster than npm and has better performance!

   **Option B: Install Node.js (Alternative)**
   - Go to [nodejs.org](https://nodejs.org/)
   - Download and install the LTS version
   - Restart your computer after installation

### Step 2: Install Dependencies

1. **Open your terminal/command prompt**:
   - **Windows**: Press `Windows + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
   - **Linux**: Press `Ctrl + Alt + T`

2. **Navigate to your project folder**:

   ```bash
   cd path/to/your/portfolio-template
   ```

3. **Install the required packages**:

   **With Bun (Recommended):**

   ```bash
   bun install
   ```

   **With npm (Alternative):**

   ```bash
   npm install
   ```

   _This will take a few minutes - grab a coffee! ☕_

### Step 3: Start the Development Server

**With Bun (Recommended):**

```bash
bun dev
```

**With npm (Alternative):**

```bash
npm run dev
```

Open your browser and go to `http://localhost:3000` - you should see your portfolio!

## 🎨 Customization Guide

### 1. Personal Information

**Update your name and details** in these files:

#### `src/components/sections/hero.tsx`

```typescript
// Change "Your Name" to your actual name
Your Name → John Doe
```

#### `src/components/sections/footer.tsx`

```typescript
// Update copyright and social links
© 2025 Your Name → © 2025 John Doe
https://github.com/yourusername → https://github.com/johndoe
https://linkedin.com/in/yourusername → https://linkedin.com/in/johndoe
```

#### `src/app/layout.tsx`

```typescript
// Update SEO metadata
title: "Your Name - Game Developer" → "John Doe - Game Developer"
description: "A modern portfolio showcasing..." → "John Doe's portfolio showcasing..."
```

### 2. Projects

**Edit your projects** in `src/data/projects.ts`:

```typescript
{
  title: "Your Project Name",
  description: "Brief description of your project",
  tags: ["React", "Next.js", "TypeScript"],
  // Add your project details here
}
```

### 3. Work Experience

**Update your work history** in `src/data/experience.ts`:

```typescript
{
  title: "Your Job Title",
  company: "Your Company Name",
  period: "2020 - Present",
  description: "What you did at this job...",
}
```

### 4. Skills

**Add your skills** in `src/data/skills.ts`:

```typescript
export const skills = [
  "JavaScript",
  "React",
  "Your Skill Here",
  // Add more skills
];
```

### 5. About Section

**Personalize your bio** in `src/components/sections/about.tsx`:

```typescript
// Replace the generic text with your personal story
"I'm a passionate game and engine programmer...";
```

## 🎨 Customizing Colors & Styling

### Easy Color Customization

For easy color customization, visit [**tweakcn.com**](https://tweakcn.com/) - this fantastic tool helps you:

- **Preview color changes** in real-time
- **Generate custom color palettes** for your portfolio
- **Copy-paste ready CSS** for Tailwind CSS
- **Experiment with different themes** without coding

### Manual Color Changes

Colors are defined in `src/app/globals.css`. Key variables include:

```css
:root {
  --primary: oklch(0.637 0.237 25.331); /* Main accent color */
  --secondary: oklch(0.967 0.001 286.375); /* Secondary accent */
}
```

### Typography & Fonts

The template uses [Geist](https://vercel.com/font) font family. To change fonts:

1. Update imports in `src/app/layout.tsx`
2. Modify font variables in the same file

## 📱 Responsive Design

The template is fully responsive and works on:

- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 📧 Contact Form Setup

The contact form is ready to use but currently shows a demo. To make it functional:

1. **For beginners**: Use services like [Formspree](https://formspree.io/) or [Netlify Forms](https://docs.netlify.com/forms/setup/)
2. **For developers**: Integrate with your preferred backend service

## 🚀 Deployment

### Deploy to Vercel (Recommended - Free!)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Connect your GitHub repository**
3. **Click "Deploy"** - that's it! 🎉

### Deploy to Netlify

1. **Create a Netlify account** at [netlify.com](https://netlify.com)
2. **Drag and drop your build folder** or connect your repository
3. **Your site is live!** 🌟

### Build for Production

**With Bun (Recommended):**

```bash
bun run build
```

**With npm (Alternative):**

```bash
npm run build
```

## 📝 Content Creation Tips

### Writing Your Project Descriptions

- Start with what the project does
- Mention the technologies used
- Highlight your role and contributions
- Include challenges you solved

### Professional Bio Tips

- Keep it concise (2-3 paragraphs)
- Focus on your passion and expertise
- Mention your key achievements
- End with what you're currently working on

### Choosing Project Images

- Use high-quality screenshots
- Show the project in action
- Include mobile and desktop views
- Optimize images for web (use tools like [TinyPNG](https://tinypng.com/))

## 🎯 SEO Optimization

The template includes SEO best practices:

- **Meta tags** for social media sharing
- **Structured data** for search engines
- **Fast loading times** for better rankings
- **Mobile-friendly** design
- **Semantic HTML** structure

## 🔧 Available Scripts

**With Bun (Recommended):**

```bash
bun dev              # Start development server
bun run build        # Build for production
bun start            # Start production server
bun run lint         # Check code quality
bun run lint:fix     # Fix linting issues
bun run format       # Format code with Prettier
```

**With npm (Alternative):**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

## 🤝 Getting Help

### Common Issues

**"bun: command not found" or "npm: command not found"**

- Install Bun from [bun.sh](https://bun.sh/) (recommended)
- Or install Node.js from [nodejs.org](https://nodejs.org/)

**"Port 3000 is already in use"**

- With Bun: `bun dev --port 3001`
- With npm: `npm run dev -- -p 3001`

**"Module not found" errors**

- Delete `node_modules` folder and run `bun install` (or `npm install`) again

**Why Bun is recommended:**

- ⚡ **Faster installation** - Up to 10x faster than npm
- 🚀 **Better performance** - Faster development server startup
- 📦 **Built-in bundler** - No need for additional tools
- 💻 **Modern JavaScript runtime** - Better compatibility with latest features

### Resources for Beginners

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [MDN Web Docs](https://developer.mozilla.org/) - Great for HTML/CSS/JS basics
- [Shadcn/ui](https://ui.shadcn.com/docs/components)

## 📄 License

This template is open source and available under the [MIT License](LICENSE).

## 🎉 You're Ready!

Congratulations! You now have a professional portfolio website. Remember:

- **Customize it** to reflect your personality
- **Keep it updated** with your latest projects
- **Share it** with potential employers or clients
- **Have fun** with it!

---

**Portfolio template crafted by [Hezaerd](https://hezaerd.com)**

_Need help? Open an issue!_

<br>

<p align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/footers/gray0_ctp_on_line.svg?sanitize=true" />
</p>

<p align="center">
        <i><code>&copy 2025-present <a href="https://hezaerd.com">Hezaerd</a></code></i>
</p>

<div align="center">
<a href="https://github.com/hezaerd/portfolio-template/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hezaerd/portfolio-template?logoColor=cdd6f4&labelColor=302D41&color=CBA6F7
" alt="LICENSE"></a>&nbsp;&nbsp;
</div>
