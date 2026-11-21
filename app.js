/* ЛОГИКА. Предметы берутся из SUBJECTS (см. папку data/). */
const $ = id => document.getElementById(id);
let currentSubject = SUBJECTS[0];
let currentMode = 'study';
let currentRulerIdx = 0;
let hideAnswers = false;

const activeData = () => currentSubject.data;
const isSingle = () => currentSubject.cardMode === 'single';
const isQuiz = () => currentSubject.mode === 'quiz';

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
}

/* ---------- ТЕМА И МЕНЮ ---------- */
function applyTheme() {
  const s = currentSubject, st = document.documentElement.style;
  st.setProperty('--accent', s.color);
  st.setProperty('--accent-rgb', hexToRgb(s.color));
  st.setProperty('--accent-light', s.light || s.color);
  st.setProperty('--accent-soft', s.soft || s.light || s.color);
  st.setProperty('--accent-end', s.end || '#e94560');
  $('subjectName').textContent = s.name;
}

function buildMenu() {
  $('dropdown').innerHTML = '<div class="dropdown-label">Выбрать предмет</div>' +
    SUBJECTS.map(s =>
      '<button class="dropdown-item' + (s === currentSubject ? ' active' : '') + '" onclick="switchSubject(\'' + s.id + '\')">' +
      '<span class="emoji">' + s.emoji + '</span> ' + s.name + '<span class="check">✓</span></button>'
    ).join('');
}

function updateTabs() {
  const tabs = $('tabs');
  if (isQuiz()) {
    tabs.innerHTML = '<button class="tab active" data-tab="quiz" onclick="switchTab(\'quiz\')">Тест</button>';
  } else {
    tabs.innerHTML =
      '<button class="tab' + (currentMode === 'study' ? ' active' : '') + '" data-tab="study" onclick="switchTab(\'study\')">Учить</button>' +
      '<button class="tab' + (currentMode === 'cards' ? ' active' : '') + '" data-tab="cards" onclick="switchTab(\'cards\')">Карточки</button>';
  }
}

function toggleMenu(e) {
  e.stopPropagation();
  if ($('dropdown').classList.contains('open')) closeMenu();
  else { $('dropdown').classList.add('open'); $('menuOverlay').classList.add('open'); }
}
function closeMenu() {
  $('dropdown').classList.remove('open');
  $('menuOverlay').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!$('dropdown').classList.contains('open')) return;
  if (e.target.closest('.menu-btn') || e.target.closest('.dropdown')) return;
  closeMenu();
});

function switchSubject(id) {
  closeMenu();
  const s = SUBJECTS.find(x => x.id === id);
  if (!s || s === currentSubject) return;
  currentSubject = s;
  currentRulerIdx = 0;
  hideAnswers = false;
  applyTheme();
  buildMenu();
  updateTabs();

  if (isQuiz()) {
    currentMode = 'quiz';
    switchTab('quiz');
  } else {
    currentMode = 'study';
    switchTab('study');
    renderRulerList();
    renderStudy();
  }
}

function switchTab(name) {
  currentMode = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $('studyScreen').classList.toggle('active', name === 'study');
  $('cardScreen').classList.toggle('active', name === 'cards');
  $('quizScreen').classList.toggle('active', name === 'quiz');
  if (name === 'cards') startCards();
  if (name === 'quiz') startQuiz();
}

/* ---------- ЭКРАН УЧЁБЫ ---------- */
function renderRulerList() {
  if (isQuiz()) return;
  const list = $('rulerList');
  list.innerHTML = '';
  activeData().forEach((r, i) => {
    const filled = r.points.filter(p => p.a.trim() !== '').length;
    const btn = document.createElement('button');
    btn.className = 'ruler-btn' + (i === currentRulerIdx ? ' active' : '') + (filled === 0 ? ' empty' : '');
    btn.innerHTML = r.ruler + '<span class="count">' + filled + ' / ' + r.points.length + '</span>';
    btn.onclick = () => { currentRulerIdx = i; renderRulerList(); renderStudy(); };
    list.appendChild(btn);
  });
}

function renderStudy() {
  if (isQuiz()) return;
  const r = activeData()[currentRulerIdx];
  let html = '<div class="study-header"><h2>' + r.ruler + '</h2>';
  html += '<button class="hide-btn' + (hideAnswers ? ' on' : '') + '" onclick="toggleHide()">' + (hideAnswers ? 'Показать ответы' : 'Скрыть ответы') + '</button></div>';
  r.points.forEach(p => {
    html += '<div class="point"><div class="q">' + p.q + '</div>';
    if (p.a.trim() === '') {
      html += '<div class="a"><span class="empty-note">(нет данных — допиши позже)</span></div>';
    } else {
      html += '<div class="a' + (hideAnswers ? ' hidden' : '') + '">' + escapeHtml(p.a) + '</div>';
    }
    html += '</div>';
  });
  $('studyContent').innerHTML = html;
}

