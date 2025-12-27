# Public Transport Delay Prediction System - Documentation

## Overview

This is a full-stack AI-powered application designed to predict delays in public transportation systems for Hyderabad and Karnataka regions. The system uses machine learning models trained on synthetic data derived from GTFS (General Transit Feed Specification) feeds, combined with weather, event, and traffic factors to provide accurate delay predictions.

## Architecture

### System Components

1. **Backend (Flask + Scikit-Learn)**
   - REST API server serving predictions and GTFS data
   - Machine learning pipeline with Random Forest Regressor
   - GTFS data loader for routes, trips, and stops
   - Synthetic data generator for training

2. **Frontend (React + Vite)**
   - Interactive dashboard with charts and visualizations
   - Prediction form with dynamic GTFS data loading
   - Map visualization using Leaflet
   - Responsive design with modern UI

3. **Analytics Dashboards (Streamlit)**
   - Delay distribution analytics
   - Weather impact analysis
   - Route-specific delay comparisons
   - Geographic heatmap visualization

4. **Data Layer**
   - GTFS feeds for Hyderabad and Karnataka
   - Synthetic training dataset
   - Trained model artifacts

## Business Logic and Functionality

### Core Features

#### Delay Prediction
- **Input Parameters**: Route, date/time, weather conditions, event information, traffic factors
- **Model**: Random Forest Regressor with R² score ~0.94
- **Output**: Expected delay in minutes with risk assessment

#### GTFS Integration
- Dynamic loading of routes, trips, and stops from GTFS feeds
- Support for multiple cities (Hyderabad, Karnataka)
- Route visualization and stop selection

#### Analytics and Visualization
- Historical delay patterns
- Weather correlation analysis
- Route performance comparisons
- Geographic delay heatmaps

### Prediction Model Details

#### Features Used
- `route_id`: Categorical (hashed for model input)
- `day_of_week`: Categorical (Monday-Sunday)
- `weather_condition`: Categorical (Clear, Rain, Snow, Fog)
- `event_type`: Categorical (None, Sports, Concert, Festival)
- `temperature_c`: Numerical
- `precipitation_mm`: Numerical
- `event_attendance`: Numerical
- `traffic_factor`: Numerical (rush hour adjustments)

#### Delay Calculation Logic
The synthetic data generator simulates realistic delays based on:
- Base delay (0-5 minutes)
- Weather impact (precipitation-based multipliers)
- Event impact (attendance-based delays)
- Traffic factors (rush hour multipliers)
- Route-specific characteristics

## API Endpoints

### Backend API (Port 5000)

- `GET /health`: System health check
- `POST /api/predict`: Delay prediction
- `GET /api/routes?city={city}`: Get routes for a city
- `GET /api/trips?city={city}&route_id={id}`: Get trip directions
- `GET /api/stops?city={city}&route_id={id}&headsign={direction}`: Get stops for route/direction
- `GET /api/stats`: Basic statistics (placeholder)

## Data Flow

1. **Data Generation**: Synthetic dataset created using GTFS routes and realistic delay factors
2. **Model Training**: Random Forest model trained on preprocessed features
3. **Prediction**: User inputs processed through pipeline to generate delay estimate
4. **Visualization**: Results displayed with risk assessment and route mapping

## Setup and Deployment

### System Requirements

**Hardware Requirements:**
- Minimum 4GB RAM (8GB recommended)
- 2GB free disk space
- Internet connection for package downloads

