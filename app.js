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
      r.points.forEach(p => { if (p.a.trim() !== '') arr.push({ ruler: r.ruler, points: [p] }); });
    } else if (r.points.some(p => p.a.trim() !== '')) {
      arr.push({ ruler: r.ruler, points: r.points });
    }
  });
  return arr;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startCards() {
  deck = shuffle(buildFullDeck());
  totalCards = deck.length;
  knownCount = 0;
  currentCard = null;
  renderCard();
}

function renderCard() {
  const wrap = $('cardWrap');
  const single = isSingle();

  $('counter').textContent = (totalCards - deck.length) + ' / ' + totalCards + '   ·   знал: ' + knownCount;
  $('progressFill').style.width = (totalCards ? ((totalCards - deck.length) / totalCards * 100) : 0) + '%';

  if (deck.length === 0) {
    wrap.innerHTML = '<div class="done-screen"><h2>🎉 Готово!</h2><p>Ты прошёл все карточки.</p><p>Знал: <b>' + knownCount + '</b> из <b>' + totalCards + '</b></p><button class="restart-btn" onclick="startCards()">Перемешать заново</button></div>';
    return;
  }

  currentCard = deck[0];

  let qHtml = '', aHtml = '';
  currentCard.points.forEach(p => {
    qHtml += single
      ? '<div class="q-single">' + escapeHtml(p.q) + '</div>'
      : '<div><span class="num">•</span> ' + p.q + '</div>';
    if (single) {
      aHtml += '<div class="ans-a">' + escapeHtml(p.a) + '</div>';
    } else {
      aHtml += '<div class="ans-q">' + p.q + '</div>';
      aHtml += p.a.trim() === ''
        ? '<div class="ans-a"><span class="empty-note">(нет данных)</span></div>'
        : '<div class="ans-a">' + escapeHtml(p.a) + '</div>';
    }
  });

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML =
    '<div class="card-top"><span class="ruler-tag">' + (single ? 'Вопрос' : currentCard.ruler) + '</span>' +
    '<div class="q-points-list" id="qPointsList">' + qHtml + '</div></div>' +
    '<div class="answer-text" id="answerText">' + aHtml + '</div>' +
    '<button class="show-btn" id="showBtn">Показать ответ</button>';
  wrap.innerHTML = '';
  wrap.appendChild(card);

  $('showBtn').onclick = e => {
    e.stopPropagation();
    $('qPointsList').style.display = 'none';
    $('answerText').classList.add('show');
    $('showBtn').style.display = 'none';
  };

  attachSwipe(card);
}

