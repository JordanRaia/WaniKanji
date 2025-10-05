// WaniKanji - UI Utilities

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use this for plain text content and HTML attributes
 */
function escapeHtml(text) {
    if (text === null || text === undefined) {
        return "";
    }
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitizes HTML content using DOMPurify
 * Use this when you need to preserve safe HTML formatting
 */
function sanitizeHtml(html) {
    if (html === null || html === undefined) {
        return "";
    }
    return DOMPurify.sanitize(html);
}

/**
 * Safely sets innerHTML with sanitization
 * Returns true if element exists and was set, false otherwise
 */
function safeSetInnerHTML(element, content, useSanitize = true) {
    if (!element) {
        console.warn("Element not found for safeSetInnerHTML");
        return false;
    }
    if (useSanitize) {
        element.innerHTML = sanitizeHtml(content);
    } else {
        element.textContent = content;
    }
    return true;
}

// Toast notification function
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        console.warn("Toast container not found");
        return;
    }

    const toastId = "toast-" + Date.now();
    const escapedMessage = escapeHtml(message);
    const escapedType = escapeHtml(type);

    const toastHTML = `
        <div id="${toastId}" class="alert alert-${escapedType}">
            <span>${escapedMessage}</span>
        </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    // Auto remove after 2 seconds
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.remove();
        }
    }, 2000);
}

// Apply color configuration to elements
function applyColorConfig() {
    // Apply checkbox colors
    const meaningCheckbox = document.getElementById("modeToggle");
    const readingCheckbox = document.getElementById("readingToggle");

    if (meaningCheckbox) {
        meaningCheckbox.className = `checkbox ${COLOR_CONFIG.meaning.checkbox}`;
    }
    if (readingCheckbox) {
        readingCheckbox.className = `checkbox ${COLOR_CONFIG.reading.checkbox}`;
    }

    // Apply kanji color
    const kanjiDisplay = document.getElementById("kanjiDisplay");
    if (kanjiDisplay) {
        kanjiDisplay.className = `text-6xl sm:text-7xl lg:text-9xl text-center my-2.5 break-words ${COLOR_CONFIG.kanji}`;
    }
}

function showCompletionScreen() {
    document.getElementById("quizArea").classList.add("hidden");
    document.getElementById("completionArea").classList.remove("hidden");

    // Check if multiple modes are enabled, use question-based tracking
    const modesCount =
        (modeKanjiToEnglish ? 1 : 0) +
        (readingMode ? 1 : 0) +
        (modeEnglishToKanji ? 1 : 0);
    const isMultiMode = modesCount > 1;

    if (isMultiMode) {
        correctCount = correctQuestions.size;
        incorrectCount = incorrectQuestions.size;
    } else {
        // For single mode, use the existing logic
        incorrectCount = incorrectKanji.size;
    }

    // Update the completion screen with stats
    document.getElementById("totalQuestions").textContent = originalQueueLength;
    document.getElementById("correctAnswers").textContent = correctCount;
    document.getElementById("incorrectAnswers").textContent = incorrectCount;

    // Display correct and incorrect kanji
    displayKanjiResults();

    // Show confetti if all answers were correct
    if (incorrectCount === 0 && correctCount > 0) {
        triggerConfetti();
    }
}

function triggerConfetti() {
    // Get the position of the quiz complete card
    const completionCard = document.querySelector("#completionArea .card");
    const rect = completionCard.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

    // Create a burst of confetti from the card
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: x, y: y },
    });

    // Add a second burst after a short delay
    setTimeout(() => {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: x, y: y },
        });
    }, 200);

    // Add a third burst for extra celebration
    setTimeout(() => {
        confetti({
            particleCount: 75,
            spread: 80,
            origin: { x: x, y: y },
        });
    }, 400);
}

function displayKanjiResults() {
    const correctKanjiList = document.getElementById("correctKanjiList");
    const incorrectKanjiList = document.getElementById("incorrectKanjiList");

    // Check if multiple modes are selected
    const modesCount =
        (modeKanjiToEnglish ? 1 : 0) +
        (readingMode ? 1 : 0) +
        (modeEnglishToKanji ? 1 : 0);
    const isMultiMode = modesCount > 1;

    if (isMultiMode) {
        // Display individual questions for multi-mode - separate meaning, reading, and english to kanji
        // Filter correct questions: only show if never marked incorrect
        const correctQuestionsArray = Array.from(correctQuestions).filter(
            (qId) => !incorrectQuestions.has(qId)
        );
        const incorrectQuestionsArray = Array.from(incorrectQuestions);

        // Display correct questions
        if (correctQuestionsArray.length > 0) {
            correctKanjiList.innerHTML = correctQuestionsArray
                .map((questionId) => {
                    const parts = questionId.split("-");
                    const kanji = parts[0];
                    const questionType = parts.slice(1).join("-");
                    const kanjiData = allKanjiData.find(
                        (k) => k.kanji === kanji
                    );

                    if (questionType === "kanji-to-english") {
                        const meanings = kanjiData
                            ? kanjiData.meanings.join(", ")
                            : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-success/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(kanji)}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                meanings
                            )}</span>
                        </div>`;
                    } else if (questionType === "kanji-to-reading") {
                        const readings = kanjiData
                            ? kanjiData.readings.join(", ")
                            : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-success/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(kanji)}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                readings
                            )}</span>
                        </div>`;
                    } else if (questionType === "english-to-reading-or-kanji") {
                        const meaning =
                            kanjiData && kanjiData.meanings[0]
                                ? kanjiData.meanings[0]
                                : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-success/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(
                                meaning
                            )}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                kanji
                            )}</span>
                        </div>`;
                    }
                })
                .join("");
        } else {
            correctKanjiList.innerHTML =
                '<div class="text-base-content/50 italic text-sm">No questions answered correctly</div>';
        }

        // Display incorrect questions
        if (incorrectQuestionsArray.length > 0) {
            incorrectKanjiList.innerHTML = incorrectQuestionsArray
                .map((questionId) => {
                    const parts = questionId.split("-");
                    const kanji = parts[0];
                    const questionType = parts.slice(1).join("-");
                    const kanjiData = allKanjiData.find(
                        (k) => k.kanji === kanji
                    );

                    if (questionType === "kanji-to-english") {
                        const meanings = kanjiData
                            ? kanjiData.meanings.join(", ")
                            : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-error/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(kanji)}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                meanings
                            )}</span>
                        </div>`;
                    } else if (questionType === "kanji-to-reading") {
                        const readings = kanjiData
                            ? kanjiData.readings.join(", ")
                            : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-error/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(kanji)}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                readings
                            )}</span>
                        </div>`;
                    } else if (questionType === "english-to-reading-or-kanji") {
                        const meaning =
                            kanjiData && kanjiData.meanings[0]
                                ? kanjiData.meanings[0]
                                : "";
                        return `<div class="inline-block mr-2 mb-1 p-1 bg-error/20 rounded text-xs">
                            <span class="font-bold">${escapeHtml(
                                meaning
                            )}</span>
                            <span class="text-base-content/70"> ${escapeHtml(
                                kanji
                            )}</span>
                        </div>`;
                    }
                })
                .join("");
        } else {
            incorrectKanjiList.innerHTML =
                '<div class="text-base-content/50 italic text-sm">All questions answered correctly!</div>';
        }
    } else {
        // Single mode
        const correctKanjiArray = Array.from(correctKanji);
        const incorrectKanjiArray = Array.from(incorrectKanji);

        // Display correct kanji
        if (correctKanjiArray.length > 0) {
            correctKanjiList.innerHTML = correctKanjiArray
                .map((kanji) => {
                    const kanjiData = allKanjiData.find(
                        (k) => k.kanji === kanji
                    );
                    const meanings = kanjiData
                        ? kanjiData.meanings.join(", ")
                        : "";
                    const readings = kanjiData
                        ? kanjiData.readings.join(", ")
                        : "";
                    return `<div class="inline-block mr-2 mb-1 p-1 bg-success/20 rounded text-xs">
                        <span class="font-bold">${escapeHtml(kanji)}</span>
                        <span class="text-base-content/70">${escapeHtml(
                            meanings
                        )}</span>
                        ${
                            readings
                                ? `<br><span class="text-base-content/60 text-xs">${escapeHtml(
                                      readings
                                  )}</span>`
                                : ""
                        }
                    </div>`;
                })
                .join("");
        } else {
            correctKanjiList.innerHTML =
                '<div class="text-base-content/50 italic text-sm">No kanji answered correctly on first try</div>';
        }

        // Display incorrect kanji
        if (incorrectKanjiArray.length > 0) {
            incorrectKanjiList.innerHTML = incorrectKanjiArray
                .map((kanji) => {
                    const kanjiData = allKanjiData.find(
                        (k) => k.kanji === kanji
                    );
                    const meanings = kanjiData
                        ? kanjiData.meanings.join(", ")
                        : "";
                    const readings = kanjiData
                        ? kanjiData.readings.join(", ")
                        : "";
                    return `<div class="inline-block mr-2 mb-1 p-1 bg-error/20 rounded text-xs">
                        <span class="font-bold">${escapeHtml(kanji)}</span>
                        <span class="text-base-content/70">${escapeHtml(
                            meanings
                        )}</span>
                        ${
                            readings
                                ? `<br><span class="text-base-content/60 text-xs">${escapeHtml(
                                      readings
                                  )}</span>`
                                : ""
                        }
                    </div>`;
                })
                .join("");
        } else {
            incorrectKanjiList.innerHTML =
                '<div class="text-base-content/50 italic text-sm">All kanji answered correctly!</div>';
        }
    }
}
