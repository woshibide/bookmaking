# converts image to .jpg with decreasing quality
# until size is under desired limit

# configuration
max_size=256000            # desired max file size in bytes
delete_originals=true      # set to 'false' to keep original images
recursive=true            # set to 'true' to process subdirectories recursively
image_extensions="png heic gif bmp tiff tif jpeg jpg" # case insensentive

# process a single image
process_image() {
  img="$1"
  if [ -f "$img" ]; then
    echo "compressing: $img"  # log the file being processed
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

# set of supported image extensions
if [ "$recursive" = true ]; then

  # build the find command dynamically
  find_cmd="find . -type f \("
  first=true
  for ext in $image_extensions; do
    if [ "$first" = true ]; then
      find_cmd="$find_cmd -iname \"*.$ext\""
      first=false
    else
      find_cmd="$find_cmd -o -iname \"*.$ext\""
    fi
  done
  find_cmd="$find_cmd \)"

  # execute the find command and process each image
  eval "$find_cmd" | while read -r img; do
    process_image "$img"
  done
else
  # process only images in current directory
  echo "processing images in: $(pwd)"
  shopt -s nullglob
  shopt -s nocaseglob # make pattern matching case-insensitive

  # create pattern with all extensions
  pattern="*.{"$(echo "$image_extensions" | tr ' ' ',')"}}"

  # process matching files
  for img in $pattern; do
    process_image "$img"
  done

  # reset shell options
  shopt -u nullglob
  shopt -u nocaseglob
fi
