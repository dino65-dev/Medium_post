/**
 * Advanced Analytics & Performance Monitoring System
 * Tracks user behavior, performance metrics, and engagement
 */

class AdvancedAnalytics {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            pageViews: [],
            interactions: [],
            readingTime: {},
            scrollDepth: {},
            performance: {}
        };
        
        this.init();
    }

    init() {
        this.trackPageLoad();
        this.trackScrollBehavior();
        this.trackReadingTime();
        this.trackInteractions();
        this.trackPerformance();
        this.setupHeatmap();
        this.trackUserEngagement();
    }

    // Performance monitoring
    trackPageLoad() {
        window.addEventListener('load', () => {
            const nav = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            this.sessionData.performance = {
                loadTime: nav.loadEventEnd - nav.loadEventStart,
                domComplete: nav.domComplete - nav.navigationStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                connectionType: navigator.connection?.effectiveType || 'unknown'
            };

            this.sendAnalytics('page_load', this.sessionData.performance);
        });
    }

    // Advanced scroll tracking with reading zones
    trackScrollBehavior() {
        let scrollDepth = 0;
        let readingZones = new Map();
        
        const throttledScroll = this.throttle(() => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const currentDepth = Math.round((scrolled / total) * 100);
            
            if (currentDepth > scrollDepth) {
                scrollDepth = currentDepth;
                this.sessionData.scrollDepth[Date.now()] = currentDepth;
            }

            // Track reading zones (paragraphs, code blocks, etc.)
            this.trackVisibleContent();
            
        }, 250);

        window.addEventListener('scroll', throttledScroll);
    }

    // Reading time estimation with AI-powered content analysis
    trackReadingTime() {
        const content = document.querySelector('main, article, .content, .post-content');
        if (!content) return;

        const text = content.textContent || '';
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const codeBlocks = content.querySelectorAll('pre, code').length;
        const images = content.querySelectorAll('img').length;
        
        // Advanced reading time calculation
        const wordsPerMinute = 200;
        const codeReadingFactor = 30; // seconds per code block
        const imageViewingTime = 12; // seconds per image
        
        const estimatedTime = Math.ceil(
            (wordCount / wordsPerMinute) + 
            (codeBlocks * codeReadingFactor / 60) + 
            (images * imageViewingTime / 60)
        );

        this.sessionData.readingTime = {
            estimated: estimatedTime,
            actual: 0,
            wordCount,
            codeBlocks,
            images,
            startTime: Date.now()
        };

        // Track actual reading time
        let visibilityTime = 0;
        let lastVisible = Date.now();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                visibilityTime += Date.now() - lastVisible;
            } else {
                lastVisible = Date.now();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (!document.hidden) {
                visibilityTime += Date.now() - lastVisible;
            }
            this.sessionData.readingTime.actual = Math.round(visibilityTime / 1000 / 60);
            this.sendAnalytics('reading_time', this.sessionData.readingTime);
        });
    }

    // Track user interactions with micro-animations feedback
    trackInteractions() {
        const interactionEvents = ['click', 'dblclick', 'contextmenu', 'keydown'];
        
        interactionEvents.forEach(event => {
            document.addEventListener(event, (e) => {
                const interaction = {
                    type: event,
                    timestamp: Date.now(),
                    element: e.target.tagName,
                    className: e.target.className,
                    id: e.target.id,
                    position: { x: e.clientX, y: e.clientY }
                };

                this.sessionData.interactions.push(interaction);
                this.addInteractionRipple(e);
                
                // Send high-value interactions immediately
                if (['click', 'dblclick'].includes(event)) {
                    this.sendAnalytics('interaction', interaction);
                }
            });
        });
    }

    // Visual feedback for interactions
    addInteractionRipple(event) {
        if (event.type !== 'click') return;
        
        const ripple = document.createElement('div');
        ripple.className = 'interaction-ripple';
        ripple.style.cssText = `
            position: fixed;
            left: ${event.clientX - 10}px;
            top: ${event.clientY - 10}px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--accent-color, #6c63ff);
            opacity: 0.6;
            transform: scale(0);
            pointer-events: none;
            z-index: 9999;
            animation: rippleEffect 0.6s ease-out forwards;
        `;

        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Track which content sections are being viewed
    trackVisibleContent() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const type = this.getElementType(element);
                    
                    this.sendAnalytics('content_view', {
                        type,
                        id: element.id,
                        className: element.className,
                        timestamp: Date.now(),
                        scrollPosition: window.scrollY
                    });
                }
            });
        }, { threshold: 0.5 });

        // Observe important content sections
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .highlight, img, blockquote')
            .forEach(el => observer.observe(el));
    }

    // AI-powered user engagement scoring
    trackUserEngagement() {
        let engagementScore = 0;
        const factors = {
            scrollDepth: 0,
            timeSpent: 0,
            interactions: 0,
            returnVisitor: localStorage.getItem('return_visitor') ? 10 : 0
        };

        setInterval(() => {
            // Calculate engagement score
            const currentScroll = Math.max(...Object.values(this.sessionData.scrollDepth));
            const timeSpent = (Date.now() - this.sessionData.startTime) / 1000 / 60;
            const interactions = this.sessionData.interactions.length;

            factors.scrollDepth = Math.min(currentScroll * 0.3, 30);
            factors.timeSpent = Math.min(timeSpent * 5, 25);
            factors.interactions = Math.min(interactions * 2, 20);

            engagementScore = Object.values(factors).reduce((a, b) => a + b, 0);

            this.displayEngagementIndicator(engagementScore);
        }, 5000);

        localStorage.setItem('return_visitor', 'true');
    }

    // Visual engagement indicator
    displayEngagementIndicator(score) {
        let indicator = document.getElementById('engagement-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'engagement-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: conic-gradient(var(--accent-color) ${score * 3.6}deg, #e0e0e0 0deg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: var(--text-primary);
                z-index: 1000;
                transition: all 0.3s ease;
                opacity: 0.8;
            `;
            document.body.appendChild(indicator);
        }

        indicator.textContent = Math.round(score);
        indicator.style.background = `conic-gradient(var(--accent-color) ${score * 3.6}deg, #e0e0e0 0deg)`;
    }

    // Heatmap generation for click tracking
    setupHeatmap() {
        const heatmapData = JSON.parse(localStorage.getItem('heatmap_data') || '[]');
        
        document.addEventListener('click', (e) => {
            const x = Math.round((e.clientX / window.innerWidth) * 100);
            const y = Math.round((e.clientY / window.innerHeight) * 100);
            
            heatmapData.push({ x, y, timestamp: Date.now() });
            
            // Keep only last 1000 clicks
            if (heatmapData.length > 1000) {
                heatmapData.splice(0, heatmapData.length - 1000);
            }
            
            localStorage.setItem('heatmap_data', JSON.stringify(heatmapData));
        });
    }

    // Helper methods
    getElementType(element) {
        if (element.tagName.match(/H[1-6]/)) return 'heading';
        if (element.className.includes('highlight')) return 'code';
        if (element.tagName === 'IMG') return 'image';
        if (element.tagName === 'BLOCKQUOTE') return 'quote';
        return 'text';
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Send analytics data (can be connected to various services)
    sendAnalytics(event, data) {
        // Store locally for now (can be sent to Google Analytics, Mixpanel, etc.)
        const analyticsData = JSON.parse(localStorage.getItem('analytics_data') || '[]');
        analyticsData.push({
            event,
            data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // Keep only last 500 events
        if (analyticsData.length > 500) {
            analyticsData.splice(0, analyticsData.length - 500);
        }
        
        localStorage.setItem('analytics_data', JSON.stringify(analyticsData));

        // Send to external analytics service if configured
        if (window.gtag) {
            window.gtag('event', event, data);
        }
    }

    // Export analytics data
    exportData() {
        const data = {
            session: this.sessionData,
            stored: JSON.parse(localStorage.getItem('analytics_data') || '[]'),
            heatmap: JSON.parse(localStorage.getItem('heatmap_data') || '[]')
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Add CSS for ripple effect
const rippleCSS = `
@keyframes rippleEffect {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

#engagement-indicator {
    cursor: pointer;
}

#engagement-indicator:hover {
    transform: scale(1.1);
    opacity: 1;
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize analytics
window.addEventListener('DOMContentLoaded', () => {
    window.BlogAnalytics = new AdvancedAnalytics();
    
    // Add export functionality for development
    if (window.location.search.includes('analytics=true')) {
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export Analytics';
        exportBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 10px;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        exportBtn.onclick = () => window.BlogAnalytics.exportData();
        document.body.appendChild(exportBtn);
    }
});
