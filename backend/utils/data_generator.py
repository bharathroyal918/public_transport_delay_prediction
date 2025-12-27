import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

from gtfs_loader import GTFSLoader

def generate_data(num_samples=5000):
    print(f"Generating {num_samples} samples...")
    
    # Load GTFS Routes
    base_dir = os.path.dirname(os.path.abspath(__file__))
    loader = GTFSLoader(base_dir)
    
    # Combine routes from both cities for training
    real_routes = []
    if loader.load_data('hyderabad'):
        real_routes.extend([r['route_short_name'] for r in loader.get_routes()])
    if loader.load_data('karnataka'):
        real_routes.extend([r['route_short_name'] for r in loader.get_routes()])
    
    if not real_routes:
        print("Warning: No GTFS routes found. Using synthetic IDs.")
        routes = ['R001', 'R002', 'R003', 'R004', 'R005']
    else:
        # Sample a subset if too many, or use all
        routes = real_routes[:100] if len(real_routes) > 100 else real_routes

    print(f"Using {len(routes)} routes for data generation.")

    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    weather_conditions = ['Clear', 'Rain', 'Snow', 'Fog']
    event_types = ['None', 'Sports', 'Concert', 'Festival']
    
    data = []
    
    for _ in range(num_samples):
        # 1. Basic Spatio-Temporal
        route = str(random.choice(routes)) # Ensure string
        day = random.choice(days)
        # Random time between 06:00 and 23:00
        hour = random.randint(6, 23)
        minute = random.randint(0, 59)
        time_of_day = f"{hour:02d}:{minute:02d}"
        
        # 2. Weather Generation
        condition = random.choices(weather_conditions, weights=[0.6, 0.25, 0.1, 0.05])[0]
        
        if condition == 'Clear':
            temp = random.randint(10, 35)
            precip = 0
        elif condition == 'Rain':
            temp = random.randint(5, 25)
            precip = round(random.uniform(1.0, 50.0), 1)
        elif condition == 'Snow':
            temp = random.randint(-10, 2)
            precip = round(random.uniform(0.5, 20.0), 1)
        else: # Fog
            temp = random.randint(0, 15)
            precip = 0
            
        # 3. Event Generation
        event = random.choices(event_types, weights=[0.8, 0.1, 0.05, 0.05])[0]
        attendance = 0
        if event != 'None':
            attendance = random.randint(500, 50000)
            
        # 4. Traffic / Operational Factors
        traffic_factor = random.uniform(0.8, 1.5)
        if 7 <= hour <= 9 or 16 <= hour <= 19: # Rush hour
            traffic_factor += 0.5
            
        # 5. Calculate Delay
        base_delay = random.uniform(0, 5) 
        
        weather_delay = 0
        if condition == 'Rain':
            weather_delay = precip * 0.5
        elif condition == 'Snow':
            weather_delay = precip * 1.5
        elif condition == 'Fog':
            weather_delay = random.uniform(2, 10)
            
        event_delay = 0
        if event != 'None':
            event_delay = (attendance / 1000) * 0.8
            
        # Route Specific (Mocking route factor based on ID hash/length)
        route_factor = (len(route) % 5) * 0.1 + 0.8 
        
        total_delay = (base_delay + weather_delay + event_delay) * traffic_factor * route_factor
        
        total_delay += np.random.normal(0, 2)
        total_delay = max(0, round(total_delay, 2)) 
        
        data.append({
            'route_id': route,
            'day_of_week': day,
            'time_of_day': time_of_day,
            'weather_condition': condition,
            'temperature_c': temp,
            'precipitation_mm': precip,
            'event_type': event,
            'event_attendance': attendance,
            'traffic_factor': round(traffic_factor, 2),
            'delay_minutes': total_delay
        })
        
    df = pd.DataFrame(data)
    
    # Save
    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'raw', 'transit_data.csv')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    generate_data()
