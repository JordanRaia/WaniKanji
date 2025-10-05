// WaniKanji - Lesson Core Logic

// Global lesson state
let lessonQueue = [];
let currentLessonIndex = 0;
let lessonKanjiData = [];
let apiToken = "";
let cachedSubjects = new Map(); // Cache for component radicals and visually similar kanji

async function startLessons(items, token) {
    lessonQueue = items.slice();
    lessonKanjiData = items.slice();
    apiToken = token;
    currentLessonIndex = 0;
    cachedSubjects.clear();

    // Hide other areas and show lesson area
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("lessonSelectionArea").classList.add("hidden");
    document.getElementById("lessonArea").classList.remove("hidden");
    document.getElementById("lessonCompletionArea").classList.add("hidden");

    // Show skeleton while loading
    document.getElementById("lessonLoadingSkeleton").classList.remove("hidden");
    document.getElementById("lessonContent").classList.add("hidden");

    // Prefetch all component radicals and visually similar kanji
    await prefetchAllRelatedSubjects(items, token);

    // Hide skeleton and show content
    document.getElementById("lessonLoadingSkeleton").classList.add("hidden");
    document.getElementById("lessonContent").classList.remove("hidden");

    // Show the first lesson
    showLessonCard();
}

async function prefetchAllRelatedSubjects(items, token) {
    // Collect all unique subject IDs we need to fetch
    const allSubjectIds = new Set();

    for (const item of items) {
        // Add component subject IDs
        if (item.component_subject_ids) {
            item.component_subject_ids.forEach((id) => allSubjectIds.add(id));
        }
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
                cachedSubjects.set(subject.id, subject);
            });
        } catch (error) {
            console.error("Error prefetching related subjects:", error);
        }
    }
}

function showLessonCard() {
    const lesson = lessonQueue[currentLessonIndex];
    if (!lesson) {
        console.error("No lesson at current index");
        return;
    }

    // Update progress
    updateLessonProgress();

    // Display kanji
    document.getElementById("lessonKanjiDisplay").textContent = lesson.kanji;

    // Update WaniKani link
    const wanikaniUrl =
        lesson.document_url ||
        `https://www.wanikani.com/kanji/${encodeURIComponent(lesson.kanji)}`;
    document.getElementById("lessonWanikaniLink").href = wanikaniUrl;

    // Display meanings
    document.getElementById("lessonMeanings").textContent =
        lesson.meanings.join(", ");

    // Display meaning mnemonic with XSS protection
    const meaningMnemonicElement = document.getElementById(
        "lessonMeaningMnemonic"
    );
    if (meaningMnemonicElement) {
        const meaningMnemonicContent =
            lesson.meaning_mnemonic || "No mnemonic available.";
        meaningMnemonicElement.innerHTML = DOMPurify.sanitize(
            meaningMnemonicContent,
            {
                ADD_TAGS: ["radical", "kanji", "vocabulary", "reading", "ja"],
            }
        );
    }

    // Display readings
    document.getElementById("lessonReadings").textContent =
        lesson.readings.join(", ");

    // Display reading mnemonic with XSS protection
    const readingMnemonicElement = document.getElementById(
        "lessonReadingMnemonic"
    );
    if (readingMnemonicElement) {
        const readingMnemonicContent =
            lesson.reading_mnemonic || "No mnemonic available.";
        readingMnemonicElement.innerHTML = DOMPurify.sanitize(
            readingMnemonicContent,
            {
                ADD_TAGS: ["radical", "kanji", "vocabulary", "reading", "ja"],
            }
        );
    }

    // Handle component radicals
    if (
        lesson.component_subject_ids &&
        lesson.component_subject_ids.length > 0
    ) {
        const components = lesson.component_subject_ids
            .map((id) => cachedSubjects.get(id))
            .filter((subject) => subject !== undefined);

        if (components.length > 0) {
            displayComponentRadicals(components);
        } else {
            hideComponentRadicalsSection();
        }
    } else {
        hideComponentRadicalsSection();
    }

    // Handle visually similar kanji
    if (
        lesson.visually_similar_subject_ids &&
        lesson.visually_similar_subject_ids.length > 0
    ) {
        const similarKanji = lesson.visually_similar_subject_ids
            .map((id) => cachedSubjects.get(id))
            .filter((subject) => subject !== undefined);

        if (similarKanji.length > 0) {
            displayVisuallySimilarKanji(similarKanji);
        } else {
            hideVisuallySimilarSection();
        }
    } else {
        hideVisuallySimilarSection();
    }

    // Update button states
    updateLessonNavigationButtons();
}

function displayComponentRadicals(components) {
    const container = document.getElementById("componentRadicals");
    document
        .getElementById("componentRadicalsSection")
        .classList.remove("hidden");
    document
        .getElementById("similarAndRadicalsContainer")
        .classList.remove("hidden");

    container.innerHTML = components
        .map((c) => {
            const meanings = c.meanings.join(", ");
            const typeClass = c.type === "radical" ? "radical" : "kanji";
            return `
            <div class="flex flex-col items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors" title="${escapeHtml(
                meanings
            )}">
                <span class="text-3xl mb-1">${escapeHtml(c.kanji)}</span>
                <span class="text-xs text-base-content/70">${escapeHtml(
                    meanings
                )}</span>
            </div>
        `;
        })
        .join("");
}

