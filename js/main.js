/* /js/main.js */

import { makeShader } from './shader.js';
import Lenis from 'lenis';

/* ── Page transition overlay ── */
const overlay = document.getElementById('page-overlay');

// Active la transition seulement après le premier paint,
// puis fade-out après que le shader a eu le temps de démarrer
requestAnimationFrame(() => {
  overlay.classList.add('is-ready');
  setTimeout(() => overlay.classList.add('fade-out'), 60);
});

function navigateTo(url) {
  overlay.classList.remove('fade-out');
  overlay.classList.add('fade-in');
  setTimeout(() => { window.location.href = url; }, 420);
}

// Intercept <a href="..."> internal links
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.endsWith('.pdf')) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;

  // Same page with anchor (e.g. company.html#investors while on company.html)
  const [path, hash] = href.split('#');
  const currentPath = location.pathname.replace(/\/$/, '');
  const isSamePage = path === '' || currentPath.endsWith(path.replace(/^\//, ''));
  if (isSamePage && hash) {
    const target = document.getElementById(hash);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  e.preventDefault();
  navigateTo(href);
});

// Intercept inline onclick buttons: location.href = '...'
document.querySelectorAll('[onclick]').forEach(el => {
  const match = el.getAttribute('onclick').match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
  if (match) {
    el.removeAttribute('onclick');
    el.addEventListener('click', () => navigateTo(match[1]));
  }
});

/* ── Shaders ── */
const shaders = [];
document.querySelectorAll('canvas[data-shader]').forEach(canvas => {
  shaders.push(makeShader(canvas));
});

/* ── Mouse tracking ── */
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let tx = mx, ty = my;
let cx = mx, cy = my;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

/* ── Circles parallax ── */
const circlesEls = document.querySelectorAll('.circles-bg');

/* ── Lenis smooth scroll ── */
const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.2 });

/* ── Nav on scroll ── */
const nav = document.getElementById('nav');
if (nav) {
  lenis.on('scroll', ({ scroll }) => {
    if (scroll > 60) {
      nav.style.background     = 'rgba(32,63,107,0.95)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.boxShadow      = '0 2px 20px rgba(0,0,0,0.2)';
    } else {
      nav.style.background     = 'transparent';
      nav.style.backdropFilter = 'blur(0px)';
      nav.style.boxShadow      = 'none';
    }
  });
}

/* ── Shared RAF ── */
(function loop(t) {
  lenis.raf(t);
  tx += (mx - tx) * 0.04;
  ty += (my - ty) * 0.04;

  cx += (mx - cx) * 0.025;
  cy += (my - cy) * 0.025;
  if (circlesEls.length) {
    const ox = (cx / window.innerWidth  - 0.5) * 28;
    const oy = (cy / window.innerHeight - 0.5) * 18;
    circlesEls.forEach(el => {
      el.style.transform = `translateY(-50%) translate(${ox}px, ${oy}px)`;
    });
  }

  shaders.forEach(({ gl, uRes, uTime, uMouse }) => {
    gl.uniform2f(uRes,   gl.canvas.width, gl.canvas.height);
    gl.uniform1f(uTime,  t * 0.001);
    gl.uniform2f(uMouse, tx, gl.canvas.height - ty);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
  requestAnimationFrame(loop);
})();

/* ── Hamburger ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Spine video — play on first scroll ── */
const spineVideo = document.getElementById('spine-video');
if (spineVideo) {
  const playOnScroll = () => {
    spineVideo.play()
      .then(() => lenis.off('scroll', playOnScroll))
      .catch(err => console.warn('Spine video play failed:', err));
  };
  lenis.on('scroll', playOnScroll);
  spineVideo.addEventListener('error', e => console.error('Spine video error:', e));
}

/* ── Fade-in on scroll ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-content').forEach(el => observer.observe(el));

/* ── FAQ accordion ── */
const faqEl = document.getElementById('faq');
if (faqEl) {
  faqEl.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item   = btn.closest('.faq-item');
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
      b.closest('.faq-item').classList.remove('is-open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.nextElementSibling.classList.add('open');
      item.classList.add('is-open');
    }
  });
}