function attachSwipe(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, locked = null;

  const onStart = (x, y) => { startX = x; startY = y; dx = 0; dy = 0; dragging = true; locked = null; card.classList.add('dragging'); };
  const onMove = (x, y) => {
    if (!dragging) return;
    dx = x - startX; dy = y - startY;
    if (locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (locked === 'x') {
      card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 20) + 'deg)';
      card.style.opacity = Math.max(0.4, 1 - Math.abs(dx) / 400);
    }
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    if (locked === 'x' && Math.abs(dx) > 80) {
      const know = dx > 0;
      card.style.transform = 'translateX(' + (know ? 600 : -600) + 'px) rotate(' + (know ? 30 : -30) + 'deg)';
      card.style.opacity = '0';
      setTimeout(() => {
        const done = deck.shift();
        if (know) knownCount++; else deck.push(done);
        renderCard();
      }, 250);
    } else {
      card.style.transform = '';
      card.style.opacity = '';
    }
  };

  card.addEventListener('mousedown', e => { if (e.target.closest('.show-btn')) return; onStart(e.clientX, e.clientY); e.preventDefault(); });
  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onEnd);

  card.addEventListener('touchstart', e => {
    if (e.target.closest('.show-btn')) return;
    if (e.target.closest('.answer-text') && $('answerText') && $('answerText').classList.contains('show')) return;
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  card.addEventListener('touchmove', e => {
    if (!dragging) return;
    const x = e.touches[0].clientX, y = e.touches[0].clientY;
    if (locked === null && (Math.abs(x - startX) > 8 || Math.abs(y - startY) > 8)) locked = Math.abs(x - startX) > Math.abs(y - startY) ? 'x' : 'y';
    if (locked === 'x') e.preventDefault();
    onMove(x, y);
  }, { passive: false });

  card.addEventListener('touchend', onEnd);
}

/* ---------- ЭКРАН ТЕСТА (КВИЗ) ---------- */
let quizDeck = [];
let quizTotal = 0;
let quizIndex = 0;
let quizScore = 0;
let quizAnswers = [];
let quizCurrentOptions = [];
let quizAnswered = false;

function startQuiz() {
  quizDeck = shuffle(activeData().map((q, i) => ({ ...q, origIndex: i })));
  quizTotal = quizDeck.length;
  quizIndex = 0;
  quizScore = 0;
  quizAnswers = [];
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const wrap = $('quizWrap');
  quizAnswered = false;
  $('quizCounter').textContent = Math.min(quizIndex + 1, quizTotal) + ' / ' + quizTotal;
  $('quizProgressFill').style.width = (quizTotal ? (quizIndex / quizTotal * 100) : 0) + '%';

  if (quizIndex >= quizTotal) {
    showQuizResults();
    return;
  }

  const item = quizDeck[quizIndex];
  const multi = item.correct.length > 1;

  quizCurrentOptions = item.options.map((text, idx) => ({ text, orig: idx }));
  shuffle(quizCurrentOptions);

  const optsHtml = quizCurrentOptions.map((o, i) => {
    const letter = String.fromCharCode(97 + i);
    return '<button class="quiz-opt" data-idx="' + i + '" onclick="toggleQuizOption(' + i + ')">' +
      '<span class="opt-letter">' + letter + '</span>' +
      '<span class="opt-text">' + escapeHtml(o.text) + '</span>' +
      '<span class="opt-mark"></span>' +
      '</button>';
  }).join('');

  wrap.innerHTML =
    '<div class="quiz-card">' +
      '<div class="quiz-tag">' + (multi ? 'Несколько правильных' : 'Один правильный') + '</div>' +
      '<div class="quiz-q">' + escapeHtml(item.q) + '</div>' +
      '<div class="quiz-opts' + (multi ? ' multi' : '') + '" id="quizOpts">' + optsHtml + '</div>' +
      '<button class="quiz-submit" id="quizSubmit" onclick="quizSubmitClick()" disabled>Ответить</button>' +
    '</div>';

  window.scrollTo(0, 0);
}

function toggleQuizOption(idx) {
  if (quizAnswered) return;
  const item = quizDeck[quizIndex];
  const multi = item.correct.length > 1;
  const btns = document.querySelectorAll('.quiz-opt');

  if (!multi) {
    btns.forEach(b => b.classList.remove('selected'));
    btns[idx].classList.add('selected');
  } else {
    btns[idx].classList.toggle('selected');
  }

  $('quizSubmit').disabled = !document.querySelector('.quiz-opt.selected');
}

function quizSubmitClick() {
  if (!quizAnswered) submitQuizAnswer();
  else nextQuizQuestion();
}

function submitQuizAnswer() {
  if (quizAnswered) return;
  quizAnswered = true;

  const item = quizDeck[quizIndex];
  const selectedBtns = [...document.querySelectorAll('.quiz-opt.selected')];
  const selectedOrig = selectedBtns.map(b => quizCurrentOptions[+b.dataset.idx].orig).sort((a, b) => a - b);
  const correctSorted = [...item.correct].sort((a, b) => a - b);

  const isCorrect = selectedOrig.length === correctSorted.length &&
    selectedOrig.every((v, i) => v === correctSorted[i]);

  if (isCorrect) quizScore++;
  quizAnswers.push({ selected: selectedOrig, correct: isCorrect, q: item.q });

  document.querySelectorAll('.quiz-opt').forEach((b, i) => {
    const orig = quizCurrentOptions[i].orig;
    b.disabled = true;
    b.classList.remove('selected');
    if (item.correct.includes(orig)) b.classList.add('correct');
    else if (selectedOrig.includes(orig)) b.classList.add('wrong');
  });

  const submit = $('quizSubmit');
  submit.textContent = quizIndex + 1 >= quizTotal ? 'Результаты' : 'Далее →';
  submit.classList.add('next');
  // короткая пауза, чтобы двойной тап не пропустил вопрос
  submit.disabled = true;
  setTimeout(() => { submit.disabled = false; }, 350);
}

function nextQuizQuestion() {
  if (!quizAnswered) return;
  quizIndex++;
  renderQuizQuestion();
}

function showQuizResults() {
  const wrap = $('quizWrap');
  const pct = Math.round(quizScore / quizTotal * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
  const title = pct === 100 ? 'Идеально!' : pct >= 80 ? 'Отлично!' : pct >= 60 ? 'Хорошо' : 'Есть над чем поработать';

  let wrongHtml = '';
  const wrongs = quizAnswers.filter(a => !a.correct);
  if (wrongs.length) {
    wrongHtml = '<div class="quiz-wrong-list"><div class="quiz-wrong-title">Ошибки:</div>' +
      wrongs.map(w => '<div class="quiz-wrong-item">' + escapeHtml(w.q) + '</div>').join('') +
      '</div>';
  }

  wrap.innerHTML =
    '<div class="done-screen quiz-results">' +
      '<h2>' + emoji + ' ' + title + '</h2>' +
      '<p class="quiz-score">Правильно: <b>' + quizScore + '</b> из <b>' + quizTotal + '</b></p>' +
      '<p class="quiz-pct">' + pct + '%</p>' +
      wrongHtml +
      '<button class="restart-btn" onclick="startQuiz()">Пройти ещё раз</button>' +
    '</div>';

  $('quizCounter').textContent = quizTotal + ' / ' + quizTotal;
  $('quizProgressFill').style.width = '100%';
  window.scrollTo(0, 0);
}

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
