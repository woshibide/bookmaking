# converts image to .jpg with decreasing quality
# until size is under desired limit

# configuration
max_size=256000            # desired max file size in bytes
delete_originals=true      # set to 'false' to keep original images

for img in *.{png,gif,bmp,tiff,jpeg,PNG,jpg,GIF,BMP,TIFF,JPEG,JPG}; do
  if [ -f "$img" ]; then
    quality=90
    output="${img%.*}.jpg"
    while [ $quality -ge 10 ]; do
      convert "$img" -quality $quality "$output"
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
done
