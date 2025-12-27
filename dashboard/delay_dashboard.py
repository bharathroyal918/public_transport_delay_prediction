import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv("data/raw/transport_delay_data.csv")

st.title("Public Transport Delay Analytics Dashboard")

st.subheader("Delay Distribution")
sns.histplot(df['actual_arrival_delay_min'])
st.pyplot()

st.subheader("Weather Impact")
sns.boxplot(x=df['weather_condition'], y=df['actual_arrival_delay_min'])
st.pyplot()

st.subheader("Route Delay Comparison")
route = st.selectbox("Select Route", df['route_id'].unique())
route_df = df[df['route_id']==route]
st.line_chart(route_df[['actual_arrival_delay_min']])
