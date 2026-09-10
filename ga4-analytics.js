// ============================================
// GOOGLE ANALYTICS 4 (GA4) INTEGRATION
// ============================================

/**
 * تهيئة Google Analytics 4
 * استبدل 'G-XXXXXXXXXX' بمعرّف القياس الخاص بك من Google Analytics
 */

// Configuration
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // 🔴 استبدل هذا بمعرفك من GA4

// Load GA4 Script
(function() {
    // Check if user has consented to analytics
    const analyticsConsent = localStorage.getItem('analytics-consent');
    
    if (analyticsConsent === 'accepted') {
        loadGA4();
    }
})();

/**
 * تحميل سكريبت GA4
 */
function loadGA4() {
    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
        'anonymize_ip': true, // احترام الخصوصية
        'cookie_flags': 'SameSite=None;Secure',
        'page_path': window.location.pathname
    });
    
    console.log('✅ Google Analytics 4 loaded');
    
    // Setup event tracking
    setupEventTracking();
}

/**
 * تتبع الأحداث التلقائي
 */
function setupEventTracking() {
    // Track download button clicks
    document.querySelectorAll('.btn-primary, .download-btn, [href*="play.google"], [href*="apps.apple"], [href*="appgallery"]').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonHref = this.getAttribute('href') || '';
            
            let store = 'unknown';
            if (buttonHref.includes('play.google')) store = 'Google Play';
            else if (buttonHref.includes('apps.apple')) store = 'App Store';
            else if (buttonHref.includes('appgallery')) store = 'Huawei AppGallery';
            
            trackEvent('download_click', {
                'button_text': buttonText,
                'store': store,
                'page_location': window.location.pathname
            });
        });
    });
    
    // Track external links
    document.querySelectorAll('a[href^="http"]:not([href*="siraj-al"])').forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('external_link_click', {
                'link_url': this.href,
                'link_text': this.textContent.trim()
            });
        });
    });
    
    // Track social media clicks
    document.querySelectorAll('.nav-social-link, [href*="instagram"], [href*="facebook"], [href*="t.me"]').forEach(link => {
        link.addEventListener('click', function() {
            const url = this.href;
            let platform = 'unknown';
            
            if (url.includes('instagram')) platform = 'Instagram';
            else if (url.includes('facebook')) platform = 'Facebook';
            else if (url.includes('t.me')) platform = 'Telegram';
            
            trackEvent('social_click', {
                'platform': platform,
                'link_url': url
            });
        });
    });
    
    // Track section views (Intersection Observer)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.className;
                trackEvent('section_view', {
                    'section_name': sectionId
                });
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Track video plays (if any)
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('play', function() {
            trackEvent('video_play', {
                'video_title': this.title || 'untitled'
            });
        });
    });
    
    // Track feature card clicks
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const featureTitle = this.querySelector('.feature-title')?.textContent || 'unknown';
            trackEvent('feature_click', {
                'feature_name': featureTitle
            });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 100];
    let trackedMilestones = [];
    
    window.addEventListener('scroll', debounce(function() {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
        }
        
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                trackedMilestones.push(milestone);
                trackEvent('scroll_depth', {
                    'percent': milestone
                });
            }
        });
    }, 500));
    
    // Track time on page (when user leaves)
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
        trackEvent('time_on_page', {
            'duration_seconds': timeSpent,
            'page_path': window.location.pathname
        });
    });
}

/**
 * تتبع حدث مخصص
 * @param {string} eventName - اسم الحدث
 * @param {object} eventParams - معاملات الحدث
 */
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
        console.log(`📊 Event tracked: ${eventName}`, eventParams);
    }
}

/**
 * تتبع صفحة جديدة (للـ SPA)
 * @param {string} pagePath - مسار الصفحة
 * @param {string} pageTitle - عنوان الصفحة
 */
function trackPageView(pagePath, pageTitle) {
    if (typeof gtag !== 'undefined') {
        gtag('config', GA4_MEASUREMENT_ID, {
            'page_path': pagePath,
            'page_title': pageTitle
        });
        console.log(`📄 Page view tracked: ${pagePath}`);
    }
}

/**
 * Debounce helper
 */
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

// Export functions for external use
window.trackEvent = trackEvent;
window.trackPageView = trackPageView;
window.loadGA4 = loadGA4;

// ============================================
// ALTERNATIVE: PLAUSIBLE ANALYTICS (Privacy-Friendly)
// ============================================

/**
 * إذا كنت تفضل Plausible Analytics (أكثر احتراماً للخصوصية)
 * غير معلق الكود أدناه واستبدل 'siraj-al-athar.netlify.app' بنطاقك
 */

/*
(function() {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = 'siraj-al-athar.netlify.app'; // 🔴 استبدل بنطاقك
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
    
    // Custom event tracking with Plausible
    window.plausible = window.plausible || function() { 
        (window.plausible.q = window.plausible.q || []).push(arguments);
    };
    
    // Track custom events
    document.querySelectorAll('.btn-primary, .download-btn').forEach(button => {
        button.addEventListener('click', function() {
            window.plausible('Download Click', {
                props: { button: this.textContent.trim() }
            });
        });
    });
})();
*/
