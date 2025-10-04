// WaniKanji - Core Quiz Logic

// Color Configuration
const COLOR_CONFIG = {
    // Kanji Meaning mode colors
    meaning: {
        checkbox: "checkbox-success",
        modeLabel: "bg-success text-success-content",
    },
    // Kanji Reading mode colors
    reading: {
        checkbox: "checkbox-primary",
        modeLabel: "bg-primary text-primary-content",
    },
    // Kanji character color
    kanji: "text-white",
};

// Global quiz state
let queue = [];
let currentIndex = 0;
let modeKanjiToEnglish = true; // default
let readingMode = false; // Track if we're in reading mode
let modeEnglishToKanji = false; // Track if we're in English Meaning → Japanese Reading mode
let awaitingContinue = false;
let correctCount = 0;
let incorrectCount = 0;
let originalQueueLength = 0;
let correctKanji = new Set(); // Track which kanji were answered correctly first time
let incorrectKanji = new Set(); // Track which kanji were answered incorrectly
let allKanjiData = []; // Store all kanji data for reference

// Cross-mode validation tracking
let userInputHistory = new Map(); // Track user input for each kanji in both modes
let currentKanji = null; // Track current kanji for cross-mode validation

// Track individual question performance when both modes are enabled
let correctQuestions = new Set(); // Track which specific questions were answered correctly
let incorrectQuestions = new Set(); // Track which specific questions were answered incorrectly

