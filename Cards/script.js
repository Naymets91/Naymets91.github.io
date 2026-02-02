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
  let timeLeft = 10;

  // Завантаження слів
  fetch("words.json")
    .then(res => res.json())
    .then(data => {
      words = data;
      newQuestion();
    });

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
    timeLeft = 10;
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

    document.getElementById("skipBtn").onclick = () => {
      clearInterval(timer);
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
    updateProgress();
  }
});
