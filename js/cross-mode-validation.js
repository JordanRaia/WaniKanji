// WaniKanji - Cross-Mode Validation

// Function to check if answer would be correct in opposite mode
function checkCrossModeValidation(card, userAnswer) {
    if (!card || !userAnswer.trim()) {
        return null;
    }

    const normalizedAnswer = normalize(userAnswer);

    // If current mode is kanji-to-english, check if answer matches readings
    if (card.questionType === "kanji-to-english") {
        for (const reading of card.readings) {
            // Check if user typed a reading (hiragana or romanji) instead of English
            if (normalize(reading) === normalizedAnswer) {
                return {
                    isCorrectInOtherMode: true,
                    otherMode: "reading",
                    correctAnswer: reading,
                };
            }

            // Check romanji conversion (e.g., user typed "juu" instead of じゅう)
            const convertedHiragana = convertRomanjiToHiragana(userAnswer);
            if (normalize(reading) === normalize(convertedHiragana)) {
                return {
                    isCorrectInOtherMode: true,
                    otherMode: "reading",
                    correctAnswer: reading,
                };
            }
        }
    } // If current mode is kanji-to-reading, check if answer matches meanings
    else if (card.questionType === "kanji-to-reading") {
        for (const meaning of card.meanings) {
            // Check if user typed English meaning instead of Japanese reading
            if (normalize(meaning) === normalizedAnswer) {
                return {
                    isCorrectInOtherMode: true,
                    otherMode: "meaning",
                    correctAnswer: meaning,
                };
            }

            // Check mixed hiragana/romanji (e.g., user typed "てn" meaning "ten")
            if (
                /[a-zA-Z]/.test(userAnswer) &&
                /[\u3040-\u309F]/.test(userAnswer)
            ) {
                const hiraganaPart = userAnswer.replace(/[a-zA-Z]/g, "");
                const romanjiPart = userAnswer.replace(/[^a-zA-Z]/g, "");
                const combinedRomanji =
                    hiraganaToRomanji(hiraganaPart) + romanjiPart;

                if (normalize(meaning) === normalize(combinedRomanji)) {
                    return {
                        isCorrectInOtherMode: true,
                        otherMode: "meaning",
                        correctAnswer: meaning,
                    };
                }
            }
        }
    }

    return null;
}
