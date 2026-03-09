
// =============================================
// 1. CORE SETUP
// =============================================


// =============================================
// 1.1 Configuration of Lenis SMOOTH SCROLL and syncing with GSAP
// =============================================
window.lenis = new Lenis({
  lerp: 0.075,
  smoothWheel: true,
  wheelMultiplier: 1,
});
// Syncing Lenis with GSAP ScrollTrigger
window.lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  window.lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
// =============================================
// Handle Safari tab throttling (visibility change)
// =============================================
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gsap.ticker.sleep();
    window.lenis.stop();
  } else {
    gsap.ticker.wake();
    window.lenis.start();

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    document.querySelectorAll('[class*="marquee-track"]').forEach(el => {
      const currentAnimation = el.style.animation;
      if (currentAnimation || getComputedStyle(el).animationName !== 'none') {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      }
    });

    gsap.globalTimeline.getChildren(true, true, true).forEach(tween => {
      if (tween.repeat && tween.repeat() === -1) {
        const currentProgress = tween.progress();
        tween.progress(0).progress(currentProgress);
      }
    });
  }
});
// Setting Lenis controls via data attributes
$("[data-lenis-start]").on("click", function () {
  window.lenis.start();
});
$("[data-lenis-stop]").on("click", function () {
  window.lenis.stop();
});
$("[data-lenis-toggle]").on("click", function () {
  $(this).toggleClass("stop-scroll");
  if ($(this).hasClass("stop-scroll")) {
    window.lenis.stop();
  } else {
    window.lenis.start();
  }
});


// =============================================
// 1.2 Scroll trigger status check
// =============================================
// TO DO – check if working. Intention is to check whether scroll trigger events have the right status if loading the page scrolled down
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
// 2. NAVIGATION
// =============================================


// =============================================
// 2.1 Nav + mobile menu scroll effects
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const mobileMenu = document.querySelector('.mobile-menu');
  const announcementBanner = document.querySelector('.announcement-banner');

  // Check if banner exists on page load
  if (announcementBanner && mobileMenu) {
    mobileMenu.classList.add('has-banner');
  }

  ScrollTrigger.create({
    trigger: '.nav',
    start: 'top top-=2px',
    onEnter: () => {
      nav.classList.add('scrolled');
      if (mobileMenu) mobileMenu.classList.add('scrolled');
    },
    onLeaveBack: () => {
      nav.classList.remove('scrolled');
      if (mobileMenu) mobileMenu.classList.remove('scrolled');
    }
  });
});


// =============================================
// 2.2 Navigation start button blob hover
// =============================================
const startWrapper = document.querySelector('.start-btn-wrapper');
if (startWrapper) {
  const startSvg = startWrapper.querySelector('svg');
  gsap.set(startSvg, { willChange: 'transform' });
  startWrapper.addEventListener('mouseenter', () => {
    gsap.to(startSvg, {
      scale: 1.12,
      duration: 0.5,
      ease: 'elastic.out(1, 0.65)'
    });
  });
  startWrapper.addEventListener('mouseleave', () => {
    gsap.to(startSvg, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out'
    });
  });
}


// =============================================
// 2.3 Desktop dropdown hover effects
// =============================================
(function() {
const dropdowns = document.querySelectorAll('.nav-dropdown');
let activeDropdown = null;
let closeTimer = null;

function openDropdown(dropdown) {
  const list = dropdown.querySelector('.nav-dropdown-wrapper');
  const links = list.querySelectorAll('.nav-dropdown-link');
  const heading = list.querySelector('h2');
  const button = list.querySelector('.nav-dropdown-button');
  const allContent = [heading, button, ...links].filter(Boolean);

  gsap.killTweensOf([list, ...allContent]);

  // Container — height + opacity + translateY reveal
  gsap.fromTo(list,
    { opacity: 0, y: -20, height: 0 },
    {
      opacity: 1,
      y: 0,
      height: 'auto',
      duration: 0.4,
      ease: 'power2.out',
      overflow: 'hidden'
    }
  );

  // Links — reduced y travel and shorter duration so they feel like
  // they're already almost in place, just fading into focus
  gsap.fromTo(allContent,
    { opacity: 0, y: 4 },
    {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      stagger: 0.04,
      delay: 0.1
    }
  );
}

function closeDropdown(dropdown, instant = false) {
  const list = dropdown.querySelector('.nav-dropdown-wrapper');
  const links = list.querySelectorAll('.nav-dropdown-link');
  const heading = list.querySelector('h2');
  const button = list.querySelector('.nav-dropdown-button');
  const allContent = [heading, button, ...links].filter(Boolean);

  gsap.killTweensOf([list, ...allContent]);

  if (instant) {
    gsap.set(list, { opacity: 0, y: -20, height: 0 });
    gsap.set(allContent, { opacity: 0, y: 4 });
    return;
  }

  // Links fade out — no y movement on exit, just a clean disappear
  gsap.to(allContent, {
    opacity: 0,
    duration: 0.15,
    stagger: 0.02,
    ease: 'power2.in'
  });

  // Container collapses shortly after
  gsap.to(list, {
    opacity: 0,
    y: -20,
    height: 0,
    duration: 0.3,
    ease: 'power2.in',
    overflow: 'hidden'
  });
}

dropdowns.forEach(dropdown => {
  dropdown.addEventListener('mouseenter', () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (activeDropdown && activeDropdown !== dropdown) {
      closeDropdown(activeDropdown, true);
    }

    activeDropdown = dropdown;
    openDropdown(dropdown);
  });

  dropdown.addEventListener('mouseleave', () => {
    if (activeDropdown === dropdown) {
      closeTimer = setTimeout(() => {
        activeDropdown = null;
        closeDropdown(dropdown);
        closeTimer = null;
      }, 120);
    }
  });
});
})();


