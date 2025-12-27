# Public Transport Delay Prediction

A full-stack AI application to predict public transport delays based on weather, events, and route characteristics.

## Components

### Backend (Flask + Scikit-Learn)
- **API**: Serves predictions via REST endpoints.
- **ML Engine**: Random Forest Regressor trained on synthetic data.
- **Data Generator**: Creates realistic training datasets.

### Frontend (React + Vite)
- **Dashboard**: Interactive charts visualizing delay risks.
- **Prediction Tool**: input form for querying specific scenarios.
- **Modern UI**: Clean, responsive design.

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+

### Installation

1.  **Backend Setup**
    ```bash
    # Create virtual environment (if not active)
    python -m venv venv
    venv\Scripts\activate

    # Install dependencies
    pip install -r backend/requirements.txt
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # (Optional) Install extra libs if needed
    npm install recharts axios lucide-react leaflet react-leaflet
    ```

3.  **Data Generation & Training**
    ```bash
    # Generate synthetic data
    python backend/utils/data_generator.py

    # Train the model
    python backend/model/train.py
    ```

### Running the Application

1.  **Start Backend**
    ```bash
    python backend/app.py
    # Runs on http://localhost:5000
    ```

2.  **Start Frontend**
    ```bash
    cd frontend
    npm run dev
    # Runs on http://localhost:5173
    ```

## Logic Overview
The model takes inputs like `Precipitation`, `Temperature`, `Event Attendance`, and `Traffic Factor`. It uses a Random Forest model (R2 score ~0.94) to predict the expected delay in minutes.
