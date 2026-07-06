/* ===== PARTICLES BACKGROUND ===== */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);

  const count = Math.min(60, Math.floor(W / 20));
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    color: Math.random() > 0.6 ? "rgba(230,57,70," : "rgba(255,215,0,",
    alpha: Math.random() * 0.6 + 0.2,
  }));

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(230,57,70,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.fill();
    });
    drawLines();
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
  );

  els.forEach((el) => obs.observe(el));
}

/* ===== ANIMATED COUNTERS ===== */
function animateCounter(el, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  function update() {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString("ar-EG") + (el.dataset.suffix || "");
      return;
    }
    el.textContent = Math.floor(start).toLocaleString("ar-EG") + (el.dataset.suffix || "");
    requestAnimationFrame(update);
  }
  update();
}

function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.count), 1500);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => obs.observe(c));
}

/* ===== MENU CARD STAGGER ===== */
function initMenuCardAnim() {
  const cards = document.querySelectorAll(".menu-item-card");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("animated");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach((c, i) => {
    c.style.animationDelay = (i % 6) * 0.07 + "s";
    obs.observe(c);
  });
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });
}

/* ===== HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector(".hamburger");
  const menu = document.querySelector(".mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => menu.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
    }
  });
}

/* ===== MENU IMAGE FLIP ===== */
function initMenuImageFlip() {
  const wrapper = document.querySelector(".menu-full-image-wrapper");
  if (!wrapper) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        wrapper.classList.add("visible");
        obs.unobserve(wrapper);
      }
    });
  }, { threshold: 0.3 });
  obs.observe(wrapper);
}

/* ===== SMOOTH ANCHOR SCROLLING ===== */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ===== ACTIVE NAV LINK ===== */
function initActiveNav() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initScrollReveal();
  initCounters();
  initNavbar();
  initHamburger();
  initMenuImageFlip();
  initMenuCardAnim();
  initSmoothLinks();
  initActiveNav();
});
