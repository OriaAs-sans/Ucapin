import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./password";
import { readTestAccountCredentials, TEST_ACCOUNT_IDS } from "./test-accounts";


// ---------------------------------------------------------------------------
// Konten belajar: kalimat drill (4 tujuan x 3 level CEFR x 5 kalimat)
// ---------------------------------------------------------------------------

type MarkStatus = "work" | "almost";
type Mark = [word: string, status: MarkStatus, note: string, ipa: string];

type DrillSeed = {
  cefr: "A2" | "B1" | "B2";
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

const STEPS_V = [
  "Tempelkan gigi atas ke bibir bawah, jangan sampai kedua bibir menutup.",
  "Nyalakan suara sambil menghembuskan udara sampai bibir bawah terasa bergetar.",
  "Kalau tidak bergetar, bunyinya masih /f/. Ulangi pelan lalu percepat.",
];
const STEPS_TH = [
  "Letakkan ujung lidah tipis di antara gigi atas dan gigi bawah.",
  "Tiupkan udara tanpa suara lewat celah itu, jangan menekan lidah seperti saat mengucapkan /t/.",
  "Tarik lidah ke dalam lalu lanjutkan ke bunyi berikutnya.",
];
const STEPS_DH = [
  "Letakkan ujung lidah di antara gigi seperti pada bunyi /θ/.",
  "Kali ini nyalakan suara sehingga ujung lidah terasa bergetar.",
  "Jangan menekan lidah ke gusi atas, karena itu menjadi bunyi /d/.",
];
const STEPS_SH = [
  "Majukan bibir sedikit dan bulatkan, seperti saat berkata “sstt”.",
  "Tarik lidah sedikit ke belakang dan jangan menyentuh gigi.",
  "Desiskan udara agak panjang sebelum masuk ke bunyi berikutnya.",
];
const STEPS_FINAL = [
  "Ucapkan kata dasarnya sampai selesai dengan jelas.",
  "Tambahkan bunyi penutup dengan satu sentuhan lidah ke gusi atas, tanpa vokal tambahan.",
  "Jangan berhenti sebelum bunyi penutup terdengar, lalu lepaskan napas.",
];
const STEPS_PLURAL = [
  "Ucapkan kata dasarnya sampai selesai dengan jelas.",
  "Langsung sambung dengan desis /s/ atau /z/ di ujung kata tanpa jeda.",
  "Kalau ada dua konsonan di akhir, ucapkan keduanya satu per satu dengan cepat.",
];

const PAIRS_V1 = ["very", "ferry", "van", "fan", "vest", "fest"];
const PAIRS_V2 = ["view", "few", "vine", "fine", "veal", "feel"];
const PAIRS_V3 = ["save", "safe", "leave", "leaf", "prove", "proof"];
const PAIRS_V4 = ["have", "half", "leave", "leaf", "save", "safe"];
const PAIRS_TH1 = ["think", "sink", "thank", "tank", "three", "tree"];
const PAIRS_TH2 = ["both", "boat", "math", "mat", "path", "pat"];
const PAIRS_TH3 = ["thirty", "dirty", "thin", "tin", "thick", "tick"];
const PAIRS_TH4 = ["three", "free", "thank", "tank", "thin", "tin"];
const PAIRS_DH1 = ["then", "den", "they", "day", "those", "doze"];
const PAIRS_DH2 = ["though", "dough", "than", "Dan", "there", "dare"];
const PAIRS_SH1 = ["ship", "sip", "shop", "sop", "sheet", "seat"];
const PAIRS_SH2 = ["show", "so", "shy", "sigh", "she", "sea"];
const PAIRS_SH3 = ["shore", "sore", "shell", "sell", "sheep", "seep"];

const m = (word: string, status: MarkStatus, note: string, ipa: string): Mark => [word, status, note, ipa];

function buildDrills(goalTag: string, seeds: DrillSeed[]) {
  return seeds.map((s, index) => ({
    goalTag,
    cefrLevel: s.cefr,
    category: s.category,
    focusPhonemes: s.focus,
    text: s.text,
    ipa: s.ipa,
    translation: s.tr,
    orderIndex: index + 1,
    targetMarksJson: JSON.stringify(
      Object.fromEntries(s.marks.map(([word, status, note, ipa]) => [word, { status, note, ipa }]))
    ),
    sampleScoresJson: JSON.stringify([]),
    coachWord: s.coach[0],
    coachIpa: s.coach[1],
    coachNote: s.coach[2],
    coachStepsJson: JSON.stringify(s.steps),
    phonemeBreakdownJson: JSON.stringify([]),
    minimalPairsJson: JSON.stringify(s.pairs),
  }));
}

const KERJA_SEEDS: DrillSeed[] = [
  // A2
  {
    cefr: "A2",
    category: "Wawancara & karier",
    focus: "/θ/, /ð/, dan konsonan akhir",
    text: "I work with three friends in a small office near the station.",
    ipa: "/aɪ wɜrk wɪð θri frɛndz ɪn ə smɔl ˈɔfɪs nɪr ðə ˈsteɪʃən/",
    tr: "Saya bekerja bersama tiga teman di kantor kecil dekat stasiun.",
    marks: [
      m("three", "work", "/θ/ jadi /t/", "/θri/"),
      m("friends", "almost", "-ds akhir hilang", "/frɛndz/"),
      m("station", "almost", "/ʃ/ jadi /s/", "/ˈsteɪʃən/"),
    ],
    coach: ["three", "/θri/", "Kata “three” dimulai dengan /θ/. Kalau terdengar “tree”, pendengar mengira kamu menyebut pohon."],
    steps: STEPS_TH,
    pairs: PAIRS_TH1,
  },
  {
    cefr: "A2",
    category: "Rapat tim",
    focus: "-ed akhir dan /ð/",
    text: "My manager asked me to send the report this afternoon.",
    ipa: "/maɪ ˈmænɪdʒər æskt mi tu sɛnd ðə rɪˈpɔrt ðɪs ˌæftərˈnun/",
    tr: "Atasan saya meminta saya mengirim laporan sore ini.",
    marks: [
      m("asked", "work", "/t/ akhir hilang", "/æskt/"),
      m("send", "almost", "/d/ akhir hilang", "/sɛnd/"),
      m("this", "almost", "/ð/ jadi /d/", "/ðɪs/"),
    ],
    coach: ["asked", "/æskt/", "Akhiran -ked diucapkan sebagai satu /t/ setelah /s/ dan /k/. Kalau /t/ hilang, kalimat terdengar seperti present tense “ask”."],
    steps: STEPS_FINAL,
    pairs: ["asked", "ask", "passed", "pass", "missed", "miss"],
  },
  {
    cefr: "A2",
    category: "Rapat tim",
    focus: "/v/, /θ/, dan /ð/",
    text: "I have a meeting with the team at ten thirty.",
    ipa: "/aɪ hæv ə ˈmiːtɪŋ wɪð ðə tiːm æt tɛn ˈθɜrti/",
    tr: "Saya ada rapat dengan tim jam sepuluh tiga puluh.",
    marks: [
      m("have", "almost", "/v/ jadi /f/", "/hæv/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
      m("thirty", "work", "/θ/ jadi /t/", "/ˈθɜrti/"),
    ],
    coach: ["thirty", "/ˈθɜrti/", "Bunyi awal /θ/ pada “thirty” sering menjadi /t/ sehingga terdengar “tirty”. Tekanan ada di suku kata pertama."],
    steps: STEPS_TH,
    pairs: PAIRS_TH3,
  },
  {
    cefr: "A2",
    category: "Rapat tim",
    focus: "/v/ dan konsonan akhir",
    text: "Please check the invoice and send it to finance.",
    ipa: "/pliz tʃɛk ðə ˈɪnvɔɪs ænd sɛnd ɪt tu ˈfaɪnæns/",
    tr: "Tolong periksa faktur itu dan kirim ke bagian keuangan.",
    marks: [
      m("invoice", "work", "/v/ jadi /f/", "/ˈɪnvɔɪs/"),
      m("send", "almost", "/d/ akhir hilang", "/sɛnd/"),
      m("finance", "almost", "-s akhir hilang", "/ˈfaɪnæns/"),
    ],
    coach: ["invoice", "/ˈɪnvɔɪs/", "Pada “invoice”, /v/ berada di tengah kata dan sering menjadi /f/ sehingga terdengar “infoice”. Pastikan bibir bawah bergetar sebelum /ɔɪs/."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "A2",
    category: "Wawancara & karier",
    focus: "/ʃ/, /ð/, dan /v/",
    text: "I finished university and I want this job very much.",
    ipa: "/aɪ ˈfɪnɪʃt ˌjuːnɪˈvɜrsɪti ænd aɪ wɑnt ðɪs dʒɑb ˈvɛri mʌtʃ/",
    tr: "Saya sudah lulus kuliah dan saya sangat menginginkan pekerjaan ini.",
    marks: [
      m("finished", "work", "/ʃt/ akhir kurang jelas", "/ˈfɪnɪʃt/"),
      m("this", "almost", "/ð/ jadi /d/", "/ðɪs/"),
      m("very", "work", "/v/ jadi /f/", "/ˈvɛri/"),
    ],
    coach: ["finished", "/ˈfɪnɪʃt/", "Akhir “finished” menggabungkan /ʃ/ dan /t/. Kalau /ʃ/ menjadi /s/ atau /t/ hilang, kata terdengar seperti “finis”."],
    steps: STEPS_SH,
    pairs: ["finished", "finish", "washed", "wash", "pushed", "push"],
  },
  // B1
  {
    cefr: "B1",
    category: "Wawancara & karier",
    focus: "-ed akhir dan /v/",
    text: "I worked on five product launches and solved the main issue.",
    ipa: "/aɪ wɜrkt ɑn faɪv ˈprɑdʌkt ˈlɔntʃɪz ænd sɑlvd ðə meɪn ˈɪʃuː/",
    tr: "Saya mengerjakan lima peluncuran produk dan menyelesaikan masalah utamanya.",
    marks: [
      m("worked", "work", "/t/ akhir hilang", "/wɜrkt/"),
      m("five", "almost", "/v/ akhir jadi /f/", "/faɪv/"),
      m("solved", "almost", "/vd/ akhir kurang jelas", "/sɑlvd/"),
    ],
    coach: [
      "worked",
      "/wɜrkt/",
      "Akhiran -ed setelah bunyi /k/ diucapkan sebagai /t/ singkat (/wɜrkt/). Jika /t/ hilang, pendengar mengira kamu memakai present tense “work”.",
    ],
    steps: [
      "Ucapkan “work” dengan penutup /k/ yang jelas.",
      "Langsung sentuhkan ujung lidah ke belakang gigi atas untuk bunyi /t/ tanpa menambah vokal “e”.",
      "Jangan diucapkan “wor-ked” dua suku kata, cukup satu suku kata /wɜrkt/.",
    ],
    pairs: ["worked", "work", "walked", "walk", "talked", "talk"],
  },
  {
    cefr: "B1",
    category: "Rapat tim",
    focus: "/θ/ dan /v/",
    text: "I think we remain available to review the monthly report today.",
    ipa: "/aɪ θɪŋk wi rɪˈmeɪn əˈveɪləbəl tu rɪˈvjuː ðə ˈmʌnθli rɪˈpɔrt təˈdeɪ/",
    tr: "Saya rasa kami tetap siap untuk meninjau laporan bulanan hari ini.",
    marks: [
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("available", "almost", "/v/ jadi /f/", "/əˈveɪləbəl/"),
    ],
    coach: [
      "think",
      "/θɪŋk/",
      "Dalam rapat kerja, “I think” adalah frasa paling sering dipakai. Pastikan ujung lidah sedikit keluar di antara gigi agar tidak terdengar “I tink”.",
    ],
    steps: [
      "Sentuhkan ujung lidah ke tepi bawah gigi seri atas.",
      "Hembuskan udara halus selama setengah detik sebelum menyebut “ink”.",
      "Tutup dengan bunyi sengau /ŋk/ yang tegas.",
    ],
    pairs: ["think", "tink", "sink", "thank", "tank"],
  },
  {
    cefr: "B1",
    category: "Presentasi produk",
    focus: "/v/, /θ/, dan -ed akhir",
    text: "We delivered the first version of the website three days ago.",
    ipa: "/wi dɪˈlɪvərd ðə fɜrst ˈvɜrʒən əv ðə ˈwɛbsaɪt θri deɪz əˈɡoʊ/",
    tr: "Kami sudah mengirimkan versi pertama situs web itu tiga hari lalu.",
    marks: [
      m("delivered", "work", "/v/ jadi /f/ dan /d/ akhir hilang", "/dɪˈlɪvərd/"),
      m("version", "almost", "/v/ jadi /f/", "/ˈvɜrʒən/"),
      m("three", "work", "/θ/ jadi /t/", "/θri/"),
    ],
    coach: ["delivered", "/dɪˈlɪvərd/", "Di tengah “delivered”, /v/ harus bergetar, dan /d/ di akhir tetap terdengar. Kalau tidak, kata ini terdengar seperti “deliferd”."],
    steps: STEPS_V,
    pairs: ["delivered", "deliver", "moved", "move", "served", "serve"],
  },
  {
    cefr: "B1",
    category: "Rapat tim",
    focus: "/ʃ/ dan konsonan akhir",
    text: "I usually finish my tasks before the deadline and ask for feedback.",
    ipa: "/aɪ ˈjuʒuəli ˈfɪnɪʃ maɪ tæsks bɪˈfɔr ðə ˈdɛdlaɪn ænd æsk fɔr ˈfiːdbæk/",
    tr: "Saya biasanya menyelesaikan tugas sebelum tenggat dan meminta umpan balik.",
    marks: [
      m("finish", "almost", "/ʃ/ akhir jadi /s/", "/ˈfɪnɪʃ/"),
      m("tasks", "work", "-ks akhir hilang", "/tæsks/"),
      m("feedback", "almost", "/d/ di tengah hilang", "/ˈfiːdbæk/"),
    ],
    coach: ["tasks", "/tæsks/", "Kata “tasks” berakhir dengan tiga konsonan /sks/. Kalau hilang, pendengar mendengar “task” tunggal."],
    steps: STEPS_PLURAL,
    pairs: ["tasks", "task", "risks", "risk", "desks", "desk"],
  },
  {
    cefr: "B1",
    category: "Wawancara & karier",
    focus: "/θ/ dan konsonan akhir",
    text: "Thank you for the interview, I think the role suits my experience.",
    ipa: "/θæŋk ju fɔr ði ˈɪntərvju aɪ θɪŋk ðə roʊl suːts maɪ ɪkˈspɪriəns/",
    tr: "Terima kasih atas wawancaranya, saya rasa peran ini cocok dengan pengalaman saya.",
    marks: [
      m("Thank", "work", "/θ/ jadi /t/", "/θæŋk/"),
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("suits", "almost", "-ts akhir hilang", "/suːts/"),
    ],
    coach: ["Thank", "/θæŋk/", "Di awal wawancara, “Thank” yang terdengar “Tank” bisa mengurangi kesan sopan. Julurkan sedikit ujung lidah."],
    steps: STEPS_TH,
    pairs: PAIRS_TH1,
  },
  // B2
  {
    cefr: "B2",
    category: "Presentasi produk",
    focus: "/ʃ/ dan /v/",
    text: "This version should improve our customer retention this quarter.",
    ipa: "/ðɪs ˈvɜrʒən ʃʊd ɪmˈpruːv ˈaʊər ˈkʌstəmər rɪˈtɛnʃən ðɪs ˈkwɔrtər/",
    tr: "Versi ini seharusnya meningkatkan retensi pelanggan kita kuartal ini.",
    marks: [
      m("version", "work", "/v/ jadi /f/", "/ˈvɜrʒən/"),
      m("should", "almost", "/ʃ/ jadi /s/", "/ʃʊd/"),
    ],
    coach: [
      "version",
      "/ˈvɜrʒən/",
      "Kata “version” menggabungkan dua bunyi penting: /v/ di awal dan /ʒ/ di tengah. Mulailah dengan getaran bibir bawah.",
    ],
    steps: [
      "Gigi atas menyentuh bibir bawah sambil menyalakan getaran /v/.",
      "Masuk ke vokal /ɜr/ lalu desiskan bagian tengah dengan suara bergetar.",
      "Akhiri dengan /ən/ ringan.",
    ],
    pairs: ["version", "very", "fairy", "should", "suit"],
  },
  {
    cefr: "B2",
    category: "Presentasi produk",
    focus: "/ʃ/, /v/, dan -sks akhir",
    text: "We should prioritize the most valuable features and explain the risks clearly.",
    ipa: "/wi ʃʊd praɪˈɔrɪtaɪz ðə moʊst ˈvæljuəbəl ˈfiːtʃərz ænd ɪkˈspleɪn ðə rɪsks ˈklɪrli/",
    tr: "Kita sebaiknya memprioritaskan fitur yang paling bernilai dan menjelaskan risikonya dengan jelas.",
    marks: [
      m("should", "almost", "/ʃ/ jadi /s/", "/ʃʊd/"),
      m("valuable", "work", "/v/ jadi /f/", "/ˈvæljuəbəl/"),
      m("most", "almost", "/t/ akhir hilang", "/moʊst/"),
      m("risks", "work", "-sks akhir hilang", "/rɪsks/"),
    ],
    coach: ["valuable", "/ˈvæljuəbəl/", "Pada “valuable”, /v/ di awal kata sering menjadi /f/ sehingga terdengar “faluable”. Tekanan jatuh di suku kata pertama."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "B2",
    category: "Rapat tim",
    focus: "/ð/, /v/, dan -ed akhir",
    text: "Although the launch was delayed, our team resolved every critical issue.",
    ipa: "/ɔlˈðoʊ ðə lɔntʃ wʌz dɪˈleɪd aʊər tim rɪˈzɑlvd ˈɛvri ˈkrɪtɪkəl ˈɪʃu/",
    tr: "Meski peluncuran tertunda, tim kami menyelesaikan setiap masalah kritis.",
    marks: [
      m("Although", "almost", "/ð/ jadi /d/", "/ɔlˈðoʊ/"),
      m("resolved", "work", "/vd/ akhir kurang jelas", "/rɪˈzɑlvd/"),
      m("issue", "almost", "/ʃ/ jadi /s/", "/ˈɪʃu/"),
    ],
    coach: ["resolved", "/rɪˈzɑlvd/", "Akhir “resolved” memuat /lvd/: /l/, /v/, lalu /d/. Kalau /d/ hilang, kata terdengar seperti present tense “resolve”."],
    steps: STEPS_FINAL,
    pairs: ["resolved", "resolve", "solved", "solve", "moved", "move"],
  },
  {
    cefr: "B2",
    category: "Wawancara & karier",
    focus: "/ʃ/, /ð/, dan -ts akhir",
    text: "I would like to negotiate a higher salary that reflects my responsibilities.",
    ipa: "/aɪ wʊd laɪk tu nɪˈɡoʊʃieɪt ə ˈhaɪər ˈsæləri ðæt rɪˈflɛkts maɪ rɪˌspɑnsəˈbɪlətiz/",
    tr: "Saya ingin menegosiasikan gaji yang lebih tinggi sesuai dengan tanggung jawab saya.",
    marks: [
      m("negotiate", "almost", "/ʃ/ jadi /s/", "/nɪˈɡoʊʃieɪt/"),
      m("that", "almost", "/ð/ jadi /d/", "/ðæt/"),
      m("reflects", "work", "-kts akhir hilang", "/rɪˈflɛkts/"),
    ],
    coach: ["reflects", "/rɪˈflɛkts/", "Akhir “reflects” memuat /kts/. Kalau /t/ dan /s/ hilang, kata terdengar seperti “reflek” dan kalimat kehilangan bentuk present simple."],
    steps: STEPS_PLURAL,
    pairs: ["reflects", "reflex", "acts", "ax", "facts", "fax"],
  },
  {
    cefr: "B2",
    category: "Presentasi produk",
    focus: "/θ/, /v/, dan -ed akhir",
    text: "Our average response time improved by thirty percent over the last quarter.",
    ipa: "/ˈaʊər ˈævərɪdʒ rɪˈspɑns taɪm ɪmˈpruːvd baɪ ˈθɜrti pərˈsɛnt ˈoʊvər ðə læst ˈkwɔrtər/",
    tr: "Rata-rata waktu respons kami membaik tiga puluh persen pada kuartal terakhir.",
    marks: [
      m("improved", "work", "/vd/ akhir hilang", "/ɪmˈpruːvd/"),
      m("thirty", "work", "/θ/ jadi /t/", "/ˈθɜrti/"),
      m("over", "almost", "/v/ jadi /f/", "/ˈoʊvər/"),
    ],
    coach: ["improved", "/ɪmˈpruːvd/", "Dalam “improved”, /v/ bergetar lalu /d/ menutup kata. Kalau berubah jadi “improf”, pendengar tidak yakin itu past tense."],
    steps: STEPS_V,
    pairs: ["improved", "improve", "moved", "move", "proved", "prove"],
  },
];

const JALAN_SEEDS: DrillSeed[] = [
  // A2
  {
    cefr: "A2",
    category: "Bandara & transportasi",
    focus: "/ʃ/ dan /ð/",
    text: "Excuse me, where is the shuttle bus to the central station?",
    ipa: "/ɪkˈskjuːz mi wɛr ɪz ðə ˈʃʌtəl bʌs tu ðə ˈsɛntrəl ˈsteɪʃən/",
    tr: "Permisi, di mana bus antar-jemput menuju stasiun pusat?",
    marks: [
      m("shuttle", "work", "/ʃ/ jadi /s/", "/ˈʃʌtəl/"),
      m("the", "almost", "/ð/ jadi /d/", "/ðə/"),
    ],
    coach: [
      "shuttle",
      "/ˈʃʌtəl/",
      "Bunyi awal “sh” pada “shuttle” perlu bibir yang sedikit membulat ke depan agar tidak terdengar seperti “sattel”.",
    ],
    steps: [
      "Majukan bibir sedikit seperti saat meminta orang diam (shh).",
      "Tarik ujung lidah sedikit ke belakang langit-langit depan.",
      "Sambungkan dengan vokal /ʌ/ singkat.",
    ],
    pairs: ["shuttle", "subtle", "shop", "sop", "ship", "sip"],
  },
  {
    cefr: "A2",
    category: "Check-in hotel",
    focus: "/v/ dan -d akhir",
    text: "I have a reservation for two nights, and I will pay by card.",
    ipa: "/aɪ hæv ə ˌrɛzərˈveɪʃən fɔr tu naɪts ænd aɪ wɪl peɪ baɪ kɑrd/",
    tr: "Saya punya reservasi untuk dua malam, dan saya akan membayar dengan kartu.",
    marks: [
      m("reservation", "almost", "/v/ jadi /f/", "/ˌrɛzərˈveɪʃən/"),
      m("card", "work", "/d/ akhir hilang", "/kɑrd/"),
    ],
    coach: ["card", "/kɑrd/", "Jika konsonan /d/ di akhir “card” tidak diucapkan, kata ini terdengar persis seperti “car” (mobil)."],
    steps: [
      "Ucapkan “car” dengan lidah sedikit melengkung untuk bunyi /r/.",
      "Tutup kalimat dengan menyentuhkan ujung lidah ke langit-langit depan untuk bunyi /d/.",
      "Pastikan suara /d/ terdengar sebelum mulut menutup.",
    ],
    pairs: ["card", "car", "hard", "heart", "bed", "bet"],
  },
  {
    cefr: "A2",
    category: "Tanya arah kota",
    focus: "/v/, -st akhir, dan /ʃ/",
    text: "I lost my passport, so I visited the police station.",
    ipa: "/aɪ lɔst maɪ ˈpæspɔrt soʊ aɪ ˈvɪzɪtɪd ðə pəˈlis ˈsteɪʃən/",
    tr: "Paspor saya hilang, jadi saya mendatangi kantor polisi.",
    marks: [
      m("lost", "work", "/t/ akhir hilang", "/lɔst/"),
      m("visited", "work", "/v/ jadi /f/", "/ˈvɪzɪtɪd/"),
      m("station", "almost", "/ʃ/ jadi /s/", "/ˈsteɪʃən/"),
    ],
    coach: ["visited", "/ˈvɪzɪtɪd/", "Kata “visited” sering terdengar seperti “fisited”. Bibir bawah harus bergetar sejak awal kata."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "A2",
    category: "Bandara & transportasi",
    focus: "/v/, /ʃ/, dan konsonan akhir",
    text: "The train leaves at five, so we should leave the hotel soon.",
    ipa: "/ðə treɪn livz æt faɪv soʊ wi ʃʊd liv ðə hoʊˈtɛl sun/",
    tr: "Kereta berangkat jam lima, jadi kita sebaiknya segera meninggalkan hotel.",
    marks: [
      m("leaves", "work", "/vz/ akhir jadi /fs/", "/livz/"),
      m("five", "almost", "/v/ akhir jadi /f/", "/faɪv/"),
      m("should", "almost", "/ʃ/ jadi /s/", "/ʃʊd/"),
    ],
    coach: ["leaves", "/livz/", "Di akhir “leaves”, /v/ harus bergetar sebelum /z/. Kalau menjadi /fs/, kata terdengar seperti “leafs”."],
    steps: STEPS_V,
    pairs: PAIRS_V3,
  },
  {
    cefr: "A2",
    category: "Bandara & transportasi",
    focus: "-t, -d akhir, dan /ð/",
    text: "My flight to Bali was delayed, but the weather is nice.",
    ipa: "/maɪ flaɪt tu ˈbɑli wʌz dɪˈleɪd bʌt ðə ˈwɛðər ɪz naɪs/",
    tr: "Penerbangan saya ke Bali tertunda, tetapi cuacanya bagus.",
    marks: [
      m("flight", "almost", "/t/ akhir hilang", "/flaɪt/"),
      m("delayed", "almost", "/d/ akhir hilang", "/dɪˈleɪd/"),
      m("weather", "almost", "/ð/ jadi /d/", "/ˈwɛðər/"),
    ],
    coach: ["flight", "/flaɪt/", "Bunyi /t/ di akhir “flight” sering hilang sehingga terdengar “flai”. Tutup kata dengan sentuhan lidah di gusi atas."],
    steps: STEPS_FINAL,
    pairs: ["flight", "fly", "light", "lie", "white", "why"],
  },
  // B1
  {
    cefr: "B1",
    category: "Tanya arah kota",
    focus: "/θ/ dan /ð/",
    text: "Walk through the third gate and wait there near the theater.",
    ipa: "/wɔk θruː ðə θɜrd ɡeɪt ænd weɪt ðɛr nɪr ðə ˈθiːətər/",
    tr: "Jalan melewati gerbang ketiga dan tunggu di sana dekat teater.",
    marks: [
      m("through", "work", "/θ/ jadi /t/", "/θruː/"),
      m("third", "work", "/θ/ jadi /t/", "/θɜrd/"),
      m("there", "almost", "/ð/ jadi /d/", "/ðɛr/"),
    ],
    coach: ["third", "/θɜrd/", "Kata “third” dimulai dengan /θ/ nirsuara dan ditutup dengan /d/ bersuara. Jangan diucapkan “tird”."],
    steps: [
      "Mulai dengan ujung lidah di antara gigi sambil meniupkan udara /θ/.",
      "Tarik lidah ke tengah untuk bunyi /ɜr/.",
      "Sentuhkan ujung lidah ke langit-langit atas untuk menutup dengan /d/.",
    ],
    pairs: ["third", "three", "tree", "through", "true"],
  },
  {
    cefr: "B1",
    category: "Tanya arah kota",
    focus: "/v/, /θ/, dan /ð/",
    text: "We took the ferry to the island and visited three beaches there.",
    ipa: "/wi tʊk ðə ˈfɛri tu ði ˈaɪlənd ænd ˈvɪzɪtɪd θri ˈbiːtʃɪz ðɛr/",
    tr: "Kami naik kapal feri ke pulau itu dan mengunjungi tiga pantai di sana.",
    marks: [
      m("visited", "work", "/v/ jadi /f/", "/ˈvɪzɪtɪd/"),
      m("three", "work", "/θ/ jadi /t/", "/θri/"),
      m("there", "almost", "/ð/ jadi /d/", "/ðɛr/"),
    ],
    coach: ["three", "/θri/", "Saat menyebut jumlah, “three” yang terdengar “tree” bisa membuat pendengar salah mencatat angka."],
    steps: STEPS_TH,
    pairs: PAIRS_TH4,
  },
  {
    cefr: "B1",
    category: "Tanya arah kota",
    focus: "/v/, /ð/, dan konsonan akhir",
    text: "Could you recommend a vegetarian restaurant that is within walking distance?",
    ipa: "/kʊd ju ˌrɛkəˈmɛnd ə ˌvɛdʒəˈtɛriən ˈrɛstərɑnt ðæt ɪz wɪˈðɪn ˈwɔkɪŋ ˈdɪstəns/",
    tr: "Bisakah Anda merekomendasikan restoran vegetarian yang bisa dicapai dengan jalan kaki?",
    marks: [
      m("vegetarian", "work", "/v/ jadi /f/", "/ˌvɛdʒəˈtɛriən/"),
      m("recommend", "almost", "/d/ akhir hilang", "/ˌrɛkəˈmɛnd/"),
      m("within", "almost", "/ð/ jadi /d/", "/wɪˈðɪn/"),
    ],
    coach: ["vegetarian", "/ˌvɛdʒəˈtɛriən/", "Kata “vegetarian” dimulai dengan /v/ dan bagian tengahnya /dʒ/, bukan /g/. Kalau awalnya menjadi /f/, pelayan bisa bingung."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "B1",
    category: "Check-in hotel",
    focus: "/θ/, /v/, dan -ks akhir",
    text: "Our hotel is on the fourth floor, and the elevator works fine.",
    ipa: "/aʊr hoʊˈtɛl ɪz ɑn ðə fɔrθ flɔr ænd ði ˈɛləveɪtər wɜrks faɪn/",
    tr: "Hotel kami ada di lantai empat, dan lift-nya berfungsi dengan baik.",
    marks: [
      m("fourth", "work", "/θ/ akhir jadi /t/", "/fɔrθ/"),
      m("elevator", "almost", "/v/ jadi /f/", "/ˈɛləveɪtər/"),
      m("works", "almost", "-ks akhir hilang", "/wɜrks/"),
    ],
    coach: ["fourth", "/fɔrθ/", "“Fourth” berakhir dengan /θ/. Kalau menjadi /t/, kata terdengar seperti “fort” (benteng)."],
    steps: STEPS_TH,
    pairs: ["fourth", "fort", "path", "pat", "math", "mat"],
  },
  {
    cefr: "B1",
    category: "Check-in hotel",
    focus: "/ʃ/, /ð/, dan -ked akhir",
    text: "I booked a double room with a shower for the whole weekend.",
    ipa: "/aɪ bʊkt ə ˈdʌbəl rum wɪð ə ˈʃaʊər fɔr ðə hoʊl ˈwiːkɛnd/",
    tr: "Saya memesan kamar double dengan pancuran untuk seluruh akhir pekan.",
    marks: [
      m("booked", "work", "/t/ akhir hilang", "/bʊkt/"),
      m("shower", "almost", "/ʃ/ jadi /s/", "/ˈʃaʊər/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
    ],
    coach: ["shower", "/ˈʃaʊər/", "Kalau /ʃ/ menjadi /s/, “shower” terdengar seperti “sour” (asam). Bulatkan bibir sebelum diftong /aʊ/."],
    steps: STEPS_SH,
    pairs: ["shower", "sour", "shy", "sigh", "sheet", "seat"],
  },
  // B2
  {
    cefr: "B2",
    category: "Bandara & transportasi",
    focus: "-ed akhir dan /ð/",
    text: "Our ferry was cancelled because of the storm, so we arranged another route.",
    ipa: "/aʊər ˈfɛri wʌz ˈkænsəld bɪˈkɔz əv ðə stɔrm soʊ wi əˈreɪndʒd əˈnʌðər ruːt/",
    tr: "Feri kami dibatalkan karena badai, jadi kami mengatur rute lain.",
    marks: [
      m("cancelled", "work", "/d/ akhir hilang", "/ˈkænsəld/"),
      m("arranged", "work", "/dʒd/ akhir hilang", "/əˈreɪndʒd/"),
      m("another", "almost", "/ð/ jadi /d/", "/əˈnʌðər/"),
    ],
    coach: ["arranged", "/əˈreɪndʒd/", "Akhir “arranged” padat: /ndʒd/. Kalau /d/ hilang, pendengar menganggap kamu masih merencanakan, bukan sudah mengatur."],
    steps: STEPS_FINAL,
    pairs: ["cancelled", "cancel", "called", "call", "filled", "fill"],
  },
  {
    cefr: "B2",
    category: "Check-in hotel",
    focus: "/v/, /ʃ/, dan /ð/",
    text: "I would appreciate it if you could upgrade us to a room with a view.",
    ipa: "/aɪ wʊd əˈpriʃieɪt ɪt ɪf ju kʊd ˈʌpɡreɪd ʌs tu ə rum wɪð ə vju/",
    tr: "Saya akan sangat menghargai jika Anda bisa menaikkan kelas kami ke kamar dengan pemandangan.",
    marks: [
      m("appreciate", "almost", "/ʃ/ jadi /s/", "/əˈpriʃieɪt/"),
      m("view", "work", "/v/ jadi /f/", "/vju/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
    ],
    coach: ["view", "/vju/", "Kalau “view” terdengar “few”, resepsionis mengira kamu meminta “beberapa kamar”. Getarkan bibir bawah di awal."],
    steps: STEPS_V,
    pairs: PAIRS_V2,
  },
  {
    cefr: "B2",
    category: "Tanya arah kota",
    focus: "/ð/, /ʃ/, dan -ts akhir",
    text: "Could you tell me whether the museum offers a discount for international students?",
    ipa: "/kʊd ju tɛl mi ˈwɛðər ðə mjuˈziːəm ˈɔfərz ə ˈdɪskaʊnt fɔr ˌɪntərˈnæʃənəl ˈstudənts/",
    tr: "Bisakah Anda memberi tahu apakah museum ini memberi diskon untuk pelajar internasional?",
    marks: [
      m("whether", "almost", "/ð/ jadi /d/", "/ˈwɛðər/"),
      m("international", "almost", "/ʃ/ jadi /s/", "/ˌɪntərˈnæʃənəl/"),
      m("students", "work", "-ts akhir hilang", "/ˈstudənts/"),
    ],
    coach: ["international", "/ˌɪntərˈnæʃənəl/", "Bunyi /ʃ/ di tengah “international” sering menjadi /s/ sehingga terdengar “internasional”. Tekanan jatuh di suku kata ketiga."],
    steps: STEPS_SH,
    pairs: PAIRS_SH3,
  },
  {
    cefr: "B2",
    category: "Bandara & transportasi",
    focus: "-st akhir dan /θ/",
    text: "The conductor announced that the express train would depart from the third platform.",
    ipa: "/ðə kənˈdʌktər əˈnaʊnst ðæt ði ɪkˈsprɛs treɪn wʊd dɪˈpɑrt frʌm ðə θɜrd ˈplætfɔrm/",
    tr: "Petugas kereta mengumumkan bahwa kereta ekspres akan berangkat dari peron ketiga.",
    marks: [
      m("announced", "work", "/st/ akhir hilang", "/əˈnaʊnst/"),
      m("that", "almost", "/ð/ jadi /d/", "/ðæt/"),
      m("third", "work", "/θ/ jadi /t/", "/θɜrd/"),
    ],
    coach: ["announced", "/əˈnaʊnst/", "Kluster akhir /nst/ pada “announced” sering disederhanakan menjadi “announce”. Tambahkan /t/ tipis di ujung."],
    steps: STEPS_FINAL,
    pairs: ["announced", "announce", "danced", "dance", "fenced", "fence"],
  },
  {
    cefr: "B2",
    category: "Bandara & transportasi",
    focus: "/v/ dan -ed akhir",
    text: "Even though we had reserved everything in advance, the driver never arrived.",
    ipa: "/ˈivən ðoʊ wi hæd rɪˈzɜrvd ˈɛvriθɪŋ ɪn ədˈvæns ðə ˈdraɪvər ˈnɛvər əˈraɪvd/",
    tr: "Meski kami sudah memesan semuanya jauh hari, sopirnya tidak pernah datang.",
    marks: [
      m("reserved", "work", "/vd/ akhir hilang", "/rɪˈzɜrvd/"),
      m("advance", "almost", "/v/ jadi /f/", "/ədˈvæns/"),
      m("arrived", "work", "/vd/ akhir hilang", "/əˈraɪvd/"),
    ],
    coach: ["reserved", "/rɪˈzɜrvd/", "Di akhir “reserved”, /v/ bergetar lalu /d/ menutup kata. Kalau berubah jadi “reserf”, terdengar seperti kamu belum memesan."],
    steps: STEPS_V,
    pairs: ["reserved", "reserve", "arrived", "arrive", "saved", "save"],
  },
];

const IELTS_SEEDS: DrillSeed[] = [
  // A2
  {
    cefr: "A2",
    category: "IELTS Speaking Part 1",
    focus: "/v/ dan /ð/",
    text: "I live in Jakarta with my family and I study at university.",
    ipa: "/aɪ lɪv ɪn dʒɑˈkɑrtə wɪð maɪ ˈfæmɪli ænd aɪ ˈstʌdi æt ˌjuːnɪˈvɜrsɪti/",
    tr: "Saya tinggal di Jakarta bersama keluarga dan saya kuliah di universitas.",
    marks: [
      m("live", "work", "/v/ jadi /f/", "/lɪv/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
      m("university", "almost", "/v/ jadi /f/", "/ˌjuːnɪˈvɜrsɪti/"),
    ],
    coach: ["live", "/lɪv/", "Pada “live”, /v/ di akhir kata sering menjadi /f/ sehingga terdengar “life”. Itu mengubah arti kalimat pembuka ujianmu."],
    steps: STEPS_V,
    pairs: ["live", "life", "leave", "leaf", "save", "safe"],
  },
  {
    cefr: "A2",
    category: "IELTS Speaking Part 1",
    focus: "/v/ dan konsonan akhir",
    text: "My favorite subject is history because the teacher is very kind.",
    ipa: "/maɪ ˈfeɪvərɪt ˈsʌbdʒɪkt ɪz ˈhɪstəri bɪˈkɔz ðə ˈtiːtʃər ɪz ˈvɛri kaɪnd/",
    tr: "Pelajaran favorit saya adalah sejarah karena gurunya sangat baik.",
    marks: [
      m("favorite", "almost", "/v/ jadi /f/", "/ˈfeɪvərɪt/"),
      m("very", "work", "/v/ jadi /f/", "/ˈvɛri/"),
      m("kind", "almost", "/d/ akhir hilang", "/kaɪnd/"),
    ],
    coach: ["favorite", "/ˈfeɪvərɪt/", "Kata “favorite” sering diucapkan “faforit”. Getarkan bibir bawah pada /v/ di tengah kata."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "A2",
    category: "IELTS Speaking Part 1",
    focus: "/v/ dan -ds akhir",
    text: "I usually watch videos and listen to music on weekends.",
    ipa: "/aɪ ˈjuʒuəli wɑtʃ ˈvɪdioʊz ænd ˈlɪsən tu ˈmjuzɪk ɑn ˈwiːkɛndz/",
    tr: "Saya biasanya menonton video dan mendengarkan musik pada akhir pekan.",
    marks: [
      m("videos", "work", "/v/ jadi /f/", "/ˈvɪdioʊz/"),
      m("weekends", "almost", "-ds akhir hilang", "/ˈwiːkɛndz/"),
    ],
    coach: ["videos", "/ˈvɪdioʊz/", "Kata “videos” dimulai dengan /v/. Kalau menjadi /f/, terdengar seperti “fideos” dan perhatian penguji teralih."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "A2",
    category: "IELTS Speaking Part 1",
    focus: "/ʃ/ dan konsonan akhir",
    text: "In my free time I like to go shopping with my friends.",
    ipa: "/ɪn maɪ fri taɪm aɪ laɪk tu ɡoʊ ˈʃɑpɪŋ wɪð maɪ frɛndz/",
    tr: "Di waktu luang saya suka berbelanja bersama teman-teman.",
    marks: [
      m("shopping", "work", "/ʃ/ jadi /s/", "/ˈʃɑpɪŋ/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
      m("friends", "almost", "-ds akhir hilang", "/frɛndz/"),
    ],
    coach: ["shopping", "/ˈʃɑpɪŋ/", "Kalau /ʃ/ menjadi /s/, “shopping” terdengar seperti “sopping” (basah kuyup). Bulatkan bibir dan desiskan."],
    steps: STEPS_SH,
    pairs: PAIRS_SH1,
  },
  {
    cefr: "A2",
    category: "IELTS Speaking Part 1",
    focus: "/θ/ dan /ð/",
    text: "I think the weather in Bandung is cooler than in Jakarta.",
    ipa: "/aɪ θɪŋk ðə ˈwɛðər ɪn ˈbɑndʊŋ ɪz ˈkuːlər ðæn ɪn dʒɑˈkɑrtə/",
    tr: "Saya rasa cuaca di Bandung lebih sejuk daripada di Jakarta.",
    marks: [
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("weather", "almost", "/ð/ jadi /d/", "/ˈwɛðər/"),
      m("than", "almost", "/ð/ jadi /d/", "/ðæn/"),
    ],
    coach: ["think", "/θɪŋk/", "Di Part 1, “I think” dipakai berkali-kali. Kalau terdengar “I tink”, kejelasanmu turun di setiap jawaban."],
    steps: STEPS_TH,
    pairs: PAIRS_TH1,
  },
  // B1
  {
    cefr: "B1",
    category: "IELTS Speaking Part 1",
    focus: "/θ/ dan /v/",
    text: "Both methods help university students develop critical thinking.",
    ipa: "/boʊθ ˈmɛθədz hɛlp ˌjuːnɪˈvɜrsɪti ˈstuːdənts dɪˈvɛləp ˈkrɪtɪkəl ˈθɪŋkɪŋ/",
    tr: "Kedua metode tersebut membantu mahasiswa mengembangkan pemikiran kritis.",
    marks: [
      m("Both", "work", "/θ/ akhir jadi /t/", "/boʊθ/"),
      m("methods", "almost", "/θ/ tengah jadi /t/", "/ˈmɛθədz/"),
      m("thinking", "work", "/θ/ awal jadi /t/", "/ˈθɪŋkɪŋ/"),
    ],
    coach: ["Both", "/boʊθ/", "Kata “Both” diakhiri dengan desis gigi /θ/, bukan letupan /t/ seperti kata “Boat” (perahu)."],
    steps: [
      "Ucapkan vokal rangkap /oʊ/ dengan bibir membulat.",
      "Julurkan sedikit ujung lidah ke tepi gigi atas di akhir kata.",
      "Biarkan udara tetap mengalir keluar selama setengah detik.",
    ],
    pairs: PAIRS_TH2,
  },
  {
    cefr: "B1",
    category: "IELTS Speaking Part 1",
    focus: "/ð/, /ʃ/, dan -ts akhir",
    text: "I would say that cooking is a useful skill, especially for students living alone.",
    ipa: "/aɪ wʊd seɪ ðæt ˈkʊkɪŋ ɪz ə ˈjuːsfəl skɪl ɪˈspɛʃəli fɔr ˈstudənts ˈlɪvɪŋ əˈloʊn/",
    tr: "Menurut saya memasak adalah keterampilan yang berguna, terutama bagi pelajar yang tinggal sendiri.",
    marks: [
      m("that", "almost", "/ð/ jadi /d/", "/ðæt/"),
      m("especially", "work", "/ʃ/ jadi /s/", "/ɪˈspɛʃəli/"),
      m("students", "almost", "-ts akhir hilang", "/ˈstudənts/"),
    ],
    coach: ["especially", "/ɪˈspɛʃəli/", "Di tengah “especially” ada /ʃ/, bukan /s/. Kalau terdengar “especi-ally” dengan /s/, bunyinya terasa lebih datar."],
    steps: STEPS_SH,
    pairs: PAIRS_SH2,
  },
  {
    cefr: "B1",
    category: "IELTS Speaking Part 2",
    focus: "/v/, /θ/, dan /ð/",
    text: "Last year I visited my grandparents, and we celebrated my birthday together.",
    ipa: "/læst jɪr aɪ ˈvɪzɪtɪd maɪ ˈɡrændˌpɛrənts ænd wi ˈsɛləˌbreɪtɪd maɪ ˈbɜrθdeɪ təˈɡɛðər/",
    tr: "Tahun lalu saya mengunjungi kakek nenek, dan kami merayakan ulang tahun saya bersama.",
    marks: [
      m("visited", "work", "/v/ jadi /f/", "/ˈvɪzɪtɪd/"),
      m("birthday", "work", "/θ/ tengah jadi /t/", "/ˈbɜrθdeɪ/"),
      m("together", "almost", "/ð/ jadi /d/", "/təˈɡɛðər/"),
    ],
    coach: ["birthday", "/ˈbɜrθdeɪ/", "Di tengah “birthday”, /θ/ sering menjadi /t/ sehingga terdengar “birtday”. Julurkan lidah sebentar sebelum /d/."],
    steps: STEPS_TH,
    pairs: ["birth", "Bert", "math", "mat", "worth", "wart"],
  },
  {
    cefr: "B1",
    category: "IELTS Speaking Part 2",
    focus: "/v/, /ð/, dan /ʃ/",
    text: "I would like to describe a village that is famous for its fresh seafood.",
    ipa: "/aɪ wʊd laɪk tu dɪˈskraɪb ə ˈvɪlɪdʒ ðæt ɪz ˈfeɪməs fɔr ɪts frɛʃ ˈsiːfuːd/",
    tr: "Saya ingin menggambarkan sebuah desa yang terkenal dengan makanan lautnya yang segar.",
    marks: [
      m("village", "work", "/v/ jadi /f/", "/ˈvɪlɪdʒ/"),
      m("that", "almost", "/ð/ jadi /d/", "/ðæt/"),
      m("fresh", "almost", "/ʃ/ akhir jadi /s/", "/frɛʃ/"),
    ],
    coach: ["village", "/ˈvɪlɪdʒ/", "Kata “village” sering terdengar “fillage”. Pastikan bibir bawah bergetar di awal, lalu tutup dengan /dʒ/."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "B1",
    category: "IELTS Speaking Part 3",
    focus: "/θ/, /ð/, /ʃ/, dan /v/",
    text: "Some people think that public transport should be cheaper for everyone.",
    ipa: "/sʌm ˈpipəl θɪŋk ðæt ˈpʌblɪk ˈtrænspɔrt ʃʊd bi ˈtʃipər fɔr ˈɛvriwʌn/",
    tr: "Sebagian orang berpendapat bahwa transportasi umum seharusnya lebih murah bagi semua orang.",
    marks: [
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("should", "almost", "/ʃ/ jadi /s/", "/ʃʊd/"),
      m("everyone", "almost", "/v/ jadi /f/", "/ˈɛvriwʌn/"),
    ],
    coach: ["should", "/ʃʊd/", "Kata “should” sangat sering muncul di Part 3. Kalau /ʃ/ menjadi /s/, terdengar seperti “sud” dan kehilangan makna saran."],
    steps: STEPS_SH,
    pairs: ["should", "sued", "shoe", "sue", "shore", "sore"],
  },
  // B2
  {
    cefr: "B2",
    category: "IELTS Speaking Part 2",
    focus: "/v/ dan -ed akhir",
    text: "I have lived in several neighborhoods since I moved to this city.",
    ipa: "/aɪ hæv lɪvd ɪn ˈsɛvrəl ˈneɪbərˌhʊdz sɪns aɪ muːvd tu ðɪs ˈsɪti/",
    tr: "Saya telah tinggal di beberapa lingkungan sejak saya pindah ke kota ini.",
    marks: [
      m("lived", "work", "/vd/ akhir hilang", "/lɪvd/"),
      m("several", "almost", "/v/ jadi /f/", "/ˈsɛvrəl/"),
      m("moved", "almost", "/vd/ akhir kurang jelas", "/muːvd/"),
    ],
    coach: [
      "lived",
      "/lɪvd/",
      "Dalam IELTS Speaking, kejelasan bentuk Present Perfect (“have lived”) dinilai di kriteria Grammar sekaligus Pronunciation.",
    ],
    steps: [
      "Getarkan bibir bawah untuk bunyi /v/ setelah vokal /ɪ/.",
      "Tanpa melepas suara, sentuhkan ujung lidah ke langit-langit atas untuk menutup dengan /d/.",
      "Hindari mengucapkannya sebagai “live” tanpa /d/.",
    ],
    pairs: ["lived", "live", "moved", "move", "saved", "save"],
  },
  {
    cefr: "B2",
    category: "IELTS Speaking Part 2",
    focus: "/v/, -st akhir, dan -ed akhir",
    text: "The most memorable place I have ever visited is a quiet village surrounded by green mountains.",
    ipa: "/ðə moʊst ˈmɛmərəbəl pleɪs aɪ hæv ˈɛvər ˈvɪzɪtɪd ɪz ə ˈkwaɪət ˈvɪlɪdʒ səˈraʊndɪd baɪ ɡriːn ˈmaʊntənz/",
    tr: "Tempat paling berkesan yang pernah saya kunjungi adalah desa tenang yang dikelilingi pegunungan hijau.",
    marks: [
      m("visited", "work", "/v/ jadi /f/", "/ˈvɪzɪtɪd/"),
      m("village", "almost", "/v/ jadi /f/", "/ˈvɪlɪdʒ/"),
      m("surrounded", "almost", "-ded akhir kurang jelas", "/səˈraʊndɪd/"),
      m("most", "almost", "/t/ akhir hilang", "/moʊst/"),
    ],
    coach: ["visited", "/ˈvɪzɪtɪd/", "Setelah /t/, akhiran -ed menjadi suku kata /ɪd/ penuh. Pastikan /v/ di awal bergetar dan /ɪd/ di akhir tidak ditelan."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "B2",
    category: "IELTS Speaking Part 3",
    focus: "/ð/, /v/, dan /ʃ/",
    text: "Furthermore, governments should invest in renewable energy solutions.",
    ipa: "/ˈfɜrðərˌmɔr ˈɡʌvərnmənts ʃʊd ɪnˈvɛst ɪn rɪˈnuːəbəl ˈɛnərdʒi səˈluːʃənz/",
    tr: "Selain itu, pemerintah sebaiknya berinvestasi pada solusi energi terbarukan.",
    marks: [
      m("Furthermore", "almost", "/ð/ jadi /d/", "/ˈfɜrðərˌmɔr/"),
      m("invest", "work", "/v/ jadi /f/", "/ɪnˈvɛst/"),
      m("solutions", "almost", "/ʃ/ jadi /s/", "/səˈluːʃənz/"),
    ],
    coach: [
      "invest",
      "/ɪnˈvɛst/",
      "Tekanan kata berada di suku kata kedua (-vest). Pastikan /v/ bergetar dan kluster akhir /st/ terdengar utuh.",
    ],
    steps: [
      "Mulai ringan pada suku kata “in-”.",
      "Sentuhkan gigi atas ke bibir bawah dengan tegas saat masuk ke “-vest”.",
      "Tutup dengan desis /s/ dan letupan /t/ yang jelas.",
    ],
    pairs: ["invest", "infest", "vest", "fest", "vast", "fast"],
  },
  {
    cefr: "B2",
    category: "IELTS Speaking Part 3",
    focus: "/ʃ/, /v/, dan /θ/",
    text: "Nowadays many young people rely heavily on social media, which can affect their mental health.",
    ipa: "/ˈnaʊədeɪz ˈmɛni jʌŋ ˈpipəl rɪˈlaɪ ˈhɛvɪli ɑn ˈsoʊʃəl ˈmiːdiə wɪtʃ kæn əˈfɛkt ðɛr ˈmɛntəl hɛlθ/",
    tr: "Zaman sekarang banyak anak muda sangat bergantung pada media sosial, yang bisa memengaruhi kesehatan mental mereka.",
    marks: [
      m("heavily", "almost", "/v/ jadi /f/", "/ˈhɛvɪli/"),
      m("social", "work", "/ʃ/ jadi /s/", "/ˈsoʊʃəl/"),
      m("health", "work", "/θ/ akhir jadi /t/", "/hɛlθ/"),
      m("their", "almost", "/ð/ jadi /d/", "/ðɛr/"),
    ],
    coach: ["health", "/hɛlθ/", "Kata “health” menutup dengan gugus /lθ/. Kalau /θ/ menjadi /t/, terdengar seperti “helt”, dan topik jawabanmu kurang jelas."],
    steps: STEPS_TH,
    pairs: PAIRS_TH2,
  },
  {
    cefr: "B2",
    category: "IELTS Speaking Part 3",
    focus: "/v/, /ʃ/, dan -ts akhir",
    text: "I believe governments should provide more scholarships so talented students can study abroad.",
    ipa: "/aɪ bɪˈliv ˈɡʌvərnmənts ʃʊd prəˈvaɪd mɔr ˈskɑlərʃɪps soʊ ˈtæləntɪd ˈstudənts kæn ˈstʌdi əˈbrɔd/",
    tr: "Saya yakin pemerintah sebaiknya menyediakan lebih banyak beasiswa agar pelajar berbakat bisa kuliah di luar negeri.",
    marks: [
      m("believe", "work", "/v/ akhir jadi /f/", "/bɪˈliv/"),
      m("provide", "almost", "/v/ jadi /f/", "/prəˈvaɪd/"),
      m("scholarships", "almost", "/ʃ/ jadi /s/ dan -ps akhir hilang", "/ˈskɑlərʃɪps/"),
    ],
    coach: ["believe", "/bɪˈliv/", "Kata “believe” berakhir dengan /v/ bersuara. Kalau menjadi /f/, terdengar seperti “belief” (keyakinan), kata benda."],
    steps: STEPS_V,
    pairs: ["believe", "belief", "leave", "leaf", "prove", "proof"],
  },
];

const HARIAN_SEEDS: DrillSeed[] = [
  // A2
  {
    cefr: "A2",
    category: "Obrolan ringan",
    focus: "/v/ dan /ð/",
    text: "I have a very good feeling about this weather.",
    ipa: "/aɪ hæv ə ˈvɛri ɡʊd ˈfiːlɪŋ əˈbaʊt ðɪs ˈwɛðər/",
    tr: "Aku punya firasat yang sangat bagus soal cuaca ini.",
    marks: [
      m("very", "work", "/v/ jadi /f/", "/ˈvɛri/"),
      m("this", "almost", "/ð/ jadi /d/", "/ðɪs/"),
    ],
    coach: ["very", "/ˈvɛri/", "Bunyi /v/-mu terdengar seperti /f/, jadi “fery”. Wajar, karena bahasa Indonesia tidak punya bunyi /v/."],
    steps: [
      "Gigi atas menyentuh bibir bawah dengan ringan.",
      "Hembuskan udara sambil menyalakan pita suara.",
      "Rasakan getaran di bibir bawah. Kalau tidak bergetar, itu masih /f/.",
    ],
    pairs: ["very", "fairy", "van", "fan", "vest", "fest"],
  },
  {
    cefr: "A2",
    category: "Obrolan ringan",
    focus: "/θ/, /ʃ/, dan konsonan akhir",
    text: "Thank you for waiting, the shop is closed now.",
    ipa: "/θæŋk ju fɔr ˈweɪtɪŋ ðə ʃɑp ɪz kloʊzd naʊ/",
    tr: "Terima kasih sudah menunggu, tokonya sudah tutup sekarang.",
    marks: [
      m("Thank", "work", "/θ/ jadi /t/", "/θæŋk/"),
      m("shop", "almost", "/ʃ/ jadi /s/", "/ʃɑp/"),
      m("closed", "almost", "/d/ akhir hilang", "/kloʊzd/"),
    ],
    coach: [
      "Thank",
      "/θæŋk/",
      "Bunyi /θ/ di awal kata “Thank” terdengar seperti /t/ (“Tank”). Ujung lidah perlu menyentuh tepi gigi atas.",
    ],
    steps: [
      "Letakkan ujung lidah ringan di antara gigi atas dan gigi bawah.",
      "Tiupkan udara keluar melalui celah gigi tanpa menekan lidah terlalu keras.",
      "Tarik lidah ke dalam saat masuk ke vokal /æ/.",
    ],
    pairs: ["thank", "tank", "think", "tink", "three", "tree"],
  },
  {
    cefr: "A2",
    category: "Obrolan ringan",
    focus: "/v/, /ð/, dan konsonan akhir",
    text: "Do you want to have lunch with me at the food court?",
    ipa: "/du ju wɑnt tu hæv lʌntʃ wɪð mi æt ðə fud kɔrt/",
    tr: "Mau makan siang bareng aku di food court?",
    marks: [
      m("have", "almost", "/v/ jadi /f/", "/hæv/"),
      m("with", "almost", "/ð/ akhir jadi /d/ atau /t/", "/wɪð/"),
      m("want", "almost", "/t/ akhir hilang", "/wɑnt/"),
    ],
    coach: ["have", "/hæv/", "Kata “have” berakhir dengan /v/. Kalau menjadi /f/, terdengar seperti “half” (setengah) dan ajakanmu jadi membingungkan."],
    steps: STEPS_V,
    pairs: PAIRS_V4,
  },
  {
    cefr: "A2",
    category: "Obrolan akhir pekan",
    focus: "/v/, -s, dan konsonan akhir",
    text: "My friend Dava lives near my kos and he always visits on Sunday.",
    ipa: "/maɪ frɛnd ˈdɑvə lɪvz nɪr maɪ kɔs ænd hi ˈɔlweɪz ˈvɪzɪts ɑn ˈsʌndeɪ/",
    tr: "Temanku Dava tinggal dekat kosku dan dia selalu main pada hari Minggu.",
    marks: [
      m("lives", "work", "/vz/ akhir jadi /fs/", "/lɪvz/"),
      m("visits", "work", "/v/ jadi /f/ dan -ts akhir hilang", "/ˈvɪzɪts/"),
      m("friend", "almost", "/d/ akhir hilang", "/frɛnd/"),
    ],
    coach: ["lives", "/lɪvz/", "Pada “lives” (kata kerja), /v/ bergetar lalu /z/. Kalau menjadi /fs/, terdengar seperti “leafs”."],
    steps: STEPS_V,
    pairs: PAIRS_V3,
  },
  {
    cefr: "A2",
    category: "Obrolan ringan",
    focus: "/ʃ/, /ð/, dan -t akhir",
    text: "I washed the dishes and then I cooked dinner for my sister.",
    ipa: "/aɪ wɑʃt ðə ˈdɪʃɪz ænd ðɛn aɪ kʊkt ˈdɪnər fɔr maɪ ˈsɪstər/",
    tr: "Aku mencuci piring lalu memasak makan malam untuk kakak perempuanku.",
    marks: [
      m("washed", "work", "/ʃt/ akhir kurang jelas", "/wɑʃt/"),
      m("then", "almost", "/ð/ jadi /d/", "/ðɛn/"),
      m("cooked", "work", "/t/ akhir hilang", "/kʊkt/"),
    ],
    coach: ["washed", "/wɑʃt/", "Akhiran -ed pada “washed” diucapkan /t/ setelah /ʃ/. Kalau /ʃ/ menjadi /s/ dan /t/ hilang, kata terdengar seperti “was”."],
    steps: STEPS_SH,
    pairs: ["washed", "wash", "pushed", "push", "watched", "watch"],
  },
  // B1
  {
    cefr: "B1",
    category: "Obrolan akhir pekan",
    focus: "/ð/ dan /v/",
    text: "They usually visit their favorite cafe on Friday evening.",
    ipa: "/ðeɪ ˈjuːʒuəli ˈvɪzɪt ðɛr ˈfeɪvərɪt kæˈfeɪ ɑn ˈfraɪdeɪ ˈiːvnɪŋ/",
    tr: "Mereka biasanya mengunjungi kafe favorit mereka pada Jumat malam.",
    marks: [
      m("They", "almost", "/ð/ jadi /d/", "/ðeɪ/"),
      m("visit", "work", "/v/ jadi /f/", "/ˈvɪzɪt/"),
    ],
    coach: ["visit", "/ˈvɪzɪt/", "Kata “visit” sering terdengar seperti “fisit”. Pastikan bibir bawah bergetar sejak suku kata pertama."],
    steps: [
      "Tempelkan gigi atas ke bibir bawah sebelum memulai kata.",
      "Nyalakan suara /v/ yang bergetar lalu sambung ke vokal /ɪ/.",
      "Pertahankan desis bersuara /z/ di tengah kata.",
    ],
    pairs: ["visit", "very", "fairy", "view", "few"],
  },
  {
    cefr: "B1",
    category: "Obrolan ringan",
    focus: "/ð/, /ʃ/, dan /v/",
    text: "There is a nice market near my house where I buy fresh vegetables.",
    ipa: "/ðɛr ɪz ə naɪs ˈmɑrkɪt nɪr maɪ haʊs wɛr aɪ baɪ frɛʃ ˈvɛdʒtəbəlz/",
    tr: "Ada pasar yang bagus dekat rumahku, tempat aku membeli sayur segar.",
    marks: [
      m("There", "almost", "/ð/ jadi /d/", "/ðɛr/"),
      m("fresh", "almost", "/ʃ/ akhir jadi /s/", "/frɛʃ/"),
      m("vegetables", "work", "/v/ jadi /f/", "/ˈvɛdʒtəbəlz/"),
    ],
    coach: ["vegetables", "/ˈvɛdʒtəbəlz/", "Kata “vegetables” hanya punya tiga suku kata (/ˈvɛdʒ-tə-bəlz/) dan dimulai dengan /v/. Kalau menjadi /f/, terdengar “fegetables”."],
    steps: STEPS_V,
    pairs: PAIRS_V1,
  },
  {
    cefr: "B1",
    category: "Obrolan ringan",
    focus: "/θ/, /ʃ/, dan /v/",
    text: "I have been learning English for three years, but I still feel nervous.",
    ipa: "/aɪ hæv bɪn ˈlɜrnɪŋ ˈɪŋɡlɪʃ fɔr θriː jɪrz bʌt aɪ stɪl fil ˈnɜrvəs/",
    tr: "Aku sudah belajar bahasa Inggris selama tiga tahun, tetapi masih merasa gugup.",
    marks: [
      m("three", "work", "/θ/ jadi /t/", "/θriː/"),
      m("English", "almost", "/ʃ/ akhir jadi /s/", "/ˈɪŋɡlɪʃ/"),
      m("nervous", "work", "/v/ jadi /f/", "/ˈnɜrvəs/"),
    ],
    coach: ["nervous", "/ˈnɜrvəs/", "Di tengah “nervous”, /v/ harus bergetar. Kalau menjadi /f/, terdengar “nerfus” dan membuat kejelasan turun saat kamu sedang gugup."],
    steps: STEPS_V,
    pairs: PAIRS_V2,
  },
  {
    cefr: "B1",
    category: "Obrolan akhir pekan",
    focus: "/v/, /ð/, dan -ed akhir",
    text: "We watched a movie together, then we shared a pizza and talked until midnight.",
    ipa: "/wi wɑtʃt ə ˈmuːvi təˈɡɛðər ðɛn wi ʃɛrd ə ˈpitsə ænd tɔkt ənˈtɪl ˈmɪdnaɪt/",
    tr: "Kami menonton film bersama, lalu berbagi pizza dan mengobrol sampai tengah malam.",
    marks: [
      m("movie", "work", "/v/ jadi /f/", "/ˈmuːvi/"),
      m("shared", "almost", "/ʃ/ jadi /s/ dan /d/ akhir hilang", "/ʃɛrd/"),
      m("talked", "work", "/t/ akhir hilang", "/tɔkt/"),
    ],
    coach: ["movie", "/ˈmuːvi/", "Kata “movie” memuat /v/ di tengah. Kalau menjadi /f/, terdengar seperti “mufi”. Getarkan bibir bawah sebelum /i/."],
    steps: STEPS_V,
    pairs: ["movie", "mufi", "move", "moof", "grave", "grafe"].slice(0, 0).concat(["move", "moo", "veal", "feel", "vine", "fine"]),
  },
  {
    cefr: "B1",
    category: "Obrolan akhir pekan",
    focus: "/v/ dan konsonan akhir",
    text: "I am afraid I cannot join the party because I have a deadline on Friday.",
    ipa: "/aɪ æm əˈfreɪd aɪ ˈkænɑt dʒɔɪn ðə ˈpɑrti bɪˈkɔz aɪ hæv ə ˈdɛdlaɪn ɑn ˈfraɪdeɪ/",
    tr: "Maaf, aku tidak bisa ikut pesta karena ada tenggat pada hari Jumat.",
    marks: [
      m("afraid", "almost", "/d/ akhir hilang", "/əˈfreɪd/"),
      m("have", "almost", "/v/ jadi /f/", "/hæv/"),
      m("deadline", "almost", "/d/ di tengah hilang", "/ˈdɛdlaɪn/"),
    ],
    coach: ["afraid", "/əˈfreɪd/", "Kata “afraid” berakhir dengan /d/. Kalau /d/ hilang, terdengar seperti “a-fray” dan nada permintaan maafmu kurang jelas."],
    steps: STEPS_FINAL,
    pairs: ["made", "may", "played", "play", "stayed", "stay"],
  },
  // B2
  {
    cefr: "B2",
    category: "Obrolan ringan",
    focus: "/θ/, /v/, dan konsonan akhir",
    text: "I used to think living abroad would be easy, but it was quite challenging.",
    ipa: "/aɪ juːst tu θɪŋk ˈlɪvɪŋ əˈbrɔd wʊd bi ˈizi bʌt ɪt wʌz kwaɪt ˈtʃælɪndʒɪŋ/",
    tr: "Dulu aku mengira tinggal di luar negeri itu mudah, tetapi ternyata cukup menantang.",
    marks: [
      m("used", "almost", "/st/ akhir hilang", "/juːst/"),
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("living", "almost", "/v/ jadi /f/", "/ˈlɪvɪŋ/"),
      m("abroad", "almost", "/d/ akhir hilang", "/əˈbrɔd/"),
    ],
    coach: ["think", "/θɪŋk/", "Dalam cerita pengalaman, “think” sering muncul di awal pendapat. Julurkan ujung lidah agar tidak terdengar “tink”."],
    steps: STEPS_TH,
    pairs: PAIRS_TH1,
  },
  {
    cefr: "B2",
    category: "Obrolan akhir pekan",
    focus: "/ð/, /θ/, dan /v/",
    text: "Honestly, I would rather stay home than go through the hassle of travelling every weekend.",
    ipa: "/ˈɑnɪstli aɪ wʊd ˈræðər steɪ hoʊm ðæn ɡoʊ θru ðə ˈhæsəl əv ˈtrævəlɪŋ ˈɛvri ˈwiːkɛnd/",
    tr: "Jujur, aku lebih suka diam di rumah daripada repot bepergian setiap akhir pekan.",
    marks: [
      m("rather", "almost", "/ð/ jadi /d/", "/ˈræðər/"),
      m("through", "work", "/θ/ jadi /t/", "/θru/"),
      m("travelling", "almost", "/v/ jadi /f/", "/ˈtrævəlɪŋ/"),
    ],
    coach: ["through", "/θru/", "Kata “through” dimulai dengan /θ/ lalu /r/. Kalau menjadi “true”, pendengar mengira kamu mengatakan “benar”."],
    steps: STEPS_TH,
    pairs: ["through", "true", "three", "free", "thought", "taught"],
  },
  {
    cefr: "B2",
    category: "Obrolan akhir pekan",
    focus: "/v/ dan -ed akhir",
    text: "My cousin moved to a bigger apartment, so we helped him carry the heavy furniture.",
    ipa: "/maɪ ˈkʌzən muːvd tu ə ˈbɪɡər əˈpɑrtmənt soʊ wi hɛlpt hɪm ˈkæri ðə ˈhɛvi ˈfɜrnɪtʃər/",
    tr: "Sepupuku pindah ke apartemen yang lebih besar, jadi kami membantunya mengangkat perabot yang berat.",
    marks: [
      m("moved", "work", "/vd/ akhir hilang", "/muːvd/"),
      m("helped", "work", "/t/ akhir hilang", "/hɛlpt/"),
      m("heavy", "almost", "/v/ jadi /f/", "/ˈhɛvi/"),
    ],
    coach: ["moved", "/muːvd/", "Di akhir “moved”, /v/ bergetar lalu /d/ menutup. Kalau menjadi “moof”, cerita pindahan terdengar seperti present tense."],
    steps: STEPS_V,
    pairs: ["moved", "move", "saved", "save", "lived", "live"],
  },
  {
    cefr: "B2",
    category: "Obrolan ringan",
    focus: "/ð/, /θ/, /ʃ/, dan /v/",
    text: "Although I rarely cook, I think everyone should know a few simple dishes.",
    ipa: "/ɔlˈðoʊ aɪ ˈrɛrli kʊk aɪ θɪŋk ˈɛvriwʌn ʃʊd noʊ ə fju ˈsɪmpəl ˈdɪʃɪz/",
    tr: "Meski jarang memasak, menurutku semua orang sebaiknya bisa membuat beberapa hidangan sederhana.",
    marks: [
      m("Although", "almost", "/ð/ jadi /d/", "/ɔlˈðoʊ/"),
      m("think", "work", "/θ/ jadi /t/", "/θɪŋk/"),
      m("should", "almost", "/ʃ/ jadi /s/", "/ʃʊd/"),
      m("everyone", "almost", "/v/ jadi /f/", "/ˈɛvriwʌn/"),
    ],
    coach: ["Although", "/ɔlˈðoʊ/", "Bunyi /ð/ di tengah “Although” sering menjadi /d/ sehingga terdengar “aldo”. Letakkan lidah di antara gigi sebelum /oʊ/."],
    steps: STEPS_DH,
    pairs: PAIRS_DH2,
  },
  {
    cefr: "B2",
    category: "Obrolan ringan",
    focus: "/ð/, /v/, dan -ed akhir",
    text: "Whether we like it or not, smartphones have changed the way we communicate with others.",
    ipa: "/ˈwɛðər wi laɪk ɪt ɔr nɑt ˈsmɑrtfoʊnz hæv tʃeɪndʒd ðə weɪ wi kəˈmjunɪkeɪt wɪð ˈʌðərz/",
    tr: "Suka atau tidak, ponsel pintar telah mengubah cara kita berkomunikasi dengan orang lain.",
    marks: [
      m("Whether", "almost", "/ð/ jadi /d/", "/ˈwɛðər/"),
      m("changed", "work", "/dʒd/ akhir hilang", "/tʃeɪndʒd/"),
      m("others", "almost", "/ð/ tengah jadi /d/ dan -s akhir hilang", "/ˈʌðərz/"),
    ],
    coach: ["others", "/ˈʌðərz/", "Di tengah “others” ada /ð/ bersuara dan di akhir ada /z/. Kalau menjadi “aders”, kata ini terdengar seperti kata lain."],
    steps: STEPS_DH,
    pairs: PAIRS_DH1,
  },
];

const DRILL_SENTENCES = [
  ...buildDrills("kerja", KERJA_SEEDS),
  ...buildDrills("jalan", JALAN_SEEDS),
  ...buildDrills("ielts", IELTS_SEEDS),
  ...buildDrills("harian", HARIAN_SEEDS),
];

// ---------------------------------------------------------------------------
// Konten belajar: skenario roleplay (8 skenario x 6 giliran)
// ---------------------------------------------------------------------------

type CorrectionSeed = {
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  status: MarkStatus;
  promptText: string;
  detailText: string;
};

type NodeSeed = {
  line: string;
  tr: string;
  hints: string[];
  fix?: CorrectionSeed;
};

type ScenarioSeed = {
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

const SCENARIO_SEEDS: ScenarioSeed[] = [
  {
    slug: "memesan-di-kafe",
    goalTag: "harian",
    title: "Memesan di kafe",
    category: "Sehari-hari",
    cefrLevel: "A2 · Dasar",
    characterName: "Sam",
    characterRole: "Barista di Bean Corner",
    characterTrait: "Ramah · bicara pelan · aksen US",
    description: "Kamu pelanggan di kafe yang ramai. Pesan minuman, tambah camilan, lalu bayar.",
    missions: ["Pesan satu minuman", "Tambah makanan", "Bayar dan pamit"],
    phrases: [
      { phrase: "to go", meaning: "dibawa pulang" },
      { phrase: "for here", meaning: "makan di sini" },
      { phrase: "Can I pay by card?", meaning: "Bisa bayar pakai kartu?" },
    ],
    nodes: [
      {
        line: "Hi there! Welcome to Bean Corner. What can I get for you today?",
        tr: "Halo! Selamat datang di Bean Corner. Mau pesan apa hari ini?",
        hints: ["Could I get an iced latte, medium, please?", "I would like a hot cappuccino, please."],
      },
      {
        line: "Got it. Would you like any milk alternative, like oat or soy?",
        tr: "Siap. Mau susu pengganti, misalnya oat atau kedelai?",
        hints: [
          "Oat milk, please. I have a mild allergy to dairy.",
          "Regular milk is fine, thank you.",
        ],
      },
      {
        line: "Sure! Anything to eat with that? Our croissants just came out of the oven.",
        tr: "Tentu! Mau makan sesuatu juga? Croissant kami baru keluar dari oven.",
        hints: ["Yes, one croissant, please.", "No thanks, just the latte."],
      },
      {
        line: "Nice choice! Would you like it warmed up, with a little butter or jam?",
        tr: "Pilihan bagus! Mau dihangatkan, dengan sedikit mentega atau selai?",
        hints: [
          "Yes, warm it up please, with a little butter.",
          "No, just plain. Thanks!",
        ],
      },
      {
        line: "Great choice. That'll be seven fifty. Card or cash?",
        tr: "Pilihan bagus. Totalnya tujuh lima puluh. Kartu atau tunai?",
        hints: ["I will pay by card. Thank you!", "Can I pay with cash, please?"],
        fix: {
          word: "card",
          ipa: "/kɑrd/",
          phoneme: "/d/",
          errorPattern: "-d akhir",
          status: "almost",
          promptText: "Hampir. Coba perjelas bunyi /d/ di akhir kata card.",
          detailText: "Bunyi /d/ di akhir kata card dicatat ke Bank Kesalahan.",
        },
      },
      {
        line: "All done. Here is your receipt. Your drink will be ready at the end of the counter. Have a lovely day!",
        tr: "Selesai. Ini struknya. Minumanmu akan siap di ujung konter. Semoga harimu menyenangkan!",
        hints: [
          "Thank you very much, have a nice day!",
          "Thanks, I will definitely visit again.",
        ],
      },
    ],
  },
  {
    slug: "wawancara-startup",
    goalTag: "kerja",
    title: "Wawancara kerja di startup",
    category: "Wawancara & Kerja",
    cefrLevel: "B1 · Menengah",
    characterName: "Rina",
    characterRole: "HR Lead di NusaTech",
    characterTrait: "Profesional · suportif · aksen US jelas",
    description:
      "Kamu melamar posisi di startup teknologi. Perkenalkan dirimu, ceritakan proyek terakhir, lalu tanyakan tahap seleksi berikutnya.",
    missions: [
      "Perkenalkan diri dan pengalaman singkat",
      "Jelaskan proyek yang pernah kamu selesaikan",
      "Tanyakan langkah rekrutmen berikutnya",
    ],
    phrases: [
      { phrase: "I worked on...", meaning: "Saya pernah mengerjakan..." },
      { phrase: "We solved the issue by...", meaning: "Kami menyelesaikan masalahnya dengan..." },
      { phrase: "What are the next steps?", meaning: "Apa tahapan berikutnya?" },
    ],
    nodes: [
      {
        line: "Thanks for joining today! Could you tell me about a recent project you worked on?",
        tr: "Terima kasih sudah bergabung hari ini! Bisa ceritakan satu proyek terakhir yang pernah kamu kerjakan?",
        hints: [
          "I worked on a web project and solved the main user issue.",
          "Last month I developed a very useful dashboard for our team.",
        ],
        fix: {
          word: "worked",
          ipa: "/wɜrkt/",
          phoneme: "/-ed/",
          errorPattern: "-ed akhir",
          status: "work",
          promptText: "Perhatikan akhiran -ed pada kata worked.",
          detailText:
            "Bunyi /t/ di akhir worked perlu terdengar agar jelas bahwa proyek tersebut sudah dikerjakan (past tense).",
        },
      },
      {
        line: "Nice. What was your role in that project, and who did you work with?",
        tr: "Bagus. Apa peranmu dalam proyek itu, dan dengan siapa kamu bekerja?",
        hints: [
          "I was the lead developer and I worked with three designers.",
          "I managed the schedule and shared updates with the team.",
        ],
      },
      {
        line: "That sounds impressive. How did you handle feedback from your team during that project?",
        tr: "Terdengar menarik. Bagaimana cara kamu menangani masukan dari tim selama proyek tersebut?",
        hints: [
          "I think regular review sessions helped us very much.",
          "We discussed every version openly and fixed issues together.",
        ],
        fix: {
          word: "think",
          ipa: "/θɪŋk/",
          phoneme: "/θ/",
          errorPattern: "th → t",
          status: "almost",
          promptText: "Hampir! Coba perjelas bunyi /θ/ pada kata think.",
          detailText: "Sentuhkan ujung lidah ke tepi gigi atas sebelum mengucapkan think.",
        },
      },
      {
        line: "Great. Can you tell me about a challenge you faced and how you solved it?",
        tr: "Bagus. Bisa ceritakan satu tantangan yang kamu hadapi dan bagaimana kamu menyelesaikannya?",
        hints: [
          "We discovered a serious bug, so I proposed a new solution.",
          "We missed an important deadline, so I organized daily check-ins.",
        ],
      },
      {
        line: "Thank you for sharing. Do you have any questions for us before we wrap up?",
        tr: "Terima kasih sudah berbagi. Apakah ada pertanyaan untuk kami sebelum sesi ini ditutup?",
        hints: [
          "Thank you, what are the next steps in this interview process?",
          "When can I expect to hear back from the team?",
        ],
      },
      {
        line: "Of course. We will review all candidates this week and send you an update by Friday. Anything else?",
        tr: "Tentu. Kami akan meninjau semua kandidat minggu ini dan mengirim kabar paling lambat Jumat. Ada lagi?",
        hints: [
          "No, thank you. I am very excited about this opportunity.",
          "That is clear. Thank you for your time, I will wait for your email.",
        ],
      },
    ],
  },
  {
    slug: "checkin-hotel-singapura",
    goalTag: "jalan",
    title: "Check-in hotel di Singapura",
    category: "Jalan-jalan",
    cefrLevel: "A2 · Dasar",
    characterName: "Liam",
    characterRole: "Resepsionis di Marina Stay",
    characterTrait: "Sigap · ramah · bicara jelas",
    description:
      "Kamu baru tiba di hotel. Sebutkan nama reservasimu, konfirmasi pembayaran dengan kartu, lalu tanyakan arah ke stasiun MRT.",
    missions: [
      "Sebutkan reservasi kamar",
      "Konfirmasi deposit dengan kartu",
      "Tanyakan arah ke stasiun MRT terdekat",
    ],
    phrases: [
      { phrase: "I have a reservation", meaning: "Saya punya reservasi" },
      { phrase: "Can I pay the deposit by card?", meaning: "Bisa bayar deposit pakai kartu?" },
      { phrase: "Where is the nearest station?", meaning: "Di mana stasiun terdekat?" },
    ],
    nodes: [
      {
        line: "Welcome to Marina Stay! I found your reservation for two nights. How would you like to cover the deposit?",
        tr: "Selamat datang di Marina Stay! Saya menemukan reservasi Anda untuk dua malam. Bagaimana Anda ingin membayar depositnya?",
        hints: ["I will pay the deposit by card, please.", "Can I use this credit card for the deposit?"],
        fix: {
          word: "card",
          ipa: "/kɑrd/",
          phoneme: "/-ed/",
          errorPattern: "-d akhir",
          status: "work",
          promptText: "Coba perjelas bunyi /d/ di akhir kata card.",
          detailText: "Tanpa bunyi penutup /d/, kata card terdengar seperti car.",
        },
      },
      {
        line: "Perfect. Could I see your passport, please? And when do you plan to check out?",
        tr: "Baik. Boleh saya lihat paspor Anda? Dan kapan Anda berencana check-out?",
        hints: [
          "Sure, here is my passport. We will check out on Sunday at noon.",
          "Here you are. We leave on the third, around eleven.",
        ],
      },
      {
        line: "Here is your room key on the fifth floor. Is there anything else you need help with today?",
        tr: "Ini kunci kamar Anda di lantai lima. Apakah ada hal lain yang bisa saya bantu hari ini?",
        hints: [
          "Excuse me, where is the shuttle bus to the station?",
          "How do I walk to the nearest MRT station from here?",
        ],
        fix: {
          word: "shuttle",
          ipa: "/ˈʃʌtəl/",
          phoneme: "/ʃ/",
          errorPattern: "sh → s",
          status: "almost",
          promptText: "Hampir! Bulatkan bibir sedikit saat mengucapkan shuttle.",
          detailText: "Bunyi /ʃ/ di awal shuttle sudah masuk jadwal latihanmu.",
        },
      },
      {
        line: "The shuttle bus runs every fifteen minutes, but the MRT station is only a short walk. Which would you prefer?",
        tr: "Bus antar-jemput berangkat tiap lima belas menit, tetapi stasiun MRT hanya berjarak jalan kaki singkat. Anda lebih suka yang mana?",
        hints: [
          "I would prefer to walk. Could you show me the way?",
          "Is the shuttle free for guests?",
        ],
      },
      {
        line: "Just walk through the main lobby and turn right. Enjoy your stay!",
        tr: "Cukup jalan melewati lobi utama lalu belok kanan. Selamat menikmati masa menginap Anda!",
        hints: ["Thank you very much for your help!", "Thanks, have a great evening!"],
      },
      {
        line: "Oh, one more thing. Breakfast is served on the second floor from seven to ten.",
        tr: "Oh, satu hal lagi. Sarapan disajikan di lantai dua dari jam tujuh sampai sepuluh.",
        hints: ["Great, thank you very much!", "Thanks, I will have breakfast there tomorrow."],
      },
    ],
  },
  {
    slug: "simulasi-ielts-part1",
    goalTag: "ielts",
    title: "Simulasi IELTS Speaking Part 1",
    category: "IELTS & Akademik",
    cefrLevel: "B1/B2 · Akademik",
    characterName: "Dr. Claire",
    characterRole: "Penguji Speaking",
    characterTrait: "Netral · terstruktur · tempo standar ujian",
    description:
      "Latihan tanya jawab IELTS Speaking Part 1 tentang kebiasaan belajar dan teknologi dengan struktur jawaban 2-3 kalimat.",
    missions: [
      "Ceritakan kebiasaan belajarmu",
      "Berikan alasan mengapa metode itu efektif",
      "Jawab pertanyaan tentang rencana masa depan",
    ],
    phrases: [
      { phrase: "Both methods help me...", meaning: "Kedua metode itu membantu saya..." },
      { phrase: "From my perspective...", meaning: "Dari sudut pandang saya..." },
      { phrase: "In the near future...", meaning: "Dalam waktu dekat..." },
    ],
    nodes: [
      {
        line: "Let's talk about your study habits. Do you prefer studying alone or discussing topics with other students?",
        tr: "Mari bicara tentang kebiasaan belajar Anda. Apakah Anda lebih suka belajar sendiri atau berdiskusi dengan pelajar lain?",
        hints: [
          "Both methods help me understand difficult university subjects.",
          "I think studying with friends helps me develop new ideas.",
        ],
        fix: {
          word: "Both",
          ipa: "/boʊθ/",
          phoneme: "/θ/",
          errorPattern: "th → t",
          status: "work",
          promptText: "Perhatikan desis /θ/ di akhir kata Both.",
          detailText: "Akhiri kata Both dengan ujung lidah di antara gigi agar tidak terdengar Boat.",
        },
      },
      {
        line: "And do you think studying in a group is more effective than studying alone? Why?",
        tr: "Dan menurut Anda, apakah belajar berkelompok lebih efektif daripada belajar sendiri? Mengapa?",
        hints: [
          "Yes, because we can share different ideas and explain things to each other.",
          "I think it depends on the subject, but groups usually motivate me.",
        ],
      },
      {
        line: "How has technology changed the way you prepare for exams over the last few years?",
        tr: "Bagaimana teknologi mengubah cara Anda mempersiapkan ujian selama beberapa tahun terakhir?",
        hints: [
          "Digital tools have improved the way I review several courses.",
          "I use online practice every evening to check my pronunciation.",
        ],
        fix: {
          word: "several",
          ipa: "/ˈsɛvrəl/",
          phoneme: "/v/",
          errorPattern: "v → f",
          status: "almost",
          promptText: "Hampir! Getarkan bibir bawah pada bunyi /v/ di several.",
          detailText: "Kata several sudah dicatat ke Bank Kesalahan untuk diulang.",
        },
      },
      {
        line: "Interesting. Do you think technology will replace teachers in the future?",
        tr: "Menarik. Apakah menurut Anda teknologi akan menggantikan guru di masa depan?",
        hints: [
          "I do not think so, because teachers give personal advice that technology cannot.",
          "Maybe partly, but they should work together with technology.",
        ],
      },
      {
        line: "Thank you. Finally, what skill would you like to develop further this year?",
        tr: "Terima kasih. Terakhir, keterampilan apa yang ingin Anda kembangkan lebih jauh tahun ini?",
        hints: [
          "I want to speak English with greater confidence at work.",
          "I hope to pass my speaking test and study abroad.",
        ],
      },
      {
        line: "Good. What will you do to improve that skill over the next few months?",
        tr: "Bagus. Apa yang akan Anda lakukan untuk meningkatkan keterampilan itu dalam beberapa bulan ke depan?",
        hints: [
          "I will practice speaking every day and record my voice to check my progress.",
          "I plan to join an English club and speak with foreigners.",
        ],
      },
    ],
  },
  {
    slug: "rapat-tim-mingguan",
    goalTag: "kerja",
    title: "Rapat tim mingguan",
    category: "Wawancara & Kerja",
    cefrLevel: "B1 · Menengah",
    characterName: "Maya",
    characterRole: "Product Manager di Langit Studio",
    characterTrait: "Tenang · langsung ke inti · aksen US netral",
    description:
      "Kamu memberi laporan perkembangan proyek di rapat mingguan: apa yang sudah selesai, kendala yang muncul, lalu rencana minggu depan.",
    missions: [
      "Laporkan apa yang sudah selesai",
      "Jelaskan kendala dan solusinya",
      "Sepakati rencana minggu depan",
    ],
    phrases: [
      { phrase: "We have finished...", meaning: "Kami sudah menyelesaikan..." },
      { phrase: "We are facing a delay because...", meaning: "Kami mengalami keterlambatan karena..." },
      { phrase: "I will send the update by Friday.", meaning: "Saya akan kirim pembaruannya paling lambat Jumat." },
    ],
    nodes: [
      {
        line: "Good morning, everyone. Let's start with you. How is the project going this week?",
        tr: "Selamat pagi, semuanya. Mari mulai dari kamu. Bagaimana perkembangan proyek minggu ini?",
        hints: [
          "We have finished the login page and fixed several bugs.",
          "Overall it is going well. We completed the first version.",
        ],
      },
      {
        line: "That is great progress. Did the client approve the new design yet?",
        tr: "Kemajuan yang bagus. Apakah klien sudah menyetujui desain barunya?",
        hints: [
          "Yes, they approved it yesterday and they were very happy.",
          "Not yet, but they will review it on Thursday.",
        ],
      },
      {
        line: "Okay. Are there any problems that might slow the team down?",
        tr: "Baik. Apakah ada masalah yang mungkin memperlambat tim?",
        hints: [
          "Yes, the payment feature is delayed because the vendor changed the API.",
          "We had one issue with the server, but we solved it this morning.",
        ],
      },
      {
        line: "I see. What do you need from me to move forward faster?",
        tr: "Begitu. Apa yang kamu butuhkan dariku supaya bisa maju lebih cepat?",
        hints: [
          "We need approval for two more developers for three weeks.",
          "Could you check the budget? We should decide before Friday.",
        ],
      },
      {
        line: "Understood. Let's agree on the plan for next week. What are your top priorities?",
        tr: "Dimengerti. Mari sepakati rencana untuk minggu depan. Apa prioritas utamamu?",
        hints: [
          "First, we will finish the payment feature, then test everything.",
          "We will focus on testing and prepare the launch.",
        ],
      },
      {
        line: "Sounds good. Please send me a short written update by Friday so I can share it with the director.",
        tr: "Kedengarannya bagus. Tolong kirim pembaruan tertulis singkat paling lambat Jumat supaya bisa kubagikan ke direktur.",
        hints: [
          "Sure, I will send the update before Friday noon.",
          "No problem. I will include the schedule and the risks.",
        ],
      },
    ],
  },
  {
    slug: "taksi-dari-bandara",
    goalTag: "jalan",
    title: "Naik taksi dari bandara",
    category: "Jalan-jalan",
    cefrLevel: "A2 · Dasar",
    characterName: "Tom",
    characterRole: "Sopir taksi di Sydney",
    characterTrait: "Santai · suka ngobrol · aksen Australia",
    description:
      "Kamu baru mendarat di Sydney. Sebutkan tujuanmu ke sopir taksi, tanyakan ongkos dan lama perjalanan, lalu bayar dan turun.",
    missions: [
      "Sebutkan tujuan dan alamat",
      "Tanyakan ongkos dan lama perjalanan",
      "Bayar dan ucapkan terima kasih",
    ],
    phrases: [
      { phrase: "Could you take me to this address?", meaning: "Tolong antar saya ke alamat ini?" },
      { phrase: "How much will it be?", meaning: "Kira-kira berapa ongkosnya?" },
      { phrase: "Can I pay by card?", meaning: "Bisa bayar pakai kartu?" },
    ],
    nodes: [
      {
        line: "G'day! Welcome to Sydney. Where are you heading today?",
        tr: "Halo! Selamat datang di Sydney. Hari ini mau ke mana?",
        hints: [
          "Hello! Could you take me to this hotel, please?",
          "I am going to the Harbour View hotel. I have the address on my phone.",
        ],
      },
      {
        line: "No worries. Do you have any luggage for the boot?",
        tr: "Siap. Ada bagasi untuk dimasukkan ke bagasi mobil?",
        hints: [
          "Yes, I have two bags. Can you help me, please?",
          "Just one suitcase, and it is very heavy.",
        ],
      },
      {
        line: "All set. The trip to the city usually takes about thirty minutes.",
        tr: "Beres. Perjalanan ke pusat kota biasanya sekitar tiga puluh menit.",
        hints: [
          "Thirty minutes, great. How much will it be?",
          "How much is the fare to the city, please?",
        ],
      },
      {
        line: "It should be around fifty dollars, including the bridge toll. Is that okay for you?",
        tr: "Kira-kira lima puluh dolar, termasuk tol jembatan. Apakah itu tidak masalah?",
        hints: [
          "Yes, that is fine. Thank you for telling me.",
          "Is it possible to pay by card?",
        ],
      },
      {
        line: "Sure, we take cards. Here we are, Harbour View hotel. Let me get your bag.",
        tr: "Tentu, kami terima kartu. Kita sudah sampai, hotel Harbour View. Biar saya ambilkan tas Anda.",
        hints: [
          "Thank you very much. Here is my card.",
          "Great, thanks! Can I have a receipt, please?",
        ],
      },
      {
        line: "All done. Enjoy your stay in Sydney, and have a great week!",
        tr: "Selesai. Selamat menikmati Sydney, dan semoga minggumu menyenangkan!",
        hints: ["Thank you, you too! Have a nice day.", "Thanks for your help. Goodbye!"],
      },
    ],
  },
  {
    slug: "ielts-part2-tempat-favorit",
    goalTag: "ielts",
    title: "IELTS Part 2: tempat favorit",
    category: "IELTS & Akademik",
    cefrLevel: "B2 · Mahir",
    characterName: "Mr. Grant",
    characterRole: "Penguji Speaking",
    characterTrait: "Formal · tenang · tempo ujian standar",
    description:
      "Latihan IELTS Speaking Part 2 dan 3: deskripsikan tempat favoritmu dengan struktur yang jelas, lalu jawab pertanyaan lanjutan.",
    missions: [
      "Perkenalkan tempat favoritmu",
      "Ceritakan detail dan alasan kamu menyukainya",
      "Jawab pertanyaan lanjutan tentang ruang publik",
    ],
    phrases: [
      { phrase: "The place I would like to describe is...", meaning: "Tempat yang ingin saya deskripsikan adalah..." },
      { phrase: "What I love most about it is...", meaning: "Hal yang paling saya sukai darinya adalah..." },
      { phrase: "On the whole, I would say...", meaning: "Secara keseluruhan, saya akan bilang..." },
    ],
    nodes: [
      {
        line: "Now I am going to give you a topic. Describe a place you love to visit. You have one minute to prepare. Are you ready?",
        tr: "Sekarang saya akan memberi Anda sebuah topik. Deskripsikan tempat yang Anda suka kunjungi. Anda punya satu menit untuk bersiap. Sudah siap?",
        hints: [
          "Yes, I am ready. I would like to talk about my grandparents' village.",
          "Yes, I have noted some ideas about a quiet beach in Lombok.",
        ],
      },
      {
        line: "Please begin. Where is it, and how often do you go there?",
        tr: "Silakan mulai. Di mana tempat itu, dan seberapa sering Anda ke sana?",
        hints: [
          "It is a quiet village in the mountains, and I visit it every holiday.",
          "It is located near Bandung, and I have been there at least five times.",
        ],
      },
      {
        line: "Thank you. Can you tell me what you usually do there and why it is special to you?",
        tr: "Terima kasih. Bisa ceritakan apa yang biasanya Anda lakukan di sana dan mengapa tempat itu istimewa bagi Anda?",
        hints: [
          "I usually walk through the rice fields and have fresh coffee with my family.",
          "What I love most is the peaceful atmosphere and the friendly people.",
        ],
      },
      {
        line: "And would you recommend this place to a foreign tourist? Why?",
        tr: "Dan apakah Anda akan merekomendasikan tempat ini kepada turis asing? Mengapa?",
        hints: [
          "Definitely, because it is peaceful and the food is very good.",
          "Yes, I would recommend it because visitors can experience local culture.",
        ],
      },
      {
        line: "Let's move on to some general questions. Why do you think people need quiet places in big cities?",
        tr: "Mari lanjut ke beberapa pertanyaan umum. Menurut Anda, mengapa orang membutuhkan tempat yang tenang di kota besar?",
        hints: [
          "I think busy people need a place where they can relax and recover from stress.",
          "Because city life is very noisy, green spaces improve our mental health.",
        ],
      },
      {
        line: "How should governments protect natural places like parks and forests?",
        tr: "Bagaimana seharusnya pemerintah melindungi tempat alami seperti taman dan hutan?",
        hints: [
          "They should limit the number of visitors and invest in conservation.",
          "Governments should provide strict rules and educate people about the environment.",
        ],
      },
    ],
  },
  {
    slug: "kenalan-teman-baru",
    goalTag: "harian",
    title: "Kenalan dengan teman baru",
    category: "Sehari-hari",
    cefrLevel: "A2 · Dasar",
    characterName: "Emma",
    characterRole: "Anggota English Club kampus",
    characterTrait: "Ceria · ramah · bicara pelan dan jelas",
    description:
      "Kamu bertemu teman baru di English Club kampus. Perkenalkan dirimu, ceritakan hobi dan kesibukanmu, lalu tukar kontak.",
    missions: [
      "Perkenalkan nama dan asalmu",
      "Ceritakan hobi dan kegiatanmu",
      "Ajak bertemu lagi dan tukar kontak",
    ],
    phrases: [
      { phrase: "Nice to meet you.", meaning: "Senang berkenalan denganmu." },
      { phrase: "In my free time, I...", meaning: "Di waktu luang, saya..." },
      { phrase: "Let's keep in touch.", meaning: "Ayo tetap berkomunikasi." },
    ],
    nodes: [
      {
        line: "Hi! I don't think we've met. I'm Emma. What's your name?",
        tr: "Hai! Sepertinya kita belum pernah bertemu. Aku Emma. Siapa namamu?",
        hints: [
          "Hi Emma, my name is Vina. Very nice to meet you.",
          "Hello, I am Rafi. Nice to meet you!",
        ],
      },
      {
        line: "Nice to meet you too! Where are you from?",
        tr: "Senang bertemu denganmu juga! Kamu berasal dari mana?",
        hints: [
          "I am from Surabaya, but I have lived in Jakarta for three years.",
          "I come from Bandung, and I study here at the university.",
        ],
      },
      {
        line: "Cool! What do you like to do in your free time?",
        tr: "Keren! Apa yang suka kamu lakukan di waktu luang?",
        hints: [
          "I love watching movies and playing badminton with my friends.",
          "I usually listen to music and visit new cafes on weekends.",
        ],
      },
      {
        line: "That sounds fun! How often do you come to the English club?",
        tr: "Kedengarannya seru! Seberapa sering kamu datang ke English club?",
        hints: [
          "This is my first time, but I think it is very useful.",
          "I come every Wednesday, and I always learn something new.",
        ],
      },
      {
        line: "I'm glad you came. Would you like to practice together after class sometime?",
        tr: "Aku senang kamu datang. Mau latihan bareng setelah kelas kapan-kapan?",
        hints: [
          "Yes, that would be great! I am free on Thursday.",
          "Sure, I would love that. Should we meet at the library?",
        ],
      },
      {
        line: "Perfect! Let's exchange numbers so we can keep in touch.",
        tr: "Pas sekali! Ayo tukar nomor supaya kita bisa tetap berkomunikasi.",
        hints: [
          "Sure! Can you give me your number? Thank you.",
          "Of course. I will send you a message this evening.",
        ],
      },
    ],
  },
];

export async function seedUcapinDatabase(prisma: PrismaClient) {
  // Dibaca sebelum menghapus data, agar env yang kosong tidak meninggalkan database kosong.
  const credentials = readTestAccountCredentials();
  const testPasswordHash = await hashPassword(credentials.password);

  await prisma.phonemeScore.deleteMany();
  await prisma.utterance.deleteMany();
  await prisma.speakingSession.deleteMany();
  await prisma.mistakeItem.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.scenarioNode.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.drillSentence.deleteMany();
  await prisma.phonemeGuide.deleteMany();
  await prisma.leagueEntry.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed 5 Core Indonesian Phoneme Guides (Curriculum Reference Data)
  await prisma.phonemeGuide.createMany({
    data: [
      {
        phoneme: "/v/",
        errorPattern: "v → f",
        title: "Konsonan frikatif labiodental bersuara (/v/)",
        description:
          "Bahasa Indonesia tidak memiliki fonem /v/ bersuara, sehingga huruf v sering diucapkan seperti /f/ tanpa getaran pita suara.",
        articulationStepsJson: JSON.stringify([
          "Sentuhkan ujung gigi atas ke bibir bawah secara ringan.",
          "Hembuskan udara sambil menggetarkan pita suara di tenggorokan.",
          "Rasakan getaran halus di bibir bawah. Jika tidak bergetar, bunyinya masih /f/.",
        ]),
        minimalPairsJson: JSON.stringify([
          "very",
          "fairy",
          "van",
          "fan",
          "vest",
          "fest",
          "save",
          "safe",
        ]),
      },
      {
        phoneme: "/θ/",
        errorPattern: "th → t",
        title: "Konsonan frikatif dental nirsuara (/θ/)",
        description:
          "Bunyi th nirsuara pada kata think atau thank sering berubah menjadi letupan /t/ karena ujung lidah tertahan di belakang gigi.",
        articulationStepsJson: JSON.stringify([
          "Letakkan ujung lidah ringan di antara tepi gigi atas dan gigi bawah.",
          "Tiupkan udara keluar melalui celah gigi tanpa menekan lidah terlalu rapat.",
          "Tarik lidah masuk saat menyambung ke vokal berikutnya.",
        ]),
        minimalPairsJson: JSON.stringify([
          "think",
          "tink",
          "thank",
          "tank",
          "three",
          "tree",
          "both",
          "boat",
        ]),
      },
      {
        phoneme: "/ð/",
        errorPattern: "ð → d",
        title: "Konsonan frikatif dental bersuara (/ð/)",
        description:
          "Bunyi th bersuara pada kata this, that, atau weather sering diganti menjadi /d/.",
        articulationStepsJson: JSON.stringify([
          "Sentuhkan ujung lidah ke tepi bawah gigi seri atas.",
          "Alirkan udara keluar sambil menyalakan getaran pita suara.",
          "Jangan menutup aliran udara sepenuhnya seperti saat mengucapkan /d/.",
        ]),
        minimalPairsJson: JSON.stringify([
          "this",
          "dis",
          "they",
          "day",
          "then",
          "den",
          "breathe",
          "breed",
        ]),
      },
      {
        phoneme: "/ʃ/",
        errorPattern: "sh → s",
        title: "Konsonan frikatif postalveolar (/ʃ/)",
        description:
          "Bunyi sh pada kata shop, finish, atau station sering terdengar datar seperti /s/ biasa.",
        articulationStepsJson: JSON.stringify([
          "Tarik ujung lidah sedikit ke belakang langit-langit mulut bagian depan.",
          "Bulatkan bibir sedikit ke depan.",
          "Desiskan udara yang lebih tebal dibanding bunyi /s/.",
        ]),
        minimalPairsJson: JSON.stringify([
          "shop",
          "sop",
          "she",
          "see",
          "wash",
          "was",
          "cash",
          "case",
        ]),
      },
      {
        phoneme: "/-ed/",
        errorPattern: "-ed / -d akhir",
        title: "Kluster konsonan akhir (-ed, -d, -t, -s)",
        description:
          "Penutur Indonesia cenderung menghilangkan stop akhir (/t/, /d/, /k/) yang juga menandai bentuk lampau (past tense).",
        articulationStepsJson: JSON.stringify([
          "Jangan berhenti di huruf sebelum konsonan terakhir.",
          "Sentuhkan ujung lidah ke langit-langit tepat di belakang gigi atas untuk menutup bunyi /t/ atau /d/.",
          "Beri letupan udara tipis di akhir kata sebelum masuk ke kata berikutnya.",
        ]),
        minimalPairsJson: JSON.stringify([
          "worked",
          "work",
          "closed",
          "close",
          "card",
          "car",
          "asked",
          "ask",
        ]),
      },
    ],
  });

  // 2. Seed Account 1: Truly Fresh User from Zero (Budi Santoso - 0 progress, 0 goals preselected)
  const budi = await prisma.user.create({
    data: {
      id: TEST_ACCOUNT_IDS.fresh,
      email: credentials.freshEmail,
      passwordHash: testPasswordHash,
      name: "Budi Santoso",
      initials: "BS",
      roleLabel: "Pelajar Baru",
      cefrLevel: "A2",
      cefrProgressLabel: "Belum ada sesi",
      cefrProgressPct: 0,
      goals: [],
      dailyTargetMinutes: 10,
      spokenTodayMinutes: 0,
      totalSpokenMinutes: 0,
      clarityAvg: 0,
      streakDays: 0,
      streakFreezes: 2,
      correctionPref: "giliran",
      saveAudioOptIn: false,
      onboardingCompleted: false,
      micChecked: false,
      activeScenarioSlug: "wawancara-startup",
    },
  });

  await prisma.dailyActivity.createMany({
    data: [
      { userId: budi.id, dayOrder: 1, dayLabel: "Sen", minutesSpoken: 0, isToday: false },
      { userId: budi.id, dayOrder: 2, dayLabel: "Sel", minutesSpoken: 0, isToday: false },
      { userId: budi.id, dayOrder: 3, dayLabel: "Rab", minutesSpoken: 0, isToday: false },
      { userId: budi.id, dayOrder: 4, dayLabel: "Kam", minutesSpoken: 0, isToday: false },
      { userId: budi.id, dayOrder: 5, dayLabel: "Jum", minutesSpoken: 0, isToday: true },
      { userId: budi.id, dayOrder: 6, dayLabel: "Sab", minutesSpoken: 0, isToday: false },
      { userId: budi.id, dayOrder: 7, dayLabel: "Min", minutesSpoken: 0, isToday: false },
    ],
  });

  // 3. Seed Account 2: Experienced Learner (Alya Putri - B1, has completed sessions & mistakes)
  const alya = await prisma.user.create({
    data: {
      id: TEST_ACCOUNT_IDS.active,
      email: credentials.activeEmail,
      passwordHash: testPasswordHash,
      name: "Alya Putri",
      initials: "AL",
      roleLabel: "Product Designer · B1",
      cefrLevel: "B1",
      cefrProgressLabel: "B1 menuju B2",
      cefrProgressPct: 65,
      goals: ["kerja", "harian"],
      dailyTargetMinutes: 15,
      spokenTodayMinutes: 9,
      totalSpokenMinutes: 49,
      clarityAvg: 82,
      streakDays: 5,
      streakFreezes: 2,
      correctionPref: "giliran",
      saveAudioOptIn: false,
      onboardingCompleted: true,
      micChecked: true,
      activeScenarioSlug: "memesan-di-kafe",
    },
  });

  await prisma.dailyActivity.createMany({
    data: [
      { userId: alya.id, dayOrder: 1, dayLabel: "Sen", minutesSpoken: 8, isToday: false },
      { userId: alya.id, dayOrder: 2, dayLabel: "Sel", minutesSpoken: 12, isToday: false },
      { userId: alya.id, dayOrder: 3, dayLabel: "Rab", minutesSpoken: 6, isToday: false },
      { userId: alya.id, dayOrder: 4, dayLabel: "Kam", minutesSpoken: 14, isToday: false },
      { userId: alya.id, dayOrder: 5, dayLabel: "Jum", minutesSpoken: 9, isToday: true },
      { userId: alya.id, dayOrder: 6, dayLabel: "Sab", minutesSpoken: 0, isToday: false },
      { userId: alya.id, dayOrder: 7, dayLabel: "Min", minutesSpoken: 0, isToday: false },
    ],
  });

  await prisma.mistakeItem.createMany({
    data: [
      {
        userId: alya.id,
        word: "very",
        ipa: "/ˈvɛri/",
        phoneme: "/v/",
        errorPattern: "v → f",
        heardAs: "terdengar “fery”",
        sourceMode: "Roleplay: Memesan di kafe",
        occurrenceCount: 3,
        status: "work",
        scheduleLabel: "hari ini",
      },
      {
        userId: alya.id,
        word: "think",
        ipa: "/θɪŋk/",
        phoneme: "/θ/",
        errorPattern: "th → t",
        heardAs: "terdengar “tink”",
        sourceMode: "Roleplay: Wawancara kerja di startup",
        occurrenceCount: 2,
        status: "work",
        scheduleLabel: "hari ini",
      },
      {
        userId: alya.id,
        word: "worked",
        ipa: "/wɜrkt/",
        phoneme: "/t/",
        errorPattern: "-ed akhir",
        heardAs: "bunyi /t/ akhir hilang",
        sourceMode: "Latihan: Wawancara & karier",
        occurrenceCount: 1,
        status: "almost",
        scheduleLabel: "besok",
      },
    ],
  });

  // 4. Seed 60 Drill Sentences (4 learning goals x 3 CEFR levels x 5 sentences)
  await prisma.drillSentence.createMany({ data: DRILL_SENTENCES });

  // 5. Seed 8 Roleplay Scenarios (2 per learning goal, 6 turns each)
  for (const scenario of SCENARIO_SEEDS) {
    const created = await prisma.scenario.create({
      data: {
        slug: scenario.slug,
        goalTag: scenario.goalTag,
        title: scenario.title,
        category: scenario.category,
        cefrLevel: scenario.cefrLevel,
        characterName: scenario.characterName,
        characterRole: scenario.characterRole,
        characterTrait: scenario.characterTrait,
        description: scenario.description,
        missionsJson: JSON.stringify(scenario.missions),
        usefulPhrasesJson: JSON.stringify(scenario.phrases),
      },
    });

    await prisma.scenarioNode.createMany({
      data: scenario.nodes.map((node, stepIndex) => ({
        scenarioId: created.id,
        stepIndex,
        speaker: scenario.characterName,
        speakerLine: node.line,
        translation: node.tr,
        hintsJson: JSON.stringify(node.hints),
        targetMission: Math.floor(stepIndex / 2) + 1,
        sampleCorrectionJson: node.fix ? JSON.stringify(node.fix) : null,
      })),
    });
  }

  // 6. Seed 1 historical session ONLY for Alya (Budi has 0 sessions!)
  await prisma.speakingSession.create({
    data: {
      id: "session-cafe-sample",
      userId: alya.id,
      mode: "roleplay",
      scenarioTitle: "Memesan di kafe",
      durationSec: 272,
      clarityScore: 82,
      pronunciationScore: 80,
      fluencyScore: 85,
      grammarScore: 78,
      vocabularyScore: 88,
      wpm: 118,
      confidenceRating: 4,
      utterances: {
        create: [
          {
            referenceText: "Could I get an iced latte, medium, please?",
            transcript: "I want a ice latte, medium size.",
            betterVersion: "Could I get an iced latte, medium, please?",
            status: "almost",
            note: "Pemakaian a -> an dan ice -> iced",
            clarityScore: 78,
          },
          {
            referenceText: "Yes, one croissant, please.",
            transcript: "Yes, one croissant, please.",
            betterVersion: null,
            status: "ok",
            note: "Sudah natural, tidak perlu diubah",
            clarityScore: 92,
          },
          {
            referenceText: "I will pay by card. Thank you!",
            transcript: "I will pay with car. Tank you!",
            betterVersion: "I will pay by card. Thank you!",
            status: "work",
            note: "Konsonan akhir /d/ di card dan bunyi /θ/ di Thank",
            clarityScore: 74,
          },
        ],
      },
    },
  });
}
