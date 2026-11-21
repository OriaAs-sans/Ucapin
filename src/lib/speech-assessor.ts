import type {
  PhonemeBreakdownItem,
  PhonemeStatus,
  ScoreBreakdownItem,
  WordMark,
} from "@/types/ucapin";

export interface PhonemeArticulationInfo {
  phonemeLabel: string;
  mouthType: "labiodental-v" | "dental-th" | "postalveolar-sh" | "alveolar-ed";
  title: string;
  steps: string[];
  minimalPairs: string[];
}

const PHONEME_GUIDES_MAP: Record<string, PhonemeArticulationInfo> = {
  "/v/": {
    phonemeLabel: "/v/",
    mouthType: "labiodental-v",
    title: "Cara mengucapkan bunyi /v/ (getar bibir bawah)",
    steps: [
      "Sentuhkan ujung gigi atas ke bibir bawah secara ringan.",
      "Hembuskan udara sambil menggetarkan pita suara di tenggorokan.",
      "Rasakan getaran di bibir bawah. Jika tidak bergetar, bunyinya masih /f/.",
    ],
    minimalPairs: ["very", "fairy", "five", "fife", "visit", "vest", "fest"],
  },
  "/θ/": {
    phonemeLabel: "/θ/",
    mouthType: "dental-th",
    title: "Cara mengucapkan bunyi /θ/ (ujung lidah di antara gigi)",
    steps: [
      "Letakkan ujung lidah ringan di antara tepi gigi atas dan gigi bawah.",
      "Tiupkan udara keluar melalui celah gigi tanpa menekan lidah terlalu rapat.",
      "Tarik lidah masuk saat menyambung ke vokal berikutnya.",
    ],
    minimalPairs: ["think", "tink", "thank", "tank", "third", "both", "boat"],
  },
  "/ð/": {
    phonemeLabel: "/ð/",
    mouthType: "dental-th",
    title: "Cara mengucapkan bunyi /ð/ (desis gigi bersuara)",
    steps: [
      "Sentuhkan ujung lidah ke tepi bawah gigi seri atas.",
      "Alirkan udara keluar sambil menyalakan getaran pita suara.",
      "Jangan menutup aliran udara sepenuhnya seperti saat mengucapkan /d/.",
    ],
    minimalPairs: ["this", "dis", "they", "day", "there", "dare", "then", "den"],
  },
  "/ʃ/": {
    phonemeLabel: "/ʃ/",
    mouthType: "postalveolar-sh",
    title: "Cara mengucapkan bunyi /ʃ/ (bibir membulat lembut)",
    steps: [
      "Tarik ujung lidah sedikit ke belakang langit-langit mulut bagian depan.",
      "Bulatkan bibir sedikit ke depan.",
      "Desiskan udara yang lebih tebal dibanding bunyi /s/ biasa.",
    ],
    minimalPairs: ["shop", "sop", "shuttle", "subtle", "should", "she", "see"],
  },
  "/-ed/": {
    phonemeLabel: "/t/ atau /d/ akhir",
    mouthType: "alveolar-ed",
    title: "Cara mengucapkan konsonan penutup (-ed, -d, -t)",
    steps: [
      "Jangan berhenti di huruf sebelum konsonan terakhir.",
      "Sentuhkan ujung lidah ke langit-langit tepat di belakang gigi atas untuk menutup bunyi /t/ atau /d/.",
      "Beri letupan udara tipis di akhir kata sebagai penanda past tense yang jelas.",
    ],
    minimalPairs: ["worked", "work", "solved", "solve", "closed", "close", "card", "car", "lived", "live"],
  },
};

// Known Indonesian L1 phonetic substitutions mapped to target words
const INDONESIAN_L1_SUBSTITUTIONS: Record<
  string,
  {
    substitutes: string[];
    phonemeKey: string;
    ipa: string;
    errorNote: string;
  }
