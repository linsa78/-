const flashcardsData = [
    { q: "I. Какие понятия характеризуют правление М.С. Горбачёва?", a: "Перестройка, гласность, ускорение, демократизация, новое политическое мышление, плюрализм." },
    { q: "II. Составьте исторический портрет М.С. Горбачёва", a: "Михаил Горбачёв (1931–2022) — советский государственный и политический деятель. Родился в крестьянской семье в с. Привольное.Окончил юридический факультет МГУ.Был Генеральным секретарём ЦК КПСС (1985–1991), а также первым президентом СССР (1990–1991). Начал реформы: перестройку, гласность и демократизацию. Стремился улучшить экономику и отношения с Западом. При его правлении в 1991 году распался СССР. В 1990 году получил Нобелевскую премию мира." },
    { q: "III. Какова цель концепции «ускорения»?", a: "Соединение социализма с демократией." },
    { q: "IV. Напишите про первый этап экономических преобразований М. Горбачёва. Какие основные события произошли в ходе данного этапа?", a: "• развитие машиностроения;\n• 1985 г. — начало антиалкогольной кампании в СССР;\n• 1986 г. — введена государственная приёмка;\n• 1986 г. — борьба с нетрудовыми доходами;\n• 1986 г. — закон об индивидуальной трудовой деятельности;\n• 26 апреля 1986 г. — авария на Чернобыльской АЭС; землетрясение в Армении." },
    { q: "V. Напишите про второй этап экономических преобразований М. Горбачёва. Какие основные события произошли в ходе данного этапа?", a: "• 1987 г. — привлечение иностранного капитала в форме совместных предприятий.\n• 1987 г. — отказ от монополии внешней торговли.\n• 1988 г. — коммерческие банки («Жилсоцбанк»).\n• 1988 г. — создание фермерских хозяйств (частных), (договор аренды).\n• 1989 г. — создание кооперативов (частных предприятий).\n• 1991 г. — денежная реформа, повышение розничных цен на товары, введение налога с продаж." },
    { q: "VI. Авария на Чернобыльской АЭС (дата, причина)", a: "26 апреля 1986 года. Причина — взрыв реактора 4-го энергоблока во время эксперимента из-за ошибок персонала и конструктивных недостатков реактора РБМК." },
    { q: "VII. Итоги экономических реформ М.С. Горбачёва", a: "• Сокращение производства в с/х и в промышленности.\n• Сокращение поступлений в бюджет страны.\n• Дефицит товаров.\n• Снижение уровня жизни населения." },
    { q: "VIII. Как вы думаете, какие результаты имела политика гласности в условиях системного давления Запада?", a: "В условиях давления Запада гласность усилила внутреннюю критику системы, ускорила потерю идеологического контроля и способствовала распаду СССР." },
    { q: "IX. Сформулируйте положительные и отрицательные результаты политики гласности", a: "Плюсы: свобода слова, открытие архивов и правды о прошлом, рост общественной активности.\nМинусы: дестабилизация, рост национализма, падение авторитета власти, усиление хаоса." },
    { q: "X. Гласность (раскрыть смысл понятия)", a: "Гласность — политика открытости и свободы информации, критики и публикаций (с середины 1980-х)." },
    { q: "XI. Плюрализм (раскрыть смысл понятия)", a: "Плюрализм — признание многообразия мнений, идеологий и политических сил." },
    { q: "XII. Перестройка (раскрыть смысл понятия)", a: "Перестройка — курс реформ Горбачёва (1985–1991) по обновлению экономики, политики и общества СССР." },
    { q: "XIII. Демократизация (раскрыть смысл понятия)", a: "Демократизация — процесс становления и развития демократии, расширения прав и свобод граждан, их участия в управлении государством и принятии политических решений." },
    { q: "XIV. Новое политическое мышление (раскрыть смысл понятия)", a: "Новое политическое мышление и перемены во внешней политике.\n«Признание мира целостным и неделимым»." },
    { q: "XV. Дайте оценку значения и последствий отмены 6-й статьи Конституции СССР", a: "Отмена 6-й статьи (1990) — конец монополии КПСС. Открыла путь к многопартийности, но ослабила центральную власть и ускорила распад СССР." },
    { q: "XVI. Объясните причины и значение введения поста Президента СССР", a: "1990 г. — Верховный пост Президента СССР. Горбачёв первый и последний президент СССР.\nПричина — усилить исполнительную власть в условиях кризиса.\nЗначение — Горбачёв стал первым и последним Президентом СССР, но пост не смог остановить распад страны." },
    { q: "XVII. «Межрегионалы» / год создания, цель, лидеры", a: "1989 г. — Межрегиональная депутатская группа (МДГ).\nЦель: преобразование тоталитарной политической системы в демократическую.\nЛидеры: А. Сахаров, Ю. Афанасьев, Б. Ельцин, Г. Попов, А. Собчак, Г. Старовойтова (около 150 деп.).\nНе имели программы реформ, единственное что их объединяло — стремление к многопартийности." },
    { q: "XVIII. Какие политические партии появились с 1988 гг.?", a: "• 1988 — «Демократический союз»\n• 1989 — «Демократическая Россия»\n• 1990 — «Демократическая партия России»\n• 1990 — «Коммунистическая партия РСФСР»" },
    { q: "XIX. Направления во внешней политике СССР", a: "• Нормализация отношений Восток – Запад, где центр. роль отводилась процессу разоружения.\n• Разблокирование региональных конфликтов.\n• Установление тесных экономических связей, предпочтение странам социалистического содружества." },
    { q: "XX. 8 декабря 1987 г. (внешняя политика)", a: "Договор об уничтожении ракет меньшей и средней дальности. Отход от контроля над странами Восточной Европы." },
    { q: "XXI. Июль 1991 г. (внешняя политика)", a: "В Москве подписан советско-американский договор о сокращении стратегических наступательных вооружений (СНВ-1), предусматривавший сокращение самых мощных видов наступательных вооружений." },
    { q: "XXII. Напишите события, характеризующие распад социалистической системы", a: "• 1989 г. — вывод советских войск из Афганистана.\n• 1990 г. — объединение ФРГ и Восточной Германии (ГДР была поглощена ФРГ).\n• Лето 1991 г. — роспуск СЭВ и ОВД (завершение распада мировой социалистической системы)." },
    { q: "XXIII. Итоги политики нового мышления", a: "• Ослабло региональное противоборство СССР и США.\n• Наметилась тесная интеграция СССР в мировое хозяйство.\n• США стали сверхдержавой.\n• Снижение обороноспособности СССР." },
    { q: "XXIV. Сепаратизм (раскрыть смысл понятия)", a: "Стремление отделиться от государства." },
    { q: "XXV. Парад суверенитетов (раскрыть смысл)", a: "Провозглашение республиками СССР своей независимости." },
    { q: "XXVI. Война законов (раскрыть смысл)", a: "Борьба между союзной властью и республиками за право принимать собственные законы." },
    { q: "XXVII. Напишите республики, которые первыми вышли из состава СССР", a: "" },
    { q: "XXVIII. 12 июня 1990 г.", a: "" },
    { q: "XXIX. 12 июня 1991 г.", a: "" },
    { q: "XXX. Когда состоялся референдум о сохранении СССР? Как должен был называться новый союз?", a: "" },
    { q: "XXXI. 19 августа 1991 г.", a: "События ГКЧП (Государственный комитет по чрезвычайному положению)." },
    { q: "XXXII. ГКЧП (расшифровка аббревиатуры)", a: "Государственный комитет по чрезвычайному положению." },
    { q: "XXXIII. Цель ГКЧП", a: "" },
    { q: "XXXIV. Организаторы ГКЧП", a: "" },
    { q: "XXXV. 8 декабря 1991 г. / стороны, результат", a: "" },
    { q: "XXXVI. 25 декабря 1991 г.", a: "" },
    { q: "XXXVII. Какие страны вошли в СНГ?", a: "" }
];

