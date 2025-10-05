// WaniKanji - API Functions

async function fetchUserCurrentLevel(token) {
    const url = "https://api.wanikani.com/v2/user";
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const json = await resp.json();
    return json.data.level;
}

async function fetchKanjiForLevel(token, level) {
    const base = "https://api.wanikani.com/v2/subjects";
    const url = `${base}?types=kanji&levels=${encodeURIComponent(level)}`;
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const json = await resp.json();
    return json.data.map((s) => {
        return {
            id: s.id,
            kanji: s.data.characters || "",
            meanings: s.data.meanings.map((m) => m.meaning),
            readings: s.data.readings.map((r) => r.reading),
            meaning_mnemonic: s.data.meaning_mnemonic || "",
            reading_mnemonic: s.data.reading_mnemonic || "",
            visually_similar_subject_ids:
                s.data.visually_similar_subject_ids || [],
            component_subject_ids: s.data.component_subject_ids || [],
            document_url: s.data.document_url || "",
        };
    });
}

async function fetchAssignmentsForSubjects(token, subjectIds) {
    if (!subjectIds || subjectIds.length === 0) {
        return new Map();
    }

    const base = "https://api.wanikani.com/v2/assignments";
    const idsParam = subjectIds.join(",");
    const url = `${base}?subject_ids=${encodeURIComponent(idsParam)}`;
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const json = await resp.json();

    // Create a map of subject_id -> srs_stage
    const assignmentMap = new Map();
    for (const assignment of json.data) {
        assignmentMap.set(assignment.data.subject_id, {
            srsStage: assignment.data.srs_stage,
            unlocked: assignment.data.unlocked_at !== null,
        });
    }
    return assignmentMap;
}

async function fetchKanjiForLevelFilteredBySRS(token, level) {
    // First, fetch all kanji for the level
    const allKanji = await fetchKanjiForLevel(token, level);

    // Get subject IDs
    const subjectIds = allKanji.map((k) => k.id);

    // Fetch assignments to get SRS stages
    const assignments = await fetchAssignmentsForSubjects(token, subjectIds);

    // Filter to only include:
    // 1. Kanji not yet unlocked
    // 2. Kanji with SRS stage < 5 (below Guru: Apprentice stages 1-4, Lessons stage 0)
    return allKanji.filter((kanji) => {
        const assignment = assignments.get(kanji.id);

        // Include if no assignment (never unlocked)
        if (!assignment) {
            return true;
        }

        // Include if SRS stage is less than 5
        // SRS stages: 0 = Lessons, 1-4 = Apprentice, 5-6 = Guru, 7 = Master, 8 = Enlightened, 9 = Burned
        return assignment.srsStage < 5;
    });
}

async function fetchSubjectsByIds(token, subjectIds) {
    if (!subjectIds || subjectIds.length === 0) {
        return [];
    }

    const base = "https://api.wanikani.com/v2/subjects";
    const idsParam = subjectIds.join(",");
    const url = `${base}?ids=${encodeURIComponent(idsParam)}`;
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const json = await resp.json();

    return json.data.map((s) => {
        return {
            id: s.id,
            type: s.object,
            kanji: s.data.characters || "",
            meanings: s.data.meanings.map((m) => m.meaning),
        };
    });
}
