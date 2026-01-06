# Quick Setup Guide for OpenRouteService Integration

## Step-by-Step Setup

### 1. Get Your Free API Key

1. Go to https://openrouteservice.org/
2. Click "Sign Up" (top right)
3. Create a free account
4. After login, go to "Dev Dashboard"
5. Click "Request a Token"
6. Copy your API key

### 2. Set Up the API Key

Open PowerShell in the project directory and run:

```powershell
$env:ORS_API_KEY = "paste_your_key_here"
```

**Note:** This sets the key for the current session only. To make it permanent:

```powershell
[Environment]::SetEnvironmentVariable("ORS_API_KEY", "paste_your_key_here", "User")
```

### 3. Install Backend Dependencies

```powershell
cd backend
pip install requests
```

Or install all dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

### 4. Start the Backend Server

```powershell
cd backend
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
Model loaded successfully.
```

### 5. Start the Frontend

Open a **new** PowerShell terminal:

```powershell
cd frontend
npm run dev
```

### 6. Test the Feature

1. Open http://localhost:5173 in your browser
2. Select a city (Hyderabad or Karnataka)
3. Choose a route
4. Select different source and destination stops
5. Watch the map update with:
   - Blue route line showing the path
   - Distance and duration in the info box

## What You'll See

### Before OpenRouteService Integration
- Just two markers on the map (origin and destination)
- No distance or travel time information

### After OpenRouteService Integration
- Two markers (origin and destination)
- **Blue line showing the actual route on roads**
- **Info box with distance (km) and duration (min)**

## Troubleshooting

### Backend won't start
```powershell
# Make sure you're in the right directory
cd backend

# Check if Python is available
python --version

# Reinstall dependencies
pip install -r requirements.txt
```

### "Module 'requests' not found"
```powershell
pip install requests
```

### API Key Error (403)
- Make sure you copied the full API key
- Check if the key is set: `$env:ORS_API_KEY` in PowerShell
- Try setting it again

### No route showing on map
- Open browser console (F12) to check for errors
- Make sure both backend and frontend are running
- Verify internet connection (API requires internet)
- Try selecting different stops

## Example API Key Setup

If your API key is: `5b3ce3597851110001cf6248abcdef1234567890`

Run in PowerShell:
```powershell
$env:ORS_API_KEY = "5b3ce3597851110001cf6248abcdef1234567890"
```

Then start the backend:
```powershell
python backend/app.py
```

## Testing the Backend API Directly

You can test if the backend endpoint works:

```powershell
# Test with example coordinates (Hyderabad area)
Invoke-WebRequest -Uri "http://localhost:5000/api/route-info?start_lat=17.385&start_lon=78.486&end_lat=17.395&end_lon=78.496" | Select-Object -ExpandProperty Content
```

Expected response:
```json
{
  "distance": 1.5,
  "duration": 3.2,
  "coordinates": [[17.385, 78.486], ...]
}
```

## Need Help?

Check the detailed documentation: [openrouteservice_integration.md](./openrouteservice_integration.md)
