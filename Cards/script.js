// ==========================================
// 1. ОЗВУЧУВАННЯ (Web Speech API)
// ==========================================
function speakText(text) {
  if (!text) return;
  window.speechSynthesis.cancel(); // Зупиняємо попередній звук

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}

function speakCurrentWord() {
  if (currentWordIndex === null || !currentPool[currentWordIndex]) return;
  const current = currentPool[currentWordIndex];
  speakText(current.word);
}

// ==========================================
// 2. ІНТЕРВАЛЬНІ ПОВТОРЕННЯ (Leitner System)
// ==========================================
function getWordProgress() {
  const saved = localStorage.getItem('wordProgress');
  return saved ? JSON.parse(saved) : {};
}

function updateWordLevel(wordKey, isCorrect) {
  const progress = getWordProgress();
  let currentLevel = progress[wordKey] || 1;

  if (isCorrect) {
    if (currentLevel < 3) currentLevel++; // Рухаємо слово до засвоєних (max 3)
  } else {
    currentLevel = 1; // Помилка повертає слово в групу "важких"
  }

  progress[wordKey] = currentLevel;
  localStorage.setItem('wordProgress', JSON.stringify(progress));
}

function getWeightedRandomIndex() {
  if (!currentPool || currentPool.length <= 1) return 0;

  const progress = getWordProgress();

  const level1 = []; // Важкі / нові слова
  const level2 = []; // Середній рівень
  const level3 = []; // Добре відомі слова

  currentPool.forEach((item, index) => {
    if (index === currentWordIndex) return; // Не повторюємо те саме слово поспіль

    const level = progress[item.word] || 1;
    if (level === 1) level1.push(index);
    else if (level === 2) level2.push(index);
    else level3.push(index);
  });

  const rand = Math.random() * 100;
  let targetGroup = [];

  // 60% шанс випадіння важкого слова, 30% — середнього, 10% — добре засвоєного
  if (rand < 60 && level1.length > 0) {
    targetGroup = level1;
  } else if (rand < 90 && level2.length > 0) {
    targetGroup = level2;
  } else if (level3.length > 0) {
    targetGroup = level3;
  } else {
    targetGroup = [...level1, ...level2, ...level3];
  }

  if (targetGroup.length === 0) return currentWordIndex;

  const randomIndex = Math.floor(Math.random() * targetGroup.length);
  return targetGroup[randomIndex];
}

// ==========================================
// 3. ПРИВ'ЯЗКА КНОПКИ ДИНАМІКА
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const speakBtn = document.getElementById('speakBtn');
  if (speakBtn) {
    speakBtn.addEventListener('click', speakCurrentWord);
  }
});
