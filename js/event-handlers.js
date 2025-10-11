// WaniKanji - Event Handlers

// Helper function to load kanji from API
async function loadKanjiFromAPI() {
    document.getElementById("setupMsg").textContent = "";
    const token = document.getElementById("token").value.trim();
    const level = document.getElementById("level").value.trim();
    const useSrsFilter = document.getElementById("srsFilterToggle").checked;
    const unlockedOnly = document.getElementById("unlockedOnlyToggle").checked;

    if (!token) {
        document.getElementById("setupMsg").textContent =
            "Please add your API token.";
        return null;
    }
    if (!level) {
        document.getElementById("setupMsg").textContent = "Please set a level.";
        return null;
    }

    try {
        // Check if we can use cached data
        const hasCachedData =
            typeof cachedKanjiData !== "undefined" &&
            cachedKanjiData.token === token &&
            cachedKanjiData.level === level &&
            cachedKanjiData.allKanji &&
            cachedKanjiData.allKanji.length > 0;

        let items;

        if (hasCachedData) {
            // Use cached data and apply filters client-side
            items = cachedKanjiData.allKanji;

            // Apply SRS filter
            if (useSrsFilter) {
                items = items.filter((kanji) => {
                    // Safe access to assignments Map
                    if (!(cachedKanjiData.assignments instanceof Map)) {
                        return true; // Include if no valid assignment data
                    }
                    const assignment = cachedKanjiData.assignments.get(
                        kanji.id
                    );
                    return !assignment || assignment.srsStage < 5;
                });
            }

            // Apply unlocked-only filter
            if (unlockedOnly) {
                items = items.filter((kanji) => {
                    // Safe access to assignments Map
                    if (!(cachedKanjiData.assignments instanceof Map)) {
                        return false; // Exclude if no valid assignment data
                    }
                    const assignment = cachedKanjiData.assignments.get(
                        kanji.id
                    );
                    return assignment && assignment.unlocked;
                });
            }
        } else {
            // Fallback to API calls if no cached data
            items = useSrsFilter
                ? await fetchKanjiForLevelFilteredBySRS(token, level)
                : await fetchKanjiForLevel(token, level);

            // Apply unlocked-only filter if checked
            if (unlockedOnly && items.length > 0) {
                const subjectIds = items.map((k) => k.id);
                const assignments = await fetchAssignmentsForSubjects(
                    token,
                    subjectIds
                );

                // Filter to only include unlocked kanji
                items = items.filter((kanji) => {
                    const assignment = assignments.get(kanji.id);
                    return assignment && assignment.unlocked;
                });
            }
        }

        if (!items.length) {
            let message;
            if (useSrsFilter && unlockedOnly) {
                message =
                    "No unlocked kanji found below Guru rank for this level.";
            } else if (useSrsFilter) {
                message = "No kanji found for that level below Guru rank.";
            } else if (unlockedOnly) {
                message = "No unlocked kanji found for this level.";
            } else {
                message = "No kanji found for that level.";
            }
            document.getElementById("setupMsg").textContent = message;
            return null;
        }

        return items;
    } catch (e) {
        document.getElementById("setupMsg").textContent = "Error: " + e.message;
        return null;
    }
}

// Quick Quiz button handler
document.getElementById("startAllBtn").addEventListener("click", async () => {
    const startBtn = document.getElementById("startAllBtn");
    const selectBtn = document.getElementById("selectKanjiBtn");

    // Disable buttons while loading
    startBtn.disabled = true;
    selectBtn.disabled = true;
    startBtn.textContent = "Loading...";

    const items = await loadKanjiFromAPI();

    if (items) {
        // Store items for "Try Again" functionality
        lastQuizItems = items.slice();
        const token = document.getElementById("token").value.trim();
        await startQuiz(items, token);
    } else {
        // Re-enable buttons if loading failed
        startBtn.disabled = false;
        selectBtn.disabled = false;
        startBtn.textContent = "Quiz All";
    }
});

