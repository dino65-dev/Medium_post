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
   {% highlight bash %}
   gem install jekyll bundler
   bundle install
   {% endhighlight %}
3. Generate search index:
   {% highlight bash %}
   node generate_search_index.js
   {% endhighlight %}
4. Serve locally:
   {% highlight bash %}
   bundle exec jekyll serve
   {% endhighlight %}

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

{% highlight yaml %}
---
layout: default
title: "Your Post Title"
permalink: /your-post-url/
---
{% endhighlight %}

## 🚀 Advanced Features

### Progressive Web App (PWA)
- **Offline Support**: Service worker caches essential resources
- **Installable**: Add to home screen on mobile devices
- **Fast Loading**: Cached resources for instant loading

### Enhanced Search
- **Advanced Filtering**: Filter by content, titles, or categories
- **Real-time Results**: Instant search with highlighting
- **Keyboard Shortcuts**: `Ctrl+K` to focus search, `Ctrl+T` for TOC

### Reading Experience
- **Reading Progress**: Visual progress bar at the top
- **Table of Contents**: Auto-generated TOC for long posts
- **Back to Top**: Smooth scroll to top button
- **Print Optimization**: Clean print styles

### Code Features
- **Copy to Clipboard**: One-click code copying
- **Line Numbers**: Automatic line numbers for long code blocks
- **Syntax Highlighting**: Enhanced code syntax highlighting

### Social & Sharing
- **Social Buttons**: Share on Twitter, LinkedIn, Facebook
- **Copy Link**: Easy link copying with feedback
- **SEO Optimized**: Meta tags and structured data

### Analytics (Privacy-Focused)
- **Local Analytics**: Privacy-respecting, client-side tracking
- **Reading Metrics**: Time spent, scroll depth tracking
- **No External Tracking**: All data stays on user's device

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

### Performance
- **Lazy Loading**: Images load as they enter viewport
- **Optimized Fonts**: Efficient font loading
- **Minimal Dependencies**: Only essential external scripts

## 🎯 Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search bar
- `Ctrl/Cmd + T`: Toggle table of contents
- `Escape`: Close search results
- `Ctrl/Cmd + P`: Print page

## 📱 Mobile Features

- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Swipe-friendly navigation
- **PWA Support**: Install as mobile app
- **Fast Touch Targets**: Easy interaction on mobile

## 🔧 Technical Stack

- **Static Generation**: Jekyll for fast builds
- **Search Engine**: Lunr.js for client-side search
- **PWA**: Service Worker for offline functionality
- **Icons**: Inline SVG for crisp icons
- **Analytics**: Custom privacy-focused tracking
- **Performance**: Optimized loading and caching
