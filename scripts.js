// =============================================
// FOOTER ACCORDION
// =============================================
(function() {
  'use strict';
  const MOBILE_BREAKPOINT = 991;
  let currentlyOpen = null;
  let isAnimating = false;
  let isInitialized = false;

  function init() {
    const dropdownItems = document.querySelectorAll('.footer-nav-menu-column');
    if (dropdownItems.length === 0) return;

    dropdownItems.forEach(item => {
      const title = item.querySelector('.footer-dropdown-trigger');
      const content = item.querySelector('.footer-dropdown-wrapper');
      const icon = item.querySelector('.dropdown-trigger-icon');

      if (!icon._rotation) icon._rotation = 0;

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        // Mobile: collapse and enable accordion
        if (!item.classList.contains('is-open')) {
          gsap.set(content, { height: 0, overflow: 'hidden', opacity: 0 });
        }
        if (!isInitialized) {
          title.addEventListener('click', handleClick);
        }
      } else {
        // Desktop: reset to visible
        item.classList.remove('is-open');
        gsap.set(content, { height: 'auto', overflow: 'visible', opacity: 1 });
        gsap.set(icon, { rotation: 0 });
        icon._rotation = 0;
        currentlyOpen = null;
      }
    });

    isInitialized = true;
  }

  function handleClick(e) {
    if (window.innerWidth > MOBILE_BREAKPOINT) return;
    if (isAnimating) return;

    const item = e.currentTarget.closest('.footer-nav-menu-column');
    const content = item.querySelector('.footer-dropdown-wrapper');
    const icon = item.querySelector('.dropdown-trigger-icon');
    const isOpen = item.classList.contains('is-open');

    if (isOpen) {
      closeAccordion(item, content, icon);
    } else {
      if (currentlyOpen && currentlyOpen !== item) {
        const openItem = currentlyOpen;
        const openContent = openItem.querySelector('.footer-dropdown-wrapper');
        const openIcon = openItem.querySelector('.dropdown-trigger-icon');
        closeAccordion(openItem, openContent, openIcon, () => {
          openAccordion(item, content, icon);
        });
      } else {
        openAccordion(item, content, icon);
      }
    }
  }

  function openAccordion(item, content, icon, onComplete) {
    isAnimating = true;
    item.classList.add('is-open');
    currentlyOpen = item;
    icon._rotation += 45;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        if (onComplete) onComplete();
      }
    });

    tl.to(content, {
      height: 'auto',
      duration: 0.35,
      ease: 'power2.out'
    }, 0);

    tl.to(content, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out'
    }, 0.1);

    tl.to(icon, {
      rotation: icon._rotation,
      duration: 0.35,
      ease: 'power2.out'
    }, 0);
  }

  function closeAccordion(item, content, icon, onComplete) {
    isAnimating = true;
    item.classList.remove('is-open');
    if (currentlyOpen === item) currentlyOpen = null;
    icon._rotation += 45;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        if (onComplete) onComplete();
      }
    });

    tl.to(content, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in'
    }, 0);

    tl.to(content, {
      height: 0,
      duration: 0.25,
      ease: 'power2.inOut'
    }, 0.05);

    tl.to(icon, {
      rotation: icon._rotation,
      duration: 0.25,
      ease: 'power2.inOut'
    }, 0);
  }

  // Debounce resize for performance
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 150);
  }

  window.addEventListener('resize', handleResize);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// =============================================
// Where clear skin begins clip-path / mask scale effect
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 767) {
    gsap.to("[clip-path-reveal]", {
      clipPath: "inset(0px round 15px)",
      ease: "power1.out",
      scrollTrigger: {
        trigger: "[clip-path-reveal]",
        start: "top 75%",
        end: "top 50%",
        scrub: 1.6
      }
    });
  }
});


