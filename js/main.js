/* ========================================
   SCF LearnEd - Main JavaScript
   Interactive Components
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all components
  initHeader();
  initMobileMenu();
  initHeaderSearch();
  initFaqAccordion();
  initCarousels();
  initNewsletterForm();
  initContactForm();
  initSmoothScroll();
  initAnimations();
  initParallax();
  initCounters();
  // initCourseFilter(); // Removed to use initLoadMore instead
});

/* ========================================
   HEADER (Fixed + Scroll Shadow)
   ======================================== */

function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/* ========================================
   MOBILE MENU
   ======================================== */

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const backdrop = document.querySelector('.mobile-menu-backdrop');

  if (!menuToggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', openMenu);
  mobileMenuClose?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ========================================
   FAQ ACCORDION
   ======================================== */

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0';
          }
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Set initial state
    if (item.classList.contains('open')) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
}

/* ========================================
   CAROUSELS
   ======================================== */

function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-btn-prev');
    const nextBtn = carousel.querySelector('.carousel-btn-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    const totalSlides = slides.length;
    const maxIndex = Math.max(0, totalSlides - slidesPerView);

    // Create dots
    if (dotsContainer) {
      slides.forEach((_, index) => {
        if (index <= maxIndex) {
          const dot = document.createElement('button');
          dot.classList.add('carousel-dot');
          dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => goToSlide(index));
          dotsContainer.appendChild(dot);
        }
      });
    }

    function getSlidesPerView() {
      if (window.innerWidth <= 575) return 1;
      if (window.innerWidth <= 991) return 2;
      return 4;
    }

    function updateCarousel() {
      const slideWidth = slides[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 24;
      const offset = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      const dots = carousel.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    }

    function nextSlide() {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        slidesPerView = getSlidesPerView();
        currentIndex = Math.min(currentIndex, Math.max(0, totalSlides - slidesPerView));
        updateCarousel();
      }, 250);
    });

    // Initial setup
    updateCarousel();
  });
}

/* ========================================
   TESTIMONIAL CAROUSEL (Auto-rotate)
   ======================================== */

function initTestimonialCarousel() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.testimonial-card');
  const dots = carousel.querySelectorAll('.carousel-dot');
  let currentIndex = 0;
  let autoplayInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.setAttribute('aria-hidden', i !== index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      showSlide(currentIndex);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Initialize
  showSlide(0);
  startAutoplay();
}

/* ========================================
   NEWSLETTER FORM
   ======================================== */

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput?.value.trim();

    if (!email || !isValidEmail(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('Thank you for subscribing!', 'success');
      emailInput.value = '';
    } catch (error) {
      showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  });
}

/* ========================================
   CONTACT FORM
   ======================================== */

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && !isValidEmail(emailField.value)) {
      isValid = false;
      emailField.classList.add('error');
    }

    if (!isValid) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));

      showNotification('Thank you for your message! We\'ll be in touch soon.', 'success');
      form.reset();
    } catch (error) {
      showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });

  // Real-time validation
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
  });
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus();
    });
  });
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */

function initAnimations() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Still show elements, just without animation
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('in-view');
    });
    return;
  }

  const animatedElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add in-view class for CSS-based animations
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: just show elements immediately
    animatedElements.forEach(el => {
      el.classList.add('in-view');
    });
  }
}

/* ========================================
   HEADER SEARCH
   ======================================== */

function initHeaderSearch() {
  const searchContainer = document.getElementById('headerSearch');
  const searchBtn = searchContainer?.querySelector('.header-search-btn');
  const searchInput = searchContainer?.querySelector('.header-search-input');

  if (!searchContainer || !searchBtn) return;

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (searchContainer.classList.contains('open')) {
      // If open and has value, perform search
      if (searchInput?.value.trim()) {
        window.open('https://scf.augusoft.net/', '_blank');
      }
      searchContainer.classList.remove('open');
      searchInput?.blur();
    } else {
      // Open search
      searchContainer.classList.add('open');
      searchInput?.focus();
    }
  });

  // Close on escape
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchContainer.classList.remove('open');
      searchBtn?.focus();
    }
    if (e.key === 'Enter' && searchInput.value.trim()) {
      window.open('https://scf.augusoft.net/', '_blank');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      searchContainer.classList.remove('open');
    }
  });
}

