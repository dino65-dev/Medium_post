# Medium_post - Mathematical Blog Repository

## 📊 Overview

A Jekyll-powered mathematical blog repository organized with hierarchical navigation for mathematical content, equations, and general posts. This repository features a comprehensive sidebar navigation system designed for GitHub Pages deployment.

## 🏗️ Repository Structure

### 📁 Directory Organization

```
Medium_post/
├── _layouts/
│   ├── default.html     # Main layout with sidebar navigation
│   └── page.html        # Simple page layout
├── mathematics/         # Mathematics content
│   ├── algebra/
│   │   ├── linear-algebra/
│   │   ├── abstract-algebra/
│   │   └── polynomial-equations/
│   ├── calculus/
│   │   ├── differential-calculus/
│   │   ├── integral-calculus/
│   │   └── multivariable/
│   ├── statistics/
│   │   ├── descriptive/
│   │   ├── probability-theory/
│   │   └── hypothesis-testing/
│   └── discrete/
│       ├── graph-theory/
│       ├── combinatorics/
│       └── number-theory/
├── equations/           # Equations and formulas
│   ├── differential/
│   │   ├── ordinary/
│   │   ├── partial/
│   │   └── systems/
│   ├── algebraic/
│   │   ├── quadratic/
│   │   ├── cubic/
│   │   └── systems/
│   └── special/
│       ├── trigonometric/
│       ├── exponential/
│       └── hyperbolic/
├── posts/              # General posts
│   ├── tutorials/
│   ├── problem-solving/
│   ├── research/
│   ├── applications/
│   └── book-reviews/
├── resources/          # Mathematical resources
│   ├── cheat-sheets/
│   ├── formulas/
│   ├── tools/
│   └── datasets/
└── archive/            # Content archive
    ├── by-date/
    ├── by-topic/
    └── by-difficulty/
```

## 🎯 Navigation Structure

The repository implements a hierarchical sidebar navigation with the following main categories:

### 📊 Mathematics
- **Algebra**: Linear algebra, abstract algebra, polynomial equations
- **Calculus**: Differential, integral, and multivariable calculus
- **Statistics & Probability**: Descriptive statistics, probability theory, hypothesis testing
- **Discrete Mathematics**: Graph theory, combinatorics, number theory

### 🧮 Equations
- **Differential Equations**: Ordinary DE, partial DE, systems of DE
- **Algebraic Equations**: Quadratic, cubic, systems of equations
- **Special Functions**: Trigonometric, exponential & logarithmic, hyperbolic functions

### 📝 General Posts
- Tutorials
- Problem Solving
- Research Notes
- Real-world Applications
- Book Reviews

### 📚 Resources
- Cheat Sheets
- Formula Reference
- Mathematical Tools
- Datasets

### 📅 Archive
- By Date
- By Topic
- By Difficulty

## 🔧 Features

- **Responsive Design**: Mobile-friendly sidebar navigation
- **MathJax Integration**: Full LaTeX equation support
- **Hierarchical Organization**: Parent-child category structure
- **GitHub Pages Compatible**: Ready for Jekyll deployment
- **Semantic Structure**: Clear content organization for better discoverability

## 📝 Content Guidelines

### Mathematics Posts
- Place in appropriate `/mathematics/` subdirectory
- Include relevant equations using MathJax syntax
- Add front matter with appropriate categories and tags

### Equation Posts
- Organize by equation type in `/equations/` subdirectories
- Focus on specific mathematical equations or formula families
- Include derivations and examples

### General Posts
- Use `/posts/` directory with appropriate subdirectory
- Include tutorials, applications, and educational content
- Cross-reference with mathematics and equations sections when relevant

## 🚀 Getting Started

1. Clone the repository
2. Install Jekyll dependencies
3. Create content in appropriate directories
4. Use the hierarchical navigation structure
5. Deploy to GitHub Pages

## 📄 Layout Usage

### Default Layout
```yaml
---
layout: default
title: "Your Post Title"
category: mathematics
subcategory: algebra
---
```

### Page Layout
```yaml
---
layout: page
title: "Your Page Title"
---
```

## 🔗 Links

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [MathJax Documentation](https://docs.mathjax.org/)
- [GitHub Pages](https://pages.github.com/)

---

*This repository structure enables efficient organization and navigation of mathematical content with a focus on equations, proofs, and educational materials.*
