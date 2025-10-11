// WaniKanji - SRS (Spaced Repetition System) Utilities

// Helper function to get simple stage name for filtering
function getSimpleStageName(srsStage) {
    if (srsStage === null || srsStage === undefined) {
        return "locked";
    }
    if (srsStage >= 1 && srsStage <= 4) {
        return "apprentice";
    }
    if (srsStage >= 5 && srsStage <= 6) {
        return "guru";
    }
    if (srsStage === 7) {
        return "master";
    }
    if (srsStage === 8) {
        return "enlightened";
    }
    if (srsStage === 9) {
        return "burned";
    }
    return "locked";
}
