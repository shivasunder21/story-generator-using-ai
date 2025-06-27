import requests

API_KEY = "AIzaSyDLQbFZ5QCYWs3eSMXz15M0eNA9co3rKTw"
MODEL_NAME = "models/gemini-1.5-pro-002"
URL = f"https://generativelanguage.googleapis.com/v1/{MODEL_NAME}:generateContent?key={API_KEY}"

headers = {"Content-Type": "application/json"}
data = {"contents": [{"parts": [{"text": "Tell me a short story."}]}]}

response = requests.post(URL, json=data, headers=headers)
print(response.json())  # Should return a response with a generated story