/* ========================================
   PARALLAX EFFECT (Hero)
   ======================================== */

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        heroBg.style.transform = `translateY(${rate}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ========================================
   NUMBER COUNTER ANIMATION
   ======================================== */

function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-number');
  if (counters.length === 0) return;

  const animateCounter = (element) => {
    const target = element.textContent;
    const numericPart = parseInt(target.replace(/[^0-9]/g, ''));
    const suffix = target.replace(/[0-9]/g, '');
    let current = 0;
    const increment = numericPart / 50; // 50 steps
    const duration = 1500; // 1.5 seconds
    const stepTime = duration / 50;

    const counter = setInterval(() => {
      current += increment;
      if (current >= numericPart) {
        element.textContent = target; // Set final value
        clearInterval(counter);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }
}

/* ========================================
   FILTER BAR (Courses Page)
   ======================================== */

function initFilterBar() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const selects = filterBar.querySelectorAll('select');
  const searchInput = filterBar.querySelector('.filter-search input');
  const chipsContainer = filterBar.querySelector('.filter-chips');
  const clearAllBtn = filterBar.querySelector('.filter-clear');

  let activeFilters = {};

  function updateFilters() {
    // Collect filters
    selects.forEach(select => {
      const name = select.name;
      const value = select.value;
      if (value) {
        activeFilters[name] = value;
      } else {
        delete activeFilters[name];
      }
    });

    // Update chips
    updateChips();

    // Filter courses (implement based on your data structure)
    filterCourses();
  }

  function updateChips() {
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';

    Object.entries(activeFilters).forEach(([key, value]) => {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.innerHTML = `
        ${value}
        <button aria-label="Remove ${value} filter" data-filter="${key}">×</button>
      `;
      chipsContainer.appendChild(chip);
    });

    // Show/hide clear all
    if (clearAllBtn) {
      clearAllBtn.style.display = Object.keys(activeFilters).length > 0 ? 'inline' : 'none';
    }
  }

  function filterCourses() {
    // Implement course filtering based on activeFilters
    // This would typically involve showing/hiding course cards
    // or fetching filtered results from an API
    console.log('Filtering with:', activeFilters);
  }

  selects.forEach(select => {
    select.addEventListener('change', updateFilters);
  });

  searchInput?.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim();
    if (query) {
      activeFilters.search = query;
    } else {
      delete activeFilters.search;
    }
    updateChips();
    filterCourses();
  }, 300));

  chipsContainer?.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const filterKey = e.target.dataset.filter;
      delete activeFilters[filterKey];

      // Reset corresponding select
      const select = filterBar.querySelector(`select[name="${filterKey}"]`);
      if (select) select.value = '';

      updateChips();
      filterCourses();
    }
  });

  clearAllBtn?.addEventListener('click', () => {
    activeFilters = {};
    selects.forEach(select => select.value = '');
    if (searchInput) searchInput.value = '';
    updateChips();
    filterCourses();
  });
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  existing?.remove();

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    <span>${message}</span>
    <button aria-label="Close notification">×</button>
  `;

  // Add styles inline (or add to CSS)
  Object.assign(notification.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 24px',
    borderRadius: '12px',
    background: type === 'success' ? '#4ECDC4' : type === 'error' ? '#FF6B6B' : '#003366',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideInRight 0.3s ease-out'
  });

  document.body.appendChild(notification);

  // Auto-dismiss
  const timeout = setTimeout(() => {
    notification.remove();
  }, 5000);

  // Manual dismiss
  notification.querySelector('button').addEventListener('click', () => {
    clearTimeout(timeout);
    notification.remove();
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* ========================================
   LOAD MORE (Courses Page)
   ======================================== */

function initLoadMore() {
  const loadMoreBtn = document.querySelector('.load-more .btn');
  const loadMoreContainer = document.querySelector('.load-more');
  const coursesGrid = document.querySelector('.courses-grid');

  if (!loadMoreBtn || !coursesGrid) return;

  const coursesPerPage = 6; // Show 6 courses initially
  let currentlyVisible = coursesPerPage;

  function updateVisibility(category = 'all') {
    const allCards = Array.from(coursesGrid.querySelectorAll('.course-card[data-category]'));

    // Get cards matching current filter
    const matchingCards = allCards.filter(card => {
      return category === 'all' || card.dataset.category === category;
    });

    let visibleCount = 0;

    matchingCards.forEach((card, index) => {
      if (index < currentlyVisible) {
        card.style.display = '';
        card.style.animation = 'fadeIn 0.3s ease';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Hide non-matching cards
    allCards.forEach(card => {
      if (category !== 'all' && card.dataset.category !== category) {
        card.style.display = 'none';
      }
    });

    // Show/hide load more button
    if (loadMoreContainer) {
      if (matchingCards.length > currentlyVisible) {
        loadMoreContainer.style.display = 'flex';
        loadMoreBtn.textContent = `Load More (${matchingCards.length - currentlyVisible} remaining)`;
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }

    // Update count
    const courseCount = document.getElementById('course-count');
    if (courseCount) {
      courseCount.textContent = visibleCount;
    }

    return { visibleCount, totalMatching: matchingCards.length };
  }

  // Initial visibility setup
  const activeCategory = document.querySelector('.sidebar-link.active');
  const initialCategory = activeCategory ? activeCategory.dataset.category : 'all';
  updateVisibility(initialCategory);

  // Load more button click
  loadMoreBtn.addEventListener('click', () => {
    currentlyVisible += coursesPerPage;
    const activeLink = document.querySelector('.sidebar-link.active');
    const category = activeLink ? activeLink.dataset.category : 'all';
    updateVisibility(category);
  });

  // Listen for category changes from sidebar
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-category]');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Reset visible count when changing categories
      currentlyVisible = coursesPerPage;

      // Update active state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const category = link.dataset.category;
      updateVisibility(category);

      // Smooth scroll on mobile
      if (window.innerWidth <= 991) {
        coursesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ========================================
   DROPDOWN NAVIGATION (Keyboard Support)
   ======================================== */

function initDropdownNav() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    const items = menu?.querySelectorAll('.nav-dropdown-item');

    if (!toggle || !menu) return;

    // Keyboard navigation
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menu.classList.toggle('show');
        items?.[0]?.focus();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        menu.classList.add('show');
        items?.[0]?.focus();
      }
    });

    items?.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[index + 1]?.focus();
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (index === 0) {
            toggle.focus();
          } else {
            items[index - 1]?.focus();
          }
        }

        if (e.key === 'Escape') {
          menu.classList.remove('show');
          toggle.focus();
        }
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        menu.classList.remove('show');
      }
    });
  });
}



// Initialize additional components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFilterBar();
  initLoadMore();
  initDropdownNav();
  initTestimonialCarousel();
});
