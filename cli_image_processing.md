# FFMPEG

## Turn `image.jpg` into vertical video with black background
```sh
ffmpeg -framerate 30 -i image%d.jpg -vf "scale=iw:ih,pad=1080:1920:(1080-iw)/2:(1920-ih)/2:black" -c:v libx264 -pix_fmt yuv420p -an output.mp4
```

## Blender `.png` into `.mp4` (30 fps, `-t` to specify time)
```sh
ffmpeg -framerate 24 -pattern_type glob -i '*.png' -vf "scale=1920:1080,format=yuv420p" -c:v libx264 -crf 1 -preset fast -t 16 -pix_fmt yuv420p output.mp4
```

## Normal speed video with one image per frame at 24 FPS
```sh
ffmpeg -framerate 24 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p out.mp4
```

## Extract audio from video
```sh
ffmpeg -i yes.mp4 -vn -acodec copy audio.aac
```

## Discard audio from given video
```sh
ffmpeg -i input_video.mp4 -an -c:v copy output_video.mp4
```

## Half the scale
```sh
ffmpeg -i input.mov -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx265 -crf 28 output.mov
```

## Downscale to 1/3
```sh
ffmpeg -i input.mkv -vf "scale=trunc(iw/6)*2:trunc(ih/6)*2" -c:v libx265 -crf 28 a_third_the_frame_size.mkv
```

## Scale to exact size
```sh
ffmpeg -i input.mov -c:a copy -s 480x280 output.mov
```

## Make a directory and convert every `.mov` into `.mp4`
```sh
mkdir mp4
for file in *.mov; do ffmpeg -i "$file" -c:v libx264 -c:a aac -strict experimental "./mp4/${file%.mov}.mp4"; done
```

## All GIFs inside a folder to be 1400 in width and smaller file size
```sh
for file in *.gif; do ffmpeg -i "$file" -vf "scale=1400:-1:flags=lanczos" -gifflags +transdiff -y "resized_$file"; done
```

## Video to GIF
```sh
ffmpeg -i input.mov -vf fps=5 output.gif
```

## Video to GIF (every 5th frame, 1080px height, nice colors)
```sh
ffmpeg -i input.mov -vf "fps=10,scale=1080:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mov -i palette.png -filter_complex "fps=10,scale=1080:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```

## Frames to GIF
```sh
ffmpeg -r FRAMERATE -i INPUT_PATTERN -vf "scale=WIDTH:HEIGHT:flags=lanczos" -c:v gif OUTPUT.gif
ffmpeg -r 15 -i INPUT_PATTERN -vf "scale=WIDTH:HEIGHT:flags=lanczos" -c:v gif OUTPUT.gif
```

## Convert PNG files with transparent background to GIF with transparency
```sh
ffmpeg -framerate 5 -i t-shirt-%02d.png -vf "palettegen=reserve_transparent=1" palette.png
ffmpeg -framerate 5 -i *-%01d.png -i palette.png -lavfi "paletteuse=dither=bayer:bayer_scale=5" -y output.gif
```

## Reverse audio
```sh
ffmpeg -i input_audio.m4a -af areverse output_reversed_audio.m4a
```

## Reverse video
```sh
ffmpeg -i input_video.mov -vf reverse output_reversed_video.mov
```

## Convert all `.mov` to 24fps
```sh
for f in *.mov; do
  ffmpeg -i "$f" -r 24 -c:v copy -an "${f%.mov}_24fps.mov"
done
```

# SIPS

## Convert all `.bmp` into `.jpeg` with 80% quality
```sh
for file in *; do sips -s format jpeg -s formatOptions 80 "$file" --out "${file%.*}.jpeg"; done
```

## Convert all `.bmp` into `.png` (lossless)
```sh
for file in *; do sips -s format png "$file" --out "${file%.*}.png"; done
```

# CONVERT

## Images inside folder to GIF
```sh
convert -delay 10 -loop 0 *.png animation.gif
```

## Convert all non-JPG images into `.jpg`
```sh
for file in *.{png,webp,jpeg}; do [ -f "$file" ] && magick "$file" "${file%.*}.jpg"; done
```

## Remove white background from every `.jp2` file inside a folder
```sh
for file in *.jp2; do
  convert "$file" -fuzz 50% -transparent white "${file%.jp2}.png"
  done
```

## Convert every `.svg` file into a GIF
```sh
convert -delay 100 -loop 0 '*.svg' output.gif
```

## Change all `.png` (with transparent bg) from black to `#FFC300`
```sh
mkdir color
find . -type f -name "*.png" -exec sh -c 'convert "{}" -fill "#FFC300" -opaque black "color/${1##*/}"' sh {} \;

