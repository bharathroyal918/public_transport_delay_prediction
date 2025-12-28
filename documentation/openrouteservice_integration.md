# OpenRouteService API Integration

## Overview
The application now integrates with OpenRouteService (ORS) API to provide real-time routing information between selected origin and destination stops. This includes:
- **Distance calculation** between stops
- **Travel time estimation** 
- **Route visualization** on the map with a polyline showing the actual road path

## Features

### 1. Automatic Route Fetching
When you select a source and destination in the prediction form, the app automatically:
- Fetches routing data from OpenRouteService
- Calculates the distance in kilometers
- Estimates travel time in minutes
- Retrieves the actual route geometry for map display

### 2. Visual Display
The route information is displayed in two places:
- **Map Overlay**: A white info box on the top-right of the map showing:
  - Origin and destination names
  - Distance (km)
  - Duration (minutes)
- **Map Polyline**: A blue route line showing the actual road path between stops

### 3. Real-time Updates
Route information updates automatically whenever you change:
- Source stop
- Destination stop
- Route
- Direction

## Setup Instructions

### Step 1: Get Your OpenRouteService API Key
1. Visit [OpenRouteService](https://openrouteservice.org/)
2. Click "Sign Up" and create a free account
3. Go to your dashboard and generate an API key
4. Free tier includes: 2,000 requests per day

### Step 2: Configure API Key

#### Option A: Environment Variable (Recommended)
Set the `ORS_API_KEY` environment variable:

**Windows (PowerShell):**
```powershell
$env:ORS_API_KEY = "your_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set ORS_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export ORS_API_KEY=your_api_key_here
```

#### Option B: Direct Code Update
Edit [backend/app.py](../backend/app.py) line ~110:
```python
ORS_API_KEY = os.environ.get('ORS_API_KEY', 'your_api_key_here')
```

### Step 3: Install Required Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start the Backend Server
```bash
cd backend
python app.py
```

### Step 5: Test the Integration
1. Open the frontend application
2. Select a city (Hyderabad or Karnataka)
3. Choose a route and direction
4. Select different source and destination stops
5. Observe the map showing the route line and info box with distance/duration

## API Endpoint

### GET `/api/route-info`
Fetches routing information between two coordinates.

**Query Parameters:**
- `start_lat` (float): Origin latitude
- `start_lon` (float): Origin longitude  
- `end_lat` (float): Destination latitude
- `end_lon` (float): Destination longitude

**Response:**
```json
{
  "distance": 12.5,
  "duration": 25.3,
  "coordinates": [
    [17.385044, 78.486671],
    [17.386123, 78.487456],
    ...
  ]
}
```

## Code Architecture

### Frontend Components

#### 1. api.js
New function `getRouteInfo()`:
- Calls the backend `/api/route-info` endpoint
- Passes start/end coordinates
- Returns distance, duration, and route coordinates

#### 2. PredictionForm.jsx
- Added `routeInfo` state to store route data
- New `useEffect` hook that triggers when source/destination changes
- Fetches route info automatically
- Passes route info to parent Dashboard component

#### 3. MapViz.jsx
- Added `routeInfo` prop
- Imports `Polyline` component from react-leaflet
- Renders blue polyline showing the route
- Displays distance and duration in info box

#### 4. Dashboard.jsx
- Updated `mapParams` state to include `routeInfo`
- Passes route info to MapViz component

### Backend

#### app.py
New endpoint `/api/route-info`:
- Receives coordinates from frontend
- Calls OpenRouteService Directions API
- Processes response to extract:
  - Distance (converted to km)
  - Duration (converted to minutes)
  - Route geometry coordinates (converted to Leaflet format)
- Handles errors gracefully with appropriate status codes

## Limitations

### Free Tier Restrictions
- 2,000 requests/day
- 40 requests/minute
- For production, consider upgrading or implementing caching

### Network Requirements
- Requires internet connection to fetch routes
- API calls may take 1-3 seconds
- Timeout set to 10 seconds

### Fallback Behavior
If route fetching fails:
- Distance/duration won't be shown
- Route polyline won't appear
- Origin/destination markers still display
- Application continues to work normally

## Troubleshooting

### Issue: "OpenRouteService API error: 403"
**Solution:** Your API key is invalid or expired. Get a new key from openrouteservice.org

### Issue: "Request timeout"
**Solution:** 
- Check your internet connection
- OpenRouteService may be experiencing downtime
- Try again in a few moments

### Issue: Route not displaying on map
**Solution:**
- Open browser developer console (F12)
- Check for JavaScript errors
- Verify coordinates are valid numbers
- Ensure source and destination are different stops

### Issue: Backend returns 500 error
**Solution:**
- Check backend logs for detailed error message
- Verify `requests` library is installed: `pip install requests`
- Check API key is set correctly

## Future Enhancements

Possible improvements:
1. **Caching**: Store frequently requested routes to reduce API calls
2. **Alternative Routes**: Show multiple route options
3. **Traffic Data**: Integrate real-time traffic information (requires premium OpenRouteService plan)
4. **Public Transit Mode**: Use ORS public transit routing instead of driving
5. **Distance Matrix**: Batch calculate distances for multiple stop pairs
6. **Offline Support**: Fall back to straight-line distance when API unavailable

## Additional Resources

- [OpenRouteService Documentation](https://openrouteservice.org/dev/#/api-docs)
- [OpenRouteService Directions API](https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Polyline](https://leafletjs.com/reference.html#polyline)