// Select Kanji button handler
document
    .getElementById("selectKanjiBtn")
    .addEventListener("click", async () => {
        const startBtn = document.getElementById("startAllBtn");
        const selectBtn = document.getElementById("selectKanjiBtn");

        // Disable buttons while loading
        startBtn.disabled = true;
        selectBtn.disabled = true;
        selectBtn.textContent = "Loading...";

        const items = await loadKanjiFromAPI();

        if (items) {
            showKanjiSelectionScreen(items);
        } else {
            // Re-enable buttons if loading failed
            startBtn.disabled = false;
            selectBtn.disabled = false;
            selectBtn.textContent = "Select Quiz";
        }
    });

// Check answer button event handler
document.getElementById("checkBtn").addEventListener("click", checkAnswer);

// Answer input keydown event handler
document.getElementById("answer").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (awaitingContinue) {
            // If waiting for continue, trigger continue button
            document.getElementById("continueBtn").click();
        } else {
            // Otherwise check the answer
            checkAnswer();
        }
    }
});

// Real-time hiragana conversion for reading mode and English Meaning → Japanese Reading mode
document.getElementById("answer").addEventListener("input", (e) => {
    const card = queue[currentIndex];
    if (
        card &&
        (card.questionType === "kanji-to-reading" ||
            card.questionType === "english-to-reading-or-kanji")
    ) {
        const input = e.target.value;
        const hiragana = convertRomanjiToHiragana(input);
        e.target.value = hiragana;
    }
});

// Global keydown listener for when input is disabled
document.addEventListener("keydown", (e) => {
    // Only handle if not typing in the input field
    if (
        e.target !== document.getElementById("answer") &&
        e.key === "Enter" &&
        awaitingContinue
    ) {
        e.preventDefault();
        document.getElementById("continueBtn").click();
    }
});

// Continue button event handler
document.getElementById("continueBtn").addEventListener("click", () => {
    // user acknowledged the correct answer, show next card
    document.getElementById("continueBtn").classList.add("hidden");
    document.getElementById("correctBox").classList.add("hidden");
    awaitingContinue = false;
    // show next card at currentIndex (since we already moved the wrong card to the end)
    if (queue.length === 0) {
        document.getElementById("meaningDisplay").textContent =
            "All done, great job!";
        document.getElementById("kanjiDisplay").textContent = "";
        document.getElementById("progress").textContent = "0 remaining";
        return;
    }
    showCard();
});

// Export button event handler
document.getElementById("exportBtn").addEventListener("click", () => {
    const lines = queue.map(
        (c) => `${c.kanji}\t${c.meanings.join("|")}\t${c.readings.join("|")}`
    );
    const blob = new Blob([lines.join("\n")], {
        type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kanji_level_export.txt";
    a.click();
    URL.revokeObjectURL(url);
});

// Back button functionality
document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("quizArea").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    resetSetupButtons();
});

// Restart button functionality
document.getElementById("restartBtn").addEventListener("click", async () => {
    // Hide completion screen and show quiz area
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("quizArea").classList.remove("hidden");

    // Restart the quiz with the same items that were used before
    if (lastQuizItems && lastQuizItems.length > 0) {
        const token = document.getElementById("token").value.trim();
        await startQuiz(lastQuizItems, token);
    } else {
        // Fallback: go back to setup if no items are stored
        console.error("No quiz items stored for restart");
        document.getElementById("completionArea").classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        showToast("Unable to restart quiz. Please start a new quiz.", "error");
    }
});

// Quiz incorrect answers button functionality
document.getElementById("quizIncorrectBtn").addEventListener("click", () => {
    startIncorrectQuiz();
});

