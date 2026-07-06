"""
main.py — Taipei Metro TaipeiScaffold entry point
Generates graph.json from the curated data, validates station count, and
copies the frontend to exports/ as a standalone SVG-ready bundle.
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT / 'backend'))

from graph_builder import load_data, build_graph, export_graph, shortest_path_example


def validate(stations: dict, lines: list):
    all_stn = set(stations.keys())
    errors = []
    for ln in lines:
        for sid in ln['stations']:
            if sid not in all_stn:
                errors.append(f"Line {ln['id']}: unknown station '{sid}'")
        for b in ln.get('branches', []):
            for sid in b['stations']:
                if sid not in all_stn:
                    errors.append(f"Line {ln['id']} branch: unknown station '{sid}'")
    if errors:
        print("VALIDATION ERRORS:")
        for e in errors:
            print(f"  ✗ {e}")
        return False
    print(f"Validation OK — {len(stations)} stations, {len(lines)} lines")
    return True


def copy_to_exports():
    html_src = ROOT / 'frontend' / 'index.html'
    css_src = ROOT / 'frontend' / 'style.css'
    js_src = ROOT / 'frontend' / 'app.js'
    img_src = ROOT / 'frontend' / 'Taipei_Metro_official_map_optimised.png'

    dst = ROOT / 'exports' / 'taipei_metro_standalone.html'
    img_dst = ROOT / 'exports' / 'Taipei_Metro_official_map_optimised.png'

    with open(html_src, encoding='utf-8') as f:
        html = f.read()
    with open(css_src, encoding='utf-8') as f:
        css = f.read()
    with open(js_src, encoding='utf-8') as f:
        js = f.read()

    html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

    dst.parent.mkdir(parents=True, exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Exported -> {dst}")

    if img_src.exists():
        shutil.copy2(img_src, img_dst)
        print(f"Exported image -> {img_dst}")


if __name__ == '__main__':
    print("=== TaipeiScaffold Build ===")
    stations, lines = load_data()
    if not validate(stations, lines):
        sys.exit(1)
    G = build_graph(stations, lines)
    export_graph(G)
    shortest_path_example(G)
    copy_to_exports()
    print("\nDone. Open frontend/index.html in a browser.")
