// WaniKanji - Learn Mode Core Logic

// Global state for Learn Mode
let learnKanjiMode = false; // Track if in learn mode
let learnKanjiPool = []; // All kanji user selected to learn
let currentLearnBatch = []; // Current batch of 5
let learnedKanji = []; // All previously learned kanji (from completed batches)
let currentBatchIndex = 0; // Which batch we're on (0-based)
let learnKanjiApiToken = ""; // API token for lessons
let learnSelectionScreenKanjiItems = []; // Items loaded for selection screen

// Constants
const BATCH_SIZE = 5;

/**
 * Shows the Learn Mode selection screen
 */
function showLearnKanjiSelectionScreen(items) {
    document.getElementById("setup").classList.add("hidden");
    document
        .getElementById("learnKanjiSelectionArea")
        .classList.remove("hidden");

    const kanjiGrid = document.getElementById("learnKanjiGrid");
    const totalKanjiCount = document.getElementById("learnKanjiTotalCount");

    // Clear existing grid
    kanjiGrid.innerHTML = "";

    // Set total count
    totalKanjiCount.textContent = items.length;

    // Reset randomize checkbox to unchecked
    document.getElementById("learnRandomizeOrderToggle").checked = false;

    // Store the original items before any sorting/randomization (for toggle re-sorting)
    learnSelectionScreenKanjiItems = items;

    // Sort items by rank (SRS stage) or randomize based on checkbox
    const randomizeOrder = document.getElementById(
        "learnRandomizeOrderToggle"
    ).checked;
    const sortedItems = randomizeOrder
        ? randomizeKanjiOrder(items)
        : sortKanjiByRank(items);

    // Store the displayed items (for starting learn mode in this order)
    window.learnDisplayedKanjiItems = sortedItems;

    // Create checkboxes for each kanji
    sortedItems.forEach((item) => {
        const kanjiItem = createKanjiSelectionItem(
            item,
            "learn-kanji-checkbox",
            window.cachedKanjiData
        );
        kanjiGrid.appendChild(kanjiItem);
    });

    // Update selected count
    updateLearnKanjiSelectedCount();

    // Add event listeners to checkboxes
    document.querySelectorAll(".learn-kanji-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", updateLearnKanjiSelectedCount);
    });

    // Populate stage filter checkboxes AFTER kanji checkboxes are created
    populateStageFilters(
        items,
        "learnStageFilters",
        ".learn-kanji-checkbox",
        updateLearnKanjiSelectedCount
    );

    // Add event listener to randomization checkbox
    document
        .getElementById("learnRandomizeOrderToggle")
        .addEventListener("change", () => {
            // Re-sort and re-render the kanji grid
            const randomizeOrder = document.getElementById(
                "learnRandomizeOrderToggle"
            ).checked;
            const sortedItems = randomizeOrder
                ? randomizeKanjiOrder(learnSelectionScreenKanjiItems)
                : sortKanjiByRank(learnSelectionScreenKanjiItems);

            // Clear and re-populate the grid
            const kanjiGrid = document.getElementById("learnKanjiGrid");
            kanjiGrid.innerHTML = "";

            sortedItems.forEach((item) => {
                const kanjiItem = createKanjiSelectionItem(
                    item,
                    "learn-kanji-checkbox",
                    window.cachedKanjiData
                );
                kanjiGrid.appendChild(kanjiItem);
            });

            // Re-add event listeners to new checkboxes
            document
                .querySelectorAll(".learn-kanji-checkbox")
                .forEach((checkbox) => {
                    checkbox.addEventListener(
                        "change",
                        updateLearnKanjiSelectedCount
                    );
                });

            // Update selected count
            updateLearnKanjiSelectedCount();

            // Store the newly displayed items
            window.learnDisplayedKanjiItems = sortedItems;
        });
}

/**
 * Updates the selected count for Learn Mode selection screen
 */
function updateLearnKanjiSelectedCount() {
    const checked = document.querySelectorAll(".learn-kanji-checkbox:checked");
    document.getElementById("learnKanjiSelectedCount").textContent =
        checked.length;

    // Disable start button if no kanji selected
    const startBtn = document.getElementById("startLearnKanjiBtn");
    startBtn.disabled = checked.length === 0;
}

