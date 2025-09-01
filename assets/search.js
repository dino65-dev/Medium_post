/*
 * Advanced Search for Jekyll Blog
 * Uses lunr.js for client-side search across all .md files
 * Preserves sidebar styling and letter spacing
 */

// Global search variables
let searchIndex;
let searchDocuments;
let searchInitialized = false;
let currentFilter = 'all';

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Enable search input by default
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.disabled = false;
        searchInput.placeholder = '🔍 Search posts...';
    }

    initializeSearch();
    initializeFilters();
});

function initializeSearch() {
    // Fetch the search index
    fetch('/search_index.json')
        .then(response => {
            if (!response.ok) {
                console.warn('Search index not found. Building from current page...');
                buildSearchIndexFromCurrentPage();
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                setupSearch(data);
            }
        })
        .catch(error => {
            console.warn('Error loading search index:', error);
            buildSearchIndexFromCurrentPage();
        });
}

function setupSearch(documents) {
    try {
        // Create lunr index
        searchIndex = lunr(function() {
            this.ref('id');
            this.field('title', { boost: 10 });
            this.field('content', { boost: 1 });
            this.field('category', { boost: 5 });
            this.field('tags', { boost: 3 });
            this.field('url', { boost: 2 });

            documents.forEach(function(doc, idx) {
                doc.id = idx;
                this.add(doc);
            }.bind(this));
        });

        searchDocuments = documents;
        searchInitialized = true;

        // Enable search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.disabled = false;
            searchInput.placeholder = '🔍 Search posts and content...';
            searchInput.addEventListener('input', handleSearchInput);
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.length >= 2) {
                    handleSearchInput({ target: searchInput });
                }
            });
        }

        console.log(`Search initialized with ${documents.length} documents`);
    } catch (error) {
        console.error('Error setting up search:', error);
    }
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchContainer = document.querySelector('.search-container');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current filter
            currentFilter = this.dataset.filter;
            // Re-run search with new filter
            const searchInput = document.getElementById('search-input');
            if (searchInput && searchInput.value.trim()) {
                const results = performSearch(searchInput.value.trim());
                displaySearchResults(results, searchInput.value.trim());
            }
        });
    });

    // Show filters when search is active
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            searchContainer.classList.add('search-active');
        });

        searchInput.addEventListener('blur', function() {
            setTimeout(() => {
                searchContainer.classList.remove('search-active');
            }, 200);
        });
    }
}

function buildSearchIndexFromCurrentPage() {
    // Fallback: extract content from current page
    const documents = [];

    // Extract from sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach((link, idx) => {
        const title = link.textContent.trim();
        const url = link.href;

        if (title && url && !url.includes('#')) {
            documents.push({
                id: idx,
                title: title,
                content: title,
                category: extractCategoryFromUrl(url),
                tags: [title.toLowerCase()],
                url: url
            });
        }
    });

    // Extract from main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const headings = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, idx) => {
            const title = heading.textContent.trim();
            const content = getHeadingContext(heading);

            if (title) {
                documents.push({
                    id: documents.length,
                    title: title,
                    content: content,
                    category: 'content',
                    tags: title.toLowerCase().split(' '),
                    url: window.location.href + '#' + heading.id
                });
            }
        });
    }

    if (documents.length > 0) {
        setupSearch(documents);
    } else {
        console.warn('No content found for search indexing');
    }
}

function extractCategoryFromUrl(url) {
    const path = new URL(url).pathname;
    const parts = path.split('/').filter(p => p.length > 0);
    return parts.length > 0 ? parts[0] : 'general';
}

function getHeadingContext(heading) {
    let content = heading.textContent;
    let nextElement = heading.nextElementSibling;

    // Get next paragraph or two for context
    let contextCount = 0;
    while (nextElement && contextCount < 2) {
        if (nextElement.tagName === 'P') {
            content += ' ' + nextElement.textContent;
            contextCount++;
        } else if (nextElement.tagName && nextElement.tagName.match(/^H[1-6]$/)) {
            break;
        }
        nextElement = nextElement.nextElementSibling;
    }

    return content;
}

function performSearch(query) {
    if (!searchInitialized || !query.trim()) {
        return [];
    }

    try {
        const results = searchIndex.search(query);
        let filteredResults = results.map(result => {
            const doc = searchDocuments[result.ref];
            return {
                ...doc,
                score: result.score
            };
        });

        // Apply filter
        if (currentFilter !== 'all') {
            filteredResults = filteredResults.filter(result => {
                switch (currentFilter) {
                    case 'content':
                        return result.content.toLowerCase().includes(query.toLowerCase());
                    case 'title':
                        return result.title.toLowerCase().includes(query.toLowerCase());
                    case 'category':
                        return result.category.toLowerCase().includes(query.toLowerCase());
                    default:
                        return true;
                }
            });
        }

        return filteredResults.slice(0, 10); // Limit to 10 results
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <p>No results found for "<strong>${escapeHtml(query)}</strong>"</p>
                <p>Try different keywords or browse the navigation menu.</p>
            </div>
        `;
        return;
    }

    const resultsHtml = results.map(result => {
        const snippet = createSearchSnippet(result.content, query);
        return `
            <div class="search-result-item">
                <h4><a href="${result.url}">${escapeHtml(result.title)}</a></h4>
                <p class="search-snippet">${snippet}</p>
                <div class="search-meta">
                    <span class="search-category">${escapeHtml(result.category)}</span>
                    <span class="search-score">Score: ${Math.round(result.score * 100) / 100}</span>
                </div>
            </div>
        `;
    }).join('');

    searchResults.innerHTML = `
        <div class="search-results-header">
            <h3>Search Results (${results.length})</h3>
            <button class="search-close" onclick="clearSearch()">✕</button>
        </div>
        <div class="search-results-list">
            ${resultsHtml}
        </div>
    `;
}

function createSearchSnippet(content, query) {
    const words = query.toLowerCase().split(' ').filter(w => w.length > 0);
    let snippet = content;

    // Find the best match position
    let bestPos = 0;
    let bestScore = 0;

    words.forEach(word => {
        const pos = content.toLowerCase().indexOf(word);
        if (pos !== -1) {
            const score = words.filter(w =>
                content.toLowerCase().substring(Math.max(0, pos - 50), pos + 50).includes(w)
            ).length;
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
            }
        }
    });

    // Extract snippet around best match
    const start = Math.max(0, bestPos - 75);
    const end = Math.min(content.length, bestPos + 75);
    snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    // Highlight search terms
    words.forEach(word => {
        const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
    });

    return snippet;
}

function handleSearchInput(event) {
    const query = event.target.value;
    const searchResults = document.getElementById('search-results');

    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    searchResults.style.display = 'block';

    if (!searchInitialized) {
        searchResults.innerHTML = '<div class="search-loading">Loading search index...</div>';
        return;
    }

    const results = performSearch(query);
    displaySearchResults(results, query);
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (searchInput) searchInput.value = '';
    if (searchResults) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Escape to clear search
    if (event.key === 'Escape') {
        clearSearch();
    }
});

// Export for global access
window.searchFunctions = {
    handleSearchInput,
    clearSearch,
    performSearch
};
