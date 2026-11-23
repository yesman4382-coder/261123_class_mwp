// ===== 예식 정보 (여기만 바꾸면 달력·카운트다운이 함께 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 4, 15, 13, 0, 0); // 월은 0부터 시작 (4 = 5월)

// ===== 토스트 알림 =====
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== 달력 그리기 =====
function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const weddingDay = WEDDING_DATE.getDate();

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  let html = dayNames
    .map((d, i) => `<div class="day-name${i === 0 ? ' sun' : ''}">${d}</div>`)
    .join('');

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) html += '<div></div>';

  for (let date = 1; date <= lastDate; date++) {
    const classes = ['day'];
    if ((firstDay + date - 1) % 7 === 0) classes.push('sun');
    if (date === weddingDay) classes.push('wedding');
    html += `<div class="${classes.join(' ')}">${date}</div>`;
  }

  calendar.innerHTML = html;
}

// ===== 카운트다운 =====
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const ddayText = document.getElementById('dday-text');

  if (diff <= 0) {
    ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].forEach(id => {
      document.getElementById(id).textContent = 0;
    });
    ddayText.innerHTML = '민준 ♥ 서연, <em>결혼했습니다!</em>';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = days;
  document.getElementById('cd-hours').textContent = hours;
  document.getElementById('cd-mins').textContent = mins;
  document.getElementById('cd-secs').textContent = secs;
  ddayText.innerHTML = `민준 ♥ 서연의 결혼식이 <em>${days}일</em> 남았습니다`;
}

// ===== 스크롤 등장 효과 =====
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== 꽃잎 효과 =====
function createPetals() {
  const container = document.querySelector('.petals');
  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = 6 + Math.random() * 8;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
    petal.style.animationDuration = `${6 + Math.random() * 6}s`;
    petal.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(petal);
  }
}

// ===== 갤러리 라이트박스 =====
function initGallery() {
  const items = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    lbImage.style.background = getComputedStyle(items[current]).background;
  }

  function open(index) {
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('lb-next').addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

// ===== 복사 기능 =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 로컬 파일(file://)로 열었을 때를 위한 대체 방법
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await copyText(btn.dataset.copy);
      showToast('계좌번호가 복사되었습니다');
    });
  });

  document.getElementById('share-btn').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: location.href });
      } catch { /* 사용자가 공유를 취소한 경우 */ }
    } else {
      await copyText(location.href);
      showToast('청첩장 링크가 복사되었습니다');
    }
  });
}

// ===== 실행 =====
renderCalendar();
updateCountdown();
setInterval(updateCountdown, 1000);
initFadeIn();
createPetals();
initGallery();
initCopyButtons();