let currentIndex = 0;
let knownCount = 0;
let currentCards = [];

// DOM Элементы
const tabs = document.querySelectorAll('.tab-btn');
const modes = document.querySelectorAll('.mode');
const learnList = document.getElementById('learn-list');

const flashcard = document.getElementById('flashcard');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const showAnswerBtn = document.getElementById('show-answer-btn');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const btnKnow = document.getElementById('btn-know');
const btnDontKnow = document.getElementById('btn-dont-know');

// Переключение вкладок
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        modes.forEach(m => m.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-mode`).classList.add('active');

        if (tab.dataset.tab === 'cards') {
            initCards();
        }
    });
});

// Инициализация режима "Учить" (Клик по карточке)
// Инициализация режима "Учить" (Клик по карточке)
function initLearnMode() {
    learnList.innerHTML = '';
    flashcardsData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'learn-item';
        
        // Создаем элементы вопроса и ответа
        const h3 = document.createElement('h3');
        h3.textContent = item.q;
        
        const p = document.createElement('p');
        
        // Если ответ пустой
        if (!item.a.trim()) {
            p.textContent = "[Ответ пока не добавлен]";
            p.className = 'empty-answer';
        } else {
            p.textContent = item.a;
            p.style.display = 'none'; // Жестко скрываем через стиль
        }

        // Собираем карточку
        div.appendChild(h3);
        div.appendChild(p);
        
        // Клик для показа/скрытия
        div.addEventListener('click', function() {
            // Если ответ пустой — не реагируем
            if (p.classList.contains('empty-answer')) return;
            
            // Переключаем видимость напрямую
            if (p.style.display === 'none') {
                p.style.display = 'block';
            } else {
                p.style.display = 'none';
            }
        });

        learnList.appendChild(div);
    });
}

        div.innerHTML = `<h3>${item.q}</h3><p class="${answerClass}">${answerText}</p>`;
        
        // Клик для показа/скрытия ответа
        div.addEventListener('click', function() {
            const p = this.querySelector('p');
            // Если это пустой ответ — ничего не делаем
            if (p.classList.contains('empty-answer')) return;
            
            // Переключаем видимость
            if (p.classList.contains('answer-hidden')) {
                p.classList.remove('answer-hidden');
            } else {
                p.classList.add('answer-hidden');
            }
        });

        learnList.appendChild(div);
    });
}

// Инициализация режима "Карточки" (с перемешиванием)
function initCards() {
    // Берем только те, где есть ответ
    currentCards = flashcardsData.filter(item => item.a.trim() !== "");
    
    // Перемешиваем (Фишер-Йетс)
    for (let i = currentCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
    }
    
    currentIndex = 0;
    knownCount = 0;
    updateCard();
}

// Обновление карточки на экране
function updateCard() {
    if (currentIndex >= currentCards.length) {
        cardQuestion.textContent = "Поздравляем! Вы прошли все карточки!";
        cardAnswer.classList.add('hidden');
        showAnswerBtn.style.display = 'none';
        progressText.textContent = `Завершено! Знал: ${knownCount} из ${currentCards.length}`;
        progressFill.style.width = '100%';
        return;
    }

    const card = currentCards[currentIndex];
    cardQuestion.textContent = card.q;
    cardAnswer.textContent = card.a;
    cardAnswer.classList.add('hidden');
    showAnswerBtn.style.display = 'block';
    
    progressText.textContent = `${currentIndex} / ${currentCards.length} · знал: ${knownCount}`;
    progressFill.style.width = `${(currentIndex / currentCards.length) * 100}%`;
    
    flashcard.className = 'flashcard';
}

// Показ ответа на синей карточке
showAnswerBtn.addEventListener('click', () => {
    // Защита от нажатия, если карточки закончились
    if (currentIndex < currentCards.length) {
        cardAnswer.classList.remove('hidden');
        showAnswerBtn.style.display = 'none';
    }
});

// Обработка свайпов и кнопок
function handleSwipe(isKnown) {
    if (currentIndex >= currentCards.length) return;

    if (isKnown) {
        knownCount++;
        flashcard.classList.add('swiping-right');
    } else {
        flashcard.classList.add('swiping-left');
    }

    setTimeout(() => {
        currentIndex++;
        updateCard();
    }, 300);
}

btnKnow.addEventListener('click', () => handleSwipe(true));
btnDontKnow.addEventListener('click', () => handleSwipe(false));

// Свайпы мышью и пальцем
let startX = 0;
let isDragging = false;

flashcard.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
});

flashcard.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - startX;
    if (diff > 100) handleSwipe(true);
    else if (diff < -100) handleSwipe(false);
});

flashcard.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
}, { passive: true });

flashcard.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 100) handleSwipe(true);
    else if (diff < -100) handleSwipe(false);
});

// Запуск при загрузке страницы
initLearnMode();