> = {
  very: {
    substitutes: ["fery", "ferry", "fairy", "berry", "perry"],
    phonemeKey: "/v/",
    ipa: "/ˈvɛri/",
    errorNote: "/v/ jadi /f/",
  },
  visit: {
    substitutes: ["fisit", "fizit", "bisit"],
    phonemeKey: "/v/",
    ipa: "/ˈvɪzɪt/",
    errorNote: "/v/ jadi /f/",
  },
  five: {
    substitutes: ["fife", "fine", "fight", "pipe", "fif"],
    phonemeKey: "/v/",
    ipa: "/faɪv/",
    errorNote: "/v/ akhir jadi /f/",
  },
  available: {
    substitutes: ["afailable", "abailable"],
    phonemeKey: "/v/",
    ipa: "/əˈveɪləbəl/",
    errorNote: "/v/ jadi /f/",
  },
  version: {
    substitutes: ["fersion", "person", "fursion"],
    phonemeKey: "/v/",
    ipa: "/ˈvɜrʒən/",
    errorNote: "/v/ jadi /f/",
  },
  reservation: {
    substitutes: ["reserfation", "reserbation"],
    phonemeKey: "/v/",
    ipa: "/ˌrɛzərˈveɪʃən/",
    errorNote: "/v/ jadi /f/",
  },
  several: {
    substitutes: ["seferal", "seberal"],
    phonemeKey: "/v/",
    ipa: "/ˈsɛvrəl/",
    errorNote: "/v/ jadi /f/",
  },
  invest: {
    substitutes: ["infest", "inbest", "inves"],
    phonemeKey: "/v/",
    ipa: "/ɪnˈvɛst/",
    errorNote: "/v/ jadi /f/",
  },
  think: {
    substitutes: ["tink", "thing", "sink", "ting", "tin"],
    phonemeKey: "/θ/",
    ipa: "/θɪŋk/",
    errorNote: "/θ/ jadi /t/",
  },
  thank: {
    substitutes: ["tank", "tang", "sank", "tenk"],
    phonemeKey: "/θ/",
    ipa: "/θæŋk/",
    errorNote: "/θ/ jadi /t/",
  },
  through: {
    substitutes: ["true", "tru", "trough", "threw"],
    phonemeKey: "/θ/",
    ipa: "/θruː/",
    errorNote: "/θ/ jadi /t/",
  },
  third: {
    substitutes: ["tird", "turd", "tir", "dirt"],
    phonemeKey: "/θ/",
    ipa: "/θɜrd/",
    errorNote: "/θ/ jadi /t/",
  },
  both: {
    substitutes: ["boat", "bot", "bose", "bought"],
    phonemeKey: "/θ/",
    ipa: "/boʊθ/",
    errorNote: "/θ/ akhir jadi /t/",
  },
  methods: {
    substitutes: ["metods", "method", "metod"],
    phonemeKey: "/θ/",
    ipa: "/ˈmɛθədz/",
    errorNote: "/θ/ jadi /t/",
  },
  thinking: {
    substitutes: ["tinking", "sinking", "tingking"],
    phonemeKey: "/θ/",
    ipa: "/ˈθɪŋkɪŋ/",
    errorNote: "/θ/ jadi /t/",
  },
  this: {
    substitutes: ["dis", "diz", "tis", "these"],
    phonemeKey: "/ð/",
    ipa: "/ðɪs/",
    errorNote: "/ð/ jadi /d/",
  },
  they: {
    substitutes: ["day", "dey", "dai"],
    phonemeKey: "/ð/",
    ipa: "/ðeɪ/",
    errorNote: "/ð/ jadi /d/",
  },
  the: {
    substitutes: ["de", "da", "duh"],
    phonemeKey: "/ð/",
    ipa: "/ðə/",
    errorNote: "/ð/ jadi /d/",
  },
  there: {
    substitutes: ["dare", "der", "dear"],
    phonemeKey: "/ð/",
    ipa: "/ðɛr/",
    errorNote: "/ð/ jadi /d/",
  },
  furthermore: {
    substitutes: ["furdermore", "fathermore"],
    phonemeKey: "/ð/",
    ipa: "/ˈfɜrðərˌmɔr/",
    errorNote: "/ð/ jadi /d/",
  },
  shop: {
    substitutes: ["sop", "soap", "chop", "top"],
    phonemeKey: "/ʃ/",
    ipa: "/ʃɑp/",
    errorNote: "/ʃ/ jadi /s/",
  },
  should: {
    substitutes: ["sould", "suit", "shoot", "sud"],
    phonemeKey: "/ʃ/",
    ipa: "/ʃʊd/",
    errorNote: "/ʃ/ jadi /s/",
  },
  shuttle: {
    substitutes: ["sattel", "subtle", "satel", "shutter"],
    phonemeKey: "/ʃ/",
    ipa: "/ˈʃʌtəl/",
    errorNote: "/ʃ/ jadi /s/",
  },
  solutions: {
    substitutes: ["solusions", "solution", "solusion"],
    phonemeKey: "/ʃ/",
    ipa: "/səˈluːʃənz/",
    errorNote: "/ʃ/ jadi /s/",
  },
  worked: {
    substitutes: ["work", "wor", "walked", "walk", "woke"],
    phonemeKey: "/-ed/",
    ipa: "/wɜrkt/",
    errorNote: "/t/ akhir hilang",
  },
  solved: {
    substitutes: ["solve", "solf", "soft", "soul"],
    phonemeKey: "/-ed/",
    ipa: "/sɑlvd/",
    errorNote: "/vd/ akhir hilang",
  },
  closed: {
    substitutes: ["close", "clos", "clause"],
    phonemeKey: "/-ed/",
    ipa: "/kloʊzd/",
    errorNote: "/d/ akhir hilang",
  },
  card: {
    substitutes: ["car", "cart", "cut", "kar"],
    phonemeKey: "/-ed/",
    ipa: "/kɑrd/",
    errorNote: "/d/ akhir hilang",
  },
  lived: {
    substitutes: ["live", "lif", "leaf", "leave"],
    phonemeKey: "/-ed/",
    ipa: "/lɪvd/",
    errorNote: "/vd/ akhir hilang",
  },
  moved: {
    substitutes: ["move", "muf", "mood"],
    phonemeKey: "/-ed/",
    ipa: "/muːvd/",
    errorNote: "/vd/ akhir hilang",
  },
};

