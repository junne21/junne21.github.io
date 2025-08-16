// ========== Utility Functions ==========

// Normalize pinyin: remove tone marks and convert to lowercase
function normalizePinyin(pinyin) {
	return pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Play an audio file from the given path
function playSound(path) {
	const audio = new Audio(path);
	audio.play();
}

// Play the current number’s pronunciation
function replayAudio() {
	if (currentNumber && dictionary[currentNumber]) {
		playSound(`audio/numbers/${dictionary[currentNumber].APin}.mp3`);
	}
}

// ========== Theme Toggle Handling ==========

function initThemeToggle() {
	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
	const toggle = document.getElementById("darkModeToggle");

	if (prefersDark || !window.matchMedia) {
		document.body.classList.add("dark");
		toggle.checked = true;
	} else {
		document.body.classList.remove("dark");
		toggle.checked = false;
	}

	toggle.addEventListener("change", function () {
		document.body.classList.toggle("dark", this.checked);
	});
}

// ========== Event Listeners ==========

function setupEventListeners() {
	// Theme toggle
	initThemeToggle();

	// Submit answer on Enter key
	const answerInput = document.getElementById("answer");
	answerInput.addEventListener("keydown", function (event) {
		if (event.key === "Enter") {
			event.preventDefault();
			submitAnswer();
		}
	});
}

// ========== Initialize Script ==========

setupEventListeners();
