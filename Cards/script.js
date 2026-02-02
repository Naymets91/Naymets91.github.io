document.addEventListener("DOMContentLoaded", () => {
  let words = [];
  let score = 0;
  let attempts = 0;
  let skipped = 0;
  let currentIndex = 0;
  let mode = "normal"; // normal або test
  let testWords = [];
  let testIndex = 0;
  let testScore = 0;

  // Завантажуємо статистику з LocalStorage
  if (localStorage.getItem("quizStats")) {
    const stats = JSON.parse(localStorage.getItem("quizStats"));
    score = stats.score;
    attempts = stats.attempts;
    skipped = stats.skipped;
    currentIndex = stats.currentIndex || 0;
    updateStats();
    updateProgress();
  }

  // Завантажуємо слова з JSON
  fetch("words.json")
    .then(res => res.json())
    .then(data => {
      words = data;
      newQuestion();
    });

  function saveStats() {
    const stats = { score, attempts, skipped, currentIndex };
    localStorage.setItem("quizStats", JSON.stringify(stats));
  }

  function updateStats() {
    document.getElementById("score").textContent = score;
    document.getElementById("attempts").textContent = attempts;
    document.getElementById("skipped").textContent = skipped;
    let accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
    document.getElementById("accuracy").textContent = accuracy + "%";
    saveStats();
  }

  function updateProgress() {
    const total = mode === "normal" ? words.length : testWords.length;
    const done = mode === "normal" ? currentIndex : testIndex;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("progress-bar").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${done}/${total}`;
  }

  function newQuestion() {
    let word;
    if (mode === "normal") {
      word = words[Math.floor(Math.random() * words.length)];
    } else {
      if (testIndex >= testWords.length) {
        finishTest();
        return;
      }
      word = testWords[testIndex];
    }

    document.getElementById("word").textContent = word.en;

    let options = [word.ua];
    while (options.length < 4) {
      let random = words[Math.floor(Math.random() * words.length)].ua;
      if (!options.includes(random)) options.push(random);
    }
    options = options.sort(() => Math.random() - 0.5);

    const div = document.getElementById("options");
    div.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.classList.add("option-btn"); // додаємо клас для стилів
      btn.onclick = () => {
        attempts++;
        if (mode === "normal") currentIndex++;
        if (opt === word.ua) {
          score++;
          btn.classList.add("correct");
          if (mode === "test") testScore += 5; // 5 балів за правильну
        } else {
          btn.classList.add("wrong");
          [...div.children].forEach(b => {
            if (b.textContent === word.ua) {
              b.classList.add("correct");
            }
          });
        }
        updateStats();
        updateProgress();
        if (mode === "normal") {
          setTimeout(newQuestion, 1200);
        } else {
          testIndex++;
          setTimeout(newQuestion, 1200);
        }
      };
      div.appendChild(btn);
    });

    document.getElementById("skipBtn").onclick = () => {
      skipped++;
      attempts++;
      if (mode === "normal") currentIndex++;
      else testIndex++;
      updateStats();
      updateProgress();
      newQuestion();
    };

    document.getElementById("resetBtn").onclick = () => {
      score = 0;
      attempts = 0;
      skipped = 0;
      currentIndex = 0;
      localStorage.removeItem("quizStats");
      updateStats();
      updateProgress();
      newQuestion();
    };

    document.getElementById("modeBtn").onclick = () => {
      startTest();
    };
  }

  function startTest() {
    mode = "test";
    testWords = [...words].sort(() => Math.random() - 0.5).slice(0, 20);
    testIndex = 0;
    testScore = 0;
    document.getElementById("testResult").innerHTML = "";
    updateProgress();
    newQuestion();
  }

  function finishTest() {
    const resultText = `Ви набрали ${testScore} балів із 100. ` +
      (testScore >= 65 ? "✅ Тест пройдено!" : "❌ Недостатньо балів.");

    document.getElementById("testResult").innerHTML = `
      ${resultText}<br>
      <button id="retryBtn">Пройти ще раз</button>
    `;

    document.getElementById("retryBtn").onclick = () => {
      startTest();
    };

    mode = "normal"; // після тесту повертаємось у звичайний режим
    currentIndex = 0;
    updateProgress();
  }
});