/**
 * Initializes Learn Mode with selected kanji
 */
async function initializeLearnKanjiMode(selectedItems, token) {
    learnKanjiMode = true;
    learnKanjiPool = selectedItems.slice();
    learnedKanji = [];
    currentBatchIndex = 0;
    learnKanjiApiToken = token;

    // Calculate first batch
    const startIdx = 0;
    const endIdx = Math.min(BATCH_SIZE, selectedItems.length);
    currentLearnBatch = learnKanjiPool.slice(startIdx, endIdx);

    // Start lessons immediately for the first batch
    await startLessons(currentLearnBatch, learnKanjiApiToken);
}

/**
 * Shows the Learn Mode Progress screen (between batches)
 */
function showLearnModeProgressScreen() {
    // Hide all other areas
    hideAllAreas();
    document.getElementById("learnModeProgressArea").classList.remove("hidden");

    // Calculate current batch
    const totalKanji = learnKanjiPool.length;
    const totalBatches = Math.ceil(totalKanji / BATCH_SIZE);
    const currentBatchNum = currentBatchIndex + 1;

    // Get current batch kanji
    const startIdx = currentBatchIndex * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, totalKanji);
    currentLearnBatch = learnKanjiPool.slice(startIdx, endIdx);

    const batchSize = currentLearnBatch.length;
    const alreadyLearned = learnedKanji.length;
    const remaining = totalKanji - alreadyLearned; // Includes current batch

    // Update UI
    document.getElementById(
        "learnCurrentBatch"
    ).textContent = `${currentBatchNum} / ${totalBatches}`;
    document.getElementById(
        "learnBatchInfo"
    ).textContent = `${batchSize} kanji in this batch`;
    document.getElementById("learnAlreadyLearned").textContent = alreadyLearned;
    document.getElementById("learnRemaining").textContent = remaining;
    document.getElementById("learnBatchSize").textContent = batchSize;
}

/**
 * Starts lessons for the current batch
 */
async function startLearnBatchLessons() {
    // Hide the progress screen
    document.getElementById("learnModeProgressArea").classList.add("hidden");

    // Use the existing startLessons function but track that we're in learn mode
    await startLessons(currentLearnBatch, learnKanjiApiToken);
}

/**
 * Called when lessons are complete in learn mode
 * Shows option to quiz or review lessons
 */
function onLearnLessonsComplete() {
    // Override the default lesson completion behavior
    // Show lesson completion screen with quiz option
    document.getElementById("lessonArea").classList.add("hidden");
    document.getElementById("lessonCompletionArea").classList.remove("hidden");

    // Update completion count
    document.getElementById("completedLessonCount").textContent =
        currentLearnBatch.length;
}

/**
 * Starts quiz for learn mode (includes current batch + all previously learned)
 */
async function startLearnModeQuiz() {
    // Combine current batch with all previously learned kanji
    const quizKanji = [...learnedKanji, ...currentLearnBatch];

    // Hide lesson completion and start quiz in learn mode
    document.getElementById("lessonCompletionArea").classList.add("hidden");

    // Start quiz with learn mode flag
    await startQuizInLearnMode(quizKanji);
}

/**
 * Shows the Learn Quiz Completion screen
 */
function showLearnQuizCompletionScreen() {
    // Hide quiz area
    document.getElementById("quizArea").classList.add("hidden");
    document
        .getElementById("learnQuizCompletionArea")
        .classList.remove("hidden");

    // Calculate scores using shared utility function from ui-utils.js
    const { finalCorrectCount, finalIncorrectCount } = calculateQuizScores();

    // Update stats
    document.getElementById("learnTotalQuestions").textContent =
        originalQueueLength;
    document.getElementById("learnCorrectAnswers").textContent =
        finalCorrectCount;
    document.getElementById("learnIncorrectAnswers").textContent =
        finalIncorrectCount;

    // Display correct and incorrect kanji results (using learn mode element IDs)
    displayKanjiResults("learnCorrectKanjiList", "learnIncorrectKanjiList");

    // Update progress message
    const totalKanji = learnKanjiPool.length;
    const currentlyLearned = learnedKanji.length + currentLearnBatch.length;
    const remaining = totalKanji - currentlyLearned;

    let message = `You've learned ${currentlyLearned} out of ${totalKanji} kanji.`;
    if (remaining > 0) {
        message += ` ${remaining} kanji remaining.`;
    } else {
        message = `You've completed all ${totalKanji} kanji!`;
    }
    document.getElementById("learnProgressMessage").textContent = message;

    // Show/hide continue button based on remaining kanji
    const continueBtn = document.getElementById("continueLearnKanji");
    if (remaining > 0) {
        continueBtn.classList.remove("hidden");
    } else {
        continueBtn.classList.add("hidden");
    }

    // Show confetti if all answers were correct
    if (
        finalIncorrectCount === 0 &&
        finalCorrectCount > 0 &&
        typeof triggerConfetti === "function"
    ) {
        triggerConfetti("#learnQuizCompletionArea .card");
    }
}

