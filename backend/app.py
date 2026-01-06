from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import numpy as np
import requests
from utils.gtfs_loader import GTFSLoader

app = Flask(__name__)
CORS(app)

loader = GTFSLoader(os.path.join(os.path.dirname(__file__), 'utils'))

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data/models/delay_predictor.pkl')
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model not found at {MODEL_PATH}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/api/predict', methods=['POST'])
def predict():
    if not model:
        load_model()
        if not model:
            return jsonify({'error': 'Model not trained yet'}), 503

    data = request.json
    try:
        # Extract only the features the model expects
        # Convert route_id from text to a numeric hash (for demo purposes)
        route_id_str = data.get('route_id', '')
        route_id = hash(route_id_str) % 10000  # Simple hash to numeric
        
        # Calculate day_of_week from date if provided
        if 'date' in data:
            from datetime import datetime
            date_obj = datetime.strptime(data['date'], '%Y-%m-%d')
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_of_week = days[date_obj.weekday()]
        else:
            day_of_week = data.get('day_of_week', 'Monday')
        
        # Build model input with exact features expected
        model_input = {
            'route_id': route_id,
            'day_of_week': day_of_week,
            'weather_condition': data.get('weather_condition', 'Clear'),
            'event_type': data.get('event_type', 'None'),
            'temperature_c': float(data.get('temperature_c', 20)),
            'precipitation_mm': float(data.get('precipitation_mm', 0)),
            'event_attendance': int(data.get('event_attendance', 0)),
            'traffic_factor': float(data.get('traffic_factor', 1.0))
        }
        
        input_data = pd.DataFrame([model_input])
        prediction = model.predict(input_data)
        return jsonify({'delay_minutes': float(prediction[0])})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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
    trip_headsign = request.args.get('headsign')
    
    if loader.load_data(city):
        stops_data = loader.get_stops(route_id, trip_headsign)
        return jsonify(stops_data)
    return jsonify([]), 404

@app.route('/api/stats', methods=['GET'])
def stats():
    # Return some dummy stats or read from csv
    return jsonify({
        'routes': ['R001', 'R002', 'R003', 'R004', 'R005'],
        'avg_delay': 12.5,
        'events_impact': 'High'
    })

@app.route('/api/route-info', methods=['GET'])
def get_route_info():
    """
    Fetch route information (distance, duration, coordinates) from OpenRouteService API
    """
    try:
        start_lat = float(request.args.get('start_lat'))
        start_lon = float(request.args.get('start_lon'))
        end_lat = float(request.args.get('end_lat'))
        end_lon = float(request.args.get('end_lon'))
        
        # OpenRouteService API endpoint
        # Note: You'll need to sign up at https://openrouteservice.org/ to get a free API key
        ORS_API_KEY = os.environ.get('ORS_API_KEY') or 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNhODM2NDM0YjI0YjQ1ZmFiNzFlMTdiZGQ0NjQxNTAyIiwiaCI6Im11cm11cjY0In0='
        
        url = 'https://api.openrouteservice.org/v2/directions/driving-car'
        headers = {
            'Authorization': ORS_API_KEY,
            'Content-Type': 'application/json'
        }
        
        body = {
            'coordinates': [[start_lon, start_lat], [end_lon, end_lat]],
            'alternative_routes': {
                'share_factor': 0.6,
                'target_count': 3,
                'weight_factor': 1.4
            }
            # Note: Traffic consideration removed due to free tier limitations
            # 'options': {
            #     'avoid_features': [],
            #     'profile_params': {
            #         'weightings': {
            #             'traffic': True  # Requires premium plan
            #         }
            #     }
            # }
        }
        
        response = requests.post(url, json=body, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract route information from the 'routes' array (JSON format response)
            if data.get('routes') and len(data['routes']) > 0:
                from polyline import decode
                routes_list = []
                
                for idx, route in enumerate(data['routes']):
                    segments = route['segments'][0]
                    
                    # Get distance in km and duration in minutes
                    distance_km = round(segments['distance'] / 1000, 2)
                    duration_min = round(segments['duration'] / 60, 1)
                    
                    # Decode the geometry polyline to get coordinates
                    geometry_string = route['geometry']
                    decoded_coords = decode(geometry_string)
                    
                    routes_list.append({
                        'id': idx,
                        'distance': distance_km,
                        'duration': duration_min,
                        'coordinates': decoded_coords
                    })
                
                # Return all available routes
                return jsonify({
                    'routes': routes_list,
                    'selectedRoute': 0  # Default to first route
                })
            else:
                return jsonify({'error': 'No route found'}), 404
        else:
            return jsonify({'error': f'OpenRouteService API error: {response.status_code}'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    load_model()
    app.run(debug=True, port=5000)
