const planetButtons = document.getElementById("planetButtons");
const missionTitle = document.getElementById("missionTitle");
const message = document.getElementById("message");
const fuelGame = document.getElementById("fuelGame");
const fuelTarget = document.getElementById("fuelTarget");
const numberCards = document.getElementById("numberCards");
const selectedFormula = document.getElementById("selectedFormula");
const launchBtn = document.getElementById("launchBtn");
const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const rocket = document.getElementById("rocket");
const planetDisplay = document.getElementById("planetDisplay");
const obstacle = document.getElementById("obstacle");
const spaceQuiz = document.getElementById("spaceQuiz");
const quizTitle = document.getElementById("quizTitle");
const quizQuestion = document.getElementById("quizQuestion");
const quizAnswers = document.getElementById("quizAnswers");
const scoreSpan = document.getElementById("score");
const countdown = document.getElementById("countdown");
const stickers = document.getElementById("stickers");
const planetFact = document.getElementById("planetFact");
const factTitle = document.getElementById("factTitle");
const factText = document.getElementById("factText");
const levelName = document.getElementById("levelName");
const levelButtons = document.querySelectorAll("#levelButtons button");

let selectedPlanet = null;
let selectedNumbers = [];
let operator = "+";
let score = Number(localStorage.getItem("owenStars") || 0);
let visited = JSON.parse(localStorage.getItem("owenVisitedPlanets") || "[]");
let travelStep = 0;
let level = Number(localStorage.getItem("owenMathLevel") || 1);

const levelSettings = {
  1: {
    name: "Step 1",
    label: "한 자리",
    fuelMin: 3,
    fuelMax: 9,
    cardMin: 1,
    cardMax: 9,
    quizMin: 1,
    quizMax: 9,
    wrongGap: 1
  },
  2: {
    name: "Step 2",
    label: "두 자리",
    fuelMin: 20,
    fuelMax: 99,
    cardMin: 5,
    cardMax: 99,
    quizMin: 10,
    quizMax: 99,
    wrongGap: 5
  },
  3: {
    name: "Step 3",
    label: "세 자리",
    fuelMin: 100,
    fuelMax: 220,
    cardMin: 20,
    cardMax: 220,
    quizMin: 100,
    quizMax: 220,
    wrongGap: 10
  }
};

const planets = [
  { name: "Mercury", ko: "수성", className: "mercury", fact: "Mercury is the closest planet to the Sun." },
  { name: "Venus", ko: "금성", className: "venus", fact: "Venus is very hot and covered with thick clouds." },
  { name: "Earth", ko: "지구", className: "earth", fact: "Earth has water, air, animals, and people." },
  { name: "Mars", ko: "화성", className: "mars", fact: "Mars is called the Red Planet." },
  { name: "Jupiter", ko: "목성", className: "jupiter", fact: "Jupiter is the biggest planet in the Solar System." },
  { name: "Saturn", ko: "토성", className: "saturn", fact: "Saturn has beautiful rings made of ice and rock." },
  { name: "Uranus", ko: "천왕성", className: "uranus", fact: "Uranus is an ice giant made of ice and gas." },
  { name: "Neptune", ko: "해왕성", className: "neptune", fact: "Neptune is very far from the Sun and has strong winds." }
];

const obstacles = [
  { icon: "☄️", title: "소행성이 나타났어요!" },
  { icon: "🛰️", title: "위성이 가까워요!" },
  { icon: "🪨", title: "우주 돌멩이!" },
  { icon: "🕳️", title: "블랙홀을 피해요!" }
];

init();

function init() {
  scoreSpan.textContent = score;
  makePlanetButtons();
  makeStickerBook();
  setLevel(level);

  levelButtons.forEach(btn => {
    btn.addEventListener("click", () => setLevel(Number(btn.dataset.level)));
  });

  plusBtn.addEventListener("click", () => {
    operator = "+";
    updateFormula();
  });

  minusBtn.addEventListener("click", () => {
    operator = "-";
    updateFormula();
  });

  launchBtn.addEventListener("click", launchRocket);
}

