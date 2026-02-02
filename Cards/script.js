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