// =============================================
// 2.4 Mobile menu entry/exit animations
// =============================================
(function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const menuContent = menu.querySelector('.mobile-menu-content');
  const openIcon = toggle.querySelector('.open-icon');
  const closeIcon = toggle.querySelector('.close-icon');
  const nav = document.querySelector('.nav');
  let isOpen = false;
  let originalThemeColor = null;
  let originalBodyBg = null;
  const menuBgColor = '#D9D9D9';
  function lockScroll() {
    window.lenis.stop();
    originalBodyBg = document.body.style.backgroundColor || '';
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      originalThemeColor = themeColorMeta.content;
      themeColorMeta.content = menuBgColor;
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = menuBgColor;
      document.head.appendChild(meta);
    }
  }
  function unlockScroll() {
    window.lenis.start();
    document.body.style.backgroundColor = originalBodyBg;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (originalThemeColor) {
        meta.content = originalThemeColor;
      } else {
        meta.remove();
      }
    }
  }
  // Collect all staggered content items into one group
  const menuItems = gsap.utils.toArray(
    '.mobile-menu-heading, ' +
    '.mobile-menu-top-row .nav-dropdown-button, ' +
    '.mobile-menu-item, ' +
    '.mobile-dropdown-menu-main-link:not(.has-accordion), ' +
    '.mobile-menu-button, ' +
    '.mobile-menu-login, ' +
    '.bottom-row-menu .list-item-5'
  );

  // Initial states
  gsap.set(closeIcon, { opacity: 0, rotate: 45 });
  gsap.set(menu, { opacity: 0, pointerEvents: 'none' });

  function openMenu() {
    nav.classList.add('menu-open');

    // Reduced motion: skip to final state
    if (prefersReducedMotion.matches) {
      lockScroll();
      document.body.style.backgroundColor = menuBgColor;
      gsap.set(menu, { opacity: 1, pointerEvents: 'auto' });
      gsap.set(openIcon, { opacity: 0, rotate: -45 });
      gsap.set(closeIcon, { opacity: 1, rotate: 0 });
      gsap.set(menuContent, { opacity: 1, y: 0 });
      gsap.set(menuItems, { opacity: 1, y: 0 });
      return;
    }

    let tl = gsap.timeline();
    tl
      .call(lockScroll)
      // Background + menu overlay fade in together
      .to('body', {
        backgroundColor: menuBgColor,
        duration: 0.3,
        ease: 'power3.out'
      }, 0)
      .fromTo(menu,
        { opacity: 0, pointerEvents: 'none' },
        {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3,
          ease: 'power3.out'
        },
        0
      )
      // Icon crossfade — close icon snaps in with overshoot
      .to(openIcon, {
        opacity: 0,
        rotate: -45,
        duration: 0.25,
        ease: 'power3.out'
      }, 0)
      .to(closeIcon, {
        opacity: 1,
        rotate: 0,
        duration: 0.3,
        ease: 'back.out(1.7)'
      }, 0.08)
      // Content container
      .fromTo(menuContent,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power3.out'
        },
        0.05
      )
      // All menu items as one unified stagger group
      .fromTo(menuItems,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power3.out',
          stagger: 0.04
        },
        0.12
      );
  }

  function closeMenu() {
    // Reduced motion: skip to final state
    if (prefersReducedMotion.matches) {
      gsap.set(menuItems, { opacity: 0, y: 6 });
      gsap.set(menuContent, { opacity: 0, y: -12 });
      gsap.set(menu, { opacity: 0, pointerEvents: 'none' });
      document.body.style.backgroundColor = originalBodyBg || '';
      gsap.set(closeIcon, { opacity: 0, rotate: 45 });
      gsap.set(openIcon, { opacity: 1, rotate: 0 });
      nav.classList.remove('menu-open');
      unlockScroll();
      return;
    }

    let tl = gsap.timeline({
      onComplete: () => {
        nav.classList.remove('menu-open');
        unlockScroll();
        // Reset positions for next open
        gsap.set(menu, { opacity: 0, pointerEvents: 'none' });
        gsap.set(menuContent, { opacity: 0, y: 20 });
        gsap.set(menuItems, { opacity: 0, y: 6 });
      }
    });
    tl
      // Content items fade out first
      .to(menuItems, {
        opacity: 0,
        duration: 0.15,
        stagger: 0.02,
        ease: 'power3.in'
      }, 0)
      // Content container slides up
      .to(menuContent, {
        opacity: 0,
        y: -12,
        duration: 0.25,
        ease: 'power3.in'
      }, 0.05)
      // Background + overlay fade out
      .to('body', {
        backgroundColor: originalBodyBg || '',
        duration: 0.25,
        ease: 'power3.in'
      }, 0.08)
      .to(menu, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.25,
        ease: 'power3.in'
      }, 0.08)
      // Icon crossfade
      .to(closeIcon, {
        opacity: 0,
        rotate: 45,
        duration: 0.2,
        ease: 'power3.in'
      }, 0)
      .to(openIcon, {
        opacity: 1,
        rotate: 0,
        duration: 0.2,
        ease: 'power3.out'
      }, 0.08);
  }

  toggle.addEventListener('click', () => {
    if (!isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
    isOpen = !isOpen;
  });
})();


// =============================================
// 3. COMPONENTS
// =============================================


