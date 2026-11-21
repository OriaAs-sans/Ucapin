import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessSpokenUtterance } from "@/lib/speech-assessor";
import { getSpeechMockMode, mockTranscription } from "./speech-mock";

const REF = "I work with three friends in a small office near the station.";

describe("getSpeechMockMode", () => {
  it("aktif hanya dengan nilai yang dikenal", () => {
    assert.equal(getSpeechMockMode({ NODE_ENV: "development", SPEECH_MOCK: "jelas" }), "jelas");
    assert.equal(getSpeechMockMode({ NODE_ENV: "test", SPEECH_MOCK: "salah-ucap" }), "salah-ucap");
    assert.equal(getSpeechMockMode({ NODE_ENV: "development", SPEECH_MOCK: "true" }), null);
    assert.equal(getSpeechMockMode({ NODE_ENV: "development" }), null);
  });

  it("tidak pernah aktif di production", () => {
    assert.equal(getSpeechMockMode({ NODE_ENV: "production", SPEECH_MOCK: "jelas" }), null);
    assert.equal(getSpeechMockMode({ NODE_ENV: "production", SPEECH_MOCK: "salah-ucap" }), null);
  });
});

describe("mockTranscription", () => {
  it("mode jelas: transkrip sama dengan kalimat acuan dan dinilai 100", () => {
    const result = mockTranscription(REF, "jelas");
    assert.equal(result.transcript, "i work with three friends in a small office near the station");
    const assessed = assessSpokenUtterance({
      referenceText: REF,
      spokenWords: result.words,
      defaultTargetMarks: {},
    });
    assert.equal(assessed.scores[0].score, 100);
    assert.equal(assessed.flaggedMistakes.length, 0);
  });

  it("mode salah-ucap: tepat satu kata isi diganti dan penilai menangkap polanya", () => {
    const result = mockTranscription(REF, "salah-ucap");
    const refTokens = mockTranscription(REF, "jelas").words.map((w) => w.text);
    const changed = result.words.filter((w, i) => w.text !== refTokens[i]);
    assert.deepEqual(changed.map((w) => w.text), ["tree"]);
    const assessed = assessSpokenUtterance({
      referenceText: REF,
      spokenWords: result.words,
      defaultTargetMarks: {},
    });
    assert.deepEqual(
      assessed.flaggedMistakes.map((m) => [m.word, m.errorPattern]),
      [["three", "/θ/ jadi /t/"]]
    );
  });

  it("waktu kata berurutan dan durasi audio masuk akal untuk menit bicara", () => {
    const result = mockTranscription(REF, "jelas");
    for (let i = 1; i < result.words.length; i++) {
      assert.ok(result.words[i].start >= result.words[i - 1].end);
    }
    assert.ok(result.audioDurationSec > 4 && result.audioDurationSec < 7);
  });

  it("kalimat tanpa kata yang bisa diubah: tetap mengembalikan transkrip utuh", () => {
    const result = mockTranscription("I like coffee", "salah-ucap");
    assert.equal(result.transcript, "i like coffee");
  });
});
