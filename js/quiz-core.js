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
    kanji: "",
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
let useSrsFilter = false; // Track if SRS filtering is enabled for this quiz
let cachedQuizSubjects = new Map(); // Cache for visually similar kanji

// Cross-mode validation tracking
let userInputHistory = new Map(); // Track user input for each kanji in both modes
let currentKanji = null; // Track current kanji for cross-mode validation

// Track individual question performance when both modes are enabled
let correctQuestions = new Set(); // Track which specific questions were answered correctly
let incorrectQuestions = new Set(); // Track which specific questions were answered incorrectly

function normalize(str) {
    return (str || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Shuffle function now uses shared shuffleArray() from common-utils.js
function shuffle(a) {
    return shuffleArray(a);
}

async function prefetchQuizRelatedSubjects(items, token) {
    // Collect all unique subject IDs for visually similar kanji
    const allSubjectIds = new Set();

    for (const item of items) {
        // Add visually similar subject IDs
        if (item.visually_similar_subject_ids) {
            item.visually_similar_subject_ids.forEach((id) =>
                allSubjectIds.add(id)
            );
        }
    }

    // Fetch all subjects at once if there are any
    if (allSubjectIds.size > 0) {
        try {
            const subjects = await fetchSubjectsByIds(
                token,
                Array.from(allSubjectIds)
            );
            // Store in cache by ID
            subjects.forEach((subject) => {
                cachedQuizSubjects.set(subject.id, subject);
            });
        } catch (error) {
            console.error("Error prefetching visually similar kanji:", error);
        }
    }
}

async function startQuiz(items, token) {
    allKanjiData = items.slice(); // Store all kanji data
    // Store for "Try Again" functionality
    if (typeof lastQuizItems !== "undefined") {
        lastQuizItems = items.slice();
    }
    currentIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    correctKanji.clear();
    incorrectKanji.clear();
    correctQuestions.clear();
    incorrectQuestions.clear();
    cachedQuizSubjects.clear();
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("quizArea").classList.remove("hidden");
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("answer").value = "";

    // Show loading skeleton initially
    document.getElementById("quizLoadingSkeleton").classList.remove("hidden");
    document.getElementById("question").classList.add("hidden");

    modeKanjiToEnglish = document.getElementById("modeToggle").checked;
    readingMode = document.getElementById("readingToggle").checked;
    modeEnglishToKanji = document.getElementById(
        "modeEnglishToKanjiToggle"
    ).checked;
    useSrsFilter = document.getElementById("srsFilterToggle").checked;

    // Prefetch all visually similar kanji before starting the quiz
    if (token) {
        await prefetchQuizRelatedSubjects(items, token);
    }

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
    if (modeKanjiToEnglish) {
        selectedModes.push("Kanji → English Meaning");
    }
    if (readingMode) {
        selectedModes.push("Kanji → Japanese Reading");
    }
    if (modeEnglishToKanji) {
        selectedModes.push("English Meaning → Japanese Reading");
    }

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

    // Hide loading skeleton and show question
    document.getElementById("quizLoadingSkeleton").classList.add("hidden");
    document.getElementById("question").classList.remove("hidden");

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
    if (awaitingContinue) {
        return;
    } // don't allow checking while waiting
    const card = queue[currentIndex];
    if (!card) {
        return;
    }
    const raw = document.getElementById("answer").value;
    if (!raw.trim()) {
        return;
    }

    let ok = false;
    let hasTypo = false; // Track if answer was close to correct

    if (card.questionType === "kanji-to-reading") {
        // Input field already contains hiragana, check directly against readings
        for (const reading of card.readings) {
            if (raw.trim() === reading) {
                ok = true;
                break;
            }
        }
    } else if (card.questionType === "kanji-to-english") {
        // Use shared validation helper
        const validationResult = validateAnswer(raw, card.meanings, true);
        ok = validationResult.isCorrect;
        hasTypo = validationResult.hasTypo;
    } else if (card.questionType === "english-to-kanji") {
        if (raw.trim() === card.kanji) {
            ok = true;
        }
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
            let feedbackMessage = `<strong>Wrong mode!</strong> You entered the correct ${escapeHtml(
                modeText
            )} (${escapeHtml(
                crossModeCheck.correctAnswer
            )}) but this question asks for the ${escapeHtml(currentModeText)}.`;

            // Add romanji hint if it's a reading question
            if (
                card.questionType === "kanji-to-reading" &&
                crossModeCheck.otherMode === "reading"
            ) {
                const romanjiHint = hiraganaToRomanji(
                    crossModeCheck.correctAnswer
                );
                feedbackMessage += `<br><small>Hint: Try typing "${escapeHtml(
                    romanjiHint
                )}" for the reading.</small>`;
            }

            const resultElement = document.getElementById("result");
            if (resultElement) {
                resultElement.innerHTML = feedbackMessage;
            }
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
        if (hasTypo) {
            showToast("Correct! (Watch out for typos)", "info");
        } else {
            showToast("Correct! Well done!", "success");
        }

        // Track this kanji as answered correctly
        correctKanji.add(card.kanji);

        // Track individual question performance when multiple modes are enabled
        const { isMultiMode } = getQuizModeInfo();

        if (isMultiMode) {
            // Create a unique identifier for this specific question
            const questionId = `${card.kanji}-${card.questionType}`;
            // Only mark as correct if it was never marked incorrect
            if (!incorrectQuestions.has(questionId)) {
                correctQuestions.add(questionId);
            }
        } else if (!incorrectKanji.has(card.kanji)) {
            correctCount++;
        }

        const resultElement = document.getElementById("result");
        if (resultElement) {
            resultElement.innerHTML = "✅ <strong>Correct!</strong>";
            resultElement.className = "mb-4 text-success";
            resultElement.classList.remove("hidden");
        }
        // remove card from queue
        queue.splice(currentIndex, 1);
        if (currentIndex >= queue.length) {
            currentIndex = 0;
        }
        if (queue.length === 0) {
            showCompletionScreen();
            return;
        }
        showCard();
    } else {
        // Track this kanji as answered incorrectly
        incorrectKanji.add(card.kanji);

        // Track individual question performance when multiple modes are enabled
        const { isMultiMode } = getQuizModeInfo();

        if (isMultiMode) {
            // Create a unique identifier for this specific question
            const questionId = `${card.kanji}-${card.questionType}`;
            // Mark as incorrect - once incorrect, always incorrect
            incorrectQuestions.add(questionId);
        }

        // show correct answer and wait for user to continue
        const resultElement2 = document.getElementById("result");
        if (resultElement2) {
            resultElement2.innerHTML = "❌ <strong>Incorrect</strong>";
            resultElement2.className = "mb-4 text-error";
            resultElement2.classList.remove("hidden");
        }

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
        const correctBoxElement = document.getElementById("correctBox");
        if (correctBoxElement) {
            let correctBoxHTML =
                "<strong>Correct:</strong> " +
                escapeHtml(correctText) +
                `<br><a href="${escapeHtml(
                    wanikaniUrl
                )}" target="_blank" class="link link-primary text-sm mt-2 inline-block">View on WaniKani →</a>`;

            // Add mnemonic based on question type
            let mnemonicToShow = "";
            if (
                card.questionType === "kanji-to-reading" ||
                card.questionType === "english-to-reading-or-kanji"
            ) {
                // For reading questions, show reading mnemonic
                mnemonicToShow = card.reading_mnemonic;
            } else if (card.questionType === "kanji-to-english") {
                // For meaning questions, show meaning mnemonic
                mnemonicToShow = card.meaning_mnemonic;
            }

            if (mnemonicToShow) {
                // Sanitize the HTML to allow safe tags like <radical>, <kanji>, <vocabulary>
                const sanitizedMnemonic = DOMPurify.sanitize(mnemonicToShow, {
                    ALLOWED_TAGS: [
                        "radical",
                        "kanji",
                        "vocabulary",
                        "reading",
                        "ja",
                        "br",
                        "p",
                        "strong",
                        "em",
                        "b",
                        "i",
                    ],
                    ALLOWED_ATTR: [],
                });

                correctBoxHTML += `<div class="mt-3 pt-3 border-t border-base-300">
                    <strong>Mnemonic:</strong>
                    <div class="mt-2 text-sm text-base-content/80 leading-relaxed">${sanitizedMnemonic}</div>
                </div>`;
            }

            // Add visually similar kanji if available
            if (
                card.visually_similar_subject_ids &&
                card.visually_similar_subject_ids.length > 0
            ) {
                const similarKanji = card.visually_similar_subject_ids
                    .map((id) => cachedQuizSubjects.get(id))
                    .filter((subject) => subject !== undefined);

                if (similarKanji.length > 0) {
                    // Determine if we should show readings or meanings
                    const showReadings =
                        card.questionType === "kanji-to-reading" ||
                        card.questionType === "english-to-reading-or-kanji";

                    correctBoxHTML += `<div class="mt-3 pt-3 border-t border-base-300">
                        <strong class="text-info">Visually Similar:</strong>
                        <div class="flex flex-wrap gap-2 mt-2">`;

                    similarKanji.forEach((k) => {
                        // Show readings if in reading mode, otherwise show meanings
                        const displayText = showReadings
                            ? k.readings.join(", ")
                            : k.meanings.join(", ");

                        correctBoxHTML += `
                            <div class="flex flex-col items-center p-2 bg-base-300 rounded-lg text-xs" title="${escapeHtml(
                                displayText
                            )}">
                                <span class="text-xl mb-1">${escapeHtml(
                                    k.kanji
                                )}</span>
                                <span class="text-xs text-base-content/70">${escapeHtml(
                                    displayText
                                )}</span>
                            </div>`;
                    });

                    correctBoxHTML += `</div></div>`;
                }
            }

            correctBoxElement.innerHTML = correctBoxHTML;
        }
        document.getElementById("correctBox").classList.remove("hidden");
        // move wrong card to end (so it will reappear later)
        const c = queue.splice(currentIndex, 1)[0];
        queue.push(c);
        if (currentIndex >= queue.length) {
            currentIndex = 0;
        }
        // disable input until continue
        document.getElementById("answer").disabled = true;
        document.getElementById("checkBtn").disabled = true;
        document.getElementById("continueBtn").classList.remove("hidden");
        awaitingContinue = true;
    }
}
