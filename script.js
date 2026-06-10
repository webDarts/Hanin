/* ============================================
   Hanin AbuAtieh — Portfolio interactions
   No dependencies, no build step. Vanilla JS.
   ============================================ */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------
       Helpers
       ------------------------------------------------ */

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const onReady = (fn) => {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    };

    const onScrollProgress = (fn) => {
        if (!('requestAnimationFrame' in window)) return () => {};
        let ticking = false;
        const update = () => { fn(); ticking = false; };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        return () => window.removeEventListener('scroll', update);
    };

    onReady(() => {
        document.documentElement.classList.add('js-ready');
    });

    /* ------------------------------------------------
       Footer year
       ------------------------------------------------ */

    onReady(() => {
        const yearEl = $('#footerYear');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    });

    /* ------------------------------------------------
       Dark mode toggle
       ------------------------------------------------ */

    onReady(() => {
        const toggle = $('#themeToggle');
        if (!toggle) return;

        const html = document.documentElement;
        const STORAGE_KEY = 'hanin-theme';

        const applyTheme = (theme) => {
            html.setAttribute('data-theme', theme);
            toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            toggle.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
            try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
        };

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })();

        if (saved === 'dark' || saved === 'light') {
            applyTheme(saved);
        } else {
            applyTheme(prefersDark.matches ? 'dark' : 'light');
        }

        toggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    });

    /* ------------------------------------------------
       Hero background slideshow
       ------------------------------------------------ */

    onReady(() => {
        const photoGrid = $('#heroPhotos');
        if (!photoGrid) return;

        const slides = [
            'BG/DSC06450.jpg',
            'BG/DSC06477.webp',
            'BG/DSC06511.webp',
            'BG/0W2A3803.jpg',
            'BG/hero.jpg',
        ];

        const totalDuration = 25;
        const perSlide = totalDuration / slides.length;

        slides.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.draggable = false;
            img.style.animation = 'heroSlideshow ' + totalDuration + 's ease-in-out ' + (-(i * perSlide)) + 's infinite';
            photoGrid.appendChild(img);
        });
    });

    /* ------------------------------------------------
       Mobile nav toggle
       ------------------------------------------------ */

    onReady(() => {
        const toggle = $('#navToggle');
        const navLinks = $('#navLinks');
        const nav = $('#nav');
        if (!toggle || !navLinks || !nav) return;

        const closeMenu = () => {
            navLinks.classList.remove('nav__links--open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        };

        const openMenu = () => {
            navLinks.classList.add('nav__links--open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('nav-open');
        };

        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            expanded ? closeMenu() : openMenu();
        });

        $$('a', navLinks).forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Add shadow on scroll
        let lastScroll = 0;
        const onScroll = () => {
            const y = window.scrollY;
            nav.classList.toggle('scrolled', y > 50);
            lastScroll = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    });

    /* ------------------------------------------------
       Scroll progress bar
       ------------------------------------------------ */

    onReady(() => {
        const bar = $('#scrollProgress');
        if (!bar) return;

        const update = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
            bar.style.width = pct + '%';
        };

        onScrollProgress(update);
        update();
    });

    /* ------------------------------------------------
       Back to top
       ------------------------------------------------ */

    onReady(() => {
        const btn = $('#backToTop');
        if (!btn) return;

        const toggleVisible = () => {
            const visible = window.scrollY > 600;
            if (visible) btn.removeAttribute('hidden');
            else btn.setAttribute('hidden', '');
        };

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        window.addEventListener('scroll', toggleVisible, { passive: true });
        toggleVisible();
    });

    /* ------------------------------------------------
       Active nav link on scroll (IntersectionObserver)
       ------------------------------------------------ */

    onReady(() => {
        const navLinks = $$('a[data-nav-link]');
        if (navLinks.length === 0 || !('IntersectionObserver' in window)) return;

        const sections = navLinks
            .map((link) => {
                const id = link.getAttribute('href');
                if (!id || !id.startsWith('#')) return null;
                const section = document.getElementById(id.slice(1));
                if (!section) return null;
                return { link, section };
            })
            .filter(Boolean);

        if (sections.length === 0) return;

        const setActive = (id) => {
            sections.forEach(({ link }) => {
                const isMatch = link.getAttribute('href') === '#' + id;
                link.classList.toggle('is-active', isMatch);
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );

        sections.forEach(({ section }) => observer.observe(section));
    });

    /* ------------------------------------------------
       Reveal on scroll (with staggered delays)
       ------------------------------------------------ */

    onReady(() => {
        const items = $$('[data-reveal]');
        if (items.length === 0) return;

        // Apply staggered delays for elements explicitly opted in
        // via data-reveal-index. Groups are determined by shared parent
        // (so the index resets per grid/row).
        const groups = new Map();
        items.forEach((el) => {
            if (!el.hasAttribute('data-reveal-index')) return;
            const parent = el.parentElement || document.body;
            const idx = groups.get(parent) || 0;
            el.style.setProperty('--reveal-delay', String(idx));
            groups.set(parent, idx + 1);
        });

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-revealed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -5% 0px', threshold: 0 }
        );

        items.forEach((el) => observer.observe(el));
    });

    /* ------------------------------------------------
       Smooth scroll for in-page anchor links
       ------------------------------------------------ */

    onReady(() => {
        // CSS already provides scroll-behavior: smooth with scroll-padding-top.
        // We add a click handler to respect reduced-motion and to close
        // the mobile menu when navigating. Skip links that are external
        // (mailto:, tel:, http(s)://) or that explicitly opt out.
        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.length < 2) return;

                const target = document.getElementById(href.slice(1));
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });

                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, '', href);
                }
            });
        });
    });

    /* ------------------------------------------------
       Project filter
       ------------------------------------------------ */

    onReady(() => {
        const grid = $('#projectsGrid');
        const status = $('#projectsStatus');
        const chips = $$('.filter-chip');
        if (!grid || chips.length === 0) return;

        const cards = $$('.project-card', grid);

        const applyFilter = (filter) => {
            let visibleCount = 0;
            cards.forEach((card) => {
                const cat = card.dataset.category;
                const show = filter === 'all' || cat === filter;
                card.classList.toggle('is-hidden', !show);
                if (show) visibleCount += 1;
            });

            if (status) {
                if (filter === 'all') {
                    status.hidden = true;
                } else {
                    const label = filter.charAt(0).toUpperCase() + filter.slice(1);
                    status.textContent = `Showing ${visibleCount} ${label} project${visibleCount === 1 ? '' : 's'}.`;
                    status.hidden = false;
                }
            }
        };

        const updateCounts = () => {
            const counts = cards.reduce((acc, card) => {
                const cat = card.dataset.category;
                acc.all = (acc.all || 0) + 1;
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});

            $$('[data-filter-count]').forEach((el) => {
                const key = el.dataset.filterCount;
                if (counts[key] !== undefined) el.textContent = String(counts[key]);
            });
        };

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;
                if (!filter) return;

                chips.forEach((c) => {
                    const active = c === chip;
                    c.classList.toggle('is-active', active);
                    c.setAttribute('aria-pressed', String(active));
                });

                applyFilter(filter);
            });
        });

        updateCounts();
    });

    /* ------------------------------------------------
       Lightbox
       ------------------------------------------------ */

    onReady(() => {
        const lightbox = $('#lightbox');
        const imageEl = $('#lightboxImage');
        const captionEl = $('#lightboxCaption');
        const counterEl = $('#lightboxCounter');
        if (!lightbox || !imageEl) return;

        // Build a global gallery: every project-card gallery on the page.
        // Use data-full-src if available, otherwise fall back to currentSrc/src.
        // Track by index to handle duplicate src values.
        const allItems = $$('[data-gallery] img').map((img) => ({
            src: img.getAttribute('data-full-src') || img.currentSrc || img.src,
            alt: img.alt || '',
            _el: img
        }));

        if (allItems.length === 0) return;

        let currentIndex = 0;
        let lastFocused = null;

        const render = () => {
            const item = allItems[currentIndex];
            if (!item) return;
            imageEl.src = item.src;
            imageEl.alt = item.alt;
            captionEl.textContent = item.alt;
            if (counterEl) counterEl.textContent = (currentIndex + 1) + ' / ' + allItems.length;
        };

        const open = (index, triggerEl) => {
            currentIndex = index;
            render();
            lightbox.hidden = false;
            lastFocused = triggerEl || document.activeElement;
            document.body.style.overflow = 'hidden';
            // Defer focus to next frame so the element is visible
            requestAnimationFrame(() => {
                const closeBtn = lightbox.querySelector('[data-lightbox-close]');
                if (closeBtn) closeBtn.focus();
            });
        };

        const close = () => {
            lightbox.hidden = true;
            imageEl.src = '';
            document.body.style.overflow = '';
            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        };

        const next = () => {
            currentIndex = (currentIndex + 1) % allItems.length;
            render();
        };

        const prev = () => {
            currentIndex = (currentIndex - 1 + allItems.length) % allItems.length;
            render();
        };

        // Wire up triggers — use index directly to handle duplicate src values
        const galleryImgs = $$('[data-gallery] img');
        galleryImgs.forEach((img, idx) => {
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', 'View image: ' + (img.alt || 'project image'));

            const handler = () => {
                // Match by element reference, not src string
                const index = allItems.findIndex((i) => i._el === img);
                if (index >= 0) open(index, img);
            };

            img.addEventListener('click', handler);
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handler();
                }
            });
        });

        // Controls
        lightbox.addEventListener('click', (e) => {
            const target = e.target.closest('[data-lightbox-close]');
            if (target) close();
        });

        $$('[data-lightbox-prev]', lightbox).forEach((btn) => btn.addEventListener('click', prev));
        $$('[data-lightbox-next]', lightbox).forEach((btn) => btn.addEventListener('click', next));

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (lightbox.hidden) return;
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    close();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    next();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prev();
                    break;
            }
        });

        // Touch swipe
        let touchStartX = 0;
        let touchStartY = 0;
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) next();
                else prev();
            }
        }, { passive: true });
    });

    /* ------------------------------------------------
       Image error fallback
       ------------------------------------------------ */

    onReady(() => {
        $$('img').forEach((img) => {
            img.addEventListener(
                'error',
                () => {
                    const w = img.naturalWidth || 400;
                    const h = img.naturalHeight || 300;
                    img.src =
                        'data:image/svg+xml;utf8,' +
                        encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">` +
                            `<rect width="100%" height="100%" fill="#E8D5B7"/>` +
                            `<text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#7A7067" text-anchor="middle" dy=".3em">Image unavailable</text>` +
                            `</svg>`
                        );
                    img.style.objectFit = 'contain';
                },
                { once: true }
            );
        });
    });

    /* ------------------------------------------------
       Page loader
       ------------------------------------------------ */

    onReady(() => {
        const loader = $('.page-loader');
        if (!loader) return;

        const hide = () => {
            loader.classList.add('is-hidden');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 700);
        };

        document.body.style.overflow = 'hidden';

        if (prefersReducedMotion) {
            hide();
            return;
        }

        // Wait for fonts + a minimum display time + hero images decode
        const minTime = new Promise((r) => setTimeout(r, 1400));
        const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
        const heroImgs = $$('#heroPhotos img, .about__photo');
        const imagesReady = Promise.all(
            heroImgs.map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((res) => {
                    img.addEventListener('load', res, { once: true });
                    img.addEventListener('error', res, { once: true });
                });
            })
        );

        Promise.all([minTime, fontsReady, imagesReady]).then(hide);

        // Safety fallback
        setTimeout(hide, 4000);
    });

    /* ------------------------------------------------
       Custom cursor
       ------------------------------------------------ */

    onReady(() => {
        if (prefersReducedMotion) return;
        if (window.matchMedia('(hover: none)').matches) return;

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        // Smooth ring follow
        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);

        // Hover state on interactive elements
        const hoverTargets = 'a, button, [role="button"], .filter-chip, .project-card__details summary, .project-card__gallery img, .nav__toggle, .lightbox__btn, .contact__item';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                dot.classList.add('is-hovering');
                ring.classList.add('is-hovering');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                dot.classList.remove('is-hovering');
                ring.classList.remove('is-hovering');
            }
        });

        // Click animation
        document.addEventListener('mousedown', () => {
            dot.classList.add('is-clicking');
            ring.classList.add('is-clicking');
        });

        document.addEventListener('mouseup', () => {
            dot.classList.remove('is-clicking');
            ring.classList.remove('is-clicking');
        });
    });

    /* ------------------------------------------------
       Magnetic buttons
       ------------------------------------------------ */

    onReady(() => {
        if (prefersReducedMotion) return;
        if (window.matchMedia('(hover: none)').matches) return;

        $$('.hero__cta, .magnetic').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    });

    /* ------------------------------------------------
       Text reveal (char by char)
       ------------------------------------------------ */

    onReady(() => {
        if (prefersReducedMotion) return;

        const targets = $$('.hero__name, .section__title');

        targets.forEach((el) => {
            const text = el.textContent;
            el.innerHTML = '';
            el.classList.add('text-reveal');

            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.className = 'text-reveal__char' + (char === ' ' ? ' text-reveal__char--space' : '');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.transitionDelay = (i * 20) + 'ms';
                el.appendChild(span);
            });
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const chars = $$('.text-reveal__char', entry.target);
                        chars.forEach((c) => c.classList.add('is-visible'));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0 }
        );

        targets.forEach((el) => observer.observe(el));
    });

    /* ------------------------------------------------
       Animated counters (stats)
       ------------------------------------------------ */

    onReady(() => {
        const counters = $$('[data-counter]');
        if (counters.length === 0) return;

        const animateCount = (el) => {
            const target = parseInt(el.dataset.counter, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();

            const step = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                el.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target;
                    // Add suffix
                    if (suffix) {
                        const suffixSpan = document.createElement('span');
                        suffixSpan.className = 'stats__suffix';
                        suffixSpan.textContent = suffix;
                        el.appendChild(suffixSpan);
                    }
                }
            };

            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        counters.forEach((el) => observer.observe(el));
    });

    /* ------------------------------------------------
       Image tilt effect (project cards)
       ------------------------------------------------ */

    onReady(() => {
        if (prefersReducedMotion) return;
        if (window.matchMedia('(hover: none)').matches) return;

        $$('.project-card').forEach((card) => {
            card.classList.add('tilt-card');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const tiltX = (y - 0.5) * 8;
                const tiltY = (x - 0.5) * -8;

                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.005)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    });

    /* ------------------------------------------------
       Parallax hero (portrait + shapes)
       ------------------------------------------------ */

    onReady(() => {
        if (prefersReducedMotion) return;

        const shapes = $$('.hero__parallax-shape');
        if (shapes.length === 0) return;

        const update = () => {
            const scrollY = window.scrollY;
            const heroH = window.innerHeight;
            if (scrollY > heroH * 1.2) return;

            const progress = Math.min(scrollY / heroH, 1);

            shapes.forEach((shape, i) => {
                const speed = 0.15 + (i * 0.08);
                const y = scrollY * speed;
                shape.style.transform = `translate3d(0, ${y}px, 0)`;
            });
        };

        onScrollProgress(update);
        update();
    });

    /* ------------------------------------------------
       Marquee band — duplicate content for seamless loop
       ------------------------------------------------ */

    onReady(() => {
        const track = $('.marquee-band__track');
        if (!track) return;

        // Clone children for seamless loop
        const children = Array.from(track.children);
        children.forEach((child) => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    });

    /* ------------------------------------------------
       (Hero ambient elements are now static in HTML)
       ------------------------------------------------ */
})();
