import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from pipeline import create_pipeline

def train_model():
    print("Loading data...")
    # Load data
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'raw', 'transit_data.csv')
    df = pd.read_csv(data_path)
    
    # Separate target
    X = df.drop(['delay_minutes', 'time_of_day'], axis=1) # Drop time_of_day for simplicity or process it later. 
    # Ideally process time_of_day into Hour/Minute features, let's fix that below.
    
    # Feature Engineering: Extract Hour from time_of_day
    df['hour'] = df['time_of_day'].apply(lambda x: int(x.split(':')[0]))
    X = df.drop(['delay_minutes', 'time_of_day'], axis=1)
    
    # Add hour to pipeline - we need to update pipeline to handle 'hour' as numerical or categorical
    # For now let's treat it as numerical
    X = X[['route_id', 'day_of_week', 'weather_condition', 'event_type', 
           'temperature_c', 'precipitation_mm', 'event_attendance', 'traffic_factor']]
    # Wait, I dropped 'hour'. Let's add it back in future iterations if needed. 
    # For MVP stick to the defined features in pipeline.py or update pipeline.py.
    # Actually, let's keep it simple.
    
    y = df['delay_minutes']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Create pipeline
    preprocessor = create_pipeline()
    model = RandomForestRegressor(n_estimators=100, random_state=42)

    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('model', model)])

    # Train
    print("Training model...")
    clf.fit(X_train, y_train)

    # Evaluate
    print("Evaluating model...")
    preds = clf.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"MAE: {mae}")
    print(f"R2 Score: {r2}")

    # Save model
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'delay_predictor.pkl')
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