// =============================================
// 3.1 Unified Accordion Controller
// =============================================
// Handles: Mobile Nav, Footer, FAQ, Treatment
// All GSAP-based, exclusive open behavior per group
// Respects prefers-reduced-motion
// =============================================
(function () {
  'use strict';

  // ---- Reduced motion detection ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getAnimationScale() {
    return prefersReducedMotion.matches ? 0 : 1;
  }

  // ---- Chevron SVG for Mobile Nav injection ----
  const chevronSVG = `<svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" width="11" height="6" viewBox="0 0 11 6" fill="none">
    <path d="M0.0381584 0.30875C0.075984 0.21738 0.140054 0.139279 0.222267 0.0843217C0.304481 0.0293647 0.401143 2.04768e-05 0.500033 1.549e-07H10.5C10.599 -7.77138e-05 10.6957 0.0292046 10.778 0.08414C10.8603 0.139075 10.9245 0.217193 10.9623 0.308605C11.0002 0.400016 11.0101 0.500611 10.9908 0.597654C10.9715 0.694696 10.9238 0.783823 10.8538 0.85375L5.85378 5.85375C5.80735 5.90024 5.7522 5.93712 5.6915 5.96228C5.6308 5.98744 5.56574 6.00039 5.50003 6.00039C5.43433 6.00039 5.36926 5.98744 5.30856 5.96228C5.24786 5.93712 5.19272 5.90024 5.14628 5.85375L0.146283 0.85375C0.0763798 0.783786 0.0287952 0.694662 0.00954914 0.597652C-0.00969696 0.500641 0.000259399 0.400102 0.0381584 0.30875Z" fill="currentColor"/>
  </svg>`;

  // ---- Accordion group configurations ----
  const ACCORDION_CONFIGS = [
    {
      name: 'mobile-nav',
      itemSelector: '.mobile-menu-item',
      triggerSelector: '.mobile-dropdown-menu-main-link.has-accordion',
      contentSelector: '.mobile-dropdown-menu-content',
      iconSelector: '.accordion-chevron',
      childItemSelector: '.mobile-dropdown-list-item',
      iconRotationStep: 180,
      injectChevron: true,
      openFirstByDefault: false,
      responsiveBreakpoint: null,
      filterInvisible: false,
    },
    {
  name: 'support-beyond',
  itemSelector: '.support-beyond-dropdown',
  triggerSelector: '.dropdown-trigger',
  contentSelector: '.support-beyond-dropdown-content',
  iconSelector: '.support-beyond-dropdown-icon',
  childItemSelector: null,
  iconRotationStep: 45,
  injectChevron: false,
  openFirstByDefault: false,
  responsiveBreakpoint: null,
  filterInvisible: false,
},
    {
      name: 'footer',
      itemSelector: '.footer-nav-menu-column',
      triggerSelector: '.footer-dropdown-trigger',
      contentSelector: '.footer-dropdown-wrapper',
      iconSelector: '.dropdown-trigger-icon',
      childItemSelector: null,
      iconRotationStep: 45,
      injectChevron: false,
      openFirstByDefault: false,
      responsiveBreakpoint: 991,
      filterInvisible: false,
    },
    {
      name: 'faq',
      itemSelector: '.faq-item',
      triggerSelector: '.faq-question',
      contentSelector: '.faq-answer',
      iconSelector: null,
      childItemSelector: null,
      iconRotationStep: 0,
      injectChevron: false,
      openFirstByDefault: true,
      responsiveBreakpoint: null,
      filterInvisible: false,
    },
    {
      name: 'treatment',
      itemSelector: '.treatment-dropdown',
      triggerSelector: '.treatment-dropdown-title',
      contentSelector: '.treatment-dropdown-content',
      iconSelector: '.treatment-dropdown-icon',
      childItemSelector: null,
      iconRotationStep: 45,
      injectChevron: false,
      openFirstByDefault: false,
      responsiveBreakpoint: null,
      filterInvisible: true,
    },
  ];

  // ---- Per-group state ----
  const groupState = {};

  // ---- Icon rotation tracking ----
  const iconRotations = new WeakMap();

  function getIconRotation(icon) {
    return iconRotations.get(icon) || 0;
  }

  function addIconRotation(icon, step) {
    const current = getIconRotation(icon);
    const next = current + step;
    iconRotations.set(icon, next);
    return next;
  }

  // ---- Core open/close ----

  function openAccordion(config, state, item, content, icon, childItems, onComplete) {
    state.isAnimating = true;
    item.classList.add('is-open');
    state.currentlyOpen = item;

    const scale = getAnimationScale();

    // Reduced motion: skip to final state immediately
    if (scale === 0) {
      gsap.set(content, { height: 'auto', overflow: 'hidden', opacity: 1 });
      if (childItems && childItems.length > 0) {
        gsap.set(childItems, { opacity: 1, y: 0 });
      }
      if (icon && config.iconRotationStep) {
        const newRot = addIconRotation(icon, config.iconRotationStep);
        gsap.set(icon, { rotation: newRot });
      }
      state.isAnimating = false;
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        state.isAnimating = false;
        if (onComplete) onComplete();
      },
    });

    // Expand height — power3.out for decisive deceleration
    tl.to(content, {
      height: 'auto',
      duration: 0.3,
      ease: 'power3.out',
    }, 0);

    // Content reveal
    if (childItems && childItems.length > 0) {
      // Mobile nav: stagger children with lift
      tl.to(childItems, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        stagger: 0.035,
        ease: 'power3.out',
      }, 0.08);
    } else {
      // Standard: fade + subtle lift on content
      tl.fromTo(content.children, {
        opacity: 0,
        y: 6,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power3.out',
      }, 0.06);
    }

    // Rotate icon with elastic overshoot
    if (icon && config.iconRotationStep) {
      const newRot = addIconRotation(icon, config.iconRotationStep);
      tl.to(icon, {
        rotation: newRot,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }, 0);
    }
  }

  function closeAccordion(config, state, item, content, icon, childItems, onComplete) {
    state.isAnimating = true;
    item.classList.remove('is-open');
    if (state.currentlyOpen === item) state.currentlyOpen = null;

    const scale = getAnimationScale();

    // Reduced motion: skip to final state immediately
    if (scale === 0) {
      if (childItems && childItems.length > 0) {
        gsap.set(childItems, { opacity: 0, y: 8 });
      } else {
        gsap.set(content.children, { opacity: 0, y: 6 });
      }
      gsap.set(content, { height: 0, overflow: 'hidden' });
      if (icon && config.iconRotationStep) {
        const newRot = addIconRotation(icon, config.iconRotationStep);
        gsap.set(icon, { rotation: newRot });
      }
      state.isAnimating = false;
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        state.isAnimating = false;
        if (onComplete) onComplete();
      },
    });

    // Fade out content
    if (childItems && childItems.length > 0) {
      // Mobile nav: fade children out quickly
      tl.to(childItems, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        ease: 'power2.in',
      }, 0);
    } else {
      // Standard: fade + sink content children
      tl.to(content.children, {
        opacity: 0,
        y: 6,
        duration: 0.15,
        ease: 'power2.in',
      }, 0);
    }

    // Collapse height
    tl.to(content, {
      height: 0,
      duration: 0.25,
      ease: 'power3.inOut',
    }, 0.04);

    // Rotate icon
    if (icon && config.iconRotationStep) {
      const newRot = addIconRotation(icon, config.iconRotationStep);
      tl.to(icon, {
        rotation: newRot,
        duration: 0.25,
        ease: 'power3.inOut',
      }, 0);
    }
  }

  // ---- Click handler factory ----

  function handleItemClick(config, state, item) {
    if (state.isAnimating) return;
    if (config.responsiveBreakpoint && window.innerWidth > config.responsiveBreakpoint) return;

    const content = item.querySelector(config.contentSelector);
    const icon = config.iconSelector ? item.querySelector(config.iconSelector) : null;
    const childItems = config.childItemSelector
      ? content.querySelectorAll(config.childItemSelector)
      : null;

    const isOpen = item.classList.contains('is-open');

    if (isOpen) {
      closeAccordion(config, state, item, content, icon, childItems);
    } else {
      if (state.currentlyOpen && state.currentlyOpen !== item) {
        const openItem = state.currentlyOpen;
        const openContent = openItem.querySelector(config.contentSelector);
        const openIcon = config.iconSelector ? openItem.querySelector(config.iconSelector) : null;
        const openChildItems = config.childItemSelector
          ? openContent.querySelectorAll(config.childItemSelector)
          : null;

        closeAccordion(config, state, openItem, openContent, openIcon, openChildItems, () => {
          openAccordion(config, state, item, content, icon, childItems);
        });
      } else {
        openAccordion(config, state, item, content, icon, childItems);
      }
    }
  }

  // ---- Initialization per config ----

  function initGroup(config) {
    const state = groupState[config.name] || {
      currentlyOpen: null,
      isAnimating: false,
      initialized: false,
    };
    groupState[config.name] = state;

    let items;
    if (config.name === 'mobile-nav') {
      const triggers = document.querySelectorAll(config.triggerSelector);
      items = [];
      triggers.forEach(trigger => {
        const wrapper = trigger.closest(config.itemSelector);
        if (wrapper) items.push(wrapper);
      });
    } else {
      items = Array.from(document.querySelectorAll(config.itemSelector));
    }

    if (config.filterInvisible) {
      items = items.filter(item => !item.classList.contains('w-condition-invisible'));
    }

    if (items.length === 0) return;

    items.forEach(item => {
      const trigger = item.querySelector(config.triggerSelector);
      const content = item.querySelector(config.contentSelector);
      if (!trigger || !content) return;

      if (config.injectChevron && !trigger.querySelector('.accordion-chevron')) {
        trigger.insertAdjacentHTML('beforeend', chevronSVG);
      }

      const icon = config.iconSelector ? item.querySelector(config.iconSelector) : null;
      const childItems = config.childItemSelector
        ? content.querySelectorAll(config.childItemSelector)
        : null;

      // Handle responsive breakpoint: reset to desktop state if above breakpoint
      if (config.responsiveBreakpoint) {
        if (window.innerWidth > config.responsiveBreakpoint) {
          item.classList.remove('is-open');
          gsap.set(content, { height: 'auto', overflow: 'visible', opacity: 1 });
          // Reset content children transforms from animation
          gsap.set(content.children, { clearProps: 'opacity,y' });
          if (icon) {
            gsap.set(icon, { rotation: 0 });
            iconRotations.set(icon, 0);
          }
          state.currentlyOpen = null;
          return;
        } else if (!item.classList.contains('is-open')) {
          gsap.set(content, { height: 0, overflow: 'hidden' });
          gsap.set(content.children, { opacity: 0, y: 6 });
        }
      }

      // Set initial collapsed state (skip if responsive already handled it)
      if (!config.responsiveBreakpoint) {
        if (childItems && childItems.length > 0) {
          gsap.set(content, { height: 0, overflow: 'hidden' });
          gsap.set(childItems, { opacity: 0, y: 8 });
        } else {
          gsap.set(content, { height: 0, overflow: 'hidden' });
          gsap.set(content.children, { opacity: 0, y: 6 });
        }
      }

      // Initialize icon rotation
      if (icon) {
        if (!iconRotations.has(icon)) {
          iconRotations.set(icon, 0);
          gsap.set(icon, { rotation: 0, transformOrigin: 'center center' });
        }
      }

      // Bind click handler (only once)
      if (!state.initialized) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          handleItemClick(config, state, item);
        });
      }
    });

    // Open first item by default if configured
    if (!state.initialized && config.openFirstByDefault && items.length > 0) {
      const firstItem = items[0];
      const firstContent = firstItem.querySelector(config.contentSelector);
      firstItem.classList.add('is-open');
      gsap.set(firstContent, { height: 'auto' });
      gsap.set(firstContent.children, { opacity: 1, y: 0 });
      state.currentlyOpen = firstItem;
    }

    state.initialized = true;
  }

  // ---- Init all groups ----

  function initAll() {
    ACCORDION_CONFIGS.forEach(initGroup);
  }

  // ---- Responsive resize handling (for groups with breakpoints) ----
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ACCORDION_CONFIGS.forEach(config => {
        if (config.responsiveBreakpoint) {
          initGroup(config);
        }
      });
    }, 150);
  });

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();


