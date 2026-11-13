/* =====================================================================
 * MENSETSU AI — serverless proxy (Netlify Function), 100% provider gratis.
 * ---------------------------------------------------------------------
 * - API key hanya ada di Environment Variables Netlify, TIDAK di frontend/repo.
 * - Hanya akun yang login (Firebase ID token valid) yang boleh memakai.
 * - Prompt dibangun DI SINI (bukan dari klien) → proxy tidak bisa dipakai
 *   sebagai chatbot umum; hanya untuk wawancara kerja Jepang.
 * - Banyak provider; kalau satu gagal / kena limit, otomatis coba berikutnya.
 *
 * Env (isi minimal SATU provider):
 *   GEMINI_API_KEY        (Google AI Studio, tier gratis)   opsi: GEMINI_MODEL
 *   GROQ_API_KEY          (Groq, tier gratis)               opsi: GROQ_MODEL
 *   OPENROUTER_API_KEY    (model ":free")                   opsi: OPENROUTER_MODEL
 *   CF_ACCOUNT_ID + CF_API_TOKEN (Cloudflare Workers AI)    opsi: CF_MODEL
 *   FIREBASE_API_KEY      (opsional; default = apiKey publik Firebase proyek ini)
 * Nama model bisa berubah dari sisi provider → ganti lewat env var, tanpa edit kode.
 * ===================================================================== */

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCPdZmpHeAOIRcFNSfoiLj-HmNTHettrQo";
const PER_PROVIDER_TIMEOUT_MS = 9000;
const MAX_BODY = 60000;