async function startIncorrectQuiz() {
    // Get only the kanji that were answered incorrectly
    const incorrectKanjiArray = Array.from(incorrectKanji);
    if (incorrectKanjiArray.length === 0) {
        showToast("No incorrect answers to quiz!", "info");
        return;
    }

    // Filter allKanjiData to only include incorrect kanji
    const incorrectKanjiData = allKanjiData.filter((kanji) =>
        incorrectKanjiArray.includes(kanji.kanji)
    );

    // Hide completion screen and show quiz area
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("quizArea").classList.remove("hidden");

    // Start quiz with only incorrect kanji
    const token = document.getElementById("token").value.trim();
    await startQuiz(incorrectKanjiData, token);

    showToast(
        `Starting quiz with ${incorrectKanjiData.length} incorrect kanji`,
        "info"
    );
}

// Back to setup button functionality
document.getElementById("backToSetupBtn").addEventListener("click", () => {
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    resetSetupButtons();
});

// Store loaded kanji for selection screen
let selectionScreenKanjiItems = [];
// Store the last quiz items for "Try Again" functionality
let lastQuizItems = [];

// Helper function to populate stage filter checkboxes
function populateStageFilters(
    items,
    containerId,
    checkboxSelector,
    updateCountFn
) {
    const container = document.getElementById(containerId);
    const filtersDiv = container.querySelector(".flex");

    // Clear existing filters
    filtersDiv.innerHTML = "";

    // Collect all unique stages present in items
    const stagesPresent = new Set();
    items.forEach((item) => {
        const assignment = cachedKanjiData.assignments.get(item.id);
        const srsStage = assignment ? assignment.srsStage : null;
        const stageName = getSimpleStageName(srsStage);
        stagesPresent.add(stageName);
    });

    // Define stage order
    const stageOrder = [
        "locked",
        "apprentice",
        "guru",
        "master",
        "enlightened",
        "burned",
    ];

    // Map stages to checkbox colors
    const stageColors = {
        locked: "checkbox-neutral",
        apprentice: "checkbox-secondary",
        guru: "checkbox-primary",
        master: "checkbox-info",
        enlightened: "checkbox-success",
        burned: "checkbox-warning",
    };

    // Create checkbox for each present stage
    stageOrder.forEach((stage) => {
        if (!stagesPresent.has(stage)) {
            return;
        }

        const label = document.createElement("label");
        label.className = "flex items-center gap-2 cursor-pointer";

        const stageName = stage.charAt(0).toUpperCase() + stage.slice(1);
        const colorClass = stageColors[stage] || "";

        label.innerHTML = `
            <input type="checkbox" 
                   class="checkbox checkbox-sm stage-filter-checkbox ${colorClass}" 
                   data-stage="${stage}" 
                   checked />
            <span class="text-sm">${stageName}</span>
        `;

        filtersDiv.appendChild(label);

        // Add event listener
        const checkbox = label.querySelector("input");
        checkbox.addEventListener("change", () => {
            const shouldCheck = checkbox.checked;
            document
                .querySelectorAll(checkboxSelector)
                .forEach((kanjiCheckbox) => {
                    if (kanjiCheckbox.dataset.srsStage === stage) {
                        kanjiCheckbox.checked = shouldCheck;
                    }
                });
            updateCountFn();
        });
    });
}

// Kanji Selection Screen Functions
function showKanjiSelectionScreen(items) {
    // Store items for later use
    selectionScreenKanjiItems = items;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("selectionArea").classList.remove("hidden");

    const kanjiGrid = document.getElementById("kanjiGrid");
    const totalKanjiCount = document.getElementById("totalKanjiCount");

    // Clear existing grid
    kanjiGrid.innerHTML = "";

    // Set total count
    totalKanjiCount.textContent = items.length;

    // Quiz selection screen shows kanji in SRS order (least known to most known)
    const sortedItems = sortKanjiByRank(items);

    // Create checkboxes for each kanji
    sortedItems.forEach((item, index) => {
        const kanjiItem = createKanjiSelectionItem(
            item,
            "kanji-checkbox",
            window.cachedKanjiData
        );
        kanjiGrid.appendChild(kanjiItem);
    });

    // Update selected count
    updateSelectedCount();

    // Add event listeners to checkboxes
    document.querySelectorAll(".kanji-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", updateSelectedCount);
    });

    // Populate stage filter checkboxes AFTER kanji checkboxes are created
    populateStageFilters(
        items,
        "quizStageFilters",
        ".kanji-checkbox",
        updateSelectedCount
    );
}

