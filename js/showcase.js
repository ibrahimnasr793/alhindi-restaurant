/* ===== CINEMATIC FOOD SHOWCASE SLIDER ===== */
(function () {
  const DURATION = 5200; // ms per slide

  let current = 0;
  let timer = null;
  let isAnimating = false;
  let touchStartX = 0;
  let paused = false;

  const showcase  = document.querySelector(".food-showcase");
  if (!showcase) return;

  const slides    = showcase.querySelectorAll(".showcase-slide");
  const dots      = showcase.querySelectorAll(".sc-dot");
  const bar       = showcase.querySelector(".sc-progress-bar");
  const prevBtn   = showcase.querySelector(".sc-prev");
  const nextBtn   = showcase.querySelector(".sc-next");
  const total     = slides.length;

  /* ---- Ken Burns keyframes per slide ---- */
  const kbFrames = [
    /* 1 */ [{ transform: "scale(1.12) translate(0,0)"     }, { transform: "scale(1) translate(-2%,1%)"  }],
    /* 2 */ [{ transform: "scale(1.10) translate(2%,0)"    }, { transform: "scale(1) translate(-1%,-1%)" }],
    /* 3 */ [{ transform: "scale(1.15) translate(-2%,2%)"  }, { transform: "scale(1) translate(1%,-1%)"  }],
    /* 4 */ [{ transform: "scale(1.08) translate(0,2%)"    }, { transform: "scale(1) translate(0,-1%)"   }],
    /* 5 */ [{ transform: "scale(1.12) translate(1%,-1%)"  }, { transform: "scale(1) translate(-2%,1%)"  }],
  ];

  /* ---- reset progress bar ---- */
  function startProgress() {
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = `width ${DURATION}ms linear`;
        bar.style.width = "100%";
      });
    });
  }

  /* ---- animate text content in ---- */
  function animateIn(slide) {
    const els = slide.querySelectorAll(".slide-tag, .slide-heading, .slide-sub, .slide-cta, .slide-num");
    els.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "none";
    });
    let delays = [0.15, 0.3, 0.5, 0.65, 0.78];
    els.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = `opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)`;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, delays[i] * 1000);
    });
  }

  /* ---- run Ken Burns on the active slide's kenburns div ---- */
  function runKenBurns(slide, idx) {
    const kb = slide.querySelector(".slide-kenburns");
    if (!kb) return;
    if (kb._kbAnim) kb._kbAnim.cancel();
    kb._kbAnim = kb.animate(kbFrames[idx % kbFrames.length], {
      duration: DURATION + 1200,
      easing: "ease-out",
      fill: "forwards",
    });
  }

  /* ---- go to slide ---- */
  function goTo(idx, dir) {
    if (isAnimating || idx === current) return;
    isAnimating = true;
    clearTimeout(timer);

    const prev = slides[current];
    const next = slides[idx];

    /* outgoing: quick fade */
    prev.classList.remove("active");
    prev.classList.add("leaving");
    setTimeout(() => prev.classList.remove("leaving"), 900);

    /* incoming */
    next.classList.add("active");
    runKenBurns(next, idx);
    animateIn(next);

    /* dots */
    dots.forEach(d => d.classList.remove("active"));
    if (dots[idx]) dots[idx].classList.add("active");

    current = idx;
    startProgress();

    setTimeout(() => {
      isAnimating = false;
      if (!paused) scheduleNext();
    }, 900);
  }

  function next() { goTo((current + 1) % total, 1); }
  function prev() { goTo((current - 1 + total) % total, -1); }

  function scheduleNext() {
    clearTimeout(timer);
    timer = setTimeout(next, DURATION);
  }

  /* ---- init first slide ---- */
  runKenBurns(slides[0], 0);
  animateIn(slides[0]);
  startProgress();
  scheduleNext();

  /* ---- controls ---- */
  nextBtn && nextBtn.addEventListener("click", () => { next(); });
  prevBtn && prevBtn.addEventListener("click", () => { prev(); });

  dots.forEach(d => {
    d.addEventListener("click", () => {
      const idx = parseInt(d.dataset.idx);
      goTo(idx, idx > current ? 1 : -1);
    });
  });

  /* ---- pause on hover (desktop) ---- */
  showcase.addEventListener("mouseenter", () => {
    paused = true;
    clearTimeout(timer);
    if (bar) bar.style.animationPlayState = "paused";
    if (bar) { bar.style.transition = "none"; }
  });
  showcase.addEventListener("mouseleave", () => {
    paused = false;
    startProgress();
    scheduleNext();
  });

  /* ---- touch swipe (mobile) ---- */
  showcase.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  showcase.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* ---- keyboard ---- */
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  next();
    if (e.key === "ArrowRight") prev();
  });
})();
