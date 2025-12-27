import folium
from folium.plugins import HeatMap
import pandas as pd

df = pd.read_csv("data/raw/transport_delay_data.csv")

m = folium.Map(location=[20.59,78.96], zoom_start=5)

heat_data = [[row['lat'],row['lon'],row['actual_arrival_delay_min']] for index,row in df.iterrows()]

HeatMap(heat_data).add_to(m)

m.save("dashboard/delay_heatmap.html")
print("Heatmap Generated")
