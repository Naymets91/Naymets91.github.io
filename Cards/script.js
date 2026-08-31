let currentWordIndex = null;
let timer = null;
let timeLeft = 30;
let totalTime = 30;
let isTimerRunning = false;

let correctCount = 0;
let wrongCount = 0;
let skippedCount = 0;
let totalAttempts = 0;

let currentPool = [];

// --- ЛОГІКА ІНТЕРВАЛЬНИХ ПОВТОРЕНЬ (LEITNER / LOCALSTORAGE) ---

// Отримати рівні слів з localStorage
function getWordProgress() {
  const saved = localStorage.getItem('wordProgress');
  return saved ? JSON.parse(saved) : {};
}

// Зберегти рівень слова
function updateWordLevel(wordKey, isCorrect) {
  const progress = getWordProgress();
  let currentLevel = progress[wordKey] || 1;

  if (isCorrect) {
    if (currentLevel < 3) currentLevel++;
  } else {
    currentLevel = 1; // При помилці одразу повертаємо в "важкі"
  }

  progress[wordKey] = currentLevel;
  localStorage.setItem('wordProgress', JSON.stringify(progress));
}

// Вибір слова з урахуванням вагових коефіцієнтів (60% / 30% / 10%)
function getWeightedRandomIndex() {
  if (currentPool.length === 0) return 0;
  if (currentPool.length === 1) return 0;

  const progress = getWordProgress();

  // Розподіляємо індекси поточного набору по кошиках
  const level1 = []; // Важкі / Нові
  const level2 = []; // В процесі
  const level3 = []; // Засвоєні

  currentPool.forEach((item, index) => {
    // Не беремо те саме слово поспіль, якщо в наборі більше 1 слова
    if (index === currentWordIndex) return;

    const level = progress[item.word] || 1;
    if (level === 1) level1.push(index);
    else if (level === 2) level2.push(index);
    else level3.push(index);
  });

  // Шанси: 60% - level1, 30% - level2, 10% - level3
  const rand = Math.random() * 100;
  let targetGroup = [];

  if (rand < 60 && level1.length > 0) {
    targetGroup = level1;
  } else if (rand < 90 && level2.length > 0) {
    targetGroup = level2;
  } else if (level3.length > 0) {
    targetGroup = level3;
  } else {
    // Якщо вибрана група порожня, збираємо всі доступні індекси
    targetGroup = [...level1, ...level2, ...level3];
  }

  // Якщо всі доступні слова це поточне слово — повертаємо його
  if (targetGroup.length === 0) return currentWordIndex;

  const randomIndex = Math.floor(Math.random() * targetGroup.length);
  return targetGroup[randomIndex];
}

// -------------------------------------------------------------

function initPool() {
  const selectedSet = document.getElementById('wordSet').value;
  if (selectedSet === 'all') {
    currentPool = [];
    for (let set in wordSets) {
      currentPool = currentPool.concat(wordSets[set]);
    }
  } else {
    currentPool = wordSets[selectedSet] || [];
  }
}

function loadQuestion() {
  if (currentPool.length === 0) initPool();

  // Використовуємо адаптивний вибір замість чисто випадкового
  currentWordIndex = getWeightedRandomIndex();

  const current = currentPool[currentWordIndex];
  const isInverted = document.getElementById('invertCheck').checked;

  document.getElementById('word').innerText = isInverted ? current.translation : current.word;

  let options = [isInverted ? current.word : current.translation];
  while (options.length < 4) {
    let randomObj = currentPool[Math.floor(Math.random() * currentPool.length)];
    let optionText = isInverted ? randomObj.word : randomObj.translation;
    if (!options.includes(optionText)) {
      options.push(optionText);
    }
  }

  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = option;
    btn.onclick = () => checkAnswer(btn, option);
    optionsContainer.appendChild(btn);
  });

  updateCounter();
}

function checkAnswer(btn, selected) {
  const current = currentPool[currentWordIndex];
  const isInverted = document.getElementById('invertCheck').checked;
  const correct = isInverted ? current.word : current.translation;

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);

  totalAttempts++;

  if (selected === correct) {
    btn.classList.add('correct');
    correctCount++;
    // Підвищуємо рівень слова (слово випадатиме рідше)
    updateWordLevel(current.word, true);
  } else {
    btn.classList.add('wrong');
    wrongCount++;
    // Помилка: скидаємо на 1 рівень (слово випадатиме частіше)
    updateWordLevel(current.word, false);

    buttons.forEach(b => {
      if (b.innerText === correct) {
        b.classList.add('correct');
      }
    });
  }

  updateStats();

  setTimeout(() => {
    loadQuestion();
  }, 1200);
}

function skipQuestion() {
  skippedCount++;
  totalAttempts++;
  updateStats();
  loadQuestion();
}

function resetStats() {
  correctCount = 0;
  wrongCount = 0;
  skippedCount = 0;
  totalAttempts = 0;
  updateStats();
  resetTimer();
  loadQuestion();
}

// Опціонально: функція для повного скидання вивчених слів (наприклад, для кнопки "Скинути прогрес слів")
function resetWordProgress() {
  if (confirm("Скинути весь прогрес вивчення слів?")) {
    localStorage.removeItem('wordProgress');
    alert("Прогрес слів скинуто!");
    loadQuestion();
  }
}

function updateCounter() {
  document.getElementById('counter').innerText = `${currentWordIndex + 1}/${currentPool.length}`;
}

function updateStats() {
  document.getElementById('correctCount').innerText = correctCount;
  document.getElementById('wrongCount').innerText = wrongCount;
  document.getElementById('skippedCount').innerText = skippedCount;
  document.getElementById('totalAttempts').innerText = totalAttempts;

  let accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  document.getElementById('accuracy').innerText = accuracy + '%';
}

function startTimer() {
  if (isTimerRunning) return;
  isTimerRunning = true;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerText = timeLeft;
    let percentage = (timeLeft / totalTime) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';

    if (timeLeft <= 0) {
      clearInterval(timer);
      showSummary();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  isTimerRunning = false;
  timeLeft = totalTime;
  document.getElementById('timer').innerText = timeLeft;
  document.getElementById('progress-bar').style.width = '100%';
  startTimer();
}

function showSummary() {
  document.getElementById('options').innerHTML = '';
  document.getElementById('word').innerText = 'Тест завершено!';
  document.getElementById('summary').style.display = 'block';
  document.getElementById('summaryText').innerText =
    `Ваш результат: ${correctCount} вірних з ${totalAttempts}. Точність: ${document.getElementById('accuracy').innerText}`;
}

document.getElementById('wordSet').addEventListener('change', () => {
  initPool();
  resetStats();
});

document.getElementById('invertCheck').addEventListener('change', () => {
  loadQuestion();
});

window.onload = () => {
  initPool();
  loadQuestion();
  startTimer();
};
