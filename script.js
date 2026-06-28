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

let selectedPlanet = null;
let selectedNumbers = [];
let operator = "+";
let score = 0;
let travelStep = 0;

const planets = [
  { name: "Mercury", ko: "수성", fuel: 80, className: "mercury" },
  { name: "Venus", ko: "금성", fuel: 100, className: "venus" },
  { name: "Earth", ko: "지구", fuel: 120, className: "earth" },
  { name: "Mars", ko: "화성", fuel: 150, className: "mars" },
  { name: "Jupiter", ko: "목성", fuel: 180, className: "jupiter" },
  { name: "Saturn", ko: "토성", fuel: 190, className: "saturn" },
  { name: "Uranus", ko: "천왕성", fuel: 200, className: "uranus" },
  { name: "Neptune", ko: "해왕성", fuel: 220, className: "neptune" }
];

const obstacles = [
  { icon: "☄️", title: "소행성이 나타났어요!" },
  { icon: "🛰️", title: "위성이 가까워요!" },
  { icon: "🪨", title: "우주 돌멩이!" },
  { icon: "🕳️", title: "블랙홀을 피해요!" }
];

init();

function init() {
  planets.forEach(planet => {
    const btn = document.createElement("button");
    btn.innerHTML = `${planet.ko}<br>${planet.name}`;
    btn.addEventListener("click", () => selectPlanet(planet));
    planetButtons.appendChild(btn);
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

function selectPlanet(planet) {
  selectedPlanet = planet;
  selectedNumbers = [];
  travelStep = 0;

  missionTitle.textContent = `🚀 목적지: ${planet.ko}`;
  message.textContent = `${planet.ko}까지 가려면 연료 ${planet.fuel}L가 필요해요. 숫자 2개를 골라 맞춰보세요!`;

  showPlanet(planet);
  makeFuelCards(planet.fuel);

  fuelGame.classList.remove("hidden");
  spaceQuiz.classList.add("hidden");

  rocket.classList.remove("launching");
  rocket.style.left = "80px";
  rocket.style.bottom = "55px";
}

function showPlanet(planet) {
  planetDisplay.style.display = "block";
  planetDisplay.innerHTML = `<div class="planet ${planet.className}"></div>`;
}

function makeFuelCards(target) {
  numberCards.innerHTML = "";

  const pair = makePair(target);
  const numbers = [...pair];

  while (numbers.length < 5) {
    const n = randomNumber(20, 160);
    if (!numbers.includes(n)) numbers.push(n);
  }

  shuffle(numbers).forEach(num => {
    const card = document.createElement("button");
    card.className = "numberCard";
    card.textContent = num;
    card.addEventListener("click", () => selectNumber(num, card));
    numberCards.appendChild(card);
  });

  fuelTarget.textContent = `필요 연료: ${target} L`;
  updateFormula();
}

function makePair(target) {
  const a = randomNumber(40, target - 30);
  const b = target - a;
  return [a, b];
}

function selectNumber(num, card) {
  if (selectedNumbers.length >= 2 && !card.classList.contains("selected")) {
    message.textContent = "숫자는 2개만 고를 수 있어요. 다시 고르려면 선택된 카드를 눌러주세요.";
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

  selectedFormula.textContent = `선택: ${a} ${operator} ${b} = ${result}`;
}

function launchRocket() {
  if (!selectedPlanet) {
    message.textContent = "먼저 행성을 선택하세요!";
    return;
  }

  if (selectedNumbers.length !== 2) {
    message.textContent = "숫자 카드 2개를 골라주세요!";
    return;
  }

  const result = operator === "+"
    ? selectedNumbers[0] + selectedNumbers[1]
    : selectedNumbers[0] - selectedNumbers[1];

  if (result !== selectedPlanet.fuel) {
    message.textContent = `연료가 맞지 않아요! ${selectedPlanet.fuel}L를 만들어야 해요.`;
    return;
  }

  message.textContent = "3... 2... 1... 발사!";
  fuelGame.classList.add("hidden");
  rocket.classList.add("launching");

  setTimeout(() => {
    startSpaceTravel();
  }, 3000);
}

function startSpaceTravel() {
  travelStep = 0;
  message.textContent = "우주 비행 시작! 장애물을 계산으로 피해보세요!";
  showObstacleQuiz();
}

function showObstacleQuiz() {
  if (travelStep >= 3) {
    arrivePlanet();
    return;
  }

  const obs = obstacles[Math.floor(Math.random() * obstacles.length)];
  obstacle.textContent = obs.icon;
  obstacle.style.display = "block";

  const quiz = makeQuiz();

  quizTitle.textContent = obs.title;
  quizQuestion.textContent = quiz.question;
  quizAnswers.innerHTML = "";

  quiz.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.addEventListener("click", () => checkQuiz(answer, quiz.correct));
    quizAnswers.appendChild(btn);
  });

  spaceQuiz.classList.remove("hidden");
}

function makeQuiz() {
  const usePlus = Math.random() > 0.4;
  let a;
  let b;
  let correct;

  if (usePlus) {
    a = randomNumber(20, 90);
    b = randomNumber(10, 60);
    correct = a + b;
    return {
      question: `${a} + ${b} = ?`,
      correct,
      answers: shuffle([correct, correct + 10, correct - 10])
    };
  } else {
    a = randomNumber(60, 140);
    b = randomNumber(10, 50);
    correct = a - b;
    return {
      question: `${a} - ${b} = ?`,
      correct,
      answers: shuffle([correct, correct + 10, correct - 10])
    };
  }
}

function checkQuiz(answer, correct) {
  if (answer === correct) {
    travelStep++;
    message.textContent = "정답! 장애물을 피했어요!";
    obstacle.style.display = "none";

    setTimeout(() => {
      showObstacleQuiz();
    }, 900);
  } else {
    message.textContent = "아쉬워요! 다시 계산해보세요.";
  }
}

function arrivePlanet() {
  obstacle.style.display = "none";
  spaceQuiz.classList.add("hidden");

  score++;
  scoreSpan.textContent = score;

  message.textContent = `착륙 성공! Owen이 ${selectedPlanet.ko}에 도착했어요! ⭐`;
  missionTitle.textContent = `🎉 ${selectedPlanet.ko} 탐사 성공!`;

  setTimeout(() => {
    message.textContent = "다른 행성을 선택해서 새로운 우주 미션을 시작하세요!";
  }, 2500);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}