function setLevel(newLevel) {
  level = newLevel;
  localStorage.setItem("owenMathLevel", level);

  const setting = levelSettings[level];
  levelName.textContent = `${setting.name} ${setting.label}`;

  levelButtons.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.level) === level);
  });

  selectedPlanet = null;
  selectedNumbers = [];

  missionTitle.textContent = "행성을 선택하세요";
  message.textContent = `${setting.label} 덧셈·뺄셈 미션입니다. 행성을 선택하세요!`;

  fuelGame.classList.add("hidden");
  spaceQuiz.classList.add("hidden");
  planetFact.classList.add("hidden");
  obstacle.style.display = "none";
  rocket.classList.remove("launching");
  rocket.style.left = "80px";
  rocket.style.bottom = "55px";
}

function makePlanetButtons() {
  planetButtons.innerHTML = "";

  planets.forEach(planet => {
    const btn = document.createElement("button");
    btn.innerHTML = `${planet.ko}<br>${planet.name}`;
    btn.addEventListener("click", () => selectPlanet(planet));
    planetButtons.appendChild(btn);
  });
}

function selectPlanet(planet) {
  selectedPlanet = {
    ...planet,
    fuel: makeFuelTarget()
  };

  selectedNumbers = [];
  operator = "+";
  travelStep = 0;

  missionTitle.textContent = `🚀 목적지: ${selectedPlanet.ko}`;
  message.textContent = `${selectedPlanet.ko}까지 필요한 연료 ${selectedPlanet.fuel}L를 만들어보세요!`;

  showPlanet(selectedPlanet);
  makeFuelCards(selectedPlanet.fuel);

  fuelGame.classList.remove("hidden");
  spaceQuiz.classList.add("hidden");
  planetFact.classList.add("hidden");
  obstacle.style.display = "none";

  rocket.classList.remove("launching");
  rocket.style.left = "80px";
  rocket.style.bottom = "55px";
}

function makeFuelTarget() {
  const s = levelSettings[level];
  return randomNumber(s.fuelMin, s.fuelMax);
}

function showPlanet(planet) {
  planetDisplay.style.display = "block";
  planetDisplay.innerHTML = `<div class="planet ${planet.className}"></div>`;
}

function makeFuelCards(target) {
  numberCards.innerHTML = "";

  const pair = makeCorrectPair(target);
  const nums = [...pair];

  while (nums.length < 5) {
    const n = randomNumber(levelSettings[level].cardMin, levelSettings[level].cardMax);
    if (!nums.includes(n)) nums.push(n);
  }

  shuffle(nums).forEach(num => {
    const card = document.createElement("button");
    card.className = "numberCard";
    card.textContent = num;
    card.addEventListener("click", () => selectNumber(num, card));
    numberCards.appendChild(card);
  });

  fuelTarget.textContent = `필요 연료: ${target} L`;
  updateFormula();
}

function makeCorrectPair(target) {
  if (level === 1) {
    const a = randomNumber(1, target - 1);
    return [a, target - a];
  }

  if (level === 2) {
    const a = randomNumber(5, target - 5);
    return [a, target - a];
  }

  const a = randomNumber(30, target - 30);
  return [a, target - a];
}

function selectNumber(num, card) {
  if (selectedNumbers.length >= 2 && !card.classList.contains("selected")) {
    message.textContent = "숫자는 2개만 고를 수 있어요. 다시 고르려면 선택된 숫자를 눌러요.";
    return;
  }

  if (card.classList.contains("selected")) {
    card.classList.remove("selected");
    selectedNumbers = selectedNumbers.filter(n => n !== num);
  } else {
    card.classList.add("selected");
    selectedNumbers.push(num);
  }

  updateFormula();
}

function updateFormula() {
  const a = selectedNumbers[0] ?? "?";
  const b = selectedNumbers[1] ?? "?";

  let result = "?";
  if (selectedNumbers.length === 2) {
    result = operator === "+"
      ? selectedNumbers[0] + selectedNumbers[1]
      : selectedNumbers[0] - selectedNumbers[1];
  }

  selectedFormula.textContent = `${a} ${operator} ${b} = ${result}`;
}

function launchRocket() {
  if (!selectedPlanet) {
    message.textContent = "먼저 행성을 선택하세요!";
    return;
  }

  if (selectedNumbers.length !== 2) {
    message.textContent = "숫자 2개를 골라주세요!";
    return;
  }

  const result = operator === "+"
    ? selectedNumbers[0] + selectedNumbers[1]
    : selectedNumbers[0] - selectedNumbers[1];

  if (result !== selectedPlanet.fuel) {
    message.textContent = `아직 연료가 맞지 않아요. ${selectedPlanet.fuel}L가 필요해요!`;
    return;
  }

  fuelGame.classList.add("hidden");
  startCountdown();
}