// =============================================
// Press Quotes Component
// =============================================
(function() {
  function initPressSection() {
    const quoteText = document.querySelector('.press-quote-text');
    const logosWrapper = document.querySelector('.press-quotes');
    const logos = document.querySelectorAll('.press-quote');
    
    if (!quoteText || !logosWrapper || !logos.length) return;
    
    const INTERVAL_TIME = 4000;
    const MOBILE_BREAKPOINT = 768;
    const TRANSITION_DURATION = 350;
    
    let currentIndex = 0;
    let desktopInterval = null;
    let swiper = null;
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    
    // ===== SHARED: Update quote text with fade =====
    function updateQuote(index) {
      const newQuote = logos[index]?.getAttribute('data-quote');
      if (!newQuote) return;
      
      quoteText.classList.add('is-transitioning');
      
      setTimeout(() => {
        quoteText.textContent = newQuote;
        quoteText.classList.remove('is-transitioning');
      }, TRANSITION_DURATION);
    }
    
    // ===== SHARED: Set active logo =====
    function setActive(index) {
      logos.forEach(logo => logo.classList.remove('is-active'));
      logos[index]?.classList.add('is-active');
      
      if (index !== currentIndex) {
        updateQuote(index);
      }
      
      currentIndex = index;
    }
    
    // ===== DESKTOP: Autoplay =====
    function startDesktopAutoplay() {
      if (desktopInterval) return;
      desktopInterval = setInterval(() => {
        const next = (currentIndex + 1) % logos.length;
        setActive(next);
      }, INTERVAL_TIME);
    }
    
    function stopDesktopAutoplay() {
      if (desktopInterval) {
        clearInterval(desktopInterval);
        desktopInterval = null;
      }
    }
    
    function resetDesktopAutoplay() {
      stopDesktopAutoplay();
      startDesktopAutoplay();
    }
    
    // ===== DESKTOP: Click handlers =====
    logos.forEach((logo, index) => {
      logo.addEventListener('click', () => {
        if (!isMobile) {
          setActive(index);
          resetDesktopAutoplay();
        }
      });
    });
    
    // ===== MOBILE: Swiper =====
    function initSwiper() {
      if (typeof Swiper === 'undefined' || swiper) return;
      
      swiper = new Swiper(logosWrapper, {
        wrapperClass: 'press-quotes-collection',
        slideClass: 'press-quote',
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        spaceBetween: 40,
        speed: 700,
        slidesOffsetBefore: -60,
        autoplay: {
          delay: INTERVAL_TIME,
          disableOnInteraction: false
        },
        on: {
          slideChange: function() {
            setActive(this.realIndex);
          }
        }
      });
      
      setTimeout(() => {
        swiper.update();
      }, 50);
      
      if (currentIndex > 0) {
        swiper.slideToLoop(currentIndex, 0);
      }
    }
    
    function destroySwiper() {
      if (swiper) {
        swiper.destroy(true, true);
        swiper = null;
      }
    }
    
    // ===== RESPONSIVE =====
    function handleBreakpoint() {
      const wasMobile = isMobile;
      isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      
      if (isMobile && !wasMobile) {
        stopDesktopAutoplay();
        initSwiper();
      } else if (!isMobile && wasMobile) {
        destroySwiper();
        startDesktopAutoplay();
      }
    }
    
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleBreakpoint, 150);
    });
    
    // ===== INIT =====
    const initialQuote = logos[0]?.getAttribute('data-quote');
    if (initialQuote) {
      quoteText.textContent = initialQuote;
    }
    
    setActive(0);
    
    if (isMobile) {
      initSwiper();
    } else {
      startDesktopAutoplay();
    }
  }
  
  // Wait for Swiper to be available
  function waitForSwiper() {
    if (typeof Swiper !== 'undefined') {
      initPressSection();
    } else {
      setTimeout(waitForSwiper, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSwiper);
  } else {
    waitForSwiper();
  }
})();

// =============================================
// TO DO – check if working. Intention is to check whether scroll trigger events have the right status if loading the page scrolled down
// =============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const viewportBottom = window.scrollY + window.innerHeight;

    document.querySelectorAll('.eyebrow').forEach(el => {
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      if (elTop < viewportBottom) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 100);
});


// =============================================
// Configuration of Lenis SMOOTH SCROLL and syncing with GSAP
// =============================================
const lenis = new Lenis({
  lerp: 0.075,
  smoothWheel: true,
  wheelMultiplier: 1,
});

// Syncing Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// =============================================
// Handle Safari tab throttling (visibility change)
// =============================================
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab hidden - pause everything
    gsap.ticker.sleep();
    lenis.stop();
  } else {
    // Tab visible - resume everything
    gsap.ticker.wake();
    lenis.start();
    
    // Give browser a moment to stabilize, then refresh ScrollTrigger
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    
    // Reset CSS marquee animations to prevent jumpiness
    document.querySelectorAll('[class*="marquee-track"]').forEach(el => {
      const currentAnimation = el.style.animation;
      if (currentAnimation || getComputedStyle(el).animationName !== 'none') {
        el.style.animation = 'none';
        el.offsetHeight; // Force reflow
        el.style.animation = '';
      }
    });
    
    // Reset GSAP marquee timelines
    gsap.globalTimeline.getChildren(true, true, true).forEach(tween => {
      if (tween.repeat && tween.repeat() === -1) {
        // Force infinite timelines to recalculate
        const currentProgress = tween.progress();
        tween.progress(0).progress(currentProgress);
      }
    });
  }
});

