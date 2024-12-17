"""
Transcribes the given audio file to text using OpenAI's Whisper model with a progress bar over the total audio duration.

Parameters:
- audio_path: Path to the audio file (.mp3)
- model_size: Size of the Whisper model to use ('tiny', 'base', 'small', 'medium', 'large')
- language: Language code (e.g., 'en' for English). If None, Whisper will attempt to detect the language.
- output_txt_path: Path to save the transcription text.
- chunk_length: Length of each audio chunk in seconds.

Returns:
- Transcribed text.
"""


import whisper
import torch
import math
from tqdm import tqdm

def transcribe_audio_with_progress(audio_path, model_size='base', language=None, output_txt_path='transcription.txt', chunk_length=30):

    print(f"Loading Whisper model '{model_size}'...")
    model = whisper.load_model(model_size)

    audio = whisper.load_audio(audio_path)
    audio_duration = len(audio) / whisper.audio.SAMPLE_RATE 

    if language is None:
        print("Detecting language...")
        audio_sample = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio_sample).to(model.device)
        _, probs = model.detect_language(mel)
        detected_language = max(probs, key=probs.get)
        print(f"Detected language: {detected_language}")
    else:
        detected_language = language

    print("Transcribing audio...")

    # Calculate the number of chunks
    total_chunks = math.ceil(audio_duration / chunk_length)
    transcribed_text = ''

    # Initialize progress bar over total audio duration
    with tqdm(total=audio_duration, desc="Transcribing", unit="sec") as pbar:
        for i in range(total_chunks):
            start_time = i * chunk_length
            end_time = min((i + 1) * chunk_length, audio_duration)

            chunk = audio[int(start_time * whisper.audio.SAMPLE_RATE): int(end_time * whisper.audio.SAMPLE_RATE)]

            result = model.transcribe(chunk, language=detected_language, verbose=False)
            transcribed_text += result['text'] + ' '

            pbar.update(end_time - start_time)

    # Save the transcription to a text file
    with open(output_txt_path, 'w', encoding='utf-8') as f:
        f.write(transcribed_text.strip())

    print(f"\nTranscription saved to: {output_txt_path}")
    return transcribed_text.strip()

def main():
    audio_path = 'OH_JBLANK_LDAVIDSON_4.5.11.mp3'  

    # 'tiny', 'base', 'small', 'medium', 'large'
    model_size = 'base'
    language = 'en'
    output_txt_path = audio_path[:-4] + '.txt'

    transcribe_audio_with_progress(audio_path, model_size, language, output_txt_path)

if __name__ == '__main__':
    main()