function updateSelectedCount() {
    updateSelectionCount(
        ".kanji-checkbox",
        "selectedCount",
        "startSelectedBtn"
    );
}

function resetSetupButtons() {
    const startBtn = document.getElementById("startAllBtn");
    const selectBtn = document.getElementById("selectKanjiBtn");
    const lessonBtn = document.getElementById("selectLessonBtn");
    const learnBtn = document.getElementById("learnKanjiBtn");

    startBtn.disabled = false;
    selectBtn.disabled = false;
    lessonBtn.disabled = false;
    learnBtn.disabled = false;
    startBtn.textContent = "Quiz All";
    selectBtn.textContent = "Select Quiz";
    lessonBtn.textContent = "Lessons";
    learnBtn.textContent = "Learn";
}

// Select All button handler
document.getElementById("selectAllBtn").addEventListener("click", () => {
    document.querySelectorAll(".kanji-checkbox").forEach((checkbox) => {
        checkbox.checked = true;
    });
    updateSelectedCount();
});

// Deselect All button handler
document.getElementById("deselectAllBtn").addEventListener("click", () => {
    document.querySelectorAll(".kanji-checkbox").forEach((checkbox) => {
        checkbox.checked = false;
    });
    updateSelectedCount();
});

// Back to Setup from Selection button handler
document
    .getElementById("backToSetupFromSelection")
    .addEventListener("click", () => {
        document.getElementById("selectionArea").classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        resetSetupButtons();
    });

// Start Selected button handler
document
    .getElementById("startSelectedBtn")
    .addEventListener("click", async () => {
        const selectedIds = Array.from(
            document.querySelectorAll(".kanji-checkbox:checked")
        ).map((cb) => parseInt(cb.dataset.kanjiId));

        // Filter loaded items to only include selected ones
        const selectedItems = selectionScreenKanjiItems.filter((item) =>
            selectedIds.includes(item.id)
        );

        if (selectedItems.length === 0) {
            showToast("Please select at least one kanji", "warning");
            return;
        }

        // Store selected items for "Try Again" functionality
        lastQuizItems = selectedItems.slice();

        document.getElementById("selectionArea").classList.add("hidden");
        const token = document.getElementById("token").value.trim();
        await startQuiz(selectedItems, token);
    });

// Save API key to localStorage
function saveApiKey() {
    const token = document.getElementById("token").value.trim();
    if (token) {
        localStorage.setItem("wanikani_api_key", token);
    }
}

