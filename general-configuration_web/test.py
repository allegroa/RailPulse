import requests

url = "http://localhost:5002/api/config/gis/1/import-railml"

def test_file(path):
    print(f"Testing {path}...")
    try:
        with open(path, 'rb') as f:
            files = {'file': f}
            data = {'overwrite': 'true'}
            response = requests.post(url, files=files, data=data)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

test_file("d:/004_Software/RailPulse/general-configuration_web/railml_schemas/codelists/InfrastructureManagers.xml")