// Setting Lenis controls via data attributes
$("[data-lenis-start]").on("click", function () {
  lenis.start();
});
$("[data-lenis-stop]").on("click", function () {
  lenis.stop();
});
$("[data-lenis-toggle]").on("click", function () {
  $(this).toggleClass("stop-scroll");
  if ($(this).hasClass("stop-scroll")) {
    lenis.stop();
  } else {
    lenis.start();
  }
});



// =============================================
// Setup of all swiper carousels
// =============================================
(function() {
  'use strict';

  const CONFIG = {
    // Physics
    speed: 400,
    freeMode: {
      enabled: true,
      sticky: true,
      momentumRatio: 0.5,
      momentumVelocityRatio: 0.5,
      momentumBounce: true,
      momentumBounceRatio: 0.5
    },
    
    // Touch
    touchRatio: 1,
    resistance: true,
    resistanceRatio: 0.85,
    
    // Behavior
    slidesPerView: 'auto',
    grabCursor: true,
    
    // Thresholds
    threshold: 5,
    longSwipesRatio: 0.25
  };

  const BREAKPOINTS = {
    mobile: 767,
    tablet: 991
  };

  const DEFAULTS = {
    desktop: { offset: 48, gap: 20 },
    tablet: { offset: 24, gap: 20 },
    mobile: { offset: 16, gap: 16 }
  };

  const carousels = [];
  let resizeTimer;
  let currentBreakpoint = null;

  function getBreakpoint() {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  }

  function getResponsiveValue(viewport, property) {
    const bp = getBreakpoint();
    
    // Attribute names
    const desktopAttr = viewport.dataset[`swiper${capitalize(property)}`];
    const tabletAttr = viewport.dataset[`swiper${capitalize(property)}Tablet`];
    const mobileAttr = viewport.dataset[`swiper${capitalize(property)}Mobile`];
    
    // Use attributes if present, otherwise fall back to defaults
    const desktop = desktopAttr ? parseInt(desktopAttr) : DEFAULTS.desktop[property];
    const tablet = tabletAttr ? parseInt(tabletAttr) : DEFAULTS.tablet[property];
    const mobile = mobileAttr ? parseInt(mobileAttr) : DEFAULTS.mobile[property];
    
    if (bp === 'mobile') return mobile;
    if (bp === 'tablet') return tablet;
    return desktop;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function shouldBeActive(viewport, breakpoint) {
    const setting = viewport.dataset.swiperBreakpoint;
    
    if (!setting) return true;
    
    switch (setting) {
      case 'desktop':
        return breakpoint === 'desktop';
      case 'tablet':
        return breakpoint === 'tablet' || breakpoint === 'mobile';
      case 'mobile':
        return breakpoint === 'mobile';
      case 'tablet-up':
        return breakpoint === 'desktop' || breakpoint === 'tablet';
      case 'mobile-up':
        return true;
      default:
        return true;
    }
  }

  function init() {
    if (typeof Swiper === 'undefined') {
      console.error('Swiper not loaded. Add the CDN scripts first.');
      return;
    }

    currentBreakpoint = getBreakpoint();
    
    const viewports = document.querySelectorAll('[data-swiper="carousel"]');
    
    viewports.forEach((viewport, index) => {
      const carousel = {
        viewport,
        index,
        swiper: null,
        prevBtns: [],
        nextBtns: [],
        clickHandlers: { prev: [], next: [] }
      };
      
      carousels.push(carousel);
      
      if (shouldBeActive(viewport, currentBreakpoint)) {
        initCarousel(carousel);
      }
    });

    window.addEventListener('resize', onResize);

    const activeCount = carousels.filter(c => c.swiper !== null).length;
    console.log(`Carousels: ${carousels.length} total, ${activeCount} active at ${currentBreakpoint}`);
  }

  function initCarousel(carousel) {
    const { viewport, index } = carousel;
    
    const track = viewport.children[0];
    if (!track) {
      console.warn(`Carousel ${index + 1}: No track found`);
      return;
    }

    const slides = Array.from(track.children);
    if (slides.length === 0) {
      console.warn(`Carousel ${index + 1}: No slides found`);
      return;
    }

    // Add custom classes
    viewport.classList.add('swiper-carousel', 'is-active');
    track.classList.add('swiper-carousel-wrapper');
    slides.forEach(slide => {
      slide.classList.add('swiper-carousel-slide');
    });

    // Find section and ALL buttons within it
    const section = findSection(viewport);
    const prevBtns = Array.from(section.querySelectorAll('[data-swiper="prev"]'));
    const nextBtns = Array.from(section.querySelectorAll('[data-swiper="next"]'));
    
    carousel.prevBtns = prevBtns;
    carousel.nextBtns = nextBtns;

    // Get responsive values
    const offset = getResponsiveValue(viewport, 'offset');
    const gap = getResponsiveValue(viewport, 'gap');

    // Build Swiper config
    const swiperConfig = {
      wrapperClass: 'swiper-carousel-wrapper',
      slideClass: 'swiper-carousel-slide',
      
      slidesPerView: CONFIG.slidesPerView,
      spaceBetween: gap,
      slidesOffsetAfter: offset,
      
      speed: CONFIG.speed,
      freeMode: CONFIG.freeMode,
      
      touchRatio: CONFIG.touchRatio,
      resistance: CONFIG.resistance,
      resistanceRatio: CONFIG.resistanceRatio,
      threshold: CONFIG.threshold,
      longSwipesRatio: CONFIG.longSwipesRatio,
      
      grabCursor: CONFIG.grabCursor,
      watchOverflow: true
    };

    // Initialize Swiper
    const swiper = new Swiper(viewport, swiperConfig);
    carousel.swiper = swiper;

    // Manual button click handlers
    prevBtns.forEach((btn, i) => {
      const handler = (e) => {
        e.preventDefault();
        swiper.slidePrev();
      };
      btn.addEventListener('click', handler);
      carousel.clickHandlers.prev[i] = handler;
    });

    nextBtns.forEach((btn, i) => {
      const handler = (e) => {
        e.preventDefault();
        swiper.slideNext();
      };
      btn.addEventListener('click', handler);
      carousel.clickHandlers.next[i] = handler;
    });

    // Button state updates
    function updateButtonStyles() {
      prevBtns.forEach(btn => {
        btn.style.opacity = swiper.isBeginning ? '0.35' : '1';
        btn.style.pointerEvents = swiper.isBeginning ? 'none' : 'auto';
      });
      nextBtns.forEach(btn => {
        btn.style.opacity = swiper.isEnd ? '0.35' : '1';
        btn.style.pointerEvents = swiper.isEnd ? 'none' : 'auto';
      });
    }

    swiper.on('slideChange', updateButtonStyles);
    swiper.on('reachBeginning', updateButtonStyles);
    swiper.on('reachEnd', updateButtonStyles);
    swiper.on('fromEdge', updateButtonStyles);
    
    updateButtonStyles();

    viewport._swiper = swiper;
    
    console.log(`Carousel ${index + 1}: initialized (${slides.length} slides, gap: ${gap}px, offset: ${offset}px)`);
  }

  function destroyCarousel(carousel) {
    const { viewport, index, swiper, prevBtns, nextBtns, clickHandlers } = carousel;
    
    if (!swiper) return;

    // Remove click handlers
    prevBtns.forEach((btn, i) => {
      if (clickHandlers.prev[i]) {
        btn.removeEventListener('click', clickHandlers.prev[i]);
      }
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    });

    nextBtns.forEach((btn, i) => {
      if (clickHandlers.next[i]) {
        btn.removeEventListener('click', clickHandlers.next[i]);
      }
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    });

    // Destroy Swiper
    swiper.destroy(true, true);
    
    // Remove classes
    viewport.classList.remove('swiper-carousel', 'is-active');
    const track = viewport.children[0];
    if (track) {
      track.classList.remove('swiper-carousel-wrapper');
      Array.from(track.children).forEach(slide => {
        slide.classList.remove('swiper-carousel-slide');
      });
    }

    // Clear references
    carousel.swiper = null;
    carousel.clickHandlers = { prev: [], next: [] };
    delete viewport._swiper;

    console.log(`Carousel ${index + 1}: destroyed`);
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newBreakpoint = getBreakpoint();
      
      if (newBreakpoint === currentBreakpoint) return;
      
      console.log(`Breakpoint changed: ${currentBreakpoint} → ${newBreakpoint}`);
      currentBreakpoint = newBreakpoint;
      
      carousels.forEach(carousel => {
        const isActive = carousel.swiper !== null;
        const shouldBe = shouldBeActive(carousel.viewport, newBreakpoint);
        
        if (shouldBe && !isActive) {
          initCarousel(carousel);
        } else if (!shouldBe && isActive) {
          destroyCarousel(carousel);
        } else if (isActive) {
          // Update values for active carousels
          const newOffset = getResponsiveValue(carousel.viewport, 'offset');
          const newGap = getResponsiveValue(carousel.viewport, 'gap');
          
          carousel.swiper.params.slidesOffsetAfter = newOffset;
          carousel.swiper.params.spaceBetween = newGap;
          carousel.swiper.update();
        }
      });
    }, 100);
  }

  function findSection(el) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.querySelector('[data-swiper="prev"]')) return parent;
      if (parent.tagName === 'SECTION') return parent;
      parent = parent.parentElement;
    }
    return el.parentElement;
  }

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.SwiperCarousels = {
    carousels,
    reinit: init,
    config: CONFIG,
    breakpoints: BREAKPOINTS,
    defaults: DEFAULTS,
    get: (index) => carousels[index]?.swiper || null,
    getBreakpoint,
    getCurrentBreakpoint: () => currentBreakpoint
  };

})();