**Software Prerequisites:**
- **Python 3.8 or higher** (Download from [python.org](https://python.org))
- **Node.js 14 or higher** (Download from [nodejs.org](https://nodejs.org))
- **Git** (for cloning the repository)
- **Web browser** (Chrome, Firefox, Safari, or Edge)

**Operating System Support:**
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+, CentOS 7+)

### Installation Steps

#### Step 1: Clone the Repository
```bash
git clone https://github.com/bharathroyal918/public_transport_delay_prediction.git
cd public_transport_delay_prediction
```

#### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Generate synthetic training data
python utils/data_generator.py

# Train the machine learning model
python model/train.py

# Start the Flask backend server
python app.py
```
**Expected Output:** Server starts on `http://localhost:5000`

#### Step 3: Frontend Setup
```bash
# Open new terminal/command prompt
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
**Expected Output:** Development server starts on `http://localhost:5173`

#### Step 4: Analytics Dashboards (Optional)
```bash
# Open new terminal/command prompt
cd dashboard

# Install required packages
pip install streamlit seaborn folium

# Run delay analytics dashboard
streamlit run delay_dashboard.py

# Run heatmap dashboard (in separate terminal)
streamlit run heatmap_dashboard.py
```

### Running the Complete Application

1. **Start Backend First:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend (in separate terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application:**
   - Main Application: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Analytics Dashboard: `http://localhost:8501` (if running)

### Troubleshooting

**Common Issues:**

**Backend Issues:**
- **Port 5000 already in use:** Change port in `backend/app.py` or kill process using port
- **Model not found:** Ensure `python model/train.py` completed successfully
- **Import errors:** Verify all packages installed with `pip list`

**Frontend Issues:**
- **Port 5173 already in use:** Change port in `frontend/vite.config.js` or kill process
- **CORS errors:** Ensure backend is running on port 5000
- **Build errors:** Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**General Issues:**
- **Python version:** Ensure Python 3.8+ with `python --version`
- **Node version:** Ensure Node.js 14+ with `node --version`
- **Firewall:** Allow ports 5000 and 5173 through firewall

### Development Mode vs Production

**Development:**
- Backend: `python app.py` (with debug=True)
- Frontend: `npm run dev` (with hot reload)
- Analytics: `streamlit run` (with auto-reload)

**Production:**
- Backend: Use WSGI server (gunicorn) and reverse proxy (nginx)
- Frontend: `npm run build` then serve static files
- Analytics: Deploy Streamlit apps to cloud platforms

### Environment Variables

Create `.env` files for configuration:

**Backend (.env):**
```
FLASK_ENV=development
FLASK_DEBUG=True
MODEL_PATH=data/models/delay_predictor.pkl
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5000
```

### Package Dependencies

**Backend (requirements.txt):**
- flask==2.3.3
- flask-cors==4.0.0
- pandas==2.0.3
- scikit-learn==1.3.0
- joblib==1.3.2
- numpy==1.24.3

**Frontend (package.json):**
- react: ^18.2.0
- react-dom: ^18.2.0
- axios: ^1.4.0
- recharts: ^2.5.0
- react-leaflet: ^4.2.1
- leaflet: ^1.9.4
- lucide-react: ^0.263.1

### Verification Steps

After setup, verify installation:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Expected: `{"status": "healthy", "model_loaded": true}`

2. **Frontend Access:**
   Open `http://localhost:5173` in browser

3. **API Test:**
   ```bash
   curl -X POST http://localhost:5000/api/predict \
     -H "Content-Type: application/json" \
     -d '{"route_id": "R001", "day_of_week": "Monday", "weather_condition": "Clear", "temperature_c": 25}'
   ```

### Updating the Application

To update to latest version:
```bash
git pull origin master
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

Then restart all services.

## Suggested Improvements and Features

### High Priority

1. **Real-time Data Integration**
   - Integrate live GTFS feeds or transit APIs
   - Real-time weather data from external APIs
   - Live traffic data integration

2. **Enhanced Model Accuracy**
   - Use actual historical delay data instead of synthetic
   - Include time-of-day as a feature
   - Add passenger load and vehicle capacity factors
   - Implement model retraining pipeline

3. **User Experience**
   - User authentication and personalized dashboards
   - Prediction history and favorites
   - Mobile app companion
   - Push notifications for high-risk routes

### Medium Priority

4. **Advanced Analytics**
   - Predictive maintenance alerts
   - Seasonal trend analysis
   - Comparative analysis across cities
   - API for third-party integrations

5. **Technical Improvements**
   - Database integration (PostgreSQL/MongoDB)
   - Caching layer (Redis)
   - Containerization (Docker)
   - CI/CD pipeline
   - Comprehensive testing suite

6. **Visualization Enhancements**
   - Interactive route maps with actual GTFS shapes
   - Real-time delay overlays
   - Historical trend charts
   - Comparative route analysis

### Low Priority

7. **Additional Features**
   - Multi-modal transport support (bus + metro)
   - Journey planning with alternatives
   - Carbon footprint calculations
   - Accessibility features
   - Multi-language support

8. **Infrastructure**
   - Cloud deployment (AWS/GCP/Azure)
   - Monitoring and logging
   - Backup and disaster recovery
   - Performance optimization

## Development Roadmap

### Phase 1: Core Enhancement
- Real data integration
- Model improvement with actual delays
- User authentication

### Phase 2: Advanced Features
- Real-time updates
- Mobile application
- Third-party API integrations

### Phase 3: Enterprise Features
- Multi-city expansion
- Advanced analytics platform
- API marketplace

## Contributing

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React
- Include unit tests for new features
- Update documentation for API changes

### Testing
- Backend: pytest for unit tests
- Frontend: Jest/React Testing Library
- Integration tests for API endpoints
- Performance testing for prediction latency

## License and Attribution

This project uses GTFS data from Hyderabad Metro and Karnataka transport authorities. Model training data is synthetically generated for demonstration purposes.