const dictionary = {
	1: { Rom: "1", Pin: "yī", Char: "一", APin: "yi" },
	2: { Rom: "2", Pin: "èr", Char: "二", APin: "er" },
	3: { Rom: "3", Pin: "sān", Char: "三", APin: "san" },
	4: { Rom: "4", Pin: "sì", Char: "四", APin: "si" },
	5: { Rom: "5", Pin: "wǔ", Char: "五", APin: "wu" },
	6: { Rom: "6", Pin: "liù", Char: "六", APin: "liu" },
	7: { Rom: "7", Pin: "qī", Char: "七", APin: "qi" },
	8: { Rom: "8", Pin: "bā", Char: "八", APin: "ba" },
	9: { Rom: "9", Pin: "jiǔ", Char: "九", APin: "jiu" }
};

let score = 0;
let displayScore = 0;
let multiplier = 1;
let timer;
let mode = "";
let difficulty = "";
let availableNumbers = [];
let currentNumber = null;
let locked = false;
let isTransitioning = false;
let lastNumber = null;
let repeatCount = 0;

let callCount = {
	1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
	6: 0, 7: 0, 8: 0, 9: 0
};

let choices = ["4", "3", "2", "1"];

function selectMode(selectedMode) {
	mode = selectedMode;
	if (mode === "p") alert(`Try saying the sounds out loud!`);
	document.getElementById("menu").classList.add("hidden");
	document.getElementById("scopeMenu").classList.remove("hidden");
}

function startGame(selectedDifficulty) {
	difficulty = selectedDifficulty;
	score = 0;
	displayScore = 0;
	multiplier = 1;
	availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	document.getElementById("scopeMenu").classList.add("hidden");
	document.getElementById("game").classList.remove("hidden");
	nextQuestion();
}

function updateAvailableNumbers() {
	if (difficulty !== "easy") return;
	if (score >= 100) availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	else if (score >= 60) availableNumbers = [4, 5, 6, 7, 8, 9];
	else if (score >= 50) availableNumbers = [5, 6, 7, 8];
	else if (score >= 40) availableNumbers = [4, 5, 6, 7];
	else if (score >= 20) availableNumbers = [3, 4, 5, 6];
	else if (score >= 10) availableNumbers = [1, 2, 3, 4];
	else availableNumbers = [1, 2, 3];
}

