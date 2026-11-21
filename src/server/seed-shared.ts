// Tipe dan helper bersama untuk materi belajar. Dipakai seed-data.ts dan file materi
// per tujuan (seed-content-<tujuan>.ts) agar tidak ada import melingkar.

export type MarkStatus = "work" | "almost";
export type Mark = [word: string, status: MarkStatus, note: string, ipa: string];

export type DrillSeed = {
  cefr: "A1" | "A2" | "B1" | "B2" | "C1";
  category: string;
  focus: string;
  text: string;
  ipa: string;
  tr: string;
  marks: Mark[];
  coach: [word: string, ipa: string, note: string];
  steps: string[];
  pairs: string[];
};

export const STEPS_V = [
  "Tempelkan gigi atas ke bibir bawah, jangan sampai kedua bibir menutup.",
  "Nyalakan suara sambil menghembuskan udara sampai bibir bawah terasa bergetar.",
  "Kalau tidak bergetar, bunyinya masih /f/. Ulangi pelan lalu percepat.",
];
export const STEPS_TH = [
  "Letakkan ujung lidah tipis di antara gigi atas dan gigi bawah.",
  "Tiupkan udara tanpa suara lewat celah itu, jangan menekan lidah seperti saat mengucapkan /t/.",
  "Tarik lidah ke dalam lalu lanjutkan ke bunyi berikutnya.",
];
export const STEPS_DH = [
  "Letakkan ujung lidah di antara gigi seperti pada bunyi /θ/.",
  "Kali ini nyalakan suara sehingga ujung lidah terasa bergetar.",
  "Jangan menekan lidah ke gusi atas, karena itu menjadi bunyi /d/.",
];
export const STEPS_SH = [
  "Majukan bibir sedikit dan bulatkan, seperti saat berkata “sstt”.",
  "Tarik lidah sedikit ke belakang dan jangan menyentuh gigi.",
  "Desiskan udara agak panjang sebelum masuk ke bunyi berikutnya.",
];
export const STEPS_FINAL = [
  "Ucapkan kata dasarnya sampai selesai dengan jelas.",
  "Tambahkan bunyi penutup dengan satu sentuhan lidah ke gusi atas, tanpa vokal tambahan.",
  "Jangan berhenti sebelum bunyi penutup terdengar, lalu lepaskan napas.",
];
export const STEPS_PLURAL = [
  "Ucapkan kata dasarnya sampai selesai dengan jelas.",
  "Langsung sambung dengan desis /s/ atau /z/ di ujung kata tanpa jeda.",
  "Kalau ada dua konsonan di akhir, ucapkan keduanya satu per satu dengan cepat.",
];

export const PAIRS_V1 = ["very", "ferry", "van", "fan", "vest", "fest"];
export const PAIRS_V2 = ["view", "few", "vine", "fine", "veal", "feel"];
export const PAIRS_V3 = ["save", "safe", "leave", "leaf", "prove", "proof"];
export const PAIRS_V4 = ["have", "half", "leave", "leaf", "save", "safe"];
export const PAIRS_TH1 = ["think", "sink", "thank", "tank", "three", "tree"];
export const PAIRS_TH2 = ["both", "boat", "math", "mat", "path", "pat"];
export const PAIRS_TH3 = ["thirty", "dirty", "thin", "tin", "thick", "tick"];
export const PAIRS_TH4 = ["three", "free", "thank", "tank", "thin", "tin"];
export const PAIRS_DH1 = ["then", "den", "they", "day", "those", "doze"];
export const PAIRS_DH2 = ["though", "dough", "than", "Dan", "there", "dare"];
export const PAIRS_SH1 = ["ship", "sip", "shop", "sop", "sheet", "seat"];
export const PAIRS_SH2 = ["show", "so", "shy", "sigh", "she", "sea"];
export const PAIRS_SH3 = ["shore", "sore", "shell", "sell", "sheep", "seep"];

export const m = (word: string, status: MarkStatus, note: string, ipa: string): Mark => [word, status, note, ipa];

export type CorrectionSeed = {
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  status: MarkStatus;
  promptText: string;
  detailText: string;
};

export type NodeSeed = {
  line: string;
  tr: string;
  hints: string[];
  fix?: CorrectionSeed;
};

export type ScenarioSeed = {
  slug: string;
  goalTag: string;
  title: string;
  category: string;
  cefrLevel: string;
  characterName: string;
  characterRole: string;
  characterTrait: string;
  description: string;
  missions: string[];
  phrases: { phrase: string; meaning: string }[];
  nodes: NodeSeed[];
};
