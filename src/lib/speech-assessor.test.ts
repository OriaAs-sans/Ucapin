import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessSpokenUtterance, type SpokenWord } from "./speech-assessor";

// Transkrip buatan (tanpa audio dan tanpa ElevenLabs). Setiap kata 0,42 detik, sekitar 140 kata/menit.
function spoken(text: string, confidence = 0.95, overrides: Record<number, number> = {}): SpokenWord[] {
  return text.split(/\s+/).map((t, i) => ({
    text: t,
    confidence: overrides[i] ?? confidence,
    start: i * 0.42,
    end: i * 0.42 + 0.34,
  }));
}

function assess(referenceText: string, words: SpokenWord[]) {
  return assessSpokenUtterance({ referenceText, spokenWords: words, defaultTargetMarks: {} });
}

function score(result: ReturnType<typeof assess>, label: string): number {
  const item = result.scores.find((s) => s.label === label);
  assert.ok(item, `skor ${label} tidak ada`);
  return item.score;
}

const REF = "I work with three friends in a small office near the station.";

describe("assessSpokenUtterance: ucapan jelas", () => {
  it("semua kata cocok dan yakin: Kejelasan 100, tanpa tanda, tanpa Bank Kesalahan", () => {
    const r = assess(REF, spoken("I work with three friends in a small office near the station"));
    assert.equal(score(r, "Kejelasan"), 100);
    assert.equal(score(r, "Kelengkapan"), 100);
    assert.deepEqual(r.marks, {});
    assert.equal(r.flaggedMistakes.length, 0);
  });

  it("tanda baca dan huruf besar di transkrip tidak dianggap salah", () => {
    const r = assess(REF, spoken("I WORK with Three friends, in a small office near the station."));
    assert.deepEqual(r.marks, {});
  });

  it("tempo dihitung dari waktu kata", () => {
    const r = assess(REF, spoken("I work with three friends in a small office near the station"));
    assert.ok(r.wordsPerMinute > 120 && r.wordsPerMinute < 170, `wpm ${r.wordsPerMinute}`);
    assert.ok(score(r, "Kelancaran") >= 90);
  });
});