// =============================================
// Looping text marquee
// =============================================
 (function() {
    'use strict';
    
    const wrapper = document.querySelector('.looping-text-marquee-wrapper');
    if (!wrapper) return;
    
    const track = wrapper.querySelector('.looping-text-marquee-track');
    const originalGroup = track?.querySelector('.looping-text-marquee-group');
    if (!track || !originalGroup) return;
    
    let isInitialized = false;
    
    function initMarquee() {
        // Remove any existing clones
        track.querySelectorAll('.looping-text-marquee-group[aria-hidden="true"]')
            .forEach(clone => clone.remove());
        
        track.classList.remove('is-animated');
        
        // Measure
        const groupWidth = originalGroup.offsetWidth;
        const viewportWidth = wrapper.offsetWidth;
        
        if (groupWidth < 50) {
            console.warn('Marquee: Group width too small:', groupWidth);
            return;
        }
        
        // Clone enough to fill viewport + 1 for seamless loop
        const clonesNeeded = Math.ceil(viewportWidth / groupWidth) + 1;
        
        for (let i = 0; i < clonesNeeded; i++) {
            const clone = originalGroup.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        }
        
        // Set animation properties
        const baseSpeed = 50; // pixels per second
        const duration = groupWidth / baseSpeed;
        
        track.style.setProperty('--duration', `${duration}s`);
        track.style.setProperty('--scroll-distance', `-${groupWidth}px`);
        
        // Start animation (unless reduced motion)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            requestAnimationFrame(() => {
                track.classList.add('is-animated');
            });
        }
        
        isInitialized = true;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMarquee);
    } else {
        initMarquee();
    }
    
    // Reinitialize only when crossing 767px breakpoint
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', () => {
        isInitialized = false;
        initMarquee();
    });
})();


