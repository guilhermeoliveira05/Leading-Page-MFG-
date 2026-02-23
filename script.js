/* ================================================
   SCRIPT.JS — Loja de Terços
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. MENU MOBILE ── */
  const hamburger = document.querySelector('.hamburger');
  const mainNav   = document.querySelector('.main-nav');
  const overlay   = document.querySelector('.mobile-nav-overlay');

  function openMenu() {
    hamburger.classList.add('active');
    mainNav.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    mainNav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mainNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  // Fecha menu ao clicar num link
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha menu com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── 2. ACTIVE LINK on SCROLL ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, observerOptions);

  sections.forEach(s => sectionObserver.observe(s));

  /* ── 3. CARROSSEL ── */
  initCarousel();

  function initCarousel() {
    const track       = document.querySelector('.carousel-track');
    const cards       = Array.from(track?.children || []);
    const btnPrev     = document.querySelector('.carousel-arrow-prev');
    const btnNext     = document.querySelector('.carousel-arrow-next');
    const dotsWrapper = document.querySelector('.carousel-dots');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let dragOffset = 0;

    // Calcula quantos cards estão visíveis
    function getVisibleCount() {
      const containerW = track.parentElement.offsetWidth;
      const cardW = cards[0].offsetWidth + 16; // gap ≈ 16
      return Math.max(1, Math.floor((containerW - 48) / cardW)); // 48px padding
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    // Criar dots
    function buildDots() {
      dotsWrapper.innerHTML = '';
      const max = getMaxIndex();
      for (let i = 0; i <= max; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrapper.appendChild(dot);
      }
    }

    function updateDots() {
      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function updateArrows() {
      if (btnPrev) btnPrev.disabled = currentIndex === 0;
      if (btnNext) btnNext.disabled = currentIndex >= getMaxIndex();
    }

    function getOffset() {
      // Calcula pixel de translate baseado no card atual
      const containerLeft = track.parentElement.getBoundingClientRect().left;
      const trackLeft     = track.getBoundingClientRect().left;
      const cardEl        = cards[currentIndex];
      const cardLeft      = cardEl.getBoundingClientRect().left;
      return (trackLeft - containerLeft) - (cardLeft - containerLeft - 24); // 24px = padding-left
    }

    function applyTranslate(extra = 0) {
      const target = cards[currentIndex];
      const trackPad = 24; // padding-left do track
      let offset = 0;
      for (let i = 0; i < currentIndex; i++) {
        offset += cards[i].offsetWidth + 19.2; // gap 1.2rem ≈ 19.2px
      }
      track.style.transform = `translateX(${-(offset) + extra}px)`;
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
      applyTranslate();
      updateDots();
      updateArrows();
    }

    btnPrev?.addEventListener('click', () => goTo(currentIndex - 1));
    btnNext?.addEventListener('click', () => goTo(currentIndex + 1));

    /* ── Touch / Drag ── */
    function onDragStart(x) {
      startX = x;
      isDragging = true;
      track.style.transition = 'none';
    }

    function onDragMove(x) {
      if (!isDragging) return;
      dragOffset = x - startX;
      applyTranslate(dragOffset);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      if (dragOffset < -50)       goTo(currentIndex + 1);
      else if (dragOffset > 50)   goTo(currentIndex - 1);
      else                        goTo(currentIndex);
      dragOffset = 0;
    }

    // Touch
    track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove',  e => onDragMove(e.touches[0].clientX),  { passive: true });
    track.addEventListener('touchend',   onDragEnd);

    // Mouse drag
    track.addEventListener('mousedown',  e => { onDragStart(e.clientX); });
    window.addEventListener('mousemove', e => { if (isDragging) onDragMove(e.clientX); });
    window.addEventListener('mouseup',   onDragEnd);

    // Impede clique acidental após arrastar
    track.addEventListener('click', e => {
      if (Math.abs(dragOffset) > 5) e.preventDefault();
    });

    /* ── Resize ── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        currentIndex = Math.min(currentIndex, getMaxIndex());
        buildDots();
        applyTranslate();
        updateArrows();
      }, 200);
    });

    // Init
    buildDots();
    applyTranslate();
    updateArrows();
  }

  /* ── 4. ANIMAÇÕES NA ENTRADA (Intersection Observer) ── */
  const animEls = document.querySelectorAll('.category-card, .carousel-card');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach(el => {
    el.style.animationPlayState = 'paused';
    fadeObserver.observe(el);
  });

  /* ── 5. HEADER: sombra ao scrollar ── */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

});