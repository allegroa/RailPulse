import http.server
import json
import re
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT / 'backend'))

from graph_builder import load_data, build_graph, export_graph, shortest_path_example
from main import copy_to_exports, validate

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/save-station':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                sid = data.get('id')
                x = int(data.get('x'))
                y = int(data.get('y'))
                
                # 1. Update data/stations.json
                stations_file = ROOT / 'data' / 'stations.json'
                with open(stations_file, 'r', encoding='utf-8') as f:
                    stations = json.load(f)
                
                if sid in stations:
                    stations[sid]['x'] = x
                    stations[sid]['y'] = y
                    
                with open(stations_file, 'w', encoding='utf-8') as f:
                    json.dump(stations, f, indent=2, ensure_ascii=False)
                
                # 2. Update frontend/app.js
                app_js_file = ROOT / 'frontend' / 'app.js'
                with open(app_js_file, 'r', encoding='utf-8') as f:
                    app_js = f.read()
                
                pattern = rf"({sid}\s*:\s*{{.*?)x:\d+,\s*y:\d+(.*?}})"
                app_js = re.sub(pattern, rf"\g<1>x:{x}, y:{y}\g<2>", app_js)
                
                # Increment DB_VERSION to force cache invalidation in frontend
                db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
                if db_match:
                    new_ver = int(db_match.group(1)) + 1
                    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")
                
                with open(app_js_file, 'w', encoding='utf-8') as f:
                    f.write(app_js)
                
                # 3. Regenerate graph.json and exports
                print(f"[Server] Saved station {sid} at ({x}, {y})")
                stations_updated, lines_updated = load_data()
                validate(stations_updated, lines_updated)
                G = build_graph(stations_updated, lines_updated)
                export_graph(G)
                copy_to_exports()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "new_db_version": new_ver if db_match else None}).encode('utf-8'))
                return
            except Exception as e:
                print(f"[Server Error] {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
                return
        
        super().do_POST()

def run(port=8000):
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, CustomHTTPRequestHandler)
    print(f"[Server] TaipeiScaffold running at http://localhost:{port}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] stopped.")
        sys.exit(0)

if __name__ == '__main__':
    run()
