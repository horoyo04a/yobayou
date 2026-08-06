// ---------- 圖片保護：擋右鍵選單、擋拖曳另開視窗 ----------
// 注意：這只能擋掉一般使用者的右鍵/拖曳操作，
// 懂技術的人還是可以用瀏覽器開發者工具或截圖拿到原圖，無法做到 100% 防盜圖。
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

document.querySelectorAll('img').forEach((img) => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', (e) => e.preventDefault());
});

// ---------- 燈箱 Lightbox（只存在於 works.html） ----------
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

if (lightbox && lightboxImg && btnClose && btnPrev && btnNext) {
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
}

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

// ---------- 捲動時頂部導覽高亮目前章節（僅 index.html 的首頁／關於／聯絡） ----------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const setActive = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
  });
};

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

// ---------- Hero 漫畫分格：四格輪流換圖 ----------
// 直式作品通常裁切起來都沒問題，不用特別設定。
// 橫式（或人物不在正中間）的作品，把該筆加上 position，指定要保留畫面的哪個位置，不然預設會從正中間裁切。
// position 可以用 'top' / 'bottom' / 'left' / 'right' / 'top left' 這類方位詞，或是 '30% 20%' 這種百分比座標，語法跟 CSS 的 object-position 完全一樣。
const heroImages = [
  { src: 'works/01.jpg' },
  { src: 'works/02.jpg' },
  { src: 'works/03.jpg' },
  { src: 'works/04.jpg' },
  { src: 'works/05.jpg' },
  { src: 'works/06.jpg' },
  { src: 'works/07.jpg' },
  { src: 'works/08.jpg' },
  { src: 'works/09.jpg' },
  { src: 'works/10.jpg' },
  { src: 'works/11.jpg' },
  { src: 'works/12.jpg' },
  { src: 'works/13.jpg' },
  { src: 'works/14.jpg' },
  { src: 'works/15.jpg' },
  { src: 'works/16.jpg' },
  { src: 'works/17.jpg' },
  { src: 'works/18.jpg' },
  { src: 'works/19.jpg' },
  { src: 'works/20.jpg' },
  // 橫式作品範例，人物如果偏左，把 position 改成 'left center' 這樣的寫法：
  // { src: 'works/21.jpg', position: 'left center' },
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

function crossfade(img, item) {
  if (!img) return;
  img.style.opacity = '0';
  window.setTimeout(() => {
    img.src = item.src;
    img.style.objectPosition = item.position || 'center';
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

// 頁面一開始就套用對應的裁切位置（HTML 裡寫死的前 4 張圖也要套用，不用等第一次輪播才生效）
heroPanels.forEach((panel, i) => {
  if (heroImages[i]) panel.style.objectPosition = heroImages[i].position || 'center';
});

function startHeroSlideshow() {
  if (prefersReducedMotion || heroTimer) return;
  heroTimer = window.setInterval(updateHeroSlide, 10000);
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
