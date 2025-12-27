import requests
import subprocess
import time
import sys
import threading
import os

def start_server():
    print("Starting Flask Server...")
    # Run app.py using venv python
    cmd = [os.path.join("venv", "Scripts", "python"), os.path.join("backend", "app.py")]
    # Start process
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return proc

def test_api():
    base_url = "http://127.0.0.1:5000"
    max_retries = 10
    
    # 1. Health Check
    for i in range(max_retries):
        try:
            resp = requests.get(f"{base_url}/health")
            if resp.status_code == 200:
                print("Health Check: PASSED")
                print(resp.json())
                break
        except:
            time.sleep(2)
            print(f"Waiting for server... ({i+1}/{max_retries})")
    else:
        print("Health Check: FAILED (Server didn't start)")
        return

    # 2. Prediction
    payload = {
        "route_id": "R001",
        "day_of_week": "Monday",
        "time_of_day": "08:00",
        "weather_condition": "Rain",
        "temperature_c": 15,
        "precipitation_mm": 10,
        "event_type": "None",
        "event_attendance": 0,
        "traffic_factor": 1.2
    }
    try:
        resp = requests.post(f"{base_url}/api/predict", json=payload)
        if resp.status_code == 200:
            print("Prediction Test: PASSED")
            print(f"Input: {payload}")
            print(f"Output: {resp.json()}")
        else:
            print(f"Prediction Test: FAILED {resp.status_code}")
            print(resp.text)
    except Exception as e:
        print(f"Prediction Test: ERROR {e}")

if __name__ == "__main__":
    # Start server in background
    # Note: This is tricky in a script that ends, but for testing we can spawn it, test, then kill it.
    proc = start_server()
    try:
        test_api()
    finally:
        print("Stopping Server...")
        proc.kill()
