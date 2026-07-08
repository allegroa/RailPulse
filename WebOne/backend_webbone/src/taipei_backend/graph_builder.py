"""
graph_builder.py — Taipei Metro NetworkX graph builder
Reads stations.json + lines.json, builds adjacency graph, exports graph.json
"""
import json
import os
import networkx as nx

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
DATA = os.path.join(BASE, 'DATABASE', 'Taipei')


def load_data():
    with open(os.path.join(BASE, 'DATABASE', 'station.json'), encoding='utf-8') as f:
        stations_list = json.load(f)
        # Convert list to dict indexed by code
        stations = { s['code']: s for s in stations_list }
    with open(os.path.join(DATA, 'lines.json'), encoding='utf-8') as f:
        lines = json.load(f)
    return stations, lines


def build_graph(stations: dict, lines: list) -> nx.Graph:
    G = nx.Graph()

    # Add nodes
    for sid, s in stations.items():
        G.add_node(sid,
                   name_en=s.get('name_en', ''),
                   name_zh=s.get('name_zh', ''),
                   x=s.get('x', 0),
                   y=s.get('y', 0),
                   lines=s.get('LineName', []),
                   type=s.get('stationType', 'station'),
                   km=s.get('kmPosition', s.get('kmStart', 0.0)))

    def add_edges(id_list: list, line_id: str):
        for i in range(len(id_list) - 1):
            a, b = id_list[i], id_list[i + 1]
            if a in stations and b in stations:
                G.add_edge(a, b, line=line_id, weight=1)

    for ln in lines:
        add_edges(ln['stations'], ln['id'])
        for branch in ln.get('branches', []):
            seg = [branch['from']] + branch['stations']
            add_edges(seg, ln['id'])

    return G


def export_graph(G: nx.Graph):
    data = nx.node_link_data(G)
    out_path = os.path.join(DATA, 'graph.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"graph.json written — {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return out_path


def shortest_path_example(G: nx.Graph):
    """Print a sample shortest path (Tamsui → Taipei Zoo)."""
    try:
        path = nx.shortest_path(G, 'R28', 'BR01', weight='weight')
        print(f"\nSample route R28->BR01 ({len(path)-1} hops):")
        for nid in path:
            d = G.nodes[nid]
            print(f"  {nid:6s} {d.get('name_en','')}")
    except nx.NetworkXNoPath:
        print("No path found between R28 and BR01")


if __name__ == '__main__':
    stations, lines = load_data()
    G = build_graph(stations, lines)
    export_graph(G)
    shortest_path_example(G)
