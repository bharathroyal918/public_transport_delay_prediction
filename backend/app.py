from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
import pandas as pd
import joblib
import os
import requests
from dotenv import load_dotenv
from google import genai
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

from utils.gtfs_loader import GTFSLoader

# =========================
# Load environment variables
# =========================
load_dotenv()

# =========================
# Flask App Setup
# =========================
app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY',
    'super-secret-key-change-this-in-production'
)
jwt = JWTManager(app)

# =========================
# Gemini (NEW SDK) Setup
# =========================
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    print("Gemini client initialized.")
else:
    print("⚠️ GEMINI_API_KEY not found. Chat feature disabled.")

# =========================
# Weather API
# =========================
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# =========================
# ML Model
# =========================
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '../data/models/delay_predictor.pkl'
)
prediction_model = None

# =========================
# GTFS Loader
# =========================
loader = GTFSLoader(os.path.join(os.path.dirname(__file__), 'utils'))

# =========================
# Mock User Store
# =========================
users = {}  # {username: {password: "..."}}

# =========================
# Helpers
# =========================
def load_predictor():
    global prediction_model
    if os.path.exists(MODEL_PATH):
        prediction_model = joblib.load(MODEL_PATH)
        print("Prediction Model loaded successfully.")
    else:
        print(f"Model not found at {MODEL_PATH}")

def get_live_weather(lat, lon):
    if not OPENWEATHER_API_KEY:
        return None
    try:
        url = (
            "https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        )
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print("Weather error:", e)
    return None

# =========================
# Auth Routes
# =========================
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if username in users:
        return jsonify({"error": "User already exists"}), 400

    users[username] = {'password': password}
    return jsonify({"message": "User registered"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=username)
    return jsonify(access_token=token, username=username), 200

# =========================
# Health
# =========================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": prediction_model is not None
    })

# =========================
# Prediction
# =========================
@app.route('/api/predict', methods=['POST'])
def predict():
    if prediction_model is None:
        load_predictor()
        if prediction_model is None:
            return jsonify({"error": "Model not loaded"}), 503

    data = request.json

    try:
        route_id = hash(data.get('route_id', '')) % 10000

        weather_condition = data.get('weather_condition', 'Clear')
        temperature_c = float(data.get('temperature_c', 20))
        precipitation_mm = float(data.get('precipitation_mm', 0))

        if 'lat' in data and 'lon' in data:
            wx = get_live_weather(data['lat'], data['lon'])
            if wx:
                weather_condition = wx['weather'][0]['main']
                temperature_c = wx['main']['temp']
                precipitation_mm = wx.get('rain', {}).get('1h', 0)

        input_df = pd.DataFrame([{
            "route_id": route_id,
            "day_of_week": data.get('day_of_week', 'Monday'),
            "weather_condition": weather_condition,
            "event_type": data.get('event_type', 'None'),
            "temperature_c": temperature_c,
            "precipitation_mm": precipitation_mm,
            "event_attendance": int(data.get('event_attendance', 0)),
            "traffic_factor": float(data.get('traffic_factor', 1.0))
        }])

        delay = prediction_model.predict(input_df)[0]

        return jsonify({
            "delay_minutes": float(delay),
            "weather_used": {
                "condition": weather_condition,
                "temperature_c": temperature_c,
                "precipitation_mm": precipitation_mm
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# =========================
# Gemini Chat (FIXED)
# =========================
@app.route('/api/chat', methods=['POST'])
def chat():
    if not gemini_client:
        return jsonify({"error": "Gemini not configured"}), 503

    data = request.json
    message = data.get('message', '')
    context = data.get('context', {})

    prompt = f"""
You are a helpful public transport assistant.

Context:
{context}

User:
{message}

Give short, clear travel advice.
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# GTFS Routes
# =========================
@app.route('/api/routes', methods=['GET'])
def get_routes():
    city = request.args.get('city', 'hyderabad')
    if loader.load_data(city):
        return jsonify(loader.get_routes())
    return jsonify([]), 404

@app.route('/api/trips', methods=['GET'])
def get_trips():
    city = request.args.get('city', 'hyderabad')
    route_id = request.args.get('route_id')
    if loader.load_data(city):
        return jsonify(loader.get_trips(route_id))
    return jsonify([]), 404

@app.route('/api/stops', methods=['GET'])
def get_stops():
    city = request.args.get('city', 'hyderabad')
    route_id = request.args.get('route_id')
    headsign = request.args.get('headsign')

    if loader.load_data(city):
        return jsonify(loader.get_stops(route_id, headsign))
    return jsonify([]), 404

# =========================
# Route Info (ORS)
# =========================
@app.route('/api/route-info', methods=['GET'])
def get_route_info():
    """
    Fetch route information from OpenRouteService.
    """
    try:
        start_lat = float(request.args.get('start_lat'))
        start_lon = float(request.args.get('start_lon'))
        end_lat = float(request.args.get('end_lat'))
        end_lon = float(request.args.get('end_lon'))

        # OSRM Public API (No Key Required)
        # url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=polyline"
        
        # Using a reliable alternative public instance or the main one
        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
        
        params = {
            'overview': 'full',
            'geometries': 'polyline'
        }
        
        # OSRM Headers (User-Agent is good practice)
        headers = {
            'User-Agent': 'PublicTransportDelayPredictor/1.0'
        }

        response = requests.get(url, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('routes') and len(data['routes']) > 0:
                from polyline import decode
                routes_list = []
                for idx, route in enumerate(data['routes']):
                    # OSRM returns 'legs' for waypoints, usually 1 leg for 2 points
                    leg = route['legs'][0]
                    
                    # Convert to km and minutes
                    distance_km = round(leg['distance'] / 1000, 2)
                    duration_min = round(leg['duration'] / 60, 1)

                    # Decode geometry
                    geometry_string = route['geometry']
                    decoded_coords = decode(geometry_string)

                    routes_list.append({
                        'id': idx,
                        'distance': distance_km,
                        'duration': duration_min,
                        'coordinates': decoded_coords,
                        'summary': {'distance': distance_km, 'duration': duration_min}
                    })

                return jsonify({
                    'routes': routes_list,
                    'selectedRoute': 0
                })
            else:
                raise Exception("No route found by OSRM")
        else:
            raise Exception(f"OSRM API error: {response.status_code}")

    except Exception as e:
        print(f"ORS API Failed: {e}")
        # Fallback to Haversine
        pass

    # Fallback Logic
    dist_km = haversine_distance(start_lat, start_lon, end_lat, end_lon)
    # Estimate duration: assume 25 km/h avg speed for urban bus
    duration_min = (dist_km / 25) * 60 

    # Create a simple straight line geometry (polyline encoded or just coordinates)
    # Using raw coordinates for simplicity since frontend might expect decoded
    # But current logic expects decoded in 'coordinates' field
    
    # 10 points interpolated for visualization
    route_coords = []
    steps = 10
    for i in range(steps + 1):
        f = i / steps
        lat = start_lat + (end_lat - start_lat) * f
        lon = start_lon + (end_lon - start_lon) * f
        route_coords.append([lat, lon])

    return jsonify({
        'routes': [{
            'id': 0,
            'distance': round(dist_km, 2),
            'duration': round(duration_min, 1),
            'coordinates': route_coords,
            'summary': {'distance': dist_km, 'duration': duration_min}
        }],
        'selectedRoute': 0,
        'fallback': True
    })


# =========================
# Run
# =========================
if __name__ == "__main__":
    load_predictor()
    app.run(debug=True, port=5000)
