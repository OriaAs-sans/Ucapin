# Tech Stack for an English Speaking-Practice Website (STT, Pronunciation Assessment, AI Conversation, TTS)

Research date: 2026-11-16. All prices are USD list or pay-as-you-go rates and **may change**. Several vendor pages (Azure, SpeechSuper, Speechace, ELSA) did not show live numbers, so some figures come from third parties and are flagged. Re-check pricing pages before budgeting.

## Pronunciation assessment APIs (Azure, SpeechSuper, Speechace, ELSA, Google, others)

### Takeaway
Azure AI Speech Pronunciation Assessment is the strongest default for a startup. It is self-serve and costs about the same as standard STT (about $1/audio hour). It returns accuracy, fluency, completeness and miscue scores, plus scores for each phoneme (IPA), syllable and word. Prosody and content scores (vocabulary, grammar, topic) and unscripted mode are also available, but prosody, content scoring and syllables are en-US only. SpeechSuper is the main specialist alternative, with IELTS/PTE-style scoring, stress and linking, and US/UK/Indian English. Speechace's pricing is mostly third-party or quote-based. ELSA has no clear public developer API.

### Cited Findings
**Azure AI Speech: Pronunciation Assessment**
- Three scenarios: Reading (scripted, reference text given), Speaking (unscripted, the learner talks on a topic with no reference text) and Gaming (tongue twisters with syllable scores) — [MS Learn: PA tool](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool)
- Scores at the full-text level: Accuracy, Fluency, Completeness and Prosody, combined into an overall PronScore. Word-level miscue detection covers omission, insertion, repetition and mispronunciation. Phoneme-level accuracy is included. In unscripted mode a Content score (Vocabulary, Grammar, Topic) is added — [MS Learn: PA tool](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool)
- Prosody covers stress, intonation, speaking speed and rhythm. It adds error types such as Unexpected break, Missing break and Monotone, with configurable monotone thresholds — [MS Learn: PA tool](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool); [MS Learn: how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- "Content and prosody assessments are only available in the en-US locale." Syllable-level results are also en-US only. Phonemes come in IPA or SAPI format. Offset and Duration are given in 100-ns units, which lets you highlight timing in the UI — [MS Learn: how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- Unscripted assessment uses a different STT model from standard Azure STT. If you need highly accurate text, Microsoft recommends calling Azure STT first to get a transcript, then running a scripted assessment against it — [MS Learn: how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- For audio over 30 seconds, use continuous mode. `EnableMiscue` is not supported in continuous mode. Streaming mode is supported, and the JS SDK has samples. The Go SDK does not support pronunciation assessment — [MS Learn: how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- Recommended length for the unscripted (speaking) scenario is 15 seconds (about 50 or more words) to 10 minutes. A topic score needs at least 3 sentences — [MS Learn: PA tool](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool)
- Pricing: the baseline "costs the same as speech to text for Standard or commitment tier". Accuracy, fluency, completeness and miscue are included in the baseline. **Prosody is an add-on charge** — [MS Learn: PA tool](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool). The add-on rate showed as "$-" on the Azure pricing page when fetched — [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
- Standard real-time STT costs about $1/audio hour (third-party, Oct 2026) — [Speechmatics comparison](https://www.speechmatics.com/how-we-compare/microsoft-azure-speech-alternative); [Developers Digest](https://www.developersdigest.tech/models/speech/azure). A Microsoft Q&A thread conflicts: the question cites $1/hr and the accepted answer says $1.32/hr, billed per second (an 8-second clip costs about $0.002–0.003) — [MS Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat)
- Free tier F0: 5 audio hours/month of STT and 0.5M neural TTS characters/month — [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)

**SpeechSuper**
- Languages: English (British, US and Indian), Mandarin, Japanese, Korean, Spanish, German, French and Russian. Scripted modes: word, sentence (2–200 words) and paragraph (over 200 words). Feedback includes phoneme scores, mispronunciation, syllable stress and linking. A semi-scripted mode covers PTE. An unscripted IELTS Speaking mode scores overall, fluency, grammar, vocabulary and pronunciation. A "Transcribe and Score" mode is also offered. The iOS/Android SDK is "offline-ready" — [SpeechSuper](https://www.speechsuper.com/)
- The GitHub samples mention liaison and loss-of-plosion detection — [SpeechSuper API samples](https://github.com/speechsuper/SpeechSuper-API-Samples)
- Pricing (third-party, possibly stale): word $0.004, sentence $0.006 and paragraph $0.008 per request, with a $20 monthly minimum. One directory says its data was last updated in 2022 — [SaaSworthy](https://www.saasworthy.com/product/speechsuper/pricing); [Spotsaas](https://spotsaas.com/product/speechsuper). The official site shows a free trial button but no prices — [SpeechSuper](https://www.speechsuper.com/)

**Speechace**
- The API is split into v9 BASIC (pronunciation) and v9 PRO (fluency) — [Speechace docs](https://api-docs.speechace.com/llms.txt)
- G2 says the vendor has not published pricing — [G2](https://www.g2.com/products/speechace-api/pricing). FitGap gives plans from $40/month, extra requests at $0.008 per 15-second clip, and Pro at $250/month for 30,000 calls of 15 seconds. A second FitGap listing says Pro is $80/month for 10,000 requests. The figures conflict — [FitGap](https://us.fitgap.com/products/speechace-api); [FitGap alt](https://us.fitgap.com/products/003877/speechace-api)

**ELSA**
- No official developer API docs or pricing were found. Sources conflict on whether a public API exists: GetApp says it "does not have an API available", while Software Advice says "pricing available upon request" — [GetApp](https://www.getapp.com/sales-software/a/elsa-speech-recognition-api/); [Software Advice](https://www.softwareadvice.com/speech-recognition/elsa-speech-recognition-api-profile/); [Speech Tech Mag](https://www.speechtechmag.com/Articles/News/Speech-Technology-News/ELSA-Releases-Speech-Recognition-and-Feedback-Engine-API-151128.aspx)

### Inferences
- Azure works out to about $0.017/minute of assessed audio, so a 10-second drill costs about $0.003. On the free tier, 5 hours/month is roughly 1,800 ten-second attempts, which is enough for an MVP or pilot.
- Most target learners are Indonesian, and en-US prosody and content scoring is acceptable for them. Choose en-US as the "model accent" unless British English is a product requirement. If it is, SpeechSuper (en-GB) is the better choice.
- Pattern for free conversation: use a general STT (or Azure STT) to get the transcript, then run a *scripted* Azure assessment on that transcript. Microsoft itself recommends this for accuracy.
- Scores are model estimates calibrated to "native-speaker" norms. Present them as guidance, not as certified IELTS bands.

### Gaps
- I could not confirm the Azure prosody add-on price, or any per-call latency figures for Azure, SpeechSuper or Speechace, from official sources.
- I did not research Google Cloud's pronunciation assessment offering in depth. I found no evidence of a Google Cloud equivalent to Azure's PA. Other vendors (Language Confidence, Speechmatics, open-source GOP/wav2vec2 phoneme models) were not researched.
- I could not find official SpeechSuper or Speechace prices. All the figures above are third-party.

## Speech-to-text for free conversation (Whisper / gpt-4o-transcribe, Deepgram, AssemblyAI, Web Speech API)

### Takeaway
Cloud STT is now cheap, at roughly $0.003–0.008/min. OpenAI gpt-4o-mini-transcribe ($0.003/min) and AssemblyAI Universal-2 ($0.15/hr) are the cheapest for batch transcription of recorded turns. Deepgram Nova-3 or Flux, or AssemblyAI Universal-Streaming, suit streaming with live turn detection. The browser Web Speech API costs nothing but is unreliable: Chrome sends audio to Google, Firefox only supports it behind a flag, and Safari's behaviour is unclear. Keep it for low-stakes UX hints only.

### Cited Findings
- OpenAI per-minute prices: gpt-4o-transcribe $0.006/min, gpt-4o-mini-transcribe $0.003/min, whisper-1 $0.006/min, gpt-transcribe $0.0045/min. Live transcription models (gpt-live-transcribe, gpt-realtime-whisper) cost $0.017/min — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Deepgram pay-as-you-go: Nova-3 pre-recorded $0.0043/min (monolingual) or $0.0052/min (multilingual). Nova-3 streaming $0.0048/min or $0.0058/min. Flux streaming (English) $0.0065/min. New accounts get $200 in free credit that does not expire and needs no card — [Deepgram pricing](https://deepgram.com/pricing)
- AssemblyAI: Universal-2 pre-recorded $0.15/hr, Universal-3.5 Pro $0.21/hr, Universal-Streaming (English or multilingual) $0.15/hr, Universal-3.6 Pro Realtime $0.45/hr. Streaming is billed on session time, including idle time. New accounts get $50 free. The page says AssemblyAI's Voice Agent API is being retired — [AssemblyAI pricing](https://www.assemblyai.com/pricing)
- ElevenLabs Scribe v2/v3 costs $0.20/hr and Scribe Realtime $0.22/hr — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Gemini 3.5 Transcribe Live audio input costs $0.005/min. It is free on the free tier, but free-tier content is used to improve Google products — [Google AI pricing](https://aistudio.google.com/docs/pricing)
- Latency benchmarks conflict. One citation puts Deepgram Nova-3 time-to-first-token at about 150 ms. A May 2026 Coval benchmark reports median TTFT from 992 ms (Nova-3) to 2,080 ms (ElevenLabs Scribe v2), likely because of different methods — [Voxbooster summary](https://voxbooster.com/blog/voice-ai-agent-time-to-first-audio-byte-latency-statistics-2026)
- Web Speech API (SpeechRecognition): Chromium and Safari ship the prefixed `webkitSpeechRecognition`. Firefox has it only behind a flag. Chrome sends audio to Google's servers. A Mozilla "intent to prototype" for on-device recognition exists — [TestMu](https://www.testmuai.com/learning-hub/speech-recognition-api-browser-support/); [W3C TAG review #1038](https://tag-github-bot.w3.org/gh/w3ctag/design-reviews/1038); [Mozilla dev-platform](https://groups.google.com/a/mozilla.org/g/dev-platform/c/6f4l8P9hO6o)
- An Aug 2026 test on macOS 26 found that Safari prompts about sending data to Apple and that recognition fails offline — [addpipe blog](https://blog.addpipe.com/apple-speechanalyzer-api.md)
- The on-device spec adds `processLocally` and `available()`, and MDN documents `processLocally` — [MDN: Using the Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API). I found no confirmed list of browsers that ship it.

### Inferences
- Web Speech API transcripts also **auto-correct learner mistakes** toward likely words. That makes them a poor fit for language-learning feedback, where you want to see what the learner actually said. They also send audio to Google or Apple without your own privacy terms.
- For an Indonesian learner base, test accented-English accuracy on your own sample (20–50 learner clips) before choosing. Vendor WER figures are measured on native speech.

### Gaps
- I found no independent accented-English (Indonesian L1) WER benchmark across vendors.
- The gpt-4o-transcribe streaming latency figure was not verified.

## Real-time voice conversation (OpenAI Realtime, Gemini Live, ElevenLabs Agents, LiveKit/Pipecat, Claude + STT + TTS)

### Takeaway
There are two architectures. (1) Speech-to-speech (S2S): OpenAI gpt-realtime(-mini) or Gemini Live. It has the lowest latency and is simplest, but you get less control and less transparency. (2) A cascaded pipeline (STT → LLM such as Claude/GPT/Gemini → TTS), orchestrated by LiveKit Agents or Pipecat. It is cheaper, easier to log and grade, and lets you swap vendors. For a learning app the cascade has an extra benefit: you get the learner's transcript to analyse (grammar or pronunciation) for free. Gemini Live is currently the cheapest S2S option, at about $0.005/min input and $0.018/min output audio.

### Cited Findings
- OpenAI Realtime audio prices per 1M tokens: gpt-realtime, gpt-realtime-1.5, -2 and -2.1 cost $32 input / $64 output. gpt-realtime-mini and gpt-realtime-2.1-mini cost $10 / $20. A separate product, gpt-live-1, costs $0.05/min (backend model and tool usage billed extra) — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Gemini Live (gemini-3.8-live, gemini-3.1-flash-live-preview): audio input $3.00/1M tokens or $0.005/min, audio output $12.00/1M or $0.018/min. Text costs $0.75 in / $4.50 out. Older gemini-2.5-flash-native-audio costs $3 / $12 for audio. Most Live models are free on the free tier, but free-tier data is used to improve products — [Google AI pricing](https://aistudio.google.com/docs/pricing)
- ElevenLabs Agents (Speech Engine pipeline) cost $0.08/min, and Realtime S2S costs $0.08/min plus LLM. Plans include minutes: 75 on Starter ($6) and 275 on Creator ($22) — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Deepgram Voice Agent API costs $0.075/min (Standard), $0.050/min if you bring your own LLM and TTS, and $0.163/min (Advanced) — [Deepgram pricing](https://deepgram.com/pricing)
- LiveKit Cloud: the Build plan is free, with 1,000 agent session minutes, 5 concurrent sessions and $2.50 in inference credit. Ship starts at $50/month for 5,000 minutes, then $0.01/min. WebRTC costs $0.0005 per participant-minute. The Agents framework and media server are open source and can be self-hosted — [LiveKit pricing](https://livekit.com/pricing)
- Claude API (per 1M tokens, in/out): Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20. Cache hits cost $0.10 (Haiku 4.5, Sonnet 5.5) — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing). Cheap OpenAI text models: gpt-5-nano $0.05/$0.40, gpt-5-mini $0.25/$2.00 — [OpenAI pricing](https://developers.openai.com/api/docs/pricing). Gemini 3.5 Flash-Lite: $0.30/$2.50 — [Google AI pricing](https://aistudio.google.com/docs/pricing)
- Latency, from vendor claims: cascaded time-to-first-audio (TTFA) is about 600–1,200 ms, while warm S2S is about 300–500 ms — [FutureAGI](https://futureagi.com/blog/cascaded-voice-ai-vs-speech-to-speech-2026/). Inworld argues that a well-engineered cascade can beat some S2S models — [Inworld](https://inworld.ai/resources/cascaded-vs-speech-to-speech-voice-architecture). Twilio's targets: STT 350 ms, LLM TTFT 375 ms, TTS TTFB 100 ms, for about 1.1 s mouth-to-ear (secondary source) — [Voxbooster](https://voxbooster.com/blog/voice-ai-agent-time-to-first-audio-byte-latency-statistics-2026)
- In a vendor test, S2S agents completed only 26–38% of tasks with background noise and varied accents, against 85% for a text-based agent — [JustCall](https://justcall.io/blog/speech-to-speech-vs-cascaded-voice-agents.html)
- Other overviews of the trade-offs — [Deepgram blog](https://deepgram.com/blog/real-time-voice-ai-stack-agents-architecture-guide); [Gradium](https://gradium.ai/content/cascaded-voice-agent-vs-speech-to-speech-2026)

### Inferences
- **Per-minute estimates** (my calculations, not vendor figures). They assume a 50/50 split between user and AI speech, and OpenAI's long-standing rates of about 600 input audio tokens and 1,200 output audio tokens per minute (not re-verified this session):
  - gpt-realtime: about $0.019/min input audio + $0.077/min output audio, so about $0.05/conversation-minute *before* re-billed context. Context grows each turn, so real costs can be 1.5–2 times higher, partly offset by caching.
  - gpt-realtime-mini: about $0.015/conversation-minute plus context.
  - Gemini Live: about $0.0115/conversation-minute (0.5 × $0.005 + 0.5 × $0.018) plus context.
  - Cascade (Deepgram Nova-3 streaming + Claude Haiku 4.5 + OpenAI tts-1 or Azure neural TTS): STT about $0.0024, LLM about $0.002–0.005, TTS about $0.007 (450 chars per AI-minute at $15/1M). Total about **$0.012–0.015/conversation-minute**, plus LiveKit ($0.01/min after the free 1,000 minutes, or $0 if self-hosted).
- For a student or startup MVP, a turn-based (push-to-talk) cascade is much simpler to build and is fine for practice. It skips WebRTC and barge-in handling. Real-time duplex (LiveKit + S2S) can wait for v2.
- Pick a Claude, GPT or Gemini model as the "tutor brain" based on prompt-following quality and how well it handles corrections at an Indonesian learner's CEFR level. Cost differences at this scale are small.

### Gaps
- I found no independent, same-method latency benchmark across OpenAI Realtime, Gemini Live and ElevenLabs. The Codebridge 499-call study exists, but I did not read its results — [Codebridge](https://www.codebridge.tech/articles/voice-ai-phone-agents-latency-benchmark)
- I did not fetch Pipecat or Daily pricing. Pipecat is open-source and self-hosted, so infrastructure is the only cost.
- I could not confirm the current audio tokens per minute for gpt-realtime-2.x.

## TTS for model pronunciation (Azure, ElevenLabs, OpenAI, Google)

### Takeaway
For "listen to a native model" features, Azure Neural TTS ($15/1M chars, 0.5M chars/month free) is the best fit. It has many en-US, en-GB and other English voices, SSML for slow speech and phoneme control, and the same vendor as pronunciation assessment. OpenAI tts-1 costs the same ($15/1M). ElevenLabs is the most natural-sounding but costs about 2.7–5 times more. Cache the generated audio for fixed lesson content so you pay only once.

### Cited Findings
- Azure Neural TTS: about $15/1M characters (Costbench, July 2026) and Neural HD about $22/1M (third-party) — [Costbench](https://costbench.com/software/ai-voice-tools/microsoft-speech/); [Developers Digest](https://www.developersdigest.tech/models/speech/azure). The free tier includes 0.5M chars/month — [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
- OpenAI: tts-1 $15/1M characters, tts-1-hd $30/1M, gpt-4o-mini-tts $0.60/1M text tokens + $12/1M audio tokens — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- ElevenLabs: v4, v3 and Multilingual v2 cost $0.08/1K characters ($80/1M). Flash/Turbo and v3 Conversational cost $0.04/1K ($40/1M). The free plan includes 10K characters — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Google Gemini TTS: gemini-3.8-flash-tts costs $0.50/1M text input + $9/1M audio output tokens, rising to $1 / $18 on 2027-01-01. gemini-3.8-flash-lite-tts costs $6/1M audio output (rising to $12) — [Google AI pricing](https://aistudio.google.com/docs/pricing)
- Deepgram Aura-2 costs $0.030/1K characters — [Deepgram pricing](https://deepgram.com/pricing)

### Inferences
- **Google Gemini TTS prices double on 1 Jan 2027.** This is a confirmed scheduled change worth flagging.
- **Slow playback:** Azure SSML `<prosody rate="-30%">` and per-word `<phoneme alphabet="ipa">` are standard SSML features. I did not fetch a doc confirming them this session, so verify against the Azure SSML docs. An alternative is to play cached normal-speed audio with `audio.playbackRate = 0.75` and `preservesPitch`, which is free.
- Lesson sentences are static, so you can pre-generate the TTS once and serve it from a CDN. Runtime TTS cost then only applies to AI conversation replies.

### Gaps
- I did not verify Google Cloud Text-to-Speech (Chirp 3 HD / WaveNet) pricing or voice counts, or Azure's English voice count.

## Browser audio capture, privacy and Indonesian UU PDP

### Takeaway
Use `getUserMedia` + `MediaRecorder` for turn recordings, an `AnalyserNode` (Web Audio) for waveform and level meters, and an AudioWorklet to stream 16 kHz PCM when an SDK needs raw audio. Under UU PDP (Law 27/2022), voice recordings are personal data. Recordings used for speaker identification can be "specific" (biometric) data, which needs express, recorded consent, a DPIA for high-risk processing, 72-hour breach notice, and consent or safeguards for transfers abroad (Azure, OpenAI and Google typically process outside Indonesia). Collect the minimum, keep it short, and make storing recordings opt-in.

### Cited Findings
- UU PDP took effect on 17 October 2022, with a two-year transition to October 2024 — [Norton Rose Fulbright](https://nortonrosefulbright.com/en/knowledge/publications/31bce8f0/highlights-of-indonesias-personal-data-protection-law)
- "Specific" personal data includes biometrics, health, genetics, criminal records, **children's data** and financial data. Consent must be express and written or recorded (electronically or manually) — [Norton Rose Fulbright](https://nortonrosefulbright.com/en/knowledge/publications/31bce8f0/highlights-of-indonesias-personal-data-protection-law)
- A DPIA is required for high-risk processing (specific data, automated decisions, large scale, new technology). A DPO is required for large-scale monitoring or large-scale specific data. Breach notice to data subjects and the authority is due within 72 hours. Criminal fines are IDR 4–6 billion (up to 10 times for corporations), with 4–6 years' imprisonment — [Norton Rose Fulbright](https://nortonrosefulbright.com/en/knowledge/publications/31bce8f0/highlights-of-indonesias-personal-data-protection-law)
- Cross-border transfers are allowed if (1) the recipient country has equal or higher protection, (2) adequate and binding safeguards are in place, or (3) the data subject consents. Implementing regulation GR 33/2026 covers cross-border transfers in Arts. 148–168. One firm advises that relying on consent is safest until further rules are issued — [Rajah & Tann (via search summary)](https://www.rajahtannasia.com/viewpoints/pdp-law-updates-the-pdp-implementing-regulation-is-out-and-it-clarifies-some-key-questions-under-indonesias-pdp-law/); [Makarim & Taira](https://makarim.com/news/personal-data-protection-law-cross-border-transfer-requirements/pdf)
- Sources conflict on the timing of GR 33/2026 and the regulator. One search summary says it was signed 16 July 2026 and takes effect 16 January 2027, and another mentions amendment by Law No. 1 of 2026. The DPA had not been established as of early 2026, with the Ministry of Communication and Digital (MOCD/Komdigi) acting as de facto overseer — [Rajah & Tann update](https://www.rajahtannasia.com/viewpoints/indonesias-pdp-law-updates-dpa-u-s-trade‑related-data-transfers-and-recent-court-rulings/); [ConsentStack](https://www.consentstack.io/regulations/id-pdp). The Rajah & Tann page returned 403, so I could not verify these details directly.
- Vendor data use: Gemini free-tier content "is used to improve Google's products", while paid-tier content is not — [Google AI pricing](https://aistudio.google.com/docs/pricing)

### Inferences
- **Browser capture** (standard Web API practice, not fetched this session):
  - `navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})` requires HTTPS and a user gesture.
  - MediaRecorder produces audio/webm;codecs=opus in Chrome and Firefox, and audio/mp4 in Safari. Check with `MediaRecorder.isTypeSupported` and transcode server-side if a vendor needs WAV/PCM.
  - Azure's JS Speech SDK can capture the mic directly in the browser using a short-lived token from your backend. Never ship the subscription key to the client.
  - Waveform: use `AudioContext` → `AnalyserNode.getByteTimeDomainData` drawn on a canvas, or libraries such as wavesurfer.js.
- Whether voice counts as biometric data probably depends on purpose. Pronunciation scoring is not identification, but the conservative reading treats it as specific data. Many learners may be minors (students), which triggers children's-data rules and parental consent. Have an Indonesian lawyer confirm this.
- Privacy design:
  - Process audio and discard it by default. Store only scores and transcripts.
  - Make "save my recordings to track progress" opt-in, with a retention limit (for example 90 days) and a delete button.
  - Use paid API tiers so vendors do not train on the data, and choose a regional deployment where available (for example an Azure Southeast Asia region).
  - Disclose your processors and the transfers abroad in the privacy policy.

### Gaps
- I did not verify the UU PDP administrative fine cap (commonly cited as up to 2% of annual revenue) from a fetched source.
- I could not confirm the exact status and effective date of GR 33/2026, because the sources conflict.
- I did not research Azure or OpenAI data residency options in Indonesia or Southeast Asia.
- The MDN details on MediaRecorder codec support and AudioWorklet were not fetched this session. They come from general knowledge.

## Recommended reference architecture and rough cost per active user

### Takeaway
MVP stack: a Next.js frontend; a Next.js API route or a small Node/Python backend that issues short-lived vendor tokens; Azure Speech for pronunciation drills and model-voice TTS; a turn-based cascade (cheap STT → Claude Haiku/Sonnet or gpt-5-mini → Azure or OpenAI TTS) for conversation; and Postgres (Supabase etc.) for scores. Estimated cost is about **$1–3 per active user per month** at 200 practice minutes/month. S2S real-time adds about $2–10/user depending on the model.

### Cited Findings (unit prices used)
- Azure STT/pronunciation assessment about $1/hr (third-party) — [Speechmatics](https://www.speechmatics.com/how-we-compare/microsoft-azure-speech-alternative); Azure free tier 5 hours of STT and 0.5M TTS chars — [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
- Deepgram Nova-3 streaming $0.0048/min — [Deepgram](https://deepgram.com/pricing); OpenAI gpt-4o-mini-transcribe $0.003/min and tts-1 $15/1M chars — [OpenAI](https://developers.openai.com/api/docs/pricing)
- Claude Haiku 4.5 $1/$5 per 1M tokens — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Gemini Live $0.005/min in, $0.018/min out — [Google AI pricing](https://aistudio.google.com/docs/pricing); LiveKit free 1,000 agent minutes — [LiveKit](https://livekit.com/pricing)

### Inferences
**Architecture (MVP, turn-based):**
1. **Frontend (Next.js/React):** `getUserMedia` + MediaRecorder, a waveform drawn with `AnalyserNode`, and push-to-talk. The Azure Speech JS SDK runs in the browser with an STS token fetched from `/api/speech-token`.
2. **Pronunciation drill:** the learner reads a reference sentence. Azure PA is scripted and set to Phoneme granularity, IPA and en-US, with prosody on. The UI colours words and phonemes by score and offers "listen to model" playback (cached Azure TTS, slow mode via SSML rate or `playbackRate`).
3. **Free conversation:**
   - The learner's audio turn goes to STT (gpt-4o-mini-transcribe or Deepgram).
   - The transcript goes to the LLM tutor (Claude Haiku 4.5 / Sonnet, with a system prompt for CEFR level, role-play scenario and correction style). Prompt caching handles the long system prompt.
   - The reply text goes to TTS, which streams back.
   - Optionally, the same learner audio and transcript go through Azure scripted PA in parallel, giving pronunciation feedback after each turn.
   - After the session, the LLM writes a grammar and vocabulary summary.
4. **Backend:** Next.js route handlers on Vercel, or a container. Postgres stores users, attempts, scores and transcripts. Audio goes to object storage (S3/R2/Supabase Storage) *only if the user opts in*, with a TTL.
5. **v2 real-time:** a LiveKit Agents (or Pipecat) worker with Deepgram Flux → LLM → TTS, or Gemini Live / gpt-realtime-mini for duplex conversation with barge-in.

**Cost per active user per month.** Assumptions: 200 min/month total practice (10 min/day × 20 days), made up of 60 min pronunciation drills and 140 min conversation, with a 50/50 split between user and AI speech. Prices are list rates and will change.

| Component | Calculation | ≈ USD/month |
|---|---|---|
| Azure PA drills | 60 min × $1/hr | 1.00 |
| Conversation STT | 70 min × $0.003–0.0048 | 0.21–0.34 |
| Conversation PA (optional) | 70 min × $1/hr | 1.17 |
| LLM (Haiku 4.5) | about 140 turns × about 2K in + 150 out tokens | about 0.30–0.40 |
| TTS replies (Azure/OpenAI $15/1M) | 70 min × about 900 chars/min = 63K chars | about 0.95 |
| Model-voice TTS for lessons | pre-generated, cached | about 0 |
| **Total, cascade (no conversation PA)** | | **about $2.5** |
| **Total, cascade + conversation PA** | | **about $3.7** |
| Alternative: Gemini Live for the 140 min | 70 × 0.005 + 70 × 0.018 plus context | about $1.6–3 (+ drills $1) |
| Alternative: gpt-realtime-mini | about $0.015–0.03/min × 140 | about $2–4 (+ drills $1) |
| Alternative: gpt-realtime (full) | about $0.05–0.10/min × 140 | about $7–14 (+ drills $1) |
| Alternative: ElevenLabs Agents | $0.08/min × 140 | about $11 (+ drills $1) |

- TTS for conversation replies costs as much as STT and the LLM combined. To cut it, use Deepgram Aura-2 only if quality is acceptable (it is $30/1M, so more expensive), cache common phrases, or use Azure's free 0.5M chars during a pilot.
- **Free tiers alone can carry a pilot of about 20–50 users.** These include Azure 5 hours of STT/PA and 0.5M TTS chars per month, Deepgram $200 credit, AssemblyAI $50, LiveKit 1,000 minutes, and the Gemini free tier. Avoid the Gemini free tier for real user data, because Google uses it for training.
- Pricing for a learner subscription in Indonesia (say IDR 50–100K/month, about $3–6) leaves a thin margin at about $2.5–3.7 COGS. Daily-minute caps per plan are advisable.

### Gaps
- The token counts per conversation turn, characters per minute of speech, and audio tokens per minute are assumptions, not measured values. Measure them in a prototype.
- Hosting, database and egress costs were not estimated. They are typically small next to the speech APIs at this scale.
