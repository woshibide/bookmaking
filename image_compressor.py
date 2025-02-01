import os
from PIL import Image

def compress_image(image_path, output_path, quality=65):
    with Image.open(image_path) as img:
        img.save(output_path, quality=quality, optimize=True)

MAX_SIZE = 500000

for filename in os.listdir('.'):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        size = os.path.getsize(filename)
        if size > MAX_SIZE:
            print(f"Compressing {filename}...")
            output_filename = f"{filename}"
            compress_image(filename, output_filename)

print("Compression completed.")

