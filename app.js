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

// ---- ОТРИСОВКА ДЕРЕВА ----
const treeContainer = document.getElementById('treeContainer');
const topicDetailsContainer = document.getElementById('topicDetails');

function renderTree() {
  treeContainer.innerHTML = '';
  const done = getTopicDone();
  const branch = document.createElement('div');
  branch.className = 'tree-branch';

  TOPICS.forEach((topic, index) => {
    const isDone = done[topic.id];
    const isLocked = index > 0 && !done[TOPICS[index-1].id];
    
    const node = document.createElement('div');
    node.className = 'tree-node';
    
    let statusClass = 'status-locked';
    let statusText = 'Заблокировано';
    let cardClass = 'locked';
    
    if (isDone) {
      statusClass = 'status-done';
      statusText = '✓ Пройдено';
      cardClass = 'done';
    } else if (!isLocked) {
      statusClass = 'status-current';
      statusText = 'Доступно';
      cardClass = 'current';
    }

    node.innerHTML = `
      <div class="node-card ${cardClass}">
        <span class="node-status ${statusClass}">${statusText}</span>
        <h4>${topic.title}</h4>
        <p>${topic.quiz.length} вопросов</p>
      </div>
      <div class="node-connector"></div>
    `;
    
    node.addEventListener('click', () => {
      if (isLocked) return;
      openTopic(topic);
    });
    
    branch.appendChild(node);
  });
  treeContainer.appendChild(branch);
}

function openTopic(topic) {
  const done = getTopicDone();
  const isDone = done[topic.id];
  
  topicDetailsContainer.innerHTML = `
    <div class="topic">
      <div class="topic-head">
        <h4>${topic.title}</h4>
        <span class="badge ${isDone?'badge-done':'badge-todo'}">${isDone?'✓ изучено':'не пройдено'}</span>
      </div>
      <div class="topic-body">
        ${topic.content}
        <button class="btn btn-blue btn-sm" id="startTestBtn">Пройти тест по теме</button>
        <div class="test-box" style="display:none;" id="testBox"></div>
      </div>
    </div>
  `;
  
  const testBtn = document.getElementById('startTestBtn');
  const testBox = document.getElementById('testBox');
  
  testBtn.addEventListener('click', () => {
    if (testBox.style.display === 'block') { testBox.style.display = 'none'; testBtn.textContent = 'Пройти тест по теме'; return; }
    testBox.style.display = 'block'; testBtn.textContent = 'Скрыть тест';
    renderTopicQuiz(topic, testBox);
  });

  topicDetailsContainer.scrollIntoView({ behavior: 'smooth' });
}

// МИНИ-ТЕСТ (все вопросы сразу, как было)
function renderTopicQuiz(topic, container){
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
        else { b.classList.add('wrong'); qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); fb.textContent = '❌ Неверно.'; saveReview(item, false); }
        fb.classList.add('show');
        result.textContent = `Результат: ${correct} из ${topic.quiz.length}`;
        
        if (answered === topic.quiz.length && correct === topic.quiz.length) {
          const d = getTopicDone(); d[topic.id] = true; setTopicDone(d); updateProgress();
          renderTree();
        }
      });
      qDiv.appendChild(b);
    });
    qDiv.appendChild(fb); container.appendChild(qDiv);
  });
  container.appendChild(result);
}

// ---- ПАМЯТЬ ДЛЯ ПОВТОРЕНИЯ ----
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

// ---- ИТОГОВЫЙ ТЕСТ (ПО ОДНОМУ ВОПРОСУ) ----
let finalIndex = 0;
let finalCorrect = 0;
let finalQuestions = [];

function startFinalTest() {
  finalQuestions = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5); // Перемешиваем
  finalIndex = 0;
  finalCorrect = 0;
  document.getElementById('finalContainer').innerHTML = '';
  showFinalQuestion();
}

