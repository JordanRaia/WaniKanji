// WaniKanji - Setup UI Enhancements

// Populate level dropdown with options 1-60
(function initializeLevelDropdown() {
    const levelSelect = document.getElementById("level");
    for (let i = 1; i <= 60; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        if (i === 1) {
            option.selected = true;
        }
        levelSelect.appendChild(option);
    }
})();

// Token show/hide toggle
const tokenInput = document.getElementById("token");
const toggleTokenBtn = document.getElementById("toggleToken");

// Function to update the icon based on current state
function updateTokenIcon() {
    const svg = toggleTokenBtn.querySelector("svg");
    const isPassword = tokenInput.type === "password";

    if (isPassword) {
        // Show eye icon (password is hidden, so show "reveal" icon)
        svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
    } else {
        // Show eye-off icon (password is visible, so show "hide" icon)
        svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l22 22" />
        `;
    }
}

// Set initial icon state
updateTokenIcon();

toggleTokenBtn.addEventListener("click", () => {
    const isPassword = tokenInput.type === "password";
    tokenInput.type = isPassword ? "text" : "password";
    toggleTokenBtn.setAttribute("aria-pressed", String(isPassword));

    // Update icon based on new state
    updateTokenIcon();
});

// Segmented mode button toggles
const modeButtons = document.querySelectorAll("[data-mode]");
function updateModeButtonVisuals() {
    modeButtons.forEach((btn) => {
        const isPressed = btn.getAttribute("aria-pressed") === "true";
        if (isPressed) {
            // Active: solid button (no outline)
            btn.classList.remove(
                "btn-outline",
                "hover:bg-base-300",
                "hover:border-base-300"
            );
            btn.classList.add("btn-primary");
        } else {
            // Inactive: outlined button with subtle hover
            btn.classList.add(
                "btn-outline",
                "hover:bg-base-300",
                "hover:border-base-300"
            );
            btn.classList.remove("btn-primary");
        }
    });
}

// Initialize button visuals
updateModeButtonVisuals();

// Wire up mode buttons to their checkboxes
modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const { mode } = btn.dataset;
        let checkbox;

        if (mode === "meaning") {
            checkbox = document.getElementById("modeToggle");
        } else if (mode === "reading") {
            checkbox = document.getElementById("readingToggle");
        } else if (mode === "eng-to-jn") {
            checkbox = document.getElementById("modeEnglishToKanjiToggle");
        }

        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            btn.setAttribute("aria-pressed", String(checkbox.checked));
            updateModeButtonVisuals();

            // Trigger change event on checkbox for existing handlers
            checkbox.dispatchEvent(new Event("change"));
        }
    });
});

// Update level display when level changes
const levelSelect = document.getElementById("level");
const levelDisplay = document.getElementById("levelDisplay");
levelSelect.addEventListener("change", () => {
    levelDisplay.textContent = `Level ${levelSelect.value}`;
});

// Cache for preloaded kanji data
let cachedKanjiData = {
    token: null,
    level: null,
    allKanji: [],
    assignments: new Map(),
};

// Request cancellation for race condition prevention
let currentRequestId = 0;
let currentAbortController = null;

// Preload all kanji data for the current token and level
async function preloadKanjiData() {
    const token = tokenInput.value.trim();
    const level = levelSelect.value;

    if (!token || token.length < 10) {
        cachedKanjiData = {
            token: null,
            level: null,
            allKanji: [],
            assignments: new Map(),
        };
        document.getElementById("kanjiCountDisplay").textContent = "—";
        document.getElementById("previewCount").textContent = "0";
        clearPreviewGrid();
        return;
    }

    // Check if we already have data for this token/level
    if (cachedKanjiData.token === token && cachedKanjiData.level === level) {
        // Data already cached, just update the display with current filters
        updateKanjiCountAndPreview();
        return;
    }

    // Cancel any previous request
    if (currentAbortController) {
        currentAbortController.abort();
    }

    // Create new request ID and abort controller for this request
    const requestId = ++currentRequestId;
    currentAbortController = new AbortController();

    // Show loading skeleton
    const levelDisplaySkeleton = document.getElementById(
        "levelDisplaySkeleton"
    );
    const isAlreadyLoading = !levelDisplaySkeleton.classList.contains("hidden");

    if (!isAlreadyLoading) {
        showPreviewSkeleton();
        showLoadingState();
    }

    try {
        // Fetch all kanji for the level
        const allKanji = await fetchKanjiForLevel(
            token,
            level,
            currentAbortController.signal
        );

        // Check if this request is still the current one
        if (requestId !== currentRequestId) {
            return; // Ignore stale results
        }

        // Fetch all assignment data
        const subjectIds = allKanji.map((k) => k.id);
        const assignments = await fetchAssignmentsForSubjects(
            token,
            subjectIds,
            currentAbortController.signal
        );

        // Check again if this request is still the current one
        if (requestId !== currentRequestId) {
            return; // Ignore stale results
        }

        // Cache the data
        cachedKanjiData = {
            token,
            level,
            allKanji,
            assignments,
        };

        // Hide loading state and update display
        hideLoadingState();
        updateKanjiCountAndPreview();
    } catch (error) {
        // Only handle errors for the current request
        if (requestId !== currentRequestId) {
            return; // Ignore errors from stale requests
        }
        hideLoadingState();
        cachedKanjiData = {
            token: null,
            level: null,
            allKanji: [],
            assignments: new Map(),
        };
        document.getElementById("kanjiCountDisplay").textContent = "—";
        document.getElementById("previewCount").textContent = "0";
        clearPreviewGrid();
    }
}

// Update kanji count and preview based on current filters (client-side only, no API calls)
function updateKanjiCountAndPreview() {
    // If no cached data, show empty state
    if (!cachedKanjiData.allKanji || cachedKanjiData.allKanji.length === 0) {
        document.getElementById("kanjiCountDisplay").textContent = "—";
        document.getElementById("previewCount").textContent = "0";
        clearPreviewGrid();
        return;
    }

    // Get current filter states
    const useSrsFilter = document.getElementById("srsFilterToggle").checked;
    const unlockedOnly = document.getElementById("unlockedOnlyToggle").checked;

    // Apply filters client-side
    let filteredKanji = cachedKanjiData.allKanji;

    // Apply SRS filter (exclude Guru+ kanji)
    if (useSrsFilter) {
        filteredKanji = filteredKanji.filter((kanji) => {
            const assignment = cachedKanjiData.assignments.get(kanji.id);
            // Include if no assignment (never unlocked) or if SRS stage < 5
            return !assignment || assignment.srsStage < 5;
        });
    }

    // Apply unlocked-only filter
    if (unlockedOnly) {
        filteredKanji = filteredKanji.filter((kanji) => {
            const assignment = cachedKanjiData.assignments.get(kanji.id);
            return assignment && assignment.unlocked;
        });
    }

    // Update display (no loading state needed since this is instant)
    document.getElementById("kanjiCountDisplay").textContent =
        filteredKanji.length;
    document.getElementById("previewCount").textContent = filteredKanji.length;
    updatePreviewGrid(filteredKanji);
}

// Helper function to get SRS stage color classes using daisyUI semantic colors
function getSrsStageColorClass(srsStage) {
    if (srsStage === undefined || srsStage === null) {
        // No assignment - locked (black/neutral)
        return "bg-neutral/60 text-neutral-content border-neutral";
    }

    // Map SRS stages to daisyUI semantic colors with subtle opacity
    if (srsStage >= 1 && srsStage <= 4) {
        // Apprentice
        return "bg-secondary/40 text-base-content border-secondary/50";
    } else if (srsStage >= 5 && srsStage <= 6) {
        // Guru
        return "bg-primary/40 text-base-content border-primary/50";
    } else if (srsStage === 7) {
        // Master
        return "bg-info/40 text-base-content border-info/50";
    } else if (srsStage === 8) {
        // Enlightened
        return "bg-success/40 text-base-content border-success/50";
    } else if (srsStage === 9) {
        // Burned
        return "bg-warning/40 text-base-content border-warning/50";
    }

    // Default fallback
    return "bg-base-300 text-base-content border-base-content/20";
}

// Update preview grid with kanji
function updatePreviewGrid(items = []) {
    const previewGrid = document.getElementById("previewGrid");
    if (!previewGrid) {
        return;
    }

    if (items.length === 0) {
        clearPreviewGrid();
        return;
    }

    // Clear grid before populating
    previewGrid.innerHTML = "";

    // Sort items by rank (SRS stage) - null/undefined (locked) first, then lower numbers first
    const sortedItems = sortKanjiByRank(items);

    // Show all kanji in preview
    sortedItems.forEach((item) => {
        const kanjiEl = document.createElement("a");

        // Get assignment data to determine SRS stage
        const assignment = cachedKanjiData.assignments.get(item.id);
        const srsStage = assignment ? assignment.srsStage : null;
        const colorClasses = getSrsStageColorClass(srsStage);

        // Build tooltip text
        let stageInfo = "";
        if (srsStage !== null && srsStage !== undefined) {
            const stageName = getSrsStageName(srsStage);
            stageInfo = ` [${stageName}]`;
        }
        const tooltipText = `${escapeHtml(
            item.meanings.join(", ")
        )} | ${escapeHtml(item.readings.join(", "))}${stageInfo}`;

        kanjiEl.className = `tooltip h-10 rounded flex flex-col items-center justify-center text-lg font-medium hover:brightness-95 transition-all cursor-pointer ${colorClasses}`;
        kanjiEl.setAttribute("data-tip", tooltipText);
        kanjiEl.href = `https://www.wanikani.com/kanji/${encodeURIComponent(
            item.kanji
        )}`;
        kanjiEl.target = "_blank";
        kanjiEl.rel = "noopener noreferrer";

        // Create kanji content with progress bar
        const kanjiContent = document.createElement("div");
        kanjiContent.className = "flex flex-col items-center";
        kanjiContent.innerHTML = `
            <span class="text-lg">${escapeHtml(item.kanji)}</span>
            ${generateProgressBar(srsStage)}
        `;
        kanjiEl.appendChild(kanjiContent);

        previewGrid.appendChild(kanjiEl);
    });
}

// Helper function to get SRS stage name
function getSrsStageName(srsStage) {
    if (srsStage >= 1 && srsStage <= 4) {
        return `Apprentice ${srsStage}`;
    }
    if (srsStage >= 5 && srsStage <= 6) {
        return `Guru ${srsStage - 4}`;
    }
    if (srsStage === 7) {
        return "Master";
    }
    if (srsStage === 8) {
        return "Enlightened";
    }
    if (srsStage === 9) {
        return "Burned";
    }
    return "Locked";
}

// Helper function to generate progress bar HTML based on SRS stage
// @param {number|null} srsStage - The SRS stage number
// @param {boolean} alwaysShowContainer - If true, always returns a container div for uniform sizing
function generateProgressBar(srsStage, alwaysShowContainer = false) {
    if (srsStage === null || srsStage === undefined) {
        // Locked - return empty container only if alwaysShowContainer is true
        return alwaysShowContainer
            ? '<div class="progress-segments"></div>'
            : "";
    }

    let segments = 1;
    let filledSegments = 0;
    let stageClass = "";

    if (srsStage >= 1 && srsStage <= 4) {
        // Apprentice: 4 segments, filled based on stage
        segments = 4;
        filledSegments = srsStage;
        stageClass = "apprentice";
    } else if (srsStage >= 5 && srsStage <= 6) {
        // Guru: 2 segments, filled based on stage
        segments = 2;
        filledSegments = srsStage - 4;
        stageClass = "guru";
    } else {
        // Master, Enlightened, Burned - return empty container only if alwaysShowContainer is true
        return alwaysShowContainer
            ? '<div class="progress-segments"></div>'
            : "";
    }

    let segmentsHtml = "";
    for (let i = 0; i < segments; i++) {
        const isFilled = i < filledSegments;
        const filledClass = isFilled ? "filled" : "";
        segmentsHtml += `<div class="progress-segment ${stageClass} ${filledClass}"></div>`;
    }

    return `<div class="progress-segments">${segmentsHtml}</div>`;
}

function clearPreviewGrid() {
    const previewGrid = document.getElementById("previewGrid");
    previewGrid.innerHTML =
        '<div class="col-span-full text-center text-sm text-base-content/60 py-4">Enter a valid token to preview kanji</div>';
}

function showPreviewSkeleton() {
    const previewGrid = document.getElementById("previewGrid");
    previewGrid.innerHTML = "";

    // Show 32 skeleton placeholders (typical for a WaniKani level)
    for (let i = 0; i < 32; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton h-10 rounded";
        previewGrid.appendChild(skeleton);
    }
}

// Store the disabled state of buttons before loading
let previouslyDisabledElements = new Map();
let isInitialLoad = true; // Track if this is the first load

// Helper functions to show/hide loading states
function showLoadingState() {
    // Show skeletons for level display
    document.getElementById("levelDisplay").classList.add("hidden");
    document.getElementById("levelDisplaySkeleton").classList.remove("hidden");

    // Show skeletons for kanji count
    document.getElementById("kanjiCountDisplay").classList.add("hidden");
    document.getElementById("kanjiCountSkeleton").classList.remove("hidden");

    // Store and disable only API-related action buttons (but skip storing on initial load)
    const actionButtons = [
        "startAllBtn",
        "selectKanjiBtn",
        "selectLessonBtn",
        "learnKanjiBtn",
        "openFullSelector",
    ];
    actionButtons.forEach((id) => {
        const element = document.getElementById(id);
        if (!isInitialLoad) {
            previouslyDisabledElements.set(id, element.disabled);
        }
        element.disabled = true;
    });

    // Disable level selector during API calls (but keep filters and mode toggles enabled)
    const levelElement = document.getElementById("level");
    if (!isInitialLoad) {
        previouslyDisabledElements.set("level", levelElement.disabled);
    }
    levelElement.disabled = true;

    // Disable token input and toggle button during API calls
    const tokenInput = document.getElementById("token");
    const toggleTokenBtn = document.getElementById("toggleToken");
    if (!isInitialLoad) {
        previouslyDisabledElements.set("token", tokenInput.disabled);
        previouslyDisabledElements.set("toggleToken", toggleTokenBtn.disabled);
    }
    tokenInput.disabled = true;
    toggleTokenBtn.disabled = true;
}

function hideLoadingState() {
    // Hide skeletons for level display
    document.getElementById("levelDisplay").classList.remove("hidden");
    document.getElementById("levelDisplaySkeleton").classList.add("hidden");

    // Hide skeletons for kanji count
    document.getElementById("kanjiCountDisplay").classList.remove("hidden");
    document.getElementById("kanjiCountSkeleton").classList.add("hidden");

    // On initial load, don't restore states - let the calling code set them properly
    if (isInitialLoad) {
        isInitialLoad = false;
        // After initial load completes, update button states based on mode toggles
        // Use setTimeout to ensure this runs after the current call stack completes
        setTimeout(() => {
            if (typeof updateLoadButtonState === "function") {
                updateLoadButtonState();
            }
        }, 0);
        return;
    }

    // Restore only the API-related action buttons to their previous state
    const actionButtons = [
        "startAllBtn",
        "selectKanjiBtn",
        "selectLessonBtn",
        "learnKanjiBtn",
        "openFullSelector",
    ];
    actionButtons.forEach((id) => {
        const element = document.getElementById(id);
        const wasDisabled = previouslyDisabledElements.get(id);
        if (wasDisabled !== undefined) {
            element.disabled = wasDisabled;
        }
    });

    // Restore level selector to its previous state
    const levelElement = document.getElementById("level");
    const levelWasDisabled = previouslyDisabledElements.get("level");
    if (levelWasDisabled !== undefined) {
        levelElement.disabled = levelWasDisabled;
    }

    // Restore token input and toggle button
    const tokenInput = document.getElementById("token");
    const toggleTokenBtn = document.getElementById("toggleToken");
    const tokenWasDisabled = previouslyDisabledElements.get("token");
    const toggleWasDisabled = previouslyDisabledElements.get("toggleToken");
    if (tokenWasDisabled !== undefined) {
        tokenInput.disabled = tokenWasDisabled;
    }
    if (toggleWasDisabled !== undefined) {
        toggleTokenBtn.disabled = toggleWasDisabled;
    }

    // Clear the stored states
    previouslyDisabledElements.clear();
}

// Initialize preview with skeleton and disable all controls during initial load
showPreviewSkeleton();
showLoadingState();

// Open full selector button
document.getElementById("openFullSelector").addEventListener("click", () => {
    document.getElementById("selectKanjiBtn").click();
});

// Note: Token input change is handled in event-handlers.js
// which calls preloadKanjiData() to fetch data once

// Update count when filters change (client-side filtering only, no API calls)
document
    .getElementById("srsFilterToggle")
    .addEventListener("change", updateKanjiCountAndPreview);
document
    .getElementById("unlockedOnlyToggle")
    .addEventListener("change", updateKanjiCountAndPreview);

// When level changes, preload new data
levelSelect.addEventListener("change", preloadKanjiData);
