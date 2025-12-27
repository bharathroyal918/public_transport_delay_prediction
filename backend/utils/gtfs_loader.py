import pandas as pd
import os

class GTFSLoader:
    def __init__(self, base_dir):
        self.base_dir = base_dir
        self.routes = None
        self.stops = None
        self.loaded_city = None

    def load_data(self, city):
        """
        Load GTFS data for a specific city.
        city: 'hyderabad' or 'karnataka'
        """
        folder_name = f"{city}_GTFS"
        data_path = os.path.join(self.base_dir, '..', '..', folder_name) # Adjust path relative to backend/utils
        
        # Absolute path check
        if not os.path.exists(data_path):
            # Try absolute path from project root if relative fails
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_path = os.path.join(project_root, folder_name)

        if not os.path.exists(data_path):
            print(f"GTFS folder not found: {data_path}")
            return False

        try:
            self.routes = pd.read_csv(os.path.join(data_path, 'routes.txt'))
            # Some GTFS have route_short_name, some route_long_name. validation needed.
            if 'route_short_name' not in self.routes.columns:
                 self.routes['route_short_name'] = self.routes['route_long_name'] if 'route_long_name' in self.routes.columns else self.routes['route_id']
            
            self.stops = pd.read_csv(os.path.join(data_path, 'stops.txt'))
            self.trips = pd.read_csv(os.path.join(data_path, 'trips.txt'))
            self.calendar = pd.read_csv(os.path.join(data_path, 'calendar.txt'))
            
            # Load stop_times (lighter version, maybe group by trip_id)
            # Optimisation: We only need this for get_stops(route_id). 
            # Loading full file into memory might be okay for these city sizes (~700KB - ~5MB)
            self.stop_times = pd.read_csv(os.path.join(data_path, 'stop_times.txt'))
            
            self.loaded_city = city
            print(f"Loaded {len(self.routes)} routes, {len(self.trips)} trips for {city}")
            return True
        except Exception as e:
            print(f"Error loading GTFS for {city}: {e}")
            return False

    def get_routes(self):
        if self.routes is not None:
             # Return list of {id, name}
             return self.routes[['route_id', 'route_short_name']].to_dict('records')
        return []

    def get_trips(self, route_id):
        """Returns unique trip headsigns (directions) for a route"""
        if self.trips is not None:
            # Filter trips by route_id (need to handle type mismatch: ensure string?)
            filtered = self.trips[self.trips['route_id'].astype(str) == str(route_id)]
            unique_trips = filtered[['trip_headsign']].drop_duplicates()
            return unique_trips.to_dict('records')
        return []

    def get_stops(self, route_id=None, trip_headsign=None):
        if self.stops is None: return []
        
        # If route_id is provided, filtering by stops on that route is complex without trip_headsign
        # If trip_headsign is provided, we can find a representative trip and return its stops in order
        
        if route_id and trip_headsign:
            try:
                # Find a trip_id for this route and headsign
                matching_trips = self.trips[
                    (self.trips['route_id'].astype(str) == str(route_id)) & 
                    (self.trips['trip_headsign'] == trip_headsign)
                ]
                
                if not matching_trips.empty:
                    # Take the first one as representative
                    trip_id = matching_trips.iloc[0]['trip_id']
                    
                    # Get stops for this trip from stop_times
                    trip_stops = self.stop_times[self.stop_times['trip_id'] == trip_id].sort_values('stop_sequence')
                    
                    # Join with stops to get names
                    merged = trip_stops.merge(self.stops, on='stop_id')
                    return merged[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']].to_dict('records')
            except Exception as e:
                print(f"Error filtering stops: {e}")
        
        # Fallback: Return all stops if no filter
        cols = ['stop_id', 'stop_name']
        if 'stop_lat' in self.stops.columns: cols.extend(['stop_lat', 'stop_lon'])
        return self.stops[cols].fillna('').to_dict('records')

    def validate_date(self, date_str):
        # date_str: YYYY-MM-DD
        # Check if any service runs on this date
        # logic: 
        # 1. Get day of week (Monday...Sunday)
        # 2. Check calendar for service_ids active on this day and start_date <= date <= end_date
        return True # Simplified for now, or implement full logic


# Singleton or factory can be used in app.py
