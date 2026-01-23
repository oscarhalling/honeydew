<script>
  // Footer DROPDOWN ACCORDION
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
</script>



