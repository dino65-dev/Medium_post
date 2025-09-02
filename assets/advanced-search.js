/**
 * Advanced Search System with AI-powered features
 * Smart search with filters, suggestions, and semantic understanding
 */

class AdvancedSearch {
    constructor() {
        this.searchIndex = null;
        this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        this.searchSuggestions = new Map();
        this.init();
    }

    async init() {
        await this.loadSearchIndex();
        this.createAdvancedSearchUI();
        this.setupSearchFunctionality();
        this.setupVoiceSearch();
        this.setupSearchAnalytics();
        this.preloadPopularSearches();
    }

    async loadSearchIndex() {
        try {
            const response = await fetch('/search_index.json');
            const data = await response.json();

            // Initialize Lunr.js with advanced configuration
            this.searchIndex = lunr(function () {
                this.ref('id');
                this.field('title', { boost: 10 });
                this.field('content', { boost: 5 });
                this.field('tags', { boost: 15 });
                this.field('category', { boost: 8 });
                this.field('excerpt', { boost: 3 });

                // Add support for fuzzy matching
                this.use(lunr.multiLanguage('en'));

                data.forEach((doc) => {
                    this.add(doc);
                });
            });

            this.documents = data;
        } catch (error) {
            console.warn('Search index not found, creating basic search');
            this.createBasicSearch();
        }
    }

