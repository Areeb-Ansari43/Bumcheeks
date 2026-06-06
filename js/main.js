/* ============================================================
   BumCheeks — Main JavaScript
   ============================================================ */

'use strict';

/* ── Navbar scroll behaviour ─────────────────────────────── */
(function initNav() {
  const nav  = document.getElementById('navbar');
  const ham  = document.getElementById('hamburger');
  const mob  = document.getElementById('nav-mobile');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
  }

  // Mark active link
  const links = document.querySelectorAll('.nav-link');
  const page  = location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    const href = l.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      l.classList.add('active');
    }
  });
})();

/* ── Particle Background ─────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const COLORS = ['#7b2fff', '#00e5ff', '#fbbf24', '#a855f7', '#67e8f9'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.alpha = Math.random() * 0.6 + 0.2;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.02;
      this.alpha = 0.3 + Math.sin(this.pulse) * 0.25;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Geometric floating shapes
  class Shape {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 60;
      this.size = Math.random() * 30 + 10;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(Math.random() * 0.3 + 0.1);
      this.rot  = Math.random() * Math.PI * 2;
      this.vrot = (Math.random() - 0.5) * 0.01;
      this.alpha = Math.random() * 0.15 + 0.05;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.sides = [3, 4, 6][Math.floor(Math.random() * 3)];
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.vrot;
      if (this.y < -80) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 6;
      ctx.lineWidth   = 1;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.beginPath();
      for (let i = 0; i < this.sides; i++) {
        const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * this.size;
        const py = Math.sin(angle) * this.size;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 120; i++) particles.push(new Particle());
    for (let i = 0; i < 25; i++)  particles.push(new Shape());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  init();
  loop();
})();

/* ── Scroll Reveal ───────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ── Animated Counters ───────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ── Live Digital Clock ──────────────────────────────────── */
(function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (!timeEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    timeEl.textContent = `${h}:${m}:${s}`;
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }
  update();
  setInterval(update, 1000);
})();