// =============================================
// 3.2 Testimonial Carousel
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const testimonials = document.querySelectorAll('.testimonial');
  const thumbnails = document.querySelectorAll('.testimonials-carousel-nav .w-dyn-item');
  const carouselWrapper = document.querySelector('.testimonial-carousel');

  if (testimonials.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval;
  const AUTOPLAY_DELAY = 6000;

  function goToSlide(index) {
    if (index === currentIndex) return;
    testimonials.forEach(t => t.classList.remove('is-active'));
    thumbnails.forEach(t => t.classList.remove('is-active'));
    testimonials[index]?.classList.add('is-active');
    thumbnails[index]?.classList.add('is-active');
    currentIndex = index;
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % testimonials.length);
  }

  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Pause on hover
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);
  }

  // Thumbnail clicks
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(index);
      startAutoplay();
    });
  });

  // Initialize: set first slide active, then enable transitions
  testimonials[0]?.classList.add('is-active');
  thumbnails[0]?.classList.add('is-active');

  // Add .is-ready on next frame so the first slide is visible
  // before opacity:0 rules kick in for non-active slides
  requestAnimationFrame(() => {
    carouselWrapper?.classList.add('is-ready');
  });

  startAutoplay();
});


// =============================================
// 3.3 Setup of all swiper carousels
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
  }

  function initCarousel(carousel) {
    const { viewport, index } = carousel;
    // Get responsive values
const offset = getResponsiveValue(viewport, 'offset');
const gap = getResponsiveValue(viewport, 'gap');
const isMobile = getBreakpoint() === 'mobile';

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



    // Build Swiper config
    const swiperConfig = {
      wrapperClass: 'swiper-carousel-wrapper',
      slideClass: 'swiper-carousel-slide',

      slidesPerView: CONFIG.slidesPerView,
      spaceBetween: gap,
      slidesOffsetAfter: offset,
      centeredSlides: isMobile,
  centeredSlidesBounds: isMobile,  // Keeps first/last slides at edges

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

  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newBreakpoint = getBreakpoint();

      if (newBreakpoint === currentBreakpoint) return;

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
  const isMobile = newBreakpoint === 'mobile';

  carousel.swiper.params.slidesOffsetAfter = newOffset;
  carousel.swiper.params.spaceBetween = newGap;
  carousel.swiper.params.centeredSlides = isMobile;
  carousel.swiper.params.centeredSlidesBounds = isMobile;
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
// 3.4 Press Quotes Component
// =============================================
(function() {
  function initPressSection() {
    const quoteText = document.querySelector('.press-quote-text');
    const quoteWrapper = document.querySelector('.press-quotes-wrapper'); // Add this selector
    const logosWrapper = document.querySelector('.press-quotes');
    const logos = document.querySelectorAll('.press-quote');

    if (!quoteText || !quoteWrapper || !logosWrapper || !logos.length) return;

    const INTERVAL_TIME = 4000;
    const MOBILE_BREAKPOINT = 768;
    const TRANSITION_DURATION = 350;

    let currentIndex = 0;
    let desktopInterval = null;
    let swiper = null;
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // ===== NEW: Pre-measure all quotes and lock height =====
    function setQuoteWrapperHeight() {
      const originalText = quoteText.textContent;
      let maxHeight = 0;

      // Temporarily remove min-height to get accurate measurements
      quoteWrapper.style.minHeight = '';

      // Measure each quote
      logos.forEach(logo => {
        const quote = logo.getAttribute('data-quote');
        if (quote) {
          quoteText.textContent = quote;
          maxHeight = Math.max(maxHeight, quoteWrapper.offsetHeight);
        }
      });

      // Lock in the tallest height
      quoteWrapper.style.minHeight = maxHeight + 'px';

      // Restore original text
      quoteText.textContent = originalText;
    }

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

    // ===== CLICK HANDLERS (Desktop + Mobile) =====
logos.forEach((logo, index) => {
  logo.addEventListener('click', () => {
    if (isMobile && swiper) {
      // Mobile: let Swiper handle the slide, which triggers setActive via slideChange
      swiper.slideToLoop(index);
    } else {
      // Desktop: direct update
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
      }, 500);

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

      // Recalculate height on resize
      setQuoteWrapperHeight();

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

    // Lock height before starting animations
    setQuoteWrapperHeight();

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
// 4. MEDIA & ANIMATION
// =============================================


// =============================================
// 4.1 Where clear skin begins clip-path / mask scale effect
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
// 4.2 Looping text marquee
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
// 4.3 VideoPlayer — Standalone HLS Video Player
// =============================================
// Works on any element with class .video-player
// Reads data-video-hls and data-poster attributes
//
// Usage:
//   VideoPlayer.init('.video-player');           // init all on page
//   VideoPlayer.initElement(el);                 // init single element
//   VideoPlayer.initElement(el, { onPlay, onPause, onReset }); // with callbacks
//
// Public API on each element:
//   el._videoPlayer.play()
//   el._videoPlayer.pause()
//   el._videoPlayer.reset()
//   el._videoPlayer.toggle()
//   el._videoPlayer.preload()
//   el._videoPlayer.destroy()
window.VideoPlayer = (function () {
  'use strict';

  // ============ HLS SUPPORT ============
  const supportsHlsNatively = (() => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  })();

  const hlsInstances = new Map();

  function initHls(video, src) {
    if (supportsHlsNatively) {
      video.src = src;
      return;
    }
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: 2,
        abrEwmaDefaultEstimate: 5000000,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
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

  // ============ ACTIVE PLAYER TRACKING ============
  let activePlayer = null;

  function getActivePlayer() {
    return activePlayer;
  }

  function clearActivePlayer(player) {
    if (activePlayer === player) {
      activePlayer = null;
    }
  }

  // ============ DOM CREATION ============
  function createVideoElements(player) {
    const hlsSrc = player.dataset.videoHls;
    if (!hlsSrc || player.querySelector('video')) return;

    const fragment = document.createDocumentFragment();
    const video = document.createElement('video');
    video.loop = true;
    video.playsInline = true;
    video.muted = false;
    video.preload = 'none';
    video.className = 'video-el';
    video._hlsSrc = hlsSrc;
    fragment.appendChild(video);

    const posterSrc = player.dataset.poster;
    if (posterSrc) {
      const poster = document.createElement('img');
      poster.src = posterSrc;
      poster.alt = '';
      poster.className = 'video-poster';
      fragment.appendChild(poster);
      player._poster = poster;
    }

    player.insertBefore(fragment, player.firstChild);
  }

  // ============ PLAYER INIT ============
  function initElement(player, callbacks) {
    if (player._videoPlayer) return player._videoPlayer;

    const cb = callbacks || {};
    createVideoElements(player);

    const video = player.querySelector('video');
    if (!video) return null;

    const controls = player.querySelector('.video-controls');
    const playBtn = player.querySelector('.video-play-btn');
    const muteBtn = player.querySelector('.video-mute-btn');
    const poster = player._poster;

    let hlsLoaded = false;
    let isPlaying = false;

    if (muteBtn) {
      gsap.set(muteBtn, { autoAlpha: 0, scale: 0.7 });
    }

    // --- Visual helpers ---
    function showVideo() {
      if (poster) poster.style.opacity = '0';
      video.style.zIndex = '3';
    }

    function showPoster() {
      if (poster) poster.style.opacity = '1';
      video.style.zIndex = '1';
    }

    function setUI(playing) {
      if (playing) {
        playBtn?.classList.add('is-playing');
        if (controls) gsap.to(controls, { width: 54, height: 54, duration: 0.25, ease: 'power2.inOut' });
        if (playBtn) gsap.to(playBtn, { scale: 0.65, duration: 0.25, ease: 'power2.inOut' });
        if (muteBtn) gsap.to(muteBtn, { autoAlpha: 1, scale: 1, duration: 0.25, delay: 0.05, ease: 'back.out(1.7)' });
      } else {
        playBtn?.classList.remove('is-playing');
        if (controls) gsap.to(controls, { width: 70, height: 70, duration: 0.25, ease: 'power2.inOut' });
        if (playBtn) gsap.to(playBtn, { scale: 1, duration: 0.25, ease: 'power2.inOut' });
        if (muteBtn) gsap.to(muteBtn, { autoAlpha: 0, scale: 0.7, duration: 0.2, ease: 'power2.in' });
        showPoster();
      }
    }

    // --- Core actions ---
    function preload() {
      if (!hlsLoaded && video._hlsSrc) {
        initHls(video, video._hlsSrc);
        hlsLoaded = true;
      }
    }

    function play() {
      preload();

      // Stop any other active player
      if (activePlayer && activePlayer !== player) {
        activePlayer._videoPlayer?.reset();
      }

      activePlayer = player;
      isPlaying = true;
      setUI(true);

      // *** FIX: Fire onPlay SYNCHRONOUSLY so centering happens immediately,
      // before the marquee has any chance to resume from the previous player's reset.
      // This eliminates the race condition where async .then() fires on a stale player.
      cb.onPlay?.(player);

      // Show video once it has frames.
      // We check readyState for an immediate reveal, but ALSO listen for the
      // 'playing' event as a robust fallback. The old code relied solely on
      // 'loadeddata', which fires only once — if HLS preloaded on mouseenter
      // and loadeddata already fired before play() was called, the listener
      // would never trigger, leaving the poster visible while audio played.
      // The 'playing' event fires every time playback actually starts,
      // regardless of prior loading state.
      if (video.readyState >= 2) {
        showVideo();
      }

      const onPlaying = () => {
        video.removeEventListener('playing', onPlaying);
        if (activePlayer === player && isPlaying) {
          showVideo();
        }
      };
      video.addEventListener('playing', onPlaying);

      video.play().catch((err) => {
        console.warn('Play failed:', err);
        video.removeEventListener('playing', onPlaying);
        // Only clean up if we're still the active player
        if (activePlayer === player) {
          activePlayer = null;
          isPlaying = false;
          setUI(false);
          cb.onPlayError?.(player, err);
        }
      });
    }

    function pause() {
      video.pause();
      clearActivePlayer(player);
      isPlaying = false;
      setUI(false);
      cb.onPause?.(player);
    }

    function reset() {
      video.pause();
      video.currentTime = 0;
      clearActivePlayer(player);
      isPlaying = false;
      setUI(false);
      cb.onReset?.(player);
    }

    function toggle() {
      video.paused ? play() : pause();
    }

    function destroy() {
      if (activePlayer === player) activePlayer = null;
      video.pause();
      destroyHls(video);
      video.remove();
      if (poster) poster.remove();
      delete player._videoPlayer;
      delete player._poster;
    }

    // --- Events ---
    player.addEventListener('mouseenter', preload);

    player.addEventListener('click', (e) => {
      if (muteBtn?.contains(e.target)) return;
      toggle();
    });

    muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.classList.toggle('is-muted', video.muted);
    });

    video.addEventListener('ended', () => {
      if (activePlayer === player) pause();
    });

    // --- Public API ---
    const api = { play, pause, reset, toggle, preload, destroy, video };
    player._videoPlayer = api;
    return api;
  }

  // ============ BULK INIT ============
  function init(selector, callbacks) {
    const sel = selector || '.video-player';
    const players = document.querySelectorAll(sel);
    players.forEach((p) => initElement(p, callbacks));
  }

  // ============ GLOBAL CLICK-OUTSIDE ============
  document.addEventListener('click', (e) => {
    if (activePlayer && !e.target.closest('.video-player')) {
      activePlayer._videoPlayer?.pause();
    }
  });

  // ============ VISIBILITY ============
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && activePlayer) {
      activePlayer._videoPlayer?.reset();
    }
  });

  // ============ AUTO-INIT ============
  function autoInit() {
    const players = document.querySelectorAll('.video-player:not(.video-testimonials-wrapper .video-player)');
    if (!players.length) return;
    players.forEach((p) => initElement(p));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    requestAnimationFrame(autoInit);
  }

  return {
    init,
    initElement,
    destroyHls,
    getActivePlayer,
  };
})();


// =============================================
// 4.4 Video Testimonials Marquee (Rewritten)
// =============================================
// KEY ARCHITECTURAL CHANGE:
// Replaced the GSAP repeating timeline + modifier approach with a
// ticker-based position tracker. This decouples velocity control
// from position control, eliminating the root cause of all three bugs.
//
// The old approach used a single gsap.to(track, { x, repeat: -1, modifiers })
// timeline, then tried to animate both its `time` (for centering) and
// `timeScale` (for pause/resume) simultaneously. Since gsap.killTweensOf()
// kills ALL tweens on a target regardless of property, these would
// constantly clobber each other during rapid interactions.
//
// The new approach:
//   motion.position  — unbounded cumulative pixel offset, wrapped only at render time
//   motion.velocity  — 0 (stopped), 1 (forward), -1 (reverse)
//   velocityTween    — eases velocity for smooth start/stop
//   centerTween      — eases position for smooth centering
// These are independent tweens on separate properties, so they never conflict.
// =============================================
(function () {
  'use strict';

  // ============ EARLY EXIT ============
  const wrapper = document.querySelector('.video-testimonials-wrapper');
  if (!wrapper) return;
  const track = wrapper.querySelector('.video-testimonials-marquee-track');
  const originalGroup = track?.querySelector('.video-testimonials-marquee-group');
  if (!track || !originalGroup) return;

  // ============ CONFIG ============
  const CONFIG = {
    speed: 50,           // pixels per second
    easeDuration: 0.8,   // seconds to ease velocity in/out
    centerDuration: 0.7, // seconds to slide player to center
    centerEase: 'sine.inOut',
    scrollThreshold: 10,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reverseOnScroll: true,
    viewportMargin: '100px 0px',
  };

  // ============ STATE ============
  const state = {
    groupWidth: 0,
    direction: 1,
    isHovering: false,
    isInView: false,
    lastScrollY: window.scrollY,
    scrollRAF: null,
    lastTouchTime: 0,
  };

  // Decoupled motion state — this is the core improvement.
  // `position` is an unbounded cumulative pixel value. We apply modulo
  // only when setting the CSS transform, so centering never hits a
  // wrapping boundary in the animation itself.
  const motion = {
    position: 0,   // cumulative x offset (pixels, unbounded)
    velocity: 0,   // speed multiplier: 0 = stopped, 1 = forward, -1 = reverse
  };

  let velocityTween = null;  // current tween easing velocity
  let centerTween = null;    // current tween easing position for centering
  let tickerActive = false;

  // ============ RENDERING ============
  function applyPosition() {
    if (!state.groupWidth) return;
    // Wrap into [-groupWidth, 0) range for seamless visual loop
    let x = motion.position % state.groupWidth;
    if (x > 0) x -= state.groupWidth;
    gsap.set(track, { x });
  }

  // Called every frame by gsap.ticker
  function tick() {
    if (!state.isInView) return;
    // During centering, the centerTween's onUpdate handles position — skip tick
    if (centerTween?.isActive()) return;
    if (motion.velocity === 0) return;

    const dt = gsap.ticker.deltaRatio(60); // 1.0 at 60fps, 2.0 at 30fps, etc.
    motion.position -= (CONFIG.speed / 60) * motion.velocity * dt;
    applyPosition();
  }

  // ============ MOTION CONTROL ============
  function killVelocity() {
    if (velocityTween) { velocityTween.kill(); velocityTween = null; }
  }

  function killCenter() {
    if (centerTween) { centerTween.kill(); centerTween = null; }
  }

  function hasActivePlayer() {
    const ap = VideoPlayer.getActivePlayer();
    return ap && wrapper.contains(ap);
  }

  function shouldPause() {
    return state.isHovering || hasActivePlayer();
  }

  function updateMarquee() {
    if (CONFIG.reducedMotion) return;

    if (!state.isInView) {
      killVelocity();
      killCenter();
      motion.velocity = 0;
      track.style.willChange = 'auto';
      return;
    }

    track.style.willChange = 'transform';

    const target = shouldPause() ? 0 : state.direction;

    // Only create a new tween if velocity isn't already at target
    if (motion.velocity === target && !velocityTween) return;

    killVelocity();
    velocityTween = gsap.to(motion, {
      velocity: target,
      duration: CONFIG.easeDuration,
      ease: 'power3.out',
      onComplete() { velocityTween = null; },
    });
  }

  function setDirection(dir) {
    if (state.direction === dir) return;
    state.direction = dir;
    if (!shouldPause()) {
      killVelocity();
      velocityTween = gsap.to(motion, {
        velocity: dir,
        duration: 0.5,
        ease: 'power3.out',
        onComplete() { velocityTween = null; },
      });
    }
  }

  // Smoothly slide the track so `player` ends up centered in the wrapper.
  // Because we animate `motion.position` directly (an unbounded number),
  // there's no timeline repeat boundary to cross — the tween is always smooth.
  function centerPlayer(player) {
    if (!state.groupWidth) return;

    // Kill any in-flight motion — full stop
    killVelocity();
    killCenter();
    motion.velocity = 0;

    const playerRect = player.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const offset =
      playerRect.left + playerRect.width / 2 - (wrapperRect.left + wrapperRect.width / 2);

    if (Math.abs(offset) < 2) return;

    centerTween = gsap.to(motion, {
      position: motion.position - offset,
      duration: CONFIG.centerDuration,
      ease: CONFIG.centerEase,
      onUpdate: applyPosition,
      onComplete() { centerTween = null; },
    });
  }

  // ============ SCROLL ============
  function processScroll() {
    state.scrollRAF = null;
    if (!CONFIG.reverseOnScroll || shouldPause() || !state.isInView) return;
    const currentY = window.scrollY;
    const delta = currentY - state.lastScrollY;
    state.lastScrollY = currentY;
    if (Math.abs(delta) < CONFIG.scrollThreshold) return;
    setDirection(delta > 0 ? 1 : -1);
  }

  function handleScroll() {
    if (!state.isInView) return;
    if (!state.scrollRAF) {
      state.scrollRAF = requestAnimationFrame(processScroll);
    }
  }

  // ============ VIDEO PLAYER CALLBACKS ============
  const playerCallbacks = {
    onPlay(player) {
      centerPlayer(player);
    },
    onPause() {
      updateMarquee();
    },
    onReset() {
      updateMarquee();
    },
    onPlayError() {
      updateMarquee();
    },
  };

  // ============ MARQUEE SETUP ============
  function initMarquee() {
    killVelocity();
    killCenter();

    // Remove old clones
    track
      .querySelectorAll('.video-testimonials-marquee-group[aria-hidden="true"]')
      .forEach((clone) => {
        clone.querySelectorAll('video').forEach(VideoPlayer.destroyHls);
        clone.remove();
      });

    gsap.set(track, { x: 0 });
    motion.position = 0;
    motion.velocity = 0;

    state.groupWidth = originalGroup.offsetWidth;
    if (state.groupWidth < 100) return;

    const clonesNeeded = Math.ceil(wrapper.offsetWidth / state.groupWidth) + 2;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < clonesNeeded; i++) {
      const clone = originalGroup.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      // Clean cloned players so VideoPlayer re-inits them fresh
      clone.querySelectorAll('.video-player').forEach((p) => {
        delete p._videoPlayer;
        p.querySelector('video')?.remove();
        p.querySelector('.video-poster')?.remove();
        delete p._poster;
      });
      fragment.appendChild(clone);
    }
    track.appendChild(fragment);

    // Init all players inside the marquee with marquee callbacks
    wrapper.querySelectorAll('.video-player').forEach((p) => {
      VideoPlayer.initElement(p, playerCallbacks);
    });

    if (CONFIG.reducedMotion) return;

    // Start the frame ticker (once)
    if (!tickerActive) {
      gsap.ticker.add(tick);
      tickerActive = true;
    }

    if (state.isInView) {
      track.style.willChange = 'transform';
      // Ease in from stopped
      velocityTween = gsap.to(motion, {
        velocity: state.direction,
        duration: CONFIG.easeDuration,
        ease: 'power3.out',
        onComplete() { velocityTween = null; },
      });
    }
  }

  // ============ VIEWPORT OBSERVER ============
  const viewportObserver = new IntersectionObserver(
    (entries) => {
      const wasInView = state.isInView;
      state.isInView = entries[0].isIntersecting;

      if (!state.isInView && wasInView) {
        const ap = VideoPlayer.getActivePlayer();
        if (ap && wrapper.contains(ap)) {
          ap._videoPlayer?.reset();
        }
        state.isHovering = false;
        state.lastScrollY = window.scrollY;
      }

      updateMarquee();
    },
    {
      rootMargin: CONFIG.viewportMargin,
      threshold: 0,
    }
  );

  // ============ EVENTS ============
  track.addEventListener(
    'touchstart',
    () => {
      state.lastTouchTime = Date.now();
    },
    { passive: true }
  );

  track.addEventListener('mouseenter', () => {
    if (Date.now() - state.lastTouchTime < 500) return;
    state.isHovering = true;
    updateMarquee();
  });

  track.addEventListener('mouseleave', () => {
    if (Date.now() - state.lastTouchTime < 500) return;
    state.isHovering = false;
    updateMarquee();
  });

  window.matchMedia('(max-width: 767px)').addEventListener('change', () => {
    const ap = VideoPlayer.getActivePlayer();
    if (ap && wrapper.contains(ap)) {
      ap._videoPlayer?.reset();
    }
    state.isHovering = false;
    initMarquee();
  });

  if (CONFIG.reverseOnScroll) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ============ INIT ============
  function init() {
    viewportObserver.observe(wrapper);
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(init);
  }
})();


// =============================================
// 5. UTILITIES
// =============================================


// =============================================
// 5.1 Dynamically set current year
// =============================================
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
