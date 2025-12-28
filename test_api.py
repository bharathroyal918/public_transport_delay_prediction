import requests
import os

api_key = os.environ.get('ORS_API_KEY', '')
print(f'API Key: {api_key[:20]}...')

# Test geocoding API
url = 'https://api.openrouteservice.org/geocode/search'
headers = {'Authorization': api_key}
params = {'text': 'Hyderabad'}

try:
    response = requests.get(url, headers=headers, params=params, timeout=10)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Features found: {len(data.get("features", []))}')
        if data.get('features'):
            print('API key appears to be working!')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Exception: {e}')