function showFinalQuestion() {
  const container = document.getElementById('finalContainer');
  container.innerHTML = '';
  
  if (finalIndex >= finalQuestions.length) {
    container.innerHTML = `
      <div class="rep-box" style="text-align:center;">
        <h3 style="color:#64ffda; font-size:24px;">🏁 Тест завершён!</h3>
        <p style="font-size:18px; margin: 20px 0;">Правильных ответов: <b>${finalCorrect}</b> из <b>${finalQuestions.length}</b></p>
        <button class="btn btn-blue" onclick="startFinalTest()">Пройти заново</button>
      </div>
    `;
    return;
  }

  const item = finalQuestions[finalIndex];
  const qDiv = document.createElement('div'); qDiv.className = 'quiz-q';
  qDiv.style.background = '#1a1a1a';
  qDiv.style.padding = '20px';
  qDiv.style.borderRadius = '12px';
  qDiv.style.border = '1px solid #333';
  
  const p = document.createElement('p'); 
  p.textContent = `Вопрос ${finalIndex + 1} из ${finalQuestions.length}: ${item.q}`; 
  p.style.fontSize = '18px';
  p.style.marginBottom = '15px';
  qDiv.appendChild(p);
  
  const fb = document.createElement('div'); fb.className = 'quiz-feedback';
  
  item.o.forEach((opt, oi) => {
    const b = document.createElement('button'); 
    b.className = 'quiz-opt'; 
    b.textContent = opt;
    b.style.marginBottom = '10px';
    b.addEventListener('click', () => {
      // Блокируем все кнопки
      qDiv.querySelectorAll('.quiz-opt').forEach(btn => btn.disabled = true);
      
      if (oi === item.c) { 
        b.classList.add('correct'); 
        finalCorrect++; 
        fb.textContent = '✅ Верно!'; 
        saveReview(item, true); 
      } else { 
        b.classList.add('wrong'); 
        qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); 
        fb.textContent = '❌ Неверно. Правильный ответ подсвечен.'; 
        saveReview(item, false); 
      }
      fb.classList.add('show');
      
      // Показываем кнопку "Следующий вопрос" через секунду
      setTimeout(() => {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-blue';
        nextBtn.style.marginTop = '15px';
        nextBtn.textContent = (finalIndex === finalQuestions.length - 1) ? 'Завершить тест' : 'Следующий вопрос →';
        nextBtn.addEventListener('click', () => {
          finalIndex++;
          showFinalQuestion();
        });
        qDiv.appendChild(nextBtn);
      }, 1000);
    });
    qDiv.appendChild(b);
  });
  qDiv.appendChild(fb);
  container.appendChild(qDiv);
}

// ---- ПОВТОРЕНИЕ (ТОЖЕ ПО ОДНОМУ ВОПРОСУ) ----
let reviewIndex = 0;
let reviewCorrect = 0;
let reviewQuestions = [];

function startReview() {
  reviewQuestions = ALL_QUESTIONS.filter(shouldReview);
  if (reviewQuestions.length === 0) {
    document.getElementById('reviewContainer').innerHTML = '<div class="rep-box"><p>🎉 Отлично! Всё, что нужно, повторено. Загляни завтра.</p></div>';
    document.getElementById('reviewScore').textContent = '';
    return;
  }
  reviewIndex = 0;
  reviewCorrect = 0;
  document.getElementById('reviewContainer').innerHTML = '';
  showReviewQuestion();
}

function showReviewQuestion() {
  const container = document.getElementById('reviewContainer');
  container.innerHTML = '';
  
  if (reviewIndex >= reviewQuestions.length) {
    container.innerHTML = `
      <div class="rep-box" style="text-align:center;">
        <h3 style="color:#64ffda; font-size:24px;">🔁 Повторение завершено!</h3>
        <p style="font-size:18px; margin: 20px 0;">Правильных ответов: <b>${reviewCorrect}</b> из <b>${reviewQuestions.length}</b></p>
        <button class="btn btn-blue" onclick="startReview()">Начать заново</button>
      </div>
    `;
    return;
  }

  const item = reviewQuestions[reviewIndex];
  const qDiv = document.createElement('div'); qDiv.className = 'quiz-q';
  qDiv.style.background = '#1a1a1a';
  qDiv.style.padding = '20px';
  qDiv.style.borderRadius = '12px';
  qDiv.style.border = '1px solid #333';
  
  const p = document.createElement('p'); 
  p.textContent = `Вопрос ${reviewIndex + 1} из ${reviewQuestions.length}: ${item.q}`; 
  p.style.fontSize = '18px';
  p.style.marginBottom = '15px';
  qDiv.appendChild(p);
  
  const fb = document.createElement('div'); fb.className = 'quiz-feedback';
  
  item.o.forEach((opt, oi) => {
    const b = document.createElement('button'); 
    b.className = 'quiz-opt'; 
    b.textContent = opt;
    b.style.marginBottom = '10px';
    b.addEventListener('click', () => {
      qDiv.querySelectorAll('.quiz-opt').forEach(btn => btn.disabled = true);
      
      if (oi === item.c) { 
        b.classList.add('correct'); 
        reviewCorrect++; 
        fb.textContent = '✅ Верно!'; 
        saveReview(item, true); 
      } else { 
        b.classList.add('wrong'); 
        qDiv.querySelectorAll('.quiz-opt')[item.c].classList.add('correct'); 
        fb.textContent = '❌ Неверно. Правильный ответ подсвечен.'; 
        saveReview(item, false); 
      }
      fb.classList.add('show');
      
      setTimeout(() => {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-blue';
        nextBtn.style.marginTop = '15px';
        nextBtn.textContent = (reviewIndex === reviewQuestions.length - 1) ? 'Завершить повторение' : 'Следующий вопрос →';
        nextBtn.addEventListener('click', () => {
          reviewIndex++;
          showReviewQuestion();
        });
        qDiv.appendChild(nextBtn);
      }, 1000);
    });
    qDiv.appendChild(b);
  });
  qDiv.appendChild(fb);
  container.appendChild(qDiv);
}