function normalize(str) {
    return (str || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function startQuiz(items) {
    allKanjiData = items.slice(); // Store all kanji data
    currentIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    correctKanji.clear();
    incorrectKanji.clear();
    correctQuestions.clear();
    incorrectQuestions.clear();
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("quizArea").classList.remove("hidden");
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("answer").value = "";

    modeKanjiToEnglish = document.getElementById("modeToggle").checked;
    readingMode = document.getElementById("readingToggle").checked;
    modeEnglishToKanji = document.getElementById(
        "modeEnglishToKanjiToggle"
    ).checked;

    // Create queue based on selected modes
    queue = [];

    // Add questions for each selected mode
    for (const item of items) {
        if (modeKanjiToEnglish) {
            // Add kanji-to-English question
            queue.push({
                ...item,
                questionType: "kanji-to-english",
            });
        }

        if (readingMode) {
            // Add kanji-to-reading question
            queue.push({
                ...item,
                questionType: "kanji-to-reading",
            });
        }

        if (modeEnglishToKanji) {
            // Add English Meaning → Japanese Reading question
            queue.push({
                ...item,
                questionType: "english-to-reading-or-kanji",
            });
        }
    }

    // If no modes are selected, default to kanji-to-english mode
    if (queue.length === 0) {
        queue = items.map((item) => ({
            ...item,
            questionType: "kanji-to-english",
        }));
    }

    queue = shuffle(queue);
    originalQueueLength = queue.length;

    // Update mode label based on current settings
    const selectedModes = [];
    if (modeKanjiToEnglish) selectedModes.push("Kanji → English Meaning");
    if (readingMode) selectedModes.push("Kanji → Japanese Reading");
    if (modeEnglishToKanji)
        selectedModes.push("English Meaning → Japanese Reading");

    if (selectedModes.length === 0) {
        document.getElementById("modeLabel").textContent =
            "Mode: Kanji → English Meaning";
    } else if (selectedModes.length === 1) {
        document.getElementById(
            "modeLabel"
        ).textContent = `Mode: ${selectedModes[0]}`;
    } else {
        document.getElementById(
            "modeLabel"
        ).textContent = `Mode: ${selectedModes.join(" & ")}`;
    }
    updateProgress();
    showCard();
}

function updateProgress() {
    document.getElementById(
        "progress"
    ).textContent = `${queue.length} remaining`;
}

function showCard() {
    awaitingContinue = false;
    document.getElementById("continueBtn").classList.add("hidden");
    document.getElementById("result").classList.add("hidden");
    document.getElementById("correctBox").classList.add("hidden");
    document.getElementById("answer").disabled = false;
    document.getElementById("checkBtn").disabled = false;

    updateProgress();
    const card = queue[currentIndex];
    if (!card) {
        document.getElementById("kanjiDisplay").textContent = "";
        document.getElementById("meaningDisplay").textContent = "Done!";
        return;
    }

    // Track current kanji for cross-mode validation
    currentKanji = card.kanji;

    // Handle different question types
    if (card.questionType === "kanji-to-reading") {
        document.getElementById("kanjiDisplay").textContent = card.kanji;
        document.getElementById("meaningDisplay").textContent = "";
        document.getElementById("answer").placeholder = "答えを入力してくだ";

        // Show mode label if multiple modes are selected
        if (
            (modeKanjiToEnglish && readingMode) ||
            (modeKanjiToEnglish && modeEnglishToKanji) ||
            (readingMode && modeEnglishToKanji) ||
            (modeKanjiToEnglish && readingMode && modeEnglishToKanji)
        ) {
            document.getElementById("modeLabelUnderKanji").textContent =
                "Kanji Reading";
            document.getElementById(
                "modeLabelUnderKanji"
            ).className = `text-sm font-medium px-3 py-1 rounded-full inline-block mb-2 ${COLOR_CONFIG.reading.modeLabel}`;
            document
                .getElementById("modeLabelUnderKanji")
                .classList.remove("hidden");
        } else {
            document
                .getElementById("modeLabelUnderKanji")
                .classList.add("hidden");
        }
    } else if (card.questionType === "kanji-to-english") {
        document.getElementById("kanjiDisplay").textContent = card.kanji;
        document.getElementById("meaningDisplay").textContent = "";
        document.getElementById("answer").placeholder =
            "Please enter your answer";

        // Show mode label if multiple modes are selected
        if (
            (modeKanjiToEnglish && readingMode) ||
            (modeKanjiToEnglish && modeEnglishToKanji) ||
            (readingMode && modeEnglishToKanji) ||
            (modeKanjiToEnglish && readingMode && modeEnglishToKanji)
        ) {
            document.getElementById("modeLabelUnderKanji").textContent =
                "Kanji Meaning";
            document.getElementById(
                "modeLabelUnderKanji"
            ).className = `text-sm font-medium px-3 py-1 rounded-full inline-block mb-2 ${COLOR_CONFIG.meaning.modeLabel}`;
            document
                .getElementById("modeLabelUnderKanji")
                .classList.remove("hidden");
        } else {
            document
                .getElementById("modeLabelUnderKanji")
                .classList.add("hidden");
        }
    } else if (card.questionType === "english-to-kanji") {
        document.getElementById("kanjiDisplay").textContent = "";
        const m = card.meanings[0] || "";
        document.getElementById("meaningDisplay").textContent = m;
        document.getElementById("answer").placeholder =
            "Type the kanji character(s)";
        document.getElementById("modeLabelUnderKanji").classList.add("hidden");
    } else if (card.questionType === "english-to-reading-or-kanji") {
        // English Meaning → Japanese Reading mode - show English meaning
        const m = card.meanings[0] || "";
        document.getElementById("kanjiDisplay").textContent = m;
        document.getElementById("meaningDisplay").textContent = "";
        document.getElementById("answer").placeholder = "答えを入力してくだ";
        document.getElementById("modeLabelUnderKanji").classList.add("hidden");
    }
    document.getElementById("answer").value = "";
    document.getElementById("answer").focus();
}

function checkAnswer() {
    if (awaitingContinue) return; // don't allow checking while waiting
    const card = queue[currentIndex];
    if (!card) return;
    const raw = document.getElementById("answer").value;
    if (!raw.trim()) return;

    let ok = false;

    if (card.questionType === "kanji-to-reading") {
        // Input field already contains hiragana, check directly against readings
        for (const reading of card.readings) {
            if (raw.trim() === reading) {
                ok = true;
                break;
            }
        }
    } else if (card.questionType === "kanji-to-english") {
        const got = normalize(raw);
        for (const m of card.meanings) {
            if (normalize(m) === got) {
                ok = true;
                break;
            }
        }
    } else if (card.questionType === "english-to-kanji") {
        if (raw.trim() === card.kanji) ok = true;
    } else if (card.questionType === "english-to-reading-or-kanji") {
        // English Meaning → Japanese Reading mode - accept either reading or kanji
        // Check if it matches the kanji character
        if (raw.trim() === card.kanji) {
            ok = true;
        } else {
            // Check if it matches any of the readings
            for (const reading of card.readings) {
                if (raw.trim() === reading) {
                    ok = true;
                    break;
                }
            }
        }
    }

    // If answer is incorrect, check for cross-mode validation
    if (!ok) {
        const crossModeCheck = checkCrossModeValidation(card, raw);
        if (crossModeCheck && crossModeCheck.isCorrectInOtherMode) {
            // User entered correct answer but in wrong mode
            const modeText =
                crossModeCheck.otherMode === "reading" ? "reading" : "meaning";
            const currentModeText =
                card.questionType === "kanji-to-english"
                    ? "meaning"
                    : "reading";

            showToast(
                `That's correct for the ${modeText}! Try again with the right mode.`,
                "warning"
            );

            // Store the user input for this kanji in the opposite mode
            if (!userInputHistory.has(card.kanji)) {
                userInputHistory.set(card.kanji, {});
            }
            const kanjiHistory = userInputHistory.get(card.kanji);
            kanjiHistory[crossModeCheck.otherMode] = raw;

            // Show feedback and let user try again
            let feedbackMessage = `<strong>Wrong mode!</strong> You entered the correct ${modeText} (${crossModeCheck.correctAnswer}) but this question asks for the ${currentModeText}.`;

            // Add romanji hint if it's a reading question
            if (
                card.questionType === "kanji-to-reading" &&
                crossModeCheck.otherMode === "reading"
            ) {
                const romanjiHint = hiraganaToRomanji(
                    crossModeCheck.correctAnswer
                );
                feedbackMessage += `<br><small>Hint: Try typing "${romanjiHint}" for the reading.</small>`;
            }

            document.getElementById("result").innerHTML = feedbackMessage;
            document.getElementById("result").className = "mb-4 text-warning";
            document.getElementById("result").classList.remove("hidden");

            // Clear the input and let them try again
            document.getElementById("answer").value = "";
            document.getElementById("answer").focus();
            return;
        }
    }

    // Check for romanji characters in the input (incomplete romanji)
    if (card.questionType === "kanji-to-reading" && !ok) {
        const romanjiRegex = /[a-zA-Z]/;
        if (romanjiRegex.test(raw)) {
            showToast("Please correct your answer!", "error");
            return; // Don't submit the answer
        }
    }

    if (ok) {
        // Show toast notification for correct answer
        showToast("Correct! Well done!", "success");

        // Track this kanji as answered correctly
        correctKanji.add(card.kanji);

        // Track individual question performance when multiple modes are enabled
        const modesCount =
            (modeKanjiToEnglish ? 1 : 0) +
            (readingMode ? 1 : 0) +
            (modeEnglishToKanji ? 1 : 0);
        const isMultiMode = modesCount > 1;

        if (isMultiMode) {
            // Create a unique identifier for this specific question
            const questionId = `${card.kanji}-${card.questionType}`;
            // Only mark as correct if it was never marked incorrect
            if (!incorrectQuestions.has(questionId)) {
                correctQuestions.add(questionId);
            }
        } else {
            // For single mode, use the original logic
            if (!incorrectKanji.has(card.kanji)) {
                correctCount++;
            }
        }

        document.getElementById("result").innerHTML =
            "✅ <strong>Correct!</strong>";
        document.getElementById("result").className = "mb-4 text-success";
        document.getElementById("result").classList.remove("hidden");
        // remove card from queue
        queue.splice(currentIndex, 1);
        if (currentIndex >= queue.length) currentIndex = 0;
        if (queue.length === 0) {
            showCompletionScreen();
            return;
        }
        showCard();
    } else {
        // Track this kanji as answered incorrectly
        incorrectKanji.add(card.kanji);

        // Track individual question performance when multiple modes are enabled
        const modesCount =
            (modeKanjiToEnglish ? 1 : 0) +
            (readingMode ? 1 : 0) +
            (modeEnglishToKanji ? 1 : 0);
        const isMultiMode = modesCount > 1;

        if (isMultiMode) {
            // Create a unique identifier for this specific question
            const questionId = `${card.kanji}-${card.questionType}`;
            // Mark as incorrect - once incorrect, always incorrect
            incorrectQuestions.add(questionId);
        }

        // show correct answer and wait for user to continue
        document.getElementById("result").innerHTML =
            "❌ <strong>Incorrect</strong>";
        document.getElementById("result").className = "mb-4 text-error";
        document.getElementById("result").classList.remove("hidden");
        let correctText;
        if (card.questionType === "kanji-to-reading") {
            correctText = card.readings.join(", ");
        } else if (card.questionType === "kanji-to-english") {
            correctText = card.meanings.join(", ");
        } else if (card.questionType === "english-to-kanji") {
            correctText = card.kanji;
        } else if (card.questionType === "english-to-reading-or-kanji") {
            correctText = `${card.kanji} or ${card.readings.join(", ")}`;
        }
        // show it in a visible box with WaniKani link
        const wanikaniUrl = `https://www.wanikani.com/kanji/${encodeURIComponent(
            card.kanji
        )}`;
        document.getElementById("correctBox").innerHTML =
            "<strong>Correct:</strong> " +
            correctText +
            `<br><a href="${wanikaniUrl}" target="_blank" class="link link-primary text-sm mt-2 inline-block">View on WaniKani →</a>`;
        document.getElementById("correctBox").classList.remove("hidden");
        // move wrong card to end (so it will reappear later)
        const c = queue.splice(currentIndex, 1)[0];
        queue.push(c);
        if (currentIndex >= queue.length) currentIndex = 0;
        // disable input until continue
        document.getElementById("answer").disabled = true;
        document.getElementById("checkBtn").disabled = true;
        document.getElementById("continueBtn").classList.remove("hidden");
        awaitingContinue = true;
    }
}
