// WaniKanji - Event Handlers

// Load button event handler
document.getElementById("loadBtn").addEventListener("click", async () => {
    document.getElementById("setupMsg").textContent = "";
    const token = document.getElementById("token").value.trim();
    const level = document.getElementById("level").value.trim();
    const useSrsFilter = document.getElementById("srsFilterToggle").checked;

    if (!token) {
        document.getElementById("setupMsg").textContent =
            "Please add your API token.";
        return;
    }
    if (!level) {
        document.getElementById("setupMsg").textContent = "Please set a level.";
        return;
    }
    try {
        document.getElementById("loadBtn").disabled = true;
        document.getElementById("loadBtn").textContent = "Loading...";

        // Use filtered or unfiltered function based on checkbox
        const items = useSrsFilter
            ? await fetchKanjiForLevelFilteredBySRS(token, level)
            : await fetchKanjiForLevel(token, level);

        if (!items.length) {
            const message = useSrsFilter
                ? "No kanji found for that level below Guru rank (or all kanji are at Guru or above)."
                : "No kanji found for that level.";
            document.getElementById("setupMsg").textContent = message;
            document.getElementById("loadBtn").disabled = false;
            document.getElementById("loadBtn").textContent =
                "Load level and start";
            return;
        }
        startQuiz(items);
    } catch (e) {
        document.getElementById("setupMsg").textContent = "Error: " + e.message;
        document.getElementById("loadBtn").disabled = false;
        document.getElementById("loadBtn").textContent = "Load level and start";
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
    if (e.target !== document.getElementById("answer")) {
        if (e.key === "Enter" && awaitingContinue) {
            // If waiting for continue and Enter is pressed, trigger continue
            e.preventDefault();
            document.getElementById("continueBtn").click();
        }
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
    document.getElementById("loadBtn").disabled = false;
    document.getElementById("loadBtn").textContent = "Load Level and Start";
});

// Restart button functionality
document.getElementById("restartBtn").addEventListener("click", () => {
    // Hide completion screen and show quiz area
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("quizArea").classList.remove("hidden");

    // Reset the quiz with the same items
    const token = document.getElementById("token").value.trim();
    const level = document.getElementById("level").value.trim();

    // Restart the quiz with the same level using the same filter setting
    const fetchFunction = useSrsFilter
        ? fetchKanjiForLevelFilteredBySRS
        : fetchKanjiForLevel;

    fetchFunction(token, level)
        .then((items) => {
            startQuiz(items);
        })
        .catch((e) => {
            console.error("Error restarting quiz:", e);
            // Fallback: go back to setup
            document.getElementById("completionArea").classList.add("hidden");
            document.getElementById("setup").classList.remove("hidden");
        });
});

// Quiz incorrect answers button functionality
document.getElementById("quizIncorrectBtn").addEventListener("click", () => {
    startIncorrectQuiz();
});

function startIncorrectQuiz() {
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
    startQuiz(incorrectKanjiData);

    showToast(
        `Starting quiz with ${incorrectKanjiData.length} incorrect kanji`,
        "info"
    );
}

// Back to setup button functionality
document.getElementById("backToSetupBtn").addEventListener("click", () => {
    document.getElementById("completionArea").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("loadBtn").disabled = false;
    document.getElementById("loadBtn").textContent = "Load Level and Start";
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
            // Show skeleton while loading and disable buttons
            document.getElementById("levelSkeleton").classList.remove("hidden");
            document.getElementById("level").classList.add("hidden");
            document.getElementById("loadBtn").disabled = true;
            document.getElementById("modeToggle").disabled = true;
            document.getElementById("readingToggle").disabled = true;

            const currentLevel = await fetchUserCurrentLevel(savedKey);
            document.getElementById("level").value = currentLevel;
            showToast(`Selected current level: ${currentLevel}`, "success");
        } catch (error) {
            document.getElementById("setupMsg").textContent =
                "Could not load current level: " + error.message;
            // Default to level 1 if loading fails
            document.getElementById("level").value = 1;
        } finally {
            // Hide skeleton, show input, and re-enable buttons
            document.getElementById("levelSkeleton").classList.add("hidden");
            document.getElementById("level").classList.remove("hidden");
            document.getElementById("loadBtn").disabled = false;
            document.getElementById("modeToggle").disabled = false;
            document.getElementById("readingToggle").disabled = false;
        }
    }
}

// Load saved API key on page load
loadApiKey();

// Save API key when it changes and auto-load current level
document.getElementById("token").addEventListener("input", async (e) => {
    saveApiKey();
    const token = e.target.value.trim();
    if (token && token.length > 10) {
        // Basic validation for API token
        try {
            // Show skeleton while loading and disable buttons
            document.getElementById("levelSkeleton").classList.remove("hidden");
            document.getElementById("level").classList.add("hidden");
            document.getElementById("loadBtn").disabled = true;
            document.getElementById("modeToggle").disabled = true;
            document.getElementById("readingToggle").disabled = true;

            const currentLevel = await fetchUserCurrentLevel(token);
            document.getElementById("level").value = currentLevel;
            showToast(`Loaded current level: ${currentLevel}`, "success");
        } catch (error) {
            document.getElementById("setupMsg").textContent =
                "Could not load current level: " + error.message;
            // Default to level 1 if loading fails
            document.getElementById("level").value = 1;
        } finally {
            // Hide skeleton, show input, and re-enable buttons
            document.getElementById("levelSkeleton").classList.add("hidden");
            document.getElementById("level").classList.remove("hidden");
            document.getElementById("loadBtn").disabled = false;
            document.getElementById("modeToggle").disabled = false;
            document.getElementById("readingToggle").disabled = false;
        }
    }
});

// Apply color configuration when page loads
document.addEventListener("DOMContentLoaded", applyColorConfig);

// Check if all mode checkboxes are unchecked and disable load button
function updateLoadButtonState() {
    const meaningToggle = document.getElementById("modeToggle");
    const readingToggle = document.getElementById("readingToggle");
    const modeEnglishToKanjiToggle = document.getElementById(
        "modeEnglishToKanjiToggle"
    );
    const loadBtn = document.getElementById("loadBtn");
    const setupMsg = document.getElementById("setupMsg");

    const allUnchecked =
        !meaningToggle.checked &&
        !readingToggle.checked &&
        !modeEnglishToKanjiToggle.checked;

    if (allUnchecked) {
        loadBtn.disabled = true;
        setupMsg.textContent = "Please select at least one mode to start.";
        setupMsg.className = "text-sm text-warning";
    } else {
        loadBtn.disabled = false;
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