// =============================================
// FAQ Accordion
// =============================================
(function() {
  'use strict';
  
  let currentlyOpen = null;
  let isAnimating = false;
  
  function init() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Early exit if no FAQ items exist
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      // Set initial closed state
      gsap.set(answer, { height: 0, overflow: 'hidden', opacity: 0 });
      
      question.addEventListener('click', () => {
        if (isAnimating) return;
        
        const isOpen = item.classList.contains('is-open');
        
        if (isOpen) {
          closeAccordion(item, answer);
        } else {
          if (currentlyOpen && currentlyOpen !== item) {
            const openItem = currentlyOpen;
            const openAnswer = openItem.querySelector('.faq-answer');
            
            closeAccordion(openItem, openAnswer, () => {
              openAccordion(item, answer);
            });
          } else {
            openAccordion(item, answer);
          }
        }
      });
    });
    
    // Open first FAQ by default
    const firstItem = faqItems[0];
    if (firstItem) {
      const firstAnswer = firstItem.querySelector('.faq-answer');
      firstItem.classList.add('is-open');
      gsap.set(firstAnswer, { height: 'auto', opacity: 1 });
      currentlyOpen = firstItem;
    }
  }
  
  function openAccordion(item, answer, onComplete) {
    isAnimating = true;
    item.classList.add('is-open');
    currentlyOpen = item;
    
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        if (onComplete) onComplete();
      }
    });
    
    tl.to(answer, {
      height: 'auto',
      duration: 0.35,
      ease: 'power2.out'
    }, 0);
    
    tl.to(answer, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out'
    }, 0.1);
  }
  
  function closeAccordion(item, answer, onComplete) {
    isAnimating = true;
    item.classList.remove('is-open');
    if (currentlyOpen === item) currentlyOpen = null;
    
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        if (onComplete) onComplete();
      }
    });
    
    tl.to(answer, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in'
    }, 0);
    
    tl.to(answer, {
      height: 0,
      duration: 0.25,
      ease: 'power2.inOut'
    }, 0.05);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// =============================================
