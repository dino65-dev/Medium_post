#!/usr/bin/env node

/**
 * Simple script to generate search index for Jekyll site
 * Run with: node generate_search_index.js
 */

const fs = require('fs');
const path = require('path');

function extractFrontMatter(content) {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    const body = frontMatterMatch[2];

    const titleMatch = frontMatter.match(/title:\s*(.+)/);
    const permalinkMatch = frontMatter.match(/permalink:\s*(.+)/);

    return {
      title: titleMatch ? titleMatch[1].replace(/['"]/g, '').trim() : null,
      permalink: permalinkMatch ? permalinkMatch[1].replace(/['"]/g, '').trim() : null,
      body: body
    };
  }
  return { title: null, body: content };
}

function generateSearchIndex() {
  const siteDir = __dirname;
  const documents = [];

  // Read all .md files
  function processDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.join(basePath, item);

      if (stat.isDirectory() && !item.startsWith('.') && item !== '_site' && item !== 'node_modules') {
        processDirectory(fullPath, relativePath);
      } else if (stat.isFile() && item.endsWith('.md') && !item.startsWith('_')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { title, permalink, body } = extractFrontMatter(content);

          if (title) {
            // Clean up the body content for search
            const cleanBody = body
              .replace(/```[\s\S]*?```/g, '') // Remove code blocks
              .replace(/\$[^$\n]+\$/g, '') // Remove inline math
              .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove display math
              .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
              .replace(/[*_`~]/g, '') // Remove markdown formatting
              .replace(/\n+/g, ' ') // Replace newlines with spaces
              .trim();

            const url = permalink || `/${item.replace('.md', '/')}`;

            documents.push({
              id: documents.length,
              title: title,
              content: cleanBody.substring(0, 1000), // Limit content length
              category: basePath || 'General',
              tags: title.toLowerCase().split(' ').filter(word => word.length > 2),
              url: url
            });
          }
        } catch (error) {
          console.warn(`Error processing ${fullPath}:`, error.message);
        }
      }
    }
  }

  processDirectory(siteDir);

  // Write search index
  const outputPath = path.join(siteDir, 'search_index.json');
  fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

  console.log(`Generated search index with ${documents.length} documents at ${outputPath}`);
}

if (require.main === module) {
  generateSearchIndex();
}

module.exports = { generateSearchIndex };