// КАРТОЧКИ
let currentCardIndex = 0;
let deck = [...CARDS]; 
const cardWrapper = document.getElementById('cardWrapper');
const cardInner = document.getElementById('cardInner');
const badgeLeft = document.getElementById('badgeLeft');
const badgeRight = document.getElementById('badgeRight');

let startX = 0;
let currentX = 0;
let isDragging = false;
let isMoved = false; 

function updateCardView() {
  if (deck.length === 0) {
    document.getElementById('cardQuestion').textContent = "🎉 Вы выучили все карточки!";
    document.getElementById('cardAnswer').textContent = "Отдохните или зайдите позже.";
    document.getElementById('cardCounter').textContent = "Все карточки пройдены.";
    cardWrapper.style.opacity = '0'; 
    return;
  }
  if (currentCardIndex >= deck.length) currentCardIndex = 0;
  
  cardInner.style.transition = 'none';
  cardWrapper.classList.remove('flipped');
  
  document.getElementById('cardQuestion').textContent = deck[currentCardIndex].q;
  document.getElementById('cardAnswer').textContent = deck[currentCardIndex].a;
  document.getElementById('cardCounter').textContent = `Осталось карточек: ${deck.length}`;
  
  cardWrapper.style.transition = 'none';
  cardWrapper.style.transform = 'translateX(0) rotate(0)';
  cardWrapper.style.opacity = '1'; 
  
  badgeLeft.style.opacity = 0;
  badgeRight.style.opacity = 0;
  isMoved = false;
  
  setTimeout(() => { 
    cardInner.style.transition = 'transform .6s'; 
    cardWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease'; 
  }, 50);
}

function handleStart(e) {
  if (deck.length === 0) return;
  isDragging = true;
  isMoved = false;
  startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  currentX = startX; 
  cardWrapper.style.transition = 'none';
}

function handleMove(e) {
  if (!isDragging) return;
  currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  let diff = currentX - startX;
  if (Math.abs(diff) > 10) isMoved = true;
  cardWrapper.style.transform = `translateX(${diff}px) rotate(${diff * 0.05}deg)`;
  if (diff < -50) { badgeLeft.style.opacity = 1; badgeRight.style.opacity = 0; } 
  else if (diff > 50) { badgeRight.style.opacity = 1; badgeLeft.style.opacity = 0; } 
  else { badgeLeft.style.opacity = 0; badgeRight.style.opacity = 0; }
}

function handleEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (!isMoved) {
    cardWrapper.classList.toggle('flipped');
    cardWrapper.style.transform = 'translateX(0) rotate(0)';
    return;
  }
  let diff = currentX - startX;
  if (diff < -100) { 
    cardWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    cardWrapper.style.transform = `translateX(-150%) rotate(-20deg)`;
    cardWrapper.style.opacity = '0';
    setTimeout(() => { const card = deck.splice(currentCardIndex, 1)[0]; deck.push(card); updateCardView(); }, 300);
  } 
  else if (diff > 100) { 
    cardWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    cardWrapper.style.transform = `translateX(150%) rotate(20deg)`;
    cardWrapper.style.opacity = '0';
    setTimeout(() => { deck.splice(currentCardIndex, 1); updateCardView(); }, 300);
  } 
  else {
    cardWrapper.style.transition = 'transform 0.3s ease';
    cardWrapper.style.transform = `translateX(0) rotate(0)`;
    badgeLeft.style.opacity = 0; badgeRight.style.opacity = 0;
    startX = 0; currentX = 0;
  }
}

cardWrapper.addEventListener('mousedown', handleStart);
cardWrapper.addEventListener('touchstart', handleStart, {passive: true});
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', handleMove, {passive: true});
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

document.getElementById('flipCard').addEventListener('click', () => { if(deck.length > 0) cardWrapper.classList.toggle('flipped'); });
document.getElementById('btnAgain').addEventListener('click', () => {
  if (deck.length === 0) return;
  cardWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  cardWrapper.style.transform = `translateX(-150%) rotate(-20deg)`;
  cardWrapper.style.opacity = '0';
  setTimeout(() => { const card = deck.splice(currentCardIndex, 1)[0]; deck.push(card); updateCardView(); }, 300);
});
document.getElementById('btnLearned').addEventListener('click', () => {
  if (deck.length === 0) return;
  cardWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  cardWrapper.style.transform = `translateX(150%) rotate(20deg)`;
  cardWrapper.style.opacity = '0';
  setTimeout(() => { deck.splice(currentCardIndex, 1); updateCardView(); }, 300);
});

// ВКЛАДКИ
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    
    if (btn.dataset.tab === 'final') startFinalTest();
    if (btn.dataset.tab === 'review') startReview();
    if (btn.dataset.tab === 'lectures') renderTree();
  });
});

// Запуск
renderTree();
updateProgress();
updateCardView();