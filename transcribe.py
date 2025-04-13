# transcribe.py
import whisper
import sys

model = whisper.load_model("base")

def transcribe_audio(file_path):
    result = model.transcribe(file_path)
    print("🎤 Transcription:\n", result["text"])

if __name__ == "__main__":
    file_path = sys.argv[1]
    transcribe_audio(file_path)
