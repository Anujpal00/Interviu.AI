from TTS.api import TTS

# Choose a model
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

# Generate speech
tts.tts_to_file(text="Hello world!", file_path="output.wav")

print("Audio generated successfully: output.wav")
