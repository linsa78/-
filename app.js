const ALL_QUESTIONS = [];
TOPICS.forEach(t => t.quiz.forEach(q => ALL_QUESTIONS.push({...q, topic: t.title})));

function getTopicDone(){ return JSON.parse(localStorage.getItem('taxTopicsDone')||'{}'); }
function setTopicDone(obj){ localStorage.setItem('taxTopicsDone', JSON.stringify(obj)); }

function updateProgress(){
  const done = getTopicDone();
  const count = TOPICS.filter(t => done[t.id]).length;
  const pct = Math.round(count / TOPICS.length * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent = `Пройдено тем: ${count} из ${TOPICS.length} (${pct}%)`;
}

const topicsContainer = document.getElementById('topicsContainer');
TOPICS.forEach(topic => {
  const done = getTopicDone();
  const isDone = done[topic.id];
  const div = document.createElement('div');
  div.className = 'topic';
  div.innerHTML = `
    <div class="topic-head">
      <h4>${topic.title}</h4>
      <span class="badge ${isDone?'badge-done':'badge-todo'}">${isDone?'✓ изучено':'не пройдено'}</span>
    </div>
    <div class="topic-body">
      ${topic.content}
      <button class="btn btn-blue btn-sm" data-act="test">Пройти тест по теме</button>
      <div class="test-box" style="display:none;"></div>
    </div>
  `;
  const body = div.querySelector('.topic-body');
  const testBtn = body.querySelector('[data-act="test"]');
  const testBox = body.querySelector('.test-box');
  testBtn.addEventListener('click', () => {
    if (testBox.style.display === 'block') { testBox.style.display = 'none'; testBtn.textContent = 'Пройти тест по теме'; return; }
    testBox.style.display = 'block'; testBtn.textContent = 'Скрыть тест';
    renderTopicQuiz(topic, testBox, div);
  });
  topicsContainer.appendChild(div);
});

function renderTopicQuiz(topic, container, topicDiv){
  container.innerHTML = '';
  let answered = 0, correct = 0;
  const result = document.createElement('div'); result.className = 'test-result';
  topic.quiz.forEach((item, qi) => {
    const qDiv = document.createElement('div'); qDiv.className = 'quiz-q';
    const p = document.createElement('p'); p.textContent = (qi+1) + '. ' + item.q; qDiv.appendChild(p);
    const fb = document.createElement('div'); fb.className = 'quiz-feedback';
    item.o.forEach((opt, oi) => {
      const b = document.createElement('button'); b.className = 'quiz-opt'; b.textContent = opt;
      b.addEventListener('click', () => {
        if (qDiv.dataset.answered) return;
        qDiv.dataset.answered = '1'; answered++;
        if (oi === item.c) { b.classList.add('correct'); correct++; fb.textContent = '✅ Верно!'; saveReview(item, true); }
        else { b.classList.add('wrong'); qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); fb.textContent = '❌ Неверно. Правильный ответ подсвечен.'; saveReview(item, false); }
        fb.classList.add('show');
        result.textContent = `Результат: ${correct} из ${topic.quiz.length}`;
        if (answered === topic.quiz.length && correct === topic.quiz.length) {
          const d = getTopicDone(); d[topic.id] = true; setTopicDone(d); updateProgress();
          topicDiv.querySelector('.badge').className = 'badge badge-done';
          topicDiv.querySelector('.badge').textContent = '✓ изучено';
        }
      });
      qDiv.appendChild(b);
    });
    qDiv.appendChild(fb); container.appendChild(qDiv);
  });
  container.appendChild(result);
}

function getReviewData(){ return JSON.parse(localStorage.getItem('taxReview')||'{}'); }
function setReviewData(o){ localStorage.setItem('taxReview', JSON.stringify(o)); }
function saveReview(item, isCorrect){
  const data = getReviewData();
  const key = item.q;
  if (!data[key]) data[key] = {correct:0, wrong:0, last:0};
  if (isCorrect) data[key].correct++; else data[key].wrong++;
  data[key].last = Date.now();
  setReviewData(data);
}
function shouldReview(item){
  const data = getReviewData();
  const d = data[item.q];
  if (!d) return true;
  if (d.wrong > 0 && d.correct < 2) return true;
  if (Date.now() - d.last > 2*24*3600*1000) return true;
  return false;
}