export interface WordCoachDetail {
  word: string;
  ipa: string;
  status: PhonemeStatus;
  heardAs: string;
  note: string;
  phonemeBreakdown: PhonemeBreakdownItem[];
  articulation: PhonemeArticulationInfo;
}

export interface UtteranceAssessmentResult {
  spokenTranscript: string;
  marks: Record<string, WordMark>;
  scores: ScoreBreakdownItem[];
  wordDetails: Record<string, WordCoachDetail>;
  primaryFocusWord: string;
  /** Tempo bicara nyata dari waktu kata (0 bila kurang dari dua kata). */
  wordsPerMinute: number;
  flaggedMistakes: {
    word: string;
    ipa: string;
    phoneme: string;
    errorPattern: string;
    heardAs: string;
    status: PhonemeStatus;
  }[];
}

function cleanToken(t: string): string {
  return t.replace(/[^A-Za-z']/g, "").toLowerCase();
}

function inferPhonemeKeyFromNote(word: string, note = ""): string {
  const lower = word.toLowerCase();
  if (INDONESIAN_L1_SUBSTITUTIONS[lower]) {
    return INDONESIAN_L1_SUBSTITUTIONS[lower].phonemeKey;
  }
  if (note.includes("/v/")) return "/v/";
  if (note.includes("/θ/")) return "/θ/";
  if (note.includes("/ð/")) return "/ð/";
  if (note.includes("/ʃ/")) return "/ʃ/";
  if (
    note.includes("-ed") ||
    note.includes("/t/") ||
    note.includes("/d/") ||
    lower.endsWith("ed")
  ) {
    return "/-ed/";
  }
  return "/v/";
}

export function getArticulationGuideForWord(
  word: string,
  note = ""
): PhonemeArticulationInfo {
  const key = inferPhonemeKeyFromNote(word, note);
  return PHONEME_GUIDES_MAP[key] ?? PHONEME_GUIDES_MAP["/v/"];
}

export interface SpokenWord {
  text: string;
  /** Keyakinan pengenal suara 0..1 untuk kata ini. */
  confidence: number;
  start: number;
  end: number;
}

// Kata fungsi pendek yang hanya terlewat tidak masuk Bank Kesalahan:
// itu soal tata bahasa atau tempo, bukan bunyi.
const FUNCTION_WORDS = new Set([
  "a", "an", "the", "to", "of", "in", "on", "at", "and", "or", "i", "is", "it", "my", "for",
]);

const VOICED_TH_WORDS = new Set([
  "this", "that", "the", "they", "then", "there", "these", "those", "them", "their", "with",
]);

const OK_CONFIDENCE = 0.7;
const ALMOST_CONFIDENCE = 0.4;

function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

// Mengenali pola salah ucap khas penutur Indonesia dari pasangan kata acuan dan kata yang terdengar.
function detectL1Pattern(
  expected: string,
  heard: string
): { phonemeKey: string; note: string } | null {
  const known = INDONESIAN_L1_SUBSTITUTIONS[expected];
  if (known && known.substitutes.includes(heard)) {
    return { phonemeKey: known.phonemeKey, note: known.errorNote };
  }
  for (const suffix of ["ed", "d", "t", "s", "es"]) {
    if (expected.endsWith(suffix) && expected.slice(0, -suffix.length) === heard) {
      return { phonemeKey: "/-ed/", note: `konsonan akhir -${suffix} hilang` };
    }
  }
  if (expected.includes("v") && heard === expected.replace(/v/g, "f")) {
    return { phonemeKey: "/v/", note: "/v/ jadi /f/" };
  }
  if (expected.startsWith("th")) {
    const rest = expected.slice(2);
    if (heard === `t${rest}` || heard === `d${rest}`) {
      return VOICED_TH_WORDS.has(expected)
        ? { phonemeKey: "/ð/", note: "/ð/ jadi /d/" }
        : { phonemeKey: "/θ/", note: "/θ/ jadi /t/" };
    }
  }
  if (expected.includes("sh") && heard === expected.replace(/sh/g, "s")) {
    return { phonemeKey: "/ʃ/", note: "/ʃ/ jadi /s/" };
  }
  return null;
}

type AlignedPair =
  | { kind: "match"; refIdx: number; spoken: SpokenWord }
  | { kind: "sub"; refIdx: number; spoken: SpokenWord }
  | { kind: "missing"; refIdx: number };

const INSERT_COST = 0.8;
const DELETE_COST = 1;

function substitutionCost(ref: string, hyp: string): number {
  if (ref === hyp) return 0;
  if (detectL1Pattern(ref, hyp)) return 0.4;
  const ratio = editDistance(ref, hyp) / Math.max(ref.length, hyp.length);
  return ratio <= 0.4 ? 0.6 : 1.2;
}

// Penyejajaran kata acuan dengan kata terucap (edit distance tingkat kata).
function alignWords(refTokens: string[], spoken: SpokenWord[]): AlignedPair[] {
  const hyp = spoken.map((w) => cleanToken(w.text));
  const n = refTokens.length;
  const m = hyp.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = i * DELETE_COST;
  for (let j = 1; j <= m; j++) dp[0][j] = j * INSERT_COST;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + DELETE_COST,
        dp[i][j - 1] + INSERT_COST,
        dp[i - 1][j - 1] + substitutionCost(refTokens[i - 1], hyp[j - 1])
      );
    }
  }

  const pairs: AlignedPair[] = [];
  let i = n;
  let j = m;
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  while (i > 0) {
    if (j > 0 && near(dp[i][j], dp[i - 1][j - 1] + substitutionCost(refTokens[i - 1], hyp[j - 1]))) {
      const kind = refTokens[i - 1] === hyp[j - 1] ? "match" : "sub";
      pairs.push({ kind, refIdx: i - 1, spoken: spoken[j - 1] });
      i--;
      j--;
    } else if (j > 0 && near(dp[i][j], dp[i][j - 1] + INSERT_COST)) {
      j--;
    } else {
      pairs.push({ kind: "missing", refIdx: i - 1 });
      i--;
    }
  }
  return pairs.reverse();
}

