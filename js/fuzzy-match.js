// WaniKanji - Fuzzy String Matching Utility

/**
 * Finds the best fuzzy match from a list of correct answers
 * Uses fuzzball.js library for fuzzy string matching
 * @param {string} userAnswer - The user's answer
 * @param {string[]} correctAnswers - Array of acceptable answers
 * @param {number} threshold - Minimum similarity percentage (default 80)
 * @returns {{ isMatch: boolean, hasTypo: boolean, bestMatch: string|null, similarity: number }}
 */
function findBestFuzzyMatch(userAnswer, correctAnswers, threshold = 80) {
    // Default safe result for error cases
    const defaultResult = {
        isMatch: false,
        hasTypo: false,
        bestMatch: null,
        similarity: 0,
    };

    // Input validation: userAnswer must be a non-empty string
    if (typeof userAnswer !== "string") {
        console.warn(
            "findBestFuzzyMatch: userAnswer is not a string",
            userAnswer
        );
        return defaultResult;
    }

    // Coerce type: trim whitespace
    userAnswer = userAnswer.trim();

    if (userAnswer.length === 0) {
        console.warn("findBestFuzzyMatch: userAnswer is empty after trimming");
        return defaultResult;
    }

    // Input validation: correctAnswers must be a non-empty array
    if (!Array.isArray(correctAnswers)) {
        console.warn(
            "findBestFuzzyMatch: correctAnswers is not an array",
            correctAnswers
        );
        return defaultResult;
    }

    if (correctAnswers.length === 0) {
        console.warn("findBestFuzzyMatch: correctAnswers array is empty");
        return defaultResult;
    }

    // Check if fuzzball library is available
    const hasFuzzball =
        typeof fuzzball !== "undefined" &&
        fuzzball &&
        typeof fuzzball.ratio === "function";

    if (!hasFuzzball) {
        console.warn(
            "findBestFuzzyMatch: fuzzball library is not available, falling back to exact match only"
        );
        // Fallback: simple exact match (case-insensitive)
        for (const correctAnswer of correctAnswers) {
            if (typeof correctAnswer === "string") {
                const trimmedCorrect = correctAnswer.trim();
                if (userAnswer.toLowerCase() === trimmedCorrect.toLowerCase()) {
                    return {
                        isMatch: true,
                        hasTypo: false,
                        bestMatch: trimmedCorrect,
                        similarity: 100,
                    };
                }
            }
        }
        // No exact match found - return default no-match result
        return defaultResult;
    }

    let bestResult = { ...defaultResult };

    try {
        for (const correctAnswer of correctAnswers) {
            // Skip invalid entries in correctAnswers array
            if (typeof correctAnswer !== "string") {
                console.warn(
                    "findBestFuzzyMatch: skipping non-string correctAnswer",
                    correctAnswer
                );
                continue;
            }

            const trimmedCorrect = correctAnswer.trim();

            if (trimmedCorrect.length === 0) {
                console.warn(
                    "findBestFuzzyMatch: skipping empty correctAnswer after trimming"
                );
                continue;
            }

            // Exact match check first (case-insensitive)
            if (userAnswer.toLowerCase() === trimmedCorrect.toLowerCase()) {
                return {
                    isMatch: true,
                    hasTypo: false,
                    bestMatch: trimmedCorrect,
                    similarity: 100,
                };
            }

            // Use fuzzball.js ratio for similarity scoring (0-100)
            const similarity = fuzzball.ratio(userAnswer, trimmedCorrect);

            if (similarity >= threshold && similarity > bestResult.similarity) {
                bestResult = {
                    isMatch: true,
                    hasTypo: similarity < 100, // Has typo if not exactly 100
                    bestMatch: trimmedCorrect,
                    similarity: similarity,
                };
            }

            // If we found an exact match, return immediately
            if (similarity === 100) {
                break;
            }
        }
    } catch (error) {
        console.error(
            "findBestFuzzyMatch: error during fuzzy matching, falling back to exact match",
            error
        );
        // Fallback: simple exact match (case-insensitive)
        try {
            for (const correctAnswer of correctAnswers) {
                if (typeof correctAnswer === "string") {
                    const trimmedCorrect = correctAnswer.trim();
                    if (
                        userAnswer.toLowerCase() ===
                        trimmedCorrect.toLowerCase()
                    ) {
                        return {
                            isMatch: true,
                            hasTypo: false,
                            bestMatch: trimmedCorrect,
                            similarity: 100,
                        };
                    }
                }
            }
        } catch (fallbackError) {
            console.error(
                "findBestFuzzyMatch: error during fallback exact match",
                fallbackError
            );
        }
        // Return default no-match result
        return defaultResult;
    }

    return bestResult;
}
