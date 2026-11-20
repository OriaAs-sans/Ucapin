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

/**
 * Evaluates a user's spoken transcript (from Web Speech API or manual test input)
 * against the reference English sentence.
 */
export function assessSpokenUtterance(params: {
  referenceText: string;
  spokenTranscript: string;
  defaultTargetMarks: Record<string, WordMark>;
  durationMs: number;
  confidence: number;
}): UtteranceAssessmentResult {
  const {
    referenceText,
    spokenTranscript,
    defaultTargetMarks,
    durationMs,
    confidence,
  } = params;

  const refRawTokens = referenceText.split(/\s+/).filter(Boolean);
  const spokenTokens = spokenTranscript
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  const usedSpokenIndices = new Set<number>();
  const marks: Record<string, WordMark> = {};
  const wordDetails: Record<string, WordCoachDetail> = {};
  const flaggedMistakes: UtteranceAssessmentResult["flaggedMistakes"] = [];

  let okCount = 0;
  let almostCount = 0;
  let workCount = 0;
  let matchedWordCount = 0;

  refRawTokens.forEach((rawToken, idx) => {
    const cleanWord = rawToken.replace(/[^A-Za-z']/g, "");
    const lowerWord = cleanWord.toLowerCase();
    const l1Info = INDONESIAN_L1_SUBSTITUTIONS[lowerWord];
    const defaultMark =
      defaultTargetMarks[cleanWord] ?? defaultTargetMarks[lowerWord];
    const ipa = l1Info?.ipa ?? defaultMark?.ipa ?? `/${lowerWord}/`;
    const articulation = getArticulationGuideForWord(
      cleanWord,
      l1Info?.errorNote ?? defaultMark?.note
    );

    // Search in a window around the expected index in spokenTokens
    let exactMatchIdx = -1;
    let subMatchIdx = -1;
    let matchedSubstitute = "";

    for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
      if (usedSpokenIndices.has(sIdx)) continue;
      const candidate = spokenTokens[sIdx];
      if (candidate === lowerWord) {
        exactMatchIdx = sIdx;
        break;
      }
      if (l1Info && l1Info.substitutes.includes(candidate)) {
        subMatchIdx = sIdx;
        matchedSubstitute = candidate;
      } else if (
        lowerWord.length >= 4 &&
        (lowerWord.startsWith(candidate) || candidate.startsWith(lowerWord.slice(0, -2))) &&
        Math.abs(sIdx - idx) <= 3
      ) {
        subMatchIdx = sIdx;
        matchedSubstitute = candidate;
      }
    }

    let status: PhonemeStatus = "ok";
    let note = "Ucapan jelas";
    let heardAs = `terdengar jelas “${cleanWord}”`;

    if (exactMatchIdx !== -1) {
      usedSpokenIndices.add(exactMatchIdx);
      matchedWordCount++;

      // If browser ASR confidence was low on a tricky Indonesian L1 word, mark as "almost"
      if (confidence < 0.76 && (l1Info || defaultMark)) {
        status = "almost";
        note = l1Info?.errorNote ?? defaultMark?.note ?? "perjelas konsonan";
        heardAs = `hampir jelas (${note})`;
        almostCount++;
      } else {
        status = "ok";
        note = "Terdengar jelas";
        heardAs = `terdengar jelas “${cleanWord}”`;
        okCount++;
      }
    } else if (subMatchIdx !== -1) {
      usedSpokenIndices.add(subMatchIdx);
      matchedWordCount++;
      status = "work";
      const rule =
        l1Info?.errorNote ??
        defaultMark?.note ??
        `terdengar “${matchedSubstitute}”`;
      note = `terdengar “${matchedSubstitute}” (${rule})`;
      heardAs = `terdengar “${matchedSubstitute}”`;
      workCount++;
    } else {
      // Word was not detected in spoken transcript
      status = "work";
      const rule = l1Info?.errorNote ?? defaultMark?.note;
      note = rule
        ? `belum terdengar jelas (${rule})`
        : "kata terlewat / belum terdengar";
      heardAs = "kata belum terdengar jelas";
      workCount++;
    }

    if (status !== "ok") {
      marks[cleanWord] = {
        status,
        note,
        ipa,
      };
      flaggedMistakes.push({
        word: cleanWord,
        ipa,
        phoneme: articulation.phonemeLabel,
        errorPattern: l1Info?.errorNote ?? defaultMark?.note ?? "artikulasi",
        heardAs,
        status,
      });
    }

    const targetScore =
      status === "ok" ? 94 : status === "almost" ? 73 : 41;
    const baseScore = status === "ok" ? 96 : status === "almost" ? 86 : 78;

    wordDetails[cleanWord] = {
      word: cleanWord,
      ipa,
      status,
      heardAs,
      note:
        status === "ok"
          ? `Kata “${cleanWord}” sudah kamu ucapkan dengan jelas dan mudah dipahami.`
          : `Pada kata “${cleanWord}”, ${heardAs}. ${articulation.title}.`,
      phonemeBreakdown: [
        {
          phoneme: articulation.phonemeLabel,
          score: targetScore,
          status,
        },
        {
          phoneme: "vokal",
          score: baseScore,
          status: "ok",
        },
        {
          phoneme: "ritme",
          score: status === "ok" ? 92 : 80,
          status: status === "ok" ? "ok" : "almost",
        },
      ],
      articulation,
    };
  });

  const totalRefWords = Math.max(1, refRawTokens.length);
  const completenessScore = Math.min(
    100,
    Math.round((matchedWordCount / totalRefWords) * 100)
  );
  const pronunciationScore = Math.max(
    30,
    Math.min(
      100,
      Math.round(
        ((okCount * 100 + almostCount * 74 + workCount * 38) / totalRefWords)
      )
    )
  );

  // Fluency based on duration & completeness
  const durationSec = Math.max(1.5, durationMs / 1000);
  const wpm = Math.round((matchedWordCount / durationSec) * 60);
  const fluencyScore =
    matchedWordCount === 0
      ? 35
      : wpm >= 85 && wpm <= 165
      ? Math.min(98, 84 + Math.round((okCount / totalRefWords) * 12))
      : Math.max(55, 78 - Math.abs(115 - wpm) / 4);

  const clarityScore = Math.round(
    pronunciationScore * 0.5 +
      completenessScore * 0.3 +
      Math.round(fluencyScore) * 0.2
  );

  const scores: ScoreBreakdownItem[] = [
    {
      label: "Kejelasan",
      score: clarityScore,
      desc:
        clarityScore >= 85
          ? "Ucapanmu sangat mudah dipahami"
          : clarityScore >= 70
          ? "Cukup jelas, perbaiki kata bergaris bawah"
          : "Beberapa kata penting masih belum jelas",
    },
    {
      label: "Ketepatan bunyi",
      score: pronunciationScore,
      desc: `${okCount} dari ${totalRefWords} kata terdengar tepat`,
    },
    {
      label: "Kelancaran",
      score: Math.round(fluencyScore),
      desc: `${wpm} kata/menit (${durationSec.toFixed(1)} detik)`,
    },
    {
      label: "Kelengkapan",
      score: completenessScore,
      desc: `${matchedWordCount} dari ${totalRefWords} kata terucap`,
    },
  ];

  const firstProblemWord =
    flaggedMistakes.find((m) => m.status === "work")?.word ??
    flaggedMistakes[0]?.word ??
    refRawTokens[0]?.replace(/[^A-Za-z']/g, "") ??
    "worked";

  return {
    spokenTranscript,
    marks,
    scores,
    wordDetails,
    primaryFocusWord: firstProblemWord,
    flaggedMistakes,
  };
}
