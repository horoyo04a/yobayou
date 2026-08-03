// ---------- 燈箱 Lightbox ----------
const triggers = Array.from(document.querySelectorAll('.tile__trigger'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxMeta = document.getElementById('lightboxMeta');
const btnClose = document.getElementById('lightboxClose');
const btnPrev = document.getElementById('lightboxPrev');
const btnNext = document.getElementById('lightboxNext');

let currentIndex = 0;

// 只在「目前有顯示（未被分類篩選隱藏）」的作品之間切換
function getVisibleTriggers() {
  return triggers.filter((trigger) => !trigger.closest('.tile').classList.contains('is-hidden'));
}

function renderLightbox(trigger) {
  const img = trigger.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxTitle.textContent = trigger.dataset.title || '';
  lightboxMeta.textContent = trigger.dataset.meta || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  btnClose.focus();
}

function openLightbox(trigger) {
  const visible = getVisibleTriggers();
  currentIndex = visible.indexOf(trigger);
  renderLightbox(trigger);
}

function closeLightbox() {
  const visible = getVisibleTriggers();
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (visible[currentIndex]) visible[currentIndex].focus();
}

function showRelative(delta) {
  const visible = getVisibleTriggers();
  if (!visible.length) return;
  currentIndex = (currentIndex + delta + visible.length) % visible.length;
  renderLightbox(visible[currentIndex]);
}

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger));
});

btnClose.addEventListener('click', closeLightbox);
btnPrev.addEventListener('click', () => showRelative(-1));
btnNext.addEventListener('click', () => showRelative(1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showRelative(-1);
  if (e.key === 'ArrowRight') showRelative(1);
});

// ---------- 作品分類篩選（切換時做淡入淡出，感覺像換頁） ----------
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const tiles = Array.from(document.querySelectorAll('.tile'));
const gallery = document.querySelector('.gallery');
const FILTER_TRANSITION_MS = 200;

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('is-active')) return;
    const filter = btn.dataset.filter;

    filterButtons.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });

    if (gallery) gallery.classList.add('is-switching');

    window.setTimeout(() => {
      tiles.forEach((tile) => {
        const match = filter === 'all' || tile.dataset.category === filter;
        tile.classList.toggle('is-hidden', !match);
      });
      if (gallery) gallery.classList.remove('is-switching');
    }, FILTER_TRANSITION_MS);
  });
});

// ---------- 頁面切換（首頁／作品展示／關於／聯絡 各自獨立顯示，不再是同一長頁捲動） ----------
const pages = Array.from(document.querySelectorAll('.page'));
const navLinks = document.querySelectorAll('.nav__links a');
const mainEl = document.querySelector('main');
const PAGE_TRANSITION_MS = 180;
let isSwitchingPage = false;

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
  });
};

function showPage(id, { updateHistory = true } = {}) {
  const target = document.getElementById(id);
  if (!target || !target.classList.contains('page') || isSwitchingPage) return;
  if (target.classList.contains('is-active')) return;

  isSwitchingPage = true;
  if (mainEl) mainEl.classList.add('is-switching');

  window.setTimeout(() => {
    pages.forEach((page) => page.classList.toggle('is-active', page.id === id));
    if (mainEl) mainEl.classList.remove('is-switching');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveNav(id);
    if (updateHistory) history.replaceState(null, '', `#${id}`);
    isSwitchingPage = false;
  }, PAGE_TRANSITION_MS);
}

// 只攔截指到「獨立頁面」(#top / #works / #about / #contact) 的連結，其餘連結（外部社群、mailto 等）維持原本行為
const pageIds = new Set(pages.map((page) => page.id));
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute('href').slice(1);
  if (!pageIds.has(id)) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(id);
  });
});

const initialId = pageIds.has(location.hash.slice(1)) ? location.hash.slice(1) : 'top';
pages.forEach((page) => page.classList.toggle('is-active', page.id === initialId));
setActiveNav(initialId);

// ---------- Hero 漫畫分格：四格輪流換圖 ----------
const heroImages = [
  'works/placeholder-01.png',
  'works/placeholder-02.png',
  'works/placeholder-03.png',
  'works/placeholder-04.png',
  'works/placeholder-05.png',
  'works/placeholder-06.png',
  'works/placeholder-07.png',
  'works/placeholder-08.png',
  'works/placeholder-09.png',
  'works/placeholder-10.png',
  'works/placeholder-11.png',
  'works/placeholder-12.png',
  'works/placeholder-13.png',
  'works/placeholder-14.png',
  'works/placeholder-15.png',
  'works/placeholder-16.png',
  'works/placeholder-17.png',
  'works/placeholder-18.png',
  'works/placeholder-19.png',
  'works/placeholder-20.png',
];

const heroPanels = [
  document.getElementById('heroCard1'),
  document.getElementById('heroCard2'),
  document.getElementById('heroCard3'),
  document.getElementById('heroCard4'),
].filter(Boolean);

const heroStrip = document.querySelector('.hero__strip');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let heroIndex = 0;
let heroTimer = null;

function crossfade(img, src) {
  if (!img) return;
  img.style.opacity = '0';
  window.setTimeout(() => {
    img.src = src;
    img.style.opacity = '1';
  }, 280);
}

function updateHeroSlide() {
  const total = heroImages.length;
  const step = Math.max(1, Math.floor(total / heroPanels.length));
  heroPanels.forEach((panel, i) => {
    const idx = (heroIndex + i * step) % total;
    crossfade(panel, heroImages[idx]);
  });
  heroIndex = (heroIndex + 1) % total;
}

function startHeroSlideshow() {
  if (prefersReducedMotion || heroTimer) return;
  heroTimer = window.setInterval(updateHeroSlide, 3200);
}

function stopHeroSlideshow() {
  window.clearInterval(heroTimer);
  heroTimer = null;
}

if (heroPanels.length && !prefersReducedMotion) {
  startHeroSlideshow();
  heroStrip.addEventListener('mouseenter', stopHeroSlideshow);
  heroStrip.addEventListener('mouseleave', startHeroSlideshow);
}

// ---------- LOGO 圖片尚未放入時，自動隱藏避免顯示破圖 ----------
const navLogoImg = document.querySelector('.nav__logo-img');
if (navLogoImg) {
  navLogoImg.addEventListener('error', () => {
    navLogoImg.style.display = 'none';
  }, { once: true });
}
