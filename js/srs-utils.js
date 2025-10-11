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

// Helper function to get SRS stage name with detail
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
