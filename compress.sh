# converts image to .jpg with decreasing quality
# until size is under desired limit

# configuration
max_size=256000            # desired max file size in bytes
delete_originals=true      # set to 'false' to keep original images
recursive=false            # set to 'true' to process subdirectories recursively

# function to process a single image
process_image() {
  img="$1"
  if [ -f "$img" ]; then
    quality=90
    output="${img%.*}.jpg"
    while [ $quality -ge 10 ]; do
      magick convert "$img" -quality $quality "$output"
      size=$(stat -f%z "$output")
      if [ $size -le $max_size ]; then
        break
      fi
      quality=$((quality-10))
    done
    # delete the original image if enabled
    if [ "$delete_originals" = true ] && [ "$img" != "$output" ]; then
      rm "$img"
    fi
  fi
}

if [ "$recursive" = true ]; then
  # process images in current directory and subdirectories
  find . -type f \( -iname "*.png" -o -iname "*.heic" -o -iname "*.gif" -o -iname "*.bmp" \
    -o -iname "*.tiff" -o -iname "*.tif" -o -iname "*.jpeg" -o -iname "*.jpg" \) | while read -r img; do
    process_image "$img"
  done
else
  # process only images in current directory
  shopt -s nullglob
  for img in *.{png,heic,gif,bmp,tiff,tif,jpeg,PNG,jpg,HEIC,GIF,BMP,TIFF,TIF,JPEG,JPG}; do
    process_image "$img"
  done
  shopt -u nullglob
fi
