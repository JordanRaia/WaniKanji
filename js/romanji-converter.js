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
    tsu: "つ",
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

    // Mapping that includes all combinations
    const allMappings = {
        // 3-character combinations first
        kya: "きゃ",
        kyu: "きゅ",
        kyo: "きょ",
        gya: "ぎゃ",
        gyu: "ぎゅ",
        gyo: "ぎょ",
        sha: "しゃ",
        shu: "しゅ",
        sho: "しょ",
        ja: "じゃ",
        ju: "じゅ",
        jo: "じょ",
        cha: "ちゃ",
        chu: "ちゅ",
        cho: "ちょ",
        nya: "にゃ",
        nyu: "にゅ",
        nyo: "にょ",
        hya: "ひゃ",
        hyu: "ひゅ",
        hyo: "ひょ",
        bya: "びゃ",
        byu: "びゅ",
        byo: "びょ",
        pya: "ぴゃ",
        pyu: "ぴゅ",
        pyo: "ぴょ",
        mya: "みゃ",
        myu: "みゅ",
        myo: "みょ",
        rya: "りゃ",
        ryu: "りゅ",
        ryo: "りょ",

        // 2-character combinations
        ka: "か",
        ki: "き",
        ku: "く",
        ke: "け",
        ko: "こ",
        ga: "が",
        gi: "ぎ",
        gu: "ぐ",
        ge: "げ",
        go: "ご",
        sa: "さ",
        shi: "し",
        su: "す",
        se: "せ",
        so: "そ",
        za: "ざ",
        ji: "じ",
        zu: "ず",
        ze: "ぜ",
        zo: "ぞ",
        ta: "た",
        chi: "ち",
        tsu: "つ",
        te: "て",
        to: "と",
        da: "だ",
        de: "で",
        do: "ど",
        na: "な",
        ni: "に",
        nu: "ぬ",
        ne: "ね",
        no: "の",
        ha: "は",
        hi: "ひ",
        fu: "ふ",
        he: "へ",
        ho: "ほ",
        ba: "ば",
        bi: "び",
        bu: "ぶ",
        be: "べ",
        bo: "ぼ",
        pa: "ぱ",
        pi: "ぴ",
        pu: "ぷ",
        pe: "ぺ",
        po: "ぽ",
        ma: "ま",
        mi: "み",
        mu: "む",
        me: "め",
        mo: "も",
        ya: "や",
        yu: "ゆ",
        yo: "よ",
        ra: "ら",
        ri: "り",
        ru: "る",
        re: "れ",
        ro: "ろ",
        wa: "わ",
        wo: "を",

        // Special cases
        xtsu: "っ",
        xtu: "っ",
        aa: "ああ",
        ii: "いい",
        uu: "うう",
        ee: "ええ",
        oo: "おお",
        ou: "おう",
        ei: "えい",

        // Single characters (only convert if not part of a larger combination)
        a: "あ",
        i: "い",
        u: "う",
        e: "え",
        o: "お",
    };

    // Sort by length (longest first) to avoid partial matches
    const sortedKeys = Object.keys(allMappings).sort(
        (a, b) => b.length - a.length
    );

    // Apply conversions in order of length
    for (const key of sortedKeys) {
        if (result.includes(key)) {
            result = result.replace(new RegExp(key, "g"), allMappings[key]);
        }
    }

    return result;
}
