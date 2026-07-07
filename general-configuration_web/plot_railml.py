import xml.etree.ElementTree as ET
import matplotlib.pyplot as plt
import os

# Parse the mock file
tree = ET.parse('mock_railml25.xml')
root = tree.getroot()

# Namespaces
ns = {'rail': 'https://www.railml.org/schemas/2021'}

radius_changes = []
switches = []

for track in root.findall('.//rail:track', ns):
    for rc in track.findall('.//rail:radiusChange', ns):
        pos = float(rc.attrib.get('pos', 0))
        radius = float(rc.attrib.get('radius', 0))
        radius_changes.append((pos, radius))
        
    for sw in track.findall('.//rail:switch', ns):
        pos = float(sw.attrib.get('pos', 0))
        switches.append(pos)

# Create Plot
plt.figure(figsize=(10, 5))

# Plot track as a line
track_length = 3500
plt.plot([0, track_length], [0, 0], color='black', linewidth=3, label='Tracciato Principale')

# Mark Curvatures
for pos, rad in radius_changes:
    # A curve starts at pos. Draw a colored segment
    plt.plot([pos, pos+100], [0, 0], color='orange', linewidth=8, alpha=0.5, label=f'Curva R={rad}m' if pos==radius_changes[0][0] else "")
    plt.annotate(f'Inizio Curva\nR={rad}m', (pos, 0), textcoords="offset points", xytext=(0,15), ha='center', fontsize=9, color='darkorange')

# Mark Switches
for pos in switches:
    plt.plot(pos, 0, marker='o', markersize=10, color='blue', label='Scambio' if pos==switches[0] else "")
    plt.annotate('Scambio', (pos, 0), textcoords="offset points", xytext=(0,-20), ha='center', fontsize=9, color='blue')

plt.title('Ricostruzione Fisica: Profilo Lineare della Tratta (RailML)', fontsize=14)
plt.xlabel('Chilometrica (metri)', fontsize=12)
plt.yticks([])
plt.legend()
plt.grid(True, axis='x', linestyle='--', alpha=0.7)
plt.tight_layout()

# Save plot to artifacts
artifact_dir = r"C:\Users\user\.gemini\antigravity-ide\brain\4d58bc28-dee2-4785-aa94-f001f578cc0b"
output_path = os.path.join(artifact_dir, "railml_plot.png")
plt.savefig(output_path, dpi=150)
print(f"Saved plot to {output_path}")
