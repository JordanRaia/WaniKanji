// WaniKanji - Kanji Item Utilities
// Shared functions for rendering kanji items in selection screens

/**
 * Generates tooltip text for a kanji item
 * @param {Object} item - Kanji item with meanings and readings
 * @param {string} stageInfo - Stage information to append (e.g., " [Apprentice 1]")
 * @returns {string} Tooltip text
 */
function generateKanjiTooltipText(item, stageInfo = "") {
    const meanings = Array.isArray(item?.meanings) ? item.meanings : [];
    const readings = Array.isArray(item?.readings) ? item.readings : [];
    return `${escapeHtml(meanings.join(", "))} | ${escapeHtml(
        readings.join(", ")
    )}${stageInfo}`;
}
/**
 * Generates HTML for a kanji selection item
 * @param {Object} item - Kanji item with id, kanji, meanings, and readings
 * @param {number|null} srsStage - SRS stage number
 * @param {string} checkboxClass - CSS class for the checkbox (e.g., "kanji-checkbox", "lesson-kanji-checkbox")
 * @returns {string} HTML string for kanji item
 */
function generateKanjiItemHTML(item, srsStage, checkboxClass) {
    // Get color classes and stage info
    const colorClasses = getSrsStageColorClass(srsStage);

    // Build tooltip text
    let stageInfo = "";
    if (srsStage !== null && srsStage !== undefined) {
        const stageName = getSrsStageName(srsStage);
        stageInfo = ` [${stageName}]`;
    }
    const tooltipText = generateKanjiTooltipText(item, stageInfo);

    // Determine stage name for filtering
    const stageName = getSimpleStageName(srsStage);

    return `
        <div class="tooltip tooltip-top text-2xl h-12 w-12 rounded ${colorClasses} flex flex-col items-center justify-center" data-tip="${tooltipText}">
            <span>${escapeHtml(item.kanji)}</span>
            ${generateProgressBar(srsStage, true)}
        </div>
        <input type="checkbox" 
               class="checkbox checkbox-sm ${checkboxClass} mt-1" 
               data-kanji-id="${escapeHtml(String(item.id))}" 
               data-srs-stage="${escapeHtml(
                   stageName
               )}"               checked />
    `;
}

/**
 * CSS class for kanji item containers
 */
const KANJI_ITEM_CONTAINER_CLASS =
    "flex flex-col items-center cursor-pointer hover:bg-base-300 p-2 rounded-lg transition-colors";

/**
 * Creates a kanji selection item element
 * @param {Object} item - Kanji item with id, kanji, meanings, and readings
 * @param {string} checkboxClass - CSS class for the checkbox
 * @param {Object} [cachedKanjiData=window.cachedKanjiData] - Optional cached kanji data object with assignments
 * @returns {HTMLLabelElement} Label element containing kanji item
 */
function createKanjiSelectionItem(
    item,
    checkboxClass,
    cachedKanjiData = window.cachedKanjiData
) {
    // Get assignment data to determine SRS stage
    const assignment = cachedKanjiData?.assignments?.get(item.id);
    const srsStage = assignment ? assignment.srsStage : null;

    const kanjiItem = document.createElement("label");
    kanjiItem.className = KANJI_ITEM_CONTAINER_CLASS;
    kanjiItem.innerHTML = generateKanjiItemHTML(item, srsStage, checkboxClass);

    return kanjiItem;
}