// Load API key from localStorage
async function loadApiKey() {
    const savedKey = localStorage.getItem("wanikani_api_key");
    if (savedKey) {
        document.getElementById("token").value = savedKey;
        // Auto-load current level when loading saved API key
        try {
            // Skeleton already visible, just disable API-related buttons
            document.getElementById("startAllBtn").disabled = true;
            document.getElementById("selectKanjiBtn").disabled = true;
            document.getElementById("selectLessonBtn").disabled = true;
            document.getElementById("learnKanjiBtn").disabled = true;

            const currentLevel = await fetchUserCurrentLevel(savedKey);
            document.getElementById("level").value = currentLevel;
            document.getElementById(
                "levelDisplay"
            ).textContent = `Level ${currentLevel}`;

            // Clear any previous error messages
            document.getElementById("setupMsg").textContent = "";

            // Don't hide loading state yet - let updateKanjiCountAndPreview handle it

            showToast(`Selected current level: ${currentLevel}`, "success");
        } catch (error) {
            document.getElementById("setupMsg").textContent =
                "Could not load current level: " + error.message;
            // Default to level 1 if loading fails
            document.getElementById("level").value = 1;
            document.getElementById("levelDisplay").textContent = "Level 1";

            // Hide loading state
            if (typeof hideLoadingState === "function") {
                hideLoadingState();
            }
        } finally {
            // Hide skeleton, show input
            document.getElementById("levelSkeleton").classList.add("hidden");
            document.getElementById("level").classList.remove("hidden");

            // Re-enable all controls using shared utility
            enableAllControls();

            // Preload kanji data after level is loaded
            if (typeof preloadKanjiData === "function") {
                preloadKanjiData();
            }

            // Check if quiz buttons should be enabled based on mode toggles
            if (typeof updateLoadButtonState === "function") {
                updateLoadButtonState();
            }
        }
    } else {
        // No saved token - hide loading state and show default values
        document.getElementById("levelSkeleton").classList.add("hidden");
        document.getElementById("level").classList.remove("hidden");
        document.getElementById("level").value = 1;
        document.getElementById("levelDisplay").textContent = "Level 1";

        if (typeof hideLoadingState === "function") {
            hideLoadingState();
        }

        document.getElementById("kanjiCountDisplay").textContent = "—";

        if (typeof clearPreviewGrid === "function") {
            clearPreviewGrid();
        }

        // Re-enable all controls after initial load using shared utility
        enableAllControls();

        // Note: Quiz button states will be set by updateLoadButtonState()
        // which is called from hideLoadingState() after isInitialLoad is set to false
    }
}

// Load saved API key on page load (after DOM is ready)
document.addEventListener("DOMContentLoaded", () => {
    loadApiKey();
});

// Save API key when it changes and auto-load current level
document.getElementById("token").addEventListener("input", async (e) => {
    saveApiKey();
    const token = e.target.value.trim();
    if (token && token.length > 10) {
        // Basic validation for API token
        try {
            // Show skeleton while loading and disable buttons
            if (typeof showLoadingState === "function") {
                showLoadingState();
            }
            if (typeof showPreviewSkeleton === "function") {
                showPreviewSkeleton();
            }

            document.getElementById("levelSkeleton").classList.remove("hidden");
            document.getElementById("level").classList.add("hidden");
            document.getElementById("startAllBtn").disabled = true;
            document.getElementById("selectKanjiBtn").disabled = true;
            document.getElementById("selectLessonBtn").disabled = true;
            document.getElementById("learnKanjiBtn").disabled = true;

            const currentLevel = await fetchUserCurrentLevel(token);
            document.getElementById("level").value = currentLevel;
            document.getElementById(
                "levelDisplay"
            ).textContent = `Level ${currentLevel}`;

            // Clear any previous error messages
            document.getElementById("setupMsg").textContent = "";

            // Don't hide loading state yet - let updateKanjiCountAndPreview handle it

            showToast(`Loaded current level: ${currentLevel}`, "success");
        } catch (error) {
            document.getElementById("setupMsg").textContent =
                "Could not load current level: " + error.message;
            // Default to level 1 if loading fails
            document.getElementById("level").value = 1;
            document.getElementById("levelDisplay").textContent = "Level 1";

            // Hide loading state
            if (typeof hideLoadingState === "function") {
                hideLoadingState();
            }
        } finally {
            // Hide skeleton, show input
            document.getElementById("levelSkeleton").classList.add("hidden");
            document.getElementById("level").classList.remove("hidden");

            // Re-enable all controls using shared utility
            enableAllControls();

            // Preload kanji data after level is loaded
            if (typeof preloadKanjiData === "function") {
                preloadKanjiData();
            }

            // Check if quiz buttons should be enabled based on mode toggles
            if (typeof updateLoadButtonState === "function") {
                updateLoadButtonState();
            }
        }
    }
});

// Apply color configuration when page loads
document.addEventListener("DOMContentLoaded", applyColorConfig);

