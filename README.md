# Medium_post

## 📊 Overview

A Jekyll-powered mathematical blog repository organized with hierarchical navigation for mathematical content, equations, and general posts. This repository features a comprehensive sidebar navigation system designed for GitHub Pages deployment.

## ✨ Features

- **🎨 Modern Design**: Clean, responsive layout with dark/light theme toggle
- **🔍 Advanced Search**: Client-side search with Lunr.js for fast content discovery
- **📐 Math Support**: MathJax integration for rendering mathematical equations
- **💻 Syntax Highlighting**: Rouge-powered code syntax highlighting
- **📱 Responsive**: Mobile-friendly design that works on all devices
- **🎯 SEO Optimized**: Built-in SEO tags and sitemap generation
- **⚡ Fast Loading**: Optimized for performance with minimal dependencies

## 🚀 Getting Started

### Prerequisites

- Ruby (for local development)
- Node.js (for search index generation)

### Local Development

1. Clone the repository
2. Install Jekyll and dependencies:
   ```bash
   gem install jekyll bundler
   bundle install
   ```
3. Generate search index:
   ```bash
   node generate_search_index.js
   ```
4. Serve locally:
   ```bash
   bundle exec jekyll serve
   ```

### GitHub Pages Deployment

1. Push your changes to the `main` branch
2. GitHub Pages will automatically build and deploy your site
3. The search index is pre-generated for optimal performance

## 📁 Structure

```
Medium_post/
├── _config.yml          # Site configuration
├── _layouts/           # Page layouts
│   ├── default.html    # Main layout with sidebar
│   └── page.html       # Simple page layout
├── assets/             # Static assets
│   ├── style.css       # Main stylesheet
│   └── search.js       # Search functionality
├── search_index.json   # Generated search index
├── generate_search_index.js  # Search index generator
└── *.md                # Content pages
```

## 🔧 Configuration

### Math Support

The site uses MathJax for rendering mathematical equations:

- Inline math: `$E = mc^2$`
- Display math: `$$E = mc^2$$`

### Search

Search is powered by Lunr.js and works across:
- Page titles
- Content text
- Categories and tags

Use `Ctrl+K` (or `Cmd+K` on Mac) to quickly focus the search bar.

### Themes

Toggle between light and dark themes using the theme button in the top navigation.

## 📝 Writing Content

Create new `.md` files in the root directory or organize them in folders. Use Jekyll front matter:

```yaml
---
layout: default
title: "Your Post Title"
permalink: /your-post-url/
---
```

## 🎨 Customization

### Colors and Styling

Edit `assets/style.css` to customize the appearance. The site uses CSS custom properties for easy theming.

### Layout

Modify `_layouts/default.html` to change the overall site structure.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*This repository structure enables efficient organization and navigation of mathematical content with a focus on equations, proofs, and educational materials.*