function updateChoices(answer) {
	let digits;
	if (mode === "p") {
		digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(d => d !== answer);
	} else {
		digits = ["yī", "èr", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ"].filter(d => d !== answer);
	}

	const result = [];
	while (result.length < 3) {
		const randIndex = Math.floor(Math.random() * digits.length);
		const value = digits.splice(randIndex, 1)[0];
		result.push(value);
	}

	const insertIndex = Math.floor(Math.random() * (result.length + 1));
	result.splice(insertIndex, 0, answer);

	for (let i = 0; i < 4; i++) {
		choices[i] = result[i];
		document.getElementById(`cb${i}`).textContent = choices[i];
	}
}

function updateScoreDisplay() {
	document.getElementById("scoreDisplay").textContent = `Score: ${displayScore} (x${multiplier})`;
}

function resetMultiplier() {
	multiplier = 1;
	updateScoreDisplay();
}

function resetTimerBar() {
	const bar = document.getElementById("timerBar");
	bar.style.transition = "none";
	bar.style.width = "0%";
}

function startTimer() {
	clearTimeout(timer);
	const bar = document.getElementById("timerBar");
	bar.style.transition = "none";
	bar.style.width = "100%";

	// Small delay to allow DOM to register the style change before starting the animation
	setTimeout(() => {
		bar.style.transition = "width 3s linear";
		bar.style.width = "0%";
	}, 20);

	timer = setTimeout(() => {
		resetMultiplier();
	}, 3000);
}

function nextQuestion() {
	updateAvailableNumbers();
	document.getElementById("message").textContent = "";
	locked = false;
	switchVisibleInput(true);
	isTransitioning = false;

	let attempts = 0;
	do {
		currentNumber = weightedRandom(availableNumbers);
		attempts++;
	} while (currentNumber === lastNumber && repeatCount >= 3 && attempts < 10);

	if (currentNumber === lastNumber) {
		repeatCount++;
	} else {
		repeatCount = 1;
		lastNumber = currentNumber;
	}

	callCount[currentNumber]++;
	updateScoreDisplay();

	const showChar = document.getElementById("showCharacter").checked;
	const autoPlay = document.getElementById("autoPlayAudio").checked;
	const charDisplay = showChar ? ` (${dictionary[currentNumber].Char})` : "";

	let answerNow = "";

	if (mode === "p") {
		answerNow = dictionary[currentNumber].Rom;
		document.getElementById("question").textContent =
			`The pinyin "${dictionary[currentNumber].Pin}"${charDisplay} stands for:`;
		if (autoPlay) playSound(`audio/numbers/${dictionary[currentNumber].APin}.mp3`);
		document.getElementById("replayButton").classList.remove("hidden");
	} else {
		answerNow = dictionary[currentNumber].Pin;
		document.getElementById("question").textContent =
			`The number "${dictionary[currentNumber].Rom}" stands for:${charDisplay}`;
		document.getElementById("replayButton").classList.add("hidden");
	}

	updateChoices(answerNow);

	// Start timer after choices are updated and UI is settled
	setTimeout(() => {
		startTimer();
	}, 50);
}

function weightedRandom(numbers) {
	let weightedArray = [];
	numbers.forEach(num => {
		let frequency = callCount[num];
		for (let i = 0; i < Math.max(1, 10 - frequency); i++) {
			weightedArray.push(num);
		}
	});
	return weightedArray[Math.floor(Math.random() * weightedArray.length)];
}

function returnDisplayToHow() {
	document.getElementById("message").textContent =
		`The correct answer is "${dictionary[currentNumber].APin}". To continue, type: "${dictionary[currentNumber].Rom} is ${dictionary[currentNumber].APin}"`;
}

function switchVisibleInput(isCorrect) {
	if (isCorrect) {
		document.getElementById("choice-buttons").classList.remove("hidden");
		document.getElementById("correction-facility").classList.add("hidden");
	} else {
		document.getElementById("choice-buttons").classList.add("hidden");
		document.getElementById("correction-facility").classList.remove("hidden");
		document.getElementById("answer").value = "";
		document.getElementById("answer").focus();
	}
}

function submitAnswer(fromVal) {
	if (isTransitioning) return;

	const answerInput = document.getElementById("answer").value.trim().toLowerCase();
	const input = (fromVal === null || fromVal === undefined) ? answerInput : choices[fromVal];

	clearTimeout(timer); // Stop timer on submission

	if (locked) {
		if (input.includes(dictionary[currentNumber].Rom.toLowerCase()) &&
			input.includes(dictionary[currentNumber].APin.toLowerCase())) {
			locked = false;
			document.getElementById("message").textContent = "Unlocked! Moving on...";
			resetTimerBar();
			setTimeout(nextQuestion, 1000);
		} else {
			document.getElementById("message").textContent = "Incorrect unlock phrase. Try again.";
			setTimeout(returnDisplayToHow, 2000);
		}
		return;
	}

	const correctAnswer = mode === "p"
		? dictionary[currentNumber].Rom.toLowerCase()
		: normalizePinyin(dictionary[currentNumber].Pin);

	const isCorrect = mode === "p"
		? input === correctAnswer
		: input === correctAnswer || input === dictionary[currentNumber].Pin.toLowerCase();

	if (isCorrect) {
		score++;
		displayScore += multiplier;
		multiplier++;
		updateScoreDisplay();
		resetTimerBar();
		playSound("audio/ui_right.mp3");
		isTransitioning = true;
		document.getElementById("message").textContent = "Correct!";
		setTimeout(nextQuestion, 1000);
	} else {
		score -= 5;
		switchVisibleInput(false);
		resetMultiplier();
		resetTimerBar();
		locked = true;
		playSound("audio/ui_wrong.mp3");
		document.getElementById("message").textContent = "Incorrect.";
		setTimeout(returnDisplayToHow, 2000);
	}
}

function endGame() {
	document.getElementById("game").classList.add("hidden");
	document.getElementById("endScore").classList.remove("hidden");
	document.getElementById("finScoreDisp").textContent = `Your final score is: ${displayScore}`;
	clearTimeout(timer);
}

function finish() {
	document.getElementById("endScore").classList.add("hidden");
	document.getElementById("menu").classList.remove("hidden");
}

// Event listeners for custom scope
let customNumbers = [];

function showCustomScopeInput() {
	document.getElementById("scopeMenu").classList.add("hidden");
	document.getElementById("customScopeSection").classList.remove("hidden");
}

function setCustomScope() {
	score = 0;
	const input = document.getElementById("customScopeInput").value.trim();
	const numbersArray = input.split(',').map(num => parseInt(num.trim(), 10)).filter(num => num >= 1 && num <= 9);
	
	if (numbersArray.length === 0) {
		alert("Please enter valid numbers between 1 and 9.");
		return;
	}
	
	customNumbers = numbersArray;
	availableNumbers = customNumbers; // Set the available numbers to the custom list
	
	document.getElementById("customScopeSection").classList.add("hidden");
	document.getElementById("game").classList.remove("hidden");
	nextQuestion();
}

function cancelCustomScope() {
	document.getElementById("customScopeSection").classList.add("hidden");
	document.getElementById("scopeMenu").classList.remove("hidden");
}