function startCountdown() {
  let count = 3;
  countdown.style.display = "flex";
  countdown.textContent = count;

  const timer = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.textContent = count;
    } else if (count === 0) {
      countdown.textContent = "LAUNCH!";
    } else {
      clearInterval(timer);
      countdown.style.display = "none";
      rocket.classList.add("launching");
      message.textContent = "🔥 로켓 발사 성공!";

      setTimeout(startSpaceTravel, 3000);
    }
  }, 700);
}

function startSpaceTravel() {
  travelStep = 0;
  message.textContent = "우주 장애물을 계산으로 피해보세요!";
  showObstacleQuiz();
}

function showObstacleQuiz() {
  if (travelStep >= 3) {
    arrivePlanet();
    return;
  }

  const obs = obstacles[Math.floor(Math.random() * obstacles.length)];
  const quiz = makeQuiz();

  obstacle.textContent = obs.icon;
  obstacle.style.display = "block";

  quizTitle.textContent = obs.title;
  quizQuestion.textContent = quiz.question;
  quizAnswers.innerHTML = "";

  quiz.answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.addEventListener("click", () => checkQuiz(ans, quiz.correct));
    quizAnswers.appendChild(btn);
  });

  spaceQuiz.classList.remove("hidden");
}

function makeQuiz() {
  const s = levelSettings[level];
  const usePlus = Math.random() > 0.45;

  let a;
  let b;
  let correct;

  if (usePlus) {
    a = randomNumber(s.quizMin, s.quizMax);
    b = randomNumber(s.cardMin, Math.min(s.cardMax, s.quizMax));

    if (level === 1) {
      a = randomNumber(1, 8);
      b = randomNumber(1, 9 - a);
    }

    correct = a + b;
    return makeQuizObject(`${a} + ${b} = ?`, correct);
  } else {
    a = randomNumber(s.quizMin, s.quizMax);
    b = randomNumber(s.cardMin, Math.min(a, s.cardMax));

    if (level === 1) {
      a = randomNumber(2, 9);
      b = randomNumber(1, a);
    }

    correct = a - b;
    return makeQuizObject(`${a} - ${b} = ?`, correct);
  }
}

function makeQuizObject(question, correct) {
  const gap = levelSettings[level].wrongGap;

  let w1 = correct + gap;
  let w2 = Math.max(0, correct - gap);

  if (w1 === correct) w1 = correct + gap + 1;
  if (w2 === correct) w2 = correct + gap + 2;

  return {
    question,
    correct,
    answers: shuffle([correct, w1, w2])
  };
}

function checkQuiz(answer, correct) {
  if (answer === correct) {
    travelStep++;
    message.textContent = "정답! 장애물을 피했어요!";
    obstacle.style.display = "none";

    setTimeout(showObstacleQuiz, 800);
  } else {
    message.textContent = "아쉬워요! 다시 계산해보세요.";
  }
}

function arrivePlanet() {
  obstacle.style.display = "none";
  spaceQuiz.classList.add("hidden");

  score++;
  localStorage.setItem("owenStars", score);
  scoreSpan.textContent = score;

  if (!visited.includes(selectedPlanet.name)) {
    visited.push(selectedPlanet.name);
    localStorage.setItem("owenVisitedPlanets", JSON.stringify(visited));
  }

  makeStickerBook();

  missionTitle.textContent = `🎉 ${selectedPlanet.ko} 도착 성공!`;
  message.textContent = `Owen이 ${selectedPlanet.ko}에 도착했어요!`;

  factTitle.textContent = `${selectedPlanet.ko} / ${selectedPlanet.name}`;
  factText.textContent = selectedPlanet.fact;
  planetFact.classList.remove("hidden");
}

function makeStickerBook() {
  stickers.innerHTML = "";

  planets.forEach(planet => {
    const sticker = document.createElement("div");
    sticker.className = "sticker";
    if (visited.includes(planet.name)) sticker.classList.add("done");
    sticker.innerHTML = visited.includes(planet.name)
      ? `✅ ${planet.ko}`
      : `⬜ ${planet.ko}`;
    stickers.appendChild(sticker);
  });
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