/* ---------------- provider ---------------- */
const PROVIDERS = {
  gemini: {
    label: "Google Gemini (gratis)",
    ready: () => !!process.env.GEMINI_API_KEY,
    async call({ system, messages, json, maxTokens, temperature, signal }) {
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature, maxOutputTokens: maxTokens, ...(json ? { responseMimeType: "application/json" } : {}) },
      };
      const r = await fetch(url, { method: "POST", signal, headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("gemini " + r.status);
      const j = await r.json();
      const t = j?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
      if (!t) throw new Error("gemini kosong");
      return t;
    },
  },
  groq: {
    label: "Groq (gratis)",
    ready: () => !!process.env.GROQ_API_KEY,
    call: (o) => openaiStyle("https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, process.env.GROQ_MODEL || "llama-3.3-70b-versatile", o, "groq"),
  },
  openrouter: {
    label: "OpenRouter (model gratis)",
    ready: () => !!process.env.OPENROUTER_API_KEY,
    call: (o) => openaiStyle("https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free", o, "openrouter"),
  },
  cloudflare: {
    label: "Cloudflare Workers AI (gratis)",
    ready: () => !!(process.env.CF_ACCOUNT_ID && process.env.CF_API_TOKEN),
    async call({ system, messages, maxTokens, temperature, signal }) {
      const model = process.env.CF_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
      const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
      const r = await fetch(url, { method: "POST", signal, headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.CF_API_TOKEN },
        body: JSON.stringify({ messages: [{ role: "system", content: system }, ...messages], max_tokens: maxTokens, temperature }) });
      if (!r.ok) throw new Error("cloudflare " + r.status);
      const j = await r.json();
      const t = j?.result?.response || "";
      if (!t) throw new Error("cloudflare kosong");
      return t;
    },
  },
};
async function openaiStyle(url, key, model, { system, messages, json, maxTokens, temperature, signal }, name) {
  const body = { model, messages: [{ role: "system", content: system }, ...messages], max_tokens: maxTokens, temperature, ...(json ? { response_format: { type: "json_object" } } : {}) };
  const r = await fetch(url, { method: "POST", signal, headers: { "Content-Type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(name + " " + r.status);
  const j = await r.json();
  const t = j?.choices?.[0]?.message?.content || "";
  if (!t) throw new Error(name + " kosong");
  return t;
}
const ORDER = ["gemini", "groq", "openrouter", "cloudflare"];

/* ---------------- bidang (karakter wawancara per bidang) ---------------- */
const BIDANG = {
  building_cleaning: { jp: "ビルクリーニング", id: "Building Cleaning", co: "ビルメンテナンス会社", fokus: "清掃手順、洗剤や機械の安全な扱い、衛生、報告・連絡・相談、早朝や夜間のシフト、丁寧な作業" },
  kaigo: { jp: "介護", id: "Kaigo", co: "介護施設", fokus: "利用者への思いやり、尊重、体力と腰痛予防、夜勤、チームケア、報連相、コミュニケーションと忍耐" },
  food_manufacturing: { jp: "飲食料品製造業", id: "Food Manufacturing", co: "食品工場", fokus: "衛生管理、HACCP、手洗い・異物混入防止、ライン作業の正確さと速さ、立ち仕事、交替勤務" },
  food_service: { jp: "外食業", id: "Food Service", co: "飲食店", fokus: "接客、笑顔、注文対応、衛生、忙しい時間帯の対応、お客様のクレーム、チームワーク、立ち仕事" },
  agriculture: { jp: "農業", id: "Agriculture", co: "農家・農業法人", fokus: "天候に左右される仕事、早朝の作業、体力、季節ごとの作業、自然・作物への関心、繁忙期、機械の安全" },
  construction: { jp: "建設", id: "Construction", co: "建設会社", fokus: "安全第一、ヘルメットなど保護具、指示を守ること、屋外作業、体力、高所、チーム作業、職人との連携" },
  accommodation: { jp: "宿泊", id: "Accommodation", co: "ホテル・旅館", fokus: "おもてなし、フロント対応、客室清掃、外国人のお客様への対応、シフト、身だしなみ、礼儀" },
  livestock: { jp: "畜産業", id: "Livestock", co: "畜産農家", fokus: "動物の世話、早朝・休日の作業、臭いや汚れへの耐性、衛生と病気予防、体力、命を扱う責任感" },
};

const SYS_BASE = (b, mode) => `あなたは日本の${b.co}（${b.jp}分野・特定技能）の面接官「田中（人事担当）」です。外国人候補者（インドネシア人、日本語は初級〜N4程度）を面接しています。
・丁寧で落ち着いた、現実の面接官らしい話し方。やさしい語彙を使う。難しい言葉は避ける。
・この分野（${b.jp}）の面接だけを行う。技術的な専門知識のクイズはしない。基本的な面接質問に集中。
・この分野の特徴: ${b.fokus}
・会社の具体的な情報（給料・勤務時間など）を作り話で答えない。情報がなければ「その点は、まだ確認できていません」と正直に答える。
・モード: ${mode === "latihan" ? "練習モード（候補者を助ける。ヒントや訂正を出してよい）" : mode === "lemah" ? "弱点克服モード（弱かった質問を中心に、候補者の答えを良くするよう導く）" : "本番モード（本物の面接。答えを教えず、訂正もしない）"}`;

function buildPrompt(task, p) {
  const b = BIDANG[p.bidang] || BIDANG.building_cleaning;
  const mode = ["latihan", "nyata", "lemah"].includes(p.mode) ? p.mode : "latihan";
  const hist = (p.history || []).slice(-8).map(h => `面接官: ${h.q}\n候補者: ${h.a}`).join("\n");

  if (task === "turn") {
    const system = `${SYS_BASE(b, mode)}

候補者の最新の答えに反応してください。必ず次のJSONだけを出力（説明文・コードブロック禁止）:
{"kind":"followup"|"next"|"clarify"|"help",
 "say":"面接官として日本語で話す文。短い相づち(はい、ありがとうございます／そうですか／なるほど／分かりました 等、毎回変える)＋ 追加質問 または 次の質問",
 "lang":"ja"|"id"|"mix",
 "bantuan":null | {"ja":"丁寧な面接向けの日本語の答え例","id":"その意味(インドネシア語)","kosakata":[["日本語","arti Indonesia"]],"pola":"重要な文型の簡単な説明(インドネシア語)"},
 "tips":"練習モードのみ: 短い改善ヒント(インドネシア語)。本番モードでは空文字"}

ルール:
- 答えがインドネシア語、または日本語で答えられないと言った → kind="help"。say は「大丈夫ですよ。インドネシア語でも大丈夫です。」系。bantuan に、候補者が言いたい内容を自然で丁寧な日本語に直して入れる(丸暗記ではなく学習用)。最後に say で「では、この答えをもう一度、日本語で言ってみましょう。」と促す。本番モードでは help を使わず、「もう一度、日本語でお願いできますか」と促す。
- 答えが短すぎる(1語など) → kind="followup", say =「そうですか。もう少し教えてください。」系。
- 答えが不明確 → kind="clarify", say =「すみません、もう少し詳しく説明していただけますか。」
- 質問とずれている → kind="clarify", say =「ありがとうございます。では、先ほどの質問について、もう一度お聞きしてもよろしいですか。」
- 答えが十分で、まだ掘り下げる価値あり(followupsUsed < 1)かつ自然な追加質問ができる → kind="followup"、答えの内容に基づく具体的な質問(例:「日本のどのような技術に興味がありますか。」)。
- それ以外 → kind="next"。say の最後に「次の質問」(nextQuestion)をそのまま入れる。nextQuestion が空なら say は締めくくりの相づちのみ。
- say は1〜3文、合計80文字程度まで。`;
    const user = `これまでの会話:\n${hist || "(なし)"}\n\n直前の質問: ${p.question}\n候補者の答え: ${p.answer}\n追加質問の回数(この質問): ${p.followupsUsed || 0}\nnextQuestion: ${p.nextQuestion || ""}`;
    return { system, user, json: true, maxTokens: 700, temperature: 0.7 };
  }

  if (task === "bantu") {
    const system = `${SYS_BASE(b, "latihan")}

あなたは日本語教師でもあります。インドネシア語の答え(または言いたいこと)を、${b.jp}分野の就職面接で使える自然で丁寧な日本語(です・ます体、初級〜N4の語彙)にしてください。丸暗記ではなく学習用です。
必ず次のJSONだけを出力:
{"ja":"日本語の答え(2〜3文)","id":"その意味(インドネシア語)","kosakata":[["日本語","arti"]],"pola":"重要な文型の説明(インドネシア語、短く)","coba":"では、この答えをもう一度、日本語で言ってみましょう。"}`;
    const user = `質問: ${p.question}\nインドネシア語の答え: ${p.answer}`;
    return { system, user, json: true, maxTokens: 700, temperature: 0.5 };
  }

  if (task === "tanya") {
    const system = `${SYS_BASE(b, mode)}

候補者が「最後の質問」を聞いてきました。会社の具体情報(給料・休日・人数など)は一切作らないこと。情報がなければ「申し訳ありません。その点はまだ確認できていません。」と言う。一般的な${b.jp}の仕事の話や、日本の職場のマナーなら答えてよい。
必ず次のJSONだけを出力: {"say":"面接官の答え(日本語、1〜3文)","id":"arti Indonesia singkat"}`;
    const user = `候補者の質問: ${p.answer}`;
    return { system, user, json: true, maxTokens: 400, temperature: 0.5 };
  }

  if (task === "evaluate") {
    const system = `あなたは日本語教師であり、${b.jp}分野の特定技能面接の採点者です。以下の面接記録を公正に評価してください。インドネシア語で書く(日本語の例文は日本語)。
重要:
- 答えの長さだけで採点しない。内容の関連性・文法・語彙・自然さ・丁寧さを見る。
- 発音・イントネーション・母音の長短などは、テキストからは判定できないので採点しない(artikulasi は null)。
- 「[ID]」付きの答えはインドネシア語で答えたもの → その質問は日本語で答えられなかったとして扱う。
必ず次のJSONだけを出力:
{"skor":{"isi":0-25,"tata_bahasa":0-20,"kosakata":0-15,"kelancaran":0-15,"kesopanan":0-10},
 "kelebihan":["..."],"kekurangan":["..."],
 "tidak_dijawab":["質問"],
 "kurang_tepat":[{"q":"質問","a":"答え","alasan":"..."}],
 "salah_tata_bahasa":[{"salah":"...","benar":"...","catatan":"..."}],
 "salah_kosakata":[{"salah":"...","benar":"...","catatan":"..."}],
 "saran":["..."],
 "jawaban_lebih_baik":[{"q":"質問","versi_siswa":"...","versi_baik":"日本語","arti":"Indonesia"}],
 "per_soal":[{"i":0,"skor":0-100}]}
kelancaran は文のつながり・言い淀み・短すぎる答えの多さから(音声ではなく書き起こしから)推定。`;
    const lines = (p.turns || []).map((t, i) => `#${i} 質問: ${t.q}\n答え${t.lang === "id" ? "[ID]" : ""}: ${t.a || "(無回答)"}`).join("\n\n");
    return { system, user: `分野: ${b.jp}\n面接記録:\n${lines}`, json: true, maxTokens: 2800, temperature: 0.3 };
  }
  return null;
}

/* ---------------- util ---------------- */
const RES = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: JSON.stringify(obj) });
function parseJson(t) {
  if (!t) return null;
  t = String(t).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  const a = t.indexOf("{"), z = t.lastIndexOf("}");
  if (a >= 0 && z > a) { try { return JSON.parse(t.slice(a, z + 1)); } catch (e) {} }
  return null;
}
async function verifyToken(idToken) {
  if (!idToken) return null;
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
    if (!r.ok) return null;
    const j = await r.json();
    const u = j?.users?.[0];
    return u && !u.disabled ? { uid: u.localId, email: u.email } : null;
  } catch (e) { return null; }
}
// Batas pemakaian per akun (best-effort; memori fungsi hilang saat cold start).
const HITS = new Map();
function limited(uid) {
  const now = Date.now(), win = 10 * 60 * 1000, max = 80;
  const a = (HITS.get(uid) || []).filter(t => now - t < win);
  if (a.length >= max) { HITS.set(uid, a); return true; }
  a.push(now); HITS.set(uid, a); return false;
}

