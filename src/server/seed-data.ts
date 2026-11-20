import type { PrismaClient } from "@prisma/client";

export async function seedUcapinDatabase(prisma: PrismaClient) {
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
      id: "learner-baru",
      email: "baru@ucapin.id",
      password: "ucapin123",
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
      id: "learner-alya",
      email: "alya@ucapin.id",
      password: "ucapin123",
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

  // 4. Seed Complete Drill Sentences for All 4 Learning Goals (12 sentences total)
  await prisma.drillSentence.createMany({
    data: [
      // --- GOAL: KERJA (Job interview & workplace) ---
      {
        goalTag: "kerja",
        cefrLevel: "B1",
        category: "Wawancara & karier",
        focusPhonemes: "-ed akhir dan /v/",
        text: "I worked on five product launches and solved the main issue.",
        ipa: "/aɪ wɜrkt ɑn faɪv ˈprɑdʌkt ˈlɔntʃɪz ænd sɑlvd ðə meɪn ˈɪʃuː/",
        translation: "Saya mengerjakan lima peluncuran produk dan menyelesaikan masalah utamanya.",
        orderIndex: 1,
        targetMarksJson: JSON.stringify({
          worked: { status: "work", note: "/t/ akhir hilang", ipa: "/wɜrkt/" },
          five: { status: "almost", note: "/v/ akhir jadi /f/", ipa: "/faɪv/" },
          solved: { status: "almost", note: "/vd/ akhir kurang jelas", ipa: "/sɑlvd/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 81, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 74, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 87, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "worked",
        coachIpa: "/wɜrkt/",
        coachNote:
          "Akhiran -ed setelah bunyi /k/ diucapkan sebagai /t/ singkat (/wɜrkt/). Jika /t/ hilang, pendengar mengira kamu memakai present tense “work”.",
        coachStepsJson: JSON.stringify([
          "Ucapkan “work” dengan penutup /k/ yang jelas.",
          "Langsung sentuhkan ujung lidah ke belakang gigi atas untuk bunyi /t/ tanpa menambah vokal “e”.",
          "Jangan diucapkan “wor-ked” dua suku kata, cukup satu suku kata /wɜrkt/.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/w/", score: 94, status: "ok" },
          { phoneme: "/ɜr/", score: 88, status: "ok" },
          { phoneme: "/k/", score: 82, status: "ok" },
          { phoneme: "/t/", score: 39, status: "work" },
        ]),
        minimalPairsJson: JSON.stringify(["worked", "work", "walked", "walk", "talked", "talk"]),
      },
      {
        goalTag: "kerja",
        cefrLevel: "B1",
        category: "Rapat tim",
        focusPhonemes: "/θ/ dan /v/",
        text: "I think we remain available to review the monthly report today.",
        ipa: "/aɪ θɪŋk wi rɪˈmeɪn əˈveɪləbəl tu rɪˈvjuː ðə ˈmʌnθli rɪˈpɔrt təˈdeɪ/",
        translation: "Saya rasa kami tetap siap untuk meninjau laporan bulanan hari ini.",
        orderIndex: 2,
        targetMarksJson: JSON.stringify({
          think: { status: "work", note: "/θ/ jadi /t/", ipa: "/θɪŋk/" },
          available: { status: "almost", note: "/v/ jadi /f/", ipa: "/əˈveɪləbəl/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 85, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 79, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 89, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "think",
        coachIpa: "/θɪŋk/",
        coachNote:
          "Dalam rapat kerja, “I think” adalah frasa paling sering dipakai. Pastikan ujung lidah sedikit keluar di antara gigi agar tidak terdengar “I tink”.",
        coachStepsJson: JSON.stringify([
          "Sentuhkan ujung lidah ke tepi bawah gigi seri atas.",
          "Hembuskan udara halus selama setengah detik sebelum menyebut “ink”.",
          "Tutup dengan bunyi sengau /ŋk/ yang tegas.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/θ/", score: 40, status: "work" },
          { phoneme: "/ɪ/", score: 92, status: "ok" },
          { phoneme: "/ŋ/", score: 86, status: "ok" },
          { phoneme: "/k/", score: 90, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["think", "tink", "sink", "thank", "tank"]),
      },
      {
        goalTag: "kerja",
        cefrLevel: "B2",
        category: "Presentasi produk",
        focusPhonemes: "/ʃ/ dan /v/",
        text: "This version should improve our customer retention this quarter.",
        ipa: "/ðɪs ˈvɜrʒən ʃʊd ɪmˈpruːv ˈaʊər ˈkʌstəmər rɪˈtɛnʃən ðɪs ˈkwɔrtər/",
        translation: "Versi ini seharusnya meningkatkan retensi pelanggan kita kuartal ini.",
        orderIndex: 3,
        targetMarksJson: JSON.stringify({
          version: { status: "work", note: "/v/ jadi /f/", ipa: "/ˈvɜrʒən/" },
          should: { status: "almost", note: "/ʃ/ jadi /s/", ipa: "/ʃʊd/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 83, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 77, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 86, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "version",
        coachIpa: "/ˈvɜrʒən/",
        coachNote:
          "Kata “version” menggabungkan dua bunyi penting: /v/ di awal dan /ʒ/ di tengah. Mulailah dengan getaran bibir bawah.",
        coachStepsJson: JSON.stringify([
          "Gigi atas menyentuh bibir bawah sambil menyalakan getaran /v/.",
          "Masuk ke vokal /ɜr/ lalu desiskan bagian tengah dengan suara bergetar.",
          "Akhiri dengan /ən/ ringan.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/v/", score: 44, status: "work" },
          { phoneme: "/ɜr/", score: 85, status: "ok" },
          { phoneme: "/ʒ/", score: 72, status: "almost" },
          { phoneme: "/ən/", score: 91, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["version", "very", "fairy", "should", "suit"]),
      },

      // --- GOAL: JALAN (Travel, hotel, airport) ---
      {
        goalTag: "jalan",
        cefrLevel: "A2",
        category: "Bandara & transportasi",
        focusPhonemes: "/ʃ/ dan /ð/",
        text: "Excuse me, where is the shuttle bus to the central station?",
        ipa: "/ɪkˈskjuːz mi wɛr ɪz ðə ˈʃʌtəl bʌs tu ðə ˈsɛntrəl ˈsteɪʃən/",
        translation: "Permisi, di mana bus antar-jemput menuju stasiun pusat?",
        orderIndex: 4,
        targetMarksJson: JSON.stringify({
          shuttle: { status: "work", note: "/ʃ/ jadi /s/", ipa: "/ˈʃʌtəl/" },
          the: { status: "almost", note: "/ð/ jadi /d/", ipa: "/ðə/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 83, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 76, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 88, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "shuttle",
        coachIpa: "/ˈʃʌtəl/",
        coachNote:
          "Bunyi awal “sh” pada “shuttle” perlu bibir yang sedikit membulat ke depan agar tidak terdengar seperti “sattel”.",
        coachStepsJson: JSON.stringify([
          "Majukan bibir sedikit seperti saat meminta orang diam (shh).",
          "Tarik ujung lidah sedikit ke belakang langit-langit depan.",
          "Sambungkan dengan vokal /ʌ/ singkat.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/ʃ/", score: 43, status: "work" },
          { phoneme: "/ʌ/", score: 90, status: "ok" },
          { phoneme: "/t/", score: 88, status: "ok" },
          { phoneme: "/əl/", score: 89, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["shuttle", "subtle", "shop", "sop", "ship", "sip"]),
      },
      {
        goalTag: "jalan",
        cefrLevel: "A2",
        category: "Check-in hotel",
        focusPhonemes: "/v/ dan -d akhir",
        text: "I have a reservation for two nights, and I will pay by card.",
        ipa: "/aɪ hæv ə ˌrɛzərˈveɪʃən fɔr tu naɪts ænd aɪ wɪl peɪ baɪ kɑrd/",
        translation: "Saya punya reservasi untuk dua malam, dan saya akan membayar dengan kartu.",
        orderIndex: 5,
        targetMarksJson: JSON.stringify({
          reservation: { status: "almost", note: "/v/ jadi /f/", ipa: "/ˌrɛzərˈveɪʃən/" },
          card: { status: "work", note: "/d/ akhir hilang", ipa: "/kɑrd/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 80, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 75, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 85, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "card",
        coachIpa: "/kɑrd/",
        coachNote:
          "Jika konsonan /d/ di akhir “card” tidak diucapkan, kata ini terdengar persis seperti “car” (mobil).",
        coachStepsJson: JSON.stringify([
          "Ucapkan “car” dengan lidah sedikit melengkung untuk bunyi /r/.",
          "Tutup kalimat dengan menyentuhkan ujung lidah ke langit-langit depan untuk bunyi /d/.",
          "Pastikan suara /d/ terdengar sebelum mulut menutup.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/k/", score: 93, status: "ok" },
          { phoneme: "/ɑ/", score: 91, status: "ok" },
          { phoneme: "/r/", score: 82, status: "ok" },
          { phoneme: "/d/", score: 37, status: "work" },
        ]),
        minimalPairsJson: JSON.stringify(["card", "car", "hard", "heart", "bed", "bet"]),
      },
      {
        goalTag: "jalan",
        cefrLevel: "B1",
        category: "Tanya arah kota",
        focusPhonemes: "/θ/ dan /ð/",
        text: "Walk through the third gate and wait there near the theater.",
        ipa: "/wɔk θruː ðə θɜrd ɡeɪt ænd weɪt ðɛr nɪr ðə ˈθiːətər/",
        translation: "Jalan melewati gerbang ketiga dan tunggu di sana dekat teater.",
        orderIndex: 6,
        targetMarksJson: JSON.stringify({
          through: { status: "work", note: "/θ/ jadi /t/", ipa: "/θruː/" },
          third: { status: "work", note: "/θ/ jadi /t/", ipa: "/θɜrd/" },
          there: { status: "almost", note: "/ð/ jadi /d/", ipa: "/ðɛr/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 78, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 70, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 82, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "third",
        coachIpa: "/θɜrd/",
        coachNote:
          "Kata “third” dimulai dengan /θ/ nirsuara dan ditutup dengan /d/ bersuara. Jangan diucapkan “tird”.",
        coachStepsJson: JSON.stringify([
          "Mulai dengan ujung lidah di antara gigi sambil meniupkan udara /θ/.",
          "Tarik lidah ke tengah untuk bunyi /ɜr/.",
          "Sentuhkan ujung lidah ke langit-langit atas untuk menutup dengan /d/.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/θ/", score: 41, status: "work" },
          { phoneme: "/ɜr/", score: 85, status: "ok" },
          { phoneme: "/d/", score: 76, status: "almost" },
        ]),
        minimalPairsJson: JSON.stringify(["third", "three", "tree", "through", "true"]),
      },

      // --- GOAL: IELTS (Academic speaking & exam) ---
      {
        goalTag: "ielts",
        cefrLevel: "B1",
        category: "IELTS Speaking Part 1",
        focusPhonemes: "/θ/ dan /v/",
        text: "Both methods help university students develop critical thinking.",
        ipa: "/boʊθ ˈmɛθədz hɛlp ˌjuːnɪˈvɜrsɪti ˈstuːdənts dɪˈvɛləp ˈkrɪtɪkəl ˈθɪŋkɪŋ/",
        translation: "Kedua metode tersebut membantu mahasiswa mengembangkan pemikiran kritis.",
        orderIndex: 7,
        targetMarksJson: JSON.stringify({
          Both: { status: "work", note: "/θ/ akhir jadi /t/", ipa: "/boʊθ/" },
          methods: { status: "almost", note: "/θ/ tengah jadi /t/", ipa: "/ˈmɛθədz/" },
          thinking: { status: "work", note: "/θ/ awal jadi /t/", ipa: "/ˈθɪŋkɪŋ/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 82, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 75, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 86, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "Both",
        coachIpa: "/boʊθ/",
        coachNote:
          "Kata “Both” diakhiri dengan desis gigi /θ/, bukan letupan /t/ seperti kata “Boat” (perahu).",
        coachStepsJson: JSON.stringify([
          "Ucapkan vokal rangkap /oʊ/ dengan bibir membulat.",
          "Julurkan sedikit ujung lidah ke tepi gigi atas di akhir kata.",
          "Biarkan udara tetap mengalir keluar selama setengah detik.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/b/", score: 95, status: "ok" },
          { phoneme: "/oʊ/", score: 90, status: "ok" },
          { phoneme: "/θ/", score: 39, status: "work" },
        ]),
        minimalPairsJson: JSON.stringify(["both", "boat", "math", "mat", "path", "pat"]),
      },
      {
        goalTag: "ielts",
        cefrLevel: "B2",
        category: "IELTS Speaking Part 2",
        focusPhonemes: "/v/ dan -ed akhir",
        text: "I have lived in several neighborhoods since I moved to this city.",
        ipa: "/aɪ hæv lɪvd ɪn ˈsɛvrəl ˈneɪbərˌhʊdz sɪns aɪ muːvd tu ðɪs ˈsɪti/",
        translation: "Saya telah tinggal di beberapa lingkungan sejak saya pindah ke kota ini.",
        orderIndex: 8,
        targetMarksJson: JSON.stringify({
          lived: { status: "work", note: "/vd/ akhir hilang", ipa: "/lɪvd/" },
          several: { status: "almost", note: "/v/ jadi /f/", ipa: "/ˈsɛvrəl/" },
          moved: { status: "almost", note: "/vd/ akhir kurang jelas", ipa: "/muːvd/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 84, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 77, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 88, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "lived",
        coachIpa: "/lɪvd/",
        coachNote:
          "Dalam IELTS Speaking, kejelasan bentuk Present Perfect (“have lived”) dinilai di kriteria Grammar sekaligus Pronunciation.",
        coachStepsJson: JSON.stringify([
          "Getarkan bibir bawah untuk bunyi /v/ setelah vokal /ɪ/.",
          "Tanpa melepas suara, sentuhkan ujung lidah ke langit-langit atas untuk menutup dengan /d/.",
          "Hindari mengucapkannya sebagai “live” tanpa /d/.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/l/", score: 94, status: "ok" },
          { phoneme: "/ɪ/", score: 91, status: "ok" },
          { phoneme: "/v/", score: 72, status: "almost" },
          { phoneme: "/d/", score: 40, status: "work" },
        ]),
        minimalPairsJson: JSON.stringify(["lived", "live", "moved", "move", "saved", "save"]),
      },
      {
        goalTag: "ielts",
        cefrLevel: "B2",
        category: "IELTS Speaking Part 3",
        focusPhonemes: "/ð/, /v/, dan /ʃ/",
        text: "Furthermore, governments should invest in renewable energy solutions.",
        ipa: "/ˈfɜrðərˌmɔr ˈɡʌvərnmənts ʃʊd ɪnˈvɛst ɪn rɪˈnuːəbəl ˈɛnərdʒi səˈluːʃənz/",
        translation: "Selain itu, pemerintah sebaiknya berinvestasi pada solusi energi terbarukan.",
        orderIndex: 9,
        targetMarksJson: JSON.stringify({
          Furthermore: { status: "almost", note: "/ð/ jadi /d/", ipa: "/ˈfɜrðərˌmɔr/" },
          invest: { status: "work", note: "/v/ jadi /f/", ipa: "/ɪnˈvɛst/" },
          solutions: { status: "almost", note: "/ʃ/ jadi /s/", ipa: "/səˈluːʃənz/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 85, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 78, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 87, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "invest",
        coachIpa: "/ɪnˈvɛst/",
        coachNote:
          "Tekanan kata berada di suku kata kedua (-vest). Pastikan /v/ bergetar dan kluster akhir /st/ terdengar utuh.",
        coachStepsJson: JSON.stringify([
          "Mulai ringan pada suku kata “in-”.",
          "Sentuhkan gigi atas ke bibir bawah dengan tegas saat masuk ke “-vest”.",
          "Tutup dengan desis /s/ dan letupan /t/ yang jelas.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/ɪn/", score: 92, status: "ok" },
          { phoneme: "/v/", score: 42, status: "work" },
          { phoneme: "/ɛ/", score: 90, status: "ok" },
          { phoneme: "/st/", score: 78, status: "almost" },
        ]),
        minimalPairsJson: JSON.stringify(["invest", "infest", "vest", "fest", "vast", "fast"]),
      },

      // --- GOAL: HARIAN (Everyday conversation) ---
      {
        goalTag: "harian",
        cefrLevel: "A2",
        category: "Obrolan ringan",
        focusPhonemes: "/v/ dan /ð/",
        text: "I have a very good feeling about this weather.",
        ipa: "/aɪ hæv ə ˈvɛri ɡʊd ˈfiːlɪŋ əˈbaʊt ðɪs ˈwɛðər/",
        translation: "Aku punya firasat yang sangat bagus soal cuaca ini.",
        orderIndex: 10,
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
        coachNote:
          "Bunyi /v/-mu terdengar seperti /f/, jadi “fery”. Wajar, karena bahasa Indonesia tidak punya bunyi /v/.",
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
        goalTag: "harian",
        cefrLevel: "A2",
        category: "Obrolan ringan",
        focusPhonemes: "/θ/, /ʃ/, dan konsonan akhir",
        text: "Thank you for waiting, the shop is closed now.",
        ipa: "/θæŋk ju fɔr ˈweɪtɪŋ ðə ʃɑp ɪz kloʊzd naʊ/",
        translation: "Terima kasih sudah menunggu, tokonya sudah tutup sekarang.",
        orderIndex: 11,
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
        coachNote:
          "Bunyi /θ/ di awal kata “Thank” terdengar seperti /t/ (“Tank”). Ujung lidah perlu menyentuh tepi gigi atas.",
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
      {
        goalTag: "harian",
        cefrLevel: "B1",
        category: "Obrolan akhir pekan",
        focusPhonemes: "/ð/ dan /v/",
        text: "They usually visit their favorite cafe on Friday evening.",
        ipa: "/ðeɪ ˈjuːʒuəli ˈvɪzɪt ðɛr ˈfeɪvərɪt kæˈfeɪ ɑn ˈfraɪdeɪ ˈiːvnɪŋ/",
        translation: "Mereka biasanya mengunjungi kafe favorit mereka pada Jumat malam.",
        orderIndex: 12,
        targetMarksJson: JSON.stringify({
          They: { status: "almost", note: "/ð/ jadi /d/", ipa: "/ðeɪ/" },
          visit: { status: "work", note: "/v/ jadi /f/", ipa: "/ˈvɪzɪt/" },
        }),
        sampleScoresJson: JSON.stringify([
          { label: "Kejelasan", score: 82, desc: "Seberapa mudah kamu dipahami" },
          { label: "Ketepatan bunyi", score: 76, desc: "Bunyi diucapkan dengan benar" },
          { label: "Kelancaran", score: 86, desc: "Jeda terasa wajar" },
          { label: "Kelengkapan", score: 100, desc: "Semua kata terucap" },
        ]),
        coachWord: "visit",
        coachIpa: "/ˈvɪzɪt/",
        coachNote:
          "Kata “visit” sering terdengar seperti “fisit”. Pastikan bibir bawah bergetar sejak suku kata pertama.",
        coachStepsJson: JSON.stringify([
          "Tempelkan gigi atas ke bibir bawah sebelum memulai kata.",
          "Nyalakan suara /v/ yang bergetar lalu sambung ke vokal /ɪ/.",
          "Pertahankan desis bersuara /z/ di tengah kata.",
        ]),
        phonemeBreakdownJson: JSON.stringify([
          { phoneme: "/v/", score: 41, status: "work" },
          { phoneme: "/ɪ/", score: 90, status: "ok" },
          { phoneme: "/z/", score: 77, status: "almost" },
          { phoneme: "/t/", score: 88, status: "ok" },
        ]),
        minimalPairsJson: JSON.stringify(["visit", "very", "fairy", "view", "few"]),
      },
    ],
  });

  // 5. Seed 4 Roleplay Scenarios (One for each learning goal)
  const cafeScenario = await prisma.scenario.create({
    data: {
      slug: "memesan-di-kafe",
      goalTag: "harian",
      title: "Memesan di kafe",
      category: "Sehari-hari",
      cefrLevel: "A2 · Dasar",
      characterName: "Sam",
      characterRole: "Barista di Bean Corner",
      characterTrait: "Ramah · bicara pelan · aksen US",
      description:
        "Kamu pelanggan di kafe yang ramai. Pesan minuman, tambah camilan, lalu bayar.",
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
        speakerLine:
          "Hi there! Welcome to Bean Corner. What can I get for you today?",
        translation:
          "Halo! Selamat datang di Bean Corner. Mau pesan apa hari ini?",
        hintsJson: JSON.stringify([
          "Could I get an iced latte, medium, please?",
          "I would like a hot cappuccino, please.",
        ]),
        targetMission: 1,
        sampleCorrectionJson: null,
      },
      {
        scenarioId: cafeScenario.id,
        stepIndex: 1,
        speaker: "Sam",
        speakerLine:
          "Sure! Anything to eat with that? Our croissants just came out of the oven.",
        translation:
          "Tentu! Mau makan sesuatu juga? Croissant kami baru keluar dari oven.",
        hintsJson: JSON.stringify([
          "Yes, one croissant, please.",
          "No thanks, just the latte.",
        ]),
        targetMission: 2,
        sampleCorrectionJson: null,
      },
      {
        scenarioId: cafeScenario.id,
        stepIndex: 2,
        speaker: "Sam",
        speakerLine: "Great choice. That'll be seven fifty. Card or cash?",
        translation:
          "Pilihan bagus. Totalnya tujuh lima puluh. Kartu atau tunai?",
        hintsJson: JSON.stringify([
          "I will pay by card. Thank you!",
          "Can I pay with cash, please?",
        ]),
        targetMission: 3,
        sampleCorrectionJson: JSON.stringify({
          word: "card",
          ipa: "/kɑrd/",
          phoneme: "/d/",
          errorPattern: "-d akhir",
          status: "almost",
          promptText: "Hampir. Coba perjelas bunyi /d/ di akhir kata card.",
          detailText:
            "Bunyi /d/ di akhir kata card dicatat ke Bank Kesalahan.",
        }),
      },
    ],
  });

  const workScenario = await prisma.scenario.create({
    data: {
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
      missionsJson: JSON.stringify([
        "Perkenalkan diri dan pengalaman singkat",
        "Jelaskan proyek yang pernah kamu selesaikan",
        "Tanyakan langkah rekrutmen berikutnya",
      ]),
      usefulPhrasesJson: JSON.stringify([
        { phrase: "I worked on...", meaning: "Saya pernah mengerjakan..." },
        { phrase: "We solved the issue by...", meaning: "Kami menyelesaikan masalahnya dengan..." },
        { phrase: "What are the next steps?", meaning: "Apa tahapan berikutnya?" },
      ]),
    },
  });

  await prisma.scenarioNode.createMany({
    data: [
      {
        scenarioId: workScenario.id,
        stepIndex: 0,
        speaker: "Rina",
        speakerLine:
          "Thanks for joining today! Could you tell me about a recent project you worked on?",
        translation:
          "Terima kasih sudah bergabung hari ini! Bisa ceritakan satu proyek terakhir yang pernah kamu kerjakan?",
        hintsJson: JSON.stringify([
          "I worked on a web project and solved the main user issue.",
          "Last month I developed a very useful dashboard for our team.",
        ]),
        targetMission: 1,
        sampleCorrectionJson: JSON.stringify({
          word: "worked",
          ipa: "/wɜrkt/",
          phoneme: "/-ed/",
          errorPattern: "-ed akhir",
          status: "work",
          promptText: "Perhatikan akhiran -ed pada kata worked.",
          detailText:
            "Bunyi /t/ di akhir worked perlu terdengar agar jelas bahwa proyek tersebut sudah dikerjakan (past tense).",
        }),
      },
      {
        scenarioId: workScenario.id,
        stepIndex: 1,
        speaker: "Rina",
        speakerLine:
          "That sounds impressive. How did you handle feedback from your team during that project?",
        translation:
          "Terdengar menarik. Bagaimana cara kamu menangani masukan dari tim selama proyek tersebut?",
        hintsJson: JSON.stringify([
          "I think regular review sessions helped us very much.",
          "We discussed every version openly and fixed issues together.",
        ]),
        targetMission: 2,
        sampleCorrectionJson: JSON.stringify({
          word: "think",
          ipa: "/θɪŋk/",
          phoneme: "/θ/",
          errorPattern: "th → t",
          status: "almost",
          promptText: "Hampir! Coba perjelas bunyi /θ/ pada kata think.",
          detailText:
            "Sentuhkan ujung lidah ke tepi gigi atas sebelum mengucapkan think.",
        }),
      },
      {
        scenarioId: workScenario.id,
        stepIndex: 2,
        speaker: "Rina",
        speakerLine:
          "Thank you for sharing. Do you have any questions for us before we wrap up?",
        translation:
          "Terima kasih sudah berbagi. Apakah ada pertanyaan untuk kami sebelum sesi ini ditutup?",
        hintsJson: JSON.stringify([
          "Thank you, what are the next steps in this interview process?",
          "When can I expect to hear back from the team?",
        ]),
        targetMission: 3,
        sampleCorrectionJson: null,
      },
    ],
  });

  const travelScenario = await prisma.scenario.create({
    data: {
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
      missionsJson: JSON.stringify([
        "Sebutkan reservasi kamar",
        "Konfirmasi deposit dengan kartu",
        "Tanyakan arah ke stasiun MRT terdekat",
      ]),
      usefulPhrasesJson: JSON.stringify([
        { phrase: "I have a reservation", meaning: "Saya punya reservasi" },
        { phrase: "Can I pay the deposit by card?", meaning: "Bisa bayar deposit pakai kartu?" },
        { phrase: "Where is the nearest station?", meaning: "Di mana stasiun terdekat?" },
      ]),
    },
  });

  await prisma.scenarioNode.createMany({
    data: [
      {
        scenarioId: travelScenario.id,
        stepIndex: 0,
        speaker: "Liam",
        speakerLine:
          "Welcome to Marina Stay! I found your reservation for two nights. How would you like to cover the deposit?",
        translation:
          "Selamat datang di Marina Stay! Saya menemukan reservasi Anda untuk dua malam. Bagaimana Anda ingin membayar depositnya?",
        hintsJson: JSON.stringify([
          "I will pay the deposit by card, please.",
          "Can I use this credit card for the deposit?",
        ]),
        targetMission: 1,
        sampleCorrectionJson: JSON.stringify({
          word: "card",
          ipa: "/kɑrd/",
          phoneme: "/-ed/",
          errorPattern: "-d akhir",
          status: "work",
          promptText: "Coba perjelas bunyi /d/ di akhir kata card.",
          detailText:
            "Tanpa bunyi penutup /d/, kata card terdengar seperti car.",
        }),
      },
      {
        scenarioId: travelScenario.id,
        stepIndex: 1,
        speaker: "Liam",
        speakerLine:
          "Here is your room key on the fifth floor. Is there anything else you need help with today?",
        translation:
          "Ini kunci kamar Anda di lantai lima. Apakah ada hal lain yang bisa saya bantu hari ini?",
        hintsJson: JSON.stringify([
          "Excuse me, where is the shuttle bus to the station?",
          "How do I walk to the nearest MRT station from here?",
        ]),
        targetMission: 2,
        sampleCorrectionJson: JSON.stringify({
          word: "shuttle",
          ipa: "/ˈʃʌtəl/",
          phoneme: "/ʃ/",
          errorPattern: "sh → s",
          status: "almost",
          promptText: "Hampir! Bulatkan bibir sedikit saat mengucapkan shuttle.",
          detailText: "Bunyi /ʃ/ di awal shuttle sudah masuk jadwal latihanmu.",
        }),
      },
      {
        scenarioId: travelScenario.id,
        stepIndex: 2,
        speaker: "Liam",
        speakerLine:
          "Just walk through the main lobby and turn right. Enjoy your stay!",
        translation:
          "Cukup jalan melewati lobi utama lalu belok kanan. Selamat menikmati masa menginap Anda!",
        hintsJson: JSON.stringify([
          "Thank you very much for your help!",
          "Thanks, have a great evening!",
        ]),
        targetMission: 3,
        sampleCorrectionJson: null,
      },
    ],
  });

  const ieltsScenario = await prisma.scenario.create({
    data: {
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
      missionsJson: JSON.stringify([
        "Ceritakan kebiasaan belajarmu",
        "Berikan alasan mengapa metode itu efektif",
        "Jawab pertanyaan tentang rencana masa depan",
      ]),
      usefulPhrasesJson: JSON.stringify([
        { phrase: "Both methods help me...", meaning: "Kedua metode itu membantu saya..." },
        { phrase: "From my perspective...", meaning: "Dari sudut pandang saya..." },
        { phrase: "In the near future...", meaning: "Dalam waktu dekat..." },
      ]),
    },
  });

  await prisma.scenarioNode.createMany({
    data: [
      {
        scenarioId: ieltsScenario.id,
        stepIndex: 0,
        speaker: "Dr. Claire",
        speakerLine:
          "Let's talk about your study habits. Do you prefer studying alone or discussing topics with other students?",
        translation:
          "Mari bicara tentang kebiasaan belajar Anda. Apakah Anda lebih suka belajar sendiri atau berdiskusi dengan pelajar lain?",
        hintsJson: JSON.stringify([
          "Both methods help me understand difficult university subjects.",
          "I think studying with friends helps me develop new ideas.",
        ]),
        targetMission: 1,
        sampleCorrectionJson: JSON.stringify({
          word: "Both",
          ipa: "/boʊθ/",
          phoneme: "/θ/",
          errorPattern: "th → t",
          status: "work",
          promptText: "Perhatikan desis /θ/ di akhir kata Both.",
          detailText:
            "Akhiri kata Both dengan ujung lidah di antara gigi agar tidak terdengar Boat.",
        }),
      },
      {
        scenarioId: ieltsScenario.id,
        stepIndex: 1,
        speaker: "Dr. Claire",
        speakerLine:
          "How has technology changed the way you prepare for exams over the last few years?",
        translation:
          "Bagaimana teknologi mengubah cara Anda mempersiapkan ujian selama beberapa tahun terakhir?",
        hintsJson: JSON.stringify([
          "Digital tools have improved the way I review several courses.",
          "I use online practice every evening to check my pronunciation.",
        ]),
        targetMission: 2,
        sampleCorrectionJson: JSON.stringify({
          word: "several",
          ipa: "/ˈsɛvrəl/",
          phoneme: "/v/",
          errorPattern: "v → f",
          status: "almost",
          promptText: "Hampir! Getarkan bibir bawah pada bunyi /v/ di several.",
          detailText:
            "Kata several sudah dicatat ke Bank Kesalahan untuk diulang.",
        }),
      },
      {
        scenarioId: ieltsScenario.id,
        stepIndex: 2,
        speaker: "Dr. Claire",
        speakerLine:
          "Thank you. Finally, what skill would you like to develop further this year?",
        translation:
          "Terima kasih. Terakhir, keterampilan apa yang ingin Anda kembangkan lebih jauh tahun ini?",
        hintsJson: JSON.stringify([
          "I want to speak English with greater confidence at work.",
          "I hope to pass my speaking test and study abroad.",
        ]),
        targetMission: 3,
        sampleCorrectionJson: null,
      },
    ],
  });

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