/**
 * Continues to the next batch of kanji
 */
function continueToNextBatch() {
    // Add current batch to learned kanji
    learnedKanji.push(...currentLearnBatch);
    currentLearnBatch = [];

    // Increment batch index
    currentBatchIndex++;

    // Check if there are more kanji to learn
    const totalKanji = learnKanjiPool.length;
    const startIdx = currentBatchIndex * BATCH_SIZE;

    if (startIdx >= totalKanji) {
        // All kanji learned! Show completion screen
        showLearningCompleteScreen();
    } else {
        // Show progress screen for next batch
        showLearnModeProgressScreen();
    }
}

/**
 * Redoes the quiz with current batch + all previously learned
 */
async function redoLearnQuiz() {
    const quizKanji = [...learnedKanji, ...currentLearnBatch];
    document.getElementById("learnQuizCompletionArea").classList.add("hidden");
    await startQuizInLearnMode(quizKanji);
}

/**
 * Shows the Learning Complete screen (all kanji learned)
 */
function showLearningCompleteScreen() {
    hideAllAreas();
    document.getElementById("learningCompleteArea").classList.remove("hidden");

    // Update total learned count
    const totalLearned = learnKanjiPool.length;
    document.getElementById("totalLearnedKanji").textContent = totalLearned;

    // Show confetti!
    if (typeof triggerConfetti === "function") {
        triggerConfetti("#learningCompleteArea .card");
    }
}

/**
 * Starts a final quiz with all learned kanji
 */
async function startFinalQuizAllLearned() {
    document.getElementById("learningCompleteArea").classList.add("hidden");
    await startQuizInLearnMode(learnKanjiPool);
}

/**
 * Exits learn mode and returns to setup
 */
function exitLearnMode() {
    learnKanjiMode = false;
    learnKanjiPool = [];
    currentLearnBatch = [];
    learnedKanji = [];
    currentBatchIndex = 0;
    learnKanjiApiToken = "";

    hideAllAreas();
    document.getElementById("setup").classList.remove("hidden");
    resetSetupButtons();

    showToast("Exited learning mode", "info");
}

/**
 * Helper to hide all areas
 */
function hideAllAreas() {
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("selectionArea").classList.add("hidden");
    document.getElementById("lessonSelectionArea").classList.add("hidden");
    document.getElementById("learnKanjiSelectionArea").classList.add("hidden");
    document.getElementById("lessonArea").classList.add("hidden");
    document.getElementById("lessonCompletionArea").classList.add("hidden");
    document.getElementById("quizArea").classList.add("hidden");
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("learnModeProgressArea").classList.add("hidden");
    document.getElementById("learnQuizCompletionArea").classList.add("hidden");
    document.getElementById("learningCompleteArea").classList.add("hidden");
}

/**
 * Starts a quiz in learn mode
 * Ensures learnKanjiMode flag stays true throughout quiz lifecycle
 */
async function startQuizInLearnMode(items) {
    // Ensure learn mode flag is set for the entire quiz
    // This flag is checked in showCompletionScreen() to route to learn mode completion
    const wasInLearnMode = learnKanjiMode;

    try {
        learnKanjiMode = true;
        // Start regular quiz with token
        const token = (learnKanjiApiToken || "").trim();
        await startQuiz(items, token);
        // Flag intentionally stays true - don't restore here
        // It will be managed by learn mode completion flow or exitLearnMode()
    } catch (error) {
        // On error, restore previous state and re-throw
        learnKanjiMode = wasInLearnMode;
        throw error;
    }
}