/* ── Cheeky Clicker ──────────────────────────────────────── */
(function initClicker() {
  const btn   = document.getElementById('clicker-btn');
  const count = document.getElementById('clicker-count');
  if (!btn || !count) return;

  let clicks = parseInt(localStorage.getItem('bc_clicks') || '0', 10);
  count.textContent = clicks.toLocaleString();

  btn.addEventListener('click', () => {
    clicks++;
    localStorage.setItem('bc_clicks', clicks);
    count.textContent = clicks.toLocaleString();
    count.classList.add('pop');
    setTimeout(() => count.classList.remove('pop'), 150);

    // Ripple
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.cssText = `
      position:absolute;width:10px;height:10px;background:rgba(0,229,255,0.5);
      border-radius:50%;pointer-events:none;transform:scale(0);
      animation:ripple-anim 0.6s ease-out forwards;
      left:50%;top:50%;margin:-5px 0 0 -5px;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
})();

/* ── Cheek Facts ─────────────────────────────────────────── */
(function initFacts() {
  const facts = [
    "The average human sits for approximately 9.3 hours per day — that's a lot of cheek time.",
    "Cheeks contain the gluteus maximus, the largest muscle in the human body.",
    "Ancient Romans considered well-rounded cheeks a sign of prosperity and good health.",
    "The word 'gluteus' comes from the Greek word for 'rump' — a truly noble etymology.",
    "Cheeks generate approximately 1,500 newtons of force when properly deployed in a seated position.",
    "Studies show that 94% of all great ideas are conceived while sitting — cheeks enabling genius.",
    "The Shetland Islands, home of BumCheeks HQ, has more sheep than people — and all sheep have premium cheeks.",
    "In zero gravity, astronaut cheeks float freely — NASA calls this 'Cheek Liberation Mode'.",
    "The average office chair endures 2.5 million cheek-hours over its lifetime.",
    "Premium cheek solutions have been shown to increase productivity by up to 47% in controlled studies.",
    "Shetland ponies, native to our HQ region, are renowned for their exceptionally sturdy cheeks.",
    "The first recorded use of a cushioned seat was in 3,000 BC — early cheek technology pioneers.",
  ];

  const factEl  = document.getElementById('fact-text');
  const factBtn = document.getElementById('fact-btn');
  if (!factEl || !factBtn) return;

  let last = -1;
  function newFact() {
    let idx;
    do { idx = Math.floor(Math.random() * facts.length); } while (idx === last);
    last = idx;
    factEl.style.opacity = '0';
    setTimeout(() => {
      factEl.textContent = facts[idx];
      factEl.style.opacity = '1';
    }, 300);
  }
  newFact();
  factBtn.addEventListener('click', newFact);
})();

/* ── Premium Widget Data (fake crypto/weather/market) ────── */
(function initPremiumWidgets() {
  const cryptoPrice  = document.getElementById('crypto-price');
  const cryptoChange = document.getElementById('crypto-change');
  const weatherTemp  = document.getElementById('weather-temp');
  const weatherDesc  = document.getElementById('weather-desc');
  const marketIdx    = document.getElementById('market-index');
  const marketChg    = document.getElementById('market-change');
  const sparklines   = document.querySelectorAll('.sparkline');

  if (!cryptoPrice) return;

  const cryptos  = ['CHEEK', 'BUTT', 'RUMP', 'GLUTE', 'SEAT'];
  const weathers = [
    { t: '8°C',  d: 'Overcast · Lerwick, Shetland' },
    { t: '6°C',  d: 'Drizzle · Lerwick, Shetland' },
    { t: '11°C', d: 'Partly Cloudy · Lerwick, Shetland' },
    { t: '4°C',  d: 'Windy · Lerwick, Shetland' },
  ];

  function rand(min, max) { return (Math.random() * (max - min) + min); }
  function fmt(n, dec = 2) { return n.toFixed(dec); }

  function updateCrypto() {
    const price  = rand(0.0042, 9999.99);
    const change = rand(-15, 25);
    const sym    = cryptos[Math.floor(Math.random() * cryptos.length)];
    const priceStr = price > 100 ? `$${fmt(price, 2)}` : `$${fmt(price, 4)}`;
    cryptoPrice.textContent  = priceStr;
    cryptoPrice.previousElementSibling.querySelector('.premium-icon').title = sym;
    document.getElementById('crypto-sym').textContent = sym + '/USD';
    cryptoChange.textContent = (change >= 0 ? '+' : '') + fmt(change, 2) + '%';
    cryptoChange.className   = 'premium-change ' + (change >= 0 ? 'change-up' : 'change-down');
  }

  function updateWeather() {
    const w = weathers[Math.floor(Math.random() * weathers.length)];
    weatherTemp.textContent = w.t;
    weatherDesc.textContent = w.d;
  }

  function updateMarket() {
    const idx = rand(14000, 22000);
    const chg = rand(-3.5, 4.2);
    marketIdx.textContent = idx.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    marketChg.textContent = (chg >= 0 ? '+' : '') + fmt(chg, 2) + '%';
    marketChg.className   = 'premium-change ' + (chg >= 0 ? 'change-up' : 'change-down');
  }

  // Draw sparklines
  function drawSparkline(canvas, color) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width  = canvas.offsetWidth  || 200;
    const h = canvas.height = canvas.offsetHeight || 50;
    const pts = Array.from({length: 20}, () => rand(0.1, 0.9));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '80');
    grad.addColorStop(1, color + '00');

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - p * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    // Fill
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    // Line
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - p * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const sparkColors = ['#fbbf24', '#00e5ff', '#a855f7'];
  sparklines.forEach((s, i) => drawSparkline(s, sparkColors[i] || '#00e5ff'));

  updateCrypto();
  updateWeather();
  updateMarket();

  setInterval(() => {
    updateCrypto();
    updateWeather();
    updateMarket();
    sparklines.forEach((s, i) => drawSparkline(s, sparkColors[i] || '#00e5ff'));
  }, 5000);
})();

/* ── Phone Number Generator (Contact) ───────────────────── */
(function initPhone() {
  const btn     = document.getElementById('phone-btn');
  const display = document.getElementById('phone-display');
  if (!btn || !display) return;

  const prefixes = ['+44 1595', '+44 7700', '+1 (555)', '+44 1806', '+44 1950'];
  function generate() {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(Math.random() * 9000000 + 1000000);
    display.style.opacity = '0';
    setTimeout(() => {
      display.textContent = `${pre} ${num}`;
      display.style.opacity = '1';
    }, 200);
  }
  generate();
  btn.addEventListener('click', generate);
})();

/* ── Parallax (Home) ─────────────────────────────────────── */
(function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    layers.forEach(l => {
      const speed = parseFloat(l.dataset.parallax) || 0.3;
      l.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();

/* ── Ripple keyframe injection ───────────────────────────── */
(function injectRippleStyle() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(30); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();
