#!/usr/bin/env python3
"""
Buat VOICE PACK VOICEVOX untuk MENSETSU (opsional, gratis) — dijalankan di komputer yang
menjalankan VOICEVOX Engine (http://127.0.0.1:50021). Hanya butuh Python 3 (tanpa pip).
ffmpeg (jika ada di PATH) dipakai untuk mengecilkan WAV → MP3; tanpa ffmpeg hasilnya .wav (lebih besar).

Hasil: audio/vv/mensetsu/{bidang}/NNN.mp3 + index.json  → dipakai js/mensetsu.js untuk
Mode Skrip & pertanyaan bank tanpa perlu VOICEVOX berjalan di HP siswa.

Pemakaian (dari folder root repo):
    python3 -I tools/mensetsu_voicepack.py                # semua bidang
    python3 -I tools/mensetsu_voicepack.py kaigo          # satu bidang
    python3 -I tools/mensetsu_voicepack.py --voice mochiko
Teks yang direkam = kalimat per kalimat (dipecah di '。'), sama persis dengan yang diucapkan aplikasi.
"""
import json, re, shutil, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = "http://127.0.0.1:50021"
DATA, OUT = ROOT / "data" / "mensetsu", ROOT / "audio" / "vv" / "mensetsu"

# Kalimat tetap (harus sama dengan js/mensetsu-engine.js)
FIXED = [
    "それでは、面接を始めます。よろしくお願いします。", "まず、自己紹介をお願いします。",
    "はい、ありがとうございます。", "そうですか。", "なるほど。", "分かりました。", "ありがとうございます。", "はい、そうですか。",
    "そうですか。もう少し教えてください。", "そうですか。もう少し考えてみてください。", "すみません、日本語でお願いできますか。",
    "大丈夫ですよ。インドネシア語でも大丈夫です。例を見てみましょう。では、この答えをもう一度、日本語で言ってみましょう。",
    "大丈夫ですよ。インドネシア語でも大丈夫です。では、この答えをもう一度、日本語で言ってみましょう。",
    "大丈夫ですよ。例を見てみましょう。では、この答えをもう一度、日本語で言ってみましょう。",
    "最後に、何か質問はありますか。", "本日の面接は以上です。ありがとうございました。",
    "ご質問ありがとうございます。申し訳ありません、その点は、まだ確認できていません。担当者にお聞きください。",
    "お時間になりましたので、そろそろ終わりにします。",
    "日本のどのような技術に興味がありますか。", "日本語は、どのように勉強していますか。", "その経験で、どんなことを学びましたか。",
    "ご家族のために、どんなことをしたいですか。", "体力を保つために、何かしていますか。", "どうして好きなのですか。",
    "お金のほかに、日本で働きたい理由はありますか。", "チームで働いたとき、どんなことが大切だと思いますか。",
]
split = lambda t: [x for x in re.split(r"(?<=。)", t) if x]

def http(url, data=None, method="POST", ctype=None):
    req = urllib.request.Request(url, data=data, method=method)
    if ctype: req.add_header("Content-Type", ctype)
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()

def pick_voice(name_key):
    vv = json.loads((ROOT / "audio" / "vv" / "voices.json").read_text(encoding="utf-8"))
    key = name_key or vv["roles"].get("pengumuman", "aoyama")   # sama dengan role yang dipakai SV.speak
    v = vv["voices"][key]
    spk = json.loads(http(ENGINE + "/speakers", method="GET"))
    s = next((x for x in spk if x["name"] == v["name"]), None)
    if not s: sys.exit(f"Karakter {v['name']} belum terpasang di VOICEVOX Engine.")
    st = next((x for x in s["styles"] if x["name"] == v["style"]), s["styles"][0])
    return key, v, st["id"]

def synth(text, v, sid):
    q = json.loads(http(f"{ENGINE}/audio_query?speaker={sid}&text={urllib.parse.quote(text)}"))
    q.update(speedScale=v.get("speed", 1) * 0.95, pitchScale=v.get("pitch", 0), intonationScale=v.get("intonation", 1), volumeScale=v.get("volume", 1))
    return http(f"{ENGINE}/synthesis?speaker={sid}", json.dumps(q).encode(), ctype="application/json")

def main():
    args = sys.argv[1:]; voice = None
    if "--voice" in args: i = args.index("--voice"); voice = args[i + 1]; del args[i:i + 2]
    keys = args or [p.stem for p in sorted(DATA.glob("*.json")) if p.stem != "index"]
    vkey, v, sid = pick_voice(voice); ff = shutil.which("ffmpeg"); ext = "mp3" if ff else "wav"
    print(f"Suara: {vkey} ({v['name']})  format: {ext}")
    for key in keys:
        bank = json.loads((DATA / f"{key}.json").read_text(encoding="utf-8"))
        texts = []
        for t in FIXED + [q["ja"] for q in bank["soal"]]:
            for s in split(t):
                if s not in texts: texts.append(s)
        d = OUT / key; d.mkdir(parents=True, exist_ok=True)
        idx = json.loads((d / "index.json").read_text(encoding="utf-8")) if (d / "index.json").exists() else {"voice": vkey, "clips": {}}
        n = 0
        for t in texts:
            if t in idx["clips"] and (d / idx["clips"][t]).exists(): continue
            wav = synth(t, v, sid); name = f"{len(idx['clips']) + 1:03d}.{ext}"
            if ff: wav = subprocess.run([ff, "-loglevel", "error", "-i", "-", "-ac", "1", "-b:a", "48k", "-f", "mp3", "-"], input=wav, capture_output=True, check=True).stdout
            (d / name).write_bytes(wav); idx["clips"][t] = name; n += 1
            print(f"  [{key}] {name}  {t[:30]}")
        idx["voice"] = vkey; (d / "index.json").write_text(json.dumps(idx, ensure_ascii=False), encoding="utf-8")
        print(f"{key}: {n} klip baru, total {len(idx['clips'])}")

if __name__ == "__main__":
    main()
