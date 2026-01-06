import requests
import sys

try:
    response = requests.get('http://localhost:5000/health', timeout=5)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