function toggleHide() { hideAnswers = !hideAnswers; renderStudy(); }

/* ---------- ЭКРАН КАРТОЧЕК ---------- */
let deck = [], totalCards = 0, knownCount = 0, currentCard = null;

function buildFullDeck() {
  const arr = [];
  activeData().forEach(r => {
    if (isSingle()) {
      r.points.forEach(p => {
        if (p.a.trim()) arr.push({ ruler: r.ruler, points: [p] });
      });
    } else {
      const filled = r.points.filter(p => p.a.trim());
      if (filled.length) arr.push({ ruler: r.ruler, points: filled });
    }
  });
  return arr;
}

function startCards() {
  deck = buildFullDeck();
  totalCards = deck.length;
  knownCount = 0;
  shuffle(deck);
  showNextCard();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function showNextCard() {
  const wrap = $('cardWrap');
  if (deck.length === 0) {
    wrap.innerHTML = '<div class="done-screen"><h2>Готово!</h2><p>Знал: ' + knownCount + ' из ' + totalCards + '</p><button class="restart-btn" onclick="startCards()">Ещё раз</button></div>';
    $('counter').textContent = totalCards + ' / ' + totalCards;
    $('progressFill').style.width = '100%';
    return;
  }

  currentCard = deck[0];
  const done = totalCards - deck.length;
  $('counter').textContent = done + ' / ' + totalCards + ' · знал: ' + knownCount;
  $('progressFill').style.width = (done / totalCards * 100) + '%';

  let qHtml = '';
  if (isSingle()) {
    qHtml = '<div class="q-single">' + escapeHtml(currentCard.points[0].q) + '</div>';
  } else {
    qHtml = currentCard.points.map((p, i) =>
      '<div><span class="num">' + (i + 1) + '.</span> ' + escapeHtml(p.q) + '</div>'
    ).join('');
  }

  let aHtml = '';
  if (isSingle()) {
    aHtml = '<div class="ans-a">' + escapeHtml(currentCard.points[0].a) + '</div>';
  } else {
    aHtml = currentCard.points.map(p =>
      '<span class="ans-q">' + escapeHtml(p.q) + '</span><span class="ans-a">' + escapeHtml(p.a) + '</span>'
    ).join('');
  }

  wrap.innerHTML =
    '<div class="card" id="card">' +
      '<div class="card-top">' +
        '<span class="ruler-tag">Вопрос</span>' +
        '<div class="q-points-list">' + qHtml + '</div>' +
        '<div class="answer-text" id="answerText">' + aHtml + '</div>' +
      '</div>' +
      '<button class="show-btn" id="showBtn" onclick="toggleAnswer()">Показать ответ</button>' +
    '</div>';

  initSwipe($('card'));
}

function toggleAnswer() {
  const ans = $('answerText');
  const btn = $('showBtn');
  if (ans.classList.contains('show')) {
    ans.classList.remove('show');
    btn.textContent = 'Показать ответ';
  } else {
    ans.classList.add('show');
    btn.textContent = 'Скрыть ответ';
  }
}

function initSwipe(el) {
  let startX = 0, currentX = 0, dragging = false;

  const onStart = e => {
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    el.classList.add('dragging');
  };
  const onMove = e => {
    if (!dragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    el.style.transform = 'translateX(' + currentX + 'px) rotate(' + (currentX * 0.05) + 'deg)';
    el.style.opacity = 1 - Math.abs(currentX) / 400;
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if (Math.abs(currentX) > 100) {
      const known = currentX > 0;
      if (known) knownCount++;
      deck.shift();
      el.style.transition = 'transform .3s, opacity .3s';
      el.style.transform = 'translateX(' + (currentX > 0 ? 500 : -500) + 'px)';
      el.style.opacity = '0';
      setTimeout(showNextCard, 280);
    } else {
      el.style.transition = 'transform .25s, opacity .25s';
      el.style.transform = '';
      el.style.opacity = '1';
    }
    currentX = 0;
  };

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: true });
  el.addEventListener('touchend', onEnd);
  el.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
}

/* ---------- QUIZ (если понадобится) ---------- */
let quizIndex = 0, quizScore = 0, quizTotal = 0, quizAnswered = false, quizAnswers = [], quizCurrentOptions = [];

function startQuiz() {
  // заглушка — в этом проекте quiz не используется
  $('quizWrap').innerHTML = '<div class="done-screen"><h2>Тест пока не настроен</h2></div>';
}

function renderQuizQuestion() {}
function selectQuizOpt() {}
function checkQuizAnswer() {}
function nextQuizQuestion() {}
function showQuizResults() {}

/* ---------- СТАРТ ---------- */
applyTheme();
buildMenu();
updateTabs();
if (isQuiz()) {
  currentMode = 'quiz';
  switchTab('quiz');
} else {
  renderRulerList();
  renderStudy();
}