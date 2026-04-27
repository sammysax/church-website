// Jesus Insurance Tabernacle - Modern JavaScript
class ChurchWebsite {
    constructor() {
        this.currentSection = 'home';
        this.isScrolling = false;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        // Never block the UI (or loader) on network content.
        this.setupEventListeners();
        this.initializeComponents();
        this.startServiceCountdown();
        this.handleLoadingScreen();
        this.animateStats();
        this.loadContent();
    }

    async loadContent() {
        try {
            // Load all content files
            const [hero, about, contact, programs, events, testimonies] = await Promise.all([
                fetch('content/hero.json').then(r => r.json()),
                fetch('content/about.json').then(r => r.json()),
                fetch('content/contact.json').then(r => r.json()),
                this.loadPrograms(),
                this.loadEvents(),
                this.loadTestimonies()
            ]);

            // Populate hero section
            this.populateHero(hero);
            
            // Populate about section
            this.populateAbout(about);
            
            // Populate contact section
            this.populateContact(contact);
            
            // Populate programs section
            this.populatePrograms(programs);
            
            // Populate events section
            this.populateEvents(events);

            // Populate testimonies section
            this.populateTestimonies(testimonies);
            
        } catch (error) {
            console.error('Error loading content:', error);
            // If content fails to load, site will use default HTML content
        }
    }

    async loadPrograms() {
        try {
            // Try to load programs list first
            const listResponse = await fetch('content/programs-list.json');
            if (listResponse.ok) {
                const fileList = await listResponse.json();
                if (Array.isArray(fileList)) {
                    const programs = await Promise.all(
                        fileList.map(file => 
                            fetch(`content/programs/${file}`)
                                .then(r => r.json())
                                .catch(() => null)
                        )
                    );
                    return programs.filter(p => p !== null);
                }
            }
            
            // Fallback: try loading known program files
            const knownFiles = ['sunday.json', 'last-day-month.json', 'thursday.json', 'first-thursday.json'];
            const programs = await Promise.all(
                knownFiles.map(file => 
                    fetch(`content/programs/${file}`)
                        .then(r => r.json())
                        .catch(() => null)
                )
            );
            return programs.filter(p => p !== null);
        } catch (error) {
            console.error('Error loading programs:', error);
            return [];
        }
    }

