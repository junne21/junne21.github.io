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
let mode = ""; // 'p' or 'r'
let difficulty = "";
let availableNumbers = [];
let currentNumber = null;
let locked = false;
let isTransitioning = false;
let lastNumber = null;
let repeatCount = 0;

let callCount = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0
};

// Normalizing pinyin for input comparison
function normalizePinyin(pinyin) {
    return pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Refactored audio play function
function playSound(path) {
    const audio = new Audio(path);
    audio.play();
}

function selectMode(selectedMode) {
    mode = selectedMode;
    if (mode === "p") alert(`Try saying the sounds out loud!`);
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("scopeMenu").classList.remove("hidden");
}

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    score = 0;
    availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    document.getElementById("scopeMenu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    nextQuestion();
}

function updateAvailableNumbers() {
    if (difficulty !== 'easy') return;
    if (score >= 100) availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    else if (score >= 60) availableNumbers = [4, 5, 6, 7, 8, 9];
    else if (score >= 50) availableNumbers = [5, 6, 7, 8];
    else if (score >= 40) availableNumbers = [4, 5, 6, 7];
    else if (score >= 20) availableNumbers = [3, 4, 5, 6];
    else if (score >= 10) availableNumbers = [1, 2, 3, 4];
    else availableNumbers = [1, 2, 3];
}

function nextQuestion() {
    updateAvailableNumbers();
    document.getElementById("message").textContent = "";
    locked = false;
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

    // Update the call count for the selected number
    callCount[currentNumber]++;

    document.getElementById("scoreDisplay").textContent = `Score: ${score}`;

    const showChar = document.getElementById("showCharacter").checked;
    const autoPlay = document.getElementById("autoPlayAudio").checked;
    const charDisplay = showChar ? ` (${dictionary[currentNumber].Char})` : "";

    if (mode === 'p') {
        document.getElementById("question").textContent =
            `The pinyin "${dictionary[currentNumber].Pin}"${charDisplay} stands for:`;
        if (autoPlay) playSound(`audio/numbers/${dictionary[currentNumber].APin}.mp3`);
        document.getElementById("replayButton").classList.remove("hidden");
    } else {
        document.getElementById("question").textContent =
            `The number "${dictionary[currentNumber].Rom}" stands for:${charDisplay}`;
        document.getElementById("replayButton").classList.add("hidden");
    }

    document.getElementById("answer").value = "";
    document.getElementById("answer").focus();
}

// Weighted random selection function
function weightedRandom(numbers) {
    // Create an array of numbers, each repeated by their frequency count
    let weightedArray = [];
    numbers.forEach(num => {
        let frequency = callCount[num]; // Use call count as weight
        for (let i = 0; i < Math.max(1, 10 - frequency); i++) {
            weightedArray.push(num);
        }
    });

    // Randomly select from the weighted array
    return weightedArray[Math.floor(Math.random() * weightedArray.length)];
}

function replayAudio() {
    playSound(`audio/numbers/${dictionary[currentNumber].APin}.mp3`);
}

function returnDisplayToHow() {
    document.getElementById("message").textContent =
        `The correct answer is "${dictionary[currentNumber].APin}". To continue, type: "${dictionary[currentNumber].Rom} is ${dictionary[currentNumber].APin}"`;
}

function submitAnswer() {
    if (isTransitioning) return;

    const input = document.getElementById("answer").value.trim().toLowerCase();

    if (locked) {
        if (input.includes(dictionary[currentNumber].Rom.toLowerCase()) &&
            input.includes(dictionary[currentNumber].APin.toLowerCase())) {
            locked = false;
            document.getElementById("message").textContent = "Unlocked! Moving on...";
            setTimeout(nextQuestion, 1000);
        } else {
            document.getElementById("message").textContent = "Incorrect unlock phrase. Try again.";
            setTimeout(returnDisplayToHow, 2000);
        }
        return;
    }

    if (input === "end") {
        endGame();
        return;
    }

    if (mode === 'p') {
        const correctAnswer = dictionary[currentNumber].Rom.toLowerCase();
        if (input === correctAnswer) {
            score++;
            playSound('audio/ui_right.mp3');
            isTransitioning = true;
            document.getElementById("message").textContent = "Correct!";
            setTimeout(nextQuestion, 1000);
        } else {
            score -= 5;
            playSound('audio/ui_wrong.mp3');
            locked = true;
            document.getElementById("message").textContent =
                `WRONG! The correct answer is "${correctAnswer}". To continue, type: "${dictionary[currentNumber].Rom} is ${dictionary[currentNumber].APin}"`;
            document.getElementById("answer").value = "";
        }
    } else {
        const correctAnswer = normalizePinyin(dictionary[currentNumber].Pin);
        const isCorrect = input === correctAnswer || input === dictionary[currentNumber].APin.toLowerCase();
        if (isCorrect) {
            score++;
            playSound('audio/ui_right.mp3');
            isTransitioning = true;
            document.getElementById("message").textContent = "Correct!";
            setTimeout(nextQuestion, 1000);
        } else {
            score -= 5;
            playSound('audio/ui_wrong.mp3');
            locked = true;
            document.getElementById("message").textContent =
                `WRONG! The correct answer is "${dictionary[currentNumber].APin}". To continue, type: "${dictionary[currentNumber].Rom} is ${dictionary[currentNumber].APin}"`;
            document.getElementById("answer").value = "";
        }
    }

    document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
}

function endGame() {
    document.getElementById("game").classList.add("hidden");
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("scopeMenu").classList.add("hidden");
    document.getElementById("endScore").classList.remove("hidden");
    document.getElementById("finScoreDisp").textContent = `Your Final Score is: ${score}`;
}

function finish() {
    document.getElementById("game").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("scopeMenu").classList.add("hidden");
    document.getElementById("endScore").classList.add("hidden");
}

// Event listeners for dark mode toggle
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (prefersDarkMode || !window.matchMedia) {
    document.body.classList.add("dark");
    document.getElementById("darkModeToggle").checked = true;
} else {
    document.body.classList.remove("dark");
    document.getElementById("darkModeToggle").checked = false;
}

document.getElementById("darkModeToggle").addEventListener("change", function () {
    document.body.classList.toggle("dark", this.checked);
});

document.getElementById("answer").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default behavior of pressing Enter
        submitAnswer();
    }
});

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
