// WaniKanji - Romanji/Hiragana Conversion

// Function to convert hiragana back to romanji for user feedback
function hiraganaToRomanji(hiragana) {
    const hiraganaToRomanjiMap = {
        あ: "a",
        い: "i",
        う: "u",
        え: "e",
        お: "o",
        か: "ka",
        き: "ki",
        く: "ku",
        け: "ke",
        こ: "ko",
        が: "ga",
        ぎ: "gi",
        ぐ: "gu",
        げ: "ge",
        ご: "go",
        さ: "sa",
        し: "shi",
        す: "su",
        せ: "se",
        そ: "so",
        ざ: "za",
        じ: "ji",
        ず: "zu",
        ぜ: "ze",
        ぞ: "zo",
        た: "ta",
        ち: "chi",
        つ: "tsu",
        て: "te",
        と: "to",
        だ: "da",
        ぢ: "ji",
        づ: "zu",
        で: "de",
        ど: "do",
        な: "na",
        に: "ni",
        ぬ: "nu",
        ね: "ne",
        の: "no",
        は: "ha",
        ひ: "hi",
        ふ: "fu",
        へ: "he",
        ほ: "ho",
        ば: "ba",
        び: "bi",
        ぶ: "bu",
        べ: "be",
        ぼ: "bo",
        ぱ: "pa",
        ぴ: "pi",
        ぷ: "pu",
        ぺ: "pe",
        ぽ: "po",
        ま: "ma",
        み: "mi",
        む: "mu",
        め: "me",
        も: "mo",
        や: "ya",
        ゆ: "yu",
        よ: "yo",
        ら: "ra",
        り: "ri",
        る: "ru",
        れ: "re",
        ろ: "ro",
        わ: "wa",
        を: "wo",
        ん: "n",
        きゃ: "kya",
        きゅ: "kyu",
        きょ: "kyo",
        ぎゃ: "gya",
        ぎゅ: "gyu",
        ぎょ: "gyo",
        しゃ: "sha",
        しゅ: "shu",
        しょ: "sho",
        じゃ: "ja",
        じゅ: "ju",
        じょ: "jo",
        ちゃ: "cha",
        ちゅ: "chu",
        ちょ: "cho",
        にゃ: "nya",
        にゅ: "nyu",
        にょ: "nyo",
        ひゃ: "hya",
        ひゅ: "hyu",
        ひょ: "hyo",
        びゃ: "bya",
        びゅ: "byu",
        びょ: "byo",
        ぴゃ: "pya",
        ぴゅ: "pyu",
        ぴょ: "pyo",
        みゃ: "mya",
        みゅ: "myu",
        みょ: "myo",
        りゃ: "rya",
        りゅ: "ryu",
        りょ: "ryo",
        っ: "tsu",
    };

    let result = hiragana;
    // Sort by length (longest first) to avoid partial matches
    const sortedKeys = Object.keys(hiraganaToRomanjiMap).sort(
        (a, b) => b.length - a.length
    );

    for (const key of sortedKeys) {
        result = result.replace(
            new RegExp(key, "g"),
            hiraganaToRomanjiMap[key]
        );
    }

    return result;
}

// Romanji to Hiragana conversion mapping
const romanjiToHiragana = {
    // Basic vowels
    a: "あ",
    i: "い",
    u: "う",
    e: "え",
    o: "お",

    // K series
    ka: "か",
    ki: "き",
    ku: "く",
    ke: "け",
    ko: "こ",
    kya: "きゃ",
    kyu: "きゅ",
    kyo: "きょ",

    // G series
    ga: "が",
    gi: "ぎ",
    gu: "ぐ",
    ge: "げ",
    go: "ご",
    gya: "ぎゃ",
    gyu: "ぎゅ",
    gyo: "ぎょ",

    // S series
    sa: "さ",
    shi: "し",
    si: "し",
    su: "す",
    se: "せ",
    so: "そ",
    sha: "しゃ",
    shu: "しゅ",
    sho: "しょ",
    za: "ざ",
    ji: "じ",
    zu: "ず",
    ze: "ぜ",
    zo: "ぞ",
    ja: "じゃ",
    ju: "じゅ",
    jo: "じょ",

    // T series
    ta: "た",
    chi: "ち",
    ti: "ち",
    tsu: "つ",
    tu: "つ",
    te: "て",
    to: "と",
    cha: "ちゃ",
    chu: "ちゅ",
    cho: "ちょ",
    da: "だ",
    de: "で",
    do: "ど",

    // N series
    na: "な",
    ni: "に",
    nu: "ぬ",
    ne: "ね",
    no: "の",
    nya: "にゃ",
    nyu: "にゅ",
    nyo: "にょ",

    // H series
    ha: "は",
    hi: "ひ",
    fu: "ふ",
    hu: "ふ",
    he: "へ",
    ho: "ほ",
    hya: "ひゃ",
    hyu: "ひゅ",
    hyo: "ひょ",
    ba: "ば",
    bi: "び",
    bu: "ぶ",
    be: "べ",
    bo: "ぼ",
    bya: "びゃ",
    byu: "びゅ",
    byo: "びょ",
    pa: "ぱ",
    pi: "ぴ",
    pu: "ぷ",
    pe: "ぺ",
    po: "ぽ",
    pya: "ぴゃ",
    pyu: "ぴゅ",
    pyo: "ぴょ",

    // M series
    ma: "ま",
    mi: "み",
    mu: "む",
    me: "め",
    mo: "も",
    mya: "みゃ",
    myu: "みゅ",
    myo: "みょ",

    // Y series
    ya: "や",
    yu: "ゆ",
    yo: "よ",

    // R series
    ra: "ら",
    ri: "り",
    ru: "る",
    re: "れ",
    ro: "ろ",
    rya: "りゃ",
    ryu: "りゅ",
    ryo: "りょ",

    // W series
    wa: "わ",
    wo: "を",
    n: "ん",

    // Small tsu
    xtsu: "っ",
    xtu: "っ",

    // Long vowels
    aa: "ああ",
    ii: "いい",
    uu: "うう",
    ee: "ええ",
    oo: "おお",
    ou: "おう",
    ei: "えい",
};

