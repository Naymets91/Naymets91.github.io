document.addEventListener("DOMContentLoaded", () => {
  let words = [];
  let score = 0;
  let attempts = 0;
  let skipped = 0;
  let currentIndex = 0;
  let mode = "normal";
  let testWords = [];
  let testIndex = 0;
  let testScore = 0;
  let timer;
  let timeLeft = 25;

  // -------------------------------
  // ВИБІР ФАЙЛУ СЛІВ
  // -------------------------------

  let selectedFile = localStorage.getItem("wordSet") || "words.json";
  document.getElementById("wordSet").value = selectedFile;

  function loadWords() {
    fetch(selectedFile)
      .then(res => res.json())
      .then(data => {
        words = data;
        loadProgress();
        updateProgress();   // ← ВАЖЛИВО! Виправляє 0/0 при старті
        newQuestion();
      });
  }

  // -------------------------------
  // LOCAL STORAGE
  // -------------------------------

  function saveProgress() {
    localStorage.setItem("progress", JSON.stringify({
      score,
      attempts,
      skipped,
      currentIndex,
      mode,
      selectedFile
    }));
  }

  function loadProgress() {
    const saved = JSON.parse(localStorage.getItem("progress"));
    if (!saved) return;

    if (saved.selectedFile && saved.selectedFile !== selectedFile) return;

    score = saved.score ?? 0;
    attempts = saved.attempts ?? 0;
    skipped = saved.skipped ?? 0;
    currentIndex = saved.currentIndex ?? 0;
    mode = saved.mode ?? "normal";

    updateStats();
  }

  function clearProgress() {
    localStorage.removeItem("progress");
  }

  // -------------------------------
  // ЗАВАНТАЖЕННЯ СЛІВ
  // -------------------------------

  loadWords();

  // -------------------------------
  // ОНОВЛЕННЯ ІНТЕРФЕЙСУ
  // -------------------------------

  function updateStats() {
    document.getElementById("score").textContent = score;
    document.getElementById("attempts").textContent = attempts;
    document.getElementById("skipped").textContent = skipped;
    let accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
    document.getElementById("accuracy").textContent = accuracy + "%";
  }

  function updateProgress() {
    const total = mode === "normal" ? words.length : testWords.length;
    const done = mode === "normal" ? currentIndex : testIndex;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("progress-bar").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${done}/${total}`;
  }

  // -------------------------------
  // ТАЙМЕР
  // -------------------------------

  function startTimer() {
    clearInterval(timer);
    timeLeft = 25;
    document.getElementById("timer").textContent = `⏳ ${timeLeft} сек`;
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").textContent = `⏳ ${timeLeft} сек`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        skipped++;
        attempts++;
        if (mode === "normal") currentIndex++;
        else testIndex++;

        updateStats();
        updateProgress();
        saveProgress();

        newQuestion();
      }
    }, 1000);
  }

  // -------------------------------
  // НОВЕ ПИТАННЯ
  // -------------------------------

  function newQuestion() {
    clearInterval(timer);

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
      btn.classList.add("option-btn");
      btn.onclick = () => {
        clearInterval(timer);
        attempts++;
        if (mode === "normal") currentIndex++;

        [...div.children].forEach(b => b.disabled = true);

        if (opt === word.ua) {
          score++;
          btn.classList.add("correct");
          if (mode === "test") testScore += 5;
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
        saveProgress();

        if (mode === "normal") {
          setTimeout(newQuestion, 1200);
        } else {
          testIndex++;
          setTimeout(newQuestion, 1200);
        }
      };
      div.appendChild(btn);
    });

    startTimer();
  }

  // -------------------------------
  // КНОПКИ
  // -------------------------------

  document.getElementById("skipBtn").onclick = () => {
    clearInterval(timer);
    skipped++;
    attempts++;
    if (mode === "normal") currentIndex++;
    else testIndex++;

    updateStats();
    updateProgress();
    saveProgress();

    newQuestion();
  };

  document.getElementById("resetBtn").onclick = () => {
    score = 0;
    attempts = 0;
    skipped = 0;
    currentIndex = 0;

    clearProgress();
    updateStats();
    updateProgress();
    newQuestion();
  };

  document.getElementById("modeBtn").onclick = () => {
    score = 0;
    attempts = 0;
    skipped = 0;
    currentIndex = 0;

    clearProgress();
    updateStats();
    updateProgress();

    startTest();
  };

  // -------------------------------
  // ТЕСТ
  // -------------------------------

  function startTest() {
    mode = "test";
    testWords = [...words].sort(() => Math.random() - 0.5).slice(0, 20);
    testIndex = 0;
    testScore = 0;
    document.getElementById("summary").style.display = "none";
    updateProgress();
    newQuestion();
  }

  function finishTest() {
    document.getElementById("summary").style.display = "block";
    document.getElementById("sumCorrect").textContent = score;
    document.getElementById("sumWrong").textContent = attempts - score - skipped;
    document.getElementById("sumSkipped").textContent = skipped;
    document.getElementById("sumAccuracy").textContent =
      attempts > 0 ? Math.round((score / attempts) * 100) + "%" : "0%";
    document.getElementById("sumScore").textContent = testScore + "/100";

    mode = "normal";
    currentIndex = 0;

    clearProgress();
    updateProgress();
  }

  // -------------------------------
  // ЗМІНА СЛОВНИКА
  // -------------------------------

  document.getElementById("wordSet").onchange = (e) => {
    selectedFile = e.target.value;
    localStorage.setItem("wordSet", selectedFile);

    clearProgress();
    score = 0;
    attempts = 0;
    skipped = 0;
    currentIndex = 0;

    updateStats();
    updateProgress();
    loadWords();
  };
});
