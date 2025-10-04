// WaniKanji - API Functions

async function fetchUserCurrentLevel(token) {
    const url = "https://api.wanikani.com/v2/user";
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) throw new Error(await resp.text());
    const json = await resp.json();
    return json.data.level;
}

async function fetchKanjiForLevel(token, level) {
    const base = "https://api.wanikani.com/v2/subjects";
    const url = `${base}?types=kanji&levels=${encodeURIComponent(level)}`;
    const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
    });
    if (!resp.ok) throw new Error(await resp.text());
    const json = await resp.json();
    return json.data.map((s) => {
        return {
            id: s.id,
            kanji: s.data.characters || "",
            meanings: s.data.meanings.map((m) => m.meaning),
            readings: s.data.readings.map((r) => r.reading),
        };
    });
}