function convertRomanjiToHiragana(romanji) {
    let result = romanji.toLowerCase();

    // Handle double n for ん (nn -> ん) - must be done before small tsu
    result = result.replace(/nn/g, "ん");

    // Handle special cases: consonant + ya/yu/yo combinations (before general ya/yu/yo conversion)
    // J series
    result = result.replace(/jya/g, "じゃ");
    result = result.replace(/jyu/g, "じゅ");
    result = result.replace(/jyo/g, "じょ");

    // K series
    result = result.replace(/kya/g, "きゃ");
    result = result.replace(/kyu/g, "きゅ");
    result = result.replace(/kyo/g, "きょ");

    // G series
    result = result.replace(/gya/g, "ぎゃ");
    result = result.replace(/gyu/g, "ぎゅ");
    result = result.replace(/gyo/g, "ぎょ");

    // S series
    result = result.replace(/sha/g, "しゃ");
    result = result.replace(/shu/g, "しゅ");
    result = result.replace(/sho/g, "しょ");

    // T series
    result = result.replace(/cha/g, "ちゃ");
    result = result.replace(/chu/g, "ちゅ");
    result = result.replace(/cho/g, "ちょ");

    // N series
    result = result.replace(/nya/g, "にゃ");
    result = result.replace(/nyu/g, "にゅ");
    result = result.replace(/nyo/g, "にょ");

    // H series
    result = result.replace(/hya/g, "ひゃ");
    result = result.replace(/hyu/g, "ひゅ");
    result = result.replace(/hyo/g, "ひょ");

    // B series
    result = result.replace(/bya/g, "びゃ");
    result = result.replace(/byu/g, "びゅ");
    result = result.replace(/byo/g, "びょ");

    // P series
    result = result.replace(/pya/g, "ぴゃ");
    result = result.replace(/pyu/g, "ぴゅ");
    result = result.replace(/pyo/g, "ぴょ");

    // M series
    result = result.replace(/mya/g, "みゃ");
    result = result.replace(/myu/g, "みゅ");
    result = result.replace(/myo/g, "みょ");

    // R series
    result = result.replace(/rya/g, "りゃ");
    result = result.replace(/ryu/g, "りゅ");
    result = result.replace(/ryo/g, "りょ");

    // Handle small tsu (double consonants) - but not for 'n' since we handled nn above
    result = result.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, (match, char) => {
        // Don't add small tsu for 'n' since nn should become ん, not っん
        if (char === "n") {
            return match;
        }
        return "っ" + (romanjiToHiragana[char] || char);
    });

    // Create a modified mapping that excludes standalone 'n' to avoid premature conversion
    // A standalone 'n' at the end should not be converted yet (user might type 'na', 'ni', etc.)
    const mappingWithoutN = { ...romanjiToHiragana };
    delete mappingWithoutN.n;

    // Use the mapping object without 'n'
    // Sort by length (longest first) to avoid partial matches
    const sortedKeys = Object.keys(mappingWithoutN).sort(
        (a, b) => b.length - a.length
    );

    // Apply conversions in order of length
    for (const key of sortedKeys) {
        if (result.includes(key)) {
            result = result.replace(new RegExp(key, "g"), mappingWithoutN[key]);
        }
    }

    // Only convert standalone 'n' to ん if it's followed by a consonant or space (not at the very end)
    // This allows 'n' + vowel combinations to work (na, ni, nu, ne, no)
    // Exclude 'y' because it's used in special combinations (nya, nyu, nyo)
    result = result.replace(/n([bcdfghjklmpqrstvwxz])/g, "ん$1");
    result = result.replace(/n\s/g, "ん ");

    return result;
}