/* ---------------- handler ---------------- */
exports.handler = async (event) => {
  const token = (event.headers.authorization || event.headers.Authorization || "").replace(/^Bearer\s+/i, "");
  const user = await verifyToken(token);
  if (!user) return RES(401, { error: "Harus login." });

  if (event.httpMethod === "GET") {
    return RES(200, { providers: ORDER.filter(k => PROVIDERS[k].ready()).map(k => ({ id: k, label: PROVIDERS[k].label })) });
  }
  if (event.httpMethod !== "POST") return RES(405, { error: "Method tidak didukung" });
  if ((event.body || "").length > MAX_BODY) return RES(413, { error: "Permintaan terlalu besar." });
  if (limited(user.uid)) return RES(429, { error: "Terlalu banyak permintaan. Tunggu beberapa menit." });

  let p; try { p = JSON.parse(event.body || "{}"); } catch (e) { return RES(400, { error: "JSON salah" }); }
  for (const k of ["question", "answer", "nextQuestion"]) if (typeof p[k] === "string") p[k] = p[k].slice(0, 800);
  // batasi ukuran tiap riwayat/transkrip (cegah penyalahgunaan & prompt membengkak)
  const cut = (x) => ({ ...x, q: String(x.q || "").slice(0, 200), a: String(x.a || "").slice(0, 600), lang: x.lang === "id" ? "id" : "ja" });
  if (Array.isArray(p.history)) p.history = p.history.slice(-8).map(cut);
  if (Array.isArray(p.turns)) p.turns = p.turns.slice(0, 40).map(cut);
  const built = buildPrompt(p.task, p);
  if (!built) return RES(400, { error: "task tidak dikenal" });

  const avail = ORDER.filter(k => PROVIDERS[k].ready());
  if (!avail.length) return RES(503, { error: "Belum ada provider AI yang dikonfigurasi di server (isi env var di Netlify)." });
  const pref = p.provider && p.provider !== "auto" && avail.includes(p.provider) ? [p.provider, ...avail.filter(k => k !== p.provider)] : avail;

  const errors = [];
  for (const k of pref) {
    const ac = new AbortController(); const to = setTimeout(() => ac.abort(), PER_PROVIDER_TIMEOUT_MS * (p.task === "evaluate" ? 2.5 : 1));
    try {
      const text = await PROVIDERS[k].call({ system: built.system, messages: [{ role: "user", content: built.user }], json: built.json, maxTokens: built.maxTokens, temperature: built.temperature, signal: ac.signal });
      clearTimeout(to);
      const data = parseJson(text);
      if (!data) { errors.push(k + ": bukan JSON"); continue; }
      return RES(200, { provider: k, data });
    } catch (e) { clearTimeout(to); errors.push(k + ": " + (e.name === "AbortError" ? "timeout" : e.message)); }
  }
  return RES(502, { error: "Semua provider gagal/limit.", detail: errors });
};
