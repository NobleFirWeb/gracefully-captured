/* ================================================================
   GRACE SUTHERLAND PHOTOGRAPHY
   GSAP-Powered — works across homepage + inner pages
   ================================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------
   UTILITY — manual character split (avoids GSAP SplitText paywall)
   ---------------------------------------------------------------- */
function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = text.split('').map(c =>
        `<span class="char" style="display:inline-block">${c === ' ' ? ' ' : c}</span>`
    ).join('');
    return el.querySelectorAll('.char');
}

/* ================================================================
   PAGE LOADER  (all pages)
   ================================================================ */
(function initLoader() {
    const tl = gsap.timeline({
        onComplete() {
            const loader = document.getElementById('page-loader');
            if (loader) { loader.style.display = 'none'; loader.style.pointerEvents = 'none'; }
            initPageEntrance();   // fire page-specific entry animations
        }
    });

    tl.to('.loader-monogram', { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
      .to('.loader-divider',  { opacity: 1, scaleX: 1, duration: 0.42, ease: 'power2.out' }, '-=0.15')
      .to('.loader-name',     { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }, '-=0.18')
      .to('.loader-tag',      { opacity: 1, duration: 0.32, ease: 'power2.out' }, '-=0.1')
      .to({}, { duration: 0.42 })                                                    // hold
      .to('.loader-center',   { opacity: 0, scale: 0.94, duration: 0.28, ease: 'power2.in' })
      .to('.loader-panel--left',  { xPercent: -100, duration: 0.85, ease: 'power3.inOut' }, '-=0.05')
      .to('.loader-panel--right', { xPercent:  100, duration: 0.85, ease: 'power3.inOut' }, '<');
})();

/* ================================================================
   PAGE ENTRANCE  — detect which hero is present, animate it
   ================================================================ */
function initPageEntrance() {
    if (document.querySelector('.hero-title__line')) {
        initHomeHeroAnimations();
    } else if (document.querySelector('.page-hero__title')) {
        initInnerHeroAnimations();
    } else if (document.querySelector('.contact-hero__title')) {
        initContactHeroAnimation();
    }
}

/* ---------- Homepage hero ---------- */
function initHomeHeroAnimations() {
    document.querySelectorAll('.hero-title__line').forEach(splitChars);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-eyebrow',    { opacity: 1, y: 0, duration: 0.65 })
      .to('.hero-title .char',{
          opacity: 1, y: 0, duration: 0.55,
          stagger: { each: 0.027, from: 'start' }
      }, '-=0.25')
      .to('.hero-descriptor', { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
      .to('.hero-actions',    { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to('.hero-scroll',     { opacity: 1,        duration: 0.4 }, '-=0.1');

    // Parallax
    gsap.to('#hero-img', {
        yPercent: 22, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
}

/* ---------- Inner page hero (About, Services) ---------- */
function initInnerHeroAnimations() {
    const titleEl = document.querySelector('.page-hero__title');
    // Only do char-split on plain-text titles (no br / em / nested tags)
    const hasMarkup = titleEl && (titleEl.querySelector('br, em, strong') || titleEl.innerHTML.includes('&amp;'));

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.page-hero__eyebrow', { opacity: 1, y: 0, duration: 0.6 });

    if (titleEl && !hasMarkup) {
        splitChars(titleEl);
        tl.to('.page-hero__title .char', {
            opacity: 1, y: 0, duration: 0.55,
            stagger: { each: 0.03, from: 'start' }
        }, '-=0.2');
    } else {
        // Animate whole title as a block — preserves <br> and entity markup
        gsap.set('.page-hero__title', { y: 35, opacity: 0 });
        tl.to('.page-hero__title', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.2');
    }

    tl.to('.page-hero__sub', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

    // Parallax on inner hero image
    gsap.to('.page-hero__img', {
        yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
}

/* ---------- Contact page (no photo hero) ---------- */
function initContactHeroAnimation() {
    // Title contains <br> + <em> so animate as whole block to preserve markup
    gsap.set('.contact-hero__title', { y: 30, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.contact-hero__eyebrow', { opacity: 1, y: 0, duration: 0.6 })
      .to('.contact-hero__title',   { y: 0, opacity: 1, duration: 0.7 }, '-=0.2')
      .to('.contact-hero__sub',     { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
}

/* ================================================================
   NAVIGATION
   ================================================================ */
const header    = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

// Scrolled state
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// Mobile hamburger
function setMenuOpen(isOpen) {
    navMenu.classList.toggle('open', isOpen);
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // backdrop-filter on the header creates a containing block that clips
    // position:fixed children — disable it while the overlay is open
    header.style.backdropFilter         = isOpen ? 'none' : '';
    header.style.webkitBackdropFilter   = isOpen ? 'none' : '';
}

navToggle.addEventListener('click', () => setMenuOpen(!navMenu.classList.contains('open')));

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
});

// Active nav link based on current page filename
(function setActiveLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = (link.getAttribute('href') || '').replace('./', '');
        const linkFile = href.split('#')[0].split('/').pop();
        if (linkFile && linkFile === currentFile) {
            link.classList.add('nav-link--active');
        }
    });
})();

/* ================================================================
   SCROLL-TRIGGERED ANIMATIONS  (shared helper)
   ================================================================ */
function fadeUp(targets, trigger, opts = {}) {
    if (!document.querySelector(typeof targets === 'string' ? targets : targets[0])) return;
    gsap.from(targets, {
        y: opts.y ?? 44, opacity: 0,
        duration: opts.duration ?? 0.8,
        stagger: opts.stagger ?? 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger, start: opts.start ?? 'top 78%' }
    });
}

function initScrollAnimations() {

    /* ---- Homepage-only sections ---- */
    if (document.querySelector('.about-media')) {
        gsap.from('.about-media', {
            x: -55, opacity: 0, duration: 1.05, ease: 'power3.out',
            scrollTrigger: { trigger: '.about', start: 'top 72%' }
        });
        fadeUp('.about-content > *', '.about-content', { stagger: 0.11, start: 'top 75%' });
        gsap.to('.about-img', {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }

    if (document.querySelector('.services-header')) {
        fadeUp('.services-header > *', '.services-header', { stagger: 0.1, start: 'top 80%' });
        // Service cards rise in one at a time, left to right
        gsap.from('.service-card', {
            y: 48,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: { each: 0.15, from: 'start' },
            scrollTrigger: { trigger: '.services-grid', start: 'top 78%' }
        });
    }

    if (document.querySelector('.portfolio-header')) {
        fadeUp('.portfolio-header > *', '.portfolio-header', { stagger: 0.1, start: 'top 80%' });
        gsap.from('.portfolio-item', {
            y: 35, opacity: 0, duration: 0.6,
            stagger: { each: 0.07, from: 'start' }, ease: 'power3.out',
            scrollTrigger: { trigger: '.portfolio-grid', start: 'top 82%' }
        });
    }

    if (document.querySelector('.reviews-bg-img')) {
        // yPercent: 10 — safe maximum given height:130% / top:-15% buffer
        // Formula: 10% × 130% height = 13% travel < 15% buffer → frame never shows background
        gsap.to('.reviews-bg-img', {
            yPercent: 10, ease: 'none',
            scrollTrigger: { trigger: '.reviews', start: 'top bottom', end: 'bottom top', scrub: true }
        });
        fadeUp('.reviews-inner > *', '.reviews-inner', { stagger: 0.12, start: 'top 72%' });
    }

    if (document.querySelector('.contact-inner')) {
        fadeUp('.contact-left > *', '.contact-inner', { stagger: 0.1, start: 'top 74%' });
        gsap.from('.contact-right', {
            y: 40, opacity: 0, duration: 0.8, delay: 0.18, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-inner', start: 'top 74%' }
        });
    }

    /* ---- About page sections ---- */
    if (document.querySelector('.story-inner')) {
        gsap.from('.story-text',       { x: -50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.story-inner', start: 'top 74%' } });
        gsap.from('.story-pullquote',  { x:  50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.story-inner', start: 'top 74%' } });
    }

    if (document.querySelector('.approach-cards')) {
        fadeUp('.approach-header > *', '.approach-header', { stagger: 0.1, start: 'top 80%' });
        fadeUp('.approach-card', '.approach-cards', { stagger: 0.1, y: 50, start: 'top 82%' });
    }

    if (document.querySelector('.stats-strip')) {
        fadeUp('.stat-item', '.stats-strip', { stagger: 0.1, y: 30, start: 'top 80%' });
    }

    /* ---- Services page sections ---- */
    if (document.querySelector('.service-row')) {
        document.querySelectorAll('.service-row').forEach((row, i) => {
            const dir = row.classList.contains('service-row--flip') ? 50 : -50;
            gsap.from(row.querySelector('.service-row__media'), {
                x: dir, opacity: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: row, start: 'top 75%' }
            });
            gsap.from(row.querySelector('.service-row__content'), {
                x: -dir, opacity: 0, duration: 1, delay: 0.12, ease: 'power3.out',
                scrollTrigger: { trigger: row, start: 'top 75%' }
            });
        });
    }

    if (document.querySelector('.process-section')) {
        fadeUp('.process-header > *', '.process-header', { stagger: 0.1, start: 'top 80%' });
        fadeUp('.process-step', '.process-steps', { stagger: 0.14, y: 40, start: 'top 80%' });
    }

    if (document.querySelector('.featured-quote__text')) {
        fadeUp('.featured-quote-inner > *', '.featured-quote-inner', { stagger: 0.14, start: 'top 75%' });
        gsap.to('.featured-quote-section__bg img', {
            yPercent: 18, ease: 'none',
            scrollTrigger: { trigger: '.featured-quote-section', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }

    /* ---- Testimonials (on all inner pages) ---- */
    if (document.querySelector('.testimonials-section')) {
        fadeUp('.testimonials-header > *', '.testimonials-header', { stagger: 0.1, start: 'top 80%' });
        fadeUp('.testimonial-card', '.testimonial-cards', { stagger: 0.1, y: 40, start: 'top 82%' });
    }

    if (document.querySelector('.cta-inner')) {
        fadeUp('.cta-inner > *', '.cta-inner', { stagger: 0.12, start: 'top 78%' });
    }

    /* ---- Contact page ---- */
    if (document.querySelector('.contact-extended')) {
        fadeUp('.contact-extended .contact-left > *', '.contact-extended', { stagger: 0.1, start: 'top 74%' });
        gsap.from('.contact-extended .contact-right', {
            y: 40, opacity: 0, duration: 0.8, delay: 0.18, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-extended', start: 'top 74%' }
        });
    }

    if (document.querySelector('.faq-section')) {
        fadeUp('.faq-header > *', '.faq-header', { stagger: 0.1, start: 'top 80%' });
    }

    if (document.querySelector('.testimonials-strip')) {
        fadeUp('.strip-quote', '.testimonials-strip', { stagger: 0.12, y: 30, start: 'top 82%' });
    }
}

setTimeout(initScrollAnimations, 80);

/* ================================================================
   PORTFOLIO LIGHTBOX  (homepage only)
   ================================================================ */
const portfolioModal = document.getElementById('portfolio-modal');

if (portfolioModal) {
    const modalTitle    = document.getElementById('modal-title');
    const swiperWrapper = document.getElementById('swiper-wrapper');
    let portfolioSwiper = null;

    const galleries = {
        rylee: [
            './img/Rylee Holmes/img_1.jpg',
            './img/Rylee Holmes/img_2.jpg',
            './img/Rylee Holmes/img_3jpg.jpg',
            './img/Rylee Holmes/img_4.jpg',
            './img/rylee_holmes_cover.jpg',
        ],
        jacob: [
            './img/Jacob Singleton/img_1.jpg',
            './img/Jacob Singleton/img_2.jpg',
            './img/Jacob Singleton/img_3.jpg',
            './img/jacob-cover.jpg',
        ],
        single: null,
    };

    function openModal(name, galleryKey, coverSrc) {
        const tmp = document.createElement('div');
        tmp.innerHTML = name;
        modalTitle.textContent = tmp.textContent;

        const images = galleries[galleryKey] || [coverSrc];
        swiperWrapper.innerHTML = images
            .map(src => `<div class="swiper-slide"><img src="${src}" alt="${tmp.textContent}" loading="lazy"></div>`)
            .join('');

        if (portfolioSwiper) { portfolioSwiper.destroy(true, true); portfolioSwiper = null; }

        portfolioSwiper = new Swiper('#portfolio-swiper', {
            slidesPerView: 1,
            loop: images.length > 1,
            speed: 480,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination:  { el: '.swiper-pagination', clickable: true },
            keyboard:    { enabled: true },
        });

        portfolioModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        gsap.fromTo('.portfolio-modal__inner',
            { scale: 0.94, opacity: 0 },
            { scale: 1,    opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
    }

    function closeModal() {
        gsap.to('.portfolio-modal__inner', {
            scale: 0.94, opacity: 0, duration: 0.3, ease: 'power2.in',
            onComplete() {
                portfolioModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', () => {
            openModal(item.dataset.name, item.dataset.gallery, item.querySelector('img').getAttribute('src'));
        });
    });

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.querySelector('.portfolio-modal__backdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && portfolioModal.classList.contains('open')) closeModal();
    });
}

/* ================================================================
   REVIEWS AUTO-CAROUSEL  (homepage only)
   ================================================================ */
const reviewItems = document.querySelectorAll('.review-item');
const reviewDots  = document.querySelectorAll('.reviews-dot');

if (reviewItems.length) {
    let current  = 0;
    let interval = null;

    function showReview(idx) {
        reviewItems[current].classList.remove('active');
        reviewDots[current].classList.remove('active');
        current = idx;
        reviewItems[current].classList.add('active');
        reviewDots[current].classList.add('active');
    }

    reviewDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            showReview(i);
            interval = setInterval(() => showReview((current + 1) % reviewItems.length), 5000);
        });
    });

    interval = setInterval(() => showReview((current + 1) % reviewItems.length), 5000);
}

/* ================================================================
   FAQ ACCORDION  (Services & Contact pages)
   ================================================================ */
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});

/* ================================================================
   SCROLL-TO-TOP BUTTON
   ================================================================ */
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 420);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ================================================================
   CONTACT FORM — feedback on all pages that have one
   ================================================================ */
document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Sent! <i class="ri-check-line"></i>';
        btn.disabled  = true;
        gsap.from(btn, { scale: 0.96, duration: 0.3, ease: 'back.out(2)' });
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; this.reset(); }, 4000);
    });
});
