# flask_server.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper

app = Flask(__name__)
CORS(app)  # 👈 allow requests from React (port 3000)

UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load Whisper once
model = whisper.load_model("base")

@app.route("/upload", methods=["POST"])
def upload():
    if 'audio' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files['audio']
    filepath = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(filepath)

    print(f"\n🎧 Received file: {audio_file.filename}")

    # Transcribe the audio
    result = model.transcribe(filepath)
    transcription = result["text"]

    print(f"\n📝 Transcription:\n{transcription}")

    return jsonify({"transcription": transcription})  # You can ignore this if you just want to log to terminal

if __name__ == "__main__":
    app.run(port=5000)
