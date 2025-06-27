from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import requests
import os
import time
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

gemini_model = genai.GenerativeModel("gemini-1.5-pro-002")

app = Flask(__name__)

def generate_story(prompt, genre, setting, characters):
    try:
        detailed_prompt = (
            f"Generate a {genre} story set in {setting} with characters: {characters}. "
            f"Prompt: {prompt}"
        )
        response = gemini_model.generate_content(detailed_prompt)
        return response.text if hasattr(response, 'text') else "Error: No story generated."
    except Exception as e:
        return f"Story generation error: {str(e)}"

def generate_image(prompt):
    url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
    headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
    payload = {"inputs": prompt}

    max_retries = 5
    retry_delay = 30

    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            image_path = "static/generated_image.png"
            with open(image_path, "wb") as f:
                f.write(response.content)
            return image_path
        elif response.status_code == 503:
            error_data = response.json()
            wait_time = int(error_data.get("estimated_time", retry_delay))
            print(f"Model is loading. Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
        else:
            return f"API Error: {response.status_code} - {response.text}"
    
    return "Error: Model is still unavailable after multiple attempts. Try again later."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    mode = data.get('mode', 'story')

    if mode == 'story':
        story = generate_story(
            data.get('prompt', ''),
            data.get('genre', 'general'),
            data.get('setting', 'unspecified'),
            data.get('characters', 'unspecified')
        )
        return jsonify({"story": story})

    elif mode == 'image':
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({"error": "Prompt required for image"}), 400
        image_path = generate_image(prompt)
        if image_path.startswith("static/"):
            return jsonify({"image_url": f"/{image_path}"})
        return jsonify({"error": image_path})

    else:
        return jsonify({"error": "Invalid mode selected"}), 400

@app.route('/generate_image', methods=['POST'])
def generate_image_route():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    image_path = generate_image(prompt)
    if image_path.startswith("static/"):
        return jsonify({"image_url": f"/{image_path}"})
    return jsonify({"error": image_path})

if __name__ == '__main__':
    app.run(debug=True)