describe("assessSpokenUtterance: pola salah ucap khas Indonesia", () => {
  const cases: { ref: string; heard: string; word: string; note: RegExp; phoneme: string }[] = [
    { ref: "I have three cats", heard: "I have tree cats", word: "three", note: /\/θ\/ jadi \/t\//, phoneme: "/θ/" },
    { ref: "I think so", heard: "I sink so", word: "think", note: /\/θ\/ jadi \/s\//, phoneme: "/θ/" },
    { ref: "I think so", heard: "I tink so", word: "think", note: /\/θ\/ jadi \/t\//, phoneme: "/θ/" },
    { ref: "go with me", heard: "go wiz me", word: "with", note: /\/ð\/ akhir jadi \/z\//, phoneme: "/ð/" },
    { ref: "I see five cats", heard: "I see fife cats", word: "five", note: /\/v\/ akhir jadi \/f\//, phoneme: "/v/" },
    { ref: "my birthday party", heard: "my birtday party", word: "birthday", note: /\/θ\//, phoneme: "/θ/" },
    { ref: "both of them", heard: "bot of them", word: "both", note: /\/θ\/ akhir jadi \/t\//, phoneme: "/θ/" },
    { ref: "the other room", heard: "the oder room", word: "other", note: /\/ð\/ jadi \/d\//, phoneme: "/ð/" },
    { ref: "the weather today", heard: "the wezer today", word: "weather", note: /\/ð\//, phoneme: "/ð/" },
    { ref: "very good", heard: "berry good", word: "very", note: /\/v\//, phoneme: "/v/" },
    { ref: "we buy vegetables", heard: "we buy begetables", word: "vegetables", note: /\/v\/ jadi \/b\//, phoneme: "/v/" },
    { ref: "please leave now", heard: "please leaf now", word: "leave", note: /\/v\/ akhir jadi \/f\//, phoneme: "/v/" },
    { ref: "the fresh bread", heard: "the fres bread", word: "fresh", note: /\/ʃ\//, phoneme: "/ʃ/" },
    { ref: "I worked late", heard: "I work late", word: "worked", note: /\/t\/ akhir hilang/, phoneme: "/t/ atau /d/ akhir" },
    { ref: "we visited Bali", heard: "we visit Bali", word: "visited", note: /-ed hilang/, phoneme: "/t/ atau /d/ akhir" },
  ];

  for (const c of cases) {
    it(`${c.word} terdengar "${c.heard.split(" ").find((w, i) => w !== c.ref.split(" ")[i])}"`, () => {
      const r = assess(c.ref, spoken(c.heard));
      const mark = r.marks[c.word];
      assert.ok(mark, `kata ${c.word} tidak ditandai`);
      assert.equal(mark.status, "work");
      assert.match(mark.note, c.note);
      const flagged = r.flaggedMistakes.find((m) => m.word === c.word);
      assert.ok(flagged, `${c.word} tidak masuk Bank Kesalahan`);
      assert.equal(flagged.phoneme, c.phoneme);
      assert.equal(r.primaryFocusWord, c.word);
    });
  }

  it("kata di kamus memakai IPA dari kamus", () => {
    const r = assess("I have three cats", spoken("I have tree cats"));
    assert.equal(r.marks.three.ipa, "/θriː/");
  });
});

describe("assessSpokenUtterance: ambang keyakinan", () => {
  it("cocok tapi keyakinan 0,4 sampai di bawah 0,7 = Hampir", () => {
    const r = assess("I like coffee", spoken("I like coffee", 0.95, { 2: 0.55 }));
    assert.equal(r.marks.coffee.status, "almost");
  });

  it("cocok dengan keyakinan di bawah 0,4 = Ulang", () => {
    const r = assess("I like coffee", spoken("I like coffee", 0.95, { 2: 0.3 }));
    assert.equal(r.marks.coffee.status, "work");
  });

  it("tepat 0,7 sudah Jelas", () => {
    const r = assess("I like coffee", spoken("I like coffee", 0.95, { 2: 0.7 }));
    assert.equal(r.marks.coffee, undefined);
  });

  it("Hampir tanpa pola bunyi yang dikenal tidak masuk Bank Kesalahan", () => {
    const r = assess("I like coffee", spoken("I like coffee", 0.95, { 2: 0.55 }));
    assert.equal(r.flaggedMistakes.length, 0);
  });

  it("Hampir pada kata dengan pola dikenal tetap masuk Bank Kesalahan", () => {
    const r = assess("it is very good", spoken("it is very good", 0.95, { 2: 0.5 }));
    assert.equal(r.marks.very.status, "almost");
    assert.ok(r.flaggedMistakes.some((m) => m.word === "very"));
  });
});

describe("assessSpokenUtterance: yang tidak boleh masuk Bank Kesalahan", () => {
  it("kata fungsi yang terlewat ditandai, tapi tidak masuk bank", () => {
    const r = assess("I work in the office", spoken("I work in office"));
    assert.equal(r.marks.the?.status, "work");
    assert.equal(r.flaggedMistakes.some((m) => m.word === "the"), false);
  });

  it("kalimat yang diucapkan berbeda: tidak ada tebakan yang masuk bank", () => {
    const r = assess(REF, spoken("yesterday we went to the beach with my family"));
    assert.equal(r.flaggedMistakes.length, 0);
    assert.ok(score(r, "Kejelasan") < 30);
  });

  it("rekaman tanpa kata: semua skor 0 dan tidak ada bank", () => {
    const r = assess(REF, []);
    assert.equal(score(r, "Kejelasan"), 0);
    assert.equal(score(r, "Kelancaran"), 0);
    assert.equal(r.flaggedMistakes.length, 0);
    assert.equal(r.wordsPerMinute, 0);
  });
});

describe("assessSpokenUtterance: kelancaran", () => {
  it("jeda panjang menurunkan Kelancaran", () => {
    const smooth = assess("I like to drink hot coffee", spoken("I like to drink hot coffee"));
    const words = spoken("I like to drink hot coffee").map((w, i) =>
      i >= 3 ? { ...w, start: w.start + 2, end: w.end + 2 } : w
    );
    const paused = assess("I like to drink hot coffee", words);
    assert.ok(score(paused, "Kelancaran") < score(smooth, "Kelancaran"));
    assert.match(paused.scores.find((s) => s.label === "Kelancaran")!.desc, /1 jeda panjang/);
  });
});
