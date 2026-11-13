#!/usr/bin/env python3
"""Bangun ulang data/mensetsu/*.json dari tools/mensetsu_src/ (edit soal di f1_*.py … f8_*.py & shared.py).
Pemakaian:  python3 -I tools/mensetsu_build.py
"""
import runpy, pathlib
runpy.run_path(str(pathlib.Path(__file__).resolve().parent / "mensetsu_src" / "build.py"), run_name="__main__")
