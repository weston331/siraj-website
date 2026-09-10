// ============================================
// ACCESSIBILITY ENHANCEMENTS (WCAG 2.1 AA)
// Siraj Al-Athar - v2.1
// ============================================

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        enableSkipLinks: true,
        enableFocusManagement: true,
        enableKeyboardNavigation: true,
        enableScreenReaderAnnouncements: true,
        enableColorContrastCheck: false, // Only for development
        debug: window.location.hostname === 'localhost'
    };
    
    /**
     * Initialize Accessibility Features
     */
    function init() {
        console.log('♿ Accessibility enhancements initialized');
        
        // Add skip links
        if (CONFIG.enableSkipLinks) {
            addSkipLinks();
        }
        
        // Enhance focus management
        if (CONFIG.enableFocusManagement) {
            enhanceFocusManagement();
        }
        
        // Improve keyboard navigation
        if (CONFIG.enableKeyboardNavigation) {
            improveKeyboardNavigation();
        }
        
        // Screen reader announcements
        if (CONFIG.enableScreenReaderAnnouncements) {
            initScreenReaderAnnouncements();
        }
        
        // Add ARIA attributes dynamically
        enhanceARIA();
        
        // Improve form accessibility
        improveFormAccessibility();
        
        // Add landmark roles
        addLandmarkRoles();
        
        // Handle reduced motion
        handleReducedMotion();
        
        // Check color contrast (dev only)
        if (CONFIG.debug && CONFIG.enableColorContrastCheck) {
            checkColorContrast();
        }
    }
    
    // ============================================
    // SKIP LINKS
    // ============================================
    
    /**
     * Add skip links for keyboard navigation
     */
    function addSkipLinks() {
        const skipNav = document.createElement('div');
        skipNav.className = 'skip-links';
        skipNav.innerHTML = `
            <a href="#main-content" class="skip-link">الانتقال إلى المحتوى الرئيسي</a>
            <a href="#nav" class="skip-link">الانتقال إلى القائمة</a>
            <a href="#download" class="skip-link">الانتقال إلى التحميل</a>
        `;
        
        document.body.insertBefore(skipNav, document.body.firstChild);
        
        // Add target IDs if they don't exist
        const mainContent = document.querySelector('.hero-content') || document.querySelector('main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        const nav = document.querySelector('.navbar') || document.querySelector('nav');
        if (nav && !nav.id) {
            nav.id = 'nav';
        }
        
        if (CONFIG.debug) {
            console.log('✓ Skip links added');
        }
    }
    
    // ============================================
    // FOCUS MANAGEMENT
    // ============================================
    
    /**
     * Enhance focus management
     */
    function enhanceFocusManagement() {
        // Track keyboard vs mouse usage
        let isUsingKeyboard = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Trap focus in modals (if any)
        document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
            trapFocus(modal);
        });
        
        // Add visible focus indicators
        addFocusStyles();
        
        // Manage focus when content changes
        observeFocusableElements();
        
        if (CONFIG.debug) {
            console.log('✓ Focus management enhanced');
        }
    }
    
    /**
     * Add visible focus styles
     */
    function addFocusStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Keyboard navigation focus styles */
            .keyboard-navigation *:focus {
                outline: 3px solid #D4AF37 !important;
                outline-offset: 2px !important;
            }
            
            /* Skip links - hidden off-screen until focused */
            .skip-links {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                pointer-events: none;
                z-index: 10000;
            }
            
            .skip-link {
                position: fixed;
                top: -120px;
                left: 50%;
                transform: translateX(-50%);
                background: #D4AF37;
                color: #001A3F;
                padding: 10px 20px;
                text-decoration: none;
                font-weight: 600;
                border-radius: 0 0 8px 8px;
                transition: top 0.25s ease;
                z-index: 10001;
                pointer-events: auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            .skip-link:focus {
                top: 0;
                outline: 3px solid #fff;
                outline-offset: 2px;
            }
            
            /* Focus within interactive elements */
            .keyboard-navigation a:focus,
            .keyboard-navigation button:focus,
            .keyboard-navigation input:focus,
            .keyboard-navigation textarea:focus,
            .keyboard-navigation select:focus,
            .keyboard-navigation [tabindex="0"]:focus {
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.5) !important;
            }
            
            /* Remove focus outline for mouse users */
            body:not(.keyboard-navigation) *:focus {
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Trap focus within element
     */
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }
    
    /**
     * Observe focusable elements
     */
    function observeFocusableElements() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        enhanceElement(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    
    /**
     * Improve keyboard navigation
     */
    function improveKeyboardNavigation() {
        // Add keyboard support for interactive elements
        document.querySelectorAll('[role="button"]:not(button)').forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
        
        // Escape key to close modals/dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], .modal.open');
                openModals.forEach(modal => {
                    closeModal(modal);
                });
            }
        });
        
        // Arrow key navigation for carousels
        document.querySelectorAll('.screenshots-carousel, [role="region"]').forEach(carousel => {
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    handleCarouselNavigation(carousel, e.key);
                }
            });
        });
        
        if (CONFIG.debug) {
            console.log('✓ Keyboard navigation improved');
        }
    }
    
    /**
     * Handle carousel navigation
     */
    function handleCarouselNavigation(carousel, key) {
        const scrollAmount = 300;
        if (key === 'ArrowLeft') {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
    
    /**
     * Close modal and restore focus
     */
    function closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        
        // Restore focus to trigger element
        const triggerId = modal.dataset.triggeredBy;
        if (triggerId) {
            const trigger = document.getElementById(triggerId);
            if (trigger) trigger.focus();
        }
    }
    
    // ============================================
    // SCREEN READER ANNOUNCEMENTS
    // ============================================
    
    /**
     * Initialize screen reader announcements
     */
    function initScreenReaderAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
        
        // Create assertive live region for important announcements
        const assertiveRegion = document.createElement('div');
        assertiveRegion.setAttribute('role', 'alert');
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.id = 'assertive-region';
        document.body.appendChild(assertiveRegion);
        
        // Expose announce function globally
        window.announceToScreenReader = (message, assertive = false) => {
            const region = assertive ? assertiveRegion : liveRegion;
            region.textContent = message;
            
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        };
        
        if (CONFIG.debug) {
            console.log('✓ Screen reader announcements initialized');
        }
    }
    
    // ============================================
    // ARIA ENHANCEMENTS
    // ============================================
    
    /**
     * Enhance ARIA attributes
     */
    function enhanceARIA() {
        // Add ARIA labels to interactive elements without text
        document.querySelectorAll('a, button').forEach(element => {
            if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
                const title = element.getAttribute('title');
                if (title) {
                    element.setAttribute('aria-label', title);
                }
            }
        });
        
        // Add ARIA descriptions
        document.querySelectorAll('img').forEach(img => {
            if (!img.alt) {
                img.alt = img.title || 'صورة';
                console.warn('Image missing alt text:', img.src);
            }
        });
        
        // Enhance navigation
        const nav = document.querySelector('nav, .navbar');
        if (nav && !nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
        if (nav && !nav.hasAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'القائمة الرئيسية');
        }
        
        // Enhance buttons
        document.querySelectorAll('button, [role="button"]').forEach(button => {
            if (button.classList.contains('close') && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', 'إغلاق');
            }
        });
        
        if (CONFIG.debug) {
            console.log('✓ ARIA attributes enhanced');
        }
    }
    
    /**
     * Enhance specific element
     */
    function enhanceElement(element) {
        // Add appropriate ARIA attributes
        if (element.matches('[role="button"]') && !element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    }
    
    // ============================================
    // FORM ACCESSIBILITY
    // ============================================
    
    /**
     * Improve form accessibility
     */
    function improveFormAccessibility() {
        // Associate labels with inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (!input.id) {
                input.id = 'input-' + Math.random().toString(36).substr(2, 9);
            }
            
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
            
            // Add required indicator
            if (input.required && !input.getAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }
            
            // Add invalid state
            if (input.validity && !input.validity.valid) {
                input.setAttribute('aria-invalid', 'true');
            }
        });
        
        // Announce form errors
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const invalidInputs = form.querySelectorAll(':invalid');
                if (invalidInputs.length > 0) {
                    e.preventDefault();
                    const errorMessage = `يوجد ${invalidInputs.length} خطأ في النموذج. يرجى التحقق من الحقول المطلوبة.`;
                    window.announceToScreenReader(errorMessage, true);
                    invalidInputs[0].focus();
                }
            });
        });
        
        if (CONFIG.debug) {
            console.log('✓ Form accessibility improved');
        }
    }
    
    // ============================================
    // LANDMARK ROLES
    // ============================================
    
    /**
     * Add landmark roles
     */
    function addLandmarkRoles() {
        // Header
        const header = document.querySelector('header, .hero');
        if (header && !header.hasAttribute('role')) {
            header.setAttribute('role', 'banner');
        }
        
        // Main content
        const main = document.querySelector('main, .container');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        // Footer
        const footer = document.querySelector('footer, .footer');
        if (footer && !footer.hasAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
        
        // Sections
        document.querySelectorAll('section').forEach(section => {
            if (!section.hasAttribute('role') && !section.hasAttribute('aria-label')) {
                const heading = section.querySelector('h1, h2, h3');
                if (heading) {
                    section.setAttribute('aria-labelledby', heading.id || addIdToElement(heading));
                }
            }
        });
        
        if (CONFIG.debug) {
            console.log('✓ Landmark roles added');
        }
    }
    
    /**
     * Add ID to element
     */
    function addIdToElement(element) {
        const id = 'heading-' + Math.random().toString(36).substr(2, 9);
        element.id = id;
        return id;
    }
    
    // ============================================
    // REDUCED MOTION
    // ============================================
    
    /**
     * Handle reduced motion preference
     */
    function handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        function applyReducedMotion() {
            if (prefersReducedMotion.matches) {
                document.documentElement.classList.add('reduce-motion');
                
                // Disable smooth scrolling
                document.documentElement.style.scrollBehavior = 'auto';
                
                // Announce to screen reader
                if (CONFIG.debug) {
                    console.log('⚡ Reduced motion mode enabled');
                }
            } else {
                document.documentElement.classList.remove('reduce-motion');
                document.documentElement.style.scrollBehavior = 'smooth';
            }
        }
        
        applyReducedMotion();
        prefersReducedMotion.addEventListener('change', applyReducedMotion);
    }
    
    // ============================================
    // COLOR CONTRAST CHECK (DEV ONLY)
    // ============================================
    
    /**
     * Check color contrast ratios
     */
    function checkColorContrast() {
        // This is a simplified check - use tools like axe or Lighthouse for production
        console.log('🎨 Color contrast check (development mode)');
        
        document.querySelectorAll('*').forEach(element => {
            const textContent = element.textContent.trim();
            if (!textContent || element.children.length > 0) return;
            
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            const fontSize = parseFloat(styles.fontSize);
            
            // Calculate contrast ratio (simplified)
            const contrast = calculateContrast(textColor, bgColor);
            const requiredContrast = fontSize >= 18 ? 3 : 4.5; // WCAG AA
            
            if (contrast < requiredContrast) {
                console.warn(`⚠️ Low contrast detected:`, {
                    element,
                    contrast: contrast.toFixed(2),
                    required: requiredContrast,
                    text: textContent.substring(0, 50)
                });
            }
        });
    }
    
    /**
     * Calculate contrast ratio (simplified)
     */
    function calculateContrast(color1, color2) {
        // This is a simplified version
        // For production, use a proper color contrast library
        return 4.5; // Placeholder
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Add screen reader only class to styles
     */
    function addSROnlyStyles() {
        if (document.querySelector('.sr-only')) return;
        
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
            
            .sr-only-focusable:focus {
                position: static;
                width: auto;
                height: auto;
                padding: inherit;
                margin: inherit;
                overflow: visible;
                clip: auto;
                white-space: normal;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addSROnlyStyles();
            init();
        });
    } else {
        addSROnlyStyles();
        init();
    }
    
    // Expose accessibility functions globally
    window.sirajA11y = {
        announce: (message, assertive) => {
            if (window.announceToScreenReader) {
                window.announceToScreenReader(message, assertive);
            }
        }
    };
    
})();