/**
 * Menilai ucapan pelajar dari hasil pengenal suara (kata, keyakinan, waktu)
 * terhadap kalimat acuan. Skor utama adalah Kejelasan: berapa banyak kata yang
 * dipahami mesin pengenal suara, bukan kemiripan dengan aksen tertentu.
 */
export function assessSpokenUtterance(params: {
  referenceText: string;
  spokenWords: SpokenWord[];
  defaultTargetMarks: Record<string, WordMark>;
}): UtteranceAssessmentResult {
  const { referenceText, spokenWords, defaultTargetMarks } = params;

  const refRawTokens = referenceText.split(/\s+/).filter((t) => cleanToken(t));
  const refTokens = refRawTokens.map(cleanToken);
  const pairs = alignWords(refTokens, spokenWords);
  // Bila sebagian besar kata tidak cocok, kemungkinan pelajar membaca kalimat lain
  // atau rekamannya berisik: jangan isi Bank Kesalahan dengan tebakan.
  const alignedRatio =
    pairs.filter((p) => p.kind === "match" || (p.kind === "sub" && detectL1Pattern(refTokens[p.refIdx], cleanToken(p.spoken.text)))).length /
    Math.max(1, refTokens.length);
  const canBank = spokenWords.length > 0 && alignedRatio >= 0.5;

  const marks: Record<string, WordMark> = {};
  const wordDetails: Record<string, WordCoachDetail> = {};
  const flaggedMistakes: UtteranceAssessmentResult["flaggedMistakes"] = [];
  let okCount = 0;
  let almostCount = 0;
  let recognizedCount = 0;
  let confidenceSum = 0;

  for (const pair of pairs) {
    const cleanWord = refRawTokens[pair.refIdx].replace(/[^A-Za-z']/g, "");
    const lowerWord = cleanWord.toLowerCase();
    const l1Info = INDONESIAN_L1_SUBSTITUTIONS[lowerWord];
    const defaultMark = defaultTargetMarks[cleanWord] ?? defaultTargetMarks[lowerWord];
    const ipa = l1Info?.ipa ?? defaultMark?.ipa ?? "";
    const knownNote = l1Info?.errorNote ?? defaultMark?.note;

    let status: PhonemeStatus;
    let heardAs: string;
    let errorPattern = "";
    let phonemeKey: string | null = null;
    let confidence = 0;

    if (pair.kind === "match") {
      confidence = pair.spoken.confidence;
      recognizedCount++;
      confidenceSum += confidence;
      if (confidence >= OK_CONFIDENCE) {
        status = "ok";
        heardAs = "terdengar jelas";
      } else {
        status = confidence >= ALMOST_CONFIDENCE ? "almost" : "work";
        heardAs = status === "almost" ? "terdengar, tapi kurang mantap" : "nyaris tidak dikenali";
        errorPattern = knownNote ?? "perjelas bunyinya";
        phonemeKey = l1Info?.phonemeKey ?? null;
      }
    } else if (pair.kind === "sub") {
      const heard = cleanToken(pair.spoken.text);
      const pattern = detectL1Pattern(lowerWord, heard);
      status = "work";
      heardAs = `terdengar “${heard}”`;
      errorPattern = pattern?.note ?? knownNote ?? `terdengar “${heard}”`;
      phonemeKey = pattern?.phonemeKey ?? l1Info?.phonemeKey ?? null;
    } else {
      status = "work";
      heardAs = "tidak terdengar";
      errorPattern = knownNote ?? "kata terlewat";
      phonemeKey = l1Info?.phonemeKey ?? null;
    }

    if (status === "ok") okCount++;
    if (status === "almost") almostCount++;

    const articulation =
      (phonemeKey ? PHONEME_GUIDES_MAP[phonemeKey] : undefined) ??
      getArticulationGuideForWord(cleanWord, errorPattern);

    if (status !== "ok") {
      marks[cleanWord] = { status, note: errorPattern, ipa };
      const isSoundIssue = phonemeKey !== null || pair.kind === "sub";
      const skipFunctionWord = pair.kind === "missing" && FUNCTION_WORDS.has(lowerWord);
      // "Hampir" tanpa pola bunyi yang dikenal tidak cukup kuat untuk dijadikan latihan.
      const strongEnough = status === "work" || phonemeKey !== null;
      if (canBank && strongEnough && !skipFunctionWord && (isSoundIssue || lowerWord.length >= 4)) {
        flaggedMistakes.push({
          word: cleanWord,
          ipa,
          phoneme: articulation.phonemeLabel,
          errorPattern,
          heardAs,
          status,
        });
      }
    }

    wordDetails[cleanWord] = {
      word: cleanWord,
      ipa,
      status,
      heardAs,
      note:
        status === "ok"
          ? `Kata “${cleanWord}” terdengar jelas dan mudah dipahami.`
          : `Kata “${cleanWord}” ${heardAs}${errorPattern ? ` (${errorPattern})` : ""}.`,
      phonemeBreakdown: [
        { phoneme: articulation.phonemeLabel, score: Math.round(confidence * 100), status },
      ],
      articulation,
    };
  }

  const total = Math.max(1, refTokens.length);
  const spokenCount = pairs.filter((p) => p.kind !== "missing").length;
  const clarityScore = Math.round(((okCount + almostCount * 0.65) / total) * 100);
  const wordAccuracy =
    recognizedCount > 0 ? Math.round((confidenceSum / recognizedCount) * 100) : 0;
  const completeness = Math.round((spokenCount / total) * 100);

  // Kelancaran dari waktu bicara nyata: tempo (kata per menit) dan jeda panjang.
  let fluencyScore = 0;
  let wordsPerMinute = 0;
  let fluencyDesc = "Belum ada ucapan yang terdengar";
  if (spokenWords.length >= 2) {
    const span = Math.max(
      0.5,
      spokenWords[spokenWords.length - 1].end - spokenWords[0].start
    );
    const wpm = Math.round((spokenWords.length / span) * 60);
    wordsPerMinute = wpm;
    let longPauses = 0;
    for (let k = 1; k < spokenWords.length; k++) {
      if (spokenWords[k].start - spokenWords[k - 1].end > 0.7) longPauses++;
    }
    // Tempo hanya berarti bila kalimat yang diucapkan memang kalimat acuan.
    // Tempo bicara natural kira-kira 110 sampai 170 kata per menit.
    const tempoPenalty = wpm < 110 ? (110 - wpm) * 0.6 : wpm > 170 ? (wpm - 170) * 0.6 : 0;
    const tempoScore = Math.max(0, Math.min(100, 100 - tempoPenalty - longPauses * 10));
    fluencyScore = Math.round(tempoScore * Math.min(1, alignedRatio * 1.1));
    fluencyDesc = `${wpm} kata/menit, ${longPauses} jeda panjang`;
  } else if (spokenWords.length === 1) {
    fluencyScore = 40;
    fluencyDesc = "Baru satu kata yang terdengar";
  }

  const scores: ScoreBreakdownItem[] = [
    {
      label: "Kejelasan",
      score: clarityScore,
      desc:
        clarityScore >= 85
          ? "Ucapanmu mudah dipahami"
          : clarityScore >= 65
          ? "Cukup jelas, ulangi kata yang bergaris bawah"
          : "Beberapa kata penting belum tertangkap",
    },
    {
      label: "Ketepatan kata",
      score: wordAccuracy,
      desc: `${okCount} dari ${total} kata terdengar mantap`,
    },
    { label: "Kelancaran", score: fluencyScore, desc: fluencyDesc },
    {
      label: "Kelengkapan",
      score: completeness,
      desc: `${spokenCount} dari ${total} kata terucap`,
    },
  ];

  const primaryFocusWord =
    flaggedMistakes.find((m) => m.status === "work")?.word ??
    flaggedMistakes[0]?.word ??
    Object.values(wordDetails).find((d) => d.status !== "ok")?.word ??
    refRawTokens[0]?.replace(/[^A-Za-z']/g, "") ??
    "";

  return {
    spokenTranscript: spokenWords.map((w) => w.text).join(" "),
    marks,
    scores,
    wordDetails,
    primaryFocusWord,
    wordsPerMinute,
    flaggedMistakes,
  };
}
