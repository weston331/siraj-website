// ============================================
// SERVICE WORKER REGISTRATION (PWA Support)
// ============================================

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('🔄 New version available! Refresh to update.');
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

// ============================================
// SMOOTH SCROLLING & NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let ticking = false;

    function updateNavbar() {
        const currentScroll = window.pageYOffset;

        // Add glass effect when scrolled
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(0, 26, 63, 0.85)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    // ============================================
    // INTERSECTION OBSERVER - FADE IN ANIMATIONS
    // ============================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe screenshot cards
    document.querySelectorAll('.screenshot-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // ============================================
    // SCREENSHOTS CAROUSEL AUTO-SCROLL
    // ============================================

    const carousel = document.querySelector('.screenshots-carousel');
    if (carousel) {
        // Disable auto-scroll on touch devices - users scroll manually
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        if (!isTouchDevice) {
            let autoScrollInterval = null;
            let isScrolling = false;
            let scrollDirection = 1;

            // Auto-scroll functionality
            const autoScroll = () => {
                if (!isScrolling) {
                    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                    
                    if (scrollDirection === 1 && carousel.scrollLeft >= maxScroll - 10) {
                        scrollDirection = -1;
                    } else if (scrollDirection === -1 && carousel.scrollLeft <= 10) {
                        scrollDirection = 1;
                    }

                    carousel.scrollBy({
                        left: scrollDirection * 2,
                        behavior: 'auto'
                    });
                }
            };

            // Pause auto-scroll on hover
            carousel.addEventListener('mouseenter', () => { isScrolling = true; });
            carousel.addEventListener('mouseleave', () => { isScrolling = false; });

            // Start/stop auto-scroll based on visibility to save resources
            const carouselObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!autoScrollInterval) {
                            autoScrollInterval = setInterval(autoScroll, 50);
                        }
                    } else {
                        if (autoScrollInterval) {
                            clearInterval(autoScrollInterval);
                            autoScrollInterval = null;
                        }
                    }
                });
            });

            carouselObserver.observe(carousel);
        }
    }

    // ============================================
    // STATS COUNTER ANIMATION
    // ============================================

    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const isDecimal = target.toString().includes('.');
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = isDecimal ? target.toFixed(1) : Math.floor(target).toLocaleString('ar-EG');
                clearInterval(timer);
            } else {
                element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString('ar-EG');
            }
        }, 16);
    };

    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(statNumber => {
                    const target = parseFloat(statNumber.dataset.target);
                    animateCounter(statNumber, target);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.stats-grid').forEach(stat => {
        statsObserver.observe(stat);
    });

    // ============================================
    // DAILY CONTENT ANIMATIONS
    // ============================================

    // Animate daily cards
    document.querySelectorAll('.daily-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // Animate testimonial cards
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // ============================================
    // PRAYER RIBBON INTERACTION
    // ============================================

    const prayerRibbon = document.querySelector('.prayer-ribbon');
    if (prayerRibbon) {
        prayerRibbon.addEventListener('click', () => {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-effect 0.6s ease-out;
                pointer-events: none;
            `;
            
            const rect = prayerRibbon.getBoundingClientRect();
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            
            prayerRibbon.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Add ripple animation keyframes
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple-effect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // HERO STATS ANIMATION (original)
    // ============================================

    // Keep original hero stats animation
    const heroStatsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                const targetText = statNumber.textContent;
                const target = parseInt(targetText);
                animateCounter(statNumber, target);
                heroStatsObserver.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.hero-stats').forEach(stat => {
        heroStatsObserver.observe(stat);
    });

    // ============================================
    // PHONE MOCKUP PARALLAX EFFECT
    // ============================================

    const heroMockup = document.querySelector('.hero-mockup');
    if (heroMockup && !('ontouchstart' in window)) {
        let mouseTicking = false;
        window.addEventListener('mousemove', (e) => {
            if (!mouseTicking) {
                requestAnimationFrame(() => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 20;
                    const y = (e.clientY / window.innerHeight - 0.5) * 20;
                    heroMockup.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
                    mouseTicking = false;
                });
                mouseTicking = true;
            }
        }, { passive: true });

        heroMockup.addEventListener('mouseleave', () => {
            heroMockup.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        });
    }

    // ============================================
    // DOWNLOAD BUTTONS - PLATFORM DETECTION
    // ============================================

    const userAgent = navigator.userAgent.toLowerCase();
    const isHuawei = /huawei|honor|harmonyos|hms/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    const appGalleryBtn = document.querySelector('.app-gallery');
    const googlePlayBtn = document.querySelector('.google-play');
    const appStoreBtn = document.querySelector('.app-store');

    if (isHuawei && appGalleryBtn) {
        appGalleryBtn.style.order = '-3';
        appGalleryBtn.style.transform = 'scale(1.05)';
        appGalleryBtn.style.borderColor = '#ED3E45';
        appGalleryBtn.style.boxShadow = '0 8px 24px rgba(237, 62, 69, 0.4)';
    } else if (isAndroid && appGalleryBtn) {
        appGalleryBtn.style.order = '-2';
        appGalleryBtn.style.borderColor = 'var(--gold)';
    }

    if (isAndroid && googlePlayBtn) {
        googlePlayBtn.style.order = '-1';
    }

    if (isIOS && appStoreBtn) {
        appStoreBtn.style.order = '-3';
        appStoreBtn.style.transform = 'scale(1.05)';
        appStoreBtn.style.border = '2px solid #D4AF37';
    }

    // ============================================
    // DYNAMIC GREETING BASED ON TIME
    // ============================================

    const updateGreeting = () => {
        const hour = new Date().getHours();
        const heroEyebrow = document.querySelector('.hero-eyebrow span:last-child');
        
        if (heroEyebrow) {
            let greeting = 'تطبيقك الروحاني الشامل';
            
            if (hour >= 5 && hour < 12) {
                greeting = 'صباح النور والهداية';
            } else if (hour >= 12 && hour < 17) {
                greeting = 'نهارك مبارك';
            } else if (hour >= 17 && hour < 21) {
                greeting = 'مساء الخير والبركة';
            } else {
                greeting = 'ليلة مباركة';
            }
            
            heroEyebrow.textContent = greeting;
        }
    };

    updateGreeting();

    // ============================================
    // ============================================
    // CALENDAR-CONNECTED ISLAMIC DATE ENGINE
    // ============================================
    const HM = ['محرم','صفر','ربيع الأوّل','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوّال','ذو القعدة','ذو الحجة'];
    const GM = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const WD = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

    function gToJD(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
    function jdToH(jd){jd=Math.floor(jd)+.5;const z=jd-1948439.5,c=Math.floor((z-1)/10631),r=z-10631*c,n=Math.floor((r-1)/354),d2=r-354*n,yr=30*c+n+1,q=Math.floor((d2-1)/29.5),mo=Math.min(q+1,12);let d=d2-Math.floor(29.5*mo-29);if(d<1)d=1;return{year:yr,month:mo,day:d}}
    function arN(n){return String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])}

    function getHijriOffset() {
        try {
            const saved = localStorage.getItem('siraj_hijri_offset_v1');
            if (saved !== null) {
                const o = parseInt(saved, 10);
                if (!isNaN(o) && Math.abs(o) <= 7) return o;
                localStorage.removeItem('siraj_hijri_offset_v1');
            }
        } catch(e) {}
        return 0;
    }

    const updateIslamicDate = () => {
        const now = new Date();
        const offset = getHijriOffset();
        
        let hijriFormatted = '';
        if (offset === 0) {
            try {
                const f = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    weekday: 'long'
                });
                hijriFormatted = f.format(now);
            } catch(e) {}
        }

        if (!hijriFormatted || offset !== 0) {
            const jd = gToJD(now.getFullYear(), now.getMonth() + 1, now.getDate()) + offset;
            const h = jdToH(jd);
            hijriFormatted = `${WD[now.getDay()]} ${arN(h.day)} ${HM[h.month - 1]} ${arN(h.year)}هـ`;
        }

        // Update Hijri date in Hero
        const hijriDateElement = document.getElementById('hijri-date');
        if (hijriDateElement) {
            hijriDateElement.textContent = hijriFormatted;
        }

        // Update Gregorian date in Hero
        const gregorianDateElement = document.getElementById('gregorian-date');
        if (gregorianDateElement) {
            gregorianDateElement.textContent = `${now.getDate()} ${GM[now.getMonth()]} ${now.getFullYear()}م`;
        }
    };
    window.updateIslamicDate = updateIslamicDate;

    // Also fetch Supabase offset in background if not already loaded
    async function syncCalendarOffsetFromSupabase() {
        const SUPABASE_URL = 'https://pwfqjhlzjslytgpvackl.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZnFqaGx6anNseXRncHZhY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NDM4ODAsImV4cCI6MjA5NzQxOTg4MH0.bDnmP7hEKrYYo6K3bOjQdgVDTj94UqZGnVsrsi8uClg';
        try {
            const sResp = await fetch(`${SUPABASE_URL}/rest/v1/calendar_settings?select=*`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            if (sResp.ok) {
                const sData = await sResp.json();
                if (sData && sData.length) {
                    let determinedOffset = null;

                    // 1. Direct offset setting (e.g. hijri_offset: +1, -1, 0)
                    const offRow = sData.find(s => s.key === 'hijri_offset' || s.key === 'offset' || s.key === 'تعديل_التاريخ');
                    if (offRow && offRow.value !== undefined && String(offRow.value).trim() !== '') {
                        const num = parseInt(offRow.value, 10);
                        if (!isNaN(num) && Math.abs(num) <= 7) {
                            determinedOffset = num;
                        }
                    }

                    // 2. Target day number setting (e.g. hijri_day: 27)
                    if (determinedOffset === null) {
                        const dayRow = sData.find(s => s.key === 'hijri_day' || s.key === 'اليوم_الهجري');
                        if (dayRow && dayRow.value !== undefined && String(dayRow.value).trim() !== '') {
                            const targetDay = parseInt(dayRow.value, 10);
                            if (!isNaN(targetDay) && targetDay >= 1 && targetDay <= 30) {
                                const now = new Date();
                                const natJD = gToJD(now.getFullYear(), now.getMonth() + 1, now.getDate());
                                for (let diff = 0; diff <= 6; diff++) {
                                    for (const sign of [-1, 1]) {
                                        const cand = diff * sign;
                                        const h = jdToH(natJD + cand);
                                        if (h.day === targetDay) {
                                            determinedOffset = cand;
                                            break;
                                        }
                                    }
                                    if (determinedOffset !== null) break;
                                }
                            }
                        }
                    }

                    if (determinedOffset !== null) {
                        localStorage.setItem('siraj_hijri_offset_v1', String(determinedOffset));
                    } else {
                        localStorage.removeItem('siraj_hijri_offset_v1');
                    }
                    updateIslamicDate();
                    return;
                }
            }
        } catch(e) {}
    }

    updateIslamicDate();
    syncCalendarOffsetFromSupabase();
    // Update date every hour
    setInterval(updateIslamicDate, 3600000);

    // ============================================
    // LAZY LOADING IMAGES
    // ============================================

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load the image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Load srcset if available
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }
                
                // Add loaded class for fade-in effect
                img.classList.add('lazy-loaded');
                
                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        root: null,
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Native lazy loading fallback
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }

    // ============================================
    // PROGRESSIVE IMAGE LOADING
    // ============================================

    const progressiveImages = document.querySelectorAll('.progressive-image');
    
    progressiveImages.forEach(container => {
        const img = container.querySelector('img');
        const lowResSrc = img.src;
        const highResSrc = img.dataset.src;
        
        if (!highResSrc) return;
        
        // Load high-res image
        const highResImg = new Image();
        highResImg.onload = () => {
            img.src = highResSrc;
            img.classList.add('loaded');
            container.classList.add('loaded');
        };
        highResImg.src = highResSrc;
    });

    // ============================================
    // WEBP SUPPORT DETECTION
    // ============================================

    function supportsWebP() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }

    if (supportsWebP()) {
        document.documentElement.classList.add('webp');
    } else {
        document.documentElement.classList.add('no-webp');
    }

    // ============================================
    // RESPONSIVE IMAGES - UPDATE SRCSET ON RESIZE
    // ============================================

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const images = document.querySelectorAll('img[srcset]');
            images.forEach(img => {
                // Force browser to re-evaluate srcset
                const currentSrc = img.currentSrc;
                if (currentSrc) {
                    console.log('Image adapted to viewport:', currentSrc);
                }
            });
        }, 250);
    });

    // ============================================
    // CONSOLE EASTER EGG
    // ============================================

    console.log(`
    %c╔═══════════════════════════════════════╗
    ║                                       ║
    ║         سِراج الأطهار               ║
    ║    نور الهداية في راحة يدك          ║
    ║                                       ║
    ║   اللَّهُ نُورُ السَّمَاوَاتِ       ║
    ║         وَالْأَرْضِ                 ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
    `, 
    'color: #D4AF37; font-size: 14px; font-family: monospace; font-weight: bold;'
    );

    console.log('%cمرحباً بك في سِراج الأطهار! 🌙✨', 'color: #001A3F; font-size: 16px; font-weight: bold;');
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Debounce function for performance optimization
const sirajDebounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Add focus visible styles for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Announce dynamic content changes to screen readers
const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// ============================================
// REDUCED MOTION SUPPORT
// ============================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable all animations
    document.querySelectorAll('*').forEach(element => {
        element.style.animation = 'none';
        element.style.transition = 'none';
    });
}


// ============================================
// HAMBURGER MENU FUNCTIONALITY
// ============================================

const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const navLinksItems = document.querySelectorAll('.nav-links a');

// Toggle menu function
function toggleMenu() {
    hamburgerMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    
    // Update aria-expanded
    const isExpanded = hamburgerMenu.classList.contains('active');
    hamburgerMenu.setAttribute('aria-expanded', isExpanded);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isExpanded ? 'hidden' : '';
}

// Event listeners
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', toggleMenu);
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', toggleMenu);
}

// Close menu when clicking on nav links
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu();
    }
});

// Close menu on window resize (if switching from mobile to desktop)
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        toggleMenu();
    }
});


// ============================================
// READING PROGRESS BAR
// ============================================

let readingProgressTicking = false;
function updateReadingProgress() {
    if (!readingProgressTicking) {
        requestAnimationFrame(() => {
            const winScroll = window.pageYOffset || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            const progressBar = document.querySelector('.reading-progress');
            if (progressBar) {
                progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
            }
            readingProgressTicking = false;
        });
        readingProgressTicking = true;
    }
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });


// ============================================
// PRAYER TIME COUNTDOWN
// ============================================

// ============================================
// PRAYER TIME ENGINE (ALADHAN API - METHOD 0: SHIA ITHNA-ASHARI, LEVA INSTITUTE, QUM)
// ============================================

// Default Shia Ithna-Ashari prayer times (fallbacks)
let activePrayerTimes = {
    fajr: { hour: 4, minute: 30, name: 'الفجر', icon: 'brightness_4' },
    sunrise: { hour: 5, minute: 43, name: 'الشروق', icon: 'wb_sunny' },
    dhuhr: { hour: 12, minute: 0, name: 'الظهر', icon: 'light_mode' },
    asr: { hour: 15, minute: 33, name: 'العصر', icon: 'wb_twilight' },
    sunset: { hour: 18, minute: 15, name: 'الغروب', icon: 'wb_twilight' },
    maghrib: { hour: 18, minute: 30, name: 'المغرب', icon: 'nights_stay' },
    isha: { hour: 19, minute: 19, name: 'العشاء', icon: 'bedtime' },
    midnight: { hour: 23, minute: 59, name: 'منتصف الليل', icon: 'dark_mode' }
};

let currentPrayerLocation = {
    city: 'Najaf',
    country: 'Iraq',
    name: 'النجف الأشرف'
};

let nextPrayerCache = null;

// Parse "HH:MM" into { hour, minute }
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    const cleanStr = timeStr.split(' ')[0]; // removes any timezone label like (EEST)
    const [h, m] = cleanStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { hour: h, minute: m };
}

// Convert 24-hour hour/minute to 12-hour Arabic string (e.g. 4:30 ص, 12:00 م)
function formatArabic12Hour(hour, minute) {
    const isPM = hour >= 12;
    let h12 = hour % 12;
    if (h12 === 0) h12 = 12;
    const mStr = String(minute).padStart(2, '0');
    const period = isPM ? 'م' : 'ص';
    return `${h12}:${mStr} ${period}`;
}

// Fetch from AlAdhan API (Method 0 = Shia Ithna-Ashari)
async function fetchAlAdhanPrayerTimes(location) {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const locKey = location.coords ? `${location.lat.toFixed(3)}_${location.lng.toFixed(3)}` : `${location.city}_${location.country}`;
    const cacheKey = `siraj_prayer_${dateKey}_${locKey}`;

    // Check localStorage cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            applyAlAdhanData(parsed, location);
            return;
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    let url;
    if (location.coords) {
        const ts = Math.floor(Date.now() / 1000);
        url = `https://api.aladhan.com/v1/timings/${ts}?latitude=${location.lat}&longitude=${location.lng}&method=0`;
    } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=0`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error: ' + res.status);
        const data = await res.json();
        if (data && data.data) {
            localStorage.setItem(cacheKey, JSON.stringify(data.data));
            applyAlAdhanData(data.data, location);
        }
    } catch (err) {
        console.warn('AlAdhan fetch error, using default Shia timings:', err);
        updatePrayerScheduleGrid();
        updatePrayerCountdown();
    }
}

function applyAlAdhanData(apiData, location) {
    const timings = apiData.timings;
    if (!timings) return;

    const prayerKeys = {
        Fajr: 'fajr',
        Sunrise: 'sunrise',
        Dhuhr: 'dhuhr',
        Asr: 'asr',
        Sunset: 'sunset',
        Maghrib: 'maghrib',
        Isha: 'isha',
        Midnight: 'midnight'
    };

    for (const [apiK, localK] of Object.entries(prayerKeys)) {
        if (timings[apiK] && activePrayerTimes[localK]) {
            const parsed = parseTimeString(timings[apiK]);
            if (parsed) {
                activePrayerTimes[localK].hour = parsed.hour;
                activePrayerTimes[localK].minute = parsed.minute;
            }
        }
    }

    // Ensure Hijri Date in Hero is strictly driven by the calendar engine & Supabase settings
    if (typeof window.updateIslamicDate === 'function') {
        window.updateIslamicDate();
    }

    // Update current city label
    const cityLabel = document.getElementById('current-city-label');
    if (cityLabel) {
        cityLabel.textContent = location.name || location.city;
    }

    updatePrayerScheduleGrid();
    updatePrayerCountdown();
    if (typeof updateDynamicTaqeeb === 'function') {
        updateDynamicTaqeeb();
    }
}

// Get the Next Prayer according to Shia Ithna-Ashari prayer times
function getNextPrayer() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // The primary prayers evaluated for countdown
    const countdownPrayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    for (const key of countdownPrayers) {
        const prayer = activePrayerTimes[key];
        const prayerMinutes = prayer.hour * 60 + prayer.minute;
        if (currentMinutes < prayerMinutes) {
            const nextPrayerTime = new Date();
            nextPrayerTime.setHours(prayer.hour, prayer.minute, 0, 0);
            return {
                key: key,
                name: prayer.name,
                time: nextPrayerTime
            };
        }
    }

    // If all passed today, next is Fajr tomorrow
    const nextFajr = new Date();
    nextFajr.setDate(nextFajr.getDate() + 1);
    nextFajr.setHours(activePrayerTimes.fajr.hour, activePrayerTimes.fajr.minute, 0, 0);
    return {
        key: 'fajr',
        name: activePrayerTimes.fajr.name,
        time: nextFajr
    };
}

function updatePrayerCountdown() {
    const nextPrayer = getNextPrayer();
    nextPrayerCache = nextPrayer;
    const now = new Date();
    const diff = nextPrayer.time - now;

    if (diff < 0) return;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const prayerNameEl = document.getElementById('next-prayer-name');

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    if (prayerNameEl) prayerNameEl.textContent = nextPrayer.name;
}

// Update the prayer times grid inside the modal
function updatePrayerScheduleGrid() {
    const grid = document.getElementById('prayer-schedule-grid');
    if (!grid) return;

    const displayOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'];
    const nextP = nextPrayerCache || getNextPrayer();

    let html = '';
    displayOrder.forEach(key => {
        const p = activePrayerTimes[key];
        if (!p) return;
        const isNext = (nextP && nextP.key === key);
        const timeFormatted = formatArabic12Hour(p.hour, p.minute);

        html += `
            <div class="prayer-time-card ${isNext ? 'active-next' : ''}">
                <span class="material-symbols-rounded card-prayer-icon">${p.icon || 'schedule'}</span>
                <span class="card-prayer-name">${p.name}</span>
                <span class="card-prayer-time">${timeFormatted}</span>
            </div>
        `;
    });

    grid.innerHTML = html;
}

// Reverse geocode latitude and longitude into an Arabic location name
async function reverseGeocodeCoords(lat, lng) {
    // 1. Primary: BigDataCloud (Free, client-side, fast, Arabic language support)
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
        if (res.ok) {
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision;
            const country = data.countryName;
            if (city && country) {
                return `${city} (${country})`;
            } else if (city) {
                return city;
            } else if (country) {
                return country;
            }
        }
    } catch (e) {
        console.warn('BigDataCloud reverse geocode error:', e);
    }

    // 2. Secondary fallback: OpenStreetMap Nominatim
    try {
        const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
        if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.address) {
                const addr = data2.address;
                const city2 = addr.city || addr.town || addr.village || addr.county || addr.state;
                const country2 = addr.country;
                if (city2 && country2) {
                    return `${city2} (${country2})`;
                } else if (city2) {
                    return city2;
                }
            }
        }
    } catch (e2) {
        console.warn('Nominatim reverse geocode error:', e2);
    }

    return null;
}

// Setup Modal & Location Handlers
function setupPrayerScheduleModal() {
    const modal = document.getElementById('prayer-schedule-modal');
    const overlay = document.getElementById('prayer-modal-overlay');
    const btnOpen = document.getElementById('btn-open-prayer-modal');
    const cardCountdown = document.getElementById('prayer-countdown-card');
    const btnClose = document.getElementById('btn-close-prayer-modal');
    const citySelect = document.getElementById('prayer-city-select');
    const btnGps = document.getElementById('btn-detect-gps');

    function openModal() {
        if (!modal || !overlay) return;
        updatePrayerScheduleGrid();
        modal.classList.add('open');
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        if (!modal || !overlay) return;
        modal.classList.remove('open');
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (cardCountdown) cardCountdown.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // City Selector Change
    if (citySelect) {
        citySelect.addEventListener('change', () => {
            const val = citySelect.value;
            if (val.startsWith('coords:')) {
                return;
            }

            // Reset GPS button to default state
            if (btnGps) {
                btnGps.classList.remove('detected');
                btnGps.innerHTML = '<span class="material-symbols-rounded">my_location</span> <span>موقعي الحالي</span>';
            }

            const selectedText = citySelect.options[citySelect.selectedIndex].text.split('(')[0].trim();
            const [city, country] = val.split(',');

            currentPrayerLocation = {
                city: city.trim(),
                country: country ? country.trim() : 'Iraq',
                name: selectedText
            };

            localStorage.setItem('siraj_saved_city', JSON.stringify(currentPrayerLocation));
            fetchAlAdhanPrayerTimes(currentPrayerLocation);
        });
    }

    // Helper to reflect detected GPS in UI
    function setGpsDetectedUI(name, lat, lng) {
        if (btnGps) {
            btnGps.classList.remove('loading');
            btnGps.classList.add('detected');
            btnGps.innerHTML = `<span class="material-symbols-rounded">near_me</span> <span>${name}</span>`;
            btnGps.title = `الموقع الحالي المحدد: ${name}`;
        }

        if (citySelect) {
            let gpsOption = citySelect.querySelector('option[data-type="gps"]');
            if (!gpsOption) {
                gpsOption = document.createElement('option');
                gpsOption.setAttribute('data-type', 'gps');
                citySelect.insertBefore(gpsOption, citySelect.firstChild);
            }
            gpsOption.value = `coords:${lat},${lng}`;
            gpsOption.textContent = `📍 ${name} (موقعي الحالي)`;
            citySelect.selectedIndex = 0;
        }

        const heroCityLabel = document.getElementById('current-city-label');
        if (heroCityLabel) {
            heroCityLabel.textContent = name;
        }
    }

    // GPS Auto-detect
    if (btnGps) {
        btnGps.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('خاصية تحديد الموقع غير مدعومة في متصفحك.');
                return;
            }

            btnGps.disabled = true;
            btnGps.classList.add('loading');
            const origHTML = btnGps.innerHTML;
            btnGps.innerHTML = '<span class="material-symbols-rounded rotating">autorenew</span> <span>جاري تحديد موقعك...</span>';

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    btnGps.innerHTML = '<span class="material-symbols-rounded rotating">autorenew</span> <span>جاري جلب اسم المدينة...</span>';

                    const resolvedName = await reverseGeocodeCoords(lat, lng);
                    const displayName = resolvedName || 'موقعي الحالي';

                    btnGps.disabled = false;
                    setGpsDetectedUI(displayName, lat, lng);

                    currentPrayerLocation = {
                        coords: true,
                        lat: lat,
                        lng: lng,
                        name: displayName
                    };

                    localStorage.setItem('siraj_saved_city', JSON.stringify(currentPrayerLocation));
                    fetchAlAdhanPrayerTimes(currentPrayerLocation);
                },
                (err) => {
                    btnGps.disabled = false;
                    btnGps.classList.remove('loading');
                    btnGps.innerHTML = origHTML;
                    console.warn('Geolocation error:', err);
                    alert('تعذر تحديد موقعك بدقة، يمكنك اختيار مدينتك يدوياً من القائمة.');
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        });
    }

    // Load saved city preference
    const saved = localStorage.getItem('siraj_saved_city');
    if (saved) {
        try {
            currentPrayerLocation = JSON.parse(saved);
            if (currentPrayerLocation.coords && currentPrayerLocation.name) {
                setGpsDetectedUI(currentPrayerLocation.name, currentPrayerLocation.lat, currentPrayerLocation.lng);
            } else if (citySelect) {
                const matchVal = `${currentPrayerLocation.city},${currentPrayerLocation.country}`;
                for (let i = 0; i < citySelect.options.length; i++) {
                    if (citySelect.options[i].value === matchVal) {
                        citySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        } catch (e) {}
    }

    fetchAlAdhanPrayerTimes(currentPrayerLocation);
}

// Interval countdown updater
setInterval(updatePrayerCountdown, 1000);
updatePrayerCountdown();
setupPrayerScheduleModal();


// ============================================
// PARALLAX SCROLLING EFFECT
// ============================================

function initParallax() {
    // Completely disable parallax on mobile and touch devices to prevent scroll lag/stutter
    const isMobileOrTouch = window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isMobileOrTouch) {
        return;
    }
    
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const orb3 = document.querySelector('.orb-3');
    const ornaments = document.querySelectorAll('.ornament');
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                if (orb1) orb1.style.transform = `translateY(${scrolled * 0.25}px)`;
                if (orb2) orb2.style.transform = `translateY(${scrolled * 0.15}px)`;
                if (orb3) orb3.style.transform = `translateY(${scrolled * 0.2}px)`;
                
                ornaments.forEach((ornament, index) => {
                    const speed = 0.12 + (index * 0.06);
                    ornament.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.03}deg)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initParallax);


// ============================================
// ADVANCED LAZY LOADING
// ============================================

function initAdvancedLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Add loading class
                img.classList.add('loading');
                
                // Load the image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                // When loaded
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                }, { once: true });
                
                // Stop observing
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // Also observe regular lazy images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.classList.add('lazy-image');
    });
}

// Initialize
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', initAdvancedLazyLoading);
}


// ============================================
// WEBP SUPPORT DETECTION
// ============================================

function checkWebPSupport() {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
        // Check if WebP is supported
        const isSupported = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        if (isSupported) {
            document.documentElement.classList.add('webp');
        } else {
            document.documentElement.classList.add('no-webp');
        }
    }
}

checkWebPSupport();

// ============================================
// DAILY QURANIC VERSE (آية اليوم المتجددة)
// ============================================

function initDailyVerse() {
    const textEl = document.getElementById('daily-verse-text');
    const refEl = document.getElementById('daily-verse-ref');
    const linkEl = document.getElementById('daily-verse-link');
    const shuffleBtn = document.getElementById('btn-verse-shuffle');

    if (!textEl) return;

    function setupVerses(verses) {
        if (!verses || verses.length === 0) return;
        const now = new Date();
        const daysSinceEpoch = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24));
        let currentIndex = ((daysSinceEpoch % verses.length) + verses.length) % verses.length;

        function displayVerse(index, animate = false) {
            const item = verses[index];
            if (!item) return;

            if (animate) {
                textEl.style.opacity = '0';
                textEl.style.transform = 'translateY(6px)';
                if (refEl) refEl.style.opacity = '0';
                setTimeout(() => {
                    updateDOM(item);
                    textEl.style.opacity = '1';
                    textEl.style.transform = 'translateY(0)';
                    if (refEl) refEl.style.opacity = '1';
                }, 200);
            } else {
                updateDOM(item);
            }
        }

        function updateDOM(item) {
            textEl.textContent = (item.text || '').trim();
            if (refEl) {
                const ayahRef = item.ayah ? `: ${item.ayah}` : '';
                refEl.textContent = `${item.surah || ''}${ayahRef}`.trim();
            }
            if (linkEl) {
                const pageNum = item.page || 1;
                linkEl.href = '/quran?page=' + encodeURIComponent(pageNum);
                linkEl.setAttribute('aria-label', `تلاوة آية من ${item.surah || 'القرآن الكريم'} في المصحف الشريف صفحة ${pageNum}`);
            }
        }

        displayVerse(currentIndex, false);

        if (shuffleBtn) {
            shuffleBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % verses.length;
                displayVerse(currentIndex, true);
            };
        }
    }

    if (window.DAILY_VERSES && Array.isArray(window.DAILY_VERSES) && window.DAILY_VERSES.length > 0) {
        setupVerses(window.DAILY_VERSES);
        return;
    }

    // Default fallback in case daily_verses.js wasn't ready
    const fallbackVerses = [
        {
            id: 1,
            text: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
            surah: 'سورة الأحزاب',
            ayah: '56',
            page: 426
        },
        {
            id: 2,
            text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
            surah: 'سورة البقرة',
            ayah: '255',
            page: 42
        },
        {
            id: 3,
            text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
            surah: 'سورة البقرة',
            ayah: '186',
            page: 28
        }
    ];
    setupVerses(fallbackVerses);
}

// ============================================
// DAILY WISDOM FROM NAHJ AL-BALAGHA (حكمة اليوم)
// ============================================

function initDailyWisdom() {
    const textEl = document.getElementById('daily-wisdom-text');
    const titleEl = document.getElementById('daily-wisdom-title');
    const linkEl = document.getElementById('daily-wisdom-link');
    const shuffleBtn = document.getElementById('btn-wisdom-shuffle');

    if (!textEl) return;

    function setupWisdom(wisdoms) {
        if (!wisdoms || wisdoms.length === 0) return;
        const now = new Date();
        const daysSinceEpoch = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24));
        let currentIndex = ((daysSinceEpoch % wisdoms.length) + wisdoms.length) % wisdoms.length;

        function displayWisdom(index, animate = false) {
            const item = wisdoms[index];
            if (!item) return;

            if (animate) {
                textEl.style.opacity = '0';
                textEl.style.transform = 'translateY(6px)';
                setTimeout(() => {
                    updateDOM(item);
                    textEl.style.opacity = '1';
                    textEl.style.transform = 'translateY(0)';
                }, 200);
            } else {
                updateDOM(item);
            }
        }

        function updateDOM(item) {
            textEl.textContent = (item.text || '').trim();
            if (titleEl) {
                titleEl.textContent = item.title || 'نهج البلاغة';
            }
            if (linkEl) {
                linkEl.href = '/prayer?id=' + encodeURIComponent(item.id);
                linkEl.setAttribute('aria-label', 'قراءة ' + (item.title || 'الحكمة') + ' في صفحة خاصة');
            }
        }

        displayWisdom(currentIndex, false);

        if (shuffleBtn) {
            shuffleBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % wisdoms.length;
                displayWisdom(currentIndex, true);
            };
        }
    }

    if (window.NAHJ_WISDOMS && Array.isArray(window.NAHJ_WISDOMS) && window.NAHJ_WISDOMS.length > 0) {
        setupWisdom(window.NAHJ_WISDOMS);
        return;
    }

    fetch('nahj_wisdoms.json?v=1.0')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load nahj_wisdoms.json');
            return res.json();
        })
        .then(wisdoms => {
            setupWisdom(wisdoms);
        })
        .catch(err => {
            if (window.NAHJ_WISDOMS && Array.isArray(window.NAHJ_WISDOMS) && window.NAHJ_WISDOMS.length > 0) {
                setupWisdom(window.NAHJ_WISDOMS);
                return;
            }
            console.warn('Daily wisdom using fallback:', err);
            const fallback = {
                id: 1,
                title: 'حكمة اليوم - نهج البلاغة',
                text: 'كُنْ فِي الْفِتْنَةِ كَابْنِ اللَّبُونِ، لَا ظَهْرٌ فَيُرْكَبَ، وَلَا ضَرْعٌ فَيُحْلَبَ.'
            };
            if (textEl && !textEl.textContent.trim()) textEl.textContent = fallback.text;
            if (titleEl) titleEl.textContent = fallback.title;
            if (linkEl) linkEl.href = '/prayer?id=1';
        });
}

// ============================================
// DAILY PRAYER FROM DAYS OF THE WEEK (دعاء اليوم)
// ============================================

const WEEKDAY_PRAYERS = [
  // 0 = Sunday (الأحد)
  {
    day: 'الأحد',
    id: 1,
    title: 'دعاء يوم الأحد',
    preview: 'بِسمِ الله الَّذي لا أرجو إلاّ فَضلَهُ، وَلا أخشى إلاّ عَدلَهُ...'
  },
  // 1 = Monday (الاثنين)
  {
    day: 'الاثنين',
    id: 3,
    title: 'دعاء يوم الاثنين',
    preview: 'الحَمدُ للهِ الَّذي لَم يُشهِد أحَداً حينَ فَطَرَ السَّماواتِ وَالأرضَ...'
  },
  // 2 = Tuesday (الثلاثاء)
  {
    day: 'الثلاثاء',
    id: 4,
    title: 'دعاء يوم الثلاثاء',
    preview: 'الحَمدُ للهِ وَالحَمدُ حَقُهُ كَما يَستِحِقُّهُ حَمداً كَثيراً...'
  },
  // 3 = Wednesday (الأربعاء)
  {
    day: 'الأربعاء',
    id: 2,
    title: 'دعاء يوم الأربعاء',
    preview: 'الحَمدُ للهِ الَّذي جَعَلَ اللّيلَ لِباساً وَالنَّومَ سُباتاً...'
  },
  // 4 = Thursday (الخميس)
  {
    day: 'الخميس',
    id: 6,
    title: 'دعاء يوم الخميس',
    preview: 'الحَمدُ للهِ الَّذي أذهَبَ اللَّيلَ مُظلِماً بِقُدرَتِهِ، وَجاءَ بِالنَّهارِ...'
  },
  // 5 = Friday (الجمعة)
  {
    day: 'الجمعة',
    id: 5,
    title: 'دعاء يوم الجمعة',
    preview: 'الحَمدُ للهِ الأولِ قَبلَ الإنشاءِ وَالإحياءِ وَالآخرِ بَعدَ فَناءِ الأشياءِ...'
  },
  // 6 = Saturday (السبت)
  {
    day: 'السبت',
    id: 7,
    title: 'دعاء يوم السبت',
    preview: 'بِسمِ اللهِ كَلِمَةِ المُعتَصِمينَ وَمَقالَةِ المُتَحَرِّزينَ...'
  }
];

function initDailyPrayer() {
    const cardEl = document.getElementById('daily-dua-card');
    const dayEl = document.getElementById('daily-dua-day');
    const titleEl = document.getElementById('daily-dua-title');
    const previewEl = document.getElementById('daily-dua-preview');

    if (!cardEl) return;

    const dayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const todayData = WEEKDAY_PRAYERS[dayIndex];

    if (!todayData) return;

    if (dayEl) dayEl.textContent = todayData.day;
    if (titleEl) titleEl.textContent = todayData.title;
    if (previewEl) previewEl.textContent = todayData.preview;
    cardEl.href = '/prayer?id=' + encodeURIComponent(todayData.id);
    cardEl.setAttribute('aria-label', 'قراءة ' + todayData.title + ' في صفحة خاصة');
}

// ============================================
// DYNAMIC TAQEEBAT BASED ON TIME OF DAY (تعقيبات الصلاة)
// ============================================

const TAQEEBAT_PRAYERS = [
  // 1. الفجر / الصبح: من 4:30 ص إلى 11:53 ص
  {
    name: 'تعقيب صلاة الصبح',
    id: 143,
    title: 'التعقيب المأثور'
  },
  // 2. الظهر: من 11:54 ص إلى 3:17 م
  {
    name: 'تعقيب صلاة الظهر',
    id: 144,
    title: 'التعقيب المأثور'
  },
  // 3. العصر: من 3:18 م إلى 5:47 م
  {
    name: 'تعقيب صلاة العصر',
    id: 146,
    title: 'التعقيب المأثور'
  },
  // 4. المغرب: من 5:48 م إلى 7:05 م
  {
    name: 'تعقيب صلاة المغرب',
    id: 147,
    title: 'التعقيب المأثور'
  },
  // 5. العشاء والليل: من 7:06 م حتى 4:29 ص فجراً
  {
    name: 'تعقيب صلاة العشاء',
    id: 145,
    title: 'التعقيب المأثور'
  }
];

function getCurrentTaqeeb() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Dynamically calculate minute thresholds from active Shia Ithna-Ashari prayer times
    const fajrMins = activePrayerTimes && activePrayerTimes.fajr ? (activePrayerTimes.fajr.hour * 60 + activePrayerTimes.fajr.minute) : 270;
    const dhuhrMins = activePrayerTimes && activePrayerTimes.dhuhr ? (activePrayerTimes.dhuhr.hour * 60 + activePrayerTimes.dhuhr.minute) : 720;
    const asrMins = activePrayerTimes && activePrayerTimes.asr ? (activePrayerTimes.asr.hour * 60 + activePrayerTimes.asr.minute) : 933;
    const maghribMins = activePrayerTimes && activePrayerTimes.maghrib ? (activePrayerTimes.maghrib.hour * 60 + activePrayerTimes.maghrib.minute) : 1110;
    const ishaMins = activePrayerTimes && activePrayerTimes.isha ? (activePrayerTimes.isha.hour * 60 + activePrayerTimes.isha.minute) : 1159;

    if (currentMins >= fajrMins && currentMins < dhuhrMins) {
        return TAQEEBAT_PRAYERS[0]; // تعقيب صلاة الصبح
    } else if (currentMins >= dhuhrMins && currentMins < asrMins) {
        return TAQEEBAT_PRAYERS[1]; // تعقيب صلاة الظهر
    } else if (currentMins >= asrMins && currentMins < maghribMins) {
        return TAQEEBAT_PRAYERS[2]; // تعقيب صلاة العصر
    } else if (currentMins >= maghribMins && currentMins < ishaMins) {
        return TAQEEBAT_PRAYERS[3]; // تعقيب صلاة المغرب
    } else {
        return TAQEEBAT_PRAYERS[4]; // تعقيب صلاة العشاء
    }
}

function updateDynamicTaqeeb() {
    const ribbonEl = document.getElementById('dynamic-prayer-ribbon');
    const catEl = document.getElementById('ribbon-category');
    const titleEl = document.getElementById('ribbon-title');

    if (!ribbonEl) return;

    const taqeeb = getCurrentTaqeeb();
    if (!taqeeb) return;

    if (catEl && catEl.textContent !== taqeeb.name) {
        catEl.textContent = taqeeb.name;
    }
    if (titleEl && titleEl.textContent !== taqeeb.title) {
        titleEl.textContent = taqeeb.title;
    }
    ribbonEl.href = '/prayer?id=' + encodeURIComponent(taqeeb.id);
    ribbonEl.setAttribute('aria-label', 'قراءة ' + taqeeb.name + ' في صفحة خاصة');
}

// Bootstrap daily content
function initDailyContent() {
    initDailyVerse();
    initDailyWisdom();
    initDailyPrayer();
    updateDynamicTaqeeb();
    // Re-check taqeeb every 60 seconds
    setInterval(updateDynamicTaqeeb, 60000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyContent);
} else {
    initDailyContent();
}


// ============================================
// COOKIE CONSENT BANNER
// ============================================

(function initCookieBanner() {
    const CONSENT_KEY = 'analytics-consent';
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnDecline = document.getElementById('cookie-decline');

    if (!banner) return;

    // Show banner only if no decision has been made yet
    const existing = localStorage.getItem(CONSENT_KEY);
    if (!existing) {
        // Small delay so it doesn't flash on load
        setTimeout(() => { banner.hidden = false; }, 1200);
    } else if (existing === 'accepted' && typeof loadGA4 === 'function') {
        loadGA4();
    }

    btnAccept.addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        hideBanner();
        // Load GA4 now that user has consented
        if (typeof loadGA4 === 'function') loadGA4();
    });

    btnDecline.addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        hideBanner();
    });

    function hideBanner() {
        banner.style.animation = 'none';
        banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateX(-50%) translateY(16px)';
        setTimeout(() => { banner.hidden = true; }, 300);
    }

    // Keyboard: Escape closes the banner (treats as decline)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !banner.hidden) {
            btnDecline.click();
        }
    });
})();

// ============================================
// HIJRI CALENDAR (INTEGRATED)
// ============================================

(function initHijriCalendar() {
    const HIJRI_MONTHS = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    
    const GREGORIAN_MONTHS = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const DAYS_NAMES = [
        'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];
    
    const ISLAMIC_EVENTS = {
        '1-1': [{ title: 'رأس السنة الهجرية', type: 'occasion' }],
        '1-10': [{ title: 'عاشوراء', type: 'occasion', description: 'صيام مستحب' }],
        '3-12': [{ title: 'المولد النبوي الشريف', type: 'happy' }],
        '7-27': [{ title: 'ليلة الإسراء والمعراج', type: 'occasion' }],
        '8-15': [{ title: 'ليلة النصف من شعبان', type: 'mustahab' }],
        '9-1': [{ title: 'بداية شهر رمضان المبارك', type: 'happy' }],
        '9-21': [{ title: 'ليلة القدر (محتملة)', type: 'occasion' }],
        '9-27': [{ title: 'ليلة القدر', type: 'occasion' }],
        '10-1': [{ title: 'عيد الفطر السعيد', type: 'happy' }],
        '12-9': [{ title: 'يوم عرفة', type: 'occasion', description: 'صيام مستحب' }],
        '12-10': [{ title: 'عيد الأضحى المبارك', type: 'happy' }],
        '12-18': [{ title: 'عيد الغدير', type: 'happy' }]
    };
    
    let currentMonth = 1;
    let currentYear = 1448;
    let selectedDate = null;
    let todayHijri = null;
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        const now = new Date();
        const hijriDate = gregorianToHijri(now);
        
        todayHijri = hijriDate;
        selectedDate = hijriDate;
        currentMonth = hijriDate.month;
        currentYear = hijriDate.year;
        
        updateTodayCard(hijriDate, now);
        updateDisplay();
        renderCalendar();
        
        // Event listeners
        const prevBtn = document.getElementById('cal-prev-month');
        const nextBtn = document.getElementById('cal-next-month');
        
        if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));
    }
    
    function updateTodayCard(hijri, greg) {
        const dayEl = document.getElementById('cal-hijri-day');
        const monthEl = document.getElementById('cal-current-month');
        const yearEl = document.getElementById('cal-current-year');
        const gregEl = document.getElementById('cal-gregorian-date');
        
        if (dayEl) dayEl.textContent = hijri.day;
        if (monthEl) monthEl.textContent = HIJRI_MONTHS[hijri.month - 1];
        if (yearEl) yearEl.textContent = `${hijri.year}هـ`;
        
        if (gregEl) {
            const dayName = DAYS_NAMES[greg.getDay()];
            const day = greg.getDate();
            const month = GREGORIAN_MONTHS[greg.getMonth()];
            const year = greg.getFullYear();
            gregEl.textContent = `${dayName}، ${day} ${month} ${year}م`;
        }
    }
    
    function updateDisplay() {
        const monthEl = document.getElementById('cal-display-month');
        const yearEl = document.getElementById('cal-display-year');
        
        if (monthEl) monthEl.textContent = HIJRI_MONTHS[currentMonth - 1];
        if (yearEl) yearEl.textContent = `${currentYear}هـ`;
    }
    
    function changeMonth(dir) {
        currentMonth += dir;
        
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        } else if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        
        updateDisplay();
        renderCalendar();
    }
    
    function renderCalendar() {
        const grid = document.getElementById('calendar-days-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const firstDay = hijriToGregorian(currentYear, currentMonth, 1);
        const firstDayOfWeek = firstDay.getDay();
        const offset = firstDayOfWeek === 6 ? 0 : firstDayOfWeek + 1;
        
        const daysInMonth = getHijriMonthDays(currentYear, currentMonth);
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getHijriMonthDays(prevYear, prevMonth);
        
        // Previous month days
        for (let i = offset - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const gregDate = hijriToGregorian(prevYear, prevMonth, day);
            renderDay(day, gregDate.getDate(), true);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const gregDate = hijriToGregorian(currentYear, currentMonth, day);
            const isToday = isToday(currentYear, currentMonth, day);
            const isSelected = isSelected(currentYear, currentMonth, day);
            renderDay(day, gregDate.getDate(), false, isToday, isSelected);
        }
        
        // Next month days
        const totalCells = grid.children.length;
        const remaining = (7 - (totalCells % 7)) % 7;
        
        for (let day = 1; day <= remaining; day++) {
            const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
            const gregDate = hijriToGregorian(nextYear, nextMonth, day);
            renderDay(day, gregDate.getDate(), true);
        }
    }
    
    function renderDay(hijriDay, gregDay, isOther, isTodayDay, isSelectedDay) {
        const grid = document.getElementById('calendar-days-grid');
        if (!grid) return;
        
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        
        if (isOther) cell.classList.add('other-month');
        if (isTodayDay) cell.classList.add('today');
        if (isSelectedDay) cell.classList.add('selected');
        
        const eventKey = `${currentMonth}-${hijriDay}`;
        const events = ISLAMIC_EVENTS[eventKey];
        
        cell.innerHTML = `
            <span class="cal-hijri-day">${hijriDay}</span>
            <span class="cal-gregorian-day">${gregDay}</span>
            ${events ? `<div class="event-indicators">
                ${events.map(e => `<span class="event-dot ${e.type}"></span>`).join('')}
            </div>` : ''}
        `;
        
        if (!isOther) {
            cell.addEventListener('click', () => {
                selectedDate = { day: hijriDay, month: currentMonth, year: currentYear };
                renderCalendar();
                updateEventsDisplay({ day: hijriDay, month: currentMonth, year: currentYear });
            });
        }
        
        grid.appendChild(cell);
    }
    
    function updateEventsDisplay(date) {
        const eventsEl = document.getElementById('calendar-events');
        if (!eventsEl) return;
        
        const eventKey = `${date.month}-${date.day}`;
        const events = ISLAMIC_EVENTS[eventKey];
        
        if (!events || events.length === 0) {
            eventsEl.innerHTML = `
                <div class="no-events">
                    <span class="material-symbols-rounded">event_busy</span>
                    <p>لا توجد مناسبات في هذا اليوم</p>
                </div>
            `;
            return;
        }
        
        eventsEl.innerHTML = events.map(event => `
            <div class="calendar-event-item ${event.type}">
                <div class="calendar-event-title">${event.title}</div>
                ${event.description ? `<div class="calendar-event-desc">${event.description}</div>` : ''}
            </div>
        `).join('');
    }
    
    function isToday(year, month, day) {
        return todayHijri && todayHijri.year === year && 
               todayHijri.month === month && todayHijri.day === day;
    }
    
    function isSelected(year, month, day) {
        return selectedDate && selectedDate.year === year && 
               selectedDate.month === month && selectedDate.day === day;
    }
    
    // Date conversion functions (simplified)
    function gregorianToHijri(date) {
        const HIJRI_EPOCH = 1948439.5;
        const jd = dateToJulian(date);
        const l = Math.floor(jd - HIJRI_EPOCH) + 10632;
        const n = Math.floor((l - 1) / 10631);
        const l2 = l - 10631 * n + 354;
        const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor(50 * l2 / 17719)) +
                  (Math.floor(l2 / 5670)) * (Math.floor(43 * l2 / 15238));
        const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
                   (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
        const month = Math.floor((24 * l3) / 709);
        const day = l3 - Math.floor((709 * month) / 24);
        const year = 30 * n + j - 30;
        
        return { day: Math.floor(day), month: Math.floor(month), year: Math.floor(year) };
    }
    
    function hijriToGregorian(year, month, day) {
        const HIJRI_EPOCH = 1948439.5;
        const jd = Math.floor(HIJRI_EPOCH + 29.5 * (month - 1) + day + (year - 1) * 354.36667 - 1);
        return julianToDate(jd);
    }
    
    function dateToJulian(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        const a = Math.floor((14 - month) / 12);
        const y = year + 4800 - a;
        const m = month + 12 * a - 3;
        
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }
    
    function julianToDate(julian) {
        const a = julian + 32044;
        const b = Math.floor((4 * a + 3) / 146097);
        const c = a - Math.floor((146097 * b) / 4);
        const d = Math.floor((4 * c + 3) / 1461);
        const e = c - Math.floor((1461 * d) / 4);
        const m = Math.floor((5 * e + 2) / 153);
        
        const day = e - Math.floor((153 * m + 2) / 5) + 1;
        const month = m + 3 - 12 * Math.floor(m / 10);
        const year = 100 * b + d - 4800 + Math.floor(m / 10);
        
        return new Date(year, month - 1, day);
    }
    
    function getHijriMonthDays(year, month) {
        const base = month % 2 === 1 ? 30 : 29;
        if (month === 12) {
            return isHijriLeapYear(year) ? 30 : 29;
        }
        return base;
    }
    
    function isHijriLeapYear(year) {
        return (year * 11 + 14) % 30 < 11;
    }
})();
