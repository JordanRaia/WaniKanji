// WaniKanji - Common Utilities
// Shared utility functions to eliminate code duplication

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Gets information about currently selected quiz modes
 * @returns {{ modesCount: number, isMultiMode: boolean }}
 */
function getQuizModeInfo() {
    const modesCount =
        (modeKanjiToEnglish ? 1 : 0) +
        (readingMode ? 1 : 0) +
        (modeEnglishToKanji ? 1 : 0);
    return {
        modesCount,
        isMultiMode: modesCount > 1,
    };
}

/**
 * Updates the selected count for a selection screen
 * @param {string} checkboxSelector - CSS selector for checkboxes
 * @param {string} countElementId - ID of element to update with count
 * @param {string} buttonId - ID of button to enable/disable
 */
function updateSelectionCount(checkboxSelector, countElementId, buttonId) {
    const checked = document.querySelectorAll(`${checkboxSelector}:checked`);
    document.getElementById(countElementId).textContent = checked.length;

    // Disable start button if no kanji selected
    const startBtn = document.getElementById(buttonId);
    startBtn.disabled = checked.length === 0;
}

/**
 * Validates an answer against correct answers with optional fuzzy matching
 * @param {string} userAnswer - The user's answer
 * @param {string[]} correctAnswers - Array of acceptable answers
 * @param {boolean} useFuzzy - Whether to use fuzzy matching (default true)
 * @returns {{ isCorrect: boolean, hasTypo: boolean, matchedAnswer: string|null }}
 */
function validateAnswer(userAnswer, correctAnswers, useFuzzy = true) {
    const normalized = userAnswer.trim().toLowerCase();

    // First try exact match
    for (const correct of correctAnswers) {
        if (correct.trim().toLowerCase() === normalized) {
            return {
                isCorrect: true,
                hasTypo: false,
                matchedAnswer: correct,
            };
        }
    }

    // If no exact match and fuzzy matching is enabled, try fuzzy
    if (useFuzzy) {
        const normalizedCorrect = correctAnswers.map((a) =>
            a.trim().toLowerCase()
        );
        const fuzzyResult = findBestFuzzyMatch(
            normalized,
            normalizedCorrect,
            80
        );

        if (fuzzyResult.isMatch) {
            return {
                isCorrect: true,
                hasTypo: fuzzyResult.hasTypo,
                matchedAnswer: fuzzyResult.bestMatch,
            };
        }
    }

    return {
        isCorrect: false,
        hasTypo: false,
        matchedAnswer: null,
    };
}

/**
 * Sets multiple buttons to loading state
 * @param {Object} config - Configuration object
 * @param {string[]} config.buttonIds - Array of button element IDs
 * @param {Object} config.loadingTexts - Optional object mapping button IDs to loading text
 */
function setButtonsLoading(config) {
    const { buttonIds, loadingTexts = {} } = config;

    buttonIds.forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = true;
            if (loadingTexts[id]) {
                btn.textContent = loadingTexts[id];
            }
        }
    });
}

/**
 * Resets buttons from loading state
 * @param {Object} config - Configuration object
 * @param {string[]} config.buttonIds - Array of button element IDs
 * @param {Object} config.defaultTexts - Optional object mapping button IDs to default text
 * @param {Object} config.defaultStates - Optional object mapping button IDs to enabled state (default: true)
 */
function resetButtonsFromLoading(config) {
    const { buttonIds, defaultTexts = {}, defaultStates = {} } = config;

    buttonIds.forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = defaultStates[id] === false ? false : false;
            if (defaultTexts[id]) {
                btn.textContent = defaultTexts[id];
            }
        }
    });
}

/**
 * Enables all main controls on the setup screen
 */
function enableAllControls() {
    // Basic controls
    document.getElementById("level").disabled = false;
    document.getElementById("srsFilterToggle").disabled = false;
    document.getElementById("unlockedOnlyToggle").disabled = false;
    document.getElementById("toggleToken").disabled = false;
    document.getElementById("token").disabled = false;
    document.getElementById("openFullSelector").disabled = false;

    // Mode toggles
    document.getElementById("modeToggle").disabled = false;
    document.getElementById("readingToggle").disabled = false;
    document.getElementById("modeEnglishToKanjiToggle").disabled = false;

    // Mode buttons (visual button elements)
    document.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.disabled = false;
    });

    // Lesson and learn buttons
    document.getElementById("selectLessonBtn").disabled = false;
    document.getElementById("learnKanjiBtn").disabled = false;
}

