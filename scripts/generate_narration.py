"""
Generates real local Polish neural narration MP3 files for all 12 Acts (Popular & Academic registers)
using edge-tts (pl-PL-MarekNeural & pl-PL-ZofiaNeural) + FFprobe/FFmpeg duration measurement.
Writes public/audio/narration/manifest.json consumed by NarrationEngine.ts.
"""
import asyncio
import json
import os
import re
import subprocess
import edge_tts

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
TS_SCRIPT_PATH = os.path.join(ROOT_DIR, "src", "science", "NarrationScript.ts")
OUT_BASE = os.path.join(ROOT_DIR, "public", "audio", "narration")

VOICE_MAP = {
    "popular": "pl-PL-MarekNeural",
    "academic": "pl-PL-ZofiaNeural",
}


def extract_segments_from_ts():
    with open(TS_SCRIPT_PATH, "r", encoding="utf-8") as f:
        src = f.read()

    # Extract each { id: '...', actId: N, startSec: N, endSec: N, ... } object cleanly
    pattern = re.compile(
        r"\{\s*id:\s*'([^']+)'\s*,\s*"
        r"actId:\s*(\d+)\s*,\s*"
        r"startSec:\s*(\d+(?:\.\d+)?)\s*,\s*"
        r"endSec:\s*(\d+(?:\.\d+)?)\s*,\s*"
        r"popularDisplayPl:\s*'((?:[^'\\]|\\.)*)'\s*,\s*"
        r"popularTtsPl:\s*'((?:[^'\\]|\\.)*)'\s*,\s*"
        r"academicDisplayPl:\s*'((?:[^'\\]|\\.)*)'\s*,\s*"
        r"academicTtsPl:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*\}",
        re.DOTALL,
    )
    segments = []
    for m in pattern.finditer(src):
        segments.append({
            "id": m.group(1),
            "actId": int(m.group(2)),
            "startSec": float(m.group(3)),
            "endSec": float(m.group(4)),
            "popularDisplayPl": m.group(5).replace("\\'", "'"),
            "popularTtsPl": m.group(6).replace("\\'", "'"),
            "academicDisplayPl": m.group(7).replace("\\'", "'"),
            "academicTtsPl": m.group(8).replace("\\'", "'"),
        })
    if not segments:
        raise RuntimeError("Failed to parse segments from NarrationScript.ts")
    return segments


def get_mp3_duration(mp3_path: str) -> float:
    try:
        out = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                mp3_path,
            ],
            stderr=subprocess.STDOUT,
        ).decode("utf-8").strip()
        return round(float(out), 2)
    except Exception:
        return 0.0


async def synthesize_one(text: str, voice: str, out_path: str, rate: str = "-4%"):
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate)
    await comm.save(out_path)


async def main_async():
    segments = extract_segments_from_ts()
    print(f"[NARRATION] Parsed {len(segments)} segments from NarrationScript.ts")
    manifest = {"voices": VOICE_MAP, "segments": []}

    for reg in ("popular", "academic"):
        os.makedirs(os.path.join(OUT_BASE, reg), exist_ok=True)

    sem = asyncio.Semaphore(4)

    async def process_pair(seg):
        entry = {
            "id": seg["id"],
            "actId": seg["actId"],
            "startSec": seg["startSec"],
            "endSec": seg["endSec"],
            "popularDisplayPl": seg["popularDisplayPl"],
            "academicDisplayPl": seg["academicDisplayPl"],
            "files": {},
            "durations": {},
        }
        for reg, voice in VOICE_MAP.items():
            tts_text = seg["popularTtsPl"] if reg == "popular" else seg["academicTtsPl"]
            rel_url = f"/audio/narration/{reg}/{seg['id']}.mp3"
            out_path = os.path.join(OUT_BASE, reg, f"{seg['id']}.mp3")
            async with sem:
                if not os.path.exists(out_path) or os.path.getsize(out_path) < 1000:
                    await synthesize_one(tts_text, voice, out_path, rate="-3%" if reg == "popular" else "-2%")
            dur = get_mp3_duration(out_path)
            entry["files"][reg] = rel_url
            entry["durations"][reg] = dur
        return entry

    results = await asyncio.gather(*(process_pair(s) for s in segments))
    manifest["segments"] = results

    manifest_path = os.path.join(OUT_BASE, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"[NARRATION] Wrote {manifest_path} with {len(results)} bilingual-register segments.")


if __name__ == "__main__":
    asyncio.run(main_async())
