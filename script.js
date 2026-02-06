/* =========================================================
   ULTRA LUXURY INTERACTION ENGINE – ENHANCED
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     0. UTILITIES
  ================================= */
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const isTouch = matchMedia("(pointer: coarse)").matches;

  /* ================================
     1. CENTRAL RAF ENGINE
  ================================= */
  const rafCallbacks = new Set();
  const rafLoop = () => {
    rafCallbacks.forEach(cb => cb());
    requestAnimationFrame(rafLoop);
  };
  requestAnimationFrame(rafLoop);

  /* ================================
     2. INERTIAL CURSOR (DESKTOP ONLY)
  ================================= */
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");

  if (!isTouch && dot && outline) {
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const dotPos = { ...mouse };
    const outlinePos = { ...mouse };

    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    document.querySelectorAll("a, button, .highlight-card, .attr-item")
      .forEach(el => {
        el.addEventListener("mouseenter", () => outline.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => outline.classList.remove("cursor-hover"));
      });

    rafCallbacks.add(() => {
      dotPos.x = lerp(dotPos.x, mouse.x, 0.35);
      dotPos.y = lerp(dotPos.y, mouse.y, 0.35);
      outlinePos.x = lerp(outlinePos.x, mouse.x, 0.12);
      outlinePos.y = lerp(outlinePos.y, mouse.y, 0.12);

      const t = performance.now() * 0.004;

      dot.style.transform =
        `translate3d(${dotPos.x}px,${dotPos.y}px,0) scale(${1 + 0.05 * Math.sin(t)})`;

      outline.style.transform =
        `translate3d(${outlinePos.x - 20}px,${outlinePos.y - 20}px,0)
         scale(${1 + 0.08 * Math.cos(t)})`;
    });
  }

  /* ================================
     3. SMOOTH SCROLL VALUE
  ================================= */
  let currentScroll = scrollY;
  let targetScroll = scrollY;

  window.addEventListener("scroll", () => {
    targetScroll = scrollY;
  }, { passive: true });

  /* ================================
     4. HERO PARALLAX
  ================================= */
  const hero = document.querySelector(".hero-parallax");

  rafCallbacks.add(() => {
    currentScroll = lerp(currentScroll, targetScroll, 0.08);

    if (hero) {
      const scale = 1 + clamp(currentScroll / 2500, 0, 0.08);
      hero.style.transform =
        `translate3d(0,${currentScroll * 0.18}px,0) scale(${scale})`;
    }
  });

  /* ================================
     5. MAGNETIC + FLOAT ELEMENTS
  ================================= */
  const magneticEls = document.querySelectorAll(
    ".btn-gold, .btn-glass, .highlight-card, .attr-item"
  );

  const magneticData = [];

  magneticEls.forEach(el => {
    el.style.willChange = "transform";

    const data = {
      el,
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      angle: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.003
    };

    magneticData.push(data);

    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.25;
      data.velocity.x = x;
      data.velocity.y = y;
    });

    el.addEventListener("mouseleave", () => {
      data.velocity.x = 0;
      data.velocity.y = 0;
    });
  });

  rafCallbacks.add(() => {
    magneticData.forEach(d => {
      d.offset.x = lerp(d.offset.x, d.velocity.x, 0.18);
      d.offset.y = lerp(d.offset.y, d.velocity.y, 0.18);

      d.angle += d.speed;
      const fx = Math.sin(d.angle) * 2;
      const fy = Math.cos(d.angle) * 1.5;

      d.el.style.transform =
        `translate3d(${d.offset.x + fx}px,${d.offset.y + fy}px,0) scale(1.03)`;
    });
  });

  /* ================================
     6. REVEAL ON SCROLL
  ================================= */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("active");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal-up")
    .forEach(el => revealObserver.observe(el));

  /* ================================
     7. ACTIVE NAV SYNC
  ================================= */
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".menu a, .pill-item");

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l =>
        l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`)
      );
    });
  }, { threshold: 0.6 });

  sections.forEach(s => navObserver.observe(s));

});


/* =========================================================
   SMOOTH COUNTDOWN ENGINE (RAF SYNCED)
========================================================= */

const targetDate = new Date("February 21, 2026 00:00:00").getTime();
const popup = document.getElementById("countdown-popup");
const closeBtn = document.querySelector(".lux-close");

const els = {
  d: document.getElementById("days"),
  h: document.getElementById("hours"),
  m: document.getElementById("minutes"),
  s: document.getElementById("seconds")
};

let prev = { d: 0, h: 0, m: 0, s: 0 };

const pad = n => String(n).padStart(2, "0");
const ease = t => 1 - Math.pow(1 - t, 3);

function pulse(el) {
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.15)" },
      { transform: "scale(1)" }
    ],
    { duration: 320, easing: "ease-out" }
  );
}

function countdownRAF() {
  const diff = targetDate - Date.now();

  if (diff <= 0) return;

  const values = {
    d: diff / 86400000,
    h: (diff % 86400000) / 3600000,
    m: (diff % 3600000) / 60000,
    s: (diff % 60000) / 1000
  };

  for (let k in values) {
    prev[k] += (values[k] - prev[k]) * ease(0.08);
    const int = Math.floor(prev[k]);
    if (els[k].textContent !== pad(int)) {
      els[k].textContent = pad(int);
      pulse(els[k]);
    }
  }

  requestAnimationFrame(countdownRAF);
}

requestAnimationFrame(countdownRAF);

/* ================================
   POPUP ENTRANCE / EXIT
================================= */
if (popup) {
  popup.animate(
    [
      { opacity: 0, transform: "scale(.95) translateY(20px)" },
      { opacity: 1, transform: "scale(1) translateY(0)" }
    ],
    { duration: 900, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
  );
}

closeBtn?.addEventListener("click", () => {
  popup.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(.95)" }
    ],
    { duration: 600, easing: "ease-in-out", fill: "forwards" }
  ).onfinish = () => popup.remove();
});
// oxygen-viewer.js (Glitch-Free Version)
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.highlight-card');

    /* --- 1. Create Oxygen Viewer --- */
    const viewer = document.createElement('div');
    viewer.id = 'oxygen-viewer';
    viewer.setAttribute('aria-hidden', 'true');
    viewer.setAttribute('role', 'dialog');
    viewer.style.opacity = 0; // start invisible
    viewer.innerHTML = `
        <div class="aquamorphic-blur"></div>
        <div class="floating-particles"></div>
        <div class="content-container">
            <div class="close-trigger"><div class="close-pill"></div></div>
            <div class="luxury-meta">
                <span class="pill-tag">Agri-Excellence</span>
                <h2 class="dynamic-title"></h2>
            </div>
            <div class="frame-container"><img src="" alt="View"></div>
        </div>
    `;
    document.body.appendChild(viewer);

    const viewerImg = viewer.querySelector('img');
    const title = viewer.querySelector('.dynamic-title');
    const contentContainer = viewer.querySelector('.content-container');
    const particlesContainer = viewer.querySelector('.floating-particles');
    const closeTrigger = viewer.querySelector('.close-trigger');
    const blurLayer = viewer.querySelector('.aquamorphic-blur');

    let isAnimating = false;

    /* --- 2. Particle System --- */
    const particleCount = 20;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const scale = 1 + Math.random() * 0.5;
        p.style.transform = `translate(${x}%, ${y}%) scale(${scale})`;
        particlesContainer.appendChild(p);
        particles.push({ el: p, x, y, speedX: (Math.random()-0.5)*0.03, speedY: (Math.random()-0.5)*0.03, scaleDir: Math.random()<0.5?1:-1, scale });
    }
    (function animateParticles(){
        particles.forEach(p=>{
            p.x+=p.speedX; p.y+=p.speedY;
            if(p.x>100)p.x=0; if(p.x<0)p.x=100;
            if(p.y>100)p.y=0; if(p.y<0)p.y=100;
            p.scale+=0.002*p.scaleDir;
            if(p.scale>1.4||p.scale<0.6)p.scaleDir*=-1;
            p.el.style.transform=`translate(${p.x}%,${p.y}%) scale(${p.scale})`;
        });
        requestAnimationFrame(animateParticles);
    })();

    /* --- 3. Ripple Effect --- */
    function createRipple(e){
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = contentContainer.getBoundingClientRect();
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        contentContainer.appendChild(ripple);
        ripple.animate([{transform:'scale(0)',opacity:0.6},{transform:'scale(2.5)',opacity:0}],{duration:700,easing:'cubic-bezier(0.4,0,0.2,1)',fill:'forwards'});
        setTimeout(()=>ripple.remove(),700);
    }
    contentContainer.addEventListener('click', createRipple);

    /* --- 4. Open / Close Viewer --- */
    function toggleViewer(open, card=null){
        if(isAnimating) return;
        isAnimating=true;

        if(open && card){
            viewerImg.src=card.querySelector('img').src;
            title.textContent=card.querySelector('h3')?.textContent||"Natural Innovation";

            viewer.style.transition='opacity 0.5s ease';
            viewer.classList.add('active');
            viewer.setAttribute('aria-hidden','false');
            document.body.style.overflow='hidden';

            contentContainer.style.transition='none';
            contentContainer.style.transform='scale(0.85) translateY(60px)';
            contentContainer.style.opacity=0;
            blurLayer.style.transition='opacity 0.5s ease';
            blurLayer.style.opacity=0;

            // trigger transition on next frame
            requestAnimationFrame(()=>{
                viewer.style.opacity=1;
                contentContainer.style.transition='transform 0.7s cubic-bezier(0.22,1.61,0.36,1), opacity 0.6s ease';
                contentContainer.style.transform='scale(1) translateY(0)';
                contentContainer.style.opacity=1;
                blurLayer.style.opacity=1;
            });

            setTimeout(()=>isAnimating=false,700);
        } else {
            contentContainer.style.transition='transform 0.5s cubic-bezier(0.55,0,0.1,1), opacity 0.5s ease';
            contentContainer.style.transform='scale(0.85) translateY(60px)';
            contentContainer.style.opacity=0;
            blurLayer.style.opacity=0;
            viewer.style.transition='opacity 0.5s ease';
            viewer.style.opacity=0;

            setTimeout(()=>{
                viewer.classList.remove('active');
                viewer.setAttribute('aria-hidden','true');
                document.body.style.overflow='';
                isAnimating=false;
            },500);
        }
    }

    /* --- 5. Event Listeners --- */
    cards.forEach(card=>card.addEventListener('click',()=>toggleViewer(true,card)));
    closeTrigger.addEventListener('click',()=>toggleViewer(false));
    blurLayer.addEventListener('click',()=>toggleViewer(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && viewer.classList.contains('active')) toggleViewer(false)});
});
