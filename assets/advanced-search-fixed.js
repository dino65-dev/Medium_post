/**
 * Fixed Advanced Search System
 * Simplified version that works reliably
 */

class AdvancedSearch {
    constructor() {
        this.isOpen = false;
        this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        this.documents = [];
        this.searchIndex = null;

        console.log('🔍 Advanced Search initializing...');
        this.init();
    }

    async init() {
        try {
            await this.loadSearchIndex();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            console.log('✅ Advanced Search initialized successfully');
        } catch (error) {
            console.error('❌ Advanced Search initialization failed:', error);
            this.setupBasicSearch();
        }
    }

    async loadSearchIndex() {
        try {
            console.log('🔍 Loading search index...');
            const response = await fetch('./assets/search_index.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Search index loaded with ${data.length} items`);

            // Create Lunr index
            this.searchIndex = lunr(function () {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('content', { boost: 5 });
                this.field('tags', { boost: 15 });
                this.field('category', { boost: 8 });
                this.field('excerpt', { boost: 3 });

                data.forEach((doc, index) => {
                    doc.id = index;
                    this.add(doc);
                });
            });

            this.documents = data;
            console.log('✅ Lunr search index created');

        } catch (error) {
            console.warn('⚠️ Could not load search index:', error.message);
            console.log('🔧 Creating fallback search data...');
            this.createFallbackData();
        }
    }

    createFallbackData() {
        // Create some fallback search data
        this.documents = [
            {
                title: "MUON Optimizer",
                url: "/MUON-Optimizer",
                content: "Advanced momentum-based optimization algorithm",
                excerpt: "A revolutionary momentum-based optimization algorithm",
                type: "post",
                tags: ["optimization", "machine learning"],
                category: "Machine Learning"
            },
            {
                title: "Neural Networks Guide",
                url: "/neural-networks",
                content: "Complete guide to neural network architectures",
                excerpt: "Deep dive into neural network architectures",
                type: "tutorial",
                tags: ["neural networks", "deep learning"],
                category: "Deep Learning"
            }
        ];

        // Create simple search index
        this.searchIndex = lunr(function () {
            this.ref('url');
            this.field('title', { boost: 10 });
            this.field('content', { boost: 5 });
            this.field('tags', { boost: 15 });

            this.documents.forEach((doc, index) => {
                doc.id = index;
                this.add(doc);
            });
        }.bind(this));

        console.log('✅ Fallback search data created');
    }

    setupBasicSearch() {
        console.log('🔧 Setting up basic search fallback...');
        this.createFallbackData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.selectFirstResult();
                }
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Close on overlay click
        const overlay = document.getElementById('advancedSearchOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }

            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open() {
        console.log('🔍 Opening advanced search...');
        const overlay = document.getElementById('advancedSearchOverlay');
        const input = document.getElementById('advancedSearchInput');

        if (overlay) {
            overlay.classList.add('active');
            this.isOpen = true;

            // Focus the input after animation
            setTimeout(() => {
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);

            this.showSearchHistory();
        } else {
            console.error('❌ Search overlay not found');
        }
    }

    close() {
        console.log('🔍 Closing advanced search...');
        const overlay = document.getElementById('advancedSearchOverlay');
        const input = document.getElementById('advancedSearchInput');

        if (overlay) {
            overlay.classList.remove('active');
            this.isOpen = false;

            if (input) {
                input.value = '';
                input.blur();
            }

            this.clearResults();
        }
    }

    handleSearch(query) {
        console.log('🔍 Searching for:', query);

        if (!query.trim()) {
            this.showSearchHistory();
            return;
        }

        if (!this.searchIndex) {
            console.warn('⚠️ Search index not available');
            this.showNoResults();
            return;
        }

        try {
            // Perform search
            const results = this.searchIndex.search(query);
            console.log(`🔍 Found ${results.length} results`);

            // Get document details
            const searchResults = results.map(result => {
                const doc = this.documents.find(d => d.url === result.ref);
                return {
                    ...doc,
                    score: result.score
                };
            }).filter(Boolean);

            this.displayResults(searchResults, query);
            this.saveSearchHistory(query);

        } catch (error) {
            console.error('❌ Search error:', error);
            this.showNoResults();
        }
    }

    displayResults(results, query) {
        const container = document.getElementById('advancedSearchResults');
        const statsElement = document.getElementById('searchStats');

        if (!container) {
            console.error('❌ Search results container not found');
            return;
        }

        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        // Update stats
        if (statsElement) {
            statsElement.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
        }

        // Clear previous results
        container.innerHTML = '';

        results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-header">
                    <h3 class="result-title">${this.highlightText(result.title, query)}</h3>
                    <div class="result-meta">
                        <span class="result-type">${result.type || 'post'}</span>
                        <span class="result-score">${Math.round(result.score * 100)}%</span>
                    </div>
                </div>
                <p class="result-excerpt">${this.highlightText(result.excerpt, query)}</p>
                ${result.tags ? `<div class="result-tags">${result.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            `;

            item.addEventListener('click', () => {
                this.selectResult(result);
            });

            container.appendChild(item);
        });

        // Hide other sections
        this.hideSearchHistory();
        this.hideSuggestions();
    }

    highlightText(text, query) {
        if (!text || !query) return text;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    selectResult(result) {
        console.log('🔍 Selected result:', result.title);
        this.close();

        // Navigate to the result (you can customize this)
        if (result.url) {
            window.location.href = result.url;
        }
    }

    selectFirstResult() {
        const firstResult = document.querySelector('.search-result-item');
        if (firstResult) {
            firstResult.click();
        }
    }

    showSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        const resultsContainer = document.getElementById('advancedSearchResults');

        if (!historyContainer) return;

        // Clear results
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }

        if (this.searchHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="history-section">
                    <h4>💡 Try searching for:</h4>
                    <div class="popular-searches">
                        <button class="popular-search-btn" onclick="document.getElementById('advancedSearchInput').value='optimization'; window.advancedSearch.handleSearch('optimization')">optimization</button>
                        <button class="popular-search-btn" onclick="document.getElementById('advancedSearchInput').value='neural networks'; window.advancedSearch.handleSearch('neural networks')">neural networks</button>
                        <button class="popular-search-btn" onclick="document.getElementById('advancedSearchInput').value='machine learning'; window.advancedSearch.handleSearch('machine learning')">machine learning</button>
                    </div>
                </div>
            `;
        } else {
            historyContainer.innerHTML = `
                <div class="history-section">
                    <h4>🕒 Recent Searches</h4>
                    ${this.searchHistory.slice(-5).reverse().map(term => `
                        <div class="history-item">
                            <span class="history-icon">🔍</span>
                            <span class="history-text" onclick="document.getElementById('advancedSearchInput').value='${term}'; window.advancedSearch.handleSearch('${term}')">${term}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.hideSuggestions();
    }

    showNoResults() {
        const container = document.getElementById('advancedSearchResults');
        const statsElement = document.getElementById('searchStats');

        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try different keywords or check your spelling</p>
                </div>
            `;
        }

        if (statsElement) {
            statsElement.textContent = 'No results found';
        }

        this.hideSearchHistory();
        this.hideSuggestions();
    }

    clearResults() {
        const containers = ['advancedSearchResults', 'searchHistory', 'searchSuggestions'];
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '';
            }
        });

        const statsElement = document.getElementById('searchStats');
        if (statsElement) {
            statsElement.textContent = 'Ready to search';
        }
    }

    hideSearchHistory() {
        const element = document.getElementById('searchHistory');
        if (element) element.innerHTML = '';
    }

    hideSuggestions() {
        const element = document.getElementById('searchSuggestions');
        if (element) element.innerHTML = '';
    }

    handleFilterChange(filter) {
        console.log('🔍 Filter changed to:', filter);

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Re-run search with current query if any
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput && searchInput.value) {
            this.handleSearch(searchInput.value);
        }
    }

    saveSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.push(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory.shift();
            }
            localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
        }
    }
}

// Make it globally available
window.AdvancedSearch = AdvancedSearch;
