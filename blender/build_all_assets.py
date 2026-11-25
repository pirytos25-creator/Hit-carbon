"""
Master headless runner: builds all 5 GLB anatomical packs and renders multi-angle EEVEE verification sheets.
"""
import os
import subprocess
import sys

BLENDER_EXE = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SCRIPTS = [
    "gen_01_athlete_gym.py",
    "gen_02_cardiopulmonary.py",
    "gen_03_muscle_sarcomere.py",
    "gen_04_mitochondrion.py",
    "gen_05_brain_synapse.py",
    "render_verify.py",
]


def main():
    for script in SCRIPTS:
        full_path = os.path.join(SCRIPT_DIR, script)
        print(f"\n=== RUNNING BLENDER: {script} ===")
        cmd = [BLENDER_EXE, "--background", "--factory-startup", "--python-exit-code", "1", "--python", full_path]
        res = subprocess.run(cmd, check=True)
        print(f"=== FINISHED {script} (exit={res.returncode}) ===")


if __name__ == "__main__":
    main()
