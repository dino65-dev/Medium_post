/**
 * AI-Powered Reading Experience
 * Smart features for enhanced reading and content interaction
 */

class AIReadingExperience {
    constructor() {
        this.readingProfile = this.loadReadingProfile();
        this.init();
    }

    init() {
        this.setupSmartReadingMode();
        this.addReadingProgressIndicator();
        this.setupFocusMode();
        this.addSmartHighlighting();
        this.setupTextToSpeech();
        this.addSmartSummary();
        this.setupReadingSpeedOptimization();
        this.addContentAdaptation();
    }

    // Smart reading mode with adaptive formatting
    setupSmartReadingMode() {
        const toggleBtn = this.createToggleButton('🧠', 'Smart Reading Mode', 'smart-reading');

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('smart-reading-mode');
            this.adaptContentForReading();
            this.savePreference('smartReading', document.body.classList.contains('smart-reading-mode'));
        });

        if (this.readingProfile.smartReading) {
            document.body.classList.add('smart-reading-mode');
            this.adaptContentForReading();
        }
    }

    // Adaptive content formatting based on reading science
    adaptContentForReading() {
        if (!document.body.classList.contains('smart-reading-mode')) return;

        const content = document.querySelector('main, article, .content, .post-content');
        if (!content) return;

        // Optimize paragraph spacing
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (p.textContent.length > 200) {
                p.style.lineHeight = '1.8';
                p.style.marginBottom = '1.5em';
            }
        });

        // Add reading guides for long text
        this.addReadingGuides();

        // Highlight important sentences
        this.highlightKeyContent();
    }

    // Visual reading progress with estimated time
    addReadingProgressIndicator() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress-container';
        progressContainer.innerHTML = `
            <div class="reading-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="reading-stats">
                    <span class="time-remaining">5 min read</span>
                    <span class="progress-percentage">0%</span>
                </div>
            </div>
        `;

        document.body.appendChild(progressContainer);

        const progressFill = progressContainer.querySelector('.progress-fill');
        const timeRemaining = progressContainer.querySelector('.time-remaining');
        const progressPercentage = progressContainer.querySelector('.progress-percentage');

        // Calculate reading metrics
        const content = document.querySelector('main, article, .content, .post-content');
        const totalWords = content ? content.textContent.split(/\s+/).length : 0;
        const readingSpeed = this.readingProfile.wordsPerMinute || 200;
        const totalTime = Math.ceil(totalWords / readingSpeed);

        timeRemaining.textContent = totalTime > 1 ? `${totalTime} min read` : 'Quick read';

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min((scrolled / total) * 100, 100);

            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;

            const remainingTime = Math.ceil((totalTime * (100 - progress)) / 100);
            timeRemaining.textContent = remainingTime > 0 ? `${remainingTime} min left` : 'Almost done!';
        });
    }

    // Focus mode with distraction elimination
    setupFocusMode() {
        const focusBtn = this.createToggleButton('🎯', 'Focus Mode', 'focus-mode');

        focusBtn.addEventListener('click', () => {
            document.body.classList.toggle('focus-mode');
            this.savePreference('focusMode', document.body.classList.contains('focus-mode'));
        });

        if (this.readingProfile.focusMode) {
            document.body.classList.add('focus-mode');
        }

        // Keyboard shortcut for focus mode
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                focusBtn.click();
            }
        });
    }

    // Smart text highlighting with context awareness
    addSmartHighlighting() {
        let isHighlighting = false;
        let highlights = JSON.parse(localStorage.getItem('reading_highlights') || '[]');

        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                this.showHighlightOptions(selection);
            }
        });

        // Load existing highlights
        this.loadHighlights(highlights);
    }

    showHighlightOptions(selection) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const highlightMenu = document.createElement('div');
        highlightMenu.className = 'highlight-menu';
        highlightMenu.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 50}px;
            transform: translateX(-50%);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px;
            display: flex;
            gap: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const colors = ['#ffeb3b', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
        colors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.style.cssText = `
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                background: ${color};
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;

            colorBtn.addEventListener('click', () => {
                this.highlightSelection(selection, color);
                highlightMenu.remove();
            });

            highlightMenu.appendChild(colorBtn);
        });

        document.body.appendChild(highlightMenu);

        // Remove menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => highlightMenu.remove(), { once: true });
        }, 100);
    }

    highlightSelection(selection, color) {
        const range = selection.getRangeAt(0);
        const highlight = document.createElement('mark');
        highlight.style.backgroundColor = color;
        highlight.className = 'user-highlight';

        try {
            range.surroundContents(highlight);

            // Save highlight
            const highlights = JSON.parse(localStorage.getItem('reading_highlights') || '[]');
            highlights.push({
                text: selection.toString(),
                color,
                timestamp: Date.now(),
                position: this.getTextPosition(range)
            });
            localStorage.setItem('reading_highlights', JSON.stringify(highlights));

        } catch (e) {
            console.warn('Could not highlight complex selection');
        }

        selection.removeAllRanges();
    }

    // Text-to-Speech with natural voice
    setupTextToSpeech() {
        const ttsBtn = this.createToggleButton('🔊', 'Listen to Article', 'tts');
        let isPlaying = false;
        let utterance = null;

        ttsBtn.addEventListener('click', () => {
            if (isPlaying) {
                speechSynthesis.cancel();
                isPlaying = false;
                ttsBtn.innerHTML = '🔊';
                return;
            }

            const content = document.querySelector('main, article, .content, .post-content');
            if (!content) return;

            const text = this.extractReadableText(content);
            utterance = new SpeechSynthesisUtterance(text);

            // Configure voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.lang.startsWith('en') && voice.name.includes('Natural')
            ) || voices.find(voice => voice.lang.startsWith('en'));

            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = this.readingProfile.speechRate || 1;
            utterance.pitch = 1;

            utterance.onstart = () => {
                isPlaying = true;
                ttsBtn.innerHTML = '⏸️';
            };

            utterance.onend = () => {
                isPlaying = false;
                ttsBtn.innerHTML = '🔊';
            };

            speechSynthesis.speak(utterance);
        });
    }

    // AI-generated content summary
    addSmartSummary() {
        const summaryBtn = this.createToggleButton('📝', 'Smart Summary', 'summary');

        summaryBtn.addEventListener('click', () => {
            this.generateSmartSummary();
        });
    }

    generateSmartSummary() {
        const content = document.querySelector('main, article, .content, .post-content');
        if (!content) return;

        const text = content.textContent;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

        // Simple extractive summarization algorithm
        const summary = this.extractKeyPoints(sentences, text);

        this.showSummaryModal(summary);
    }

    extractKeyPoints(sentences, fullText) {
        const words = fullText.toLowerCase().split(/\s+/);
        const wordFreq = {};

        // Calculate word frequency (excluding common words)
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must']);

        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
            }
        });

        // Score sentences based on word frequency
        const sentenceScores = sentences.map(sentence => {
            const sentenceWords = sentence.toLowerCase().split(/\s+/);
            let score = 0;
            sentenceWords.forEach(word => {
                const cleanWord = word.replace(/[^\w]/g, '');
                score += wordFreq[cleanWord] || 0;
            });
            return { sentence: sentence.trim(), score: score / sentenceWords.length };
        });

        // Return top 3 sentences
        return sentenceScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.sentence);
    }

    showSummaryModal(keyPoints) {
        const modal = document.createElement('div');
        modal.className = 'summary-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📝 Article Summary</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="key-points">
                        ${keyPoints.map(point => `<div class="key-point">• ${point}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Reading speed optimization
    setupReadingSpeedOptimization() {
        this.trackReadingSpeed();
        this.addSpeedControls();
    }

    trackReadingSpeed() {
        let startTime = Date.now();
        let wordsRead = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const words = entry.target.textContent.split(/\s+/).length;
                    wordsRead += words;

                    const timeSpent = (Date.now() - startTime) / 1000 / 60; // minutes
                    const currentSpeed = Math.round(wordsRead / timeSpent);

                    if (timeSpent > 0.5) { // Only after 30 seconds
                        this.readingProfile.wordsPerMinute = currentSpeed;
                        this.saveReadingProfile();
                    }
                }
            });
        }, { threshold: 0.8 });

        document.querySelectorAll('p').forEach(p => observer.observe(p));
    }

    // Helper methods
    createToggleButton(icon, title, id) {
        let toolbar = document.querySelector('.reading-toolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'reading-toolbar';
            document.body.appendChild(toolbar);
        }

        const button = document.createElement('button');
        button.className = 'reading-tool-btn';
        button.innerHTML = icon;
        button.title = title;
        button.id = id;

        toolbar.appendChild(button);
        return button;
    }

    extractReadableText(element) {
        // Remove code blocks and other non-readable content
        const clone = element.cloneNode(true);
        clone.querySelectorAll('pre, code, .highlight').forEach(el => el.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }

    loadReadingProfile() {
        return JSON.parse(localStorage.getItem('reading_profile') || '{}');
    }

    saveReadingProfile() {
        localStorage.setItem('reading_profile', JSON.stringify(this.readingProfile));
    }

    savePreference(key, value) {
        this.readingProfile[key] = value;
        this.saveReadingProfile();
    }

    getTextPosition(range) {
        // Simple position tracking for highlights
        return {
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            startContainer: range.startContainer.textContent.substring(0, 50)
        };
    }

    loadHighlights(highlights) {
        // Load saved highlights (simplified implementation)
        highlights.forEach(highlight => {
            // In a real implementation, this would restore highlights by text matching
            console.log('Saved highlight:', highlight);
        });
    }

    addReadingGuides() {
        // Add subtle reading guides for better eye tracking
        const style = document.createElement('style');
        style.textContent = `
            .smart-reading-mode p {
                position: relative;
            }

            .smart-reading-mode p:hover::before {
                content: '';
                position: absolute;
                left: -5px;
                top: 0;
                bottom: 0;
                width: 3px;
                background: var(--accent-color);
                opacity: 0.3;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    highlightKeyContent() {
        // Simple keyword highlighting
        const keywordPattern = /\b(important|key|crucial|essential|significant|note|warning|tip)\b/gi;

        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.match(keywordPattern)) {
                p.style.background = 'linear-gradient(90deg, transparent 0%, rgba(108, 99, 255, 0.1) 50%, transparent 100%)';
                p.style.padding = '0.5em';
                p.style.borderRadius = '4px';
            }
        });
    }

    addContentAdaptation() {
        // Adapt content based on user preferences and reading behavior
        const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
        const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (darkModePreference.matches && !document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        if (reducedMotionPreference.matches) {
            document.body.classList.add('reduced-motion');
        }
    }
}

// Initialize AI Reading Experience
window.addEventListener('DOMContentLoaded', () => {
    window.AIReading = new AIReadingExperience();
});