function hideComponentRadicalsSection() {
    document.getElementById("componentRadicalsSection").classList.add("hidden");
    checkSimilarAndRadicalsContainer();
}

function displayVisuallySimilarKanji(similarKanji) {
    const container = document.getElementById("visuallySimilarKanji");
    document
        .getElementById("visuallySimilarSection")
        .classList.remove("hidden");
    document
        .getElementById("similarAndRadicalsContainer")
        .classList.remove("hidden");

    container.innerHTML = similarKanji
        .map((k) => {
            const meanings = k.meanings.join(", ");
            return `
            <div class="flex flex-col items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors" title="${escapeHtml(
                meanings
            )}">
                <span class="text-3xl mb-1">${escapeHtml(k.kanji)}</span>
                <span class="text-xs text-base-content/70">${escapeHtml(
                    meanings
                )}</span>
            </div>
        `;
        })
        .join("");
}

function hideVisuallySimilarSection() {
    document.getElementById("visuallySimilarSection").classList.add("hidden");
    checkSimilarAndRadicalsContainer();
}

function checkSimilarAndRadicalsContainer() {
    const radicalsHidden = document
        .getElementById("componentRadicalsSection")
        .classList.contains("hidden");
    const similarHidden = document
        .getElementById("visuallySimilarSection")
        .classList.contains("hidden");

    // Hide container if both sections are hidden
    if (radicalsHidden && similarHidden) {
        document
            .getElementById("similarAndRadicalsContainer")
            .classList.add("hidden");
    }
}

function updateLessonProgress() {
    const current = currentLessonIndex + 1;
    const total = lessonQueue.length;
    document.getElementById(
        "lessonProgress"
    ).textContent = `Lesson ${current} / ${total}`;
}

function updateLessonNavigationButtons() {
    const previousBtn = document.getElementById("previousLessonBtn");
    const nextBtn = document.getElementById("nextLessonBtn");

    // Disable previous button if at first lesson
    previousBtn.disabled = currentLessonIndex === 0;

    // Change next button text if at last lesson
    if (currentLessonIndex === lessonQueue.length - 1) {
        nextBtn.textContent = "Complete Lessons →";
    } else {
        nextBtn.textContent = "Next →";
    }
}

function nextLesson() {
    if (currentLessonIndex < lessonQueue.length - 1) {
        currentLessonIndex++;
        showLessonCard();
    } else {
        // Last lesson, show completion screen
        completeLessons();
    }
}

function previousLesson() {
    if (currentLessonIndex > 0) {
        currentLessonIndex--;
        showLessonCard();
    }
}

function completeLessons() {
    document.getElementById("lessonArea").classList.add("hidden");
    document.getElementById("lessonCompletionArea").classList.remove("hidden");

    // Update completion count
    document.getElementById("completedLessonCount").textContent =
        lessonQueue.length;
}

function showLessonSelectionScreen(items) {
    // Store items for later use
    window.lessonSelectionScreenKanjiItems = items;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("lessonSelectionArea").classList.remove("hidden");

    const kanjiGrid = document.getElementById("lessonKanjiGrid");
    const totalKanjiCount = document.getElementById("lessonTotalKanjiCount");

    // Clear existing grid
    kanjiGrid.innerHTML = "";

    // Set total count
    totalKanjiCount.textContent = items.length;

    // Create checkboxes for each kanji
    items.forEach((item) => {
        const kanjiItem = document.createElement("label");
        kanjiItem.className =
            "flex flex-col items-center cursor-pointer hover:bg-base-300 p-2 rounded-lg transition-colors";
        kanjiItem.title = `${escapeHtml(
            item.meanings.join(", ")
        )} | ${escapeHtml(item.readings.join(", "))}`;

        kanjiItem.innerHTML = `
            <input type="checkbox" 
                   class="checkbox checkbox-sm lesson-kanji-checkbox" 
                   data-kanji-id="${escapeHtml(String(item.id))}" 
                   checked />
            <span class="text-2xl mt-1">${escapeHtml(item.kanji)}</span>
        `;

        kanjiGrid.appendChild(kanjiItem);
    });

    // Update selected count
    updateLessonSelectedCount();

    // Add event listeners to checkboxes
    document.querySelectorAll(".lesson-kanji-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", updateLessonSelectedCount);
    });
}

function updateLessonSelectedCount() {
    const checked = document.querySelectorAll(".lesson-kanji-checkbox:checked");
    document.getElementById("lessonSelectedCount").textContent = checked.length;

    // Disable start button if no kanji selected
    const startBtn = document.getElementById("startLessonsBtn");
    startBtn.disabled = checked.length === 0;
}
