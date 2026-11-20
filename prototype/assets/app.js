/* Ucapin prototype behaviour. Assessment results are sample data; the microphone and audio playback are real. */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Speech playback (browser TTS) ---------- */
  const canSpeak = "speechSynthesis" in window;
  function speak(text, rate = 1) {
    if (!canSpeak) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("en-US"));
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
    return true;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-say]");
    if (!b) return;
    if (!speak(b.dataset.say, Number(b.dataset.rate || 1))) {
      b.setAttribute("aria-disabled", "true");
      b.title = "Browser ini tidak mendukung pemutaran suara contoh";
    }
  });

  /* ---------- Theme (light / dark) ---------- */
  const root = document.documentElement;
  const darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : !!(darkQuery && darkQuery.matches);
  function syncThemeButtons() {
    const dark = isDark();
    $$("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(dark));
      $("span", b).textContent = dark ? "Mode terang" : "Mode gelap";
      $("use", b).setAttribute("href", "assets/icons.svg#" + (dark ? "sun" : "moon"));
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-toggle]");
    if (!b) return;
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("ucapin-theme", next); } catch (err) { /* storage blocked: theme still applies for this page */ }
    syncThemeButtons();
  });
  if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener("change", syncThemeButtons);
  syncThemeButtons();

  /* ---------- Show/hide toggles ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-toggle]");
    if (!b) return;
    const t = document.getElementById(b.dataset.toggle);
    if (!t) return;
    const open = t.hidden;
    t.hidden = !open;
    b.setAttribute("aria-expanded", String(open));
    if (b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", String(open));
    if (b.dataset.labelOpen) {
      if (!b.dataset.labelClosed) b.dataset.labelClosed = b.textContent.trim();
      b.textContent = open ? b.dataset.labelOpen : b.dataset.labelClosed;
    }
  });

  /* ---------- Microphone + level meter ---------- */
  const Mic = {
    stream: null, ctx: null, raf: 0,
    async start(onLevel) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const err = new Error("unsupported"); err.name = "NotSupportedError"; throw err;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      const src = this.ctx.createMediaStreamSource(this.stream);
      const an = this.ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      const tick = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
        this.raf = requestAnimationFrame(tick);
      };
      tick();
      const track = this.stream.getAudioTracks()[0];
      return track ? track.label : "";
    },
    stop() {
      cancelAnimationFrame(this.raf);
      if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
      if (this.ctx) this.ctx.close();
      this.stream = null; this.ctx = null;
    },
  };

  function micErrorMessage(err) {
    switch (err && err.name) {
      case "NotAllowedError":
      case "SecurityError":
        return { title: "Mikrofon diblokir", body: "Browser menolak akses mikrofon. Buka ikon gembok di samping alamat situs, pilih Izin situs, lalu ubah Mikrofon menjadi Izinkan. Setelah itu muat ulang halaman." };
      case "NotFoundError":
      case "OverconstrainedError":
        return { title: "Mikrofon tidak ditemukan", body: "Tidak ada mikrofon yang tersambung. Colokkan headset atau mikrofon, lalu coba lagi." };
      case "NotReadableError":
        return { title: "Mikrofon sedang dipakai aplikasi lain", body: "Tutup aplikasi lain yang memakai mikrofon (misalnya Zoom atau Meet), lalu coba lagi." };
      case "NotSupportedError":
        return { title: "Browser belum mendukung", body: "Browser ini tidak bisa merekam suara. Coba Chrome, Edge, atau Firefox versi terbaru." };
      default:
        return { title: "Mikrofon belum bisa dipakai", body: "Terjadi kendala saat menyalakan mikrofon. Coba lagi sebentar lagi." };
    }
  }

  function makeBars(el, n) {
    el.innerHTML = "";
    for (let i = 0; i < n; i++) el.appendChild(document.createElement("i"));
    return Array.from(el.children);
  }
  function drawBars(bars, level, max = 44) {
    bars.forEach((b, i) => {
      const wobble = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + performance.now() / 140));
      b.style.height = Math.max(6, level * max * wobble) + "px";
    });
  }

  /* ---------- Page: Latihan Ucapan ---------- */
  function initDrill() {
    const sentences = [
      {
        text: "I have a very good feeling about this weather.",
        ipa: "/aɪ hæv ə ˈvɛri ɡʊd ˈfiːlɪŋ əˈbaʊt ðɪs ˈwɛðər/",
        arti: "Aku punya firasat yang sangat bagus soal cuaca ini.",
        marks: { very: ["work", "/v/ jadi /f/"], this: ["almost", "/ð/ jadi /d/"] },
        scores: [["Kejelasan", 84, "Seberapa mudah kamu dipahami"], ["Ketepatan bunyi", 78, "Bunyi diucapkan dengan benar"], ["Kelancaran", 88, "Jeda terasa wajar"], ["Kelengkapan", 100, "Semua kata terucap"]],
      },
      {
        text: "Thank you for waiting, the shop is closed now.",
        ipa: "/θæŋk ju fɔr ˈweɪtɪŋ ðə ʃɑp ɪz kloʊzd naʊ/",
        arti: "Terima kasih sudah menunggu, tokonya sudah tutup sekarang.",
        marks: { Thank: ["work", "/θ/ jadi /t/"], shop: ["almost", "/ʃ/ jadi /s/"], "closed": ["almost", "/d/ akhir hilang"] },
        scores: [["Kejelasan", 79, "Seberapa mudah kamu dipahami"], ["Ketepatan bunyi", 71, "Bunyi diucapkan dengan benar"], ["Kelancaran", 85, "Jeda terasa wajar"], ["Kelengkapan", 100, "Semua kata terucap"]],
      },
    ];
    let idx = 0, state = "idle";
    const sentenceEl = $("#sentence"), ipaEl = $("#ipa"), artiEl = $("#arti");
    const mic = $("#mic"), micLabel = $("#mic-label"), micHint = $("#mic-hint");
    const barsL = makeBars($("#levels-l"), 12), barsR = makeBars($("#levels-r"), 12);
    const result = $("#result"), errorBox = $("#mic-error"), nextBtn = $("#next"), counter = $("#counter");
    const prompt = $("#retry-prompt"), coach = $("#coach-detail"), saved = $("#saved-note");

    function render() {
      const s = sentences[idx];
      sentenceEl.innerHTML = "";
      s.text.split(" ").forEach((w) => {
        const span = document.createElement("span");
        span.className = "w";
        span.textContent = w;
        span.dataset.key = w.replace(/[^A-Za-z']/g, "");
        sentenceEl.appendChild(span);
      });
      ipaEl.textContent = s.ipa;
      artiEl.textContent = s.arti;
      $$("[data-say-sentence]").forEach((b) => (b.dataset.say = s.text));
      counter.textContent = `Kalimat ${idx + 4} dari 12`;
      result.hidden = true; prompt.hidden = true; saved.hidden = true;
      nextBtn.disabled = true;
      setState("idle");
    }

    function setState(s) {
      state = s;
      mic.dataset.state = s;
      const labels = { idle: ["Ketuk untuk bicara", "Ketuk lagi kalau sudah selesai"], recording: ["Mendengarkan…", "Ketuk untuk berhenti"], processing: ["Menilai ucapanmu…", "Sebentar, sekitar 1 detik"], done: ["Coba lagi", "Ketuk untuk merekam ulang"] };
      micLabel.textContent = labels[s][0];
      micHint.textContent = labels[s][1];
      mic.setAttribute("aria-label", labels[s][0]);
      mic.querySelector("use").setAttribute("href", s === "recording" ? "assets/icons.svg#stop" : "assets/icons.svg#mic");
      $("#levels-l").classList.toggle("live", s === "recording");
      $("#levels-r").classList.toggle("live", s === "recording");
      if (s !== "recording") { drawBars(barsL, 0); drawBars(barsR, 0); }
    }

    function showResult() {
      const s = sentences[idx];
      const words = $$(".w", sentenceEl);
      words.forEach((el, i) => {
        const m = s.marks[el.dataset.key];
        const kind = m ? m[0] : "ok";
        setTimeout(() => {
          el.classList.add("mk", "mk-" + kind);
          if (m) {
            const note = document.createElement("span");
            note.className = "word-note sticker status-" + kind;
            note.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${kind === "work" ? "cross" : "again"}"/></svg>`;
            note.appendChild(document.createTextNode((kind === "work" ? "Ulang · " : "Hampir · ") + m[1]));
            el.appendChild(note);
          }
        }, i * 70);
      });
      const list = $("#scores");
      list.innerHTML = s.scores.map(([n, v, d], k) => {
        const tone = k === 0 ? "mb-coral" : v >= 85 ? "mb-ok" : v >= 75 ? "mb-almost" : "mb-work";
        return `<div class="card score-card"><div class="top"><span class="muted">${n}</span><span class="num">${v}</span></div><div class="meterbar ${tone}"><i style="width:${v}%"></i></div><small>${d}</small></div>`;
      }).join("");
      result.hidden = false;
      const work = Object.entries(s.marks).find(([, m]) => m[0] === "work");
      if (work) {
        $("#retry-word").textContent = work[0];
        $("#retry-say").dataset.say = work[0];
        prompt.hidden = false;
        saved.hidden = false;
      }
      nextBtn.disabled = false;
      setState("done");
    }

    function finishRecording() {
      Mic.stop();
      setState("processing");
      setTimeout(showResult, 900);
    }

    mic.addEventListener("click", async () => {
      if (state === "processing") return;
      if (state === "recording") return finishRecording();
      if (state === "done") render();
      errorBox.hidden = true;
      try {
        await Mic.start((lvl) => { drawBars(barsL, lvl); drawBars(barsR, lvl); });
        setState("recording");
      } catch (err) {
        const m = micErrorMessage(err);
        $("#mic-error-title").textContent = m.title;
        $("#mic-error-body").textContent = m.body;
        errorBox.hidden = false;
        setState("idle");
      }
    });
    $("#simulate").addEventListener("click", () => { errorBox.hidden = true; setState("processing"); setTimeout(showResult, 600); });
    $("#retry-word-btn").addEventListener("click", () => { coach.hidden = false; $("#coach-toggle").setAttribute("aria-expanded", "true"); mic.focus(); });
    nextBtn.addEventListener("click", () => { idx = (idx + 1) % sentences.length; render(); });
    $("#skip").addEventListener("click", () => { Mic.stop(); idx = (idx + 1) % sentences.length; render(); });
    render();
  }

  /* ---------- Page: Roleplay (scripted, MVP has no LLM) ---------- */
  function initRoleplay() {
    const script = [
      { sam: "Sure! Anything to eat with that? Our croissants just came out of the oven.", arti: "Tentu! Mau makan sesuatu juga? Croissant kami baru keluar dari oven.", hints: ["Yes, one croissant, please.", "No thanks, just the latte.", "What do you recommend?"], mission: 2 },
      { sam: "Great choice. That'll be seven fifty. Card or cash?", arti: "Pilihan bagus. Totalnya tujuh lima puluh. Kartu atau tunai?", hints: ["By card, please.", "Can I pay with cash?", "Do you take QRIS?"], mission: 2 },
      { sam: "All done. Have a lovely day!", arti: "Sudah. Semoga harimu menyenangkan!", hints: ["Thank you, you too!", "Thanks, bye!"], mission: 2, last: true },
    ];
    let step = 0, recording = false, chosen = null;
    const chat = $("#chat"), hints = $("#hints"), mic = $("#rp-mic"), micLabel = $("#rp-mic-label");
    const bars = makeBars($("#rp-levels"), 14), errorBox = $("#rp-error");
    const timerEl = $("#timer"), t0 = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000) + 192;
      timerEl.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }, 1000);

    function addTurn(who, text, arti) {
      const id = "tr-" + Math.random().toString(36).slice(2, 8);
      const div = document.createElement("div");
      div.className = "turn turn-new " + (who === "me" ? "turn-me" : "turn-char");
      div.innerHTML = who === "me"
        ? `<div class="who">Kamu</div><p class="line" lang="en"></p><div class="tools"><button class="tool" type="button" data-say=""><svg class="icon icon-sm" aria-hidden="true"><use href="assets/icons.svg#speaker"/></svg>Putar</button></div>`
        : `<div class="who">Sam, barista (karakter)</div><p class="line" lang="en"></p><div class="tools"><button class="tool" type="button" data-say=""><svg class="icon icon-sm" aria-hidden="true"><use href="assets/icons.svg#speaker"/></svg>Putar</button><button class="tool" type="button" data-say="" data-rate="0.7"><svg class="icon icon-sm" aria-hidden="true"><use href="assets/icons.svg#slow"/></svg>Pelan</button><button class="tool" type="button" aria-pressed="false" aria-expanded="false" data-toggle="${id}"><svg class="icon icon-sm" aria-hidden="true"><use href="assets/icons.svg#translate"/></svg>Arti</button></div><p class="tr" id="${id}" hidden></p>`;
      $(".line", div).textContent = text;
      $$("[data-say]", div).forEach((b) => (b.dataset.say = text));
      if (arti) $(".tr", div).textContent = arti;
      chat.appendChild(div);
      div.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return div;
    }

    function renderHints() {
      const cur = script[step];
      hints.innerHTML = "";
      if (!cur) return;
      cur.hints.forEach((h) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn hint"; b.lang = "en"; b.textContent = h;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => {
          chosen = h;
          $$("button", hints).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          micLabel.textContent = "Sekarang ucapkan kalimat itu. Ketuk mikrofon.";
        });
        hints.appendChild(b);
      });
    }

    function setMission(n) {
      $$(".mission").forEach((m, i) => {
        m.classList.toggle("done", i < n);
        m.classList.toggle("current", i === n);
      });
    }

    function answer() {
      const cur = script[step];
      const said = chosen || cur.hints[0];
      addTurn("me", said);
      chosen = null;
      const perTurn = $("input[name=koreksi]:checked").value === "giliran";
      if (perTurn && step === 1) {
        const c = document.createElement("div");
        c.className = "alert alert-warn correction";
        c.innerHTML = `<h3><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#again"/></svg>Hampir. Coba ucapkan lagi kata <span class="mk mk-almost" lang="en">card</span>.</h3><p>Bunyi /d/ di akhir kata belum terdengar. Kata ini masuk Bank Kesalahan.</p>`;
        chat.lastElementChild.appendChild(c);
      }
      setMission(cur.mission);
      step++;
      const next = script[step];
      if (next) {
        setTimeout(() => { addTurn("char", next.sam, next.arti); renderHints(); }, 500);
      } else {
        setMission(3);
        hints.parentElement.hidden = true;
        $("#rp-done").hidden = false;
        mic.disabled = true;
        $("#rp-simulate").hidden = true;
        micLabel.textContent = "Semua misi selesai.";
      }
    }

    mic.addEventListener("click", async () => {
      if (recording) {
        Mic.stop(); recording = false; mic.dataset.state = "idle";
        mic.querySelector("use").setAttribute("href", "assets/icons.svg#mic");
        micLabel.textContent = "Ketuk untuk menjawab";
        $("#rp-levels").classList.remove("live"); drawBars(bars, 0);
        return answer();
      }
      errorBox.hidden = true;
      try {
        await Mic.start((l) => drawBars(bars, l, 30));
        recording = true; mic.dataset.state = "recording";
        mic.querySelector("use").setAttribute("href", "assets/icons.svg#stop");
        micLabel.textContent = "Mendengarkan… ketuk untuk kirim";
        $("#rp-levels").classList.add("live");
      } catch (err) {
        const m = micErrorMessage(err);
        $("#rp-error-title").textContent = m.title;
        $("#rp-error-body").textContent = m.body;
        errorBox.hidden = false;
      }
    });
    $("#rp-simulate").addEventListener("click", () => { errorBox.hidden = true; answer(); });
    renderHints();
  }

  /* ---------- Page: Cek mikrofon ---------- */
  function initMicCheck() {
    const allowBtn = $("#allow"), status = $("#perm-status"), test = $("#sound-test");
    const meterBars = makeBars($("#meter"), 28), verdict = $("#verdict"), device = $("#device");
    const blocked = $("#blocked");
    let loudFrames = 0, quietFrames = 0, decided = false;

    function show(kind, title, body) {
      status.className = "alert alert-" + kind;
      status.hidden = false;
      $("h3 span", status).textContent = title;
      $("p", status).textContent = body;
    }

    async function begin() {
      allowBtn.disabled = true;
      allowBtn.textContent = "Menunggu izin browser…";
      blocked.hidden = true;
      try {
        const label = await Mic.start((lvl) => {
          const on = Math.round(lvl * 28);
          meterBars.forEach((b, i) => { b.classList.toggle("on", i < on); b.classList.toggle("hi", i < on && i >= 22); b.style.height = (i < on ? 10 + (i % 5) * 5 : 10) + "px"; });
          if (decided) return;
          if (lvl > 0.12) loudFrames++; else quietFrames++;
          if (loudFrames > 45) {
            decided = true;
            verdict.className = "alert alert-ok"; verdict.hidden = false;
            $("h3 span", verdict).textContent = "Suaramu terdengar jelas";
            $("p", verdict).textContent = "Mikrofon siap dipakai. Kamu bisa lanjut ke latihan pertama.";
            $("#start").removeAttribute("aria-disabled");
          } else if (quietFrames > 600 && loudFrames < 10) {
            verdict.className = "alert alert-warn"; verdict.hidden = false;
            $("h3 span", verdict).textContent = "Suaramu terlalu pelan";
            $("p", verdict).textContent = "Dekatkan mikrofon atau bicara sedikit lebih keras, lalu baca kalimatnya sekali lagi.";
            quietFrames = 0;
          }
        });
        show("ok", "Akses mikrofon diizinkan", "Kami hanya mendengarkan saat tombol mikrofon menyala.");
        device.textContent = label || "Mikrofon bawaan";
        allowBtn.hidden = true;
        test.hidden = false;
      } catch (err) {
        const m = micErrorMessage(err);
        const isBlocked = err && (err.name === "NotAllowedError" || err.name === "SecurityError");
        show("error", m.title, isBlocked ? "Browser menolak akses mikrofon. Ikuti tiga langkah di bawah, lalu coba lagi." : m.body);
        allowBtn.disabled = false;
        allowBtn.textContent = "Coba izinkan lagi";
        blocked.hidden = !isBlocked;
      }
    }
    allowBtn.addEventListener("click", begin);
    $("#start").addEventListener("click", (e) => {
      if ($("#start").getAttribute("aria-disabled") === "true") {
        e.preventDefault();
        $("#start-help").hidden = false;
      }
    });
    window.addEventListener("pagehide", () => Mic.stop());
  }

  /* ---------- Page: Onboarding tujuan ---------- */
  function initOnboarding() {
    const form = $("#goal-form"), err = $("#goal-error");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!$$("input[name=tujuan]:checked", form).length) {
        err.hidden = false;
        $("input[name=tujuan]", form).focus();
        return;
      }
      window.location.href = "cek-mikrofon.html";
    });
    form.addEventListener("change", () => { if ($$("input[name=tujuan]:checked", form).length) err.hidden = true; });
  }

  /* ---------- Page: Hasil sesi ---------- */
  function initResult() {
    const burst = $(".burst");
    if (burst) for (let i = 0; i < 12; i++) { const d = document.createElement("i"); d.style.setProperty("--a", i * 30 + "deg"); burst.appendChild(d); }
    const out = $("#confidence-out");
    $$("input[name=yakin]").forEach((r) => r.addEventListener("change", () => {
      const v = Number(r.value);
      out.textContent = v <= 2 ? "Terima kasih sudah jujur. Besok kami mulai dengan latihan yang lebih pendek." : v === 3 ? "Oke. Kita ulangi bagian yang belum mantap besok." : "Mantap! Besok coba skenario yang sedikit lebih menantang.";
      out.hidden = false;
    }));
  }

  /* ---------- Page: Beranda (empty state preview for a new learner) ---------- */
  function initHome() {
    if (!new URLSearchParams(location.search).has("kosong")) return;
    $("#bank-list").hidden = true;
    $("#bank-empty").hidden = false;
    $("#bank-sub").textContent = "Belum ada kata";
    const demo = $("#bank-demo");
    demo.textContent = "Kembali ke contoh data";
    demo.href = "index.html#bank";
  }

  const page = document.body.dataset.page;
  ({ home: initHome, drill: initDrill, roleplay: initRoleplay, mic: initMicCheck, onboarding: initOnboarding, result: initResult }[page] || (() => {}))();
})();
