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
  let currentWordObj = null;

  let invert = false;

  let selectedFile = localStorage.getItem("wordSet") || "words.json";
  document.getElementById("wordSet").value = selectedFile;

  // Функція озвучування тексту (Web Speech API)
  function speakText(text) {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  async function loadWords() {
    const res = await fetch(selectedFile);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      alert("У цьому наборі слів немає даних.");
      return;
    }

    words = data;
    loadProgress();
    updateProgress();
  }

  function saveProgress() {
    localStorage.setItem("progress", JSON.stringify({
      score,
      attempts,
      skipped,
      currentIndex,
      mode,
      selectedFile,
      invert
    }));
  }

  function loadProgress() {
    const saved = JSON.parse(localStorage.getItem("progress"));
    if (!saved) return;
    if (saved.selectedFile !== selectedFile) return;

    score = saved.score ?? 0;
    attempts = saved.attempts ?? 0;
    skipped = saved.skipped ?? 0;
    currentIndex = saved.currentIndex ?? 0;
    mode = saved.mode ?? "normal";
    invert = saved.invert ?? false;

    document.getElementById("invertMode").checked = invert;

    updateStats();
  }

  function clearProgress() {
    localStorage.removeItem("progress");
  }

  loadWords().then(() => newQuestion());

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

    currentWordObj = word;

    document.getElementById("word").textContent = invert ? word.ua : word.en;

    let correct = invert ? word.en : word.ua;
    let options = [correct];

    while (options.length < 4) {
      let randomWord = words[Math.floor(Math.random() * words.length)];
      let random = invert ? randomWord.en : randomWord.ua;

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

        // Озвучуємо англійське слово одразу після кліку
        if (currentWordObj && currentWordObj.en) {
          speakText(currentWordObj.en);
        }

        if (opt === correct) {
          score++;
          btn.classList.add("correct");
          if (mode === "test") testScore += 5;
        } else {
          btn.classList.add("wrong");
          [...div.children].forEach(b => {
            if (b.textContent === correct) b.classList.add("correct");
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

  document.getElementById("wordSet").onchange = async (e) => {
    selectedFile = e.target.value;
    localStorage.setItem("wordSet", selectedFile);

    clearProgress();
    score = 0;
    attempts = 0;
    skipped = 0;
    currentIndex = 0;

    updateStats();
    updateProgress();

    await loadWords();
    newQuestion();
  };

  document.getElementById("invertMode").onchange = (e) => {
    invert = e.target.checked;
    saveProgress();
    newQuestion();
  };
});
