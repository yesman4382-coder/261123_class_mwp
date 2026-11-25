/* ==========================================================
   MELLOW BEAN — 페이지 동작
   1. 스크롤에 따라 상단 메뉴바 배경 바꾸기
   2. 지금 보고 있는 섹션의 메뉴 강조하기
   3. 스크롤하면 섹션과 카드가 부드럽게 나타나기
   4. 현재 시각 기준 "영업 중 / 영업 종료" 표시
   ========================================================== */

document.documentElement.classList.add('js');

const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.nav a');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. 상단 메뉴바: 첫 화면 위에서는 투명, 내려가면 네이비 ---------- */
function updateHeader() {
  header.classList.toggle('is-top', window.scrollY < 40);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ---------- 2. 지금 보고 있는 섹션의 메뉴 강조 ---------- */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px' } // 화면 가운데에 걸친 섹션을 "현재"로 봄
);
document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

/* ---------- 3. 스크롤하면 부드럽게 나타나기 ---------- */
const revealTargets = document.querySelectorAll('.about-photo, .about-text, .section-head, .menu-card, .visit-item, .visit-status, .visit-map');

if (reduceMotion) {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  // 메뉴 카드는 같은 줄에서 왼쪽부터 조금씩 늦게 나타나게
  // (화면 폭에 따라 3열/2열로 바뀌므로 지금 열 수를 읽어서 계산)
  const menuGrid = document.querySelector('.menu-grid');
  function setCardDelays() {
    if (!menuGrid) return;
    const columns = getComputedStyle(menuGrid).gridTemplateColumns.split(' ').length;
    [...menuGrid.children].forEach((card, index) => {
      card.style.transitionDelay = card.classList.contains('is-visible') ? '' : `${(index % columns) * 0.12}s`;
    });
  }
  setCardDelays();
  window.addEventListener('resize', setCardDelays);

  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------- 4. 영업 중 / 영업 종료 표시 (대구 = 한국 시간 기준) ---------- */
const OPEN_HOUR = 9;
const CLOSE_HOUR = 21;
const statusEl = document.querySelector('.open-status');

function getKoreaHour() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  return hour + minute / 60;
}

function updateOpenStatus() {
  if (!statusEl) return;
  const now = getKoreaHour();
  const isOpen = now >= OPEN_HOUR && now < CLOSE_HOUR;
  statusEl.textContent = isOpen ? '지금 영업 중' : '영업 종료 · 내일 09:00 오픈';
  statusEl.classList.toggle('is-open', isOpen);
  statusEl.hidden = false;
}
updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000); // 1분마다 다시 확인

/* ---------- 푸터 연도 ---------- */
const yearEl = document.querySelector('.year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
