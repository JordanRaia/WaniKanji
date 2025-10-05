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
    let bestResult = {
        isMatch: false,
        hasTypo: false,
        bestMatch: null,
        similarity: 0,
    };

    for (const correctAnswer of correctAnswers) {
        // Exact match check first
        if (userAnswer === correctAnswer) {
            return {
                isMatch: true,
                hasTypo: false,
                bestMatch: correctAnswer,
                similarity: 100,
            };
        }

        // Use fuzzball.js ratio for similarity scoring (0-100)
        const similarity = fuzzball.ratio(userAnswer, correctAnswer);

        if (similarity >= threshold && similarity > bestResult.similarity) {
            bestResult = {
                isMatch: true,
                hasTypo: similarity < 100, // Has typo if not exactly 100
                bestMatch: correctAnswer,
                similarity: similarity,
            };
        }

        // If we found an exact match, return immediately
        if (similarity === 100) {
            break;
        }
    }

    return bestResult;
}
