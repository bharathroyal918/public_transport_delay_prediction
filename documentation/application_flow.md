# Public Transport Delay Prediction - Application Flow

This document explains the complete flow of the application from start to end, covering both backend and frontend operations. This guide is designed for beginners to understand how the entire system works.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Flow](#backend-flow)
3. [Frontend Flow](#frontend-flow)
4. [Complete User Journey](#complete-user-journey)
5. [Data Flow Diagram](#data-flow-diagram)

---

## System Overview

The application is a full-stack web application that predicts public transport delays based on various factors like weather, events, and traffic conditions. It consists of:

- **Backend**: Flask API server (Python) that serves predictions and GTFS data
- **Frontend**: React application (JavaScript) that provides the user interface
- **ML Model**: RandomForestRegressor trained on historical transit data
- **Data**: GTFS data for routes/stops and CSV data for model training

---

## Backend Flow

### 1. Backend Startup (`backend/app.py`)

**When the backend server starts:**

1. **Import Dependencies**: The server imports Flask, CORS, pandas, joblib, and custom utilities
2. **Initialize Flask App**: Creates a Flask application instance
3. **Enable CORS**: Allows the frontend (running on a different port) to communicate with the backend
4. **Create GTFSLoader Instance**: Initializes the GTFS data loader pointing to the utils directory
5. **Set Model Path**: Defines where the trained ML model file is stored (`data/models/delay_predictor.pkl`)
6. **Load Model**: Calls `load_model()` function which:
   - Checks if the model file exists at the specified path
   - If exists, loads the model using `joblib.load()`
   - If not found, prints a warning message
   - Stores the model in a global variable for later use

7. **Start Server**: Flask app begins listening on `http://localhost:5000`

**Entry Point**: `if __name__ == '__main__': load_model(); app.run(debug=True, port=5000)`

---

### 2. Backend API Endpoints

The backend exposes several REST API endpoints:

#### A. Health Check Endpoint (`/health`)
**Purpose**: Check if the backend server and model are ready

**Flow**:
1. Frontend or external tool sends GET request to `/health`
2. Backend checks if model is loaded (`model is not None`)
3. Returns JSON: `{'status': 'healthy', 'model_loaded': true/false}`

**When Used**: On application startup, frontend checks backend health

---

#### B. Predict Endpoint (`/api/predict`)
**Purpose**: Generate delay predictions based on input parameters

**Flow**:
1. Frontend sends POST request with JSON data containing:
   - `route_id`: Selected route
   - `date`: Travel date
   - `weather_condition`: Weather (Clear/Rain/Snow/Fog)
   - `temperature_c`: Temperature in Celsius
   - `precipitation_mm`: Rainfall amount
   - `event_type`: Type of event (None/Sports/Concert/Festival)
   - `event_attendance`: Number of attendees
   - `traffic_factor`: Traffic multiplier

2. **Model Check**: Backend verifies if model is loaded
   - If not loaded, attempts to load it
   - If still not available, returns error 503

3. **Data Preprocessing**:
   - Extracts `route_id` and converts it to numeric hash (model expects numeric input)
   - Calculates `day_of_week` from the provided date (Monday-Sunday)
   - Converts all input values to appropriate types (float, int)

4. **Build Model Input**: Creates a dictionary with exactly the features the model expects:
   ```
   - route_id (numeric)
   - day_of_week (string)
   - weather_condition (string)
   - event_type (string)
   - temperature_c (float)
   - precipitation_mm (float)
   - event_attendance (int)
   - traffic_factor (float)
   ```

5. **Create DataFrame**: Converts the dictionary to a pandas DataFrame (required format for model)

6. **Make Prediction**: Calls `model.predict(input_data)` which:
   - Applies preprocessing pipeline (scaling numerical features, encoding categorical features)
   - Runs the RandomForest model
   - Returns predicted delay in minutes

7. **Return Response**: Sends JSON response: `{'delay_minutes': 12.5}`

**When Used**: When user clicks "Predict Delay" button

---

#### C. Routes Endpoint (`/api/routes`)
**Purpose**: Get list of available bus/transit routes for a city

**Flow**:
1. Frontend sends GET request with query parameter: `/api/routes?city=hyderabad`
2. Backend extracts city name from query parameters (default: 'hyderabad')
3. Calls `loader.load_data(city)` which:
   - Locates the GTFS folder (e.g., `hyderabad_GTFS/`)
   - Reads `routes.txt` file into pandas DataFrame
   - Ensures `route_short_name` column exists
   - Stores routes data in memory
4. If data loaded successfully, calls `loader.get_routes()` to get formatted route list
5. Returns JSON array: `[{route_id: '1', route_short_name: 'Route 1'}, ...]`
6. If loading fails, returns empty array with 404 status

**When Used**: When frontend loads initially or when user changes city selection

---

#### D. Trips Endpoint (`/api/trips`)
**Purpose**: Get available trip directions for a specific route

**Flow**:
1. Frontend sends GET request: `/api/trips?city=hyderabad&route_id=123`
2. Backend extracts city and route_id from query parameters
3. Calls `loader.load_data(city)` to ensure GTFS data is loaded
4. Calls `loader.get_trips(route_id)` which:
   - Reads `trips.txt` file
   - Filters trips by the specified route_id
   - Extracts unique `trip_headsign` values (represents different directions like "Downtown" or "Airport")
   - Returns list of unique headsigns
5. Returns JSON array: `[{trip_headsign: 'To Downtown'}, {trip_headsign: 'To Airport'}]`

**When Used**: When user selects a route, to populate direction dropdown

---

#### E. Stops Endpoint (`/api/stops`)
**Purpose**: Get list of stops for a route and direction

**Flow**:
1. Frontend sends GET request: `/api/stops?city=hyderabad&route_id=123&headsign=To+Downtown`
2. Backend extracts city, route_id, and headsign from query parameters
3. Calls `loader.load_data(city)` to load GTFS data
4. Calls `loader.get_stops(route_id, headsign)` which:
   - Finds all trips matching the route_id and headsign
   - Selects one representative trip_id
   - Reads `stop_times.txt` to get stops for that trip
   - Sorts stops by `stop_sequence` (order along the route)
   - Joins with `stops.txt` to get stop names and coordinates
   - Returns ordered list of stops
5. Returns JSON array: `[{stop_id: '501', stop_name: 'Central Station', stop_lat: 17.385, stop_lon: 78.486}, ...]`
6. If no route/headsign provided, returns all stops in the city

**When Used**: When user selects a route and direction, to populate source/destination dropdowns

---

#### F. Stats Endpoint (`/api/stats`)
**Purpose**: Provide statistical information (currently returns dummy data)

**Flow**:
1. Frontend sends GET request to `/api/stats`
2. Backend returns hardcoded statistics (placeholder for future analytics)
3. Returns JSON: `{'routes': [...], 'avg_delay': 12.5, 'events_impact': 'High'}`

**When Used**: Could be used for dashboard statistics display (not currently implemented in frontend)

---

### 3. Model Training Process (Offline)

**This happens before the application runs, to create the model file.**

**Location**: `backend/model/train.py`

**Flow**:
1. **Load Data**: Reads training data from `data/raw/transit_data.csv`
2. **Feature Engineering**:
   - Extracts hour from `time_of_day` column (not currently used in final model)
   - Separates features (X) from target variable (y = delay_minutes)
3. **Split Data**: Divides data into training (80%) and testing (20%) sets
4. **Create Pipeline**: Calls `create_pipeline()` from `pipeline.py` which:
   - Defines numerical features: temperature, precipitation, attendance, traffic_factor
   - Defines categorical features: route_id, day_of_week, weather_condition, event_type
   - Creates preprocessing steps:
     - **Numerical**: Impute missing values with median → Scale using StandardScaler
     - **Categorical**: Impute missing values with 'missing' → One-Hot Encode
   - Returns a ColumnTransformer that applies both transformations
5. **Build Full Pipeline**: Combines preprocessor with RandomForestRegressor model
6. **Train Model**: Fits the pipeline on training data
7. **Evaluate**: Tests on test data and prints:
   - MAE (Mean Absolute Error): Average prediction error in minutes
   - R² Score: How well the model explains variance (0-1, higher is better)
8. **Save Model**: Serializes the trained pipeline to `data/models/delay_predictor.pkl` using joblib

**Command to Run**: `python backend/model/train.py`

---

### 4. Data Generation Process (Offline)

**Location**: `backend/utils/data_generator.py`

**Flow**:
1. **Initialize GTFSLoader**: Creates loader instance to access real route data
2. **Load Routes**: Loads routes from both Hyderabad and Karnataka GTFS data
3. **Generate Synthetic Data**: For each sample (default 5000):
   - **Select Route**: Randomly picks a real route from GTFS data
   - **Select Day**: Randomly picks day of week (Monday-Sunday)
   - **Select Time**: Random time between 06:00 and 23:00
   - **Generate Weather**:
     - Randomly selects condition (60% Clear, 25% Rain, 10% Snow, 5% Fog)
     - Sets appropriate temperature range based on condition
     - Sets precipitation amount based on condition
   - **Generate Event**:
     - 80% chance of no event
     - If event, assigns random attendance (500-50,000)
   - **Calculate Traffic Factor**:
     - Base factor: 0.8-1.5
     - Add 0.5 during rush hours (7-9 AM, 4-7 PM)
   - **Calculate Delay** (simulated formula):
     - Base delay: 0-5 minutes
     - Weather delay: Precipitation × multiplier (0.5 for rain, 1.5 for snow)
     - Event delay: (Attendance ÷ 1000) × 0.8
     - Apply traffic factor and route-specific factor
     - Add random noise
     - Ensure non-negative
4. **Save Data**: Writes DataFrame to `data/raw/transit_data.csv`

**Command to Run**: `python backend/utils/data_generator.py`

---

## Frontend Flow

### 1. Frontend Startup

**Entry Point**: `frontend/src/main.jsx`

**Flow**:
1. **Import React**: Loads React and ReactDOM libraries
2. **Import App Component**: Loads the main App component
3. **Import Styles**: Loads `index.css` for global styling
4. **Render Application**: Uses `ReactDOM.createRoot()` to mount React app to DOM
5. **Target Element**: Mounts to `<div id="root"></div>` in `index.html`

**Code Execution**:
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

### 2. Main App Component (`App.jsx`)

**Purpose**: Root component that wraps the entire application

**Flow on Component Mount**:
1. **Initialize State**: Creates `health` state variable (null initially)
2. **Health Check Effect**: `useEffect` hook runs after component mounts:
   - Sends GET request to `http://localhost:5000/health`
   - On success: Updates health state to 'healthy'
   - On failure: Updates health state to 'offline'
3. **Render UI**:
   - **Header Section**:
     - Displays application title: "Public Transport Delay Prediction"
     - Shows status badge (green for 'healthy', red for 'offline')
   - **Main Section**:
     - Renders `<Dashboard />` component

**Lifecycle**: Runs once on mount, displays throughout app usage

---

### 3. Dashboard Component (`Dashboard.jsx`)

**Purpose**: Main container that orchestrates all child components and visualizations

**State Management**:
- `prediction`: Stores the predicted delay result (null initially)
- `mapParams`: Stores origin and destination for map display

**Component Structure**:

#### A. Static Visualizations (Always Visible)

1. **Current Route Risk Chart (Bar Chart)**:
   - Shows average delays for 5 sample routes
   - Uses dummy data: `[{name: 'R001', delay: 12}, ...]`
   - Built with Recharts library (BarChart component)
   - Updates: Currently static, could be connected to `/api/stats` endpoint

2. **"What-If" Analysis Chart (Line Chart)**:
   - Shows relationship between rainfall and delays
   - Displays scenario data: `[{rain: 0, delay: 5}, {rain: 10, delay: 8}, ...]`
   - Built with Recharts library (LineChart component)
   - Purpose: Helps users understand how weather affects delays

#### B. Interactive Map Section

**Component**: `<MapViz />` with props `origin` and `destination`

**Flow**:
- Initially shows default center (Hyderabad coordinates)
- Updates when user makes a prediction (receives new origin/destination)
- Displays selected route information in overlay box

#### C. Prediction Form Section

**Component**: `<PredictionForm />` with callback `onPrediction`

**Flow**:
- User fills form with route, date, weather, event details
- On submit, sends prediction request to backend
- On response, calls `onPrediction(delay, formData)` callback
- Dashboard receives callback and:
  - Updates `prediction` state with delay value
  - Updates `mapParams` state with origin/destination

#### D. Results Display Section

**Purpose**: Shows prediction results

**Flow**:
- **Before Prediction**: Shows placeholder text "Enter parameters to estimate delay"
- **After Prediction**: Displays:
  - Large delay value: "12.5 min"
  - Risk interpretation:
    - delay > 15 min: "High Risk! Consider alternate routes..."
    - delay > 5 min: "Moderate delay expected."
    - delay ≤ 5 min: "On time (minimal delay)."

---

### 4. Prediction Form Component (`PredictionForm.jsx`)

**Purpose**: Complex form that handles user input and dynamic data loading

**State Variables**:
- `formData`: Object containing all form fields (city, route, date, weather, etc.)
- `loading`: Boolean indicating if prediction is in progress
- `error`: Error message if prediction fails
- `routes`: Array of available routes for selected city
- `trips`: Array of available directions for selected route
- `stops`: Array of available stops for selected route/direction

**Component Lifecycle - Three Cascading Effects**:

#### Effect 1: Load Routes When City Changes

**Trigger**: Component mounts OR `formData.city` changes

**Flow**:
1. Clears existing routes, trips, and stops arrays
2. Calls `getRoutes(city)` from `api.js` which:
   - Sends GET request to `/api/routes?city=hyderabad`
   - Receives array of route objects
3. Updates `routes` state with received data
4. Automatically selects first route from the list
5. Updates `formData.route_id` with first route's short name

**Why**: Ensures routes are loaded when user selects a city

---

#### Effect 2: Load Trips When Route Changes

**Trigger**: `formData.route_id` changes

**Flow**:
1. Checks if route_id is set (early return if not)
2. Calls `getTrips(city, route_id)` from `api.js` which:
   - Sends GET request to `/api/trips?city=hyderabad&route_id=123`
   - Receives array of trip headsigns (directions)
3. Updates `trips` state with received data
4. Automatically selects first direction
5. Updates `formData.direction` with first headsign

**Why**: Different routes have different directions (inbound/outbound)

---

#### Effect 3: Load Stops When Direction Changes

**Trigger**: `formData.route_id` OR `formData.direction` changes

**Flow**:
1. Checks if route_id is set (early return if not)
2. Calls `getStops(city, route_id, direction)` from `api.js` which:
   - Sends GET request to `/api/stops?city=hyderabad&route_id=123&headsign=Downtown`
   - Receives ordered array of stop objects with names and coordinates
3. Updates `stops` state with received data
4. Automatically sets source to first stop
5. Automatically sets destination to last stop

**Why**: Each route+direction combination has a specific sequence of stops

---

#### Form Input Handling

**Method**: `handleChange(e)`

**Flow**:
1. Extracts name and value from input element
2. **Special Handling for Date Input**:
   - If user changes date field, automatically calculates day of week
   - Converts date string to Date object
   - Maps to day name (Sunday-Saturday)
   - Adds `day_of_week` to updates
3. **Special Handling for Numbers**:
   - Converts string values to float for: temperature, precipitation, attendance, traffic_factor
4. Updates `formData` state with new values (merges updates)

**Triggered By**: User typing or selecting in any form field

---

#### Form Submission

**Method**: `handleSubmit(e)`

**Flow**:
1. Prevents default form submission (no page reload)
2. Sets `loading` state to `true` (shows "Calculating..." text on button)
3. Clears any previous error messages
4. Calls `predictDelay(formData)` from `api.js` which:
   - Sends POST request to `/api/predict` with all form data
   - Backend processes and returns prediction
   - Returns `{delay_minutes: 12.5}`
5. On Success:
   - Calls parent callback: `onPrediction(result.delay_minutes, formData)`
   - Parent (Dashboard) updates prediction display
6. On Error:
   - Sets error message: "Failed to get prediction"
   - Displays error in red text below form
7. Finally (always runs):
   - Sets `loading` state to `false`
   - Re-enables submit button

---

#### Form Fields Structure

The form is divided into sections:

1. **Location Section**:
   - City dropdown (Hyderabad/Karnataka)
   - Route dropdown (dynamic, from GTFS)
   - Direction dropdown (dynamic, from GTFS trips)
   - Source and Destination dropdowns (dynamic, from GTFS stops)

2. **Time Section**:
   - Date input (type="date")
   - Time input (type="time")

3. **Weather Section**:
   - Weather condition dropdown (Clear/Rain/Snow/Fog)
   - Precipitation input (number, in mm)

4. **Event Section**:
   - Event type dropdown (None/Sports/Concert/Festival)

5. **Submit Button**:
   - Disabled when loading
   - Text changes: "Predict Delay" → "Calculating..."

---

### 5. Map Visualization Component (`MapViz.jsx`)

**Purpose**: Display route on an interactive map

**Props**:
- `origin`: Name of starting stop
- `destination`: Name of ending stop

**Flow**:
1. **Initialize Map**:
   - Sets default center to Hyderabad coordinates: `[17.385044, 78.486671]`
   - Sets zoom level to 12
   - Uses OpenStreetMap tiles for map display
2. **Display Markers**:
   - If origin is provided, shows a marker at default center (placeholder)
   - Shows popup with origin name on marker click
   - Note: Currently uses default center for all markers (needs geocoding to place actual stop coordinates)
3. **Display Route Info Overlay**:
   - White box in top-right corner
   - Shows origin and destination names
   - Shows arrow (↓) to indicate direction
   - Updates when new prediction is made

**Library**: Uses React-Leaflet (wrapper around Leaflet.js mapping library)

**Future Enhancement**: Could use stop_lat and stop_lon from GTFS data to show actual locations

---

### 6. API Service Module (`api.js`)

**Purpose**: Centralized module for all backend API calls

**Configuration**:
- Base URL: `http://localhost:5000/api`
- Uses Axios library for HTTP requests

**Functions**:

1. **checkHealth()**:
   - GET request to `/health`
   - Returns: `{status: 'healthy', model_loaded: true}`
   - Used: Not currently called in app (could be used for health monitoring)

2. **predictDelay(data)**:
   - POST request to `/predict` with JSON body
   - Returns: `{delay_minutes: 12.5}`
   - Throws error if request fails
   - Used: When user submits prediction form

3. **getStats()**:
   - GET request to `/stats`
   - Returns: `{routes: [...], avg_delay: 12.5, events_impact: 'High'}`
   - Used: Not currently called (placeholder for future features)

4. **getRoutes(city)**:
   - GET request to `/routes?city=hyderabad`
   - Returns: Array of route objects
   - Used: When component mounts or city changes

5. **getTrips(city, routeId)**:
   - GET request to `/trips?city=hyderabad&route_id=123`
   - Returns: Array of trip headsign objects
   - Used: When route selection changes

6. **getStops(city, routeId, headsign)**:
   - GET request to `/stops?city=hyderabad&route_id=123&headsign=Downtown`
   - Builds query string dynamically based on provided parameters
   - Returns: Array of stop objects with coordinates
   - Used: When route or direction changes

**Error Handling**: All functions have try-catch blocks that log errors to console

---

## Complete User Journey

### Scenario: User wants to predict delay for their bus ride

**Step-by-Step Flow**:

1. **User Opens Application**
   - Browser loads `index.html`
   - React loads and renders `App.jsx`
   - App checks backend health (fetch `/health`)
   - If healthy, shows green "System: healthy" badge
   - Dashboard component renders with empty form

2. **City Selection** (Automatic on Load)
   - PredictionForm component mounts
   - Effect 1 triggers (city = 'hyderabad' by default)
   - Frontend sends: GET `/api/routes?city=hyderabad`
   - Backend:
     - Loads `hyderabad_GTFS/routes.txt`
     - Parses route data
     - Returns JSON array of routes
   - Frontend:
     - Populates route dropdown
     - Auto-selects first route
     - Triggers Effect 2

3. **Route Selection** (Automatic from Step 2)
   - Effect 2 triggers with selected route_id
   - Frontend sends: GET `/api/trips?city=hyderabad&route_id=1A`
   - Backend:
     - Filters trips.txt by route_id
     - Extracts unique headsigns
     - Returns directions (e.g., ["To Secunderabad", "To KPHB"])
   - Frontend:
     - Populates direction dropdown
     - Auto-selects first direction
     - Triggers Effect 3

4. **Direction Selection** (Automatic from Step 3)
   - Effect 3 triggers with route_id and direction
   - Frontend sends: GET `/api/stops?city=hyderabad&route_id=1A&headsign=To+Secunderabad`
   - Backend:
     - Finds a representative trip for this route+direction
     - Gets ordered stops from stop_times.txt
     - Joins with stops.txt for stop names/coordinates
     - Returns ordered list of stops
   - Frontend:
     - Populates source dropdown with all stops
     - Populates destination dropdown with all stops
     - Auto-selects first stop as source
     - Auto-selects last stop as destination

5. **User Adjusts Parameters** (Manual Input)
   - User can change:
     - Source/destination stops (if not taking full route)
     - Date (triggers automatic day-of-week calculation)
     - Time of day
     - Weather condition
     - Precipitation amount
     - Event type
   - Each change calls `handleChange()` which updates formData state
   - No API calls during this phase (local state only)

6. **User Clicks "Predict Delay"**
   - Form submission triggers `handleSubmit()`
   - Button text changes to "Calculating..."
   - Button becomes disabled
   - Frontend sends: POST `/api/predict` with body:
     ```json
     {
       "route_id": "1A",
       "date": "2025-12-27",
       "weather_condition": "Rain",
       "temperature_c": 18,
       "precipitation_mm": 15,
       "event_type": "Sports",
       "event_attendance": 20000,
       "traffic_factor": 1.2
     }
     ```

7. **Backend Processes Prediction**
   - Receives POST data
   - Converts route_id to numeric hash
   - Calculates day_of_week from date (Friday)
   - Creates DataFrame with model features
   - Applies preprocessing pipeline:
     - Scales numerical features (temperature, precipitation, etc.)
     - One-hot encodes categorical features (weather, event type, day)
   - Feeds processed data into RandomForestRegressor
   - Model outputs prediction: 23.5 minutes
   - Returns: `{"delay_minutes": 23.5}`

8. **Frontend Displays Results**
   - PredictionForm receives response
   - Calls parent callback: `onPrediction(23.5, formData)`
   - Dashboard component:
     - Updates prediction state to 23.5
     - Updates mapParams with source/destination
   - UI Updates:
     - Button text changes back to "Predict Delay"
     - Button re-enabled
     - Prediction Result card shows:
       - "Expected Delay: 23.5 min" in large text
       - "High Risk! Consider alternate routes or buffer time." message
     - Map updates with route origin/destination overlay

9. **User Views Visualizations**
   - Static charts (bar chart, line chart) remain visible
   - Map shows selected route information
   - User can interpret:
     - Historical route delays from bar chart
     - Weather impact patterns from line chart
     - Their specific prediction in context

10. **User Makes Another Prediction** (Optional)
    - User can change any form parameters
    - Repeat from Step 5

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌──────────────┐      ┌────────────────┐      ┌────────────┐  │
│  │   App.jsx    │─────▶│  Dashboard.jsx │─────▶│ MapViz.jsx │  │
│  │  (Health     │      │  (Orchestrates │      │ (Shows map)│  │
│  │   Check)     │      │   components)  │      └────────────┘  │
│  └──────────────┘      └────────────────┘                       │
│                               │                                  │
│                               ▼                                  │
│                    ┌────────────────────┐                        │
│                    │ PredictionForm.jsx │                        │
│                    │  (User Input)      │                        │
│                    └────────────────────┘                        │
│                               │                                  │
│                               ▼                                  │
│                        ┌────────────┐                            │
│                        │   api.js   │                            │
│                        │ (HTTP Calls)│                           │
│                        └────────────┘                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             │ (GET /routes, POST /predict, etc.)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Flask)                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      app.py (Routes)                       │  │
│  │  /health  │  /api/predict  │  /api/routes  │  /api/stops  │  │
│  └─────┬─────────────┬──────────────┬──────────────┬──────────┘  │
│        │             │              │              │             │
│        ▼             ▼              ▼              ▼             │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────────────┐       │
│  │ Health  │  │   ML     │  │     GTFSLoader           │       │
│  │ Check   │  │  Model   │  │  (utils/gtfs_loader.py)  │       │
│  └─────────┘  │          │  │                          │       │
│               │ Pipeline │  │  - Loads routes.txt      │       │
│               │   +      │  │  - Loads trips.txt       │       │
│               │ Random   │  │  - Loads stops.txt       │       │
│               │ Forest   │  │  - Loads stop_times.txt  │       │
│               └──────────┘  └──────────────────────────┘       │
│                     │                     │                     │
└─────────────────────┼─────────────────────┼─────────────────────┘
                      │                     │
                      ▼                     ▼
            ┌──────────────────┐  ┌──────────────────┐
            │  data/models/    │  │  GTFS Folders:   │
            │ delay_predictor  │  │ - hyderabad_GTFS │
            │     .pkl         │  │ - karnataka_GTFS │
            └──────────────────┘  └──────────────────┘
                      ▲
                      │ Created by
            ┌──────────────────┐
            │  model/train.py  │
            │  (Training)      │
            └──────────────────┘
                      ▲
                      │ Uses data from
            ┌──────────────────────┐
            │ data/raw/            │
            │ transit_data.csv     │
            └──────────────────────┘
                      ▲
                      │ Generated by
            ┌──────────────────────────┐
            │ utils/data_generator.py  │
            │ (Creates synthetic data) │
            └──────────────────────────┘
```

---

## Key Takeaways for Beginners

### Backend:
1. **Flask** is the web framework that handles HTTP requests
2. **Model** is pre-trained offline and loaded into memory on startup
3. **GTFSLoader** dynamically loads real transit data from GTFS files
4. **API endpoints** are like functions that frontend can call over the internet

### Frontend:
1. **React components** are like building blocks that combine to make the UI
2. **State** is like memory - components remember information (form data, predictions)
3. **Effects (useEffect)** run code when things change (like when user selects a route)
4. **Cascading effects** create a chain reaction (city → routes → trips → stops)
5. **API calls** use fetch/axios to communicate with backend

### Data Flow:
1. User interactions update component state
2. State changes trigger effects
3. Effects make API calls to backend
4. Backend queries data or model
5. Backend returns JSON responses
6. Frontend updates UI with new data

### File Organization:
- **backend/**: Python server code
- **frontend/**: React UI code
- **data/**: Model files and training data
- **hyderabad_GTFS/, karnataka_GTFS/**: Real transit schedules

---

## Troubleshooting Common Issues

### Backend not starting:
- Check if port 5000 is available
- Verify Python dependencies are installed (`pip install -r requirements.txt`)
- Check if model file exists at `data/models/delay_predictor.pkl`

### Frontend shows "offline":
- Ensure backend is running on port 5000
- Check CORS is enabled in Flask app
- Verify frontend is configured to call `http://localhost:5000`

### No routes/stops loading:
- Check GTFS folders exist (`hyderabad_GTFS/`, `karnataka_GTFS/`)
- Verify GTFS text files are present and properly formatted
- Check backend console for GTFSLoader error messages

### Predictions failing:
- Ensure model is trained and saved (`python backend/model/train.py`)
- Check training data exists (`data/raw/transit_data.csv`)
- Verify all required form fields are filled

---

*This document is designed for learning and reference. If you encounter issues or have questions about specific components, refer to the "Components and Classes Documentation" for detailed method descriptions.*
