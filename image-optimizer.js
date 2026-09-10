// ============================================
// IMAGE OPTIMIZER & LAZY LOADING INITIALIZER
// Auto-converts images to lazy loading format
// ============================================

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        lazyLoadThreshold: 300, // pixels from viewport
        placeholderQuality: 20, // for blur-up effect
        enableWebP: true,
        enableProgressiveLoading: true
    };
    
    /**
     * Initialize lazy loading for all images
     */
    function initLazyLoading() {
        const images = document.querySelectorAll('img:not([data-no-lazy])');
        
        images.forEach((img, index) => {
            // Skip if already processed
            if (img.hasAttribute('data-lazy-processed')) return;
            
            // Skip small images (like icons)
            if (img.width < 50 && img.height < 50) return;
            
            // Skip images that are already loaded
            if (img.complete && img.naturalWidth > 0) {
                img.classList.add('lazy-loaded');
                return;
            }
            
            const originalSrc = img.src || img.getAttribute('data-src');
            if (!originalSrc) return;
            
            // Add loading attribute for native lazy loading
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }
            
            // Add dimensions to prevent layout shift
            if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
                img.style.aspectRatio = img.naturalWidth && img.naturalHeight 
                    ? `${img.naturalWidth} / ${img.naturalHeight}` 
                    : 'auto';
            }
            
            // Add decode attribute for better performance
            img.decoding = 'async';
            
            // Mark as processed
            img.setAttribute('data-lazy-processed', 'true');
            
            // Add intersection observer for fade-in effect
            if (window.IntersectionObserver) {
                observeImage(img);
            }
        });
    }
    
    /**
     * Observe image with Intersection Observer
     */
    function observeImage(img) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: `${CONFIG.lazyLoadThreshold}px`
        });
        
        observer.observe(img);
    }
    
    /**
     * Create low-quality placeholder for progressive loading
     */
    function createPlaceholder(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 40;
        canvas.height = 40;
        
        ctx.drawImage(img, 0, 0, 40, 40);
        
        return canvas.toDataURL('image/jpeg', CONFIG.placeholderQuality / 100);
    }
    
    /**
     * Preload critical images (above the fold)
     */
    function preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('[data-critical]');
        
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src || img.dataset.src;
            
            // Add media query for responsive images
            if (img.dataset.srcset) {
                link.setAttribute('imagesrcset', img.dataset.srcset);
            }
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Add responsive image srcset automatically
     */
    function addResponsiveSrcset(img) {
        const src = img.src || img.dataset.src;
        if (!src) return;
        
        // Generate srcset for common sizes
        const sizes = [320, 640, 768, 1024, 1366, 1920];
        const ext = src.split('.').pop();
        const basePath = src.replace(`.${ext}`, '');
        
        const srcset = sizes
            .map(size => `${basePath}-${size}w.${ext} ${size}w`)
            .join(', ');
        
        // Only add if files likely exist
        if (img.dataset.responsive === 'true') {
            img.srcset = srcset;
            img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
        }
    }
    
    /**
     * Monitor image loading performance
     */
    function monitorImagePerformance() {
        if (!window.PerformanceObserver) return;
        
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.initiatorType === 'img') {
                    console.log(`Image loaded: ${entry.name}`);
                    console.log(`  Duration: ${entry.duration.toFixed(2)}ms`);
                    console.log(`  Size: ${(entry.transferSize / 1024).toFixed(2)}KB`);
                    
                    // Warn about large images
                    if (entry.transferSize > 500000) { // 500KB
                        console.warn(`⚠️ Large image detected (${(entry.transferSize / 1024).toFixed(2)}KB): ${entry.name}`);
                    }
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
    
    /**
     * Handle broken images gracefully
     */
    function handleBrokenImages() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                const img = e.target;
                
                // Add error class for styling
                img.classList.add('image-error');
                
                // Set fallback placeholder
                if (!img.dataset.fallbackSet) {
                    const placeholder = createFallbackSVG(img.alt || 'Image');
                    img.src = placeholder;
                    img.dataset.fallbackSet = 'true';
                }
            }
        }, true);
    }
    
    /**
     * Create SVG fallback for broken images
     */
    function createFallbackSVG(text) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect fill="#001A3F" width="300" height="200"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                      font-family="Arial" font-size="14" fill="#D4AF37">
                    ${text}
                </text>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    /**
     * Initialize everything when DOM is ready
     */
    function init() {
        // Initialize lazy loading
        initLazyLoading();
        
        // Preload critical images
        preloadCriticalImages();
        
        // Handle broken images
        handleBrokenImages();
        
        // Monitor performance (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            monitorImagePerformance();
        }
        
        // Re-initialize on dynamic content
        const contentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    initLazyLoading();
                }
            });
        });
        
        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Image optimizer initialized');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
