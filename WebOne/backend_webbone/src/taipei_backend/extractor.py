"""
extractor.py — Stub for future OCR/OpenCV pipeline
Phase 1.1-1.2: extract stations/lines from the official map via
  Tesseract / EasyOCR (names) + OpenCV color segmentation (paths).
NOT IMPLEMENTED — dataset is manually curated in data/stations.json.
"""
from pathlib import Path

MAP_IMAGE = Path(__file__).parents[1] / 'docs' / 'Taipei_Metro_official_map_optimised.png'

class StationExtractor:
    """OCR stub — will extract station codes and names from map image."""
    def __init__(self, image_path: Path = MAP_IMAGE):
        self.image_path = image_path
    def run(self) -> dict:
        raise NotImplementedError("Install easyocr + opencv-python and implement.")

class LineExtractor:
    """Color-segmentation stub — will extract line paths per HSV color."""
    def __init__(self, image_path: Path = MAP_IMAGE):
        self.image_path = image_path
    def run(self) -> list:
        raise NotImplementedError("Install opencv-python and implement.")

if __name__ == '__main__':
    print(f"extractor.py stub. Reference image: {MAP_IMAGE}")