    async loadEvents() {
        try {
            // Primary source: one managed events file edited via CMS.
            const response = await fetch('content/events.json');
            if (!response.ok) {
                throw new Error('Unable to load content/events.json');
            }

            const payload = await response.json();
            const events = Array.isArray(payload) ? payload : payload.events;
            if (!Array.isArray(events)) {
                throw new Error('Invalid events payload format');
            }

            return events.filter(e => e && e.date).sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    }

    async loadTestimonies() {
        try {
            const response = await fetch('content/testimonies.json');
            if (!response.ok) {
                throw new Error('Unable to load content/testimonies.json');
            }

            const payload = await response.json();
            const testimonies = Array.isArray(payload) ? payload : payload.testimonies;
            if (!Array.isArray(testimonies)) return [];

            return testimonies
                .filter((item) => item && item.message)
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        } catch (error) {
            console.error('Error loading testimonies:', error);
            return [];
        }
    }

    populateHero(data) {
        const titleLine1 = document.querySelector('.hero-title .title-line:first-child');
        const titleLine2 = document.querySelector('.hero-title .title-line:last-child');
        const subtitle = document.querySelector('.hero-subtitle');
        const primaryBtn = document.querySelector('.hero-actions .btn-primary');
        const secondaryBtn = document.querySelector('.hero-actions .btn-secondary');

        if (titleLine1 && data.titleLine1) titleLine1.textContent = data.titleLine1;
        if (titleLine2 && data.titleLine2) titleLine2.textContent = data.titleLine2;
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;
        if (primaryBtn && data.primaryButtonText) primaryBtn.textContent = data.primaryButtonText;
        if (secondaryBtn && data.secondaryButtonText) {
            secondaryBtn.textContent = data.secondaryButtonText;
            if (data.secondaryButtonLink) secondaryBtn.href = data.secondaryButtonLink;
        }
    }

    populateAbout(data) {
        const superintendent = document.querySelector('.about-card:has(h3:contains("Leadership")) p strong');
        const missionCard = document.querySelector('.about-card:has(h3:contains("Mission")) p');
        const visionCard = document.querySelector('.about-card:has(h3:contains("Vision")) p');
        const valuesList = document.querySelector('.values-list');
        const communityStat = document.getElementById('community-members-stat');
        const yearsStat = document.querySelector('.stat-item:last-child .stat-number');

        // Update superintendent
        const leadershipCard = Array.from(document.querySelectorAll('.about-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Leadership')
        );
        if (leadershipCard && data.superintendent) {
            const p = leadershipCard.querySelector('p');
            if (p) p.innerHTML = `<strong>General Superintendent:</strong> ${data.superintendent}`;
        }

        // Update mission
        const missionCardEl = Array.from(document.querySelectorAll('.about-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Mission')
        );
        if (missionCardEl && data.mission) {
            const p = missionCardEl.querySelector('p');
            if (p) p.textContent = data.mission;
        }

        // Update vision
        const visionCardEl = Array.from(document.querySelectorAll('.about-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Vision')
        );
        if (visionCardEl && data.vision) {
            const p = visionCardEl.querySelector('p');
            if (p) p.textContent = data.vision;
        }

        // Update values
        if (valuesList && data.values && Array.isArray(data.values)) {
            valuesList.innerHTML = data.values.map(value => 
                `<li>${value}</li>`
            ).join('');
        }

        // Update stats
        if (communityStat && data.communityMembers) {
            communityStat.setAttribute('data-target', data.communityMembers);
        }
        if (yearsStat && data.yearsOfService) {
            yearsStat.setAttribute('data-target', data.yearsOfService);
        }
    }

    populateContact(data) {
        const addressCard = Array.from(document.querySelectorAll('.contact-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Visit')
        );
        const phoneCard = Array.from(document.querySelectorAll('.contact-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Call')
        );
        const emailCard = Array.from(document.querySelectorAll('.contact-card')).find(card => 
            card.querySelector('h3')?.textContent.includes('Email')
        );

        if (addressCard && data.address) {
            const p = addressCard.querySelector('p');
            if (p) p.textContent = data.address;
        }
        if (phoneCard && data.phone) {
            const p = phoneCard.querySelector('p');
            if (p) {
                const link = p.querySelector('a') || document.createElement('a');
                link.href = `tel:${data.phone}`;
                link.textContent = data.phone;
                if (!p.querySelector('a')) p.appendChild(link);
            }
        }
        if (emailCard && data.email) {
            const p = emailCard.querySelector('p');
            if (p) {
                const link = p.querySelector('a') || document.createElement('a');
                link.href = `mailto:${data.email}`;
                link.textContent = data.email;
                if (!p.querySelector('a')) p.appendChild(link);
            }
        }
    }

    populatePrograms(programs) {
        const programsContainer = document.querySelector('.programs-schedule');
        if (!programsContainer || !programs || programs.length === 0) return;

        programsContainer.innerHTML = programs.map(program => `
            <div class="program-item">
                <div class="program-day">
                    <span class="day-text">${program.day}</span>
                </div>
                <div class="program-details">
                    <h3>${program.name}</h3>
                    <div class="program-times">
                        ${program.times.map(time => `<span class="time-slot">${time}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateEvents(events) {
        const eventsContainer = document.querySelector('.events-grid');
        if (!eventsContainer || !events || events.length === 0) return;

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('en-US', { month: 'short' });
            const year = date.getFullYear();
            return { day, month, year };
        };

        eventsContainer.innerHTML = events.map(event => {
            const { day, month, year } = formatDate(event.date);
            return `
                <div class="event-card">
                    <div class="event-date">
                        <span class="date-day">${day}</span>
                        <span class="date-month">${month}</span>
                        <span class="date-year">${year}</span>
                    </div>
                    <div class="event-content">
                        ${event.tag ? `<span class="event-tag">${event.tag}</span>` : ''}
                        <h3>${event.title}</h3>
                        ${event.time ? `<p class="event-time">${event.time}</p>` : ''}
                        ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                        <a href="#contact" class="event-link">Learn More</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    populateTestimonies(testimonies) {
        const container = document.getElementById('testimoniesGrid');
        if (!container || !Array.isArray(testimonies) || testimonies.length === 0) return;

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        container.innerHTML = testimonies.slice(0, 6).map((item) => `
            <article class="testimony-card">
                <p class="testimony-message">${item.message}</p>
                <div class="testimony-meta">
                    <span class="testimony-name">${item.name || 'Anonymous'}</span>
                    ${item.date ? `<time class="testimony-date" datetime="${item.date}">${formatDate(item.date)}</time>` : ''}
                </div>
            </article>
        `).join('');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Footer quick links
        document.querySelectorAll('.footer-links a').forEach(link => {
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
            const hide = () => {
                if (loadingScreen.classList.contains('hidden')) return;
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            };

            // Preferred: hide after page fully loads.
            window.addEventListener('load', () => setTimeout(hide, 400));

            // Fallback: if any network request hangs, never keep users stuck.
            setTimeout(hide, 4500);
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const clickedLink = e.currentTarget;
        let targetSection = clickedLink.getAttribute('data-section');
        
        // If no data-section attribute, try to get section ID from href
        if (!targetSection) {
            const href = clickedLink.getAttribute('href');
            if (href && href.startsWith('#')) {
                targetSection = href.substring(1); // Remove the # prefix
            }
        }
        
        if (targetSection && targetSection !== this.currentSection) {
            this.navigateToSection(targetSection);
        }
        
        // Close mobile menu after navigation on mobile devices
        if (this.isMobile) {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navToggle && navMenu && navMenu.classList.contains('active')) {
                this.toggleMobileMenu(navToggle, navMenu);
            }
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
        const clickedLink = e.currentTarget;
        const targetId = clickedLink.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetSectionId = targetId.substring(1);
        const targetSection = document.getElementById(targetSectionId);

        // Sections are shown/hidden in this single-page layout, so switch section first.
        if (targetSection && targetSection.classList.contains('section')) {
            this.navigateToSection(targetSectionId);
            return;
        }

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
            await this.submitPrayerForm(form);
            this.showNotification('Prayer request / testimony submitted successfully.', 'success');
            form.reset();
            const prayerError = form.querySelector('#prayerRequest-error');
            if (prayerError) prayerError.textContent = '';
        } catch (error) {
            this.showNotification('There was an error processing your prayer request. Please try again.', 'error');
        } finally {
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

    async submitPrayerForm(form) {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Prayer form submission failed');
        }
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

    startServiceCountdown() {
        const daysEl = document.getElementById('countdownDays');
        const hoursEl = document.getElementById('countdownHours');
        const minutesEl = document.getElementById('countdownMinutes');
        const secondsEl = document.getElementById('countdownSeconds');
        const labelEl = document.getElementById('countdownLabel');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !labelEl) return;

        const schedule = [
            { name: 'Sunday Knowledge Class', type: 'weekly', day: 0, hour: 9, minute: 0 },
            { name: 'Sunday Solution Service', type: 'weekly', day: 0, hour: 10, minute: 0 },
            { name: 'Thursday Word Deeper Truth Hour', type: 'weekly', day: 4, hour: 18, minute: 0 },
            { name: 'Hour of Solution (1st Thursday)', type: 'monthly_nth_weekday', weekday: 4, nth: 1, hour: 10, minute: 0 },
            { name: 'Taking Over (Last Day)', type: 'monthly_last_day', hour: 22, minute: 0 }
        ];

        const pad = (value) => String(value).padStart(2, '0');

        const getNextTarget = (service, now) => {
            if (service.type === 'weekly') {
                const target = new Date(now);
                const dayDiff = (service.day - now.getDay() + 7) % 7;
                target.setDate(now.getDate() + dayDiff);
                target.setHours(service.hour, service.minute, 0, 0);
                if (target <= now) target.setDate(target.getDate() + 7);

                // Special monthly programs override regular Thursday service.
                if (service.day === 4 && this.isSpecialThursday(target)) {
                    target.setDate(target.getDate() + 7);
                }
                return target;
            }

            if (service.type === 'monthly_nth_weekday') {
                const year = now.getFullYear();
                const month = now.getMonth();
                const candidate = this.getNthWeekdayOfMonth(year, month, service.weekday, service.nth, service.hour, service.minute);
                if (candidate > now) return candidate;
                return this.getNthWeekdayOfMonth(year, month + 1, service.weekday, service.nth, service.hour, service.minute);
            }

            if (service.type === 'monthly_last_day') {
                const year = now.getFullYear();
                const month = now.getMonth();
                const candidate = this.getLastDayOfMonth(year, month, service.hour, service.minute);
                if (candidate > now) return candidate;
                return this.getLastDayOfMonth(year, month + 1, service.hour, service.minute);
            }

            return null;
        };

        const getNextService = () => {
            const now = new Date();
            let nextService = null;

            schedule.forEach((service) => {
                const target = getNextTarget(service, now);
                if (!target) return;

                if (!nextService || target < nextService.target) {
                    nextService = { ...service, target };
                }
            });

            return nextService;
        };

        const updateCountdown = () => {
            const nextService = getNextService();
            if (!nextService) return;

            const diffMs = nextService.target - new Date();
            if (diffMs <= 0) return;

            const totalSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const timeText = new Date(
                2000,
                0,
                1,
                nextService.hour,
                nextService.minute
            ).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

            labelEl.textContent = `${nextService.name} • ${timeText}`;
            daysEl.textContent = pad(days);
            hoursEl.textContent = pad(hours);
            minutesEl.textContent = pad(minutes);
            secondsEl.textContent = pad(seconds);
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    getNthWeekdayOfMonth(year, month, weekday, nth, hour, minute) {
        const date = new Date(year, month, 1, hour, minute, 0, 0);
        const firstWeekdayOffset = (weekday - date.getDay() + 7) % 7;
        const dayOfMonth = 1 + firstWeekdayOffset + (nth - 1) * 7;
        return new Date(year, month, dayOfMonth, hour, minute, 0, 0);
    }

    getLastDayOfMonth(year, month, hour, minute) {
        return new Date(year, month + 1, 0, hour, minute, 0, 0);
    }

    isSpecialThursday(date) {
        const day = date.getDay();
        if (day !== 4) return false;

        const dayOfMonth = date.getDate();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const isLastDay = dayOfMonth === lastDay;
        const isFirstThursday = dayOfMonth <= 7;

        return isFirstThursday || isLastDay;
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