    createAdvancedSearchUI() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'advanced-search-container';
        searchContainer.innerHTML = `
            <div class="search-overlay" id="searchOverlay">
                <div class="search-modal">
                    <div class="search-header">
                        <div class="search-input-container">
                            <input type="text" id="advancedSearchInput" placeholder="Search articles, code, topics..." autocomplete="off">
                            <button class="voice-search-btn" id="voiceSearchBtn" title="Voice Search">🎤</button>
                            <button class="search-close-btn" id="searchCloseBtn">&times;</button>
                        </div>
                        <div class="search-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="posts">Posts</button>
                            <button class="filter-btn" data-filter="code">Code</button>
                            <button class="filter-btn" data-filter="tutorials">Tutorials</button>
                            <button class="filter-btn" data-filter="recent">Recent</button>
                        </div>
                    </div>
                    <div class="search-body">
                        <div class="search-suggestions" id="searchSuggestions"></div>
                        <div class="search-results" id="searchResults"></div>
                        <div class="search-history" id="searchHistory"></div>
                    </div>
                    <div class="search-footer">
                        <div class="search-stats" id="searchStats"></div>
                        <div class="search-shortcuts">
                            <span>Press <kbd>↑</kbd><kbd>↓</kbd> to navigate • <kbd>Enter</kbd> to select • <kbd>Esc</kbd> to close</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(searchContainer);

        // Add search trigger button to header
        this.addSearchTrigger();
    }

    addSearchTrigger() {
        const searchTrigger = document.createElement('button');
        searchTrigger.className = 'search-trigger';
        searchTrigger.innerHTML = `
            <span class="search-icon">🔍</span>
            <span class="search-text">Search</span>
            <span class="search-shortcut">⌘K</span>
        `;

        // Insert into header or create floating button
        const header = document.querySelector('header, .header, nav');
        if (header) {
            header.appendChild(searchTrigger);
        } else {
            searchTrigger.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(searchTrigger);
        }

        searchTrigger.addEventListener('click', () => this.openSearch());
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('advancedSearchInput');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchResults = document.getElementById('searchResults');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const searchHistory = document.getElementById('searchHistory');
        const closeBtn = document.getElementById('searchCloseBtn');

        let currentFilter = 'all';
        let selectedIndex = -1;

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                this.closeSearch();
            }
        });

        // Search input handling
        searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();

            if (query.length === 0) {
                this.showSearchHistory();
                return;
            }

            if (query.length < 2) {
                this.showSearchSuggestions(query);
                return;
            }

            this.performSearch(query, currentFilter);
            this.addToSearchHistory(query);
        }, 300));

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;

                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query, currentFilter);
                }
            });
        });

        // Navigation with arrow keys
        searchInput.addEventListener('keydown', (e) => {
            const results = document.querySelectorAll('.search-result-item, .suggestion-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                this.updateSelection(results, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                this.updateSelection(results, selectedIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    results[selectedIndex].click();
                }
            }
        });

        // Close search
        closeBtn.addEventListener('click', () => this.closeSearch());
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) this.closeSearch();
        });

        // Show search history initially
        this.showSearchHistory();
    }

    performSearch(query, filter = 'all') {
        if (!this.searchIndex) {
            this.performBasicSearch(query, filter);
            return;
        }

        // Advanced Lunr.js search with fuzzy matching
        const searchTerms = query.split(' ').map(term => `${term}~1 ${term}*`).join(' ');
        const results = this.searchIndex.search(searchTerms);

        // Filter results based on active filter
        let filteredResults = results.map(result => {
            const doc = this.documents.find(d => d.id === result.ref);
            return { ...doc, score: result.score };
        });

        if (filter !== 'all') {
            filteredResults = filteredResults.filter(doc => {
                switch (filter) {
                    case 'posts': return doc.type === 'post';
                    case 'code': return doc.content.includes('```') || doc.tags?.includes('code');
                    case 'tutorials': return doc.tags?.includes('tutorial');
                    case 'recent': return new Date(doc.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    default: return true;
                }
            });
        }

        this.displaySearchResults(filteredResults, query);
        this.updateSearchStats(filteredResults.length, query);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const searchHistory = document.getElementById('searchHistory');

        searchSuggestions.style.display = 'none';
        searchHistory.style.display = 'none';
        searchResults.style.display = 'block';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try adjusting your search or using different keywords</p>
                    <div class="search-suggestions-alt">
                        ${this.generateSearchSuggestions(query)}
                    </div>
                </div>
            `;
            return;
        }

        const highlightedResults = results.map(result => ({
            ...result,
            highlightedTitle: this.highlightText(result.title || '', query),
            highlightedContent: this.highlightText(result.excerpt || result.content || '', query, 150)
        }));

        searchResults.innerHTML = highlightedResults.map(result => `
            <div class="search-result-item" data-url="${result.url}">
                <div class="result-header">
                    <h3 class="result-title">${result.highlightedTitle}</h3>
                    <div class="result-meta">
                        <span class="result-type">${result.type || 'post'}</span>
                        <span class="result-date">${this.formatDate(result.date)}</span>
                        <span class="result-score">${Math.round(result.score * 100)}% match</span>
                    </div>
                </div>
                <p class="result-excerpt">${result.highlightedContent}</p>
                <div class="result-tags">
                    ${(result.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                this.trackSearchClick(query, url);
                window.location.href = url;
            });
        });
    }

    setupVoiceSearch() {
        const voiceBtn = document.getElementById('voiceSearchBtn');
        const searchInput = document.getElementById('advancedSearchInput');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }

            try {
                recognition.start();
                isListening = true;
                voiceBtn.innerHTML = '🔴';
                voiceBtn.classList.add('listening');
            } catch (error) {
                console.warn('Voice search failed:', error);
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            searchInput.dispatchEvent(new Event('input'));
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.innerHTML = '🎤';
            voiceBtn.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            console.warn('Voice recognition error:', event.error);
            isListening = false;
            voiceBtn.innerHTML = '🎤';
            voiceBtn.classList.remove('listening');
        };
    }

    showSearchSuggestions(query) {
        const searchSuggestions = document.getElementById('searchSuggestions');
        const searchResults = document.getElementById('searchResults');
        const searchHistory = document.getElementById('searchHistory');

        searchResults.style.display = 'none';
        searchHistory.style.display = 'none';
        searchSuggestions.style.display = 'block';

        const suggestions = this.generateSuggestions(query);

        searchSuggestions.innerHTML = `
            <div class="suggestions-header">
                <h4>Search Suggestions</h4>
            </div>
            <div class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" data-suggestion="${suggestion}">
                        <span class="suggestion-icon">🔍</span>
                        <span class="suggestion-text">${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers for suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                document.getElementById('advancedSearchInput').value = suggestion;
                this.performSearch(suggestion);
            });
        });
    }

    showSearchHistory() {
        const searchHistory = document.getElementById('searchHistory');
        const searchResults = document.getElementById('searchResults');
        const searchSuggestions = document.getElementById('searchSuggestions');

        searchResults.style.display = 'none';
        searchSuggestions.style.display = 'none';
        searchHistory.style.display = 'block';

        const recentSearches = this.searchHistory.slice(-10).reverse();
        const popularSearches = this.getPopularSearches();

        searchHistory.innerHTML = `
            ${recentSearches.length > 0 ? `
                <div class="history-section">
                    <h4>Recent Searches</h4>
                    <div class="history-list">
                        ${recentSearches.map(search => `
                            <div class="history-item" data-search="${search}">
                                <span class="history-icon">🕐</span>
                                <span class="history-text">${search}</span>
                                <button class="history-remove" data-search="${search}">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="history-section">
                <h4>Popular Searches</h4>
                <div class="popular-searches">
                    ${popularSearches.map(search => `
                        <button class="popular-search-btn" data-search="${search}">${search}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers
        document.querySelectorAll('.history-item, .popular-search-btn').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-remove')) {
                    e.stopPropagation();
                    this.removeFromSearchHistory(e.target.dataset.search);
                    this.showSearchHistory();
                    return;
                }

                const search = item.dataset.search;
                document.getElementById('advancedSearchInput').value = search;
                this.performSearch(search);
            });
        });
    }

    // Helper methods
    openSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('advancedSearchInput');

        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 100);
    }

    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('advancedSearchInput').value = '';
    }

    highlightText(text, query, maxLength = 200) {
        if (!text) return '';

        let highlighted = text;
        const queryTerms = query.toLowerCase().split(' ');

        queryTerms.forEach(term => {
            if (term.length > 1) {
                const regex = new RegExp(`(${term})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark>$1</mark>');
            }
        });

        if (highlighted.length > maxLength) {
            // Try to show text around highlighted terms
            const markIndex = highlighted.indexOf('<mark>');
            if (markIndex > 0) {
                const start = Math.max(0, markIndex - 50);
                const end = Math.min(highlighted.length, start + maxLength);
                highlighted = '...' + highlighted.substring(start, end) + '...';
            } else {
                highlighted = highlighted.substring(0, maxLength) + '...';
            }
        }

        return highlighted;
    }

    generateSuggestions(query) {
        const commonSearches = [
            'javascript tutorial', 'python code', 'css tricks', 'react components',
            'machine learning', 'data science', 'web development', 'algorithms',
            'database design', 'api development', 'responsive design', 'performance optimization'
        ];

        return commonSearches
            .filter(search => search.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8);
    }

    getPopularSearches() {
        return ['javascript', 'python', 'css', 'react', 'tutorial', 'code examples', 'best practices', 'optimization'];
    }

    addToSearchHistory(query) {
        if (query.length < 2) return;

        const index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
        }

        this.searchHistory.push(query);

        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory.shift();
        }

        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }

    removeFromSearchHistory(query) {
        const index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
            localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
        }
    }

    updateSelection(results, selectedIndex) {
        results.forEach((result, index) => {
            result.classList.toggle('selected', index === selectedIndex);
        });
    }

    updateSearchStats(resultCount, query) {
        const searchStats = document.getElementById('searchStats');
        searchStats.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}"`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    setupSearchAnalytics() {
        // Track search usage for improvements
        this.searchAnalytics = {
            searches: 0,
            popularQueries: new Map(),
            clickThroughRate: new Map()
        };
    }

    trackSearchClick(query, url) {
        const clicks = this.searchAnalytics.clickThroughRate.get(query) || 0;
        this.searchAnalytics.clickThroughRate.set(query, clicks + 1);
    }

    preloadPopularSearches() {
        // Pre-generate search suggestions for better performance
        const popularTerms = ['javascript', 'python', 'css', 'react', 'vue', 'angular', 'node'];
        popularTerms.forEach(term => {
            this.searchSuggestions.set(term, this.generateSuggestions(term));
        });
    }

    performBasicSearch(query, filter) {
        // Fallback search if no search index available
        const content = document.body.textContent.toLowerCase();
        const results = [];

        if (content.includes(query.toLowerCase())) {
            results.push({
                title: 'Current Page',
                content: 'Content found on this page',
                url: window.location.href,
                score: 0.8
            });
        }

        this.displaySearchResults(results, query);
    }

    createBasicSearch() {
        // Create a basic search index from current page content
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = document.querySelectorAll('p');

        this.documents = [{
            id: 'current-page',
            title: document.title,
            content: document.body.textContent,
            url: window.location.href,
            type: 'page'
        }];
    }

    generateSearchSuggestions(query) {
        const suggestions = [
            `Try searching for "${query} tutorial"`,
            `Look for "${query} examples"`,
            `Search for "${query} documentation"`,
            'Check your spelling',
            'Try more general terms'
        ];

        return suggestions.map(s => `<p>${s}</p>`).join('');
    }
}

// Initialize Advanced Search
window.addEventListener('DOMContentLoaded', () => {
    window.AdvancedSearch = new AdvancedSearch();
});