// Testimonial Carousel, managing slides
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const testimonials = document.querySelectorAll('.testimonial');
  const thumbnails = document.querySelectorAll('.testimonials-carousel-nav .w-dyn-item');
  
  // Early exit if no testimonials exist
  if (testimonials.length === 0) return;
  
  let currentIndex = 0;
  let autoplayInterval;
  const AUTOPLAY_DELAY = 6000;
  
  function goToSlide(index) {
    // Remove active from all
    testimonials.forEach(t => t.classList.remove('is-active'));
    thumbnails.forEach(t => t.classList.remove('is-active'));
    
    // Add active to target
    testimonials[index]?.classList.add('is-active');
    thumbnails[index]?.classList.add('is-active');
    
    currentIndex = index;
  }
  
  function nextSlide() {
    const next = (currentIndex + 1) % testimonials.length;
    goToSlide(next);
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // Thumbnail clicks
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(index);
    });
  });
  
  // Initialize
  goToSlide(0);
  startAutoplay();
});



// =============================================
// Video Testimonials - Bunny Stream + HLS
// =============================================
(function() {
  'use strict';

  const wrapper = document.querySelector('.video-testimonials-wrapper');
  if (!wrapper) return;

  const track = wrapper.querySelector('.video-testimonials-marquee-track');
  const originalGroup = track?.querySelector('.video-testimonials-marquee-group');
  if (!track || !originalGroup) return;

  // ============ CONFIGURATION ============
  const CONFIG = {
    speed: 50,
    easeDuration: 0.8,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mobileBreakpoint: 767
  };

  // ============ STATE ============
  let marqueeTimeline = null;
  let isHovering = false;
  let currentlyPlayingVideo = null;
  let hlsInstances = new Map();
  let isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;

  // ============ HLS SETUP ============

  function supportsHlsNatively() {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  }

  function initHls(video, src) {
    if (supportsHlsNatively()) {
      video.src = src;
      return;
    }

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });

      hlsInstances.set(video, hls);
    } else {
      video.src = src;
    }
  }

  function destroyHls(video) {
    const hls = hlsInstances.get(video);
    if (hls) {
      hls.destroy();
      hlsInstances.delete(video);
    }
  }

  // ============ VIDEO ELEMENT CREATION ============

  function createVideoElement(player) {
    const hlsSrc = player.dataset.videoHls;
    const posterSrc = player.dataset.poster;
    const previewSrc = player.dataset.preview;

    if (!hlsSrc || player.querySelector('video')) return null;

    // Create thumbnail image
    if (posterSrc) {
      const poster = document.createElement('img');
      poster.src = posterSrc;
      poster.alt = '';
      poster.classList.add('video-poster');
      poster.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 2;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      player.insertBefore(poster, player.firstChild);
      player._poster = poster;
    }

    // Create preview image (animated WebP/GIF)
    if (previewSrc) {
      const preview = document.createElement('img');
      preview.alt = '';
      preview.classList.add('video-preview');
      preview.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      preview.dataset.src = previewSrc;
      player.insertBefore(preview, player.firstChild);
      player._preview = preview;
    }

    // Create video element
    const video = document.createElement('video');
    video.loop = true;
    video.playsInline = true;
    video.muted = false;
    video.preload = 'none';
    video.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      pointer-events: none;
    `;

    player.insertBefore(video, player.firstChild);
    video._hlsSrc = hlsSrc;

    return video;
  }

  function initAllVideos() {
    wrapper.querySelectorAll('.video-player').forEach(createVideoElement);
  }

// ============ MOBILE CENTERING ============

function centerPlayerOnMobile(player) {
  if (!isMobile || !marqueeTimeline) {
    console.log('centerPlayerOnMobile: skipped', { isMobile, hasTimeline: !!marqueeTimeline });
    return;
  }

  const playerRect = player.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();
  
  const playerCenterX = playerRect.left + playerRect.width / 2;
  const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
  
  const offsetNeeded = playerCenterX - wrapperCenterX;
  
  const currentX = gsap.getProperty(track, 'x');
  const newX = currentX - offsetNeeded;
  
  console.log('centerPlayerOnMobile:', { currentX, newX, offsetNeeded });
  console.log('Timeline state BEFORE pause:', { 
    paused: marqueeTimeline.paused(), 
    timeScale: marqueeTimeline.timeScale(),
    progress: marqueeTimeline.progress()
  });
  
  marqueeTimeline.pause();
  
  console.log('Timeline state AFTER pause:', { 
    paused: marqueeTimeline.paused(), 
    timeScale: marqueeTimeline.timeScale(),
    progress: marqueeTimeline.progress()
  });
  
  gsap.to(track, {
    x: newX,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: true
  });
}

// ============ MARQUEE CONTROL ============

function updateMarqueeSpeed() {
  console.log('updateMarqueeSpeed called:', { 
    hasTimeline: !!marqueeTimeline, 
    reducedMotion: CONFIG.reducedMotion,
    isHovering,
    hasCurrentVideo: !!currentlyPlayingVideo,
    isMobile
  });
  
  if (!marqueeTimeline || CONFIG.reducedMotion) return;

  const shouldPause = isHovering || currentlyPlayingVideo;
  
  console.log('Should pause?', shouldPause);

  gsap.killTweensOf(marqueeTimeline);
  
  if (shouldPause) {
    if (!isMobile) {
      console.log('Desktop: easing timeScale to 0');
      gsap.to(marqueeTimeline, {
        timeScale: 0,
        duration: CONFIG.easeDuration,
        ease: 'power2.out'
      });
    } else {
      console.log('Mobile: timeline already paused by centerPlayerOnMobile');
    }
  } else {
    // Resuming
    console.log('Resuming marquee...');
    
    if (isMobile) {
      const currentX = gsap.getProperty(track, 'x');
      const groupWidth = originalGroup.offsetWidth;
      
      let normalizedX = currentX % groupWidth;
      if (normalizedX > 0) normalizedX -= groupWidth;
      
      const progress = Math.abs(normalizedX) / groupWidth;
      
      console.log('Mobile resume:', { currentX, groupWidth, normalizedX, progress });
      console.log('Timeline state BEFORE resume:', { 
        paused: marqueeTimeline.paused(), 
        timeScale: marqueeTimeline.timeScale(),
        progress: marqueeTimeline.progress()
      });
      
      gsap.set(track, { x: normalizedX });
      marqueeTimeline.progress(progress);
      marqueeTimeline.timeScale(1);
      marqueeTimeline.play();
      
      console.log('Timeline state AFTER resume:', { 
        paused: marqueeTimeline.paused(), 
        timeScale: marqueeTimeline.timeScale(),
        progress: marqueeTimeline.progress()
      });
    } else {
      console.log('Desktop: easing timeScale to 1');
      gsap.to(marqueeTimeline, {
        timeScale: 1,
        duration: CONFIG.easeDuration,
        ease: 'power2.out'
      });
    }
  }
}

  // ============ VIDEO PLAYER ============

  function initVideoPlayer(player) {
    if (player.dataset.initialized === 'true') return;
    player.dataset.initialized = 'true';

    const videoControls = player.querySelector('.video-controls');
    const playBtn = player.querySelector('.video-play-btn');
    const muteBtn = player.querySelector('.video-mute-btn');

    const video = player.querySelector('video');
    const poster = player._poster;
    const preview = player._preview;
    let hlsInitialized = false;
    let isPlaying = false;

    if (muteBtn) {
      gsap.set(muteBtn, { autoAlpha: 0, scale: 0.7 });
    }

    // -------- HOVER PREVIEW --------

    function showPreview() {
      if (isPlaying || !preview) return;

      if (!preview.src && preview.dataset.src) {
        preview.src = preview.dataset.src;
      }

      preview.style.opacity = '1';
    }

    function hidePreview() {
      if (!preview) return;
      preview.style.opacity = '0';
    }

    player.addEventListener('mouseenter', showPreview);
    player.addEventListener('mouseleave', hidePreview);

    // -------- PLAY/PAUSE ANIMATIONS --------

    function animateToPlay() {
      if (playBtn) playBtn.classList.add('is-playing');
      if (videoControls) {
        gsap.to(videoControls, { width: 40, height: 40, duration: 0.25, ease: 'power2.inOut' });
      }
      if (playBtn) {
        gsap.to(playBtn, { scale: 0.85, duration: 0.25, ease: 'power2.inOut' });
      }
      if (muteBtn) {
        gsap.to(muteBtn, { autoAlpha: 1, scale: 1, duration: 0.25, delay: 0.05, ease: 'back.out(1.7)' });
      }
    }

    function animateToPause() {
      if (playBtn) playBtn.classList.remove('is-playing');
      if (videoControls) {
        gsap.to(videoControls, { width: 70, height: 70, duration: 0.25, ease: 'power2.inOut' });
      }
      if (playBtn) {
        gsap.to(playBtn, { scale: 1, duration: 0.25, ease: 'power2.inOut' });
      }
      if (muteBtn) {
        gsap.to(muteBtn, { autoAlpha: 0, scale: 0.7, duration: 0.2, ease: 'power2.in' });
      }
    }

    function showVideo() {
      if (poster) poster.style.opacity = '0';
      if (preview) preview.style.opacity = '0';
      video.style.zIndex = '3';
    }

    function hideVideo() {
      if (poster) poster.style.opacity = '1';
      video.style.zIndex = '0';
    }

    function playVideo() {
      if (!video) return;

      // Lazy-load HLS on first play
      if (!hlsInitialized && video._hlsSrc) {
        initHls(video, video._hlsSrc);
        hlsInitialized = true;
      }

      // Stop any other playing video
      if (currentlyPlayingVideo && currentlyPlayingVideo !== player) {
        currentlyPlayingVideo._resetVideo?.();
      }

      video.play().then(() => {
        currentlyPlayingVideo = player;
        isPlaying = true;
        showVideo();
        animateToPlay();
        updateMarqueeSpeed();
        
        // Center the player on mobile after marquee pauses
        centerPlayerOnMobile(player);
      }).catch(err => {
        console.warn('Video play failed:', err);
      });
    }

    function pauseVideo() {
      if (!video) return;

      video.pause();
      currentlyPlayingVideo = null;
      isPlaying = false;
      hideVideo();
      animateToPause();
      updateMarqueeSpeed();
    }

    function togglePlayPause() {
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    }

    function resetPlayer() {
      if (video && !video.paused) {
        video.pause();
        video.currentTime = 0;
        isPlaying = false;
        hideVideo();
        animateToPause();
      }
    }

    player._resetVideo = resetPlayer;
    player._pauseVideo = pauseVideo;

    // -------- CLICK HANDLERS --------

    // Entire card is clickable for play/pause
    player.addEventListener('click', (e) => {
      // Don't toggle if clicking mute button
      if (muteBtn && muteBtn.contains(e.target)) return;
      
      togglePlayPause();
    });

    // -------- MUTE BUTTON --------

    muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!video) return;
      video.muted = !video.muted;
      muteBtn.classList.toggle('is-muted', video.muted);
    });

    video?.addEventListener('ended', () => {
      if (currentlyPlayingVideo === player) {
        currentlyPlayingVideo = null;
        isPlaying = false;
        hideVideo();
        animateToPause();
        updateMarqueeSpeed();
      }
    });
  }

  function initAllVideoPlayers() {
    wrapper.querySelectorAll('.video-player').forEach(initVideoPlayer);
  }

  // ============ MARQUEE SETUP ============

  function initMarquee() {
    if (marqueeTimeline) {
      marqueeTimeline.kill();
      marqueeTimeline = null;
    }

    track.querySelectorAll('.video-testimonials-marquee-group[aria-hidden="true"] video')
      .forEach(destroyHls);

    track.querySelectorAll('.video-testimonials-marquee-group[aria-hidden="true"]')
      .forEach(clone => clone.remove());

    gsap.set(track, { x: 0 });
    track.offsetHeight;

    const groupWidth = originalGroup.offsetWidth;
    const viewportWidth = wrapper.offsetWidth;

    if (groupWidth < 100) {
      console.warn('Video marquee: Group width too small:', groupWidth);
      return;
    }

    const clonesNeeded = Math.max(2, Math.ceil(viewportWidth / groupWidth) + 1);

    for (let i = 0; i < clonesNeeded; i++) {
      const clone = originalGroup.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');

      clone.querySelectorAll('.video-player').forEach(player => {
        player.removeAttribute('data-initialized');
        
        // Remove cloned elements that we'll recreate
        player.querySelector('video')?.remove();
        player.querySelector('.video-poster')?.remove();
        player.querySelector('.video-preview')?.remove();
        
        delete player._poster;
        delete player._preview;
      });

      track.appendChild(clone);
    }

    initAllVideos();
    initAllVideoPlayers();

    if (CONFIG.reducedMotion) return;

    const duration = groupWidth / CONFIG.speed;
    track.style.willChange = 'transform';

    marqueeTimeline = gsap.to(track, {
      x: -groupWidth,
      ease: 'none',
      duration: duration,
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % groupWidth)
      }
    });
  }

  // ============ EVENT HANDLERS ============

  track.addEventListener('mouseenter', () => {
    isHovering = true;
    updateMarqueeSpeed();
  });

  track.addEventListener('mouseleave', () => {
    isHovering = false;
    updateMarqueeSpeed();
  });

  // Click outside video player pauses the video
  document.addEventListener('click', (e) => {
    if (!currentlyPlayingVideo) return;
    
    // If click is outside any video player, pause
    if (!e.target.closest('.video-player')) {
      currentlyPlayingVideo._pauseVideo?.();
    }
  });

  const mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', (e) => {
    isMobile = e.matches;
    if (currentlyPlayingVideo) {
      currentlyPlayingVideo._resetVideo?.();
      currentlyPlayingVideo = null;
    }
    isHovering = false;
    initMarquee();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentlyPlayingVideo) {
      currentlyPlayingVideo._resetVideo?.();
      currentlyPlayingVideo = null;
      updateMarqueeSpeed();
    }
  });

  // ============ INIT ============

  function init() {
    initAllVideos();
    initAllVideoPlayers();
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(init);
  }

})();
