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

function openLightbox(index) {
  currentIndex = index;
  const trigger = triggers[currentIndex];
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

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  triggers[currentIndex].focus();
}

function showRelative(delta) {
  currentIndex = (currentIndex + delta + triggers.length) % triggers.length;
  openLightbox(currentIndex);
}

triggers.forEach((trigger, index) => {
  trigger.addEventListener('click', () => openLightbox(index));
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

// ---------- 捲動時頂部導覽高亮目前章節 ----------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const setActive = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { rootMargin: '-40% 0px -50% 0px' }
);

sections.forEach((section) => observer.observe(section));

// ---------- Hero 幻燈片：兩張卡片輪流換圖 ----------
const heroImages = [
  'works/placeholder-1.svg',
  'works/placeholder-2.svg',
  'works/placeholder-3.svg',
  'works/placeholder-4.svg',
  'works/placeholder-5.svg',
  'works/placeholder-6.svg',
];

const heroCard1 = document.getElementById('heroCard1');
const heroCard2 = document.getElementById('heroCard2');
const heroVol = document.getElementById('heroVol');
const heroStack = document.querySelector('.hero__stack');
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
  const i1 = heroIndex % total;
  const i2 = (heroIndex + 3) % total; // 讓兩張卡片永遠顯示不同的圖
  crossfade(heroCard1, heroImages[i1]);
  crossfade(heroCard2, heroImages[i2]);
  if (heroVol) {
    heroVol.textContent = `${String(i1 + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }
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

if (heroCard1 && heroCard2 && !prefersReducedMotion) {
  startHeroSlideshow();
  heroStack.addEventListener('mouseenter', stopHeroSlideshow);
  heroStack.addEventListener('mouseleave', startHeroSlideshow);
}
