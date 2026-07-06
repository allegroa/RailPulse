import sys
from graph_builder import load_data, build_graph, export_graph

def main():
    try:
        stations, lines = load_data()
        G = build_graph(stations, lines)
        export_graph(G)
        print("Graph updated successfully.")
    except Exception as e:
        print(f"Error updating graph: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