// Check if all mode checkboxes are unchecked and disable buttons
function updateLoadButtonState() {
    // Don't update button state if we're still in initial load
    if (typeof isInitialLoad !== "undefined" && isInitialLoad) {
        return;
    }

    const meaningToggle = document.getElementById("modeToggle");
    const readingToggle = document.getElementById("readingToggle");
    const modeEnglishToKanjiToggle = document.getElementById(
        "modeEnglishToKanjiToggle"
    );
    const startAllBtn = document.getElementById("startAllBtn");
    const selectKanjiBtn = document.getElementById("selectKanjiBtn");
    const setupMsg = document.getElementById("setupMsg");

    const allUnchecked =
        !meaningToggle.checked &&
        !readingToggle.checked &&
        !modeEnglishToKanjiToggle.checked;

    // Only disable quiz-related buttons when no modes are selected
    if (allUnchecked) {
        startAllBtn.disabled = true;
        selectKanjiBtn.disabled = true;
        setupMsg.textContent = "Please select at least one mode to start quiz.";
        setupMsg.className = "text-sm text-warning";
    } else {
        startAllBtn.disabled = false;
        selectKanjiBtn.disabled = false;
        setupMsg.textContent = "";
    }
}

// English Meaning → Japanese Reading Mode Toggle Handler
document
    .getElementById("modeEnglishToKanjiToggle")
    .addEventListener("change", (e) => {
        updateLoadButtonState();
    });

// Mode toggles change handlers
document
    .getElementById("modeToggle")
    .addEventListener("change", updateLoadButtonState);
document
    .getElementById("readingToggle")
    .addEventListener("change", updateLoadButtonState);

// Check button state on page load
document.addEventListener("DOMContentLoaded", () => {
    updateLoadButtonState();
});

// Lessons button handler
document
    .getElementById("selectLessonBtn")
    .addEventListener("click", async () => {
        const startBtn = document.getElementById("startAllBtn");
        const selectBtn = document.getElementById("selectKanjiBtn");
        const lessonBtn = document.getElementById("selectLessonBtn");

        // Disable buttons while loading
        startBtn.disabled = true;
        selectBtn.disabled = true;
        lessonBtn.disabled = true;
        lessonBtn.textContent = "Loading...";

        const items = await loadKanjiFromAPI();

        if (items) {
            showLessonSelectionScreen(items);
        } else {
            // Re-enable buttons if loading failed
            startBtn.disabled = false;
            selectBtn.disabled = false;
            lessonBtn.disabled = false;
            lessonBtn.textContent = "Lessons";
        }
    });

// Lesson Select All button handler
document.getElementById("lessonSelectAllBtn").addEventListener("click", () => {
    document.querySelectorAll(".lesson-kanji-checkbox").forEach((checkbox) => {
        checkbox.checked = true;
    });
    updateLessonSelectedCount();
});

// Lesson Deselect All button handler
document
    .getElementById("lessonDeselectAllBtn")
    .addEventListener("click", () => {
        document
            .querySelectorAll(".lesson-kanji-checkbox")
            .forEach((checkbox) => {
                checkbox.checked = false;
            });
        updateLessonSelectedCount();
    });

// Back to Setup from Lesson Selection button handler
document
    .getElementById("backToSetupFromLessonSelection")
    .addEventListener("click", () => {
        document.getElementById("lessonSelectionArea").classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        resetSetupButtons();
    });

// Start Lessons button handler
document
    .getElementById("startLessonsBtn")
    .addEventListener("click", async () => {
        const selectedIds = Array.from(
            document.querySelectorAll(".lesson-kanji-checkbox:checked")
        ).map((cb) => parseInt(cb.dataset.kanjiId));

        // Use the displayed items to preserve the order shown on screen
        const items =
            window.lessonDisplayedKanjiItems ||
            window.lessonSelectionScreenKanjiItems;
        const selectedItems = items.filter((item) =>
            selectedIds.includes(item.id)
        );

        if (selectedItems.length === 0) {
            showToast("Please select at least one kanji", "warning");
            return;
        }

        const token = document.getElementById("token").value.trim();
        await startLessons(selectedItems, token);
    });

