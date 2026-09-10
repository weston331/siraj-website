// ============================================
// ANALYTICS & PERFORMANCE MONITORING SYSTEM
// Siraj Al-Athar - v2.1
// ============================================

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        enableAnalytics: true,
        enableWebVitals: true,
        enableErrorTracking: true,
        enableUserBehavior: true,
        sampleRate: 1.0, // 100% of users (adjust for production)
        debug: window.location.hostname === 'localhost'
    };
    
    // Analytics data queue
    let analyticsQueue = [];
    let sessionId = generateSessionId();
    let pageViewId = generateUUID();
    
    /**
     * Initialize Analytics System
     */
    function init() {
        console.log('🔍 Analytics & Monitoring initialized');
        
        // Track page view
        trackPageView();
        
        // Initialize Web Vitals monitoring
        if (CONFIG.enableWebVitals) {
            initWebVitals();
        }
        
        // Track user behavior
        if (CONFIG.enableUserBehavior) {
            trackUserBehavior();
        }
        
        // Error tracking
        if (CONFIG.enableErrorTracking) {
            initErrorTracking();
        }
        
        // Track session time
        trackSessionTime();
        
        // Send analytics before page unload
        window.addEventListener('beforeunload', sendQueuedAnalytics);
    }
    
    // ============================================
    // WEB VITALS MONITORING
    // ============================================
    
    /**
     * Initialize Core Web Vitals monitoring
     */
    function initWebVitals() {
        // Largest Contentful Paint (LCP)
        observeLCP();
        
        // First Input Delay (FID)
        observeFID();
        
        // Cumulative Layout Shift (CLS)
        observeCLS();
        
        // First Contentful Paint (FCP)
        observeFCP();
        
        // Time to First Byte (TTFB)
        observeTTFB();
        
        // Time to Interactive (TTI)
        observeTTI();
    }
    
    /**
     * Observe Largest Contentful Paint (LCP)
     * Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
     */
    function observeLCP() {
        if (!window.PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                const lcp = lastEntry.renderTime || lastEntry.loadTime;
                
                trackMetric({
                    name: 'LCP',
                    value: lcp,
                    rating: getRating('LCP', lcp),
                    element: lastEntry.element ? getSelector(lastEntry.element) : 'unknown'
                });
                
                if (CONFIG.debug) {
                    console.log(`📊 LCP: ${lcp.toFixed(2)}ms`, {
                        rating: getRating('LCP', lcp),
                        element: lastEntry.element
                    });
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.error('LCP observation failed:', e);
        }
    }
    
    /**
     * Observe First Input Delay (FID)
     * Good: < 100ms, Needs Improvement: 100ms - 300ms, Poor: > 300ms
     */
    function observeFID() {
        if (!window.PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    const fid = entry.processingStart - entry.startTime;
                    
                    trackMetric({
                        name: 'FID',
                        value: fid,
                        rating: getRating('FID', fid),
                        eventType: entry.name
                    });
                    
                    if (CONFIG.debug) {
                        console.log(`📊 FID: ${fid.toFixed(2)}ms`, {
                            rating: getRating('FID', fid),
                            eventType: entry.name
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.error('FID observation failed:', e);
        }
    }
    
    /**
     * Observe Cumulative Layout Shift (CLS)
     * Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
     */
    function observeCLS() {
        if (!window.PerformanceObserver) return;
        
        let clsScore = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach((entry) => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                        
                        // Start new session if gap > 1s or total > 5s
                        if (sessionValue && (
                            (lastSessionEntry && entry.startTime - lastSessionEntry.startTime > 1000) ||
                            (firstSessionEntry && entry.startTime - firstSessionEntry.startTime > 5000)
                        )) {
                            
                            sessionValue = 0;
                            sessionEntries = [];
                        }
                        
                        sessionEntries.push({
                            value: entry.value,
                            startTime: entry.startTime
                        });
                        
                        sessionValue += entry.value;
                        clsScore = Math.max(clsScore, sessionValue);
                    }
                });
                
                trackMetric({
                    name: 'CLS',
                    value: clsScore,
                    rating: getRating('CLS', clsScore)
                });
                
                if (CONFIG.debug) {
                    console.log(`📊 CLS: ${clsScore.toFixed(3)}`, {
                        rating: getRating('CLS', clsScore)
                    });
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.error('CLS observation failed:', e);
        }
    }
    
    /**
     * Observe First Contentful Paint (FCP)
     */
    function observeFCP() {
        if (!window.PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        trackMetric({
                            name: 'FCP',
                            value: entry.startTime,
                            rating: getRating('FCP', entry.startTime)
                        });
                        
                        if (CONFIG.debug) {
                            console.log(`📊 FCP: ${entry.startTime.toFixed(2)}ms`);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.error('FCP observation failed:', e);
        }
    }
    
    /**
     * Observe Time to First Byte (TTFB)
     */
    function observeTTFB() {
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
                
                trackMetric({
                    name: 'TTFB',
                    value: ttfb,
                    rating: getRating('TTFB', ttfb)
                });
                
                if (CONFIG.debug) {
                    console.log(`📊 TTFB: ${ttfb.toFixed(2)}ms`);
                }
            }
        });
    }
    
    /**
     * Observe Time to Interactive (TTI)
     */
    function observeTTI() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const tti = performance.now();
                
                trackMetric({
                    name: 'TTI',
                    value: tti,
                    rating: getRating('TTI', tti)
                });
                
                if (CONFIG.debug) {
                    console.log(`📊 TTI: ${tti.toFixed(2)}ms`);
                }
            }, 0);
        });
    }
    
    /**
     * Get rating for metric value
     */
    function getRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            FCP: { good: 1800, needsImprovement: 3000 },
            TTFB: { good: 800, needsImprovement: 1800 },
            TTI: { good: 3800, needsImprovement: 7300 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }
    
    // ============================================
    // USER BEHAVIOR TRACKING
    // ============================================
    
    /**
     * Track user interactions and behavior
     */
    function trackUserBehavior() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button, [role="button"]');
            if (!target) return;
            
            trackEvent({
                category: 'User Interaction',
                action: 'click',
                label: getElementLabel(target),
                value: target.href || target.textContent.trim()
            });
        });
        
        // Track scroll depth
        trackScrollDepth();
        
        // Track time on page
        trackTimeOnPage();
        
        // Track engagement
        trackEngagement();
    }
    
    /**
     * Track scroll depth
     */
    function trackScrollDepth() {
        const thresholds = [25, 50, 75, 90, 100];
        const reached = new Set();
        
        window.addEventListener('scroll', debounce(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !reached.has(threshold)) {
                    reached.add(threshold);
                    
                    trackEvent({
                        category: 'Scroll Depth',
                        action: 'scroll',
                        label: `${threshold}%`,
                        value: threshold
                    });
                }
            });
        }, 500));
    }
    
    /**
     * Track time on page
     */
    function trackTimeOnPage() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            
            trackEvent({
                category: 'Engagement',
                action: 'time_on_page',
                label: document.title,
                value: timeSpent
            });
        });
    }
    
    /**
     * Track user engagement
     */
    function trackEngagement() {
        let isEngaged = false;
        let engagementStart = null;
        
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (!isEngaged) {
                    isEngaged = true;
                    engagementStart = Date.now();
                }
            });
        });
        
        // Check engagement every 30 seconds
        setInterval(() => {
            if (isEngaged && engagementStart) {
                const engagementTime = Math.round((Date.now() - engagementStart) / 1000);
                
                trackEvent({
                    category: 'Engagement',
                    action: 'engaged_time',
                    label: 'session',
                    value: engagementTime
                });
                
                isEngaged = false;
                engagementStart = null;
            }
        }, 30000);
    }
    
    // ============================================
    // ERROR TRACKING
    // ============================================
    
    /**
     * Initialize error tracking
     */
    function initErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            trackError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });
        
        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            trackError({
                type: 'promise',
                message: event.reason ? event.reason.message : 'Unhandled Promise Rejection',
                stack: event.reason ? event.reason.stack : null
            });
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                trackError({
                    type: 'resource',
                    message: `Failed to load: ${event.target.src || event.target.href}`,
                    element: event.target.tagName
                });
            }
        }, true);
    }
    
    // ============================================
    // TRACKING FUNCTIONS
    // ============================================
    
    /**
     * Track page view
     */
    function trackPageView() {
        const data = {
            type: 'pageview',
            sessionId: sessionId,
            pageViewId: pageViewId,
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            connection: getConnectionInfo()
        };
        
        queueAnalytics(data);
        
        if (CONFIG.debug) {
            console.log('📄 Page View:', data);
        }
    }
    
    /**
     * Track custom event
     */
    function trackEvent(event) {
        const data = {
            type: 'event',
            sessionId: sessionId,
            pageViewId: pageViewId,
            ...event,
            timestamp: Date.now()
        };
        
        queueAnalytics(data);
        
        if (CONFIG.debug) {
            console.log('📊 Event:', data);
        }
    }
    
    /**
     * Track metric (Web Vitals)
     */
    function trackMetric(metric) {
        const data = {
            type: 'metric',
            sessionId: sessionId,
            pageViewId: pageViewId,
            ...metric,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        queueAnalytics(data);
    }
    
    /**
     * Track error
     */
    function trackError(error) {
        const data = {
            type: 'error',
            sessionId: sessionId,
            pageViewId: pageViewId,
            ...error,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        queueAnalytics(data);
        
        if (CONFIG.debug) {
            console.error('❌ Error Tracked:', data);
        }
    }
    
    /**
     * Track session time
     */
    function trackSessionTime() {
        const startTime = Date.now();
        let lastActivityTime = startTime;
        
        // Update activity time on user interaction
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivityTime = Date.now();
            });
        });
        
        // Send session data periodically
        setInterval(() => {
            const sessionDuration = Date.now() - startTime;
            const activeTime = lastActivityTime - startTime;
            
            trackEvent({
                category: 'Session',
                action: 'duration',
                label: 'ongoing',
                value: Math.round(sessionDuration / 1000),
                metadata: {
                    activeTime: Math.round(activeTime / 1000)
                }
            });
        }, 60000); // Every minute
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function queueAnalytics(data) {
        analyticsQueue.push(data);
        
        // Send if queue is large enough
        if (analyticsQueue.length >= 10) {
            sendQueuedAnalytics();
        }
    }
    
    function sendQueuedAnalytics() {
        if (analyticsQueue.length === 0) return;
        
        const data = [...analyticsQueue];
        analyticsQueue = [];
        
        // Send to your analytics endpoint (only over HTTP/HTTPS)
        if (location.protocol.startsWith('http')) {
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics', JSON.stringify(data));
                } else {
                    // Fallback to fetch
                    fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                        keepalive: true
                    }).catch(() => {});
                }
            } catch(e) {}
        }
        
        if (CONFIG.debug) {
            console.log('📤 Analytics sent:', data.length, 'events');
        }
    }
    
    function getElementLabel(element) {
        return element.getAttribute('aria-label') ||
               element.getAttribute('title') ||
               element.textContent.trim().substring(0, 50) ||
               element.getAttribute('href') ||
               'unknown';
    }
    
    function getSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }
    
    function getConnectionInfo() {
        if (!navigator.connection) return {};
        
        return {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        };
    }
    
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    function debounce(func, wait) {
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
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose tracking functions globally
    window.sirajAnalytics = {
        trackEvent,
        trackError,
        trackMetric
    };
    
})();