/**
 * Disables all main controls on the setup screen
 */
function disableAllControls() {
    // Basic controls
    document.getElementById("level").disabled = true;
    document.getElementById("srsFilterToggle").disabled = true;
    document.getElementById("unlockedOnlyToggle").disabled = true;
    document.getElementById("toggleToken").disabled = true;
    document.getElementById("token").disabled = true;
    document.getElementById("openFullSelector").disabled = true;

    // Mode toggles
    document.getElementById("modeToggle").disabled = true;
    document.getElementById("readingToggle").disabled = true;
    document.getElementById("modeEnglishToKanjiToggle").disabled = true;

    // Mode buttons (visual button elements)
    document.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.disabled = true;
    });

    // Action buttons
    document.getElementById("startAllBtn").disabled = true;
    document.getElementById("selectKanjiBtn").disabled = true;
    document.getElementById("selectLessonBtn").disabled = true;
    document.getElementById("learnKanjiBtn").disabled = true;
}

/**
 * Shows a selection screen with kanji grid and filters
 * @param {Object} config - Configuration object
 */
function showSelectionScreen(config) {
    const {
        items,
        gridId,
        countIds,
        checkboxClass,
        buttonIds,
        randomizeToggleId,
        stageFiltersId,
        storageKey,
        displayedItemsKey,
        setupElementId,
        selectionAreaId,
    } = config;

    // Hide setup and show selection area
    document.getElementById(setupElementId).classList.add("hidden");
    document.getElementById(selectionAreaId).classList.remove("hidden");

    const kanjiGrid = document.getElementById(gridId);
    const totalKanjiCount = document.getElementById(countIds.total);

    // Clear existing grid
    kanjiGrid.innerHTML = "";

    // Set total count
    totalKanjiCount.textContent = items.length;

    // Reset randomize checkbox to unchecked
    const randomizeToggle = document.getElementById(randomizeToggleId);
    randomizeToggle.checked = false;

    // Store the original items before any sorting/randomization
    window[storageKey] = items;

    // Sort items by rank (SRS stage) or randomize based on checkbox
    const randomizeOrder = randomizeToggle.checked;
    const sortedItems = randomizeOrder
        ? shuffleArray(items)
        : sortKanjiByRank(items);

    // Store the displayed items
    window[displayedItemsKey] = sortedItems;

    // Create checkboxes for each kanji
    sortedItems.forEach((item) => {
        const kanjiItem = createKanjiSelectionItem(
            item,
            checkboxClass,
            window.cachedKanjiData
        );
        kanjiGrid.appendChild(kanjiItem);
    });

    // Update selected count
    updateSelectionCount(
        `.${checkboxClass}`,
        countIds.selected,
        buttonIds.start
    );

    // Add event listeners to checkboxes
    document.querySelectorAll(`.${checkboxClass}`).forEach((checkbox) => {
        checkbox.addEventListener("change", () =>
            updateSelectionCount(
                `.${checkboxClass}`,
                countIds.selected,
                buttonIds.start
            )
        );
    });

    // Populate stage filter checkboxes
    populateStageFilters(items, stageFiltersId, `.${checkboxClass}`, () =>
        updateSelectionCount(
            `.${checkboxClass}`,
            countIds.selected,
            buttonIds.start
        )
    );

    // Add event listener to randomization checkbox
    randomizeToggle.addEventListener("change", () => {
        // Re-sort and re-render the kanji grid
        const randomizeOrder = randomizeToggle.checked;
        const sortedItems = randomizeOrder
            ? shuffleArray(window[storageKey])
            : sortKanjiByRank(window[storageKey]);

        // Clear and re-populate the grid
        const kanjiGrid = document.getElementById(gridId);
        kanjiGrid.innerHTML = "";

        sortedItems.forEach((item) => {
            const kanjiItem = createKanjiSelectionItem(
                item,
                checkboxClass,
                window.cachedKanjiData
            );
            kanjiGrid.appendChild(kanjiItem);
        });

        // Re-add event listeners to new checkboxes
        document.querySelectorAll(`.${checkboxClass}`).forEach((checkbox) => {
            checkbox.addEventListener("change", () =>
                updateSelectionCount(
                    `.${checkboxClass}`,
                    countIds.selected,
                    buttonIds.start
                )
            );
        });

        // Update selected count
        updateSelectionCount(
            `.${checkboxClass}`,
            countIds.selected,
            buttonIds.start
        );

        // Store the newly displayed items
        window[displayedItemsKey] = sortedItems;
    });
}