// Previous Lesson button handler
document.getElementById("previousLessonBtn").addEventListener("click", () => {
    previousLesson();
});

// Next Lesson button handler
document.getElementById("nextLessonBtn").addEventListener("click", () => {
    nextLesson();
});

// Keyboard navigation for lessons
document.addEventListener("keydown", (e) => {
    // Check if lesson area is visible
    const lessonArea = document.getElementById("lessonArea");
    if (!lessonArea.classList.contains("hidden")) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
            e.preventDefault();
            nextLesson();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            previousLesson();
        }
    }
});

// Back to Setup from Lesson button handler
document
    .getElementById("backToSetupFromLesson")
    .addEventListener("click", () => {
        document.getElementById("lessonArea").classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        resetSetupButtons();
    });

// Quiz These Kanji button handler (from lesson completion)
document
    .getElementById("startQuizFromLessons")
    .addEventListener("click", async () => {
        document.getElementById("lessonCompletionArea").classList.add("hidden");

        // Check if we're in learn mode
        if (typeof learnKanjiMode !== "undefined" && learnKanjiMode) {
            // Start learn mode quiz
            startLearnModeQuiz();
        } else {
            // Store items for "Try Again" functionality
            lastQuizItems = lessonKanjiData.slice();
            const token = document.getElementById("token").value.trim();
            await startQuiz(lessonKanjiData, token);
            showToast(
                `Starting quiz with ${lessonKanjiData.length} kanji from lessons`,
                "info"
            );
        }
    });

// Review Lessons Again button handler
document
    .getElementById("reviewLessonsAgain")
    .addEventListener("click", async () => {
        document.getElementById("lessonCompletionArea").classList.add("hidden");

        // Restart lessons with the same kanji data
        const token = document.getElementById("token").value.trim();
        await startLessons(lessonKanjiData, token);

        showToast("Reviewing lessons again", "info");
    });

// Back to Setup from Lesson Completion button handler
document
    .getElementById("backToSetupFromLessonCompletion")
    .addEventListener("click", () => {
        document.getElementById("lessonCompletionArea").classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        resetSetupButtons();
    });

// Learn Mode button handler
document.getElementById("learnKanjiBtn").addEventListener("click", async () => {
    const startBtn = document.getElementById("startAllBtn");
    const selectBtn = document.getElementById("selectKanjiBtn");
    const lessonBtn = document.getElementById("selectLessonBtn");
    const learnBtn = document.getElementById("learnKanjiBtn");

    // Disable buttons while loading
    startBtn.disabled = true;
    selectBtn.disabled = true;
    lessonBtn.disabled = true;
    learnBtn.disabled = true;
    learnBtn.textContent = "Loading...";

    const items = await loadKanjiFromAPI();

    if (items) {
        showLearnKanjiSelectionScreen(items);
    } else {
        // Re-enable buttons if loading failed
        startBtn.disabled = false;
        selectBtn.disabled = false;
        lessonBtn.disabled = false;
        learnBtn.disabled = false;
        learnBtn.textContent = "Learn";
    }
});

// Learn Mode Select All button handler
document
    .getElementById("learnKanjiSelectAllBtn")
    .addEventListener("click", () => {
        document
            .querySelectorAll(".learn-kanji-checkbox")
            .forEach((checkbox) => {
                checkbox.checked = true;
            });
        updateLearnKanjiSelectedCount();
    });

// Learn Mode Deselect All button handler
document
    .getElementById("learnKanjiDeselectAllBtn")
    .addEventListener("click", () => {
        document
            .querySelectorAll(".learn-kanji-checkbox")
            .forEach((checkbox) => {
                checkbox.checked = false;
            });
        updateLearnKanjiSelectedCount();
    });

