// Jesus Insurance Tabernacle - Modern JavaScript
class ChurchWebsite {
    constructor() {
        this.currentSection = 'home';
        this.isScrolling = false;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handleLoadingScreen();
        this.animateStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => this.toggleMobileMenu(navToggle, navMenu));
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Scroll events
        window.addEventListener('scroll', this.debounce(() => this.handleScroll(), 10), { passive: true });
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

        // Form submissions
        const prayerForm = document.getElementById('prayerForm');
        if (prayerForm) {
            prayerForm.addEventListener('submit', (e) => this.handlePrayerForm(e));
        }

        // Back to top button
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => this.scrollToTop());
        }

        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }

    initializeComponents() {
        // Initialize mobile detection
        this.updateMobileState();
        
        // Add touch-friendly improvements for mobile
        if (this.isMobile) {
            this.setupMobileEnhancements();
        }
    }

    handleLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Hide loading screen after content loads
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 1000);
            });
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetSection = e.target.getAttribute('data-section');
        
        if (targetSection && targetSection !== this.currentSection) {
            this.navigateToSection(targetSection);
        }
    }

    navigateToSection(sectionId) {
        const currentSection = document.querySelector('.section.active');
        const targetSection = document.getElementById(sectionId);
        
        if (!currentSection || !targetSection || currentSection === targetSection) return;

        // Update navigation state
        this.updateActiveNavLink(sectionId);
        
        // Animate section transition
        this.animateSectionTransition(currentSection, targetSection);
        
        this.currentSection = sectionId;
    }

    animateSectionTransition(currentSection, targetSection) {
        // Fade out current section
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            currentSection.classList.remove('active');
            currentSection.style.display = 'none';
            
            // Show and animate in target section
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            
            // Trigger reflow
            targetSection.offsetHeight;
            
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 300);
    }

    updateActiveNavLink(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    toggleMobileMenu(navToggle, navMenu) {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    }

    handleScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        
        // Update active navigation based on scroll position
        this.updateActiveSectionOnScroll();
        
        // Show/hide back to top button
        this.toggleBackToTop();
        
        // Parallax effect for hero section
        this.handleParallax();
        
        requestAnimationFrame(() => {
            this.isScrolling = false;
        });
    }

    updateActiveSectionOnScroll() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.pageYOffset + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id');
                if (sectionId !== this.currentSection) {
                    this.updateActiveNavLink(sectionId);
                    this.currentSection = sectionId;
                }
            }
        });
    }

    toggleBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }

    handleParallax() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && this.currentSection === 'home') {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    }

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleResize() {
        this.updateMobileState();
        
        // Close mobile menu if screen becomes larger
        if (!this.isMobile) {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navToggle && navMenu) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    }

    updateMobileState() {
        this.isMobile = window.innerWidth <= 768;
    }

    setupMobileEnhancements() {
        // Prevent zoom on double tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Improve form input experience on mobile
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    setTimeout(() => {
                        input.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 300);
                }
            });
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.service-card, .live-card, .event-card, .about-card, .contact-card').forEach(el => {
            observer.observe(el);
        });
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const animateStat = (element) => {
            const prayersStat = element.id === 'prayers-answered-stat';
            const communityStat = element.id === 'community-members-stat';
            const target = parseInt(element.getAttribute('data-target'));
            const start = prayersStat ? parseInt(element.getAttribute('data-start') || '0') : 0;
            const duration = prayersStat ? 6000 : communityStat ? 12000 : 2000;
            const step = (target - start) / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
        };

        // Animate stats when they come into view
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    // Only unobserve non-prayers stat so prayers can re-animate if needed
                    if (entry.target.id !== 'prayers-answered-stat') {
                        statsObserver.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    async handlePrayerForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Validate form
        if (!this.validatePrayerForm(form)) {
            return;
        }
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission (replace with actual API call)
            await this.submitPrayerRequest(form);
            
            // Show success message
            this.showNotification('Prayer request submitted successfully! We will lift you up in prayer.', 'success');
            form.reset();
            
        } catch (error) {
            this.showNotification('There was an error submitting your prayer request. Please try again.', 'error');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    validatePrayerForm(form) {
        const prayerRequest = form.querySelector('#prayerRequest');
        const errorElement = form.querySelector('#prayerRequest-error');
        
        if (!prayerRequest.value.trim()) {
            errorElement.textContent = 'Prayer request is required';
            prayerRequest.focus();
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    async submitPrayerRequest(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name') || 'Anonymous',
            email: formData.get('email') || 'No email provided',
            prayerRequest: formData.get('prayerRequest'),
            isAnonymous: formData.get('anonymous') === 'on',
            timestamp: new Date().toISOString()
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For now, just log the data (replace with actual API call)
        console.log('Prayer request data:', data);
        
        // You can implement actual API call here:
        // const response = await fetch('/api/prayer-requests', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Failed to submit prayer request');
        // }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    debounce(func, wait) {
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
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChurchWebsite();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .section.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    .service-card,
    .live-card,
    .event-card,
    .about-card,
    .contact-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card.animate-in,
    .live-card.animate-in,
    .event-card.animate-in,
    .about-card.animate-in,
    .contact-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style); 