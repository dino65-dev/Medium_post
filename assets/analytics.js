// Simple Analytics for GitHub Pages
// Privacy-focused, no external tracking

class SimpleAnalytics {
    constructor() {
        this.pageViews = this.getStoredData('pageViews') || {};
        this.sessionStart = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackTimeOnPage();
        this.trackScrollDepth();
        this.trackOutboundLinks();
    }

    getStoredData(key) {
        try {
            return JSON.parse(localStorage.getItem(`analytics_${key}`)) || {};
        } catch {
            return {};
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem(`analytics_${key}`, JSON.stringify(data));
        } catch (e) {
            console.warn('Analytics storage failed:', e);
        }
    }

    trackPageView() {
        const page = window.location.pathname;
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        if (!this.pageViews[page]) {
            this.pageViews[page] = {};
        }

        this.pageViews[page][now] = (this.pageViews[page][now] || 0) + 1;
        this.setStoredData('pageViews', this.pageViews);

        console.log(`Page view tracked: ${page}`);
    }

    trackTimeOnPage() {
        let timeSpent = 0;
        const interval = setInterval(() => {
            timeSpent += 5;
        }, 5000);

        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
            const page = window.location.pathname;
            const timeData = this.getStoredData('timeSpent');

            if (!timeData[page]) {
                timeData[page] = [];
            }

            timeData[page].push({
                date: new Date().toISOString(),
                seconds: timeSpent
            });

            // Keep only last 100 entries per page
            if (timeData[page].length > 100) {
                timeData[page] = timeData[page].slice(-100);
            }

            this.setStoredData('timeSpent', timeData);
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.offsetHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        };

        window.addEventListener('scroll', trackScroll);

        window.addEventListener('beforeunload', () => {
            if (maxScroll > 0) {
                const page = window.location.pathname;
                const scrollData = this.getStoredData('scrollDepth');

                if (!scrollData[page]) {
                    scrollData[page] = [];
                }

                scrollData[page].push({
                    date: new Date().toISOString(),
                    maxDepth: maxScroll
                });

                // Keep only last 50 entries per page
                if (scrollData[page].length > 50) {
                    scrollData[page] = scrollData[page].slice(-50);
                }

                this.setStoredData('scrollDepth', scrollData);
            }
        });
    }

    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hostname !== window.location.hostname) {
                const linkData = this.getStoredData('outboundLinks');
                const url = link.href;

                linkData[url] = (linkData[url] || 0) + 1;
                this.setStoredData('outboundLinks', linkData);

                console.log(`Outbound link clicked: ${url}`);
            }
        });
    }

    // Method to get analytics data (for debugging)
    getAnalytics() {
        return {
            pageViews: this.pageViews,
            timeSpent: this.getStoredData('timeSpent'),
            scrollDepth: this.getStoredData('scrollDepth'),
            outboundLinks: this.getStoredData('outboundLinks')
        };
    }

    // Method to clear all analytics data
    clearAnalytics() {
        localStorage.removeItem('analytics_pageViews');
        localStorage.removeItem('analytics_timeSpent');
        localStorage.removeItem('analytics_scrollDepth');
        localStorage.removeItem('analytics_outboundLinks');
        this.pageViews = {};
        console.log('Analytics data cleared');
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new SimpleAnalytics();
});

// Export for console access
window.SimpleAnalytics = SimpleAnalytics;