// Back to Setup from Learn Selection button handler
document
    .getElementById("backToSetupFromLearnSelection")
    .addEventListener("click", () => {
        document
            .getElementById("learnKanjiSelectionArea")
            .classList.add("hidden");
        document.getElementById("setup").classList.remove("hidden");
        resetSetupButtons();
    });

// Start Learn Mode button handler
document
    .getElementById("startLearnKanjiBtn")
    .addEventListener("click", async () => {
        const selectedIds = Array.from(
            document.querySelectorAll(".learn-kanji-checkbox:checked")
        ).map((cb) => parseInt(cb.dataset.kanjiId));

        // Use the displayed items to preserve the order shown on screen
        const items =
            window.learnDisplayedKanjiItems || learnSelectionScreenKanjiItems;
        const selectedItems = items.filter((item) =>
            selectedIds.includes(item.id)
        );

        if (selectedItems.length === 0) {
            showToast("Please select at least one kanji", "warning");
            return;
        }

        // Hide selection screen
        document
            .getElementById("learnKanjiSelectionArea")
            .classList.add("hidden");

        showToast(
            `Starting learning mode with ${selectedItems.length} kanji`,
            "success"
        );

        // Initialize learn mode with selected kanji (starts lessons immediately)
        const token = document.getElementById("token").value.trim();
        await initializeLearnKanjiMode(selectedItems, token);
    });

// Start Learn Batch Lessons button handler
document
    .getElementById("startLearnBatchLessons")
    .addEventListener("click", async () => {
        await startLearnBatchLessons();
    });

// Exit Learn Mode from Progress screen button handler
document
    .getElementById("exitLearnModeFromProgress")
    .addEventListener("click", () => {
        exitLearnMode();
    });

// Redo Learn Quiz button handler
document.getElementById("redoLearnQuiz").addEventListener("click", () => {
    redoLearnQuiz();
});

// Continue Learn Mode button handler
document.getElementById("continueLearnKanji").addEventListener("click", () => {
    continueToNextBatch();
});

// Exit Learn Mode from Quiz completion button handler
document
    .getElementById("exitLearnModeFromQuiz")
    .addEventListener("click", () => {
        exitLearnMode();
    });

// Final Quiz All Learned button handler
document.getElementById("finalQuizAllLearned").addEventListener("click", () => {
    startFinalQuizAllLearned();
});

// Back to Setup from Learning Complete button handler
document
    .getElementById("backToSetupFromLearningComplete")
    .addEventListener("click", () => {
        exitLearnMode();
    });

// Global Enter key handler for Learn Mode screens
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") {
        return;
    }

    // Don't trigger if user is typing in an input field (for quiz)
    if (e.target.tagName === "INPUT") {
        return;
    }

    // Check which learn mode screen is visible and trigger appropriate action

    // Lesson Completion Screen -> Quiz These Kanji
    const lessonCompletionVisible = !document
        .getElementById("lessonCompletionArea")
        .classList.contains("hidden");
    if (
        lessonCompletionVisible &&
        typeof learnKanjiMode !== "undefined" &&
        learnKanjiMode
    ) {
        e.preventDefault();
        document.getElementById("startQuizFromLessons").click();
        return;
    }

    // Learn Quiz Completion Screen -> Continue Learning
    const learnQuizCompletionVisible = !document
        .getElementById("learnQuizCompletionArea")
        .classList.contains("hidden");
    if (learnQuizCompletionVisible) {
        e.preventDefault();
        const continueBtn = document.getElementById("continueLearnKanji");
        // Only click if button is visible (not hidden when all kanji learned)
        if (!continueBtn.classList.contains("hidden")) {
            continueBtn.click();
        }
        return;
    }

    // Ready for Lessons Screen -> Start Lessons
    const learnProgressVisible = !document
        .getElementById("learnModeProgressArea")
        .classList.contains("hidden");
    if (learnProgressVisible) {
        e.preventDefault();
        document.getElementById("startLearnBatchLessons").click();
        return;
    }
});