const finalContainer = document.getElementById('finalContainer');
let fAnswered = 0, fCorrect = 0;
ALL_QUESTIONS.forEach((item, qi) => {
  const qDiv = document.createElement('div'); qDiv.className = 'quiz-q';
  const p = document.createElement('p'); p.textContent = (qi+1) + '. ' + item.q; qDiv.appendChild(p);
  const fb = document.createElement('div'); fb.className = 'quiz-feedback';
  item.o.forEach((opt, oi) => {
    const b = document.createElement('button'); b.className = 'quiz-opt'; b.textContent = opt;
    b.addEventListener('click', () => {
      if (qDiv.dataset.answered) return;
      qDiv.dataset.answered = '1'; fAnswered++;
      if (oi === item.c) { b.classList.add('correct'); fCorrect++; fb.textContent = '✅ Верно!'; saveReview(item, true); }
      else { b.classList.add('wrong'); qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); fb.textContent = '❌ Неверно.'; saveReview(item, false); }
      fb.classList.add('show');
      document.getElementById('finalScore').textContent = `Отвечено: ${fAnswered} из ${ALL_QUESTIONS.length} · Верно: ${fCorrect}`;
    });
    qDiv.appendChild(b);
  });
  qDiv.appendChild(fb); finalContainer.appendChild(qDiv);
});

const reviewContainer = document.getElementById('reviewContainer');
function renderReview(){
  reviewContainer.innerHTML = '';
  const toReview = ALL_QUESTIONS.filter(shouldReview);
  if (toReview.length === 0) {
    reviewContainer.innerHTML = '<div class="rep-box"><p>🎉 Отлично! Всё, что нужно, повторено. Загляни завтра — появятся новые вопросы для закрепления.</p></div>';
    document.getElementById('reviewScore').textContent = '';
    return;
  }
  const box = document.createElement('div'); box.className = 'rep-box';
  box.innerHTML = `<p><b>Вопросов для повторения: ${toReview.length}</b></p>`;
  let rAnswered = 0, rCorrect = 0;
  const scoreEl = document.getElementById('reviewScore');
  toReview.forEach((item, qi) => {
    const qDiv = document.createElement('div'); qDiv.className = 'quiz-q';
    const p = document.createElement('p'); p.textContent = (qi+1) + '. ' + item.q; qDiv.appendChild(p);
    const fb = document.createElement('div'); fb.className = 'quiz-feedback';
    item.o.forEach((opt, oi) => {
      const b = document.createElement('button'); b.className = 'quiz-opt'; b.textContent = opt;
      b.addEventListener('click', () => {
        if (qDiv.dataset.answered) return;
        qDiv.dataset.answered = '1'; rAnswered++;
        if (oi === item.c) { b.classList.add('correct'); rCorrect++; fb.textContent = '✅ Верно!'; saveReview(item, true); }
        else { b.classList.add('wrong'); qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); fb.textContent = '❌ Неверно.'; saveReview(item, false); }
        fb.classList.add('show');
        scoreEl.textContent = `Повторено: ${rAnswered} из ${toReview.length} · Верно: ${rCorrect}`;
      });
      qDiv.appendChild(b);
    });
    qDiv.appendChild(fb); box.appendChild(qDiv);
  });
  reviewContainer.appendChild(box);
}
renderReview();

let cardIdx = 0;
const scene = document.getElementById('cardScene');
function renderCard(){
  document.getElementById('cardQuestion').textContent = CARDS[cardIdx].q;
  document.getElementById('cardAnswer').textContent = CARDS[cardIdx].a;
  document.getElementById('cardCounter').textContent = `Карточка ${cardIdx+1} из ${CARDS.length}`;
  scene.classList.remove('flipped');
}
document.getElementById('flipCard').addEventListener('click', () => scene.classList.toggle('flipped'));
scene.addEventListener('click', () => scene.classList.toggle('flipped'));
document.getElementById('nextCard').addEventListener('click', () => { cardIdx = (cardIdx+1) % CARDS.length; renderCard(); });
document.getElementById('prevCard').addEventListener('click', () => { cardIdx = (cardIdx-1+CARDS.length) % CARDS.length; renderCard(); });
renderCard();

document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'review') renderReview();
  });
});

updateProgress();