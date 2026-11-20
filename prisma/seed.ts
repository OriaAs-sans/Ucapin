import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.phonemeScore.deleteMany();
  await prisma.utterance.deleteMany();
  await prisma.speakingSession.deleteMany();
  await prisma.mistakeItem.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.scenarioNode.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.drillSentence.deleteMany();
  await prisma.leagueEntry.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      id: "learner-alya",
      name: "Alya Putri",
      initials: "AL",
      cefrLevel: "B1",
      cefrProgressLabel: "A2+ menuju B1",
      cefrProgressPct: 70,
      goals: ["kerja", "harian"],
      dailyTargetMinutes: 15,
      spokenTodayMinutes: 9,
      totalSpokenMinutes: 186,
      clarityAvg: 82,
      streakDays: 12,
      streakFreezes: 2,
      correctionPref: "giliran",
      saveAudioOptIn: false,
    },
  });

  await prisma.dailyActivity.createMany({
    data: [
      { userId: user.id, dayOrder: 1, dayLabel: "Sen", minutesSpoken: 8, isToday: false },
      { userId: user.id, dayOrder: 2, dayLabel: "Sel", minutesSpoken: 12, isToday: false },
      { userId: user.id, dayOrder: 3, dayLabel: "Rab", minutesSpoken: 6, isToday: false },
      { userId: user.id, dayOrder: 4, dayLabel: "Kam", minutesSpoken: 15, isToday: false },
      { userId: user.id, dayOrder: 5, dayLabel: "Jum", minutesSpoken: 9, isToday: true },
      { userId: user.id, dayOrder: 6, dayLabel: "Sab", minutesSpoken: 0, isToday: false },
      { userId: user.id, dayOrder: 7, dayLabel: "Min", minutesSpoken: 0, isToday: false },
    ],
  });

  await prisma.leagueEntry.createMany({
    data: [
      { rank: 1, name: "Raka", initials: "RK", minutesSpoken: 148, isCurrentUser: false },
      { rank: 2, name: "Alya (kamu)", initials: "AL", minutesSpoken: 131, isCurrentUser: true },
      { rank: 3, name: "Nadia", initials: "ND", minutesSpoken: 117, isCurrentUser: false },
    ],
  });

  await prisma.mistakeItem.createMany({
    data: [
      {
        userId: user.id,
        word: "very",
        ipa: "/ˈvɛri/",
        phoneme: "/v/",
        errorPattern: "v → f",
        heardAs: "terdengar “fery”",
        sourceMode: "Roleplay kafe",
        occurrenceCount: 4,
        status: "work",
        scheduleLabel: "hari ini",
      },
      {
        userId: user.id,
        word: "think",
        ipa: "/θɪŋk/",
        phoneme: "/θ/",
        errorPattern: "th → t",
        heardAs: "terdengar “tink”",
        sourceMode: "Roleplay kafe",
        occurrenceCount: 3,
        status: "work",
        scheduleLabel: "hari ini",
      },
      {
        userId: user.id,
        word: "worked",
        ipa: "/wɜrkt/",
        phoneme: "/t/",
        errorPattern: "-ed",
        heardAs: "bunyi /t/ akhir hilang",
        sourceMode: "Latihan Ucapan",
        occurrenceCount: 2,
        status: "almost",
        scheduleLabel: "besok",
      },
      {
        userId: user.id,
        word: "card",
        ipa: "/kɑrd/",
        phoneme: "/d/",
        errorPattern: "-d akhir",
        heardAs: "terdengar “car”",
        sourceMode: "Roleplay kafe",
        occurrenceCount: 1,
        status: "almost",
        scheduleLabel: "hari ini",
      },
      {
        userId: user.id,
        word: "thank",
        ipa: "/θæŋk/",
        phoneme: "/θ/",
        errorPattern: "th → t",
        heardAs: "terdengar “tank”",
        sourceMode: "Roleplay kafe",
        occurrenceCount: 2,
        status: "work",
        scheduleLabel: "hari ini",
      },
    ],
  });

  await prisma.drillSentence.createMany({
    data: [
      {
        category: "Obrolan ringan",
        focusPhonemes: "/v/ dan /ð/",
        text: "I have a very good feeling about this weather.",
        ipa: "/aɪ hæv ə ˈvɛri ɡʊd ˈfiːlɪŋ əˈbaʊt ðɪs ˈwɛðər/",
        translation: "Aku punya firasat yang sangat bagus soal cuaca ini.",
        orderIndex: 1,
        targetMarksJson: JSON.stringify({
          very: { status: "work", note: "/v/ jadi /f/", ipa: "/ˈvɛri/" },
          this: { status: "almost", note: "/ð/ jadi /d/", ipa: "/ðɪs/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 84, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 78, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 88, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "very",
        coachIpa: "/ˈvɛri/",
        coachNote: "Bunyi /v/-mu terdengar seperti /f/, jadi “fery”. Wajar, karena bahasa Indonesia tidak punya bunyi /v/.",
        coachStepsJson: JSON.stringify([
          "Gigi atas menyentuh bibir bawah dengan ringan.",
          "Hembuskan udara sambil menyalakan pita suara.",
          "Rasakan getaran di bibir bawah. Kalau tidak bergetar, itu masih /f/.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/v/", score: 38, status: "work" },
          { phoneme: "/ɛ/", score: 91, status: "ok" },
          { phoneme: "/r/", score: 74, status: "almost" },
          { phoneme: "/i/", score: 95, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["very", "fairy", "van", "fan", "vest", "fest"]),
      },
      {
        category: "Obrolan ringan",
        focusPhonemes: "/θ/, /ʃ/, dan konsonan akhir",
        text: "Thank you for waiting, the shop is closed now.",
        ipa: "/θæŋk ju fɔr ˈweɪtɪŋ ðə ʃɑp ɪz kloʊzd naʊ/",
        translation: "Terima kasih sudah menunggu, tokonya sudah tutup sekarang.",
        orderIndex: 2,
        targetMarksJson: JSON.stringify({
          Thank: { status: "work", note: "/θ/ jadi /t/", ipa: "/θæŋk/" },
          shop: { status: "almost", note: "/ʃ/ jadi /s/", ipa: "/ʃɑp/" },
          closed: { status: "almost", note: "/d/ akhir hilang", ipa: "/kloʊzd/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 79, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 71, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 85, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "Thank",
        coachIpa: "/θæŋk/",
        coachNote: "Bunyi /θ/ di awal kata “Thank” terdengar seperti /t/ (“Tank”). Ujung lidah perlu menyentuh tepi gigi atas.",
        coachStepsJson: JSON.stringify([
          "Letakkan ujung lidah ringan di antara gigi atas dan gigi bawah.",
          "Tiupkan udara keluar melalui celah gigi tanpa menekan lidah terlalu keras.",
          "Tarik lidah ke dalam saat masuk ke vokal /æ/.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/θ/", score: 42, status: "work" },
          { phoneme: "/æ/", score: 89, status: "ok" },
          { phoneme: "/ŋ/", score: 84, status: "ok" },
          { phoneme: "/k/", score: 92, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["thank", "tank", "think", "tink", "three", "tree"]),
      },
    ],
  });

  const cafeScenario = await prisma.scenario.create({
    data: {
      slug: "memesan-di-kafe",
      title: "Memesan di kafe",
      category: "Sehari-hari",
      cefrLevel: "A2 · Dasar",
      characterName: "Sam",
      characterRole: "Barista di Bean Corner",
      characterTrait: "Ramah · bicara pelan · aksen US",
      description: "Kamu pelanggan di kafe yang ramai. Pesan minuman, tambah camilan, lalu bayar.",
      missionsJson: JSON.stringify([
        "Pesan satu minuman",
        "Tambah makanan",
        "Bayar dan pamit",
      ]),
      usefulPhrasesJson: JSON.stringify([
        { phrase: "to go", meaning: "dibawa pulang" },
        { phrase: "for here", meaning: "makan di sini" },
        { phrase: "Can I pay by card?", meaning: "Bisa bayar pakai kartu?" },
      ]),
    },
  });

  await prisma.scenarioNode.createMany({
    data: [
      {
        scenarioId: cafeScenario.id,
        stepIndex: 0,
        speaker: "Sam",
        speakerLine: "Sure! Anything to eat with that? Our croissants just came out of the oven.",
        translation: "Tentu! Mau makan sesuatu juga? Croissant kami baru keluar dari oven.",
        hintsJson: JSON.stringify([
          "Yes, one croissant, please.",
          "No thanks, just the latte.",
          "What do you recommend?",
        ]),
        targetMission: 2,
        sampleCorrectionJson: null,
      },
      {
        scenarioId: cafeScenario.id,
        stepIndex: 1,
        speaker: "Sam",
        speakerLine: "Great choice. That'll be seven fifty. Card or cash?",
        translation: "Pilihan bagus. Totalnya tujuh lima puluh. Kartu atau tunai?",
        hintsJson: JSON.stringify([
          "By card, please.",
          "Can I pay with cash?",
          "Do you take QRIS?",
        ]),
        targetMission: 2,
        sampleCorrectionJson: JSON.stringify({
          word: "card",
          ipa: "/kɑrd/",
          phoneme: "/d/",
          errorPattern: "-d akhir",
          status: "almost",
          promptText: "Hampir. Coba ucapkan lagi kata card.",
          detailText: "Bunyi /d/ di akhir kata belum terdengar jelas. Kata ini masuk Bank Kesalahan.",
        }),
      },
      {
        scenarioId: cafeScenario.id,
        stepIndex: 2,
        speaker: "Sam",
        speakerLine: "All done. Have a lovely day!",
        translation: "Sudah. Semoga harimu menyenangkan!",
        hintsJson: JSON.stringify([
          "Thank you, you too!",
          "Thanks, bye!",
        ]),
        targetMission: 3,
        sampleCorrectionJson: null,
      },
    ],
  });

  await prisma.speakingSession.create({
    data: {
      id: "session-cafe-sample",
      userId: user.id,
      mode: "roleplay",
      scenarioTitle: "Memesan di kafe",
      durationSec: 272,
      clarityScore: 84,
      pronunciationScore: 82,
      fluencyScore: 86,
      grammarScore: 78,
      vocabularyScore: 90,
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
            referenceText: "I'll pay by card. Thank you!",
            transcript: "I will pay with car. Tank you!",
            betterVersion: "I'll pay by card. Thank you!",
            status: "work",
            note: "Konsonan akhir /d/ di card dan bunyi /θ/ di Thank",
            clarityScore: 74,
          },
        ],
      },
    },
  });

  console.log("Database Ucapin di Laragon PostgreSQL berhasil di-seed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
