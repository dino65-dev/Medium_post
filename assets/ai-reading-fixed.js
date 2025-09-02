/**
 * Fixed AI Reading Experience
 * Simplified version that works reliably
 */

class AIReadingExperience {
    constructor() {
        this.isReadingMode = false;
        this.preferences = this.loadPreferences();

        console.log('🤖 AI Reading Experience initializing...');
        this.init();
    }

    init() {
        try {
            this.setupReadingMode();
            this.setupFocusMode();
            this.addReadingEnhancements();
            console.log('✅ AI Reading Experience initialized successfully');
        } catch (error) {
            console.error('❌ AI Reading initialization failed:', error);
        }
    }

    setupReadingMode() {
        // Apply saved preferences
        if (this.preferences.readingMode) {
            this.enableReadingMode();
        }
    }

    toggleReadingMode() {
        console.log('🤖 Toggling reading mode...');

        if (this.isReadingMode) {
            this.disableReadingMode();
        } else {
            this.enableReadingMode();
        }

        this.savePreferences();
    }

    enableReadingMode() {
        console.log('🤖 Enabling reading mode...');

        document.body.classList.add('ai-reading-mode');
        this.isReadingMode = true;

        // Apply reading optimizations
        this.optimizeTextForReading();
        this.addFocusOverlay();
        this.highlightKeyContent();

        // Update button state
        const btn = document.querySelector('.reading-mode-toggle');
        if (btn) {
            btn.classList.add('active');
            btn.textContent = '🤖 Reading ON';
        }

        console.log('✅ Reading mode enabled');
    }

    disableReadingMode() {
        console.log('🤖 Disabling reading mode...');

        document.body.classList.remove('ai-reading-mode');
        this.isReadingMode = false;

        // Remove optimizations
        this.removeFocusOverlay();
        this.removeHighlights();
        this.resetTextOptimizations();

        // Update button state
        const btn = document.querySelector('.reading-mode-toggle');
        if (btn) {
            btn.classList.remove('active');
            btn.textContent = '🤖 AI Reading';
        }

        console.log('✅ Reading mode disabled');
    }

    optimizeTextForReading() {
        const content = this.getMainContent();
        if (!content) return;

        // Improve typography
        content.style.fontSize = '18px';
        content.style.lineHeight = '1.8';
        content.style.maxWidth = '65ch';
        content.style.margin = '0 auto';
        content.style.padding = '2rem';

        // Optimize paragraphs
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (p.textContent.length > 200) {
                p.style.marginBottom = '1.5rem';
            }
        });

        // Optimize headings
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
            h.style.marginTop = '2rem';
            h.style.marginBottom = '1rem';
        });
    }

    resetTextOptimizations() {
        const content = this.getMainContent();
        if (!content) return;

        // Reset styles
        content.style.fontSize = '';
        content.style.lineHeight = '';
        content.style.maxWidth = '';
        content.style.margin = '';
        content.style.padding = '';

        // Reset paragraphs
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.marginBottom = '';
        });

        // Reset headings
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
            h.style.marginTop = '';
            h.style.marginBottom = '';
        });
    }

    addFocusOverlay() {
        // Create focus overlay
        const overlay = document.createElement('div');
        overlay.className = 'ai-focus-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(overlay);

        // Create focus window
        const focusWindow = document.createElement('div');
        focusWindow.className = 'ai-focus-window';
        focusWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            height: 80%;
            background: var(--bg-primary);
            border-radius: 12px;
            z-index: 9999;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        // Clone main content
        const content = this.getMainContent();
        if (content) {
            const clone = content.cloneNode(true);
            clone.style.padding = '2rem';
            focusWindow.appendChild(clone);
        }

        document.body.appendChild(focusWindow);

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 18px;
            z-index: 10000;
        `;

        closeBtn.onclick = () => this.disableReadingMode();
        focusWindow.appendChild(closeBtn);
    }

    removeFocusOverlay() {
        const overlay = document.querySelector('.ai-focus-overlay');
        const focusWindow = document.querySelector('.ai-focus-window');

        if (overlay) overlay.remove();
        if (focusWindow) focusWindow.remove();
    }

    highlightKeyContent() {
        const content = this.getMainContent();
        if (!content) return;

        // Highlight important sentences (simple heuristic)
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent;

            // Look for sentences with key indicators
            const keyPhrases = [
                'important', 'key', 'crucial', 'essential', 'fundamental',
                'note that', 'remember', 'keep in mind', 'however', 'therefore'
            ];

            keyPhrases.forEach(phrase => {
                if (text.toLowerCase().includes(phrase)) {
                    p.style.background = 'var(--accent-light)';
                    p.style.borderLeft = '4px solid var(--accent-color)';
                    p.style.paddingLeft = '1rem';
                    p.style.borderRadius = '4px';
                }
            });
        });

        // Highlight code blocks
        const codeBlocks = content.querySelectorAll('code, .highlight');
        codeBlocks.forEach(code => {
            code.style.boxShadow = '0 0 10px var(--accent-light)';
        });
    }

    removeHighlights() {
        const content = this.getMainContent();
        if (!content) return;

        // Remove paragraph highlights
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.background = '';
            p.style.borderLeft = '';
            p.style.paddingLeft = '';
            p.style.borderRadius = '';
        });

        // Remove code highlights
        const codeBlocks = content.querySelectorAll('code, .highlight');
        codeBlocks.forEach(code => {
            code.style.boxShadow = '';
        });
    }

    setupFocusMode() {
        // Add keyboard shortcut for focus mode
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.toggleReadingMode();
            }
        });
    }

    addReadingEnhancements() {
        // Add reading time estimation
        this.addReadingTimeEstimate();

        // Add progress indicator
        this.addReadingProgress();
    }

    addReadingTimeEstimate() {
        const content = this.getMainContent();
        if (!content) return;

        const wordCount = content.textContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed

        const indicator = document.createElement('div');
        indicator.className = 'reading-time-indicator';
        indicator.innerHTML = `📖 ${readingTime} min read`;
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            color: var(--text-secondary);
            z-index: 1001;
        `;

        document.body.appendChild(indicator);
    }

    addReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'ai-reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-color), #10b981);
            z-index: 1002;
            transition: width 0.3s ease;
            width: 0%;
        `;

        document.body.appendChild(progressBar);

        // Update progress on scroll
        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial call
    }

    getMainContent() {
        // Try to find main content area
        const selectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.main-content',
            '#content'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }

        // Fallback to body
        return document.body;
    }

    loadPreferences() {
        try {
            return JSON.parse(localStorage.getItem('ai_reading_preferences') || '{}');
        } catch {
            return {};
        }
    }

    savePreferences() {
        const prefs = {
            readingMode: this.isReadingMode,
            timestamp: Date.now()
        };

        localStorage.setItem('ai_reading_preferences', JSON.stringify(prefs));
    }
}

// Make it globally available
window.AIReadingExperience = AIReadingExperience;
